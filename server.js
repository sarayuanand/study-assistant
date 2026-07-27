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

The user will request either "quiz" or "flashcards", and will tell you a target count of items to generate based on how much content they provided. Generate approximately that many cards or questions — one per distinct concept, fact, or idea in the content. Do not default to a fixed small number regardless of input length.

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
- Generate between 5 and 20 cards or questions, based on the target count given.
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

function validateStudyContent(data) {
  if (data.type !== "quiz" && data.type !== "flashcards") {
    return false;
  }

  if (typeof data.topic !== "string" || !data.topic.trim()) {
    return false;
  }

  if (data.type === "flashcards") {
    if (
      !Array.isArray(data.cards) ||
      data.cards.length < 5 ||
      data.cards.length > 20
    ) {
      return false;
    }

    return data.cards.every((card) => {
      return (
        typeof card.id === "string" &&
        card.id.trim() &&
        typeof card.front === "string" &&
        card.front.trim() &&
        typeof card.back === "string" &&
        card.back.trim()
      );
    });
  }

  if (data.type === "quiz") {
    if (
      !Array.isArray(data.questions) ||
      data.questions.length < 5 ||
      data.questions.length > 20
    ) {
      return false;
    }

    return data.questions.every((question) => {
      return (
        typeof question.id === "string" &&
        question.id.trim() &&
        typeof question.question === "string" &&
        question.question.trim() &&
        Array.isArray(question.options) &&
        question.options.length === 4 &&
        question.options.every(
          (option) => typeof option === "string" && option.trim()
        ) &&
        Number.isInteger(question.correctIndex) &&
        question.correctIndex >= 0 &&
        question.correctIndex <= 3 &&
        typeof question.explanation === "string" &&
        question.explanation.trim()
      );
    });
  }

  return false;
}

app.post("/api/generate", async (req, res) => {
  const { input, mode } = req.body;

  // Validate input
  if (!input || typeof input !== "string" || !input.trim()) {
    return res.status(400).json({
      error: "Missing or empty input",
    });
  }

  // Only allow the two supported modes
  const selectedMode = mode === "flashcards" || mode === "quiz" ? mode : "quiz";

  // Scale target item count based on input length
  const wordCount = input.trim().split(/\s+/).length;
  const targetCount =
    wordCount > 300 ? 20 :
    wordCount > 150 ? 15 :
    wordCount > 60 ? 10 : 6;

  try {
    // Create a timeout controller
    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, 20000);

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
Target count: approximately ${targetCount} items

Content:
${input}`,
            },
          ],

          response_format: {
            type: "json_object",
          },
        }),

        // Abort the request if it takes longer than 20 seconds
        signal: controller.signal,
      }
    );

    // Clear the timeout if the request finishes normally
    clearTimeout(timeout);

    // Handle Groq errors
    if (!groqResponse.ok) {
      const errBody = await groqResponse.text();
      console.error("Groq API error:", groqResponse.status, errBody);

      return res.status(502).json({
        error: "AI provider returned an error. Please try again.",
      });
    }

    const data = await groqResponse.json();

    // Get the model's response text
    const content = data.choices?.[0]?.message?.content;

    // Handle empty responses
    if (!content || !content.trim()) {
      return res.status(502).json({
        error: "AI provider returned an empty response.",
      });
    }

    // Parse the JSON returned by Groq
    let parsedContent;

    try {
      parsedContent = JSON.parse(content);
    } catch (error) {
      console.error("Invalid JSON returned by AI:", content);

      return res.status(502).json({
        error: "AI returned invalid JSON.",
      });
    }

    if (!validateStudyContent(parsedContent)) {
      console.error("AI returned invalid study content:", parsedContent);

      return res.status(502).json({
        error: "AI returned invalid study content.",
      });
    }

    // Return the parsed JSON object to the frontend
    res.json(parsedContent);
  } catch (error) {
    // Handle timeout
    if (error.name === "AbortError") {
      return res.status(504).json({
        error: "The AI took too long to respond. Please try again.",
      });
    }

    console.error("Server error:", error);

    res.status(500).json({
      error: "Internal server error. Please try again.",
    });
  }
});

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
