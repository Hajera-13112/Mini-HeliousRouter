import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send, Plus, Terminal, RefreshCw, User, Sparkles, Trash2, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = 'http://localhost:5001/api';

function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [promptCount, setPromptCount] = useState(0);
  const [showLogs, setShowLogs] = useState(true);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load sessions and current session on mount
  useEffect(() => {
    loadSessions();
    loadCurrentSession();
  }, []);

  // Load current session when currentSessionId changes
  useEffect(() => {
    if (currentSessionId) {
      loadCurrentSession();
    }
  }, [currentSessionId]);

  // Fetch logs periodically
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await axios.get(`${API_BASE}/logs`);
        setLogs(res.data);
      } catch (err) {
        console.error('Failed to fetch logs', err);
      }
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  const loadSessions = async () => {
    try {
      const res = await axios.get(`${API_BASE}/sessions`);
      setSessions(res.data.sessions);
      setCurrentSessionId(res.data.currentSessionId);
    } catch (err) {
      console.error('Failed to load sessions', err);
    }
  };

  const loadCurrentSession = async () => {
    try {
      const res = await axios.get(`${API_BASE}/session`);
      const { conversations, promptCount, sessionId } = res.data;

      // Convert stored conversations to message format
      const loadedMessages = [];
      conversations.forEach(conv => {
        loadedMessages.push({ role: 'user', content: conv.prompt });
        loadedMessages.push({ role: 'bot', content: conv.response, provider: conv.provider });
      });

      setMessages(loadedMessages);
      setPromptCount(promptCount || 0);
      if (sessionId) setCurrentSessionId(sessionId);
    } catch (err) {
      console.error('Failed to load session', err);
    }
  };

  const handleNewChat = async () => {
    try {
      const res = await axios.post(`${API_BASE}/session/new`);
      setCurrentSessionId(res.data.id);
      setMessages([]);
      setPromptCount(0);
      await loadSessions();
    } catch (err) {
      console.error('Failed to create session', err);
    }
  };

  const handleSwitchSession = async (sessionId) => {
    try {
      await axios.post(`${API_BASE}/session/switch/${sessionId}`);
      setCurrentSessionId(sessionId);
      await loadCurrentSession();
      await loadSessions();
    } catch (err) {
      console.error('Failed to switch session', err);
    }
  };

  const handleDeleteSession = async (sessionId, e) => {
    e.stopPropagation();
    if (!confirm('Delete this conversation?')) return;

    try {
      await axios.delete(`${API_BASE}/session/${sessionId}`);
      await loadSessions();
      if (currentSessionId === sessionId) {
        await loadCurrentSession();
      }
    } catch (err) {
      console.error('Failed to delete session', err);
    }
  };

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/chat`, { prompt: input });
      const botMessage = { role: 'bot', content: res.data.response, provider: res.data.provider };
      setMessages(prev => [...prev, botMessage]);
      setPromptCount(prev => prev + 1);
      await loadSessions(); // Refresh sidebar to update session title
    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', content: 'Error: Failed to fetch response.', isError: true }]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('This will delete ALL conversations. Continue?')) return;
    try {
      await axios.post(`${API_BASE}/reset`);
      setMessages([]);
      setLogs(['System Reset...']);
      setPromptCount(0);
      setSessions([]);
      setCurrentSessionId(null);
    } catch (err) {
      console.error('Reset failed', err);
    }
  };

  return (
    <div className="gemini-container">
      {/* Sidebar */}
      <div className="sidebar">
        <button className="new-chat-btn" onClick={handleNewChat}>
          <Plus size={20} />
          <span>New chat</span>
        </button>

        {/* Session List */}
        <div style={{ flex: 1, overflowY: 'auto', marginTop: '10px' }}>
          {sessions.map(session => (
            <div
              key={session.id}
              className={`session-item ${session.id === currentSessionId ? 'active' : ''}`}
              onClick={() => handleSwitchSession(session.id)}
            >
              <MessageSquare size={16} style={{ minWidth: '16px' }} />
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {session.title}
              </span>
              <button
                className="session-delete-btn"
                onClick={(e) => handleDeleteSession(session.id, e)}
                title="Delete"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        <div style={{ padding: '10px', fontSize: '12px', color: 'var(--text-secondary)', borderTop: '1px solid #2d2d2d' }}>
          Session Prompts: {promptCount}
        </div>
        <button className="reset-btn" onClick={handleReset}>
          <RefreshCw size={14} style={{ marginRight: 6 }} />
          Reset All
        </button>
      </div>

      {/* Main Chat */}
      <div className="main-chat">
        <header className="chat-header">
          <h1>Helious Router <span style={{ fontSize: '10px', verticalAlign: 'middle', opacity: 0.7 }}>v2.0</span></h1>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: '#00ff41', fontFamily: 'monospace' }}>STATUS: ACTIVE</span>
            <button
              onClick={() => setShowLogs(!showLogs)}
              style={{
                background: 'none',
                border: '1px solid #00ff41',
                color: '#00ff41',
                fontSize: '10px',
                padding: '4px 8px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontFamily: 'monospace'
              }}
            >
              {showLogs ? 'HIDE LOGS' : 'VIEW LOGS'}
            </button>
          </div>
        </header>

        <div className="chat-content">
          <AnimatePresence>
            {messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ textAlign: 'center', marginTop: '100px' }}
              >
                <h2 style={{ fontSize: '40px', marginBottom: '20px', fontWeight: 500 }}>Hello, Helious</h2>
                <p style={{ color: '#c4c7c5' }}>How can I help you today?</p>
              </motion.div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`message ${msg.role}`}>
                <div className={`avatar ${msg.role === 'user' ? 'user' : 'gemini'}`}>
                  {msg.role === 'user' ? <User size={18} /> : <Sparkles size={18} />}
                </div>
                <div className="message-text">
                  {msg.content}
                  {msg.provider && (
                    <div style={{ fontSize: '10px', marginTop: '8px', opacity: 0.5, fontStyle: 'italic' }}>
                      Provider: {msg.provider}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </AnimatePresence>
          {loading && (
            <div className="message bot">
              <div className="avatar gemini">
                <Sparkles size={18} className="animate-pulse" />
              </div>
              <div className="message-text">
                <div className="typing-indicator">
                  <span></span><span></span><span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* HUD Log Panel */}
        <AnimatePresence>
          {showLogs && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: 20 }}
              className="log-panel"
            >
              <div style={{ borderBottom: '1px solid #00ff41', paddingBottom: '5px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Terminal size={12} /> ROUTER LOGS
                </span>
                <button
                  onClick={() => setShowLogs(false)}
                  style={{ background: 'none', border: 'none', color: '#00ff41', cursor: 'pointer', padding: '0 4px', fontSize: '14px' }}
                >
                  ×
                </button>
              </div>
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {logs.slice().reverse().map((log, i) => (
                  <div key={i} className="log-entry">{log}</div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Area */}
        <div className="input-container">
          <form className="input-box" onSubmit={handleSend}>
            <input
              type="text"
              placeholder="Enter a prompt here..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <div className="input-actions">
              <button type="submit" className="action-btn">
                <Send size={20} />
              </button>
            </div>
          </form>
          <p style={{ textAlign: 'center', fontSize: '11px', color: '#919191', marginTop: '15px' }}>
            Helious Router can route between Gemini, GPT-3.5, and Llama 3 automatically.
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
