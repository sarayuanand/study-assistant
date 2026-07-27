import { useState } from "react";

export default function InputForm({ onSubmit, loading }) {
  const [text, setText] = useState("");
  const [mode, setMode] = useState("quiz");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!text.trim()) return;

    onSubmit(text, mode);
  };

  return (
    <form onSubmit={handleSubmit} className="input-form">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste your notes or a topic..."
        rows={6}
      />

      <div className="mode-toggle">
        <label>
          <input
            type="radio"
            checked={mode === "quiz"}
            onChange={() => setMode("quiz")}
          />
          Quiz
        </label>

        <label>
          <input
            type="radio"
            checked={mode === "flashcards"}
            onChange={() => setMode("flashcards")}
          />
          Flashcards
        </label>
      </div>

      <button
        type="submit"
        disabled={!text.trim()}
      >
        {loading ? "Generate Again" : "Generate"}
      </button>
    </form>
  );
}