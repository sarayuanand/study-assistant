# Study Assistant

An AI-powered study tool built with **React**, **Express**, and the **Groq API**. Users can paste notes or a topic and instantly generate either interactive flashcards or multiple-choice quizzes to help with revision.

---

## Features

- Generate AI-powered **Flashcards**
- Generate AI-powered **Multiple Choice Quizzes**
- Flip flashcards with mouse click or keyboard
- Quiz scoring with correct answers
- Retest only incorrectly answered questions
- Prevents stale API responses using `AbortController`
- Backend and frontend response validation
- Handles API failures and invalid AI responses gracefully
- Responsive design for desktop, tablet and mobile
- Dark mode
- Keyboard navigation
- Session saved using `localStorage` so progress survives page refresh

---

## Tech Stack

### Frontend
- React
- Vite
- CSS

### Backend
- Node.js
- Express
- Groq API

---

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd study-assistant
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create a `.env` file

Add your Groq API key:

```env
GROQ_API_KEY=your_api_key_here
```

### 4. Start the backend

```bash
npm run server
```

The backend runs on:

```
http://localhost:3001
```

### 5. Start the frontend

In a second terminal:

```bash
npm run dev
```

Open:

```
http://localhost:5173
```

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

## AI Usage

AI tools were used as a development assistant throughout this project.

Specifically, AI was used to:

- Generate the initial structure for React components
- Help scaffold the flashcard flip animation
- Suggest responsive CSS improvements
- Help implement backend error handling
- Suggest approaches for request cancellation using `AbortController`
- Assist with quiz and flashcard UI improvements
- Help debug React and Express issues during development

All generated code was reviewed, tested, modified, and integrated manually. The application logic, validation flow, testing, debugging, and final implementation decisions were completed by the developer.

---

## Error Handling

The application handles several failure scenarios, including:

- Empty user input
- Network failures
- Backend server errors
- AI provider errors
- Timeout handling
- Invalid JSON returned from the AI
- Incorrect response schema validation
- Prevention of stale responses from overwriting newer requests

---

## Accessibility

The application includes:

- Responsive layout for mobile, tablet, and desktop devices
- Interactive elements use semantic HTML where appropriate
- Flashcards can be flipped using the keyboard (Enter key)
- Users can navigate the page using standard browser scrolling

---

## Known Limitations

- AI output quality depends on the quality of the input notes.
- Very large inputs may take longer to generate responses.
- The number of generated flashcards or quiz questions is intentionally capped to keep the interface manageable.
- Full keyboard navigation through quizzes and flashcards (e.g., arrow keys for navigation or selecting quiz answers) has not been implemented. 
- Sessions are saved locally in the browser and are not synchronized across devices.
- The application currently supports only English prompts and responses.

---

## Time Spent

Approximately **10 hours** in total.

Estimated breakdown:

| Task | Time |
|------|------|
| Project setup and environment | 1 hour |
| Backend API integration | 2 hours |
| React frontend development | 2.5 hours |
| Flashcards and quiz functionality | 2 hours |
| Responsive design, dark mode, local storage, and keyboard navigation | 1.5 hours |
| Testing, debugging, and polishing | 1 hour |

**Total:** ~10 hours

---

## Future Improvements

Possible future enhancements include:

- User accounts
- Cloud synchronization
- Progress tracking
- Timed quizzes
- Difficulty selection
- Search through saved study sessions
- Export flashcards as PDF or CSV
- Spaced repetition scheduling

---

## Author 

Sarayu Anand Gongada    

---

Created project as part of a university placement selection.  
