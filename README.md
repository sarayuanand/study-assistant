# Study Assistant

An AI-powered study tool built with **React**, **Express**, and the **Groq API**. Paste your notes or a topic, and instantly generate interactive flashcards or a multiple-choice quiz to help with revision.

---

## Live Demo

- **Frontend:** https://study-assistant-rose-nu.vercel.app/
- **Backend:** https://study-assistant-backend-65cc.onrender.com

> Note: the backend is hosted on Render's free tier, which spins down after periods of inactivity. The first request after idle time may take 30–50 seconds to respond while the server wakes up.

---

## Features

- Generate AI-powered **flashcards** or **multiple-choice quizzes** from free-form notes or a topic
- Flip flashcards by clicking or pressing Enter
- Navigate between flashcards using keyboard arrow keys, plus basic arrow-key page scrolling elsewhere
- Quiz scoring with correct-answer reveal and explanations
- **Retest mode** — re-quiz on only the questions you got wrong, as many rounds as needed
- Session progress saved to `localStorage`, so a page refresh doesn't lose your current flashcards/quiz
- Dark mode toggle
- Prevents stale API responses from overwriting newer ones, using `AbortController`
- Backend **and** frontend validation of AI output — malformed or incomplete responses are caught and filtered rather than crashing the UI
- Graceful handling of empty input, network failures, timeouts, and invalid AI responses, with a Retry option
- Responsive layout for desktop, tablet, and mobile

---

## Tech Stack

**Frontend:** React (hooks, functional components), Vite, CSS
**Backend:** Node.js, Express
**AI Provider:** Groq API (`llama-3.3-70b-versatile`, JSON mode)

---

## Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd study-assistant
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment variables

Create a `.env` file in the project root:

```env
GROQ_API_KEY=your_groq_api_key_here
VITE_API_URL=http://localhost:3001
```

Get a free Groq API key at [console.groq.com/keys](https://console.groq.com/keys).

### 4. Run the backend

```bash
npm run server
```
Runs on `http://localhost:3001`.

### 5. Run the frontend

In a second terminal:

```bash
npm run dev
```
Open the printed local URL (typically `http://localhost:5173`).

---

## Usage

1. Paste notes or type a topic into the text box.
2. Choose **Quiz** or **Flashcards**.
3. Click **Generate**.
4. **Flashcards:** click (or press Enter on) a card to flip it; use Next/Prev to move through the deck.
5. **Quiz:** select an answer for each question, then Submit to see your score and explanations. If you got any wrong, click **Retest** to try just those questions again — repeatable until you get them all right.

---

## Project Structure

```
study-assistant/
│
├── src/
│   ├── components/
│   │   ├── Flashcard.jsx
│   │   ├── FlashcardDeck.jsx
│   │   ├── InputForm.jsx
│   │   └── Quiz.jsx
│   │
│   ├── utils/
│   │   └── validateResponse.js
│   │
│   ├── App.jsx
│   └── App.css
│
├── server.js
├── package.json
└── README.md
```

---

## How AI Output Becomes UI

This app deliberately avoids a chatbot interface. The backend prompts Groq (using JSON mode) to return one of two fixed shapes:

```json
{ "type": "flashcards", "topic": "string", "cards": [{ "id": "c1", "front": "string", "back": "string" }] }
```
```json
{ "type": "quiz", "topic": "string", "questions": [{ "id": "q1", "question": "string", "options": ["a","b","c","d"], "correctIndex": 0, "explanation": "string" }] }
```

The backend parses and validates this shape before ever sending it to the frontend; the frontend re-checks it and filters out any individual malformed cards/questions rather than rejecting an otherwise-good batch. Only validated, structured data reaches React state, which then renders it as interactive flashcards or a scored quiz.

---

## Error Handling

- Empty or missing input is blocked client-side before a request is sent
- Network failures and backend downtime show a clear error with a **Retry** button
- A 20-second timeout on the Groq call prevents indefinite hangs
- Malformed or non-JSON AI output is caught, logged server-side, and surfaced as a friendly error rather than crashing the app
- Responses that don't match the expected schema (wrong types, missing fields, out-of-range values) are rejected or filtered at both the backend and frontend
- In-flight requests are cancelled via `AbortController` whenever a newer request is made, so a slow, stale response can never overwrite a fresher one on screen

---

## Deployment

- **Frontend** is deployed on Vercel, built via `npm run build` (output: `dist`).
- **Backend** is deployed on Render as a Node web service running `node server.js`.
- `GROQ_API_KEY` is stored as a server-side environment variable on Render and is never exposed to the browser.
- The frontend calls the backend through the `VITE_API_URL` environment variable — pointing at `http://localhost:3001` locally, and the Render URL in production.

---

## AI Usage

AI tools (ChatGPT and Claude) were used throughout development as coding assistants. Specifically, they were used to:

- Scaffold the initial structure of React components
- Help build the flashcard flip animation and dark mode styling
- Debug backend issues (stale API keys, CORS, git history containing a leaked secret)
- Suggest the `AbortController` pattern for cancelling stale requests
- Help design and refine the JSON schema and system prompt for structured AI output
- Assist with error-handling logic on both frontend and backend

All AI-suggested code was reviewed, tested, and adapted by hand. Debugging real issues that came up during development (a leaked API key needing rotation and git history cleanup, a stale server process holding an old key, prop-mismatch bugs breaking quiz retest, missing CSS causing invisible UI states) was done by manually inspecting logs, browser DevTools, and server output — not by blindly accepting AI output.

---

## Known Limitations

- AI output quality depends on the quality/specificity of the input notes
- Very short input (e.g. a single word) can produce shallow or generic questions
- Full keyboard navigation is partial — flashcards support arrow-key navigation and Enter-to-flip, but quiz answers can't yet be selected via keyboard (mouse/tap only)
- Sessions are saved to `localStorage` only, so they don't sync across devices or browsers
- The Groq free tier has a request-per-minute limit; rapid consecutive generations may occasionally be rate-limited
- Render's free tier spins down when idle, causing a slow first response after inactivity
- Only English input/output has been tested

---

## Time Spent

Approximately **11 hours** in total.

| Task | Time |
|------|------|
| Project setup and environment | 1 hr |
| Backend API integration (Groq, structured output, error handling) | 2 hrs |
| React frontend (form, state, wiring to backend) | 1.5 hrs |
| Flashcards and quiz UI (flip, scoring, retest) | 2 hrs |
| Failure handling and validation (frontend + backend) | 2 hrs |
| Dark mode, keyboard navigation, responsive design, localStorage | 1 hr |
| Debugging (git secret leak, stale key, retest bug, missing CSS) | 2 hrs |
| Deployment and README | 0.5 hr |
| **Total** | **~12 hrs** |

---

## Future Improvements

- User accounts and cloud sync
- Progress tracking across sessions
- Timed quizzes and difficulty selection
- Full keyboard navigation for quiz answers
- Export flashcards as PDF or CSV
- Spaced repetition scheduling

---

## Author

Sarayu Anand Gongada

*Created as part of a university placement selection process.*