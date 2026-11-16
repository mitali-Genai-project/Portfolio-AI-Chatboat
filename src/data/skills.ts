import { Cloud, Database, FlaskConical, Monitor, Server, Workflow } from "lucide-react";
import type { SkillGroup } from "./types";

export const skillGroups: SkillGroup[] = [
  {
    title: "Backend",
    icon: Server,
    skills: ["Java", "Spring Boot", "Spring Security", "Microservices"],
  },
  {
    title: "Frontend",
    icon: Monitor,
    skills: ["React", "Angular"],
  },
  {
    title: "Messaging & Caching",
    icon: Workflow,
    skills: ["Apache Kafka", "Redis"],
  },
  {
    title: "Databases",
    icon: Database,
    skills: ["MySQL", "PostgreSQL"],
  },
  {
    title: "Cloud & DevOps",
    icon: Cloud,
    skills: ["AWS", "Docker", "Kubernetes", "Jenkins"],
  },
  {
    title: "Testing",
    icon: FlaskConical,
    skills: ["JUnit", "Mockito"],
  },
];
