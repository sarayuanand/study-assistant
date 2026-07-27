import { useState } from "react";
import Flashcard from "./Flashcard";

export default function FlashcardDeck({ cards }) {
  const [index, setIndex] = useState(0);

  const next = () => setIndex((i) => Math.min(i + 1, cards.length - 1));
  const prev = () => setIndex((i) => Math.max(i - 1, 0));

  return (
    <div className="flashcard-deck">
      <Flashcard
  key={cards[index].id}
  card={cards[index]}
  index={index}
  total={cards.length}
/>
      <div className="deck-nav">
        <button onClick={prev} disabled={index === 0}>← Prev</button>
        <button onClick={next} disabled={index === cards.length - 1}>Next →</button>
      </div>
    </div>
  );
}