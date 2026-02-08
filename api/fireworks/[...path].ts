export const config = { runtime: 'edge' }

export default async function handler(request: Request) {
  const url = new URL(request.url)
  // Strip /api/fireworks prefix to get the Fireworks API path
  const fireworksPath = url.pathname.replace(/^\/api\/fireworks/, '')
  const targetUrl = `https://api.fireworks.ai${fireworksPath}${url.search}`

  // Forward the request to Fireworks AI
  const res = await fetch(targetUrl, {
    method: request.method,
    headers: {
      'Content-Type': request.headers.get('Content-Type') ?? 'application/json',
      Authorization: request.headers.get('Authorization') ?? '',
    },
    body: request.method !== 'GET' ? request.body : undefined,
    // @ts-ignore -- duplex is needed for streaming request bodies
    duplex: 'half',
  })

  // Stream the response back to the client
  return new Response(res.body, {
    status: res.status,
    headers: {
      'Content-Type': res.headers.get('Content-Type') ?? 'application/json',
      'Cache-Control': 'no-cache',
    },
  })
}
