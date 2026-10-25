import { fileURLToPath } from 'node:url';
import { verifyPublicSources } from './privacy.mjs';

const registry = await verifyPublicSources(fileURLToPath(new URL('../', import.meta.url)));
console.log(`Local check passed against ${registry.repositories.length} GitHub and ${(registry.bitbucketRepositories ?? []).length} Bitbucket sources confirmed public on ${registry.checkedOn}.`);
console.log('Reconfirm visibility before publication. This check makes no network requests.');
