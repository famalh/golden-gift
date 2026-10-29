import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { JSDOM } from 'jsdom';
import { settings } from '../src/settings.js';

test('six-slot entry, keyboard, error, celebration, gifts and return navigation', async () => {
  const assets = new URL('../dist/assets/', import.meta.url);
  const bundle = fs.readdirSync(assets).find(name => name.endsWith('.js'));
  assert.ok(bundle, 'run npm run build before the DOM test');
  const dom = new JSDOM('<div id="root"></div>', { url: 'http://localhost/', runScripts: 'outside-only', pretendToBeVisual: true });
  try {
    const { window } = dom;
    window.scrollTo = () => {};
    // Preserve a visible success phase while keeping the test fast.
    const originalTimeout = window.setTimeout.bind(window);
    window.setTimeout = (callback, delay, ...args) => originalTimeout(callback, delay === 2600 ? 350 : delay, ...args);
    window.eval(fs.readFileSync(new URL(bundle, assets), 'utf8'));
    const wait = (ms = 25) => new Promise(resolve => setTimeout(resolve, ms));
    const text = () => window.document.body.textContent;
    const buttons = () => [...window.document.querySelectorAll('button')];
    const click = async label => {
      const button = buttons().find(b => b.textContent.trim() === label || b.getAttribute('aria-label') === label || b.textContent.includes(label));
      assert.ok(button, label); button.click(); await wait();
    };
    const key = async value => {
      window.document.querySelector('.keypad button').dispatchEvent(new window.KeyboardEvent('keydown', { key: value, bubbles: true, cancelable: true }));
      await wait();
    };
    const input = () => window.document.querySelector('input');
    await wait();
    assert.equal(window.document.querySelectorAll('.code-slot').length, 6);
    assert.ok(text().includes(settings.entryPrompt));
    await key('9'); await click('افتح الحكاية');
    assert.ok(text().includes(settings.entryError));
    assert.ok(window.document.querySelector('.has-error'));
    assert.equal(input().value, '');
    await key('0'); await key('7'); await key('Backspace');
    assert.equal(input().value, '0');
    await key('7'); await click('حذف آخر رقم'); assert.equal(input().value, '0');
    await click('مسح الرمز'); assert.equal(input().value, '');
    // Native input path, including Arabic numerals and length restriction.
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    setter.call(input(), '٠٧١١٠٢٩');
    input().dispatchEvent(new window.Event('input', { bubbles: true }));
    await wait(); assert.equal(input().value, settings.secretCode);
    await click('مسح الرمز');
    // Enter the configured code with the on-screen keypad, including initial zero.
    for (const digit of settings.secretCode) await click(digit);
    await key('9'); assert.equal(input().value, settings.secretCode);
    // Enter submits the same accessible form used by the keyboard in a browser.
    window.document.querySelector('main').dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    await wait();
    assert.ok(text().includes(settings.entrySuccess));
    assert.equal(window.document.querySelectorAll('.gift-card').length, 0, 'celebration precedes gifts');
    assert.equal(window.document.querySelectorAll('.celebration-stars span').length, 12);
    await wait(420);
    assert.equal(window.document.querySelectorAll('.gift-card').length, 3);
    await click(settings.giftCards.letter.title); assert.ok(text().includes(settings.letterContent));
    await click('العودة إلى الهدايا'); await click(settings.giftCards.music.title);
    assert.ok(text().includes('لم تُضف الأغنية بعد'));
    await click('العودة إلى الهدايا'); await click(settings.giftCards.external.title);
    assert.ok(text().includes('جاهز تكتشف المفاجأة؟'));
    await click('افتح مفاجأتك'); assert.ok(text().includes('المفاجأة لم تجهز بعد'));
    window.history.back(); await wait(60);
    assert.equal(window.document.querySelectorAll('.gift-card').length, 3);
  } finally { dom.window.close(); }
});
