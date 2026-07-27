import "./App.css";
import { useState, useRef } from "react";
import InputForm from "./components/InputForm";
import FlashcardDeck from "./components/FlashcardDeck";
import Quiz from "./components/Quiz";
import { validateResponse } from "./utils/validateResponse";

function App() {
  const [status, setStatus] = useState("idle"); // idle | loading | error | success
  const [data, setData] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const abortControllerRef = useRef(null);
  const lastRequestRef = useRef(null);

  // Quiz-specific state, lives here so retest can force a clean remount
  const [activeQuestions, setActiveQuestions] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [round, setRound] = useState(0);

  const handleGenerate = async (input, mode) => {
    lastRequestRef.current = [input, mode];

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("http://localhost:3001/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input, mode }),
        signal: controller.signal,
      });

      if (abortControllerRef.current !== controller) return;

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        setStatus("error");
        setErrorMsg(errJson?.error || "The AI service had a problem. Please try again.");
        return;
      }

      const json = await res.json();
      console.log("Raw response from backend:", json);

      if (abortControllerRef.current !== controller) return;

      const result = validateResponse(json);

      if (!result.valid) {
        setStatus("error");
        setErrorMsg(result.error);
        return;
      }

      setData(result.data);
      setStatus("success");

      if (result.data.type === "quiz") {
        setActiveQuestions(result.data.questions);
        setAnswers({});
        setSubmitted(false);
        setRound(0);
      }
    } catch (err) {
      if (err.name === "AbortError") return;
      if (abortControllerRef.current !== controller) return;
      setStatus("error");
      setErrorMsg("Network error. Check your connection and try again.");
    }
  };

  const handleRetry = () => {
    if (lastRequestRef.current) {
      handleGenerate(...lastRequestRef.current);
    }
  };

  const handleQuizFinish = (wrongOnes) => {
    setActiveQuestions(wrongOnes);
    setAnswers({});
    setSubmitted(false);
    setRound((r) => r + 1);
  };

  return (
    <div className="app">
      <h1>Study Assistant</h1>
      <InputForm onSubmit={handleGenerate} loading={status === "loading"} />

      {status === "loading" && <p>Generating your study material...</p>}

      {status === "error" && (
        <div className="error-box">
          <p>{errorMsg}</p>
          <button onClick={handleRetry}>Retry</button>
        </div>
      )}

      {status === "success" && data?.type === "flashcards" && (
        <FlashcardDeck cards={data.cards} />
      )}

      {status === "success" && data?.type === "quiz" && activeQuestions && (
        <Quiz
          key={round}
          questions={activeQuestions}
          answers={answers}
          setAnswers={setAnswers}
          submitted={submitted}
          onSubmit={() => setSubmitted(true)}
          onFinish={handleQuizFinish}
        />
      )}
    </div>
  );
}

export default App;
