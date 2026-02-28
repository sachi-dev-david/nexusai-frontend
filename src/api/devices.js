import { apiFetch } from './config.js'

/**
 * GET /api/devices
 * @returns {DeviceSummary[]}
 */
export async function getDevices() {
  const res = await apiFetch('/api/devices')
  const json = await res.json()
  if (!json.success) throw new Error(json.error)
  return json.data
}

/**
 * GET /api/devices/{id}/status
 * @returns {DeviceDetail}
 */
export async function getDeviceStatus(deviceId) {
  const res = await apiFetch(`/api/devices/${deviceId}/status`)
  const json = await res.json()
  if (!json.success) throw new Error(json.error)
  return json.data
}
