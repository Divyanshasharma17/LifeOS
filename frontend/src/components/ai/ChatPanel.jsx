import { useEffect, useRef, useState } from "react";
import { Send, Trash2, Sparkles, User as UserIcon } from "lucide-react";
import { aiCoachApi } from "../../api/aiCoach";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";

const SUGGESTIONS = [
  "What should I focus on today?",
  "Which goals are falling behind?",
  "How can I improve my productivity?",
  "What habits should I prioritize?",
];

export default function ChatPanel() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const toast = useToast();
  const scrollRef = useRef(null);

  useEffect(() => {
    aiCoachApi.chatHistory()
      .then(setMessages)
      .catch(() => toast.error("Could not load chat history."))
      .finally(() => setLoadingHistory(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  const sendMessage = async (text) => {
    const content = text ?? input;
    if (!content.trim() || sending) return;
    setInput("");
    setMessages((m) => [...m, { id: `local-${Date.now()}`, role: "user", content }]);
    setSending(true);
    try {
      const res = await aiCoachApi.sendChat(content);
      setMessages((m) => [...m, res.reply]);
    } catch (err) {
      toast.error(err.message || "The AI Coach couldn't respond. Try again.");
    } finally {
      setSending(false);
    }
  };

  const clearHistory = async () => {
    if (!window.confirm("Clear the entire chat history?")) return;
    await aiCoachApi.clearChat();
    setMessages([]);
  };

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <span><Sparkles size={16} /> Ask the AI Coach</span>
        <button className="icon-btn" onClick={clearHistory} aria-label="Clear chat history" title="Clear chat history">
          <Trash2 size={15} />
        </button>
      </div>

      <div className="chat-messages" ref={scrollRef}>
        {loadingHistory ? (
          <p className="chat-empty-hint">Loading conversation…</p>
        ) : messages.length === 0 ? (
          <div className="chat-empty-hint">
            <p>Ask me anything about your goals, tasks, or how to use your time better.</p>
          </div>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={`chat-bubble-row ${m.role === "user" ? "chat-bubble-row-user" : ""}`}>
              <span className={`chat-avatar ${m.role === "user" ? "chat-avatar-user" : "chat-avatar-ai"}`}>
                {m.role === "user" ? <UserIcon size={13} /> : <Sparkles size={13} />}
              </span>
              <div className={`chat-bubble ${m.role === "user" ? "chat-bubble-user" : "chat-bubble-ai"}`}>
                {m.content}
              </div>
            </div>
          ))
        )}
        {sending && (
          <div className="chat-bubble-row">
            <span className="chat-avatar chat-avatar-ai"><Sparkles size={13} /></span>
            <div className="chat-bubble chat-bubble-ai chat-bubble-typing">
              <span /><span /><span />
            </div>
          </div>
        )}
      </div>

      {messages.length === 0 && !loadingHistory && (
        <div className="chat-suggestions">
          {SUGGESTIONS.map((s) => (
            <button key={s} onClick={() => sendMessage(s)}>{s}</button>
          ))}
        </div>
      )}

      <form
        className="chat-input-row"
        onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
      >
        <input
          type="text"
          placeholder="Ask about your goals, tasks, or productivity…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={sending}
        />
        <button type="submit" className="icon-btn chat-send-btn" disabled={sending || !input.trim()} aria-label="Send message">
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
