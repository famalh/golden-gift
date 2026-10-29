import React, { useEffect, useRef, useState } from 'react';
import { settings as s } from '../settings';
import { checkCode } from '../logic';

const normalize = value => value.replace(/[٠-٩]/g, n => '٠١٢٣٤٥٦٧٨٩'.indexOf(n)).replace(/\D/g, '');

export default function Keypad({ onUnlock }) {
  const [code, setCode] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const input = useRef(null);
  const submitted = useRef(false);
  const unlock = useRef(onUnlock);
  unlock.current = onUnlock;
  const length = s.secretCode.length;

  useEffect(() => {
    if (!success) return;
    const timer = window.setTimeout(() => unlock.current(), 2600);
    return () => window.clearTimeout(timer);
  }, [success]);

  function change(value) {
    if (submitted.current) return;
    setError(false);
    setCode(normalize(value).slice(0, length));
  }
  function submit(event) {
    event?.preventDefault();
    if (submitted.current) return;
    if (checkCode(code, s.secretCode)) {
      submitted.current = true;
      setError(false);
      setSuccess(true);
    } else {
      setAttempt(n => n + 1);
      setError(true);
      setCode('');
      input.current?.focus();
    }
  }
  function keyboard(event) {
    if (event.target === input.current || event.altKey || event.ctrlKey || event.metaKey) return;
    if (/^[0-9٠-٩]$/.test(event.key)) { event.preventDefault(); change(code + event.key); }
    else if (event.key === 'Backspace' || event.key === 'Delete') { event.preventDefault(); change(code.slice(0,-1)); }
    else if (event.key === 'Escape') { event.preventDefault(); change(''); }
    else if (event.key === 'Enter' && !event.target.closest?.('button')) { event.preventDefault(); submit(); }
  }

  useEffect(() => {
    window.addEventListener('keydown', keyboard);
    return () => window.removeEventListener('keydown', keyboard);
  }, [code, success]);

  return <form className={`lock-panel birthday-lock ${success ? 'is-success' : ''}`} onSubmit={submit} aria-label="رمز الدخول">
    {success ? <section className="birthday-celebration" role="status" aria-live="polite">
      <div className="celebration-stars" aria-hidden="true">{Array.from({length:12}, (_, i) => <span key={i} style={{'--i':i}}>✦</span>)}</div>
      <div className="birthday-heart" aria-hidden="true">♡</div>
      <h2>{s.entrySuccess}</h2><p>لحظات ونفتح هداياك…</p>
    </section> : <>
      <label className="birthday-prompt" htmlFor="birthday-code">{s.entryPrompt}</label>
      <div key={attempt} className={`code-entry ${error ? 'has-error' : ''}`}>
        <input ref={input} id="birthday-code" className="code-input" type="password" inputMode="numeric" autoComplete="off" maxLength={length} value={code} aria-label={`رمز الدخول من ${length} أرقام`} aria-describedby="code-message" aria-invalid={error} onChange={e => change(e.target.value)} />
        <div className="code-slots" aria-hidden="true" style={{'--digits':length}}>{Array.from({length}, (_, i) => <span className={`code-slot ${i < code.length ? 'filled' : ''} ${i === code.length ? 'current' : ''}`} key={i}>{i < code.length && <i key={`${i}-${code[i]}`}>●</i>}</span>)}</div>
      </div>
      <div className="keypad">{['1','2','3','4','5','6','7','8','9'].map(n => <button type="button" key={n} onClick={() => change(code + n)}>{n}</button>)}<button type="button" onClick={() => change('')} aria-label="مسح الرمز">مسح</button><button type="button" onClick={() => change(code + '0')}>0</button><button type="button" onClick={() => change(code.slice(0,-1))} aria-label="حذف آخر رقم">⌫</button></div>
      <p className="message" id="code-message" role="status">{error ? s.entryError : ''}</p>
      <button className="primary" type="submit">افتح الحكاية <span>←</span></button>
    </>}
  </form>;
}
