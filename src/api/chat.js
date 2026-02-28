import { BASE_URL } from './config.js'

/**
 * POST /api/chat/stream  (SSE)
 *
 * 使用 fetch + ReadableStream 讀取 SSE，因為 EventSource 不支援 POST + Body
 *
 * @param {string} conversationId
 * @param {string} message
 * @param {string|null} fileId
 * @param {object} callbacks
 * @param {(name: string, args: object) => void} callbacks.onSkillStart
 * @param {(name: string, result: any) => void} callbacks.onSkillDone
 * @param {(token: string) => void} callbacks.onToken
 * @param {() => void} callbacks.onDone
 * @param {(error: string) => void} callbacks.onError
 * @param {AbortSignal} signal
 */
export async function streamChat(conversationId, message, fileId, callbacks, signal) {
  const token = localStorage.getItem('nexusai_token')

  const res = await fetch(`${BASE_URL}/api/chat/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ conversationId, message, fileId: fileId ?? null }),
    signal,
  })

  if (!res.ok) {
    const json = await res.json().catch(() => ({}))
    throw new Error(json.error ?? `HTTP ${res.status}`)
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })

    // SSE 訊息以 \n\n 分隔
    const parts = buffer.split('\n\n')
    buffer = parts.pop() ?? ''

    for (const part of parts) {
      for (const line of part.split('\n')) {
        if (!line.startsWith('data: ')) continue
        const jsonStr = line.slice(6).trim()
        if (!jsonStr) continue

        let evt
        try { evt = JSON.parse(jsonStr) } catch { continue }

        switch (evt.type) {
          case 'skill_start':
            callbacks.onSkillStart?.(evt.skillName, evt.skillArgs)
            break
          case 'skill_done':
            callbacks.onSkillDone?.(evt.skillName, evt.skillResult)
            break
          case 'token':
            callbacks.onToken?.(evt.token ?? '')
            break
          case 'done':
            callbacks.onDone?.()
            return
          case 'error':
            callbacks.onError?.(evt.token ?? '發生錯誤')
            return
        }
      }
    }
  }

  callbacks.onDone?.()
}
