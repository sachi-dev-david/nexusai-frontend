import React, { useState, useRef, useEffect, useCallback } from 'react'
import { login, logout } from './api/auth.js'
import {
  getConversations,
  getMessages,
  createConversation,
  deleteConversation,
} from './api/conversations.js'
import { streamChat } from './api/chat.js'
import { getDevices } from './api/devices.js'
import { getOllamaModel, getVisionModel, getMathModel } from './api/models.js'
import { getSkills } from './api/skills.js'
import { getQuoteOptions, submitQuoteStream } from './api/quotes.js'

// ── STYLES ────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@300;400;500;600;700&family=Barlow+Condensed:wght@500;600;700&family=JetBrains+Mono:wght@400;500&family=Noto+Sans+TC:wght@300;400;500&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root{
    --nv:#76b900;--nv-dim:#4a7300;--nv-glow:rgba(118,185,0,0.15);
    --bg:#0a0a0a;--bg2:#0f0f0f;--bg3:#141414;
    --border:#222;--border2:#2a2a2a;
    --text:#e8e8e8;--muted:#666;--dim:#333;
    --blue:#00b4d8;--red:#e63946;--warn:#ffd166;
    --sw:240px;--pw:220px;--th:48px;
  }
  html,body,#root{height:100%;overflow:hidden}
  body{background:var(--bg);color:var(--text);font-family:'Barlow','Noto Sans TC',sans-serif;font-size:14px}
  ::-webkit-scrollbar{width:4px;height:4px}
  ::-webkit-scrollbar-track{background:transparent}
  ::-webkit-scrollbar-thumb{background:var(--border2);border-radius:2px}

  /* LOGIN */
  .login-wrap{height:100vh;display:flex;align-items:center;justify-content:center;background:var(--bg);position:relative;overflow:hidden}
  .login-bg{position:absolute;inset:0;background:radial-gradient(ellipse 60% 50% at 50% -10%,rgba(118,185,0,.12) 0%,transparent 70%),repeating-linear-gradient(0deg,transparent,transparent 39px,rgba(255,255,255,.015) 39px,rgba(255,255,255,.015) 40px),repeating-linear-gradient(90deg,transparent,transparent 39px,rgba(255,255,255,.015) 39px,rgba(255,255,255,.015) 40px)}
  .login-card{position:relative;width:400px;max-width:calc(100vw - 32px);background:var(--bg2);border:1px solid var(--border2);padding:48px 40px;clip-path:polygon(0 0,calc(100% - 20px) 0,100% 20px,100% 100%,0 100%)}
  .login-card::before{content:'';position:absolute;top:0;right:20px;width:1px;height:20px;background:var(--nv);transform:rotate(45deg) translateX(10px)}
  .login-logo{display:flex;align-items:center;gap:10px;margin-bottom:32px}
  .logo-mark{width:auto;min-width:36px;height:36px;padding:0 8px;background:var(--nv);clip-path:polygon(0 0,100% 0,100% 70%,70% 100%,0 100%);display:flex;align-items:center;justify-content:center;font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:12px;color:#000;letter-spacing:.02em}
  .logo-text{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:1.1rem;letter-spacing:.1em;text-transform:uppercase}
  .logo-text span{color:var(--nv)}
  .login-title{font-family:'Barlow Condensed',sans-serif;font-size:1.6rem;font-weight:700;letter-spacing:.05em;text-transform:uppercase;margin-bottom:6px}
  .login-sub{font-size:.78rem;color:var(--muted);margin-bottom:32px;font-family:'JetBrains Mono',monospace}
  .form-group{margin-bottom:16px}
  .form-label{display:block;font-family:'JetBrains Mono',monospace;font-size:.65rem;color:var(--muted);letter-spacing:.1em;text-transform:uppercase;margin-bottom:6px}
  .form-input{width:100%;background:var(--bg3);border:1px solid var(--border2);color:var(--text);padding:10px 14px;font-family:'Barlow',sans-serif;font-size:.9rem;outline:none;transition:border-color .2s}
  .form-input:focus{border-color:var(--nv)}
  .form-input::placeholder{color:var(--dim)}
  .form-input:disabled{opacity:.5;cursor:not-allowed}
  .btn-primary{width:100%;background:var(--nv);color:#000;border:none;padding:12px;font-family:'Barlow Condensed',sans-serif;font-size:.95rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;clip-path:polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,0 100%);transition:opacity .2s;margin-top:8px}
  .btn-primary:hover{opacity:.85}
  .btn-primary:disabled{opacity:.4;cursor:not-allowed}
  .login-error{background:rgba(230,57,70,.1);border:1px solid rgba(230,57,70,.3);color:var(--red);padding:8px 12px;font-size:.78rem;margin-bottom:12px;font-family:'JetBrains Mono',monospace}
  .login-footer{margin-top:24px;text-align:center;font-family:'JetBrains Mono',monospace;font-size:.62rem;color:var(--dim)}

  /* APP LAYOUT */
  .app{display:grid;grid-template-columns:var(--sw) 1fr var(--pw);grid-template-rows:var(--th) 1fr;height:100vh;overflow:hidden}

  /* TOPBAR */
  .topbar{grid-column:1/-1;display:flex;align-items:center;background:var(--bg2);border-bottom:1px solid var(--border);padding:0 16px;position:relative}
  .topbar::after{content:'';position:absolute;bottom:0;left:0;right:0;height:1px;background:linear-gradient(90deg,var(--nv) 0%,transparent 30%)}
  .topbar-logo{display:flex;align-items:center;gap:8px;padding-right:16px;border-right:1px solid var(--border);margin-right:16px;flex-shrink:0}
  .topbar-logo .logo-mark{min-width:24px;height:24px;font-size:9px;padding:0 5px}
  .topbar-logo .logo-text{font-size:.8rem}
  .topbar-title{font-family:'Barlow Condensed',sans-serif;font-size:.85rem;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--muted)}
  .topbar-spacer{flex:1}
  .topbar-status{display:flex;align-items:center;gap:6px;font-family:'JetBrains Mono',monospace;font-size:.62rem;color:var(--muted);padding:0 12px;border-left:1px solid var(--border)}
  .status-dot{width:6px;height:6px;border-radius:50%;background:var(--nv);box-shadow:0 0 6px var(--nv);animation:pulse 2s infinite;flex-shrink:0}
  .status-dot.offline{background:var(--red);box-shadow:0 0 6px var(--red)}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
  .topbar-user{display:flex;align-items:center;gap:8px;padding:0 12px;border-left:1px solid var(--border);cursor:pointer;flex-shrink:0}
  .user-avatar{width:28px;height:28px;background:var(--nv-dim);color:var(--nv);display:flex;align-items:center;justify-content:center;font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:.8rem;clip-path:polygon(0 0,85% 0,100% 15%,100% 100%,0 100%)}
  .user-info{text-align:right}
  .user-name{font-size:.75rem;font-weight:600}
  .user-role{font-size:.62rem;color:var(--muted);font-family:'JetBrains Mono',monospace}
  .logout-btn{background:none;border:1px solid var(--border2);color:var(--muted);width:28px;height:28px;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:.75rem;transition:all .15s;flex-shrink:0;clip-path:polygon(0 0,85% 0,100% 15%,100% 100%,0 100%)}
  .logout-btn:hover{border-color:var(--red);color:var(--red)}
  .hamburger{display:none;background:none;border:none;color:var(--muted);font-size:1.1rem;cursor:pointer;padding:4px 8px;margin-right:8px;line-height:1}

  /* SIDEBAR */
  .sidebar{background:var(--bg2);border-right:1px solid var(--border);display:flex;flex-direction:column;overflow:hidden;transition:transform .25s ease}
  .sidebar-section{padding:12px;border-bottom:1px solid var(--border)}
  .sidebar-label{font-family:'JetBrains Mono',monospace;font-size:.58rem;color:var(--dim);letter-spacing:.12em;text-transform:uppercase;padding:0 4px;margin-bottom:8px}
  .new-chat-btn{width:100%;background:transparent;border:1px solid var(--nv-dim);color:var(--nv);padding:8px 12px;font-family:'Barlow Condensed',sans-serif;font-size:.78rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;display:flex;align-items:center;gap:8px;clip-path:polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,0 100%);transition:background .2s}
  .new-chat-btn:hover{background:var(--nv-glow)}
  .history-list{flex:1;overflow-y:auto;padding:8px}
  .history-item{padding:8px 8px 8px 10px;border-left:2px solid transparent;cursor:pointer;transition:all .15s;margin-bottom:2px;border-radius:0 2px 2px 0;position:relative}
  .history-item:hover{background:var(--bg3);border-left-color:var(--border2)}
  .history-item:hover .history-delete{opacity:1}
  .history-item.active{background:var(--bg3);border-left-color:var(--nv)}
  .history-title{font-size:.78rem;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:2px;padding-right:20px}
  .history-meta{font-family:'JetBrains Mono',monospace;font-size:.6rem;color:var(--muted)}
  .history-preview{font-size:.7rem;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:2px}
  .history-delete{position:absolute;top:50%;right:6px;transform:translateY(-50%);opacity:0;background:none;border:none;color:var(--muted);cursor:pointer;font-size:.7rem;padding:2px 4px;transition:color .15s}
  .history-delete:hover{color:var(--red)}
  .sidebar-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:40}
  .sidebar-loading{padding:16px;text-align:center;font-family:'JetBrains Mono',monospace;font-size:.65rem;color:var(--dim)}

  /* CHAT */
  .chat-area{display:flex;flex-direction:column;overflow:hidden;background:var(--bg);min-width:0}
  .chat-messages{flex:1;overflow-y:auto;padding:24px 32px;display:flex;flex-direction:column;gap:20px}
  .welcome{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;text-align:center;gap:16px;opacity:.6}
  .welcome-icon{font-size:2.5rem}
  .welcome-title{font-family:'Barlow Condensed',sans-serif;font-size:1.2rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)}
  .welcome-sub{font-family:'JetBrains Mono',monospace;font-size:.7rem;color:var(--dim)}

  /* MESSAGES */
  .msg{display:flex;gap:12px;max-width:820px}
  .msg.user{align-self:flex-end;flex-direction:row-reverse}
  .msg-avatar{width:30px;height:30px;flex-shrink:0;clip-path:polygon(0 0,85% 0,100% 15%,100% 100%,0 100%);display:flex;align-items:center;justify-content:center;font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:.75rem}
  .msg.user .msg-avatar{background:var(--nv-dim);color:var(--nv)}
  .msg.ai .msg-avatar{background:#1a1a1a;color:var(--muted);border:1px solid var(--border2)}
  .msg-body{flex:1;min-width:0}
  .msg-header{display:flex;align-items:baseline;gap:8px;margin-bottom:6px}
  .msg-name{font-family:'Barlow Condensed',sans-serif;font-size:.75rem;font-weight:600;letter-spacing:.05em;text-transform:uppercase}
  .msg.ai .msg-name{color:var(--nv)}
  .msg.user .msg-name{color:var(--muted)}
  .msg-time{font-family:'JetBrains Mono',monospace;font-size:.58rem;color:var(--dim)}
  .msg-bubble{background:var(--bg2);border:1px solid var(--border);padding:12px 16px;line-height:1.7;font-size:.85rem}
  .msg.ai .msg-bubble{border-left:2px solid var(--nv);clip-path:polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,0 100%)}
  .msg.user .msg-bubble{background:rgba(118,185,0,.08);border-color:rgba(118,185,0,.2);clip-path:polygon(8px 0,100% 0,100% 100%,0 100%,0 8px)}
  .msg-bubble p{margin-bottom:8px}
  .msg-bubble p:last-child{margin-bottom:0}
  .msg-bubble table{width:100%;border-collapse:collapse;margin:8px 0;font-size:.8rem}
  .msg-bubble th{text-align:left;padding:5px 8px;background:var(--bg3);color:var(--muted);font-family:'JetBrains Mono',monospace;font-size:.65rem;letter-spacing:.05em;font-weight:400}
  .msg-bubble td{padding:5px 8px;border-top:1px solid var(--border)}
  .skill-call{display:flex;align-items:center;gap:8px;background:var(--bg3);border:1px solid var(--border);border-left:2px solid var(--blue);padding:7px 12px;margin-bottom:8px;font-family:'JetBrains Mono',monospace;font-size:.65rem;color:var(--muted);flex-wrap:wrap}
  .skill-call-name{color:var(--blue);font-weight:500}
  .skill-call-status{margin-left:auto;color:var(--nv)}
  .skill-call-status.pending{color:var(--warn);animation:pulse 1s infinite}
  .skill-call-args{color:var(--dim);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:220px}
  .cursor{display:inline-block;width:8px;height:14px;background:var(--nv);animation:blink .8s infinite;vertical-align:text-bottom;margin-left:2px}
  @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
  .file-badge{display:inline-flex;align-items:center;gap:6px;background:var(--bg3);border:1px solid var(--border2);padding:4px 10px;font-family:'JetBrains Mono',monospace;font-size:.65rem;color:var(--muted);margin-bottom:6px}
  .msg-error{color:var(--red);font-family:'JetBrains Mono',monospace;font-size:.72rem;padding:8px 12px;background:rgba(230,57,70,.08);border:1px solid rgba(230,57,70,.2);border-left:2px solid var(--red)}
  .quote-block{display:flex;flex-direction:column;gap:10px}
  .quote-section{background:var(--bg3);border:1px solid var(--border2);padding:10px 12px}
  .quote-section-title{font-family:'JetBrains Mono',monospace;font-size:.62rem;color:var(--muted);letter-spacing:.08em;text-transform:uppercase;margin-bottom:6px}
  .quote-progress-text{white-space:pre-wrap;font-family:'JetBrains Mono',monospace;font-size:.72rem;line-height:1.6;color:var(--text)}

  /* History loading */
  .history-loading{display:flex;align-items:center;justify-content:center;gap:10px;padding:40px;font-family:'JetBrains Mono',monospace;font-size:.72rem;color:var(--dim)}
  .loading-dots span{display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--nv);margin:0 2px;animation:dotpulse 1.2s infinite}
  .loading-dots span:nth-child(2){animation-delay:.2s}
  .loading-dots span:nth-child(3){animation-delay:.4s}
  @keyframes dotpulse{0%,80%,100%{opacity:.2}40%{opacity:1}}
  .history-divider{display:flex;align-items:center;gap:12px;margin:4px 0 12px;font-family:'JetBrains Mono',monospace;font-size:.6rem;color:var(--dim)}
  .history-divider::before,.history-divider::after{content:'';flex:1;height:1px;background:var(--border)}

  /* INPUT */
  .input-area{border-top:1px solid var(--border);padding:12px 24px 16px;background:var(--bg2);position:relative}
  .input-area::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,var(--nv) 0%,transparent 30%)}
  .input-files{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px}
  .file-chip{display:flex;align-items:center;gap:6px;background:var(--bg3);border:1px solid var(--border2);padding:4px 10px;font-family:'JetBrains Mono',monospace;font-size:.65rem;color:var(--muted)}
  .file-chip.uploading{border-color:var(--warn);color:var(--warn)}
  .file-chip-remove{cursor:pointer;background:none;border:none;color:var(--dim);font-size:.75rem;padding:0}
  .file-chip-remove:hover{color:var(--red)}
  .input-row{display:flex;align-items:flex-end;gap:8px}
  .input-box{flex:1;background:var(--bg3);border:1px solid var(--border2);color:var(--text);padding:10px 14px;font-family:'Barlow','Noto Sans TC',sans-serif;font-size:.88rem;resize:none;min-height:42px;max-height:120px;outline:none;line-height:1.5;overflow-y:auto;transition:border-color .2s}
  .input-box:focus{border-color:var(--nv)}
  .input-box::placeholder{color:var(--dim)}
  .input-actions{display:flex;gap:4px}
  .icon-btn{width:38px;height:38px;background:transparent;border:1px solid var(--border2);color:var(--muted);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:.9rem;transition:all .15s;flex-shrink:0}
  .icon-btn:hover{border-color:var(--dim);color:var(--text)}
  .send-btn{width:38px;height:38px;background:var(--nv);border:none;color:#000;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:.9rem;clip-path:polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,0 100%);transition:opacity .2s;flex-shrink:0}
  .send-btn:hover{opacity:.8}
  .send-btn:disabled{opacity:.3;cursor:not-allowed}
  .input-hint{display:flex;align-items:center;gap:12px;margin-top:8px;font-family:'JetBrains Mono',monospace;font-size:.6rem;color:var(--dim)}
  .hint-key{background:var(--bg3);border:1px solid var(--border);padding:1px 5px;border-radius:2px;color:var(--muted)}
  .upload-input{display:none}

  /* RIGHT PANEL - Hidden by request */
  .right-panel{display:none}
  .panel-section{display:none}
  .device-item{display:none}

  /* Hide right-panel column and expand chat area */
  .app.hide-right-panel {
    grid-template-columns: var(--sw) 1fr;
  }

  /* RWD Tablet */
  @media(max-width:900px){
    :root{--sw:200px;--pw:0px}
    .right-panel{display:none}
    .topbar-status{display:none}
  }

  /* RWD Mobile */
  @media(max-width:640px){
    :root{--sw:0px;--pw:0px}
    .app{display:flex;flex-direction:column}
    .hamburger{display:flex}
    .sidebar{position:fixed;top:0;left:0;bottom:0;width:280px;z-index:50;transform:translateX(-100%);overflow-y:auto}
    .sidebar.open{transform:translateX(0)}
    .sidebar-overlay.open{display:block}
    .topbar{flex-shrink:0}
    .topbar-title{display:none}
    .user-info{display:none}
    .topbar-user{padding:0 8px}
    .topbar-logo{padding-right:8px;margin-right:8px}
    .chat-area{flex:1;min-height:0;width:100%}
    .right-panel{display:none}
    .chat-messages{padding:16px 12px}
    .input-area{padding:8px 12px 12px;flex-shrink:0}
    .msg{max-width:100%}
    .input-hint{display:none}
    .skills-toolbar{display:none}
    .skill-item{padding:4px 8px;font-size:.65rem}
  }

  .md strong{font-weight:600}
  .md em{font-style:italic;color:var(--muted)}

  /* PARAMETER MODAL */
  .param-modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;z-index:100}
  .param-modal{background:var(--bg2);border:1px solid var(--border2);padding:24px;border-radius:4px;max-width:500px;width:calc(100% - 32px);box-shadow:0 8px 24px rgba(0,0,0,.4)}
  .param-modal-title{font-family:'Barlow Condensed',sans-serif;font-size:1rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;margin-bottom:20px;color:var(--text)}
  .param-field{margin-bottom:16px}
  .param-label{display:block;font-family:'JetBrains Mono',monospace;font-size:.65rem;color:var(--muted);letter-spacing:.1em;text-transform:uppercase;margin-bottom:6px}
  .param-input,.param-select{width:100%;background:var(--bg3);border:1px solid var(--border2);color:var(--text);padding:10px 12px;font-family:'Barlow',sans-serif;font-size:.85rem;outline:none;transition:border-color .2s}
  .param-input:focus,.param-select:focus{border-color:var(--nv)}
  .param-input::placeholder{color:var(--dim)}
  .param-actions{display:flex;gap:8px;margin-top:20px;justify-content:flex-end}
  .param-btn{padding:10px 20px;font-family:'Barlow Condensed',sans-serif;font-size:.85rem;font-weight:600;letter-spacing:.05em;border:1px solid var(--border2);cursor:pointer;transition:all .15s;text-transform:uppercase}
  .param-btn-cancel{background:transparent;color:var(--muted)}
  .param-btn-cancel:hover{border-color:var(--muted);color:var(--text)}
  .param-btn-submit{background:var(--nv);color:#000;border-color:var(--nv);font-weight:700}
  .param-btn-submit:hover{opacity:.85}

  @media(max-width:640px){
    .param-modal{max-width:calc(100% - 16px);padding:16px}
  }
`

// ── MARKDOWN ──────────────────────────────────────────────────────────────
function renderMarkdown(text) {
  if (!text) return null
  const lines = text.split('\n')
  const els = []; let tBuf = []; let k = 0
  const flushTable = () => {
    if (tBuf.length < 2) { tBuf = []; return }
    const heads = tBuf[0].split('|').filter(Boolean).map(h => h.trim())
    const rows = tBuf.slice(2).map(r => r.split('|').filter(Boolean).map(c => c.trim()))
    els.push(<table key={k++}><thead><tr>{heads.map((h,i)=><th key={i}>{h}</th>)}</tr></thead><tbody>{rows.map((r,i)=><tr key={i}>{r.map((c,j)=><td key={j}>{c}</td>)}</tr>)}</tbody></table>)
    tBuf = []
  }
  for (const line of lines) {
    if (line.startsWith('|')) { tBuf.push(line); continue }
    if (tBuf.length) flushTable()
    if (!line.trim()) { els.push(<br key={k++}/>); continue }
    const html = line.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/\*(.+?)\*/g,'<em>$1</em>')
    els.push(<p key={k++} dangerouslySetInnerHTML={{__html:html}}/>)
  }
  if (tBuf.length) flushTable()
  return els
}

// ── SKILL CALL BADGE ──────────────────────────────────────────────────────
function SkillCallBadge({ call }) {
  const args = JSON.stringify(call.args ?? {})
  return (
    <div className="skill-call">
      <span style={{color:'var(--dim)'}}>▶</span>
      <span className="skill-call-name">{call.name}</span>
      <span className="skill-call-args">{args.length > 50 ? args.slice(0,50)+'…' : args}</span>
      <span className={`skill-call-status ${call.done ? '' : 'pending'}`}>
        {call.done ? '✓ 完成' : '⟳ 執行中'}
      </span>
    </div>
  )
}

// ── PARAMETER MODAL ──────────────────────────────────────────────────────
function ParameterModal({ type, open, onClose, onSubmit, initialData, options = {}, optionsLoading = false, hasCadFile = false }) {
  const [data, setData] = React.useState(initialData || {
    material: '', surface: '', heatTreat: '', roughness: '', position: '', size: '', company: ''
  })

  React.useEffect(() => {
    if (open && initialData) {
      setData(prev => ({ ...prev, ...initialData }))
    }
  }, [open, initialData])

  const handleChange = (field, value) => {
    setData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = () => {
    onSubmit(data)
  }

  if (!open) return null

  const canSubmit = type !== 'new_quote' || (
    hasCadFile &&
    !!data.material &&
    !!data.surface &&
    !!data.heatTreat &&
    !!data.roughness &&
    !!data.position &&
    !!data.size &&
    !!data.company.trim()
  )

  const renderOptions = (list = []) =>
    list
      .filter(opt => opt.enabled !== false)
      .map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)

  return (
    <div className="param-modal-overlay" onClick={onClose}>
      <div className="param-modal" onClick={e => e.stopPropagation()}>
        <div className="param-modal-title">
          {type === 'query_quote' ? '查詢報價' : '新增報價'}
        </div>

        {type === 'new_quote' && (
          <>
            {optionsLoading && <div className="panel-placeholder">載入報價參數中...</div>}
            {!hasCadFile && <div className="panel-placeholder">請先上傳 STEP/STP/PRT 檔案</div>}
            <div className="param-field">
              <label className="param-label">加工材料 *</label>
              <select className="param-select" value={data.material} disabled={optionsLoading} onChange={e => handleChange('material', e.target.value)}>
                <option value="">請選擇材料</option>
                {renderOptions(options.materials)}
              </select>
            </div>

            <div className="param-field">
              <label className="param-label">表面處理 *</label>
              <select className="param-select" value={data.surface} disabled={optionsLoading} onChange={e => handleChange('surface', e.target.value)}>
                <option value="">請選擇表面處理</option>
                {renderOptions(options.surfaces)}
              </select>
            </div>

            <div className="param-field">
              <label className="param-label">熱處理 *</label>
              <select className="param-select" value={data.heatTreat} disabled={optionsLoading} onChange={e => handleChange('heatTreat', e.target.value)}>
                <option value="">請選擇熱處理</option>
                {renderOptions(options.heatTreats)}
              </select>
            </div>

            <div className="param-field">
              <label className="param-label">表面粗糙度 *</label>
              <select className="param-select" value={data.roughness} disabled={optionsLoading} onChange={e => handleChange('roughness', e.target.value)}>
                <option value="">請選擇粗糙度</option>
                {renderOptions(options.roughnesses)}
              </select>
            </div>

            <div className="param-field">
              <label className="param-label">型位公差 *</label>
              <select className="param-select" value={data.position} disabled={optionsLoading} onChange={e => handleChange('position', e.target.value)}>
                <option value="">請選擇型位公差</option>
                {renderOptions(options.positionTolerances)}
              </select>
            </div>

            <div className="param-field">
              <label className="param-label">尺寸公差 *</label>
              <select className="param-select" value={data.size} disabled={optionsLoading} onChange={e => handleChange('size', e.target.value)}>
                <option value="">請選擇尺寸公差</option>
                {renderOptions(options.sizeTolerances)}
              </select>
            </div>
          </>
        )}

        <div className="param-field">
          <label className="param-label">公司名稱 {type === 'new_quote' ? '*' : ''}</label>
          <input type="text" className="param-input" placeholder="請輸入公司名稱"
            value={data.company} onChange={e => handleChange('company', e.target.value)}/>
        </div>

        <div className="param-actions">
          <button className="param-btn param-btn-cancel" onClick={onClose}>取消</button>
          <button className="param-btn param-btn-submit" disabled={optionsLoading || !canSubmit} onClick={handleSubmit}>確認</button>
        </div>
      </div>
    </div>
  )
}

// ── MESSAGE ───────────────────────────────────────────────────────────────
function Message({ msg, userAvatar, userName }) {
  const isUser = msg.role === 'user'
  const time = msg.ts
    ? new Date(msg.ts).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })
    : ''

  const quoteMarker = '【報價報告】'
  const isQuoteFlowMsg = !isUser && typeof msg.text === 'string' && msg.text.includes('新增報價流程啟動中')
  let progressText = msg.text ?? ''
  let reportText = ''

  if (isQuoteFlowMsg && progressText.includes(quoteMarker)) {
    const idx = progressText.indexOf(quoteMarker)
    progressText = progressText.slice(0, idx).trimEnd()
    reportText = msg.text.slice(idx + quoteMarker.length).trim()
  }

  let completionLine = ''
  if (isQuoteFlowMsg) {
    const doneToken = '✓ 新增報價完成'
    if (progressText.includes(doneToken)) {
      progressText = progressText.replace(doneToken, '').trimEnd()
      completionLine = doneToken
    }
    if (reportText.includes(doneToken)) {
      reportText = reportText.replace(doneToken, '').trimEnd()
      completionLine = doneToken
    }
    if (completionLine) {
      progressText = `${progressText}\n\n${completionLine}`.trim()
    }
  }

  return (
    <div className={`msg ${isUser ? 'user' : 'ai'}`}>
      <div className="msg-avatar">{isUser ? (userAvatar ?? '我') : 'AI'}</div>
      <div className="msg-body">
        <div className="msg-header" style={{justifyContent: isUser ? 'flex-end' : 'flex-start'}}>
          <span className="msg-name">{isUser ? (userName ?? '使用者') : 'NexusAI'}</span>
          {time && <span className="msg-time">{time}</span>}
        </div>
        <div className="msg-bubble md">
          {msg.file && <div className="file-badge">📎 {msg.file}</div>}
          {msg.skillCalls?.map((c,i) => <SkillCallBadge key={i} call={c}/>)}
          {isQuoteFlowMsg ? (
            <div className="quote-block">
              <div className="quote-section">
                <div className="quote-section-title">執行進度</div>
                <div className="quote-progress-text">{progressText}</div>
              </div>
              {reportText && (
                <div className="quote-section">
                  <div className="quote-section-title">最終報價報告</div>
                  {renderMarkdown(reportText)}
                </div>
              )}
            </div>
          ) : (
            renderMarkdown(msg.text)
          )}
          {msg.error && <div className="msg-error">⚠ {msg.error}</div>}
          {msg.streaming && <span className="cursor"/>}
        </div>
      </div>
    </div>
  )
}

// ── MAIN APP ──────────────────────────────────────────────────────────────
export default function App() {
  // ── Auth state ──
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('nexusai_user') ?? 'null') } catch { return null }
  })
  const [loginForm, setLoginForm] = useState({ user: '', pass: '' })
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  // ── Conversation state ──
  const [convList, setConvList]         = useState([])   // sidebar list
  const [convListLoading, setConvListLoading] = useState(false)
  const [convId, setConvId]             = useState(null)
  const [messagesMap, setMessagesMap]   = useState({})   // { convId: Message[] }
  const [historyLoading, setHistoryLoading] = useState(false)

  // ── Chat state ──
  const [input, setInput]               = useState('')
  const [streaming, setStreaming]       = useState(false)
  const [attachedFiles, setAttachedFiles] = useState([])  // { file, uploading, error }

  // ── Side panel state ──
  const [devices, setDevices]           = useState([])
  const [skills, setSkills]             = useState([])
  const [sidebarOpen, setSidebarOpen]   = useState(false)

  // ── Model status state ──
  const [ollamaModel, setOllamaModel]    = useState({ name: 'Llama 3.2', status: 'offline' })
  const [visionModel, setVisionModel]   = useState({ name: 'Vision', status: 'offline' })
  const [mathModel, setMathModel]       = useState({ name: 'Math', status: 'offline' })

  // ── Parameter modal state ──
  const [paramModalOpen, setParamModalOpen] = useState(false)
  const [paramModalType, setParamModalType] = useState(null)  // 'query_quote' or 'new_quote'
  const [paramForm, setParamForm] = useState({
    material: '',
    surface: '',
    heatTreat: '',
    roughness: '',
    position: '',
    size: '',
    company: ''
  })
  const [quoteOptionsLoading, setQuoteOptionsLoading] = useState(false)
  const [quoteOptions, setQuoteOptions] = useState({
    materials: [],
    surfaces: [],
    heatTreats: [],
    roughnesses: [],
    positionTolerances: [],
    sizeTolerances: [],
  })

  const messagesEndRef = useRef(null)
  const fileInputRef   = useRef(null)
  const textareaRef    = useRef(null)
  const abortRef       = useRef(null)

  const currentKey = convId ?? 'new'
  const messages   = messagesMap[currentKey] ?? []

  const isLoggedIn = !!user

  // ── Scroll to bottom ──
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── Load devices + skills + models after login ──
  useEffect(() => {
    if (!isLoggedIn) return
    loadDevices()
    loadSkills()
    loadConversations()
    loadModelStatuses()
  }, [isLoggedIn])

  // ── Poll devices every 15s ──
  useEffect(() => {
    if (!isLoggedIn) return
    const id = setInterval(loadDevices, 15000)
    return () => clearInterval(id)
  }, [isLoggedIn])

  // ── Poll model statuses every 30s ──
  useEffect(() => {
    if (!isLoggedIn) return
    const id = setInterval(loadModelStatuses, 30000)
    return () => clearInterval(id)
  }, [isLoggedIn])

  async function loadModelStatuses() {
    try {
      const [ollama, vision, math] = await Promise.all([
        getOllamaModel().catch(() => ({ name: 'Llama 3.2', status: 'offline' })),
        getVisionModel().catch(() => ({ name: 'Vision', status: 'offline' })),
        getMathModel().catch(() => ({ name: 'Math', status: 'offline' }))
      ])
      setOllamaModel(ollama)
      setVisionModel(vision)
      setMathModel(math)
    } catch { /* silent */ }
  }

  async function loadDevices() {
    try {
      const data = await getDevices()
      setDevices(data)
    } catch { /* silent */ }
  }

  async function loadSkills() {
    try {
      const data = await getSkills()
      setSkills(data)
    } catch { /* silent */ }
  }

  async function loadConversations() {
    setConvListLoading(true)
    try {
      const data = await getConversations()
      setConvList(data)
    } catch { /* silent */ }
    finally { setConvListLoading(false) }
  }

  async function loadQuoteOptionsData() {
    setQuoteOptionsLoading(true)
    try {
      const data = await getQuoteOptions()
      setQuoteOptions({
        materials: data.materials ?? [],
        surfaces: data.surfaces ?? [],
        heatTreats: data.heatTreats ?? [],
        roughnesses: data.roughnesses ?? [],
        positionTolerances: data.positionTolerances ?? [],
        sizeTolerances: data.sizeTolerances ?? [],
      })
    } catch {
      setQuoteOptions({
        materials: [],
        surfaces: [],
        heatTreats: [],
        roughnesses: [],
        positionTolerances: [],
        sizeTolerances: [],
      })
    } finally {
      setQuoteOptionsLoading(false)
    }
  }

  // ── LOGIN ──
  const handleLogin = async () => {
    if (!loginForm.user || !loginForm.pass) return
    setLoginLoading(true)
    setLoginError('')
    try {
      const data = await login(loginForm.user, loginForm.pass)
      localStorage.setItem('nexusai_token', data.token)
      const userInfo = { username: data.username, role: data.role, avatar: data.username.charAt(0).toUpperCase() }
      localStorage.setItem('nexusai_user', JSON.stringify(userInfo))
      setUser(userInfo)
    } catch (e) {
      setLoginError(e.message ?? '登入失敗，請確認帳號密碼')
    } finally {
      setLoginLoading(false)
    }
  }

  // ── LOGOUT ──
  const handleLogout = async () => {
    abortRef.current?.abort()
    await logout()
    setUser(null)
    setConvId(null)
    setMessagesMap({})
    setConvList([])
    setInput('')
    setAttachedFiles([])
    setSidebarOpen(false)
    setLoginForm({ user: '', pass: '' })
  }

  // ── NEW CHAT ──
  const handleNewChat = async () => {
    setSidebarOpen(false)
    try {
      const conv = await createConversation()
      setConvId(conv.id)
      setConvList(prev => [conv, ...prev])
      setMessagesMap(prev => ({ ...prev, [conv.id]: [] }))
    } catch {
      // fallback: use local 'new' key
      setConvId(null)
    }
  }

  // ── SELECT HISTORY ──
  const handleSelectHistory = useCallback(async (hid) => {
    setSidebarOpen(false)
    if (hid === convId) return
    setConvId(hid)
    if (messagesMap[hid]) return  // already loaded

    setHistoryLoading(true)
    try {
      const msgs = await getMessages(hid)
      // Normalize API response to local shape
      const normalized = msgs.map(m => ({
        id: m.id,
        role: m.role,
        ts: new Date(m.timestamp).getTime(),
        text: m.text,
        file: m.file ?? null,
        skillCalls: (m.skillCalls ?? []).map(sc => ({
          name: sc.name,
          args: sc.args,
          result: sc.result,
          done: sc.done,
        })),
        skillsDone: true,
      }))
      setMessagesMap(prev => ({ ...prev, [hid]: normalized }))
    } catch {
      setMessagesMap(prev => ({ ...prev, [hid]: [] }))
    } finally {
      setHistoryLoading(false)
    }
  }, [convId, messagesMap])

  // ── DELETE CONVERSATION ──
  const handleDeleteConv = async (e, hid) => {
    e.stopPropagation()
    try {
      await deleteConversation(hid)
      setConvList(prev => prev.filter(c => c.id !== hid))
      setMessagesMap(prev => { const n = {...prev}; delete n[hid]; return n })
      if (convId === hid) setConvId(null)
    } catch { /* silent */ }
  }

  // ── SEND MESSAGE ──
  const handleSend = useCallback(async () => {
    if (!input.trim() || streaming) return

    const text = input.trim()
    setInput('')

    // Ensure we have a conversation
    let currentConvId = convId
    if (!currentConvId) {
      try {
        const conv = await createConversation()
        currentConvId = conv.id
        setConvId(conv.id)
        setConvList(prev => [conv, ...prev])
        setMessagesMap(prev => ({ ...prev, [conv.id]: [] }))
      } catch { return }
    }

    const fileName = null

    // Add user message locally
    const userMsgId = `u_${Date.now()}`
    setMessagesMap(prev => ({
      ...prev,
      [currentConvId]: [...(prev[currentConvId] ?? []), {
        id: userMsgId, role: 'user', ts: Date.now(), text, file: fileName,
      }]
    }))

    // Add AI placeholder
    const aiMsgId = `a_${Date.now()}`
    setMessagesMap(prev => ({
      ...prev,
      [currentConvId]: [...(prev[currentConvId] ?? []), {
        id: aiMsgId, role: 'ai', ts: Date.now(),
        text: '', skillCalls: [], skillsDone: false, streaming: true,
      }]
    }))

    setStreaming(true)
    const abort = new AbortController()
    abortRef.current = abort

    try {
      await streamChat(currentConvId, text, null, {
        onSkillStart: (name, args) => {
          setMessagesMap(prev => ({
            ...prev,
            [currentConvId]: (prev[currentConvId] ?? []).map(m =>
              m.id === aiMsgId
                ? { ...m, skillCalls: [...(m.skillCalls ?? []), { name, args, done: false }] }
                : m
            )
          }))
        },
        onSkillDone: (name, result) => {
          setMessagesMap(prev => ({
            ...prev,
            [currentConvId]: (prev[currentConvId] ?? []).map(m =>
              m.id === aiMsgId
                ? {
                    ...m,
                    skillsDone: true,
                    skillCalls: (m.skillCalls ?? []).map(sc =>
                      sc.name === name ? { ...sc, result, done: true } : sc
                    )
                  }
                : m
            )
          }))
        },
        onToken: (token) => {
          setMessagesMap(prev => ({
            ...prev,
            [currentConvId]: (prev[currentConvId] ?? []).map(m =>
              m.id === aiMsgId ? { ...m, text: (m.text ?? '') + token, skillsDone: true } : m
            )
          }))
        },
        onDone: () => {
          setMessagesMap(prev => ({
            ...prev,
            [currentConvId]: (prev[currentConvId] ?? []).map(m =>
              m.id === aiMsgId ? { ...m, streaming: false, skillsDone: true } : m
            )
          }))
          setStreaming(false)
          // Refresh conversation list to update preview/title
          loadConversations()
        },
        onError: (err) => {
          setMessagesMap(prev => ({
            ...prev,
            [currentConvId]: (prev[currentConvId] ?? []).map(m =>
              m.id === aiMsgId ? { ...m, streaming: false, error: err, text: '' } : m
            )
          }))
          setStreaming(false)
        },
      }, abort.signal)
    } catch (e) {
      if (e.name !== 'AbortError') {
        setMessagesMap(prev => ({
          ...prev,
          [currentConvId]: (prev[currentConvId] ?? []).map(m =>
            m.id === aiMsgId
              ? { ...m, streaming: false, error: e.message ?? '連線失敗', text: '' }
              : m
          )
        }))
      }
      setStreaming(false)
    }
  }, [input, streaming, attachedFiles, convId])

  const openNewQuoteModal = async () => {
    setParamModalType('new_quote')
    setParamForm({
      material: '', surface: '', heatTreat: '', roughness: '', position: '', size: '', company: ''
    })
    setParamModalOpen(true)
    await loadQuoteOptionsData()
  }

  // ── FILE UPLOAD (for quote flow) ──
  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files)
    e.target.value = ''

    const cadFile = files.find(file => {
      const ext = file.name.split('.').pop()?.toLowerCase()
      return ['step', 'stp', 'prt'].includes(ext)
    })

    if (!cadFile) return

    setAttachedFiles([{ id: `tmp_${Date.now()}_${cadFile.name}`, file: cadFile, uploading: false }])
    await openNewQuoteModal()
  }

  const handleSkillClick = (skill) => {
    if (skill.label === '查詢報價') {
      // Auto-fill today's date in YYYY/MM/DD format
      const today = new Date()
      const dateStr = `${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}`
      setInput(`請執行 ${skill.label} - 日期: ${dateStr}`)
      textareaRef.current?.focus()
    } else if (skill.label === '新增報價') {
      openNewQuoteModal()
    } else {
      // Default behavior
      setInput(`請執行 ${skill.label}`)
      textareaRef.current?.focus()
    }
  }

  const explainQuoteFailureWithLLM = async (currentConvId, rawError) => {
    const aiMsgId = `a_${Date.now()}_quote_err`
    setMessagesMap(prev => ({
      ...prev,
      [currentConvId]: [...(prev[currentConvId] ?? []), {
        id: aiMsgId, role: 'ai', ts: Date.now(), text: '', skillCalls: [], skillsDone: true, streaming: true,
      }]
    }))

    setStreaming(true)
    const abort = new AbortController()
    abortRef.current = abort

    const prompt = `你是工廠報價助手。請將以下新增報價失敗內容，整理成給使用者看的繁體中文說明，包含：1) 失敗原因 2) 下一步處理建議。\n\n錯誤內容：${rawError}`

    try {
      await streamChat(currentConvId, prompt, null, {
        onToken: (token) => {
          setMessagesMap(prev => ({
            ...prev,
            [currentConvId]: (prev[currentConvId] ?? []).map(m =>
              m.id === aiMsgId ? { ...m, text: (m.text ?? '') + token } : m
            )
          }))
        },
        onDone: () => {
          setMessagesMap(prev => ({
            ...prev,
            [currentConvId]: (prev[currentConvId] ?? []).map(m =>
              m.id === aiMsgId ? { ...m, streaming: false } : m
            )
          }))
          setStreaming(false)
          loadConversations()
        },
        onError: () => {
          setMessagesMap(prev => ({
            ...prev,
            [currentConvId]: (prev[currentConvId] ?? []).map(m =>
              m.id === aiMsgId ? { ...m, streaming: false, error: rawError } : m
            )
          }))
          setStreaming(false)
        },
      }, abort.signal)
    } catch {
      setMessagesMap(prev => ({
        ...prev,
        [currentConvId]: (prev[currentConvId] ?? []).map(m =>
          m.id === aiMsgId ? { ...m, streaming: false, error: rawError } : m
        )
      }))
      setStreaming(false)
    }
  }

  const handleParamSubmit = async (data) => {
    if (paramModalType !== 'new_quote') return

    const cadFile = attachedFiles.find(f => {
      const ext = f.file?.name?.split('.').pop()?.toLowerCase()
      return ['step', 'stp', 'prt'].includes(ext)
    })
    if (!cadFile?.file) return

    let currentConvId = convId
    if (!currentConvId) {
      try {
        const conv = await createConversation()
        currentConvId = conv.id
        setConvId(conv.id)
        setConvList(prev => [conv, ...prev])
        setMessagesMap(prev => ({ ...prev, [conv.id]: [] }))
      } catch {
        return
      }
    }

    setParamModalOpen(false)

    const findLabel = (list, id) => list.find(x => x.id === id)?.label ?? id
    const userText = `新增報價\n- 材料: ${findLabel(quoteOptions.materials, data.material)}\n- 表面處理: ${findLabel(quoteOptions.surfaces, data.surface)}\n- 熱處理: ${findLabel(quoteOptions.heatTreats, data.heatTreat)}\n- 粗糙度: ${findLabel(quoteOptions.roughnesses, data.roughness)}\n- 型位公差: ${findLabel(quoteOptions.positionTolerances, data.position)}\n- 尺寸公差: ${findLabel(quoteOptions.sizeTolerances, data.size)}\n- 公司: ${data.company}`

    const userMsgId = `u_${Date.now()}_quote`
    setMessagesMap(prev => ({
      ...prev,
      [currentConvId]: [...(prev[currentConvId] ?? []), {
        id: userMsgId,
        role: 'user',
        ts: Date.now(),
        text: userText,
        file: cadFile.file.name,
      }]
    }))

    const aiMsgId = `a_${Date.now()}_quote`
    setMessagesMap(prev => ({
      ...prev,
      [currentConvId]: [...(prev[currentConvId] ?? []), {
        id: aiMsgId,
        role: 'ai',
        ts: Date.now(),
        text: '新增報價流程啟動中...\n',
        skillCalls: [],
        skillsDone: false,
        quoteReportStarted: false,
        streaming: true,
      }]
    }))

    const stepNames = {
      save_file: 'save_file',
      extract: 'extract',
      predict: 'predict',
      calc: 'calc',
      save: 'save',
    }

    const formData = new FormData()
    formData.append('material_id', data.material)
    formData.append('surface_id', data.surface)
    formData.append('heat_treat_id', data.heatTreat)
    formData.append('roughness_id', data.roughness)
    formData.append('position_tolerance_id', data.position)
    formData.append('size_tolerance_id', data.size)
    formData.append('company_name', data.company)
    if (currentConvId) formData.append('conversation_id', currentConvId)
    formData.append('cad_file', cadFile.file)

    setStreaming(true)
    const abort = new AbortController()
    abortRef.current = abort

    try {
      await submitQuoteStream(formData, {
        onEvent: (evt) => {
          if (evt.type === 'step_start') {
            setMessagesMap(prev => ({
              ...prev,
              [currentConvId]: (prev[currentConvId] ?? []).map(m => {
                if (m.id !== aiMsgId) return m
                const exists = (m.skillCalls ?? []).some(sc => sc.name === stepNames[evt.step])
                return {
                  ...m,
                  skillCalls: exists
                    ? (m.skillCalls ?? [])
                    : [...(m.skillCalls ?? []), { name: stepNames[evt.step] ?? evt.step, args: {}, done: false }],
                  text: `${m.text ?? ''}- 開始: ${evt.stepMessage ?? evt.step}\n`,
                }
              })
            }))
          }

          if (evt.type === 'step_done') {
            setMessagesMap(prev => ({
              ...prev,
              [currentConvId]: (prev[currentConvId] ?? []).map(m => {
                if (m.id !== aiMsgId) return m
                return {
                  ...m,
                  skillCalls: (m.skillCalls ?? []).map(sc =>
                    sc.name === (stepNames[evt.step] ?? evt.step) ? { ...sc, done: true, result: evt.stepData } : sc
                  ),
                  text: `${m.text ?? ''}- 完成: ${evt.stepMessage ?? evt.step}\n`,
                }
              })
            }))
          }

          if (evt.type === 'token' && evt.token) {
            setMessagesMap(prev => ({
              ...prev,
              [currentConvId]: (prev[currentConvId] ?? []).map(m => {
                if (m.id !== aiMsgId) return m
                const prefix = m.quoteReportStarted ? '' : '\n【報價報告】\n'
                return {
                  ...m,
                  quoteReportStarted: true,
                  text: `${m.text ?? ''}${prefix}${evt.token}`,
                }
              })
            }))
          }
        },
      }, abort.signal)

      setMessagesMap(prev => ({
        ...prev,
        [currentConvId]: (prev[currentConvId] ?? []).map(m =>
          m.id === aiMsgId
            ? { ...m, streaming: false, skillsDone: true, text: `${m.text ?? ''}\n✓ 新增報價完成` }
            : m
        )
      }))
      setStreaming(false)
      setAttachedFiles([])
      setParamForm({ material: '', surface: '', heatTreat: '', roughness: '', position: '', size: '', company: '' })
      loadConversations()
      setTimeout(() => textareaRef.current?.focus(), 100)
    } catch (e) {
      const detailsText = e?.details ? `\n${JSON.stringify(e.details)}` : ''
      const rawError = `${e?.message ?? '新增報價失敗'}${detailsText}`

      setMessagesMap(prev => ({
        ...prev,
        [currentConvId]: (prev[currentConvId] ?? []).map(m =>
          m.id === aiMsgId ? { ...m, streaming: false, error: rawError, skillsDone: true } : m
        )
      }))
      setStreaming(false)
      await explainQuoteFailureWithLLM(currentConvId, rawError)
      setTimeout(() => textareaRef.current?.focus(), 100)
    }
  }

  const handleParamCancel = () => {
    setParamModalOpen(false)
    setAttachedFiles([])
    setTimeout(() => textareaRef.current?.focus(), 100)
  }

  const handleKeyDown = e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  // ── LOGIN SCREEN ──
  if (!isLoggedIn) {
    return (
      <>
        <style>{styles}</style>
        <div className="login-wrap">
          <div className="login-bg"/>
          <div className="login-card">
            <div className="login-logo">
              <div className="logo-mark">Sachi</div>
              <div className="logo-text">Nexus<span>AI</span></div>
            </div>
            <div className="login-title">系統登入</div>
            <div className="login-sub">// NEXUSAI_PLATFORM v2.1</div>
            {loginError && <div className="login-error">{loginError}</div>}
            <div>
              <div className="form-group">
                <label className="form-label">員工帳號</label>
                <input className="form-input" placeholder="請輸入帳號"
                  value={loginForm.user} disabled={loginLoading}
                  onChange={e => setLoginForm(p => ({...p, user: e.target.value}))}
                  onKeyDown={e => e.key==='Enter' && handleLogin()}/>
              </div>
              <div className="form-group">
                <label className="form-label">密碼</label>
                <input type="password" className="form-input" placeholder="請輸入密碼"
                  value={loginForm.pass} disabled={loginLoading}
                  onChange={e => setLoginForm(p => ({...p, pass: e.target.value}))}
                  onKeyDown={e => e.key==='Enter' && handleLogin()}/>
              </div>
              <button className="btn-primary" onClick={handleLogin} disabled={loginLoading}>
                {loginLoading ? '登入中...' : '登入系統 →'}
              </button>
            </div>
            <div className="login-footer">© 2026 NEXUSAI PLATFORM · SECURE LOGIN</div>
          </div>
        </div>
      </>
    )
  }

  const convTitle = convList.find(c => c.id === convId)?.title ?? null

  // ── MAIN APP ──
  return (
    <>
      <style>{styles}</style>
      <div className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)}/>
      <div className="app hide-right-panel">

        {/* TOPBAR */}
        <div className="topbar">
          <button className="hamburger" onClick={() => setSidebarOpen(o => !o)}>☰</button>
          <div className="topbar-logo">
            <div className="logo-mark">Sachi</div>
            <div className="logo-text">Nexus<span>AI</span></div>
          </div>
          <div className="topbar-title">工廠智能助手</div>
          <div className="topbar-spacer"/>
          <div className="topbar-status">
            <div className={`status-dot ${ollamaModel.status === 'online' ? '' : 'offline'}`}/>
            <span>OLLAMA · {ollamaModel.name} · 本地部署</span>
          </div>
          <div className="topbar-status">
            <div className={`status-dot ${visionModel.status === 'online' ? '' : 'offline'}`}/>
            <span>特徵辨識 · {visionModel.name} · 本地部署</span>
          </div>
          <div className="topbar-status">
            <div className={`status-dot ${mathModel.status === 'online' ? '' : 'offline'}`}/>
            <span>數學模型 · {mathModel.name} · 本地部署</span>
          </div>
          <div className="topbar-user">
            <div className="user-info">
              <div className="user-name">{user.username}</div>
              <div className="user-role">{user.role}</div>
            </div>
            <div className="user-avatar">{user.avatar}</div>
          </div>
          <button className="logout-btn" title="登出" onClick={handleLogout}>⏻</button>
        </div>

        {/* SIDEBAR */}
        <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-section">
            <button className="new-chat-btn" onClick={handleNewChat}>＋ 新對話</button>
          </div>
          <div className="sidebar-section" style={{paddingBottom:4}}>
            <div className="sidebar-label">對話歷史</div>
          </div>
          <div className="history-list">
            {convListLoading
              ? <div className="sidebar-loading">載入中...</div>
              : convList.map(h => (
                  <div key={h.id}
                    className={`history-item ${convId === h.id ? 'active' : ''}`}
                    onClick={() => handleSelectHistory(h.id)}>
                    <div className="history-title">{h.title}</div>
                    <div className="history-meta">
                      {new Date(h.updatedAt).toLocaleString('zh-TW', { month:'numeric', day:'numeric', hour:'2-digit', minute:'2-digit' })}
                    </div>
                    <div className="history-preview">{h.preview}</div>
                    <button className="history-delete" title="刪除"
                      onClick={e => handleDeleteConv(e, h.id)}>✕</button>
                  </div>
                ))
            }
          </div>
        </div>

        {/* CHAT */}
        <div className="chat-area">
          {skills.length > 0 && (
            <div hidden className="skills-toolbar">
              {skills.map(s => (
                <div key={s.id} className="skill-item"
                  onClick={() => handleSkillClick(s)}
                  title={s.label}>
                  <div className="skill-icon" style={{color: s.color}}>{s.icon}</div>
                  <div className="skill-label">{s.label}</div>
                </div>
              ))}
            </div>
          )}
          <div className="chat-messages">
            {historyLoading ? (
              <div className="history-loading">
                <div className="loading-dots"><span/><span/><span/></div>
                載入對話中...
              </div>
            ) : messages.length === 0 ? (
              <div className="welcome">
                <div className="welcome-icon">🏭</div>
                <div className="welcome-title">NexusAI 待命中</div>
                <div className="welcome-sub">// 輸入問題或點選上方 Skill 開始使用</div>
              </div>
            ) : (
              <>
                {convTitle && <div className="history-divider">{convTitle}</div>}
                {messages.map(m => (
                  <Message key={m.id} msg={m}
                    userAvatar={user.avatar} userName={user.username}/>
                ))}
              </>
            )}
            <div ref={messagesEndRef}/>
          </div>

          <div className="input-area">
            {attachedFiles.length > 0 && (
              <div className="input-files">
                {attachedFiles.map((f) => (
                  <div key={f.id} className={`file-chip ${f.uploading ? 'uploading' : ''}`}>
                    📎 {f.file.name} {f.uploading ? '上傳中...' : f.error ? '❌' : ''}
                    {!f.uploading && (
                      <button className="file-chip-remove"
                        onClick={() => setAttachedFiles(p => p.filter(x => x.id !== f.id))}>✕</button>
                    )}
                  </div>
                ))}
              </div>
            )}
            <div className="input-row">
              <textarea ref={textareaRef} className="input-box"
                placeholder="輸入問題，例如：查詢設備 M-001 狀態..."
                value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown} rows={1}/>
              <div className="input-actions">
                <input ref={fileInputRef} type="file" className="upload-input"
                  onChange={handleFileChange} accept=".step,.stp,.prt"/>
                <button className="icon-btn" title="上傳"
                  onClick={() => fileInputRef.current?.click()}>⤴</button>
                <button className="send-btn" onClick={handleSend}
                  disabled={!input.trim() || streaming}>▶</button>
              </div>
            </div>
            <div className="input-hint">
              <span><span className="hint-key">Enter</span> 送出</span>
              <span><span className="hint-key">Shift+Enter</span> 換行</span>
              {streaming && <span style={{color:'var(--nv)',marginLeft:'auto'}}>⟳ AI 回應中...</span>}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div hidden className="right-panel">
          <div className="panel-section">
            <div className="panel-title">設備狀態</div>
            {devices.length === 0
              ? <div className="panel-placeholder">載入中...</div>
              : devices.map(d => (
                  <div key={d.id} className="device-item">
                    <div className={`device-dot ${d.status}`}/>
                    <div style={{flex:1,minWidth:0}}>
                      <div className="device-name">{d.name}</div>
                      <div className="device-id">{d.id}</div>
                    </div>
                    <div className={`device-temp ${d.temperature > 80 ? 'hot' : ''}`}>
                      {d.temperature}°C
                    </div>
                  </div>
                ))
            }
          </div>

        </div>

      </div>

      <ParameterModal 
        type={paramModalType}
        open={paramModalOpen}
        onClose={handleParamCancel}
        onSubmit={handleParamSubmit}
        initialData={paramForm}
        options={quoteOptions}
        optionsLoading={quoteOptionsLoading}
        hasCadFile={attachedFiles.some(f => {
          const ext = f.file?.name?.split('.').pop()?.toLowerCase()
          return ['step', 'stp', 'prt'].includes(ext)
        })}
      />
    </>
  )
}
