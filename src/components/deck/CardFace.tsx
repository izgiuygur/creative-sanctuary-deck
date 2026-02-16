import type { OracleCard } from '../../types/card';
import { elements } from '../../data/elements';
import { getSvgContent } from '../../lib/svgRegistry';

interface CardFaceProps {
  card: OracleCard;
}

export default function CardFace({ card }: CardFaceProps) {
  const svgHtml = getSvgContent(card.svgPath);
  const elementMeta = elements[card.element];

  return (
    <div
      className="card-face card-face--front"
      data-element={card.element}
      style={{
        color: elementMeta.colorHex,
        '--element-bg': elementMeta.bgColorHex,
      } as React.CSSProperties}
    >
      <h2 className="card__title" style={{ color: elementMeta.colorHex }}>
        {card.word}
      </h2>

      <div
        className="card__illustration"
        style={{ color: elementMeta.colorHex }}
        dangerouslySetInnerHTML={{ __html: svgHtml }}
      />

      <p className="card__quote" style={{ color: elementMeta.colorHex }}>
        {card.quote}
      </p>

      <span className="card__element-label" style={{ color: elementMeta.colorHex }}>
        Creative's Sanctuary &middot; {elementMeta.name}
      </span>
    </div>
  );
}
