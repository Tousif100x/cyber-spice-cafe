import { useState, useRef, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import axios from "axios";
import AdminDashboard from "./components/AdminDashboard";

// ─── TYPING DOTS ───────────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div className="flex justify-start px-4 py-1">
      <div
        style={{
          background: "#1d6cf0",
          borderRadius: "18px 18px 18px 4px",
          padding: "12px 16px",
          display: "flex",
          gap: "5px",
          alignItems: "center",
        }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "white",
              display: "inline-block",
              animation: "sparkyBounce 1s infinite ease-in-out",
              animationDelay: `${i * 0.18}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── MESSAGE BUBBLE ─────────────────────────────────────────────────────────────
function Bubble({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        padding: "3px 16px",
        animation: "sparkyFadeIn 0.22s ease-out both",
      }}
    >
      <div
        style={{
          maxWidth: "72%",
          padding: "11px 16px",
          borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
          // USER = white bg, dark text | BOT = blue bg, white text
          background: isUser ? "#ffffff" : "#1d6cf0",
          color: isUser ? "#111827" : "#ffffff",
          fontSize: 14,
          lineHeight: 1.55,
          wordBreak: "break-word",
          whiteSpace: "pre-wrap",
          boxShadow: isUser
            ? "0 1px 4px rgba(0,0,0,0.18)"
            : "0 1px 8px rgba(29,108,240,0.35)",
        }}
      >
        {msg.content}
      </div>
    </div>
  );
}

// ─── HEADER ─────────────────────────────────────────────────────────────────────
function Header() {
  const navigate = useNavigate();
  return (
    <div
      style={{
        background: "#111111",
        borderBottom: "1px solid #222",
        padding: "14px 18px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        flexShrink: 0,
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #1d6cf0, #6c3cf0)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 20,
          flexShrink: 0,
        }}
      >
        🍜
      </div>

      {/* Name & Status */}
      <div style={{ flex: 1 }}>
        <div style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 15, letterSpacing: 0.3 }}>
          Cyber Spice Cafe
        </div>
        <div style={{ color: "#34d399", fontSize: 11, marginTop: 2, display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#34d399", display: "inline-block" }} />
          Sparky is online
        </div>
      </div>

      {/* Admin Button */}
      <button
        onClick={() => navigate("/admin")}
        style={{
          background: "rgba(99,102,241,0.15)",
          border: "1px solid rgba(99,102,241,0.3)",
          borderRadius: 20,
          padding: "5px 14px",
          color: "#a5b4fc",
          fontSize: 12,
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Admin
      </button>
    </div>
  );
}

// ─── INPUT BAR ───────────────────────────────────────────────────────────────────
function InputBar({ onSend, disabled }) {
  const [val, setVal] = useState("");

  const send = () => {
    const t = val.trim();
    if (!t || disabled) return;
    onSend(t);
    setVal("");
  };

  return (
    <div
      style={{
        background: "#111111",
        borderTop: "1px solid #222",
        padding: "12px 14px",
        flexShrink: 0,
      }}
    >
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <input
          type="text"
          value={val}
          disabled={disabled}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
          placeholder="Type a message..."
          style={{
            flex: 1,
            background: "#1c1c1c",
            border: "1px solid #2a2a2a",
            borderRadius: 999,
            padding: "11px 20px",
            color: "#f1f5f9",
            fontSize: 14,
            outline: "none",
            opacity: disabled ? 0.5 : 1,
          }}
        />
        <button
          onClick={send}
          disabled={disabled || !val.trim()}
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: disabled || !val.trim() ? "#1a2a4a" : "linear-gradient(135deg, #1d6cf0, #6c3cf0)",
            border: "none",
            cursor: disabled || !val.trim() ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            transition: "opacity 0.2s",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M22 2L11 13" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
      <p style={{ textAlign: "center", fontSize: 10, color: "#4b5563", marginTop: 6 }}>
        Sparky may make mistakes. Verify allergy info directly with the cafe.
      </p>
    </div>
  );
}

// ─── CHAT PAGE ───────────────────────────────────────────────────────────────────
function ChatPage() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! 👋 Welcome to Cyber Spice Cafe! I'm Sparky, your dining assistant.\n\nHow can I spice up your experience today? 🍜" },
  ]);
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const handleSend = async (text) => {
    const userMsg = { role: "user", content: text };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setTyping(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/chat`, {
        messages: updated.map((m) => ({ role: m.role, content: m.content })),
      });
      setMessages([...updated, { role: "assistant", content: res.data.content }]);
    } catch {
      setMessages([...updated, { role: "assistant", content: "⚠️ Connection error. Please try again." }]);
    } finally {
      setTyping(false);
    }
  };

  return (
    <div className="sparky-page">
      <div className="sparky-card">
        <Header />

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", paddingTop: 14, paddingBottom: 8 }} className="sparky-scroll">
          <div style={{ textAlign: "center", fontSize: 11, color: "#4b5563", marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>
            Today
          </div>
          {messages.map((msg, i) => (
            <Bubble key={i} msg={msg} />
          ))}
          {typing && <TypingDots />}
          <div ref={bottomRef} />
        </div>

        <InputBar onSend={handleSend} disabled={typing} />
      </div>
    </div>
  );
}

// ─── ROOT ────────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #000; }
        @keyframes sparkyBounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
        @keyframes sparkyFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .sparky-scroll::-webkit-scrollbar { width: 3px; }
        .sparky-scroll::-webkit-scrollbar-thumb { background: #222; border-radius: 4px; }
        input::placeholder { color: #4b5563; }
        /* ── Responsive Card ── */
        .sparky-page {
          width: 100vw; height: 100vh;
          background: #000;
          display: flex; align-items: center; justify-content: center;
          padding: 16px;
        }
        .sparky-card {
          width: 100%; max-width: 420px;
          height: min(85vh, 720px);
          min-height: 480px;
          background: #0a0a0a;
          border-radius: 24px;
          border: 1px solid #1e1e1e;
          box-shadow: 0 25px 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.03);
          display: flex; flex-direction: column;
          overflow: hidden;
        }
        /* On small screens: fill the entire viewport */
        @media (max-width: 520px) {
          .sparky-page { padding: 0; align-items: stretch; justify-content: stretch; }
          .sparky-card {
            max-width: 100%;
            height: 100vh;
            height: 100dvh;
            min-height: unset;
            border-radius: 0;
            border: none;
            box-shadow: none;
          }
        }
      `}</style>
      <Router>
        <Routes>
          <Route path="/" element={<ChatPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </Router>
    </>
  );
}
