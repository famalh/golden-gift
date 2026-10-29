import test from 'node:test';
import assert from 'node:assert/strict';
import { checkCode, validateExternalUrl } from '../src/logic.js';
import { settings } from '../src/settings.js';
test('birthday code is six digits and preserves the initial zero', () => {
  assert.match(settings.secretCode, /^0\d{5}$/);
  assert.equal(checkCode(settings.secretCode, settings.secretCode), true);
  assert.equal(checkCode(settings.secretCode.slice(1), settings.secretCode), false);
  assert.equal(checkCode('999999', settings.secretCode), false);
});
test('accepts exact code, preserves leading zeros, rejects wrong or empty code', () => {
  assert.equal(checkCode('0123', '0123'), true);
  assert.equal(checkCode('123', '0123'), false);
  assert.equal(checkCode('0000', '1234'), false);
  assert.equal(checkCode('', ''), false);
});
test('empty gift has friendly message', () => {
  for (const value of ['', '  ', null]) assert.equal(validateExternalUrl(value).error, 'المفاجأة لم تجهز بعد');
});
test('accepts absolute HTTPS only and rejects malformed and unsafe values', () => {
  assert.equal(validateExternalUrl(' https://example.com/gift?q=1 ').url, 'https://example.com/gift?q=1');
  for (const value of ['http://example.com', 'javascript:alert(1)', '/gift', 'example.com', 'https://', 'https://user:pass@example.com']) assert.ok(validateExternalUrl(value).error);
});
