import type { OracleCard, DrawMode } from '../../types/card';
import { elements } from '../../data/elements';
import { getSvgContent } from '../../lib/svgRegistry';

interface SavedCardsProps {
  cards: OracleCard[];
  drawMode: DrawMode;
  onClear: () => void;
  onCardClick: (card: OracleCard) => void;
}

export default function SavedCards({ cards, drawMode, onClear, onCardClick }: SavedCardsProps) {
  if (cards.length === 0) {
    return (
      <div className="saved-cards saved-cards--empty">
        <p className="saved-cards__hint">
          {drawMode === 'single'
            ? 'Saved cards appear here'
            : 'Your reading will appear here'}
        </p>
      </div>
    );
  }

  return (
    <div className="saved-cards">
      <div className="saved-cards__grid">
        {cards.map((card, i) => {
          const meta = elements[card.element];
          const svgHtml = getSvgContent(card.svgPath);
          return (
            <div
              key={card.id + '-' + i}
              className="saved-card"
              data-element={card.element}
              style={{ '--saved-color': meta.colorHex, '--saved-bg': meta.bgColorHex } as React.CSSProperties}
              onClick={() => onCardClick(card)}
              role="button"
              tabIndex={0}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onCardClick(card); }}
            >
              <div
                className="saved-card__illustration"
                dangerouslySetInnerHTML={{ __html: svgHtml }}
              />
              <p className="saved-card__word">{card.word}</p>
              <p className="saved-card__element">{meta.name}</p>
            </div>
          );
        })}
      </div>

      {cards.length > 0 && (
        <button className="saved-cards__clear" onClick={onClear}>
          Clear All
        </button>
      )}
    </div>
  );
}
