import { useState, useRef } from "react";
import InputForm from "./components/InputForm";

function App() {
  const [status, setStatus] = useState("idle"); // idle | loading | error | success
  const [data, setData] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const abortControllerRef = useRef(null);

  const handleGenerate = async (input, mode) => {
    // Cancel any in-flight request before starting a new one
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

      // If this request was superseded by a newer one, bail out silently
      if (abortControllerRef.current !== controller) return;

      if (!res.ok) {
        setStatus("error");
        setErrorMsg("The AI service had a problem. Please try again.");
        return;
      }

      const json = await res.json();

      if (abortControllerRef.current !== controller) return;

      setData(json);
      setStatus("success");
    } catch (err) {
      if (err.name === "AbortError") return; // expected when superseded, ignore
      if (abortControllerRef.current !== controller) return;
      setStatus("error");
      setErrorMsg("Network error. Check your connection and try again.");
    }
  };

  return (
    <div className="app">
      <h1>Study Assistant</h1>
      <InputForm onSubmit={handleGenerate} loading={status === "loading"} />

      {status === "loading" && <p>Generating your study material...</p>}
      {status === "error" && (
        <div className="error-box">
          <p>{errorMsg}</p>
        </div>
      )}
      {status === "success" && data && (
        <pre>{JSON.stringify(data, null, 2)}</pre>
      )}
    </div>
  );
}

export default App;