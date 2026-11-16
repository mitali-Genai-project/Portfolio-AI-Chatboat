import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
}

export function Card({ children, className = "", interactive = false }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-line bg-surface p-6 transition duration-300 ${
        interactive ? "hover:-translate-y-1 hover:border-accent/50 hover:shadow-lg hover:shadow-accent/5" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
