const base = '/api'

export async function http<T>(path: string, options?: RequestInit): Promise<T> {
  try {
    const res = await fetch(`${base}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    })
    if (!res.ok) {
      throw new Error(`Request failed ${res.status}`)
    }
    return res.json() as Promise<T>
  } catch (error) {
    // Re-throw with more context, but the calling function will handle the fallback
    throw error
  }
}

