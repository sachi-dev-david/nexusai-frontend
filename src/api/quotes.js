import { BASE_URL, apiFetch } from './config.js'

/**
 * GET /api/quotes/options
 */
export async function getQuoteOptions() {
  const res = await apiFetch('/api/quotes/options')
  const json = await res.json()
  if (!json.success) throw new Error(json.error)
  return json.data
}

/**
 * GET /api/quotes/options/version
 */
export async function getQuoteOptionsVersion() {
  const res = await apiFetch('/api/quotes/options/version')
  const json = await res.json()
  if (!json.success) throw new Error(json.error)
  return json.data
}

/**
 * POST /api/quotes (multipart/form-data, SSE response)
 */
export async function submitQuoteStream(formData, callbacks = {}, signal) {
  const token = localStorage.getItem('nexusai_token')

  const res = await fetch(`${BASE_URL}/api/quotes`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
    signal,
  })

  const contentType = res.headers.get('content-type') ?? ''

  if (!res.ok) {
    const json = await res.json().catch(() => ({}))
    const err = new Error(json.error ?? `HTTP ${res.status}`)
    err.details = json.details
    throw err
  }

  if (!contentType.includes('text/event-stream')) {
    const json = await res.json().catch(() => ({}))
    if (json?.success === false) {
      const err = new Error(json.error ?? '新增報價失敗')
      err.details = json.details
      throw err
    }
    callbacks.onDone?.(json?.data ?? null)
    return
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let donePayload = null

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const parts = buffer.split('\n\n')
    buffer = parts.pop() ?? ''

    for (const part of parts) {
      for (const line of part.split('\n')) {
        if (!line.startsWith('data: ')) continue
        const payload = line.slice(6).trim()
        if (!payload) continue

        let evt
        try {
          evt = JSON.parse(payload)
        } catch {
          continue
        }

        callbacks.onEvent?.(evt)

        if (evt.type === 'done') {
          donePayload = evt.stepData ?? null
          continue
        }

        if (evt.type === 'error' || evt.type === 'step_error') {
          const err = new Error(evt.token ?? evt.stepMessage ?? '新增報價流程失敗')
          err.event = evt
          throw err
        }
      }
    }
  }

  callbacks.onDone?.(donePayload)
}
