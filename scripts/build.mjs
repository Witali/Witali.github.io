import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { escapeHtml as e, loadPosts, markdown } from './content.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const config = JSON.parse(await readFile(path.join(root, 'site.config.json'), 'utf8'));
const posts = await loadPosts(path.join(root, 'content/posts'), { timeZone: config.timeZone });
const intro = matter(await readFile(path.join(root, 'content/intro.md'), 'utf8'));
const basePath = (process.env.SITE_BASE_PATH ?? config.basePath).replace(/\/$/, '');
if (basePath && !/^\/[a-zA-Z0-9_/-]+$/.test(basePath)) throw new Error('SITE_BASE_PATH must be empty or an absolute URL path');
const asset = (file) => `${basePath}/assets/${file}`;
const siteUrl = `${(process.env.SITE_ORIGIN || config.url).replace(/\/$/, '')}${basePath}/`;
const dateLabel = (date, options) => new Intl.DateTimeFormat('ru', { timeZone: 'UTC', ...options }).format(new Date(`${date}T12:00:00Z`));
const monthLabel = (date) => dateLabel(date, { month: 'long', year: 'numeric' }).replace(' г.', '');
const codeIcon = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m8 7-5 5 5 5m8-10 5 5-5 5M14 4l-4 16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

function renderPost(post, index) {
  const tags = post.tags.map((tag) => `<span class="tag">${e(tag)}</span>`).join('');
  const sources = post.sources.length ? `<div class="sources"><span>По следам работы</span>${post.sources.map((source) => `<a href="${e(source.url)}">${e(source.label)} <span aria-hidden="true">↗</span></a>`).join('')}</div>` : '';
  return `<article class="entry" id="${post.id}" data-tags="${e(post.tags.join('|'))}">
    <div class="entry-date"><time datetime="${post.date}"><span class="day">${dateLabel(post.date, { day: '2-digit' })}</span><span>${dateLabel(post.date, { month: 'short' }).replace('.', '')}</span></time><span class="weekday">${dateLabel(post.date, { weekday: 'short' })}</span></div>
    <div class="entry-content"><div class="entry-meta">${tags}${index === 0 ? '<span class="latest">Свежая запись</span>' : ''}</div>
    <h3><a href="#${post.id}">${e(post.title)}</a></h3><div class="prose">${post.html}</div>${sources}</div>
  </article>`;
}

function renderPage(archive = false) {
const pageUrl = archive ? `${siteUrl}archive.html` : siteUrl;
return `<!doctype html>
<html lang="ru"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${e(config.title)} — дневник разработки</title>
<meta name="description" content="${e(config.description)}"><meta name="theme-color" content="#f8f7f3">
<link rel="canonical" href="${e(pageUrl)}"><link rel="icon" href="${asset('favicon.svg')}" type="image/svg+xml">
<link rel="alternate" type="application/atom+xml" title="${e(config.title)}" href="${basePath}/feed.xml">
<meta property="og:title" content="${e(config.title)} — дневник разработки"><meta property="og:description" content="${e(config.description)}">
<meta property="og:type" content="website"><meta property="og:locale" content="ru_RU"><meta property="og:url" content="${e(siteUrl)}">
<meta property="og:image" content="${e(new URL(asset('workbench.png'), siteUrl).href)}">
<link rel="stylesheet" href="${asset('styles.css')}"><script src="${asset('journal.js')}" defer></script>
</head><body id="top">
<a class="skip-link" href="#journal">К записям</a>
<header class="site-header wrap"><a class="brand" href="#top"><span class="brand-icon">${codeIcon}</span>${e(config.title)}<span class="brand-dot">.</span></a>
<nav aria-label="Основная навигация"><a class="current" href="#journal">Дневник</a><a href="#about">Об авторе</a><a class="github-link" href="${e(config.github)}">GitHub <span aria-hidden="true">↗</span></a></nav></header>
<main class="wrap">
<section class="intro" id="about" aria-labelledby="intro-title">
<div class="intro-copy"><p class="eyebrow"><span class="status-dot"></span>${e(intro.data.eyebrow)}</p><h1 id="intro-title">${e(intro.data.title)}</h1><div class="intro-text prose">${markdown.render(intro.content)}</div><a class="text-link" href="#journal">Что нового на верстаке <span aria-hidden="true">↓</span></a></div>
<figure class="hero"><img src="${asset('workbench.png')}" width="1942" height="809" alt="Иллюстрация мастерской: программист с кружкой за столом, кот, микросхемы и ретрокомпьютеры" fetchpriority="high"><figcaption><span>Код. Паяльник. Ещё одна идея.</span><span>Личная территория экспериментов</span></figcaption></figure>
</section>
<section class="journal" id="journal" aria-labelledby="journal-title"><div class="journal-heading"><div><p class="eyebrow">Заметки с рабочего стола</p><h2 id="journal-title">Дневник разработки<span class="heading-dot">.</span></h2></div><a class="rss-link" href="${basePath}/feed.xml">RSS <span aria-hidden="true">↗</span></a></div>
<div class="journal-layout"><div class="feed">
<p class="month-label">${posts.length ? monthLabel(posts[0].date) : 'Первые записи скоро появятся'}<span id="post-count" aria-live="polite">${posts.length} записей</span></p>
<div id="entries" data-next-page="${!archive && posts.length > 3 ? `${basePath}/entries/2.json` : ''}">${(archive ? posts : posts.slice(0, 3)).map(renderPost).join('\n')}</div>
${!archive && posts.length > 3 ? `<div class="load-more"><button id="load-more" type="button" hidden>Показать ещё записи <span aria-hidden="true">↓</span></button><p id="load-status" role="status"></p><a class="archive-link" href="${basePath}/archive.html#journal">Все записи в архиве ↗</a></div>` : ''}
<p class="feed-end" ${!archive && posts.length > 3 ? 'hidden' : ''}><span></span>Пока всё. Продолжение — на верстаке.<span></span></p></div>
<aside class="sidebar" aria-label="О дневнике"><div class="sidebar-note"><span class="small-code">${codeIcon}</span><h3>Впихнуть невпихуемое</h3><p>Музыка на крошечном AVR, звук на Z80 и другие задачи, которые слишком интересны, чтобы их отложить.</p><span class="handwritten">Проверяю на практике.</span></div>
<div class="projects"><p class="eyebrow">На верстаке</p><a href="https://github.com/Witali/MicroMusic"><span>MicroMusic<small>Музыка на маленьких процессорах</small></span>↗</a><a href="https://github.com/Witali/Web-MIDI-Player"><span>Web MIDI Player<small>Синтезатор прямо в браузере</small></span>↗</a><a href="https://github.com/Witali/yoRadio"><span>yoRadio<small>Радио, экраны и ESP32</small></span>↗</a></div>
<p class="sidebar-caption">Коротко о сделанном.<br>Свежие записи — сверху.</p></aside></div></section>
</main><footer class="site-footer wrap"><p>© ${posts[0]?.date.slice(0, 4) ?? new Date().getUTCFullYear()} ${e(config.author)} <span>·</span> ${e(config.title)}</p><a href="#top">Наверх ↑</a></footer>
</body></html>`;
}

const feed = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom"><title>${e(config.title)}</title><subtitle>${e(config.description)}</subtitle><id>${e(siteUrl)}</id><link href="${e(siteUrl)}"/><link href="${e(siteUrl)}feed.xml" rel="self"/><updated>${posts[0]?.date ?? '2026-10-25'}T12:00:00Z</updated><author><name>${e(config.author)}</name></author>${posts.map((post) => `<entry><title>${e(post.title)}</title><id>${e(siteUrl)}archive.html#${post.id}</id><link href="${e(siteUrl)}archive.html#${post.id}"/><updated>${post.date}T12:00:00Z</updated><content type="html">${e(post.html)}</content></entry>`).join('')}</feed>`;

const output = path.join(root, 'dist');
await mkdir(output, { recursive: true });
await cp(path.join(root, 'assets'), path.join(output, 'assets'), { recursive: true });
await writeFile(path.join(output, 'index.html'), renderPage());
await writeFile(path.join(output, 'archive.html'), renderPage(true));
await mkdir(path.join(output, 'entries'), { recursive: true });
for (let start = 3; start < posts.length; start += 3) {
  const page = start / 3 + 1;
  await writeFile(path.join(output, 'entries', `${page}.json`), JSON.stringify({
    html: posts.slice(start, start + 3).map((post, index) => renderPost(post, start + index)).join('\n'),
    nextPage: start + 3 < posts.length ? `${basePath}/entries/${page + 1}.json` : null,
  }));
}
await writeFile(path.join(output, 'feed.xml'), feed);
await writeFile(path.join(output, '.nojekyll'), '');
console.log(`Built ${posts.length} posts → dist/ (${siteUrl})`);
