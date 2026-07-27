export function validateResponse(data) {
  if (!data || typeof data !== "object") {
    return {
      valid: false,
      error: "Unexpected response format. Please try again.",
    };
  }

  if (data.type === "flashcards") {
    if (
      !Array.isArray(data.cards) ||
      data.cards.length === 0
    ) {
      return {
        valid: false,
        error:
          "No flashcards were generated. Try a different topic.",
      };
    }

    const validCards = data.cards.filter(
      (card) =>
        card &&
        typeof card.id === "string" &&
        card.id.trim() &&
        typeof card.front === "string" &&
        card.front.trim() &&
        typeof card.back === "string" &&
        card.back.trim()
    );

    if (validCards.length === 0) {
      return {
        valid: false,
        error:
          "The flashcards were malformed. Please try again.",
      };
    }

    return {
      valid: true,
      data: {
        ...data,
        cards: validCards,
      },
    };
  }

  if (data.type === "quiz") {
    if (
      !Array.isArray(data.questions) ||
      data.questions.length === 0
    ) {
      return {
        valid: false,
        error:
          "No quiz questions were generated. Try a different topic.",
      };
    }

    const validQuestions = data.questions.filter(
      (question) =>
        question &&
        typeof question.id === "string" &&
        question.id.trim() &&
        typeof question.question === "string" &&
        question.question.trim() &&
        Array.isArray(question.options) &&
        question.options.length === 4 &&
        question.options.every(
          (option) =>
            typeof option === "string" &&
            option.trim()
        ) &&
        Number.isInteger(question.correctIndex) &&
        question.correctIndex >= 0 &&
        question.correctIndex < 4 &&
        typeof question.explanation === "string" &&
        question.explanation.trim()
    );

    if (validQuestions.length === 0) {
      return {
        valid: false,
        error:
          "The quiz questions were malformed. Please try again.",
      };
    }

    return {
      valid: true,
      data: {
        ...data,
        questions: validQuestions,
      },
    };
  }

  return {
    valid: false,
    error:
      "Unrecognized response type. Please try again.",
  };
}