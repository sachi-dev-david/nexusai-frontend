import { apiFetch } from './config.js'

/**
 * GET /api/conversations
 * @returns {ConversationSummary[]}
 */
export async function getConversations() {
  const res = await apiFetch('/api/conversations')
  const json = await res.json()
  if (!json.success) throw new Error(json.error)
  return json.data
}

/**
 * GET /api/conversations/{id}/messages
 * @returns {ChatMessage[]}
 */
export async function getMessages(conversationId) {
  const res = await apiFetch(`/api/conversations/${conversationId}/messages`)
  const json = await res.json()
  if (!json.success) throw new Error(json.error)
  return json.data
}

/**
 * POST /api/conversations
 * @returns {ConversationSummary}
 */
export async function createConversation() {
  const res = await apiFetch('/api/conversations', { method: 'POST' })
  const json = await res.json()
  if (!json.success) throw new Error(json.error)
  return json.data
}

/**
 * DELETE /api/conversations/{id}
 */
export async function deleteConversation(conversationId) {
  const res = await apiFetch(`/api/conversations/${conversationId}`, { method: 'DELETE' })
  const json = await res.json()
  if (!json.success) throw new Error(json.error)
}
