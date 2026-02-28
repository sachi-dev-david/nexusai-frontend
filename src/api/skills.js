import { apiFetch } from './config.js'

/**
 * GET /api/skills
 * @returns {SkillItem[]}
 */
export async function getSkills() {
  const res = await apiFetch('/api/skills')
  const json = await res.json()
  if (!json.success) throw new Error(json.error)
  return json.data
}

/**
 * POST /api/files/upload
 * @param {File} file
 * @returns {{ fileId, fileName, sizeBytes, expiresAt }}
 */
export async function uploadFile(file) {
  const token = localStorage.getItem('nexusai_token')
  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch(`${(await import('./config.js')).BASE_URL}/api/files/upload`, {
    method: 'POST',
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: formData,
    // 注意：multipart 不要設 Content-Type，讓瀏覽器自動加 boundary
  })

  const json = await res.json()
  if (!json.success) throw new Error(json.error)
  return json.data
}
