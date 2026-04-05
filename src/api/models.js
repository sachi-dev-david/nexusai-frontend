import { apiFetch } from './config.js'

/**
 * GET /api/models/ollama
 * 取得 Ollama LLM 模型狀態
 * @returns {Object} { name: string, status: 'online'|'offline', message?: string }
 */
export async function getOllamaModel() {
  const res = await apiFetch('/api/models/ollama')
  const json = await res.json()
  if (!json.success) throw new Error(json.error)
  return json.data
}

/**
 * GET /api/models/vision
 * 取得特徵辨識模型狀態
 * @returns {Object} { name: string, status: 'online'|'offline', message?: string }
 */
export async function getVisionModel() {
  const res = await apiFetch('/api/models/vision')
  const json = await res.json()
  if (!json.success) throw new Error(json.error)
  return json.data
}

/**
 * GET /api/models/math
 * 取得數學模型狀態
 * @returns {Object} { name: string, status: 'online'|'offline', message?: string }
 */
export async function getMathModel() {
  const res = await apiFetch('/api/models/math')
  const json = await res.json()
  if (!json.success) throw new Error(json.error)
  return json.data
}

/**
 * GET /api/models
 * 一次取得所有模型狀態
 * @returns {Object} { ollama: Object, vision: Object, math: Object }
 */
export async function getAllModels() {
  const res = await apiFetch('/api/models')
  const json = await res.json()
  if (!json.success) throw new Error(json.error)
  return json.data
}
