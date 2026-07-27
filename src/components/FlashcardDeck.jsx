import { useState, useEffect, useCallback } from "react";
import Flashcard from "./Flashcard";

const INDEX_KEY = "studyAssistant.flashcardIndex";

export default function FlashcardDeck({ cards }) {
  const [index, setIndex] = useState(() => {
    try {
      const saved = Number(localStorage.getItem(INDEX_KEY));
      if (Number.isInteger(saved) && saved >= 0 && saved < cards.length) return saved;
    } catch {
      // non-fatal
    }
    return 0;
  });
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(INDEX_KEY, String(index));
    } catch {
      // non-fatal
    }
  }, [index]);

  const next = useCallback(() => {
    setIndex((i) => Math.min(i + 1, cards.length - 1));
    setFlipped(false);
  }, [cards.length]);

  const prev = useCallback(() => {
    setIndex((i) => Math.max(i - 1, 0));
    setFlipped(false);
  }, []);

  const flip = useCallback(() => {
    setFlipped((f) => !f);
  }, []);

  // Keyboard nav: ArrowRight/Left to move between cards, Space/Enter to flip
  useEffect(() => {
    const handler = (e) => {
      // Don't hijack arrow keys/space while the user is typing elsewhere
      const tag = document.activeElement?.tagName;
      if (tag === "TEXTAREA" || tag === "INPUT") return;

      if (e.key === "ArrowRight") {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
      } else if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        flip();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [next, prev, flip]);

  return (
    <div className="flashcard-deck">
      <Flashcard
        card={cards[index]}
        index={index}
        total={cards.length}
        flipped={flipped}
        onFlip={flip}
      />
      <div className="deck-nav">
        <button onClick={prev} disabled={index === 0}>← Prev</button>
        <button onClick={next} disabled={index === cards.length - 1}>Next →</button>
      </div>
      <p className="hint">Use ← → to navigate, Space to flip</p>
    </div>
  );
}
