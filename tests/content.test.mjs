import test from 'node:test';
import assert from 'node:assert/strict';
import { findSensitiveText, validateManifestEntry } from '../scripts/validate-content.mjs';

test('flags authorization tokens and unmasked phone numbers', () => {
  assert.deepEqual(findSensitiveText('Authorization: Bearer abc.def.ghi'), ['authorization token']);
  assert.deepEqual(findSensitiveText('+86 138 1234 5678'), ['phone number']);
});

test('requires source metadata and accessible alt text', () => {
  assert.deepEqual(validateManifestEntry({ output: 'preview.png' }), [
    'missing source',
    'missing chapter',
    'missing purpose',
    'missing alt'
  ]);
});
