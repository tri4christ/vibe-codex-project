import OpenAI from 'openai';

/**
 * Initialise a singleton OpenAI client.  The API key must be supplied via
 * the `OPENAI_API_KEY` environment variable.  For more information
 * see: https://beta.openai.com/docs/api-reference/completions/create
 */
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Request a code completion from OpenAI Codex.  This helper wraps the
 * OpenAI SDK and returns the raw text response.
 *
 * @param prompt A textual prompt describing the code you want.  It can
 *   include partial code, comments or natural language instructions.
 * @param maxTokens Maximum number of tokens to generate.  Defaults to 100.
 */
export async function codeCompletion(
  prompt: string,
  maxTokens = 100,
): Promise<string> {
  const response = await openai.completions.create({
    model: 'code-davinci-002',
    prompt,
    max_tokens: maxTokens,
    temperature: 0,
  });
  return response.choices[0]?.text ?? '';
}