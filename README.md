# Vibe Codex Project

Welcome to **Vibe Codex Project** – a modern starter template that pairs **Next.js 14** with **TypeScript**, **Tailwind CSS** and optional **OpenAI Codex** integration.  This repository is designed for developers who prefer a *vibe‑coding* workflow where AI helps with the heavy lifting while you remain in control of the direction.  It comes preconfigured for quick previews on GitHub Pages and includes common tooling such as ESLint and Prettier.

## ✨ Features

- **Next.js 14 + TypeScript**: Uses the App Router for file–based routing and built‑in optimisations.
- **Tailwind CSS**: Rapidly build beautiful UIs with utility classes. Dark‑mode support is enabled via the `class` strategy and you can extend themes easily.
- **Utility components**: A `Button` component powered by [`class‑variance‑authority`](https://github.com/joe-bell/cva) with sensible variants. Add more components in the `components/` directory.
- **OpenAI Codex client**: The `lib/codexClient.ts` and `scripts/codex.ts` files demonstrate how you could call the OpenAI Codex API to generate or transform code.  To enable this feature you will need to provide an `OPENAI_API_KEY` as an environment variable.
- **ESLint & Prettier**: Code quality tools are configured out of the box.
- **GitHub Pages deployment**: A GitHub Actions workflow under `.github/workflows/deploy.yml` automatically builds and exports the site on every push to `main` and deploys it to Pages for a live preview.

## 📦 Getting Started

First, install the dependencies:

```bash
npm install
```

Run the development server at <http://localhost:3000>:

```bash
npm run dev
```

Open your browser to `http://localhost:3000` and you should see the default landing page.  You can edit `app/page.tsx` to start hacking.

### Build & Preview

To create a production build and export a static site, run:

```bash
npm run preview
```

This executes `next build` and `next export` to generate the `out/` folder.  You can preview the static build locally with any static server (for example, `npx serve out`).

### Deploy to GitHub Pages

This project includes a GitHub Actions workflow that publishes your static export to **GitHub Pages** whenever you push to the `main` branch.  The workflow does the following:

1. Checks out your code and installs dependencies.
2. Builds the Next.js application and runs `next export` to generate the `out` directory.
3. Uploads the `out` directory as an artifact and deploys it to GitHub Pages using the `actions/deploy-pages` action.

This setup allows you to get a live preview of your site without configuring a separate hosting service.

## 🔮 Using the Codex Client

The file `lib/codexClient.ts` wraps the OpenAI SDK and exposes a helper function for code completions.  You can experiment with the Codex API via the `scripts/codex.ts` script:

```bash
OPENAI_API_KEY=sk-your-key-here npm run codex -- "// generate a React component for a button"
```

This will print the response from the Codex API.  The script uses `ts-node`, which is installed as a development dependency.

> **Note**:  The OpenAI API key is not included in this repository.  You must supply your own key and never commit it to version control.  See `.gitignore` for excluded environment files.

## 🧠 Extending this starter

This starter is intentionally minimal but provides a solid foundation.  To build more advanced UIs you may want to integrate:

- Additional components using **Radix UI** or **shadcn/ui** for accessible primitives.
- A state management library such as **Zustand** or **TanStack Query**.
- Authentication via **NextAuth.js**.

Feel free to explore and customise the configuration files (ESLint, Prettier, Tailwind, Next.js) to suit your team’s standards.

## 📝 License

This project is licensed under the MIT License.  See the [LICENSE](LICENSE) file for details.
