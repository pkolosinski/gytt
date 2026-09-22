# Task 21: Complete accessible and responsive frontend behavior

**Status:** pending

**Depends on:** Task 16, Task 17, Task 18

**Description:** Meet the specified keyboard, focus, semantics, labels/errors, announcements, contrast, non-color progress, zoom, phone Tasks board, Dashboard layout, and responsive Habit details behavior. Automated coverage remains at Vitest/Testing Library; real-browser and viewport checks remain operator acceptance. Complete semantic structure and CSS containment, snap-aligned horizontal Task columns, focus return for modal/panel surfaces, visible focus, status announcements, field associations, keyboard Completed section, route-selected panel/full-page rendering, and non-color-only states. Extend the operator checklist for supported browsers, phone width, and 200% zoom without adding Playwright or another browser suite.

**Acceptance Criteria:**

- Scenarios "Use Dashboard at supported responsive sizes", "Use the Tasks board on a phone", and "Open responsive Habit details" are represented in component assertions and the real-browser operator checklist.
- Scenario "Move a Task without dragging" remains green with focus and announcement assertions.
- Modal and panel focus returns to the originating trigger/card.
- The page shell does not overflow horizontally; only the bounded Tasks board region scrolls.
- Keyboard use and 200% zoom retain all controls and information.
