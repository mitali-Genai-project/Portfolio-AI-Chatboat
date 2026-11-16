import type { Profile } from "./types";

// Source: Mitali_Verma_Resume_JavaFullstack.pdf
export const profile: Profile = {
  name: "Mitali Verma",
  title: "Java Full Stack Developer",
  tagline:
    "I build scalable enterprise applications with Java, Spring Boot and microservices, with front ends in React and Angular — and independent GenAI projects on the side.",
  location: "India",
  email: "v.mitali19@gmail.com",
  yearsOfExperience: "4+",
  about: [
    "I'm a Java Full Stack Developer with 4+ years of experience building scalable enterprise applications using Java, Spring Boot, Spring Security, microservices and REST APIs, with front ends in React and Angular.",
    "I've delivered work for clients including Mastercard, ICICI Bank and Pay10 Global — across Kafka event-driven systems, Redis caching, MySQL databases and CI/CD with Jenkins, Docker and AWS, in Agile teams.",
    "Outside of client work, I build independent GenAI projects, such as an AI document assistant that answers questions about uploaded PDF and Word files using retrieval-augmented generation.",
  ],
  highlights: [
    { value: "4+", label: "Years of professional experience" },
    { value: "35%", label: "Faster API response time (Amal Infosystems)" },
    { value: "90%", label: "Code coverage with JUnit & Mockito (Mastercard)" },
  ],
  githubUsername: "mitali-Genai-project",
  resumeUrl: "/resume.pdf",
  resumeFileName: "Mitali_Verma_Resume_JavaFullstack.pdf",
  socials: [
    { label: "GitHub", href: "https://github.com/mitali-Genai-project", kind: "github" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/mitali-verma-615916204", kind: "linkedin" },
    { label: "Email", href: "mailto:v.mitali19@gmail.com", kind: "email" },
  ],
};
