import { afterEach, vi } from "vitest";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

// Browser-only setup; skipped for node-environment tests (e.g. *.live.test.ts).
if (typeof window !== "undefined") {
  const { cleanup } = await import("@testing-library/react");
  afterEach(() => {
    cleanup();
    sessionStorage.clear();
  });

  // jsdom lacks these browser APIs, which framer-motion uses.
  class IntersectionObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  }
  Object.assign(globalThis, { IntersectionObserver: IntersectionObserverStub });

  if (!window.matchMedia) {
    window.matchMedia = (query: string) =>
      ({
        matches: false,
        media: query,
        onchange: null,
        addListener() {},
        removeListener() {},
        addEventListener() {},
        removeEventListener() {},
        dispatchEvent: () => false,
      }) as MediaQueryList;
  }
}
