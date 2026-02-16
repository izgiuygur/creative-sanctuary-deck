import { forwardRef } from 'react';

interface DeckStackProps {
  onClick: () => void;
}

const DeckStack = forwardRef<HTMLDivElement, DeckStackProps>(({ onClick }, ref) => {
  return (
    <div className="deck-stack" ref={ref} onClick={onClick} role="button" tabIndex={0} aria-label="Draw a card from the deck" onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); }}>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="deck-stack__card">
          {i === 1 && (
            <div className="card-back-design">
              <div className="card-back-design__ornament" />
              <div className="card-back-design__logo">
                Creative's<br />Sanctuary
              </div>
              <div className="card-back-design__ornament" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
});

DeckStack.displayName = 'DeckStack';

export default DeckStack;
