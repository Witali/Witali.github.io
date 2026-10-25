import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import MarkdownIt from 'markdown-it';

// Raw HTML stays disabled; Markdown links also use markdown-it's URL validation.
export const markdown = new MarkdownIt({ html: false, typographer: true });
export const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[char]);

export function localDay(now = new Date(), timeZone = 'Europe/Budapest') {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(now);
  return ['year', 'month', 'day'].map((name) => parts.find((part) => part.type === name).value).join('-');
}

function plainText(source) {
  const tokens = markdown.parse(source, {});
  return tokens.filter((token) => token.type === 'inline').map((token) =>
    (token.children ?? []).map((child) => child.type === 'softbreak' ? ' ' :
      ['text', 'code_inline'].includes(child.type) ? child.content : '').join('')
  ).join(' ');
}

export function parsePost(source, filename) {
  const { data, content } = matter(source);
  const match = /^(\d{4}-\d{2}-\d{2})-([a-z0-9]+(?:-[a-z0-9]+)*)\.md$/.exec(filename);
  if (!match) throw new Error(`Invalid post filename: ${filename}`);
  const date = String(data.date ?? match[1]);
  const parsedDate = new Date(`${date}T12:00:00Z`);
  if (date !== match[1] || Number.isNaN(parsedDate.valueOf()) || parsedDate.toISOString().slice(0, 10) !== date) {
    throw new Error(`${filename}: date must be valid and match the filename`);
  }
  if (typeof data.title !== 'string' || !data.title.trim()) throw new Error(`${filename}: title is required`);
  if (!Array.isArray(data.tags) || !data.tags.length || data.tags.some((tag) => typeof tag !== 'string')) {
    throw new Error(`${filename}: tags must be a nonempty string array`);
  }
  if (data.sources != null && (!Array.isArray(data.sources) || data.sources.some((source) =>
    typeof source?.label !== 'string' || !/^https:\/\//.test(source?.url ?? '')))) {
    throw new Error(`${filename}: sources must contain labels and HTTPS URLs`);
  }
  const text = plainText(content);
  const sentences = [...new Intl.Segmenter('ru', { granularity: 'sentence' }).segment(text)]
    .filter((item) => item.segment.trim()).length;
  if (!text.trim() || sentences > 10) throw new Error(`${filename}: use 1–10 sentences (found ${sentences})`);
  return {
    title: data.title.trim(), date, tags: [...new Set(data.tags)], sources: data.sources ?? [],
    id: `post-${match[1]}-${match[2]}`, filename, text, sentences, html: markdown.render(content),
  };
}

export async function loadPosts(directory, { now = new Date(), timeZone } = {}) {
  const today = localDay(now, timeZone);
  const files = (await readdir(directory)).filter((file) => file.endsWith('.md'));
  const posts = await Promise.all(files.map(async (file) => parsePost(await readFile(path.join(directory, file), 'utf8'), file)));
  return posts.filter((post) => post.date <= today).sort((a, b) => b.date.localeCompare(a.date) || a.filename.localeCompare(b.filename));
}
