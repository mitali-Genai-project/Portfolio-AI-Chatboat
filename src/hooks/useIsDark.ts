import { useSyncExternalStore } from "react";

/** Read-only view of the `dark` class on <html> (set by ThemeToggle), kept in sync via a MutationObserver. */
const subscribe = (onChange: () => void) => {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
};

const getSnapshot = () => document.documentElement.classList.contains("dark");

export function useIsDark() {
  return useSyncExternalStore(subscribe, getSnapshot, () => true);
}
