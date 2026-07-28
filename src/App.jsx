import "./App.css";
import { useState, useRef, useEffect } from "react";
import InputForm from "./components/InputForm";
import FlashcardDeck from "./components/FlashcardDeck";
import Quiz from "./components/Quiz";
import { validateResponse } from "./utils/validateResponse";

const SESSION_KEY = "studyAssistant.session";
const THEME_KEY = "studyAssistant.theme";

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

  // Theme state, defaults to system preference if nothing saved yet
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved === "light" || saved === "dark") return saved;
    } catch {
      // localStorage unavailable, fall through to system preference
    }
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  // Restore a saved session on first mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SESSION_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.data) {
          setData(parsed.data);
          setStatus("success");
          if (parsed.data.type === "quiz") {
            setActiveQuestions(parsed.activeQuestions ?? parsed.data.questions);
            setAnswers(parsed.answers ?? {});
            setSubmitted(parsed.submitted ?? false);
            setRound(parsed.round ?? 0);
          }
        }
      }
    } catch {
      // Corrupt or missing saved session — just start fresh
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist session whenever the relevant state changes
  useEffect(() => {
    if (status !== "success" || !data) return;
    try {
      localStorage.setItem(
        SESSION_KEY,
        JSON.stringify({ data, activeQuestions, answers, submitted, round })
      );
    } catch {
      // Storage full or unavailable — non-fatal, just skip persistence
    }
  }, [status, data, activeQuestions, answers, submitted, round]);

  // Apply + persist theme
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // non-fatal
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  };

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
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/generate`, {
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

  const handleNewSession = () => {
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch {
      // non-fatal
    }
    setData(null);
    setStatus("idle");
    setActiveQuestions(null);
    setAnswers({});
    setSubmitted(false);
    setRound(0);
  };

  return (
    <div className="app">
      <div className="app-header">
        <h1>Study Assistant</h1>
        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
        </button>
      </div>

      {status === "success" && data && (
        <div className="session-controls">
          <button onClick={handleNewSession}>Start new session</button>
        </div>
      )}

      <InputForm onSubmit={handleGenerate} loading={status === "loading"} />

      {status === "loading" && (
        <div className="loading">
          <div className="spinner" />
          <p>Generating your study material...</p>
        </div>
      )}

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
