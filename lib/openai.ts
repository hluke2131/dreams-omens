/**
 * Server-side only — never import in Client Components.
 * Builds the OpenAI request payload from an InterpretRequest.
 */
import OpenAI from 'openai'
import type { InterpretRequest } from '@/lib/types'

// Lazy client — instantiated at runtime so a missing key doesn't break the build.
// getInterpretation() will throw clearly if the key is absent.
let _openai: OpenAI | null = null
function getOpenAI(): OpenAI {
  if (!_openai) {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) throw new Error('OPENAI_API_KEY environment variable is not set')
    _openai = new OpenAI({ apiKey })
  }
  return _openai
}

export const OPENAI_MODEL       = 'gpt-4o-mini'
export const OPENAI_TEMPERATURE = 0.6
export const OPENAI_MAX_TOKENS  = 400

const SYSTEM_PROMPT =
  'You write warm, grounded, practical interpretations (120–200 words). Avoid medical/legal/financial advice.'

/**
 * Assembles the user message exactly as specified in the spec:
 *   {TYPE}: {text}
 *   [optional] \nTags: {tag1}, {tag2}, ...
 *   [optional] \nLens: {lens}
 *   [optional] \nStyle: concise
 */
export function buildUserMessage(req: InterpretRequest): string {
  const parts: string[] = []

  parts.push(`${req.type.toUpperCase()}: ${req.text}`)

  if (req.tags && req.tags.length > 0) {
    parts.push(`\nTags: ${req.tags.join(', ')}`)
  }

  if (req.lens && req.lens !== 'none') {
    parts.push(`\nLens: ${req.lens}`)
  }

  if (req.concise) {
    parts.push(`\nStyle: concise`)
  }

  return parts.join('')
}

/** Calls OpenAI and returns the raw interpretation text. */
export async function getInterpretation(req: InterpretRequest): Promise<string> {
  const userMessage = buildUserMessage(req)

  const response = await getOpenAI().chat.completions.create(
    {
      model:       OPENAI_MODEL,
      temperature: OPENAI_TEMPERATURE,
      max_tokens:  OPENAI_MAX_TOKENS,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user',   content: userMessage },
      ],
    },
    { timeout: 15_000 },
  )

  const content = response.choices[0]?.message?.content
  if (!content) throw new Error('Empty response from OpenAI')
  return content
}
