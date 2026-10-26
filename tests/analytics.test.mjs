import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { analyticsId, analyticsScript } from '../scripts/analytics.mjs';

const source = await readFile(new URL('../assets/analytics.js', import.meta.url), 'utf8');
const id = 'G-TEST123456';

function browser({ stored, local = false, storageBlocked = false } = {}) {
  const scripts = [];
  const cookieWrites = [];
  const handlers = new Map();
  const storage = new Map(stored ? [['pogromist.analytics-consent.v1', JSON.stringify(stored)]] : []);
  let reloads = 0;
  const accept = { dataset: { analyticsChoice: 'granted' }, addEventListener: (_, fn) => handlers.set('accept', fn), focus() {} };
  const reject = { dataset: { analyticsChoice: 'denied' }, addEventListener: (_, fn) => handlers.set('reject', fn) };
  const panel = { hidden: true, querySelectorAll: () => [accept, reject], querySelector: () => accept };
  const settings = { setAttribute() {}, addEventListener: (_, fn) => handlers.set('settings', fn) };
  const document = {
    currentScript: { dataset: { measurementId: id, siteOrigin: 'https://blog.example' } },
    referrer: 'https://referrer.example/from?search=sample',
    querySelector: (selector) => selector === '#analytics-consent' ? panel : settings,
    createElement: () => ({}),
    head: { append: (script) => scripts.push(script) },
    get cookie() { return 'pogromist_ga=sample; unrelated=keep'; },
    set cookie(value) { cookieWrites.push(value); },
  };
  const window = {};
  const location = {
    protocol: local ? 'http:' : 'https:',
    origin: local ? 'http://127.0.0.1:4173' : 'https://blog.example',
    hostname: local ? '127.0.0.1' : 'blog.example',
    pathname: '/archive.html',
    search: '?preview=sample', hash: '#post-example',
    reload: () => reloads++,
  };
  const localStorage = {
    getItem: (key) => { if (storageBlocked) throw Error('Storage blocked'); return storage.get(key) ?? null; },
    setItem: (key, value) => { if (storageBlocked) throw Error('Storage blocked'); storage.set(key, value); },
  };
  vm.runInNewContext(source, { document, window, location, localStorage, URL, Date });
  return { scripts, window, panel, cookieWrites, storage, click: (button) => handlers.get(button)(), reloads: () => reloads };
}

test('accepts only the public measurement ID and emits no tag when unset', () => {
  assert.equal(analyticsId(), '');
  assert.equal(analyticsId(` ${id} `), id);
  assert.equal(analyticsScript('', '', 'https://blog.example/'), '');
  assert.match(analyticsScript(id, '/blog', 'https://blog.example/blog/'), /src="\/blog\/assets\/analytics.js"/);
  for (const value of ['api-secret-placeholder', 'G-ABC\" onload=\"example', 'G-abc123']) {
    assert.throws(() => analyticsId(value), /public GA4 measurement ID/);
  }
});

test('loads no Google tag or analytics queue before consent or after declining', () => {
  const page = browser();
  assert.equal(page.panel.hidden, false);
  assert.equal(page.scripts.length, 0);
  assert.equal(page.window.dataLayer, undefined);
  page.click('reject');
  assert.equal(page.panel.hidden, true);
  assert.equal(page.scripts.length, 0);
  assert.equal(JSON.parse(page.storage.get('pogromist.analytics-consent.v1')).value, 'denied');
});

test('consent loads one tag and excludes query strings and fragments from the page address', () => {
  const page = browser();
  page.click('accept');
  page.click('settings');
  page.click('accept');
  assert.equal(page.scripts.length, 1);
  assert.equal(page.scripts[0].src, `https://www.googletagmanager.com/gtag/js?id=${id}`);
  const config = page.window.dataLayer.find((args) => args[0] === 'config')[2];
  assert.equal(config.page_location, 'https://blog.example/archive.html');
  assert.equal(config.page_referrer, 'https://referrer.example');
  assert.equal(config.allow_ad_personalization_signals, false);
  assert.equal(config.allow_google_signals, false);
});

test('remembers valid choices and asks again after their expiry', () => {
  const expires = Date.now() + 60_000;
  assert.equal(browser({ stored: { value: 'granted', expires } }).scripts.length, 1);
  assert.equal(browser({ stored: { value: 'denied', expires } }).panel.hidden, true);
  const expired = browser({ stored: { value: 'granted', expires: Date.now() - 1 } });
  assert.equal(expired.panel.hidden, false);
  assert.equal(expired.scripts.length, 0);
});

test('local previews never load Google even after accepting', () => {
  const page = browser({ local: true });
  page.click('accept');
  assert.equal(page.scripts.length, 0);
  assert.equal(page.window.dataLayer, undefined);
});

test('withdrawing consent disables the tag, clears only its own cookies, and unloads it', () => {
  const page = browser();
  page.click('accept');
  page.click('settings');
  page.click('reject');
  assert.equal(page.window[`ga-disable-${id}`], true);
  assert.equal(page.reloads(), 1);
  assert.ok(page.cookieWrites.length > 0);
  assert.ok(page.cookieWrites.every((value) => value.startsWith('pogromist_ga=')));
});

test('blocked localStorage never grants consent implicitly', () => {
  const page = browser({ storageBlocked: true });
  assert.equal(page.scripts.length, 0);
  page.click('accept');
  assert.equal(page.scripts.length, 1);
});
