import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { loadPosts, localDay, parsePost } from '../scripts/content.mjs';

const source = (date, body = 'Сделал первую часть. Проверил результат.') => `---\ntitle: Тестовая запись\ndate: '${date}'\ntags: [AVR]\n---\n${body}`;

test('orders posts newest first and hides future days in Budapest', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'blog-content-'));
  try {
    for (const date of ['2026-10-24', '2026-10-26', '2026-10-25']) {
      await writeFile(path.join(directory, `${date}-entry.md`), source(date));
    }
    const posts = await loadPosts(directory, { now: new Date('2026-10-25T20:00:00Z'), timeZone: 'Europe/Budapest' });
    assert.deepEqual(posts.map((post) => post.date), ['2026-10-25', '2026-10-24']);
    assert.equal(localDay(new Date('2026-10-25T23:30:00Z')), '2026-10-26');
  } finally { await rm(directory, { recursive: true, force: true }); }
});

test('enforces the ten sentence limit', () => {
  assert.equal(parsePost(source('2026-10-25', 'Готово. '.repeat(10)), '2026-10-25-entry.md').sentences, 10);
  assert.throws(() => parsePost(source('2026-10-25', 'Готово. '.repeat(11)), '2026-10-25-entry.md'), /1–10 sentences/);
});

test('rejects invalid dates and filenames that disagree with metadata', () => {
  assert.throws(() => parsePost(source('2026-02-30'), '2026-02-30-entry.md'), /date must be valid/);
  assert.throws(() => parsePost(source('2026-10-24'), '2026-10-25-entry.md'), /date must be valid/);
});

test('renders Markdown while keeping HTML and unsafe links inert', () => {
  const post = parsePost(source('2026-10-25', '**Готово**. <script>alert(1)</script> [переход](javascript:alert(1))'), '2026-10-25-entry.md');
  assert.match(post.html, /<strong>Готово<\/strong>/);
  assert.doesNotMatch(post.html, /<script>|href="javascript:/);
});

test('video metadata accepts YouTube links and rejects other hosts', () => {
  const video = (url) => source('2026-10-25').replace('tags: [AVR]', `tags: [AVR]\nvideos:\n  - label: Видео\n    url: ${url}\n    published: '2026-10-25'`);
  assert.equal(parsePost(video('https://youtu.be/WqFaOTUdEe0'), '2026-10-25-entry.md').videos.length, 1);
  assert.throws(() => parsePost(video('https://example.com/'), '2026-10-25-entry.md'), /YouTube/);
});

test('video publication dates must match the daily post', () => {
  const video = (published) => source('2026-10-25').replace('tags: [AVR]', `tags: [AVR]\nvideos:\n  - label: Видео\n    url: https://youtu.be/WqFaOTUdEe0\n    published: '${published}'`);
  assert.throws(() => parsePost(video('2026-10-24'), '2026-10-25-entry.md'), /publication date must match/);
});

test('the same video cannot be repeated using short and full YouTube URLs', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'blog-videos-'));
  try {
    for (const [date, url] of [['2026-10-24', 'https://youtu.be/WqFaOTUdEe0'], ['2026-10-25', 'https://www.youtube.com/watch?v=WqFaOTUdEe0']]) {
      const post = source(date).replace('tags: [AVR]', `tags: [AVR]\nvideos:\n  - label: Видео\n    url: ${url}\n    published: '${date}'`);
      await writeFile(path.join(directory, `${date}-entry.md`), post);
    }
    await assert.rejects(loadPosts(directory), /already linked in another post/);
  } finally { await rm(directory, { recursive: true, force: true }); }
});
