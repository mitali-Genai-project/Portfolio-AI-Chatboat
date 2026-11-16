import type { ExperienceItem } from "./types";

// Source: Mitali_Verma_Resume_JavaFullstack.pdf. Most recent first.
export const experience: ExperienceItem[] = [
  {
    role: "Consultant",
    company: "TalentCafe Solutions",
    client: "Pay10 Global",
    period: "May 2026 — Oct 2026",
    location: "Dubai, UAE",
    points: [
      "Contributed to the development and enhancement of a Risk Intelligence System, focusing on R&D, customer screening workflows and UI-driven functionality for risk assessment and intelligence analysis.",
      "Developed UI functionality for customer database screening and table creation, letting users configure and manage screening-related data through an intuitive interface.",
      "Developed and enhanced application modules using Angular, Java and Spring Boot, integrating REST APIs and supporting end-to-end functionality across the platform.",
      "Resolved UI bugs and functional issues, improving usability and stability while collaborating with frontend and backend teams.",
    ],
    stack: ["Angular", "Java", "Spring Boot", "REST APIs"],
  },
  {
    role: "Full Stack Developer",
    company: "Amal Infosystems Pvt Limited",
    client: "ICICI Bank",
    period: "Sep 2025 — Jan 2026",
    location: "Hyderabad, India",
    points: [
      "Designed microservices with Spring Boot for enterprise applications.",
      "Optimized REST API performance and backend service integrations, improving API response time by 35%.",
      "Built high-performance REST APIs with validation and centralized exception handling, using Redis caching to reduce database load.",
      "Delivered full stack features across React front ends and Spring Boot services within Agile sprint cycles.",
      "Resolved production issues and improved stability through debugging and performance tuning.",
    ],
    stack: ["Java", "Spring Boot", "Microservices", "React", "Redis"],
  },
  {
    role: "Senior Systems Engineer",
    company: "Infosys Limited",
    client: "Mastercard · One Bank Mortgage",
    period: "Apr 2022 — Aug 2025",
    location: "Bangalore, India",
    points: [
      "Developed RESTful microservices using Spring Boot.",
      "Integrated 15+ REST APIs with Fetch and managed global state with Redux Toolkit.",
      "Mastercard: built secure microservice authentication with Spring Security and OAuth, and CRUD operations on MySQL through Spring Boot and JPA (Hibernate).",
      "Mastercard: achieved 90% code coverage with JUnit and Mockito.",
      "One Bank Mortgage: built a Kafka-based event-driven architecture for asynchronous service communication, and synchronized data between SQL databases and MongoDB for migration.",
      "Executed Jenkins CI/CD pipelines, supported AWS deployments across environments, and ran JMeter load tests to find performance bottlenecks.",
      "Conducted peer code reviews and collaborated in Agile teams on sprint planning and estimation.",
    ],
    stack: ["Java", "Spring Boot", "Spring Security", "Kafka", "MySQL", "Redux Toolkit", "JUnit", "Jenkins", "AWS"],
  },
];
