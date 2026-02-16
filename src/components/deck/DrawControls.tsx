interface DrawControlsProps {
  onDrawAgain: () => void;
  onReturn: () => void;
  disabled: boolean;
}

export default function DrawControls({ onDrawAgain, onReturn, disabled }: DrawControlsProps) {
  return (
    <div className="draw-controls">
      <button
        className="draw-controls__btn draw-controls__btn--primary"
        onClick={onDrawAgain}
        disabled={disabled}
      >
        Draw Again
      </button>
      <button
        className="draw-controls__btn draw-controls__btn--secondary"
        onClick={onReturn}
        disabled={disabled}
      >
        Return Card
      </button>
    </div>
  );
}
