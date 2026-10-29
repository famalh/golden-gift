import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { settings as s } from './settings';
import { validateExternalUrl } from './logic';
import './styles.css';
import './birthday.css';
import Keypad from './components/Keypad';

function GiftBox({ variant = 'external' }) {
  return <div className={`gift-art ${variant}`} aria-hidden="true"><span className="spark one">✦</span><span className="spark two">✧</span><div className="bow"><i/><i/></div><div className="lid"/><div className="box"><span>{variant === 'letter' ? '♡' : variant === 'music' ? '♪' : '✧'}</span></div><div className="ribbon"/></div>;
}

function Music() {
  const audio = useRef(null);
  const [status, setStatus] = useState(s.musicPath ? 'ready' : 'missing');
  const [playing, setPlaying] = useState(false);
  async function toggle() {
    if (!audio.current) return;
    if (playing) { audio.current.pause(); return; }
    setStatus('loading');
    try { await audio.current.play(); setStatus('ready'); }
    catch { setStatus('error'); setPlaying(false); }
  }
  return <><div className={`record ${playing ? 'playing' : ''}`} aria-hidden="true"><span>♪</span></div><h1>{s.songName}</h1>{s.artistName && <p>{s.artistName}</p>}
    {s.musicPath && <audio ref={audio} src={`${import.meta.env.BASE_URL}${s.musicPath.replace(/^\/+/, '')}`} preload="metadata" onPlaying={() => {setPlaying(true);setStatus('ready');}} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)} onError={() => {setStatus('error');setPlaying(false);}}/>}
    <p role="status">{status === 'missing' ? 'لم تُضف الأغنية بعد. سيصل اللحن قريبًا ♡' : status === 'error' ? 'تعذر تشغيل الأغنية. تأكد من وجود الملف وصحة مساره وصيغته.' : status === 'loading' ? 'جارٍ تحميل الأغنية…' : 'لحظة هادئة، ولحن قريب من القلب'}</p>
    {s.musicPath && <button className="primary" onClick={toggle} disabled={status === 'loading'}>{playing ? 'إيقاف مؤقت' : status === 'error' ? 'إعادة المحاولة' : 'تشغيل الأغنية'}</button>}
  </>;
}

function ExternalGift() {
  const [error, setError] = useState('');
  function open() {
    const result = validateExternalUrl(s.externalGiftUrl);
    if (result.error) setError(result.error);
    else window.location.assign(result.url);
  }
  return <><GiftBox/><h1>جاهز تكتشف المفاجأة؟</h1><p>باقي لك شيء واحد أعددته لك</p><button className="primary" onClick={open}>افتح مفاجأتك <span>←</span></button><p className="message" role="status">{error}</p></>;
}

function App() {
  const [unlocked, setUnlocked] = useState(false);
  const [page, setPage] = useState('welcome');
  const heading = useRef(null);
  useEffect(() => {
    function pop(event) { setPage(unlocked && ['gifts','letter','music','external'].includes(event.state?.giftPage) ? event.state.giftPage : unlocked ? 'gifts' : 'welcome'); }
    window.addEventListener('popstate', pop);
    return () => window.removeEventListener('popstate', pop);
  }, [unlocked]);
  useEffect(() => { heading.current?.focus(); window.scrollTo(0,0); }, [page]);
  function navigate(next) { window.history.pushState({giftPage:next}, '', `#${next}`); setPage(next); }
  function unlock() { setUnlocked(true); navigate('gifts'); }
  return <div className="app"><header><a className="brand" href="#" onClick={e => {e.preventDefault(); if(unlocked) navigate('gifts');}}>هدية من القلب <span>✧</span></a><span className="header-note">صُنعت بكل حب</span></header>
    <main ref={heading} tabIndex="-1" className={`page ${page === 'welcome' ? 'welcome' : ''}`}>
      {page !== 'welcome' && page !== 'gifts' && <button className="back" onClick={() => navigate('gifts')}>→ العودة إلى الهدايا</button>}
      {page === 'welcome' ? <><section className="intro"><span className="eyebrow">{s.receptionEyebrow}</span><div className="seal" aria-hidden="true">♡</div><p className="recipient">{s.recipientName}</p><h1>{s.receptionTitle}</h1><p style={{whiteSpace:'pre-line'}}>{s.welcomeText}</p><div className="ornament">──── ✦ ────</div></section><Keypad onUnlock={unlock}/></> :
      page === 'gifts' ? <section className="selection"><span className="eyebrow">ثلاث هدايا، وحكاية واحدة</span><h1>أشياء صغيرة… لك وحدك</h1><p>افتح ما يشبه قلبك، واترك الباقي يفاجئك</p><div className="gift-grid">{Object.entries(s.giftCards).map(([key, card], index) => <button key={key} className="gift-card" style={{'--delay':`${index*100}ms`}} onClick={() => navigate(key)}><span className="gift-number">0{index+1}</span><GiftBox variant={key}/><h2>{card.title}</h2><p>{card.description}</p><span className="card-action">اكتشف الهدية ←</span></button>)}</div></section> :
      page === 'letter' ? <article className="letter"><span className="eyebrow">من القلب إلى القلب</span><h1>{s.letterTitle}</h1><div className="ornament">✦</div><p className="letter-body">{s.letterContent}</p><p className="signature">{s.closingPhrase}<br/>{s.senderName}</p></article> :
      <section className="detail">{page === 'music' ? <Music/> : <ExternalGift/>}</section>}
    </main><footer>بعض التفاصيل الصغيرة، تبقى طويلًا <span>♡</span></footer></div>;
}
createRoot(document.getElementById('root')).render(<App/>);
