export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id || !/^[a-zA-Z0-9_\-]{10,80}$/.test(id)) {
    return new Response('Invalid ID', { status: 400 })
  }

  const driveUrl = `https://drive.google.com/uc?export=view&id=${id}`

  const res = await fetch(driveUrl)

  if (!res.ok) {
    return new Response('Failed to fetch image', { status: res.status })
  }

  const contentType = res.headers.get('content-type') ?? 'image/jpeg'
  const body = await res.arrayBuffer()

  return new Response(body, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
