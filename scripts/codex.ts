#!/usr/bin/env ts-node
import { codeCompletion } from '../lib/codexClient';

/**
 * A simple CLI for interacting with OpenAI Codex.  Pass your prompt as
 * command‑line arguments and the script will print the completion.  Use
 * this to experiment with AI‑assisted coding tasks from the terminal.
 *
 * Example:
 *
 * ```bash
 * OPENAI_API_KEY=sk-your-key npm run codex -- "// generate a React component"
 * ```
 */
async function main() {
  const args = process.argv.slice(2);
  const prompt = args.join(' ');
  if (!prompt) {
    console.error('Please provide a prompt as CLI arguments.');
    process.exit(1);
  }
  try {
    const completion = await codeCompletion(prompt, 200);
    console.log(completion.trim());
  } catch (err) {
    console.error('Error while contacting OpenAI:', err);
  }
}

main();