export const chatbot = {
  name: "Mitali AI",
  subtitle: "Ask about Mitali's work",
  greeting:
    "Hi! I'm Mitali AI. I can answer questions about Mitali's experience, skills, projects and how to get in touch. What would you like to know?",
  placeholder: "Ask a question…",
  suggestedQuestions: [
    "Tell me about Mitali's experience.",
    "What is her educational background?",
    "What are her Java and Spring Boot skills?",
    "What GenAI projects has she built?",
    "How can I contact her?",
  ],
  /** Max characters per user message. */
  maxInputLength: 500,
} as const;
