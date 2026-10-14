import type { CSSProperties } from 'react';
import type { OracleCard } from '../../types/card';
import { elements } from '../../data/elements';
import { getSvgContent } from '../../lib/svgRegistry';

export function cardColors(card: OracleCard): CSSProperties {
  const meta = elements[card.element];
  return { '--card-ink': meta.colorHex, '--card-bg': meta.bgColorHex } as CSSProperties;
}

interface CardFrontProps {
  card: OracleCard;
  /** "image" drops the quote, for layouts that set it beside or beneath the card. */
  variant?: 'full' | 'image';
}

export function CardFront({ card, variant = 'full' }: CardFrontProps) {
  const meta = elements[card.element];
  return (
    <div className={`card-front card-front--${variant}`} style={cardColors(card)}>
      <h2 className="card-front__title">{card.word}</h2>
      {card.svgPath.endsWith('.svg') ? (
        <div className="card-front__art" aria-hidden="true" dangerouslySetInnerHTML={{ __html: getSvgContent(card.svgPath) }} />
      ) : (
        // The v2 drawings are the approved images themselves, with the paper made transparent.
        <div className="card-front__art" aria-hidden="true">
          <img src={`/art/${card.svgPath}`} alt="" loading="lazy" decoding="async" draggable={false} />
        </div>
      )}
      {variant === 'full' && <p className="card-front__quote">{card.quote}</p>}
      <span className="card-front__spine" aria-hidden="true">
        Creative’s Sanctuary · <span>{meta.name}</span>
      </span>
    </div>
  );
}

export function CardBack() {
  return (
    <div className="card-back" aria-hidden="true">
      <svg viewBox="0 0 280 508" fill="none" stroke="#F7F3EA" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="1" width="278" height="506" rx="10" />
        <path d="M60 254 C90 214 190 214 220 254 C190 294 90 294 60 254 Z" />
        <circle cx="140" cy="254" r="22" />
        <circle cx="140" cy="254" r="7" fill="#F7F3EA" />
        <path d="M140 196 V176 M104 204 L94 187 M176 204 L186 187 M76 222 L60 210 M204 222 L220 210" />
        <path d="M140 312 V332 M104 304 L94 321 M176 304 L186 321" />
        <path d="M140 70 C143 92 154 103 176 106 C154 109 143 120 140 142 C137 120 126 109 104 106 C126 103 137 92 140 70 Z" fill="#F7F3EA" />
        <path d="M140 366 C143 388 154 399 176 402 C154 405 143 416 140 438 C137 416 126 405 104 402 C126 399 137 388 140 366 Z" fill="#F7F3EA" />
        <path d="M52 96 C54 106 58 110 68 112 C58 114 54 118 52 128 C50 118 46 114 36 112 C46 110 50 106 52 96 Z" />
        <path d="M228 380 C230 390 234 394 244 396 C234 398 230 402 228 412 C226 402 222 398 212 396 C222 394 226 390 228 380 Z" />
        <path d="M226 84 C212 88 206 102 212 114 C218 124 232 126 240 118 C228 118 220 106 226 84 Z" fill="#F7F3EA" />
        <path d="M54 424 C40 420 34 406 40 394 C46 384 60 382 68 390 C56 390 48 402 54 424 Z" fill="#F7F3EA" />
        <circle cx="72" cy="170" r="3" />
        <circle cx="208" cy="338" r="3" />
      </svg>
    </div>
  );
}

/** The face-down deck: a tilted stack you tap to draw. */
export function Deck({ onDraw, label, deckRef }: { onDraw: () => void; label: string; deckRef?: React.Ref<HTMLButtonElement> }) {
  return (
    <button type="button" className="deck" onClick={onDraw} aria-label={label} ref={deckRef}>
      <span className="deck__under" />
      <span className="card deck__top">
        <CardBack />
      </span>
    </button>
  );
}
