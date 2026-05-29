export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id || !/^[a-zA-Z0-9_\-]{10,80}$/.test(id)) {
    return new Response('Invalid ID', { status: 400 })
  }

  const driveUrl = `https://drive.google.com/thumbnail?id=${id}&sz=w1000`
  const res = await fetch(driveUrl)

  if (!res.ok) {
    return new Response('Failed to fetch image', { status: res.status })
  }

  const contentType = res.headers.get('content-type') ?? ''

  if (!contentType.startsWith('image/')) {
    return new Response('Not an image', { status: 400 })
  }

  return new Response(res.body, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=86400',
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'none'",
    },
  })
}
