const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL

if (!APPS_SCRIPT_URL) {
  throw new Error('APPS_SCRIPT_URL environment variable is not set')
}

export async function fetchFromCMS<T>(path: string): Promise<T[]> {
  const url = `${APPS_SCRIPT_URL}?path=${path}`

  try {
    const res = await fetch(url, {
      next: { revalidate: process.env.NODE_ENV === 'development' ? 0 : 3600 },
    })

    if (!res.ok) {
      console.error(`CMS fetch failed for "${path}": ${res.status} ${res.statusText}`)
      return []
    }

    const json = await res.json()

    if (json.error) {
      console.error(`CMS API error for "${path}": ${json.error}`)
      return []
    }

    return Array.isArray(json.data) ? json.data : []
  } catch (err) {
    console.error(`CMS fetch exception for "${path}":`, err)
    return []
  }
}
