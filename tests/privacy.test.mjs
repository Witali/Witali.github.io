import test from 'node:test';
import assert from 'node:assert/strict';
import { assertPublicSources } from '../scripts/privacy.mjs';

test('allows verified public sources and profile links', () => {
  assert.doesNotThrow(() => assertPublicSources('[Code](https://github.com/Witali/MicroMusic/commit/123) https://github.com/Witali', ['Witali/MicroMusic']));
});

test('blocks unverified GitHub sources without a network lookup', () => {
  assert.throws(() => assertPublicSources('https://github.com/example/unverified-project', ['Witali/MicroMusic']), /unverified GitHub source/);
});

test('requires a confirmed public Bitbucket source', () => {
  const link = 'https://bitbucket.org/rudolff/z80-tester/';
  assert.throws(() => assertPublicSources(link, []), /unverified Bitbucket source/);
  assert.doesNotThrow(() => assertPublicSources(link, [], 'content', ['rudolff/z80-tester']));
});
