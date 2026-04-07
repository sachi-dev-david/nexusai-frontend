# NexusAI Frontend

工廠智能助手前端 — React 18 + Vite

---

## 技術棧

| 元件 | 版本 / 說明 |
|------|------------|
| React | 18.3 |
| Vite | 5.4 |
| 樣式 | Pure CSS-in-JS（無外部 UI 框架） |
| 字型 | Barlow / Barlow Condensed / JetBrains Mono / Noto Sans TC |
| SSE 串流 | fetch + ReadableStream（非 EventSource，支援 POST + JWT） |

---

## 環境需求

| 工具 | 版本 |
|------|------|
| Node.js | 18+ |
| npm | 9+ |

---

## 快速啟動

```bash
npm install
npm run dev
```

開啟 http://localhost:3000

> Dev 模式下 `/api` 請求透過 Vite proxy 自動轉發到 `http://localhost:5050`（後端），無需額外 CORS 設定。

---

## 建置正式版

```bash
npm run build
```

輸出至 `dist/`，可部署到任何靜態伺服器或 Nginx。

---

## API 位址設定

透過 `.env` 控制，**不需修改程式碼**：

| 檔案 | 說明 |
|------|------|
| `.env` | 開發用，`VITE_API_BASE_URL=`（留空，讓 proxy 處理） |
| `.env.production` | 正式環境，填入後端完整 URL |

**範例：後端在 192.168.1.100:5050**
```
# .env.production
VITE_API_BASE_URL=http://192.168.1.100:5050
```

---

## 功能說明

### 對話介面

- 左側邊欄：對話列表（新增 / 刪除）
- 主區域：即時串流訊息顯示，支援 Markdown 格式
- 輸入欄：文字輸入 + 附件上傳 + 送出

### Skill 面板（右側邊欄）

顯示後端可用的 Skill 清單（`GET /api/skills`），點擊 Skill 可快速帶入觸發詞到輸入框。

### Plugin 執行狀態顯示

AI 呼叫 Plugin 時，訊息泡泡上方會即時顯示執行狀態：

```
▶ query_quote  {"customer_name":"HzdCIM","date_from":"2026-01-01"}  ✓ 完成
```

- **`skill_start`** 事件 → 顯示 Plugin 名稱 + 參數（pending 動畫）
- **`skill_done`** 事件 → 顯示完成狀態 + 查詢結果摘要

### 附件上傳

- 點擊迴紋針圖示選擇檔案
- 上傳至 `POST /api/files/upload`，取得 `fileId`
- 送出訊息時帶入 `fileId`，AI 可感知附件內容

### 串流回應

使用 `fetch + ReadableStream` 接收 SSE，支援：
- 即時 token 逐字顯示（打字機效果）
- skill_start / skill_done 事件即時更新 UI
- 串流過程中顯示「⟳ AI 回應中...」狀態
- 錯誤自動顯示紅色提示

---

## 專案結構

```
src/
├── api/
│   ├── config.js           BASE_URL 設定 + apiFetch（自動帶 JWT）
│   ├── auth.js             login() / logout()
│   ├── conversations.js    getConversations / getMessages /
│   │                       createConversation / deleteConversation
│   ├── chat.js             streamChat()（SSE fetch streaming）
│   ├── devices.js          getDevices() / getDeviceStatus()
│   └── skills.js           getSkills() / uploadFile()
├── App.jsx                 主應用（UI + 狀態管理，全部在單一檔案）
└── main.jsx                Entry point
```

---

## SSE 事件處理

`src/api/chat.js` 的 `streamChat()` 解析後端 SSE 並觸發 callbacks：

```javascript
await streamChat(conversationId, message, fileId, {
  onSkillStart: (name, args) => { /* Plugin 開始執行 */ },
  onSkillDone:  (name, result) => { /* Plugin 執行完成 */ },
  onToken:      (token) => { /* 串流文字 */ },
  onDone:       () => { /* 串流結束 */ },
  onError:      (msg) => { /* 錯誤 */ },
}, abortSignal)
```

**SSE 格式（由後端推送）：**
```
data: {"type":"skill_start","skillName":"query_quote","skillArgs":{...}}
data: {"type":"skill_done","skillName":"query_quote","skillResult":"..."}
data: {"type":"token","token":"以下是查詢結果："}
data: {"type":"done"}
```

---

## 測試帳號

| 帳號 | 密碼 | 角色 |
|------|------|------|
| admin | admin123 | Admin |
| engineer | eng123 | Engineer |
| operator | op123 | Operator |

---

## 常見問題

**Q：開發模式下 API 回 404？**
確認後端已啟動於 `http://localhost:5050`，Vite proxy 設定在 `vite.config.js`。

**Q：登入成功但馬上被登出？**
確認 `localStorage` 沒有被清除，JWT Token 存在 `nexusai_token` key。

**Q：Skill 面板是空的？**
後端 `GET /api/skills` 需要 JWT，確認登入狀態。

**Q：Plugin 執行完但沒有 AI 回覆？**
這是 llama3.2:3b 已知行為，後端有自動容錯補一次整理請求，若仍沒有回覆請檢查後端 console log。
