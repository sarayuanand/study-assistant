export default function Quiz({ questions, answers, setAnswers, submitted, onSubmit, onFinish }) {
  const selectAnswer = (qId, optionIndex) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qId]: optionIndex }));
  };

  const score = questions.filter((q) => answers[q.id] === q.correctIndex).length;
  const wrongQuestions = questions.filter((q) => answers[q.id] !== q.correctIndex);

  return (
    <div className="quiz">
      {questions.map((q, i) => (
        <div key={q.id} className="quiz-question">
          <p className="question-text">{i + 1}. {q.question}</p>
          <div className="options">
            {q.options.map((opt, optIndex) => {
              const isSelected = answers[q.id] === optIndex;
              const isCorrect = optIndex === q.correctIndex;
              let className = "option";
              if (!submitted && isSelected) className += " selected";
              if (submitted && isSelected && isCorrect) className += " correct";
              if (submitted && isSelected && !isCorrect) className += " incorrect";
              if (submitted && !isSelected && isCorrect) className += " reveal-correct";

              return (
                <button
                  key={optIndex}
                  className={className}
                  onClick={() => selectAnswer(q.id, optIndex)}
                  disabled={submitted}
                >
                  {opt}
                </button>
              );
            })}
          </div>
          {submitted && <p className="explanation">{q.explanation}</p>}
        </div>
      ))}

      {!submitted ? (
        <button
          className="submit-btn"
          onClick={onSubmit}
          disabled={Object.keys(answers).length < questions.length}
        >
          Submit Quiz
        </button>
      ) : (
        <div className="quiz-results">
          <p>Score: {score} / {questions.length}</p>
          {wrongQuestions.length > 0 && (
            <button onClick={() => onFinish(wrongQuestions)}>
              Retest {wrongQuestions.length} wrong answer{wrongQuestions.length > 1 ? "s" : ""}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
