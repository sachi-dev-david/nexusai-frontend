import { BASE_URL } from './config.js'

/**
 * POST /api/auth/login
 * @returns {{ token, username, role, expiresAt }}
 */
export async function login(username, password) {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })

  const json = await res.json()

  if (!res.ok || !json.success) {
    throw new Error(json.error ?? '登入失敗')
  }

  return json.data
}

/**
 * POST /api/auth/logout
 */
export async function logout() {
  const token = localStorage.getItem('nexusai_token')
  if (!token) return

  await fetch(`${BASE_URL}/api/auth/logout`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  }).catch(() => {}) // 登出失敗不阻斷流程

  localStorage.removeItem('nexusai_token')
  localStorage.removeItem('nexusai_user')
}
