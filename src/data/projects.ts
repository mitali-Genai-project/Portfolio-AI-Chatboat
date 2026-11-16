import type { Project } from "./types";

export const projects: Project[] = [
  {
    title: "Clearlist",
    description: "AI-assisted financial crime screening platform.",
    // TODO: add the tech stack and a repo/live link once you want them public.
    stack: [],
    category: "AI",
  },
  {
    // Features listed here are the ones present in the repo's source code.
    title: "AI Document Assistant",
    description:
      "Upload PDF or Word documents and ask questions about them in natural language. Documents are parsed, split into chunks and embedded with OpenAI; answers are generated from the most relevant chunks and streamed to the browser in real time. The vector store is switchable between pgvector and Pinecone.",
    stack: ["Java", "Spring Boot", "LangChain4j", "OpenAI API", "pgvector", "Pinecone", "React", "Docker"],
    category: "GenAI",
    repoUrl: "https://github.com/mitali-Genai-project/ai-doc-assistant",
  },
];
