# Repository Guidelines

## Project Structure & Module Organization
Next.js App Router powers routing: route segments and layouts live in `app/`; server components are default and client components opt in with `"use client"`. Shared UI primitives are in `components/`; subfolders (`setup/`, `playbooks/`) group feature-specific widgets. Utilities such as the OpenAI helper in `lib/codexClient.ts` live in `lib/`. Static assets belong in `public/`, and automation scripts (Codex CLI, future tooling) live in `scripts/`. Root-level configs (`tailwind.config.ts`, `tsconfig.json`, `postcss.config.js`) define Tailwind tokens and `@/...` path aliases.

## Build, Test, and Development Commands
- `npm run dev`: Start the hot-reloading dev server on `http://localhost:3000`.
- `npm run build`: Produce an optimized production bundle.
- `npm run export`: Generate the static `out/` directory without rebuilding.
- `npm run preview`: Run `build` then `export` for release validation.
- `npm run lint`: Execute ESLint with the Next.js ruleset and TypeScript type-aware checks.
- `npm run codex -- "prompt"`: Call the Codex helper in `scripts/codex.ts` (requires `OPENAI_API_KEY`).

## Coding Style & Naming Conventions
TypeScript runs in strict mode; preserve that by fixing, not suppressing, type errors. Prettier handles formatting (two-space indentation, single quotes), so rely on the existing config and avoid manual stylistic tweaks. Use `PascalCase` for React components and their filenames, `camelCase` for utilities, and keep modules small with colocated styles or variants. Lean on Tailwind utilities informed by the design tokens in `tailwind.config.ts`, and prefer `class-variance-authority` variants in shared components over ad-hoc class strings.

## Testing Guidelines
No automated tests ship today. When adding them, colocate `*.test.tsx` or `*.spec.ts` files beside the source and reach for `@testing-library/react` (or an agreed alternative) to verify UI behavior. Until a harness lands, treat `npm run lint`, smoke checks in `npm run dev`, and a static export via `npm run preview` as the minimum regression suite. Capture manual steps and expectations in your PR description.

## Commit & Pull Request Guidelines
Write concise, imperative commit subjects (`Add personalization panel state`) and group related changes logically. PRs should summarize intent, list validation commands, link any tracking issues, and include screenshots for UI-visible updates. Run `npm run lint` and `npm run preview` before requesting review. Document new environment needs—especially when touching Codex scripts—and remind reviewers how to exercise them.

## Security & Configuration Tips
Keep credentials such as `OPENAI_API_KEY` in `.env.local`, which is git-ignored; never commit secrets. Review AI-generated code for data exposure before merging. Scope deployment secrets to GitHub Pages only.
