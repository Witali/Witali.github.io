import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

export function assertPublicSources(content, approvedRepositories, label = 'content', approvedBitbucketRepositories = []) {
  for (const [provider, pattern, allowlist] of [
    ['GitHub', /https?:\/\/github\.com\/([\w.-]+\/[\w.-]+)/gi, approvedRepositories],
    ['Bitbucket', /https?:\/\/bitbucket\.org\/([\w.-]+\/[\w.-]+)/gi, approvedBitbucketRepositories],
  ]) {
    const approved = new Set(allowlist.map((repository) => repository.toLowerCase()));
    const repositories = new Set([...content.matchAll(pattern)].map((match) => match[1].replace(/\.git$/, '').toLowerCase()));
    for (const repository of repositories) {
      if (!approved.has(repository)) throw new Error(`${label}: unverified ${provider} source; verify its public visibility before adding it`);
    }
  }
}

export async function verifyPublicSources(root) {
  const registry = JSON.parse(await readFile(path.join(root, 'content/public-sources.json'), 'utf8'));
  async function inspect(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const filename = path.join(directory, entry.name);
      if (entry.isDirectory()) await inspect(filename);
      else if (entry.name.endsWith('.md')) {
        assertPublicSources(await readFile(filename, 'utf8'), registry.repositories, path.relative(root, filename), registry.bitbucketRepositories ?? []);
      }
    }
  }
  await inspect(path.join(root, 'content'));
  assertPublicSources(await readFile(path.join(root, 'scripts/build.mjs'), 'utf8'), registry.repositories, 'site template', registry.bitbucketRepositories ?? []);
  return registry;
}
