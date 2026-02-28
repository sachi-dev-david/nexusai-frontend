# NexusAI Frontend

工廠智能助手前端 — React 18 + Vite

---

## 環境需求

| 工具 | 版本 |
|------|------|
| Node.js | 18+ |
| npm | 9+ |

---

## 快速啟動（開發）

```bash
npm install
npm run dev
```

開啟 http://localhost:3000

> Dev 模式下，`/api` 請求會透過 Vite proxy 自動轉發到 `http://localhost:5050`（後端），無需額外 CORS 設定。

---

## 建置正式版

```bash
npm run build
```

輸出至 `dist/` 目錄，可直接部署到任何靜態伺服器。

---

## API 位址設定

透過 `.env` 檔控制，**不需改程式碼**：

| 檔案 | 說明 |
|------|------|
| `.env` | 開發環境，`VITE_API_BASE_URL=`（留空讓 proxy 處理）|
| `.env.production` | 正式環境，填入後端完整 URL |

**範例：若後端部署在 192.168.1.100:5050**

```
# .env.production
VITE_API_BASE_URL=http://192.168.1.100:5050
```

---

## 專案結構

```
src/
├── api/
│   ├── config.js       BASE_URL 設定 + apiFetch wrapper（自動帶 JWT）
│   ├── auth.js         login / logout
│   ├── conversations.js getConversations / getMessages / createConversation / deleteConversation
│   ├── chat.js         streamChat（SSE fetch streaming）
│   ├── devices.js      getDevices / getDeviceStatus
│   └── skills.js       getSkills / uploadFile
├── App.jsx             主應用（含全部 UI 與狀態管理）
└── main.jsx            Entry point
```

---

## 測試帳號（對應後端 Mock）

| 帳號 | 密碼 |
|------|------|
| admin | admin123 |
| engineer | eng123 |
| operator | op123 |
