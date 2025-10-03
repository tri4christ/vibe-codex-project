# Architecture Overview

## Tech Stack
- **Next.js 14 (App Router)** for server-first React rendering, routing, and data loading.
- **React 18 + TypeScript (strict)** across components, hooks, and shared utilities.
- **Tailwind CSS 3 + tailwindcss-animate** for design-token driven styling with dark-mode tokens.
- **class-variance-authority** to manage component variants in shared UI primitives.
- **shadcn/ui-inspired component library** in `components/` (Button, Chip, Section, etc.) tweaked for franchise-ops branding.
- **lucide-react** icons for navigation and panel affordances.
- **OpenAI SDK** (Codex helper) for scripted AI interactions.
- **Vite** reserved for lightweight prototyping; the main app ships via Next.js but the build chain anticipates Vite-powered sandboxes when needed.

## Frontend Structure
- `app/` hosts all route segments, layouts, and page-level server/client components managed by the Next.js App Router.
- `components/` contains reusable UI primitives and feature modules (e.g., onboarding widgets, team widgets, workspace scaffolding).
- `lib/` centralises domain logic, mock data, utilities, and feature stores such as the onboarding state container and agent registry.
- `public/` exposes static assets, including the agent portrait library under `public/agents/`.
- `scripts/` bundles automation utilities (Codex CLI helper, avatar normaliser) that support build-time workflows.

## Key Modules
- **Onboarding Chat Flow** (`components/onboarding/OnboardingPanel.tsx`, `lib/onboarding/*`) delivers a multi-step intake framed as a chat between the assigned AI specialist and Katie. Steps persist to the onboarding store and culminate in a recap call-to-action surface.
- **Teamroom** (`app/teamroom/page.tsx`, `components/team/StandupFeed.tsx`) synthesises the current human + AI roster, inline status management, and a running standup feed sourced from mock data.
- **Playbooks** (`app/playbooks/page.tsx`, `lib/mockData.ts`) visualises prospect-to-contract automation. Users flip between preset playbooks while the UI renders current step state and queued actions.
- **AI Agents Directory** (`lib/agents.ts`, `components/agents/*`) defines metadata for Scout, Caleb, Piper, Story, Eden, Leo, and leadership counterparts Katie and Ezra. Avatars, color tokens, and role copy flow through badges, drawers, and chat bubbles.

## Avatar Management
Agent portraits live in `public/agents/*.jpg`. Helper utilities (`getAvatar` in `lib/agents.ts`) resolve the correct asset, and a normalisation script (`scripts/normalize-avatars.mjs`) ensures consistent sizing. Components such as `AgentBadge` and the onboarding `ChatBubble` consume these image paths via Next.js `<Image>` for responsive delivery.

## State Management
React context powers scoped stateful features. The onboarding flow is orchestrated by `lib/onboarding/store.ts`, a custom provider that captures open panel state, step index, data payloads, and recap metadata. Other feature areas lean on local component state (`useState`, `useMemo`) rather than a global store, keeping business logic colocated with UI modules. Shared utilities in `lib/utils.ts` (e.g., `cn`) support deterministic rendering.

## UX Principles
- **Conversational onboarding** presents enterprise configuration as a dialogue between AI specialists and the franchise operator, reinforcing approachability.
- **Agent authenticity** relies on distinctive bios, avatars, and tones to convey the multidisciplinary crew that powers each workflow.
- **Team dashboard cohesion**: Workspace layouts, Teamroom, Playbooks, and Prospects share common scaffolding for a coherent operator cockpit. Dark mode, card softness (rounded-3xl surfaces), and microcopy keep the experience friendly but operational.

## Roadmap & Next Steps
1. **Onboarding polish**: add inline validation, toasts, and recap persistence (activity feed/export hooks) while tightening accessibility (focus trap, announcements).
2. **Workflow automation**: back the Playbooks and Prospects pages with API-ready data sources and task orchestration signals.
3. **AI assistive tooling**: wire the Codex client into targeted automations (standup synthesis, recap exports) with guardrail logging.
4. **Design system elevation**: promote frequently reused patterns into a formal component library, document variants, and ensure parity between light/dark modes.
5. **Performance & deployment**: evaluate Turbopack vs. Vite preview sandboxes, stabilise static export (`npm run preview`), and harden GitHub Pages rollout automation.

