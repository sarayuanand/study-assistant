import { useState } from "react";

export default function Flashcard({ card, index, total }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className="flashcard-wrapper">
      <p className="progress">Card {index + 1} of {total}</p>
      <div
        className={`flashcard ${flipped ? "flipped" : ""}`}
        onClick={() => setFlipped((f) => !f)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && setFlipped((f) => !f)}
      >
        <div className="flashcard-face front">
          <span className="face-text">{card.front}</span>
        </div>
        <div className="flashcard-face back">
          <span className="face-text">{card.back}</span>
        </div>
      </div>
      <p className="hint">Click to flip</p>
    </div>
  );
}
