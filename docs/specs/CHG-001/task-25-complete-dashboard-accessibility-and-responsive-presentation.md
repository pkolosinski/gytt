# Task 25: Complete Dashboard accessibility and responsive presentation

**Status:** pending

**Depends on:** Task 17

**Description:** Complete Dashboard-specific accessible and responsive presentation after empty and populated Dashboard summaries are implemented. Meet the Dashboard keyboard, focus, semantic structure, labels, announcements, contrast, zoom, and phone/desktop containment requirements. Automated coverage remains at Vitest/Testing Library; real-browser and viewport checks remain operator acceptance. Do not move Tasks- or Habits-specific accessibility work out of Task 21.

Implementation subtasks:

1. [ ] Refine the Dashboard presentation with mock data to complete headings, landmarks, semantics, accessible names, status announcements, and phone/desktop containment.
2. [ ] Obtain UI acceptance for the Dashboard accessibility and responsive presentation before finalizing its component assertions.
3. [ ] Verify summary cards and independent retry controls are accessible by keyboard, with visible focus and appropriate focus behavior.
4. [ ] Add Testing Library assertions for Dashboard accessibility, containment, focus, and supported responsive layouts.
5. [ ] Extend the operator checklist for Dashboard use across supported browsers, phone width, contrast, keyboard use, and 200% zoom.

**Acceptance Criteria:**

- Scenario "Use Dashboard at supported responsive sizes" is represented in component assertions and the real-browser operator checklist.
- The Dashboard page shell does not overflow horizontally and all card content/actions remain available at supported sizes and 200% zoom.
- Dashboard summary cards and retry actions meet the specified keyboard, focus, semantic, and contrast requirements.
- Tasks- and Habits-specific responsive and accessibility behavior remains owned by Task 21.
