import { useRef, useState } from "react";
import InputForm from "./components/InputForm";
import { validateResponse } from "./utils/validateResponse";

function App() {
  const [status, setStatus] = useState("idle");
  const [data, setData] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const abortControllerRef = useRef(null);
  const lastRequestRef = useRef(null);

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
      const response = await fetch(
        "http://localhost:3001/api/generate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            input,
            mode,
          }),
          signal: controller.signal,
        }
      );

      if (abortControllerRef.current !== controller) {
        return;
      }

      if (!response.ok) {
        let message =
          "The AI service had a problem. Please try again.";

        try {
          const errorData = await response.json();

          if (errorData.error) {
            message = errorData.error;
          }
        } catch {
          // Keep the default message
        }

        setStatus("error");
        setErrorMsg(message);
        return;
      }

      const json = await response.json();

      if (abortControllerRef.current !== controller) {
        return;
      }

      const result = validateResponse(json);

      if (!result.valid) {
        setStatus("error");
        setErrorMsg(result.error);
        return;
      }

      setData(result.data);
      setStatus("success");
    } catch (error) {
      if (error.name === "AbortError") {
        return;
      }

      if (abortControllerRef.current !== controller) {
        return;
      }

      setStatus("error");
      setErrorMsg(
        "Network error. Check your connection and try again."
      );
    }
  };

  return (
    <div className="app">
      <h1>Study Assistant</h1>

      <InputForm
        onSubmit={handleGenerate}
        loading={status === "loading"}
      />

      {status === "loading" && (
        <p>Generating your study material...</p>
      )}

      {status === "error" && (
        <div className="error-box">
          <p>{errorMsg}</p>

          <button
            onClick={() => {
              if (lastRequestRef.current) {
                handleGenerate(
                  lastRequestRef.current[0],
                  lastRequestRef.current[1]
                );
              }
            }}
          >
            Retry
          </button>
        </div>
      )}

      {status === "success" && data && (
        <pre>
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}

export default App;
