/**
 * API 配置
 * BASE_URL 由 .env / .env.production 的 VITE_API_BASE_URL 控制
 * 開發時留空（由 vite proxy 處理），正式環境填入後端完整 URL
 */
export const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

/**
 * 通用 fetch wrapper，自動帶 JWT Token 與 JSON headers
 */
export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('nexusai_token')

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })

  if (res.status === 401) {
    // Token 過期或無效，清除並重新導向登入
    localStorage.removeItem('nexusai_token')
    localStorage.removeItem('nexusai_user')
    window.location.reload()
    throw new Error('Unauthorized')
  }

  return res
}
