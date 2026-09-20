# High-Level Engineering Design Craft Guidelines

This project strictly adheres to professional design engineering standards (Linear, Vercel, Stripe, Raycast, GitHub). The interface must NEVER appear "AI-generated" or amateurish.

## 1. Eliminate AI-Generated Clichés
- **NO floating blurry gradient orbs** (`blur-3xl`, `bg-purple-600/20 rounded-full`) behind text or cards.
- **NO playful handwriting fonts** (`Caveat`, `Comic Sans`) on technical dashboards.
- **NO vague motivational platitudes** ("A better you is in progress", "Small steps. Big future."). Replace with concrete status, actionable milestones, and telemetry.
- **NO bloated drop shadows** (`shadow-2xl`). Use multi-layered subtle borders with micro-shadows:
  `border border-slate-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.04)]` or `shadow-2xs`.
- **NO low-density cards** with massive empty whitespace and trivial information.

## 2. Information Density & Layout Architecture
- **4px / 8px Grid Rhythm**: All margins, paddings, and gaps must follow the standard modular scale (`gap-1.5`, `gap-2`, `gap-3`, `gap-4`, `p-4`, `p-5`, `p-6`).
- **Semantic Typography Hierarchy**:
  - Display / Title: Tight tracking (`tracking-tight`), bold or extrabold, crisp contrast (`text-slate-900` or `text-white`).
  - Section Overlines: Uppercase, small, tracked out (`text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400`).
  - Body Text: `text-xs` or `text-sm`, high contrast (`text-slate-600` or `text-slate-700`), readable line height (`leading-relaxed`).
  - Technical Data / Codes / Versions: Monospace font (`font-mono text-[11px] text-slate-500`).
- **Progressive Disclosure**: Show high-signal summaries upfront; reveal granular detail via tabs, drawers, or modal inspectors.

## 3. High-Level Engineer Details
- **Keyboard Affordances**: Include `<kbd>⌘K</kbd>`, `<kbd>ESC</kbd>`, `<kbd>↵</kbd>` badges on search, filters, and modals.
- **Telemetry & Status Dots**: Use pulsing status indicators for live connections (`w-2 h-2 rounded-full bg-emerald-500 animate-pulse`).
- **Tactile Physical Feedback**: Buttons and cards should have `active:scale-[0.98]` and `transition-all duration-150 ease-out`.
- **Code & Tech Specs**: Display tech stacks with explicit version chips or categories, not generic tags.
