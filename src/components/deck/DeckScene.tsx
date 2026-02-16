import { useRef, useState, useCallback, useEffect } from 'react';
import gsap from 'gsap';
import type { OracleCard, ElementFilter, DrawMode, Phase } from '../../types/card';
import { elements, elementOrder } from '../../data/elements';
import { getRandomCard } from '../../data/cards';
import { createDrawTimeline, createReturnTimeline, createSaveTimeline } from '../../lib/animations';
import CardFace from './CardFace';
import CardBack from './CardBack';
import SavedCards from './SavedCards';
import IntroScreen from '../intro/IntroScreen';

export default function DeckScene() {
  const [phase, setPhase] = useState<Phase>('intro');
  const [currentCard, setCurrentCard] = useState<OracleCard | null>(null);
  const [filter, setFilter] = useState<ElementFilter>('all');
  const [drawMode, setDrawMode] = useState<DrawMode>('single');
  const [drawnHistory, setDrawnHistory] = useState<string[]>([]);
  const [savedCards, setSavedCards] = useState<OracleCard[]>([]);
  const [tripleCount, setTripleCount] = useState(0);
  const [modalCard, setModalCard] = useState<OracleCard | null>(null);

  // Close modal on Escape
  useEffect(() => {
    if (!modalCard) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setModalCard(null);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [modalCard]);

  const deckStackRef = useRef<HTMLDivElement>(null);
  const cardContainerRef = useRef<HTMLDivElement>(null);
  const cardInnerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const appLayoutRef = useRef<HTMLDivElement>(null);
  const hasCompletedIntro = useRef(false);

  // Handle intro completion — transition to deck
  const handleIntroComplete = useCallback(() => {
    hasCompletedIntro.current = true;
    setPhase('idle');
  }, []);

  // Fade in app layout after intro completes
  useEffect(() => {
    if (phase === 'idle' && hasCompletedIntro.current && appLayoutRef.current) {
      gsap.fromTo(appLayoutRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.6, ease: 'power2.out' }
      );
      hasCompletedIntro.current = false;
    }
  }, [phase]);

  // Draw a card from the deck
  const drawCard = useCallback(() => {
    if (phase !== 'idle') return;

    // In triple mode, max 3 draws per session
    if (drawMode === 'triple' && tripleCount >= 3) return;

    let card = getRandomCard(filter, drawnHistory);
    if (!card) {
      card = getRandomCard(filter, []);
      if (!card) return;
      setDrawnHistory([card.id]);
    } else {
      setDrawnHistory(prev => [...prev, card!.id]);
    }

    setCurrentCard(card);
    setPhase('drawing');
  }, [phase, filter, drawnHistory, drawMode, tripleCount]);

  // Animate the draw after card mounts in DOM
  useEffect(() => {
    if (phase !== 'drawing' || !currentCard) return;

    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const deck = deckStackRef.current;
        const container = cardContainerRef.current;
        const inner = cardInnerRef.current;
        if (!deck || !container || !inner) {
          setPhase('revealed');
          return;
        }

        timelineRef.current?.kill();
        gsap.set(container, { y: 0, scale: 1, opacity: 0 });
        gsap.set(inner, { rotateY: 0 });

        const tl = createDrawTimeline(
          { deckStack: deck, cardContainer: container, cardInner: inner },
          () => {}
        );
        tl.eventCallback('onComplete', () => setPhase('revealed'));
        timelineRef.current = tl;
        tl.play();
      });
    });

    return () => cancelAnimationFrame(raf);
  }, [phase, currentCard]);

  // Save card — animate directly to saved panel (no flip back)
  const handleSave = useCallback(() => {
    if (phase !== 'revealed' || !currentCard) return;
    if (savedCards.length >= 6) return;

    const cardToSave = currentCard;

    setPhase('returning');
    const deck = deckStackRef.current;
    const container = cardContainerRef.current;
    const inner = cardInnerRef.current;
    if (!deck || !container || !inner) {
      setSavedCards(prev => [...prev, cardToSave]);
      setCurrentCard(null);
      setPhase('idle');
      return;
    }

    timelineRef.current?.kill();
    const tl = createSaveTimeline(
      { deckStack: deck, cardContainer: container, cardInner: inner }
    );
    tl.eventCallback('onComplete', () => {
      setSavedCards(prev => [...prev, cardToSave]);
      setCurrentCard(null);
      setPhase('idle');
    });
    timelineRef.current = tl;
    tl.play();
  }, [phase, currentCard, savedCards.length]);

  // Return to deck without saving (single mode)
  const handleReturnToDeck = useCallback(() => {
    if (phase !== 'revealed') return;

    setPhase('returning');
    const deck = deckStackRef.current;
    const container = cardContainerRef.current;
    const inner = cardInnerRef.current;
    if (!deck || !container || !inner) {
      setCurrentCard(null);
      setPhase('idle');
      return;
    }

    timelineRef.current?.kill();
    const tl = createReturnTimeline(
      { deckStack: deck, cardContainer: container, cardInner: inner },
      () => {}
    );
    tl.eventCallback('onComplete', () => {
      setCurrentCard(null);
      setPhase('idle');
    });
    timelineRef.current = tl;
    tl.play();
  }, [phase]);

  // Continue drawing in triple mode (save current with fly animation, draw next)
  const handleTripleContinue = useCallback(() => {
    if (phase !== 'revealed' || !currentCard) return;

    const cardToSave = currentCard;
    const newCount = tripleCount + 1;

    setPhase('returning');
    const deck = deckStackRef.current;
    const container = cardContainerRef.current;
    const inner = cardInnerRef.current;
    if (!deck || !container || !inner) {
      setSavedCards(prev => [...prev, cardToSave]);
      setTripleCount(newCount);
      setCurrentCard(null);
      setPhase('idle');
      return;
    }

    timelineRef.current?.kill();
    const tl = createSaveTimeline(
      { deckStack: deck, cardContainer: container, cardInner: inner }
    );
    tl.eventCallback('onComplete', () => {
      setSavedCards(prev => [...prev, cardToSave]);
      setTripleCount(newCount);
      setCurrentCard(null);
      setPhase('idle');
    });
    timelineRef.current = tl;
    tl.play();
  }, [phase, currentCard, tripleCount]);

  // Triple mode: no auto-draw — user clicks deck to draw each card

  // Start new reading (clear saved cards, reset to default)
  const handleNewReading = useCallback(() => {
    setSavedCards([]);
    setTripleCount(0);
    setCurrentCard(null);
    setDrawnHistory([]);
    setDrawMode('single');
    setFilter('all');
    setPhase('idle');
    // Reset deck visuals
    if (deckStackRef.current) {
      gsap.set(deckStackRef.current, { opacity: 1, scale: 1 });
    }
    // Reset card container position if lingering
    if (cardContainerRef.current) {
      gsap.set(cardContainerRef.current, { x: 0, y: 0, scale: 1, opacity: 0 });
    }
  }, []);

  // Switch draw mode
  const handleModeChange = useCallback((mode: DrawMode) => {
    if (phase !== 'idle' && phase !== 'revealed') return;
    // Reset everything first
    setSavedCards([]);
    setTripleCount(0);
    setCurrentCard(null);
    setDrawnHistory([]);
    setDrawMode(mode);
    setPhase('idle');
    if (deckStackRef.current) {
      gsap.set(deckStackRef.current, { opacity: 1, scale: 1 });
    }
    if (cardContainerRef.current) {
      gsap.set(cardContainerRef.current, { x: 0, y: 0, scale: 1, opacity: 0 });
    }
  }, [phase]);

  // Determine what action buttons to show
  const tripleComplete = drawMode === 'triple' && tripleCount >= 3;
  const canSave = drawMode === 'single' && savedCards.length < 6;

  if (phase === 'intro') {
    return <IntroScreen onComplete={handleIntroComplete} />;
  }

  return (
    <div className="app-layout" ref={appLayoutRef}>
      {/* LEFT SIDEBAR */}
      <aside className="sidebar sidebar--left">
        <div className="sidebar__header" onClick={handleNewReading} role="button" tabIndex={0}>
          <h1 className="sidebar__title">Creative's<br />Sanctuary</h1>
          <p className="sidebar__subtitle">An online card deck for creatives on their creation journey for cosmic guidance and trust</p>
        </div>

        <nav className="sidebar__nav">
          {/* Draw Mode */}
          <div className="sidebar__section">
            <button
              className={`sidebar__link${drawMode === 'single' ? ' sidebar__link--active' : ''}`}
              onClick={() => handleModeChange('single')}
            >
              Single Draw
            </button>
            <div className="sidebar__divider" />
            <button
              className={`sidebar__link${drawMode === 'triple' ? ' sidebar__link--active' : ''}`}
              onClick={() => handleModeChange('triple')}
            >
              Three Card Draw
            </button>
          </div>

          <div className="sidebar__divider sidebar__divider--wide" />

          {/* Element Filter */}
          <div className="sidebar__section">
            <button
              className={`sidebar__link${filter === 'all' ? ' sidebar__link--active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All Elements
            </button>
            {elementOrder.map(id => (
              <div key={id}>
                <div className="sidebar__divider" />
                <button
                  className={`sidebar__link sidebar__link--element`}
                  data-element={id}
                  style={filter === id ? { color: elements[id].colorHex, opacity: 1 } : undefined}
                  onClick={() => setFilter(id)}
                >
                  {elements[id].name}
                </button>
              </div>
            ))}
          </div>
        </nav>
      </aside>

      {/* CENTER: DECK */}
      <main className="deck-center">
        <div className="deck-center__prompt">
          {phase === 'idle' && !tripleComplete && drawMode === 'single' && 'Draw a card for guidance'}
          {phase === 'idle' && !tripleComplete && drawMode === 'triple' && (
            tripleCount === 0
              ? 'Draw your first card'
              : `Draw card ${tripleCount + 1} of 3`
          )}
          {phase === 'drawing' && '...'}
          {phase === 'revealed' && drawMode === 'single' && (
            <button className="deck-center__return-link" onClick={handleReturnToDeck}>
              Return to deck
            </button>
          )}
          {phase === 'revealed' && drawMode === 'triple' && tripleCount < 3 && (
            <button className="deck-center__return-link" onClick={handleTripleContinue}>
              Add to reading
            </button>
          )}
          {phase === 'returning' && '...'}
          {tripleComplete && phase === 'idle' && (
            <button className="deck-center__return-link" onClick={handleNewReading}>
              New Reading
            </button>
          )}
        </div>

        <div className="deck-scene__draw-area">
          {/* Deck stack */}
          <div
            className="deck-stack"
            ref={deckStackRef}
            onClick={drawCard}
            role="button"
            tabIndex={0}
            aria-label="Draw a card"
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') drawCard(); }}
          >
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="deck-stack__card">
                {i === 1 && (
                  <div className="card-back-design">
                    <div className="card-back-design__ornament" />
                    <div className="card-back-design__logo">Creative's<br />Sanctuary</div>
                    <div className="card-back-design__ornament" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Drawn card (animated) */}
          {currentCard && (
            <div
              className="deck-scene__card-container card"
              ref={cardContainerRef}
              data-element={currentCard.element}
              style={{ opacity: 0 }}
              data-clickable={phase === 'revealed' ? '' : undefined}
              onClick={() => {
                if (phase !== 'revealed') return;
                if (drawMode === 'single') {
                  handleReturnToDeck();
                } else if (drawMode === 'triple' && tripleCount < 3) {
                  handleTripleContinue();
                }
              }}
            >
              <div className="card-inner" ref={cardInnerRef}>
                <CardBack />
                <CardFace card={currentCard} />
              </div>
              {phase === 'revealed' && drawMode === 'single' && canSave && (
                <button className="card-hover-add" onClick={(e) => { e.stopPropagation(); handleSave(); }}>
                  + Add
                </button>
              )}
            </div>
          )}
        </div>

        {/* Action buttons — only for edge cases */}
        <div className="deck-center__actions">
          {drawMode === 'single' && savedCards.length >= 6 && phase === 'idle' && (
            <button className="action-btn action-btn--secondary" onClick={handleNewReading}>
              Clear &amp; Start Over
            </button>
          )}
        </div>
      </main>

      {/* RIGHT SIDEBAR: saved cards */}
      <aside className="sidebar sidebar--right">
        <SavedCards
          cards={savedCards}
          drawMode={drawMode}
          onClear={handleNewReading}
          onCardClick={setModalCard}
        />
      </aside>

      {/* Card detail modal */}
      {modalCard && (
        <div
          className="card-modal-overlay"
          onClick={() => setModalCard(null)}
          role="dialog"
          aria-label={`Card: ${modalCard.word}`}
        >
          <div
            className="card-modal__card card"
            data-element={modalCard.element}
            onClick={e => e.stopPropagation()}
          >
            <div className="card-inner">
              <CardFace card={modalCard} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
