const API_URL = '/api/fireworks/inference/v1/chat/completions'
const MODEL = 'accounts/fireworks/models/deepseek-v3p1'

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export async function chatCompletion(
  messages: ChatMessage[],
  options?: { maxTokens?: number; temperature?: number; signal?: AbortSignal },
): Promise<string> {
  const apiKey = import.meta.env.VITE_FIREWORKS_API_KEY
  if (!apiKey) throw new Error('VITE_FIREWORKS_API_KEY is not set')

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      stream: false,
      max_tokens: options?.maxTokens ?? 4096,
      temperature: options?.temperature ?? 0.7,
    }),
    signal: options?.signal,
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`API error (${res.status}): ${body || res.statusText}`)
  }

  const json = await res.json()
  return json.choices?.[0]?.message?.content ?? ''
}

interface StreamOptions {
  messages: ChatMessage[]
  onChunk: (text: string) => void
  signal?: AbortSignal
  maxTokens?: number
  temperature?: number
}

export async function streamCompletion({
  messages,
  onChunk,
  signal,
  maxTokens = 4096,
  temperature = 0.4,
}: StreamOptions): Promise<string> {
  const apiKey = import.meta.env.VITE_FIREWORKS_API_KEY
  if (!apiKey) throw new Error('VITE_FIREWORKS_API_KEY is not set')

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      stream: true,
      max_tokens: maxTokens,
      temperature,
    }),
    signal,
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`API error (${res.status}): ${body || res.statusText}`)
  }

  const reader = res.body?.getReader()
  if (!reader) throw new Error('Cannot read stream')

  const decoder = new TextDecoder()
  let buffer = ''
  let full = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || !trimmed.startsWith('data: ')) continue

        const payload = trimmed.slice(6)
        if (payload === '[DONE]') return full

        try {
          const json = JSON.parse(payload)
          const content = json.choices?.[0]?.delta?.content
          if (content) {
            full += content
            onChunk(content)
          }
        } catch {
          // skip malformed chunks
        }
      }
    }
  } finally {
    reader.releaseLock()
  }

  return full
}
