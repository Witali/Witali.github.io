import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { escapeHtml as e, loadPosts, loadProjects, markdown } from './content.mjs';
import { verifyPublicSources } from './privacy.mjs';
import { analyticsId, analyticsScript, analyticsConsent } from './analytics.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
await verifyPublicSources(root);
const config = JSON.parse(await readFile(path.join(root, 'site.config.json'), 'utf8'));
const posts = await loadPosts(path.join(root, 'content/posts'), { timeZone: config.timeZone });
const intro = matter(await readFile(path.join(root, 'content/intro.md'), 'utf8'));
const projects = await loadProjects(path.join(root, 'content/projects'));
const basePath = (process.env.SITE_BASE_PATH ?? config.basePath).replace(/\/$/, '');
if (basePath && !/^\/[a-zA-Z0-9_/-]+$/.test(basePath)) throw new Error('SITE_BASE_PATH must be empty or an absolute URL path');
const asset = (file) => `${basePath}/assets/${file}`;
const normalizeLink = (url) => url.replace(/\/$/, '');
const projectIcons = new Map(projects.flatMap((project) => project.icon ? project.links.map((link) => [normalizeLink(link.url), project.icon]) : []));
const linkIcon = (url) => projectIcons.has(normalizeLink(url)) ? `<img class="project-link-icon" src="${e(asset(projectIcons.get(normalizeLink(url))))}" width="18" height="18" alt="" loading="lazy">` : '';
const siteUrl = `${(process.env.SITE_ORIGIN || config.url).replace(/\/$/, '')}${basePath}/`;
const measurementId = analyticsId(process.env.GA4_MEASUREMENT_ID);
const dateLabel = (date, options) => new Intl.DateTimeFormat('ru', { timeZone: 'UTC', ...options }).format(new Date(`${date}T12:00:00Z`));
const monthLabel = (date) => dateLabel(date, { month: 'long', year: 'numeric' }).replace(' г.', '');
const codeIcon = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m8 7-5 5 5 5m8-10 5 5-5 5M14 4l-4 16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const videoLinks = (videos) => videos.length ? `<div class="video-links">${videos.map((video) => `<a class="video-link" href="${e(video.url)}"><span class="play-icon" aria-hidden="true">▶</span><span>${e(video.label)}</span><span aria-hidden="true">↗</span></a>`).join('')}</div>` : '';

function renderPost(post, index) {
  const month = index > 0 && posts[index - 1].date.slice(0, 7) !== post.date.slice(0, 7) ? `<p class="month-label month-break">${monthLabel(post.date)}</p>` : '';
  const postHtml = post.html.replaceAll('src="/assets/', `src="${basePath}/assets/`);
  const tags = post.tags.map((tag) => `<span class="tag">${e(tag)}</span>`).join('');
  const sources = post.sources.length ? `<div class="sources"><span>Проекты в записи</span>${post.sources.map((source) => `<a href="${e(source.url)}">${linkIcon(source.url)}${e(source.label)} <span aria-hidden="true">↗</span></a>`).join('')}</div>` : '';
  return `${month}<article class="entry" id="${post.id}" data-tags="${e(post.tags.join('|'))}">
    <div class="entry-date"><time datetime="${post.date}" aria-label="${e(dateLabel(post.date, { day: 'numeric', month: 'long', year: 'numeric' }))}"><span class="day">${dateLabel(post.date, { day: '2-digit' })}</span><span>${dateLabel(post.date, { month: 'short' }).replace('.', '')}</span></time><span class="weekday">${dateLabel(post.date, { weekday: 'short' })}</span></div>
    <div class="entry-content"><div class="entry-meta">${tags}${index === 0 ? '<span class="latest">Свежая запись</span>' : ''}</div>
    <h3><a href="${basePath}/archive.html#${post.id}">${e(post.title)}</a></h3><div class="prose">${postHtml}</div>${videoLinks(post.videos)}${sources}</div>
  </article>`;
}

function renderProject(project, index) {
  return `<article class="project-card" id="project-${e(project.id)}"><div class="project-card-top"><span class="project-number">${String(index + 1).padStart(2, '0')}</span><span>${e(project.category)}</span></div><h3>${e(project.title)}</h3><div class="prose">${project.html}</div><div class="project-links">${project.links.map((link) => `<a href="${e(link.url)}">${linkIcon(link.url)}${e(link.label)} <span aria-hidden="true">↗</span></a>`).join('')}</div>${videoLinks(project.videos)}</article>`;
}

function renderProjects() {
  const current = projects.filter((project) => project.group !== 'bitbucket');
  const bitbucket = projects.filter((project) => project.group === 'bitbucket');
  const count = projects.length;
  const noun = count % 10 === 1 && count % 100 !== 11 ? 'проект' : [2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100) ? 'проекта' : 'проектов';
  return `<section class="project-section" id="projects" aria-labelledby="projects-title"><div class="journal-heading"><div><p class="eyebrow">Публичные репозитории и разработки</p><h1 id="projects-title">Мои проекты<span class="heading-dot">.</span></h1></div><span class="project-total">${count} ${noun}</span></div><p class="section-description">Мои публичные проекты: маленькие процессоры, музыка, эмуляторы, аналоговое железо и веб-приложения.</p><div class="project-grid">${current.map(renderProject).join('\n')}</div>${bitbucket.length ? `<h2 class="project-group-title" id="bitbucket-projects">Ещё проекты на Bitbucket</h2><div class="project-grid">${bitbucket.map((project, index) => renderProject(project, current.length + index)).join('\n')}</div>` : ''}</section>`;
}

function renderPage(view = 'home') {
const archive = view === 'archive';
const projectsOnly = view === 'projects';
const privacyOnly = view === 'privacy';
const compact = projectsOnly || privacyOnly;
const pageUrl = compact ? `${siteUrl}${view}.html` : archive ? `${siteUrl}archive.html` : siteUrl;
const title = projectsOnly ? `${config.title} — проекты` : privacyOnly ? `${config.title} — конфиденциальность` : `${config.title} — дневник разработки`;
return `<!doctype html>
<html lang="ru"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${e(title)}</title>
<meta name="description" content="${e(config.description)}"><meta name="theme-color" content="#f8f7f3">
<link rel="canonical" href="${e(pageUrl)}"><link rel="icon" href="${asset('favicon.svg')}" type="image/svg+xml">
<link rel="alternate" type="application/atom+xml" title="${e(config.title)}" href="${basePath}/feed.xml">
<meta property="og:title" content="${e(title)}"><meta property="og:description" content="${e(config.description)}">
<meta property="og:type" content="website"><meta property="og:locale" content="ru_RU"><meta property="og:url" content="${e(pageUrl)}">
<meta property="og:image" content="${e(new URL(asset('workbench.png'), siteUrl).href)}">
<link rel="stylesheet" href="${asset('styles.css')}">${compact ? '' : `<script src="${asset('journal.js')}" defer></script>`}
${analyticsScript(measurementId, basePath, siteUrl)}
</head><body id="top">
<a class="skip-link" href="${privacyOnly ? '#privacy' : projectsOnly ? '#projects' : '#journal'}">${privacyOnly ? 'К тексту' : projectsOnly ? 'К проектам' : 'К записям'}</a>
<header class="site-header wrap"><a class="brand" href="${compact ? `${basePath}/` : '#top'}"><span class="brand-icon">${codeIcon}</span>${e(config.title)}<span class="brand-dot">.</span></a>
<nav aria-label="Основная навигация"><a${compact ? '' : ' class="current"'} href="${compact ? `${basePath}/#journal` : '#journal'}">Дневник</a><a${projectsOnly ? ' class="current" aria-current="page"' : ''} href="${basePath}/projects.html">Проекты</a><a href="${compact ? `${basePath}/#about` : '#about'}">Об авторе</a><a class="github-link" href="${e(config.github)}">GitHub <span aria-hidden="true">↗</span></a></nav></header>
<main class="wrap${compact ? ' projects-page' : ''}">
${privacyOnly ? `<section class="privacy-page prose" id="privacy"><p class="eyebrow">О данных посетителей</p><h1>Конфиденциальность</h1>
<p>Google Analytics 4 помогает понять, какие страницы блога читают и как используют сайт.</p>
<h2>Ваш выбор</h2><p>Google Analytics загружается только после нажатия «Разрешить». Если вы отклоните сбор статистики, код Google Analytics не загружается. Изменить выбор можно кнопкой «Настройки аналитики» внизу страницы.</p>
<h2>Что попадает в статистику</h2><p>Посещения страниц, действия на сайте и технические сведения о браузере и устройстве обрабатываются Google. В адресе страницы, передаваемом счётчику, убраны параметры запроса и фрагмент после #; для источника перехода передаётся только адрес сайта. Рекламная персонализация и Google Signals отключены.</p>
<h2>Хранение в браузере</h2><p>Выбор сохраняется в этом браузере на 180 дней. После согласия Google Analytics может сохранять cookies с префиксом pogromist для распознавания посещений; срок их действия настроен на 180 дней. При отзыве согласия эти cookies удаляются и страница перезагружается без счётчика.</p>
<p>Подробнее: <a href="https://policies.google.com/technologies/partner-sites">как Google использует данные с сайтов, работающих с его сервисами</a>.</p></section>` : projectsOnly ? renderProjects() : `
<section class="intro" id="about" aria-labelledby="intro-title">
<div class="intro-copy"><p class="eyebrow"><span class="status-dot"></span>${e(intro.data.eyebrow)}</p><h1 id="intro-title">${e(intro.data.title)}</h1><div class="intro-text prose">${markdown.render(intro.content)}</div><a class="text-link" href="#journal">Что нового на верстаке <span aria-hidden="true">↓</span></a></div>
<figure class="hero"><img src="${asset('workbench.png')}" width="1942" height="809" alt="Иллюстрация мастерской: программист с кружкой за столом, кот, микросхемы и ретрокомпьютеры" fetchpriority="high"><figcaption><span>Код. Паяльник. Ещё одна идея.</span><span>Личная территория экспериментов</span></figcaption></figure>
</section>
<section class="journal" id="journal" aria-labelledby="journal-title"><div class="journal-heading"><div><p class="eyebrow">Заметки с рабочего стола</p><h2 id="journal-title">Дневник разработки<span class="heading-dot">.</span></h2></div><a class="rss-link" href="${basePath}/feed.xml">RSS <span aria-hidden="true">↗</span></a></div>
<div class="journal-layout"><div class="feed">
<p class="month-label">${posts.length ? monthLabel(posts[0].date) : 'Первые записи скоро появятся'}<span id="post-count" aria-live="polite">Всего записей: ${posts.length}</span></p>
<div id="entries" data-next-page="${!archive && posts.length > 3 ? `${basePath}/entries/2.json` : ''}">${(archive ? posts : posts.slice(0, 3)).map(renderPost).join('\n')}</div>
${!archive && posts.length > 3 ? `<div class="load-more"><button id="load-more" type="button" hidden>Показать ещё записи <span aria-hidden="true">↓</span></button><p id="load-status" role="status"></p><a class="archive-link" href="${basePath}/archive.html#journal">Все записи в архиве ↗</a></div>` : ''}
<p class="feed-end" ${!archive && posts.length > 3 ? 'hidden' : ''}><span></span>Пока всё. Продолжение — на верстаке.<span></span></p></div>
<aside class="sidebar" aria-label="О дневнике"><div class="sidebar-note"><span class="small-code">${codeIcon}</span><h3>Впихнуть невпихуемое</h3><p>Музыка на крошечном AVR, звук на Z80 и другие задачи, которые слишком интересны, чтобы их отложить.</p><span class="handwritten">Проверяю на практике.</span></div>
<div class="projects"><p class="eyebrow">На верстаке</p><a href="https://witali.github.io/MicroMusic/"><span>${linkIcon('https://witali.github.io/MicroMusic/')}MicroMusic<small>Музыка на маленьких процессорах</small></span>↗</a><a href="https://witali.github.io/Web-MIDI-Player/"><span>${linkIcon('https://witali.github.io/Web-MIDI-Player/')}Web MIDI Player<small>Синтезатор прямо в браузере</small></span>↗</a><a href="https://github.com/Witali/yoRadio"><span>yoRadio<small>Радио, экраны и ESP32</small></span>↗</a></div>
<a class="all-projects" href="${basePath}/projects.html">Все проекты <span aria-hidden="true">↗</span></a>
<p class="sidebar-caption">Коротко о сделанном.<br>Свежие записи — сверху.</p></aside></div></section>
`}
</main><footer class="site-footer wrap"><p>© ${posts[0]?.date.slice(0, 4) ?? new Date().getUTCFullYear()} ${e(config.author)} <span>·</span> ${e(config.title)}</p><div class="footer-links">${measurementId ? `<a href="${basePath}/privacy.html">Конфиденциальность</a><button type="button" id="analytics-settings" aria-controls="analytics-consent" aria-expanded="false">Настройки аналитики</button>` : ''}<a href="#top">Наверх ↑</a></div></footer>
${analyticsConsent(measurementId, basePath)}
</body></html>`;
}

const feed = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom"><title>${e(config.title)}</title><subtitle>${e(config.description)}</subtitle><id>${e(siteUrl)}</id><link href="${e(siteUrl)}"/><link href="${e(siteUrl)}feed.xml" rel="self"/><updated>${posts[0]?.date ?? '2026-10-25'}T12:00:00Z</updated><author><name>${e(config.author)}</name></author>${posts.map((post) => `<entry><title>${e(post.title)}</title><id>${e(siteUrl)}archive.html#${post.id}</id><link href="${e(siteUrl)}archive.html#${post.id}"/><updated>${post.date}T12:00:00Z</updated><content type="html">${e(post.html)}</content></entry>`).join('')}</feed>`;

const output = path.join(root, 'dist');
await mkdir(output, { recursive: true });
await cp(path.join(root, 'assets'), path.join(output, 'assets'), { recursive: true });
await writeFile(path.join(output, 'index.html'), renderPage());
await writeFile(path.join(output, 'archive.html'), renderPage('archive'));
await writeFile(path.join(output, 'projects.html'), renderPage('projects'));
await writeFile(path.join(output, 'privacy.html'), renderPage('privacy'));
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
