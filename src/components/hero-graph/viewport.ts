/**
 * Breakpoints of the graph area itself (not the window), shared by the scene and the
 * CSS container queries in the overlay / panel. Keep them in sync with the `@` variants:
 *   COMPACT_WIDTH = 42rem → `@2xl:`   WIDE_WIDTH = 48rem → `@3xl:`
 */
export const COMPACT_WIDTH = 672;
export const WIDE_WIDTH = 768;

/** Horizontal space the side panel takes on wide layouts (panel width + gaps), in px. */
export const PANEL_SPACE = 360;
/** Share of the height the bottom sheet takes on narrow layouts (matches max-h-[56%]). */
export const SHEET_FRACTION = 0.56;

/** Window width (Tailwind `xl`) at which the fixed carousel side arrows appear, and the room they need. */
export const XL_WINDOW = 1280;
export const SIDE_ARROW_SPACE = 64;
