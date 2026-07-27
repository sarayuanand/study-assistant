import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const SYSTEM_PROMPT = `
You are a study content generator.

Generate study material based on the user's topic or notes.

The user will request either "quiz" or "flashcards".

For flashcards, return exactly this shape:

{
  "type": "flashcards",
  "topic": "string",
  "cards": [
    {
      "id": "c1",
      "front": "string",
      "back": "string"
    }
  ]
}

For quizzes, return exactly this shape:

{
  "type": "quiz",
  "topic": "string",
  "questions": [
    {
      "id": "q1",
      "question": "string",
      "options": [
        "string",
        "string",
        "string",
        "string"
      ],
      "correctIndex": 0,
      "explanation": "string"
    }
  ]
}

Rules:
- Generate 5-8 cards or questions.
- Each id must be unique.
- Flashcard ids should be c1, c2, c3, etc.
- Quiz ids should be q1, q2, q3, etc.
- Quiz options must contain exactly 4 strings.
- correctIndex must be a number from 0 to 3.
- Return ONLY valid JSON.
- Do not return markdown.
- Do not use code fences.
- Do not include any text before or after the JSON.
`;

app.post("/api/generate", async (req, res) => {
  const { input, mode } = req.body;

  // Validate input
  if (!input || typeof input !== "string" || !input.trim()) {
    return res.status(400).json({
      error: "Missing or empty input",
    });
  }

  // Only allow the two supported modes
  const selectedMode =
    mode === "flashcards" || mode === "quiz"
      ? mode
      : "quiz";

  try {
    const groqResponse = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY?.trim()}`,
        },

        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",

          messages: [
            {
              role: "system",
              content: SYSTEM_PROMPT,
            },
            {
              role: "user",
              content: `Mode: ${selectedMode}

Content:
${input}`,
            },
          ],

          response_format: {
            type: "json_object",
          },
        }),
      }
    );

    // Handle Groq errors
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

    // Get the model's response text
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return res.status(502).json({
        error: "Empty response from AI provider",
      });
    }

    // Parse the JSON returned by Groq
    let parsedContent;

    try {
      parsedContent = JSON.parse(content);
    } catch (error) {
      console.error("Invalid JSON returned by AI:", content);

      return res.status(502).json({
        error: "AI returned invalid JSON",
      });
    }

    // Return the parsed JSON object to the frontend
    res.json(parsedContent);
  } catch (error) {
    console.error("Server error:", error);

    res.status(500).json({
      error: "Internal server error",
    });
  }
});

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});