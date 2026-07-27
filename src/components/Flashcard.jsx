export default function Flashcard({ card, index, total, flipped, onFlip }) {
  return (
    <div className="flashcard-wrapper">
      <p className="progress">Card {index + 1} of {total}</p>
      <div
        className={`flashcard ${flipped ? "flipped" : ""}`}
        onClick={onFlip}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && onFlip()}
      >
        <div className="flashcard-face front">{card.front}</div>
        <div className="flashcard-face back">{card.back}</div>
      </div>
    </div>
  );
}
