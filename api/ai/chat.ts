export const config = { runtime: 'edge' }

const FIREWORKS_URL = 'https://api.fireworks.ai/inference/v1/chat/completions'

export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const res = await fetch(FIREWORKS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: request.headers.get('Authorization') ?? '',
    },
    body: request.body,
    // @ts-ignore -- duplex needed for streaming request body
    duplex: 'half',
  })

  return new Response(res.body, {
    status: res.status,
    headers: {
      'Content-Type': res.headers.get('Content-Type') ?? 'application/json',
      'Cache-Control': 'no-cache',
    },
  })
}
