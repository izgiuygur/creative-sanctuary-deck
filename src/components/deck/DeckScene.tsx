import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import type { OracleCard, ElementFilter, DrawMode } from '../../types/card';
import { elements, elementOrder } from '../../data/elements';
import { getRandomCard } from '../../data/cards';
import { CardFront, CardBack, Deck } from './Card';
import Doodles from './Doodles';
import { startAnalytics, track } from '../../lib/analytics';
import IntroScreen from '../intro/IntroScreen';

type View = 'boot' | 'intro' | 'deck' | 'hand' | 'kept';

const HAND_LIMIT = 6;
const BREATHED_KEY = 'creatives-sanctuary:breathed';
const THEME_KEY = 'creatives-sanctuary:theme';
const NUMBER_WORDS = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six'];
const SLOT_NAMES = ['The mess', 'The nudge', 'The next bit'];
const SLOT_TILTS = [-3, 1.5, 3];

// Development only: lets tests reach the animation clock from the browser console.
if (import.meta.env.DEV && typeof window !== 'undefined') {
  (window as unknown as { __gsap: typeof gsap }).__gsap = gsap;
}

/** The suit's colour, as a soft shape behind a single card. The page itself stays paper. */
function SuitSwash({ color, swashRef }: { color: string; swashRef?: React.Ref<SVGSVGElement> }) {
  return (
    <svg className="swash swash--suit" viewBox="0 0 640 720" aria-hidden="true" ref={swashRef}>
      <path d="M120 170 C210 50 450 40 540 170 C620 290 610 500 510 610 C410 710 210 700 110 590 C20 490 40 270 120 170 Z" fill={color} />
    </svg>
  );
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function DeckScene() {
  const [view, setView] = useState<View>('boot');
  const [mode, setMode] = useState<DrawMode>('single');
  const [filter, setFilter] = useState<ElementFilter>('all');
  const [current, setCurrent] = useState<OracleCard | null>(null);
  const [reading, setReading] = useState<OracleCard[]>([]);
  const [hand, setHand] = useState<OracleCard[]>([]);
  const [keptIndex, setKeptIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [dark, setDark] = useState(false);

  const drawnRef = useRef<string[]>([]);
  const deckRef = useRef<HTMLButtonElement>(null);
  const restingRef = useRef<HTMLDivElement>(null);
  const flipRef = useRef<HTMLDivElement>(null);
  const flipInnerRef = useRef<HTMLDivElement>(null);
  const revealTextRef = useRef<HTMLDivElement>(null);
  const handBtnRef = useRef<HTMLButtonElement>(null);
  const swashRef = useRef<SVGSVGElement>(null);
  const slotRefs = useRef<Array<HTMLDivElement | null>>([]);
  const originRef = useRef<{ x: number; y: number; restY: number; width: number } | null>(null);
  const animatedSlots = useRef(0);

  // The breathing plays once, on a first visit. After that it waits behind the eye on the main page.
  useEffect(() => {
    let seen = false;
    try {
      seen = window.localStorage.getItem(BREATHED_KEY) === '1';
    } catch {
      /* storage unavailable: just show it */
    }
    setView(seen ? 'deck' : 'intro');
  }, []);

  // Layout.astro sets the theme before first paint; pick it up here so the moon knows.
  useEffect(() => {
    setDark(document.documentElement.dataset.theme === 'dark');
    startAnalytics();
  }, []);

  const toggleLights = useCallback(() => {
    setDark(was => {
      const next = !was;
      document.documentElement.dataset.theme = next ? 'dark' : 'light';
      try {
        window.localStorage.setItem(THEME_KEY, next ? 'dark' : 'light');
      } catch {
        /* ignore */
      }
      track('dark_mode', { on: next });
      return next;
    });
  }, []);

  const finishIntro = useCallback((skipped?: boolean) => {
    track(skipped ? 'breathing_skipped' : 'breathing_finished');
    try {
      window.localStorage.setItem(BREATHED_KEY, '1');
    } catch {
      /* ignore */
    }
    setView('deck');
  }, []);

  const keptCard = view === 'kept' ? hand[keptIndex] ?? null : null;
  const resting = view === 'deck' && mode === 'single' && !current;

  const pickCard = useCallback((): OracleCard | null => {
    const held = [...hand, ...reading].map(c => c.id);
    let card = getRandomCard(filter, [...drawnRef.current, ...held]);
    if (!card) {
      drawnRef.current = [];
      card = getRandomCard(filter, held) ?? getRandomCard(filter, []);
    }
    if (card) drawnRef.current.push(card.id);
    return card;
  }, [filter, hand, reading]);

  // --- Single draw ---------------------------------------------------------

  const drawSingle = useCallback(() => {
    if (busy || current) return;
    const card = pickCard();
    if (!card) return;
    setBusy(true);
    const deck = deckRef.current;
    if (deck) {
      const r = deck.getBoundingClientRect();
      const y = r.top + r.height / 2;
      // The deck bobs gently and lifts under the pointer; the return trip aims for where it sits at rest,
      // so that comes from its layout box rather than from where it happens to be drawn right now.
      const wrap = deck.parentElement;
      let restY = y;
      if (wrap) {
        const bob = new DOMMatrix(getComputedStyle(wrap).transform).m42;
        restY = wrap.getBoundingClientRect().top - bob + deck.offsetTop + deck.offsetHeight / 2;
      }
      originRef.current = { x: r.left + r.width / 2, y, restY, width: deck.offsetWidth };
    }
    track('card_drawn', { card: card.word, suit: card.element, mode: 'single' });
    const extras = restingRef.current?.querySelectorAll('.doodles, .prompt, .swash');
    if (prefersReducedMotion() || !extras?.length) {
      setCurrent(card);
    } else {
      gsap.to(extras, { opacity: 0, duration: 0.22, ease: 'power1.in', onComplete: () => setCurrent(card) });
    }
  }, [busy, current, pickCard]);

  // The drawn card starts where the deck was, face down, then travels, straightens and turns over.
  useLayoutEffect(() => {
    if (!current || mode !== 'single') return;
    const el = flipRef.current;
    const inner = flipInnerRef.current;
    const text = revealTextRef.current;
    if (!el || !inner) {
      setBusy(false);
      return;
    }
    if (prefersReducedMotion()) {
      gsap.set(inner, { rotateY: 180 });
      setBusy(false);
      return;
    }
    const r = el.getBoundingClientRect();
    const o = originRef.current;
    const from = o
      ? { x: o.x - (r.left + r.width / 2), y: o.y - (r.top + r.height / 2), scale: o.width / r.width, rotation: -4 }
      : { x: 0, y: 30, scale: 0.9, rotation: -4 };
    const tl = gsap.timeline({ onComplete: () => setBusy(false) });
    gsap.set(inner, { rotateY: 0 });
    tl.fromTo(el, { ...from, opacity: 1 }, { x: 0, y: 0, scale: 1, rotation: 0, duration: 0.95, ease: 'power3.out' }, 0).to(
      inner,
      { rotateY: 180, duration: 0.75, ease: 'power2.inOut' },
      0.1
    );
    if (text) tl.fromTo(text.children, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.09, ease: 'power2.out' }, 0.55);
    if (swashRef.current) tl.fromTo(swashRef.current, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.7, ease: 'power2.out' }, 0.35);
    return () => {
      tl.kill();
    };
  }, [current, mode]);

  const leaveCard = useCallback((then: () => void, flyTo?: DOMRect) => {
    const el = flipRef.current;
    const inner = flipInnerRef.current;
    const text = revealTextRef.current;
    if (!el || !inner || prefersReducedMotion()) {
      then();
      return;
    }
    const swash = swashRef.current;
    const tl = gsap.timeline({ onComplete: then });
    if (text) tl.to(text.children, { opacity: 0, duration: 0.2 }, 0);
    if (flyTo) {
      if (swash) tl.to(swash, { opacity: 0, duration: 0.25 }, 0);
      const r = el.getBoundingClientRect();
      tl.to(
        el,
        {
          x: flyTo.left + flyTo.width / 2 - (r.left + r.width / 2),
          y: flyTo.top + flyTo.height / 2 - (r.top + r.height / 2),
          scale: 0.08,
          rotation: -12,
          opacity: 0,
          duration: 0.6,
          ease: 'power3.in',
        },
        0.05
      );
    } else {
      // Putting it back is the draw in reverse: turn face down, travel to the deck, take up its tilt.
      const r = el.getBoundingClientRect();
      const o = originRef.current;
      const to = o
        ? { x: o.x - (r.left + r.width / 2), y: o.restY - (r.top + r.height / 2), scale: o.width / el.offsetWidth, rotation: -4 }
        : { x: 0, y: 24, scale: 0.9, rotation: -4 };
      tl.to(inner, { rotateY: 0, duration: 0.7, ease: 'power2.inOut' }, 0.05).to(el, { ...to, duration: 0.85, ease: 'power3.inOut' }, 0.1);
      if (swash) tl.to(swash, { opacity: 0, scale: 0.85, duration: 0.3, ease: 'power1.in' }, 0);
    }
  }, []);

  const putBack = useCallback(() => {
    if (busy || !current) return;
    setBusy(true);
    track('card_put_back', { card: current.word, suit: current.element });
    leaveCard(() => {
      setCurrent(null);
      setBusy(false);
    });
  }, [busy, current, leaveCard]);

  // Where a kept card flies to: the hand line, or the bottom of the screen when the phone has hidden it.
  const handTarget = () => {
    const r = handBtnRef.current?.getBoundingClientRect();
    if (r && r.width > 0) return r;
    return new DOMRect(window.innerWidth / 2 - 20, window.innerHeight - 30, 40, 20);
  };

  const keepCurrent = useCallback(() => {
    if (busy || !current || hand.length >= HAND_LIMIT) return;
    setBusy(true);
    const card = current;
    track('card_kept', { card: card.word, suit: card.element, hand_size: hand.length + 1 });
    leaveCard(() => {
      setHand(h => (h.some(c => c.id === card.id) ? h : [...h, card]));
      setCurrent(null);
      setBusy(false);
    }, handTarget());
  }, [busy, current, hand.length, leaveCard]);

  // --- Three-card reading --------------------------------------------------

  const drawTriple = useCallback(() => {
    if (busy || reading.length >= 3) return;
    const card = pickCard();
    if (!card) return;
    setBusy(true);
    track('card_drawn', { card: card.word, suit: card.element, mode: 'triple', position: reading.length + 1 });
    if (reading.length === 2) track('reading_completed');
    setReading(r => [...r, card]);
  }, [busy, reading.length, pickCard]);

  // Each card turns over in the slot where the deck was sitting, and settles at its own tilt.
  useLayoutEffect(() => {
    if (mode !== 'triple') return;
    const i = reading.length - 1;
    if (i < 0) {
      animatedSlots.current = 0;
      return;
    }
    if (animatedSlots.current > i) return;
    animatedSlots.current = i + 1;
    const el = slotRefs.current[i];
    const inner = el?.querySelector<HTMLElement>('.flip__inner');
    const quote = el?.parentElement?.querySelector<HTMLElement>('.slot__quote');
    if (!el || !inner) {
      setBusy(false);
      return;
    }
    if (prefersReducedMotion()) {
      gsap.set(inner, { rotateY: 180 });
      gsap.set(el, { rotation: SLOT_TILTS[i] });
      setBusy(false);
      return;
    }
    gsap.set(inner, { rotateY: 0 });
    const tl = gsap.timeline({ onComplete: () => setBusy(false) });
    tl.fromTo(el, { rotation: -4, y: 0 }, { rotation: SLOT_TILTS[i], y: 0, duration: 0.8, ease: 'power3.out' }, 0)
      .to(el, { y: -18, duration: 0.3, ease: 'power2.out', yoyo: true, repeat: 1 }, 0)
      .to(inner, { rotateY: 180, duration: 0.7, ease: 'power2.inOut' }, 0.05);
    if (quote) tl.fromTo(quote, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 0.55);
  }, [reading.length, mode]);

  const startOver = useCallback(() => {
    if (busy) return;
    track('reading_started_over');
    setReading([]);
  }, [busy]);

  const room = HAND_LIMIT - hand.length;
  const keepReading = useCallback(() => {
    if (busy || room <= 0) return;
    track('reading_kept', { count: Math.min(room, reading.length) });
    setHand(h => {
      const fresh = reading.filter(c => !h.some(x => x.id === c.id)).slice(0, HAND_LIMIT - h.length);
      return [...h, ...fresh];
    });
    setReading([]);
  }, [busy, room, reading]);

  // --- Navigation ----------------------------------------------------------

  const changeMode = useCallback(
    (next: DrawMode) => {
      if (busy || next === mode) return;
      track('mode_changed', { mode: next });
      setCurrent(null);
      setReading([]);
      setMode(next);
    },
    [busy, mode]
  );

  const chooseFilter = (next: ElementFilter) => {
    if (next !== filter) track('suit_filter', { suit: next });
    setFilter(next);
  };

  const goToDeck = useCallback(() => {
    if (busy) return;
    setView('deck');
  }, [busy]);

  const openKept = (i: number) => {
    setKeptIndex(i);
    setView('kept');
  };

  const letGo = useCallback(() => {
    const gone = hand[keptIndex];
    if (gone) track('card_let_go', { card: gone.word, suit: gone.element });
    const next = hand.filter((_, i) => i !== keptIndex);
    setHand(next);
    if (next.length === 0) setView('hand');
    else setKeptIndex(Math.min(keptIndex, next.length - 1));
  }, [hand, keptIndex]);

  useEffect(() => {
    if (view !== 'kept' && view !== 'hand') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setView(view === 'kept' ? 'hand' : 'deck');
      if (view === 'kept' && hand.length > 1) {
        if (e.key === 'ArrowLeft') setKeptIndex(k => (k - 1 + hand.length) % hand.length);
        if (e.key === 'ArrowRight') setKeptIndex(k => (k + 1) % hand.length);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [view, hand.length]);

  if (view === 'boot') return null;

  if (view === 'intro') {
    return <IntroScreen onComplete={finishIntro} />;
  }

  const handLabel =
    hand.length === 0
      ? 'Your hand is empty. Be picky.'
      : hand.length <= 3
        ? `In your hand: ${hand.map(c => c.word).join(', ')}.`
        : `In your hand: ${NUMBER_WORDS[hand.length].toLowerCase()} cards.`;

  const alreadyKept = current ? hand.some(c => c.id === current.id) : false;
  const prev = hand.length > 1 ? hand[(keptIndex - 1 + hand.length) % hand.length] : null;
  const next = hand.length > 1 ? hand[(keptIndex + 1) % hand.length] : null;

  return (
    <div className="app" data-view={view} data-mode={mode} data-big={resting ? '' : undefined} data-revealed={current ? '' : undefined}>
      {/* Top left: draw modes, or the way back */}
      <nav className="corner modes" aria-label="Draw mode">
        {view === 'deck' && (
          <>
            <button type="button" className="navlink" aria-pressed={mode === 'single'} onClick={() => changeMode('single')}>
              One card
            </button>
            <button type="button" className="navlink" aria-pressed={mode === 'triple'} onClick={() => changeMode('triple')}>
              Three cards
            </button>
          </>
        )}
        {view === 'hand' && (
          <button type="button" className="navlink navlink--back" onClick={goToDeck}>
            Back to the deck
          </button>
        )}
        {view === 'kept' && (
          <button type="button" className="navlink navlink--back" onClick={() => setView('hand')}>
            Back to your hand
          </button>
        )}
      </nav>

      <header className="masthead">
        <h1 className="wordmark">
          <button
            type="button"
            onClick={() => {
              if (busy) return;
              setCurrent(null);
              setView('deck');
            }}
          >
            Creative’s Sanctuary
          </button>
        </h1>
        {resting && <p className="tagline eyebrow">An oracle deck for people who make things</p>}
      </header>

      {/* Top right: suits, or where you are in your hand */}
      <nav className="corner suits" aria-label="Suit">
        {view === 'deck' && (
          <>
            <div className="suits__list">
              <button type="button" className="navlink" aria-pressed={filter === 'all'} onClick={() => chooseFilter('all')}>
                All suits
              </button>
              {elementOrder.map(id => (
                <button
                  key={id}
                  type="button"
                  className="navlink"
                  aria-pressed={filter === id}
                  data-element={id}
                  onClick={() => chooseFilter(id)}
                >
                  {elements[id].name}
                </button>
              ))}
            </div>
            <label className="suits__select">
              <span className="sr-only">Suit</span>
              <select value={filter} onChange={e => chooseFilter(e.target.value as ElementFilter)}>
                <option value="all">All suits</option>
                {elementOrder.map(id => (
                  <option key={id} value={id}>
                    {elements[id].name}
                  </option>
                ))}
              </select>
            </label>
          </>
        )}
        {view === 'kept' && <span className="eyebrow">Kept · {keptIndex + 1} of {hand.length}</span>}
      </nav>

      <main className="stage">
        {/* Resting: the deck waits, with the doodles around it */}
        {resting && (
          <div className="resting" ref={restingRef}>
            <Doodles
              onBreathe={() => {
                if (busy) return;
                track('breathing_opened');
                setView('intro');
              }} dark={dark} onLights={toggleLights} />
            <div className="deck-wrap">
              <p className="prompt">
                Go on, pick one.
                <svg className="prompt__arrow" viewBox="0 0 170 90" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M6 20 C40 78 100 82 156 46" />
                  <path d="M134 40 L158 45 L150 68" />
                </svg>
              </p>
              <svg className="swash" viewBox="0 0 640 720" aria-hidden="true">
                <path d="M120 170 C210 50 450 40 540 170 C620 290 610 500 510 610 C410 710 210 700 110 590 C20 490 40 270 120 170 Z" fill="#F6EC5E" />
              </svg>
              <Deck onDraw={drawSingle} label="Draw a card" deckRef={deckRef} />
            </div>
          </div>
        )}

        {/* Revealed: calm. Quote beside the card on wide screens, on the card on narrow ones. */}
        {view === 'deck' && mode === 'single' && current && (
          <div className="reveal" key={current.id}>
            <div className="reveal__text" ref={revealTextRef} data-element={current.element}>
              <p className="reveal__quote">{current.quote}</p>
              {/* Putting it back is the everyday move; keeping a card is the deliberate one. */}
              <div className="actions">
                <button type="button" className="pill" onClick={putBack}>
                  Put it back
                </button>
                {hand.length < HAND_LIMIT && !alreadyKept ? (
                  <button type="button" className="textlink" onClick={keepCurrent}>
                    Keep it in my hand
                  </button>
                ) : (
                  <span className="aside">{alreadyKept ? 'Already in your hand.' : 'Your hand is full.'}</span>
                )}
              </div>
            </div>
            <div className="reveal__card">
              <SuitSwash color={elements[current.element].pageColorHex} swashRef={swashRef} />
              <div
                className="card flip"
                ref={flipRef}
                role="button"
                tabIndex={0}
                aria-label="Put it back on the deck"
                onClick={putBack}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    putBack();
                  }
                }}
              >
              <div className="flip__inner" ref={flipInnerRef}>
                <div className="flip__face flip__face--back">
                  <CardBack />
                </div>
                <div className="flip__face flip__face--front">
                  <CardFront card={current} />
                </div>
              </div>
              </div>
            </div>
            <p className="sr-only" aria-live="polite">
              You drew {current.word}. {current.quote}
            </p>
          </div>
        )}

        {/* Three cards, landing one at a time where the deck sits */}
        {view === 'deck' && mode === 'triple' && (
          <div className="reading">
            <p className="reading__prompt">
              {reading.length === 0 && 'Three cards. Tap the deck.'}
              {reading.length === 1 && 'Two to go.'}
              {reading.length === 2 && 'Last one.'}
              {reading.length === 3 && 'There you are.'}
            </p>
            <div className="reading__slots">
              {SLOT_NAMES.map((name, i) => {
                const card = reading[i];
                return (
                  <div className="slot" key={name}>
                    <p className="eyebrow">{name}</p>
                    <div className="slot__card">
                      {card ? (
                        <div className="card flip" ref={el => { slotRefs.current[i] = el; }}>
                          <div className="flip__inner">
                            <div className="flip__face flip__face--back">
                              <CardBack />
                            </div>
                            <div className="flip__face flip__face--front">
                              <CardFront card={card} variant="image" />
                            </div>
                          </div>
                        </div>
                      ) : i === reading.length ? (
                        <Deck onDraw={drawTriple} label={`Draw card ${i + 1} of 3`} />
                      ) : (
                        <div className="slot__empty" />
                      )}
                    </div>
                    <p className="slot__quote" data-element={card?.element}>
                      {card?.quote}
                    </p>
                  </div>
                );
              })}
            </div>
            <div className="actions" style={{ visibility: reading.length === 3 ? 'visible' : 'hidden' }}>
              {/* As with one card: shuffling back is the everyday move, keeping is the deliberate one. */}
              <button type="button" className="pill" onClick={startOver}>
                Shuffle them back
              </button>
              {room > 0 ? (
                <button type="button" className="textlink" onClick={keepReading}>
                  {room >= 3 ? 'Keep all three in my hand' : `Keep the first ${NUMBER_WORDS[room].toLowerCase()} in my hand`}
                </button>
              ) : (
                <span className="aside">Your hand is full.</span>
              )}
            </div>
          </div>
        )}

        {/* Your hand */}
        {view === 'hand' && (
          <div className="hand">
            <h2 className="hand__title">Your hand</h2>
            <p className="hand__sub">
              {hand.length === 0 && 'Nothing kept yet. Be picky.'}
              {hand.length > 0 && hand.length < HAND_LIMIT && `${NUMBER_WORDS[hand.length]} kept. Room for ${NUMBER_WORDS[room].toLowerCase()} more. No pressure.`}
              {hand.length === HAND_LIMIT && 'Six kept. That’s a full hand.'}
            </p>
            <div className="hand__row">
              {Array.from({ length: HAND_LIMIT }, (_, i) => {
                const card = hand[i];
                return card ? (
                  <button
                    key={card.id}
                    type="button"
                    className="card card--mini mini"
                    style={{ '--tilt': `${[-2, 1.5, -1, 2, -1.5, 1][i]}deg` } as React.CSSProperties}
                    onClick={() => openKept(i)}
                    aria-label={`Read ${card.word} again`}
                  >
                    <CardFront card={card} variant="image" />
                  </button>
                ) : (
                  <div key={`empty-${i}`} className="slot__empty hand__empty">
                    {i === hand.length ? 'room here' : i === hand.length + 1 ? 'and here' : ''}
                  </div>
                );
              })}
            </div>
            {hand.length > 0 && <p className="eyebrow">Tap a card to read it again</p>}
            <div className="actions">
              <button type="button" className="pill" onClick={goToDeck}>
                {hand.length === 0 ? 'Draw a card' : 'Draw another'}
              </button>
              {hand.length > 0 && (
                <button type="button" className="textlink" onClick={() => setHand([])}>
                  Let them all go
                </button>
              )}
            </div>
          </div>
        )}

        {/* A kept card, opened: the full card, quote and all */}
        {view === 'kept' && keptCard && (
          <div className="kept" key={keptCard.id}>
            {prev ? (
              <button type="button" className="kept__nav kept__nav--prev" onClick={() => setKeptIndex(k => (k - 1 + hand.length) % hand.length)}>
                <svg viewBox="0 0 38 20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M36 10 C24 8 14 9 3 10 M11 2 L3 10 L11 18" />
                </svg>
                {prev.word}
              </button>
            ) : (
              <span />
            )}
            <div className="kept__center">
              <div className="reveal__card">
                <SuitSwash color={elements[keptCard.element].pageColorHex} />
                <div className="card">
                  <CardFront card={keptCard} />
                </div>
              </div>
              <div className="actions">
                <button type="button" className="textlink" onClick={letGo}>
                  Let it go
                </button>
              </div>
            </div>
            {next ? (
              <button type="button" className="kept__nav kept__nav--next" onClick={() => setKeptIndex(k => (k + 1) % hand.length)}>
                {next.word}
                <svg viewBox="0 0 38 20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M2 10 C14 8 24 9 35 10 M27 2 L35 10 L27 18" />
                </svg>
              </button>
            ) : (
              <span />
            )}
          </div>
        )}
      </main>

      {view === 'deck' && (
        <button type="button" className="handbtn" ref={handBtnRef} onClick={() => {
            if (busy) return;
            track('hand_opened', { hand_size: hand.length });
            setView('hand');
          }} key={hand.length}>
          {/* Little versions of the kept cards, so "Keep it" has somewhere visible to go. */}
          <span className="handbtn__cards" aria-hidden="true">
            {hand.length === 0 ? (
              <span className="handbtn__slot" />
            ) : (
              hand.map((c, i) => (
                <span
                  key={c.id}
                  className="handbtn__card"
                  style={{ background: elements[c.element].bgColorHex, '--tilt': `${(i % 2 ? 4 : -4) + i}deg` } as React.CSSProperties}
                >
                  <img src={`/art/${c.svgPath}`} alt="" />
                </span>
              ))
            )}
          </span>
          <span className="handbtn__label">{handLabel}</span>
        </button>
      )}

      <a className="credit" href="https://izgiuygur.com" target="_blank" rel="noopener" onClick={() => track('studio_link')}>
        by Izgi Uygur Studio
      </a>
    </div>
  );
}
