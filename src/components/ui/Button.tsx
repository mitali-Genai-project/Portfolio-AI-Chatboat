import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary";

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition duration-200 disabled:pointer-events-none disabled:opacity-60";

const variants: Record<Variant, string> = {
  primary: "bg-accent text-accent-fg hover:brightness-110 hover:shadow-lg hover:shadow-accent/20",
  secondary: "border border-line bg-surface text-fg hover:border-accent/60 hover:text-accent",
};

const buttonClass = (variant: Variant = "primary", className = "") =>
  `${base} ${variants[variant]} ${className}`;

export function ButtonLink({
  variant,
  className,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { variant?: Variant }) {
  return <a className={buttonClass(variant, className)} {...props} />;
}

export function Button({
  variant,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button className={buttonClass(variant, className)} {...props} />;
}
