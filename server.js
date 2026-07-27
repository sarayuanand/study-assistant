import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.post("/api/generate", async (req, res) => {
  const { input } = req.body;

  if (!input || typeof input !== "string" || !input.trim()) {
    return res.status(400).json({
      error: "Missing or empty input",
    });
  }

  try {
    const groqResponse = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "user",
              content: input,
            },
          ],
        }),
      }
    );

    if (!groqResponse.ok) {
  const errText = await groqResponse.text();

  console.error(
    "Groq API error:",
    groqResponse.status,
    errText
  );

  return res.status(502).json({
    error: "AI provider error",
    status: groqResponse.status,
  });
}
    const data = await groqResponse.json();

    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return res.status(502).json({
        error: "Empty response from AI provider",
      });
    }

    res.json({
      raw: content,
    });
  } catch (err) {
    console.error("Server error:", err);

    res.status(500).json({
      error: "Internal server error",
    });
  }
});

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});