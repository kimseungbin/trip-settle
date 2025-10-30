# Design Philosophy

Beyond technical architecture, this project demonstrates **product-focused engineering decisions** that balance user needs with implementation complexity.

## Table of Contents

- [Design Requirements](#design-requirements)
- [Keyboard-First Accessibility](#keyboard-first-accessibility)
- [Mobile-First Responsive Design](#mobile-first-responsive-design)
- [Performance as Feature](#performance-as-feature)
- [Clear Visual Feedback](#clear-visual-feedback)

## Design Requirements

All features in this project must meet the following standards:

- **Keyboard accessible**: Every interaction must work without a mouse (Enter/Escape/Arrow keys for navigation and actions)
- **ARIA compliant**: Proper semantic HTML and screen reader support for accessibility
- **Mobile-first responsive**: Designs start with mobile viewports and progressively enhance for desktop
- **Fast interactions**: Sub-second page loads and instant user feedback
- **Visual feedback**: Clear, immediate response for every user action

These requirements ensure the application is accessible, performant, and provides an excellent user experience across all devices and interaction modes. The sections below explain the engineering rationale behind each decision.

## Keyboard-First Accessibility

**Decision**: All interactive features must work without a mouse.

**Engineering rationale**:

- **Accessibility requirement**: WCAG 2.1 compliance mandates keyboard navigation
- **Testability**: Keyboard interactions are easier to automate in E2E tests than mouse hover states
- **Mobile translation**: Touch gestures map more naturally to keyboard patterns than mouse events
- **Reduced complexity**: Single interaction model (keyboard) vs. dual models (keyboard + mouse)

**Implementation details**:

- Forms submit with Enter, clear with Escape (standard browser behavior)
- Tab navigation follows document flow (no custom tab index manipulation)
- Arrow keys for list navigation (minimal JavaScript, uses native focus management)
- Focus indicators styled with `:focus-visible` (only visible for keyboard users)

**Trade-off**: Requires more upfront planning of interaction patterns, but pays dividends in reduced edge cases.

## Mobile-First Responsive Design

**Decision**: Design for mobile viewport first, enhance for desktop.

**Engineering rationale**:

- **CSS simplicity**: Base styles are mobile styles; media queries only add complexity, never override
- **Performance constraint**: Mobile-first forces minimal DOM and CSS from the start
- **Testing priority**: Mobile viewports tested first (most users), desktop becomes the edge case
- **Progressive enhancement**: Features gracefully degrade on older/slower devices

**Implementation details**:

- Vite dev server tests mobile viewport by default
- Playwright tests run on mobile viewports first (iPhone, Pixel)
- CSS uses `min-width` media queries (never `max-width`)
- Touch targets sized for fingers (44×44px minimum)

**Trade-off**: Desktop-specific features (hover states, larger layouts) require explicit opt-in via media queries.

## Performance as Feature

**Decision**: Sub-second page loads and instant interactions.

**Engineering rationale**:

- **User retention metric**: Every 100ms delay reduces conversions by 1%
- **Accessibility requirement**: Fast response critical for cognitive disabilities
- **Technical constraint**: Vite HMR already provides instant feedback in development
- **Competitive advantage**: Speed differentiates commodity applications

**Implementation details**:

- Vite code splitting generates separate chunks per route
- Svelte compiles to vanilla JavaScript (no runtime framework overhead)
- pg-mem eliminates database round-trip latency in development
- Docker layer caching keeps CI feedback under 8 minutes

**Metrics**:

- Lighthouse performance score: 95+ (target)
- First Contentful Paint: < 1.5s
- Time to Interactive: < 2.5s
- Backend API response time: < 100ms (local development)

## Clear Visual Feedback

**Decision**: Every user action has immediate visual response.

**Engineering rationale**:

- **State management**: User needs confirmation that state changed
- **Error prevention**: Visual cues prevent accidental duplicate submissions
- **Debugging**: Clear UI states make bug reports more actionable
- **Trust building**: Responsive UI feels reliable, not broken

**Implementation details**:

- Button disabled states during async operations (prevents double-submit)
- Toast notifications for success/error feedback
- Loading spinners for operations > 200ms
- Form validation shows errors on blur (not on every keystroke)

**Trade-off**: More UI states to design and test, but drastically reduces "did it work?" support tickets.
