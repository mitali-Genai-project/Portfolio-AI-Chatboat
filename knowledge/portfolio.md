# Mitali Verma — Portfolio Knowledge Base

This file is the only source of facts for the QueryMe chatbot. Everything here is
verified against Mitali's resume, her public GitHub repositories, or her own
statements. Keep it in sync with `src/data/` when the portfolio changes.

## Profile

- Name: Mitali Verma
- Title: Java Full Stack Developer
- Professional experience: 4+ years (since April 2022)
- Location: India
- Summary: Builds scalable enterprise applications using Java, Spring Boot, Spring
  Security, microservices and REST APIs, with front ends in React and Angular.
  Experienced with Kafka event-driven systems, Redis caching, MySQL, and CI/CD with
  Jenkins, Docker and AWS in Agile teams.
- Generative AI: Mitali builds GenAI projects independently, outside her client work.
  She has no professional (employer or client) GenAI experience on record.

## Contact

- Email: v.mitali19@gmail.com
- Phone / WhatsApp: +91 73183 38652 (message on WhatsApp: https://wa.me/917318338652)
- LinkedIn: https://www.linkedin.com/in/mitali-verma-615916204
- GitHub: https://github.com/mitali-Genai-project
- The website also has a contact form and a resume download.

## Technical skills

- Backend: Java, Spring Boot, Spring Security, Microservices
- Frontend: React, Angular
- Messaging & caching: Apache Kafka, Redis
- Databases: MySQL, PostgreSQL
- Cloud & DevOps: AWS, Docker, Kubernetes, Jenkins
- Testing: JUnit, Mockito

## Professional experience (most recent first)

### Consultant — TalentCafe Solutions (client: Pay10 Global)
- Period: May 2026 – Oct 2026
- Location: Dubai, UAE
- Contributed to the development and enhancement of a Risk Intelligence System,
  focusing on R&D, customer screening workflows and UI-driven functionality for risk
  assessment and intelligence analysis.
- Developed UI functionality for customer database screening and table creation,
  letting users configure and manage screening-related data.
- Developed and enhanced application modules using Angular, Java and Spring Boot,
  integrating REST APIs and supporting end-to-end functionality.
- Resolved UI bugs and functional issues, improving usability and stability with
  frontend and backend teams.

### Full Stack Developer — Amal Infosystems Pvt Limited (client: ICICI Bank)
- Period: Sep 2025 – Jan 2026
- Location: Hyderabad, India
- Designed microservices with Spring Boot for enterprise applications.
- Optimized REST API performance and backend service integrations, improving API
  response time by 35%.
- Built high-performance REST APIs with validation and centralized exception handling,
  using Redis caching to reduce database load and improve response time.
- Created responsive React components with API integration across multiple modules.
- Delivered full stack features across React and Spring Boot within Agile sprints.
- Resolved production issues through debugging and performance tuning.

### Senior Systems Engineer — Infosys Limited (clients: Mastercard, One Bank Mortgage)
- Period: Apr 2022 – Aug 2025
- Location: Bangalore, India
- Developed RESTful microservices using Spring Boot.
- Integrated 15+ REST APIs with Fetch and managed global state with Redux Toolkit.
- Executed Jenkins CI/CD pipelines and supported AWS deployments across environments.
- Conducted peer code reviews and collaborated in Agile teams on sprint planning and
  estimation; optimized performance through refactoring.
- Mastercard: managed MySQL databases with CRUD operations through Spring Boot and JPA
  (Hibernate); developed secure microservice authentication with Spring Security and
  OAuth; achieved 90% code coverage with JUnit and Mockito.
- One Bank Mortgage: synchronized data between SQL databases and MongoDB for a banking
  data migration; built a Kafka-based event-driven architecture for asynchronous
  service communication; ran JMeter load tests to find performance bottlenecks.

## Projects

### AI Document Assistant (independent GenAI project)
- Repository: https://github.com/mitali-Genai-project/ai-doc-assistant
- Users upload PDF or Word (DOCX) documents and ask questions about them in natural
  language (retrieval-augmented generation).
- Ingestion: documents are parsed (Apache PDFBox / Apache POI), split into overlapping
  chunks, embedded with an OpenAI embedding model, and stored in a vector store.
- The vector store is configurable: pgvector (PostgreSQL) or Pinecone.
- Querying: the question is embedded, the most similar chunks for that document and
  user are retrieved, and an OpenAI chat model answers using only that context.
- Answers stream to the browser in real time via Server-Sent Events.
- Frontend: React upload and chat pages. Packaged with Docker / Docker Compose.
- Tech: Java, Spring Boot, LangChain4j, OpenAI API, pgvector, Pinecone, React, Docker.

### This portfolio website
- Built with React, TypeScript, Vite, Tailwind CSS and Framer Motion.
- Shows live GitHub repositories and includes this AI assistant (QueryMe).

## Education

- Bachelor of Technology in Information Technology — Institute of Technology, Guru
  Ghasidas Central University, Chhattisgarh, India (Aug 2017 – Aug 2021), 7.7/10 CGPA.

## Certifications and awards

- AWS Certified Cloud Practitioner — valid June 2023 to June 2026.
- Insta Award — Infosys Limited, for contributions to project innovation.
