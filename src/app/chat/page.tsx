'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import { usePowerfulMode, type PowerfulModeSources as PowerfulModeSourcesType } from '@/hooks/usePowerfulMode';
import {
  PowerfulModeBadge,
  PowerfulModeToggle,
} from '@/components/PowerfulModeToggle';
import { MessageActions } from '@/components/chat/MessageActions';
import { ChatItem } from '@/components/chat/ChatItem';
import { handleApiError } from '@/lib/errorHandlers';
import { handleApiResponse, isRateLimitError } from '@/lib/rateLimitHandler';

interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  isPowerful?: boolean;
  provider?: string | null;
}

const getErrorMessage = (error: unknown) => (
  error instanceof Error ? error.message : 'Unknown error'
);

function ChatSidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onShareSession,
  onRenameSession,
  onDeleteSession,
  user,
}: {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onShareSession: (id: string) => void;
  onRenameSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  user: User;
}) {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const grouped = useMemo(() => {
    const now = new Date();
    const today = now.toDateString();
    const yesterdayDate = new Date(now);
    yesterdayDate.setDate(now.getDate() - 1);
    const yesterday = yesterdayDate.toDateString();

    return sessions.reduce<Record<string, ChatSession[]>>((acc, session) => {
      const date = new Date(session.created_at).toDateString();
      const label = date === today
        ? 'Today'
        : date === yesterday
          ? 'Yesterday'
          : new Date(session.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
      if (!acc[label]) acc[label] = [];
      acc[label].push(session);
      return acc;
    }, {});
  }, [sessions]);

  return (
    <aside
      className="chat-sidebar chat-sidebar-panel"
      style={{
        width: 260,
        minWidth: 260,
        height: '100vh',
        background: 'rgba(255,255,255,0.03)',
        borderRight: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 10,
      }}
    >
      <div style={{ padding: '20px 16px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#a78bfa' }}>Thinkior</span>
          <span style={{ fontSize: '0.72rem', opacity: 0.5, marginTop: 2 }}>General Chat</span>
        </div>

        <button
          onClick={onNewChat}
          style={{
            width: '100%',
            padding: '10px 14px',
            borderRadius: 10,
            background: 'rgba(124,58,237,0.15)',
            border: '1px solid rgba(124,58,237,0.3)',
            color: '#a78bfa',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(124,58,237,0.25)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(124,58,237,0.15)'; }}
        >
          <span style={{ fontSize: '1.1rem' }}>+</span>
          New Chat
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px' }}>
        {Object.entries(grouped).map(([label, groupSessions]) => (
          <div key={label} style={{ marginBottom: 8 }}>
            <p
              style={{
                fontSize: '0.72rem',
                opacity: 0.45,
                padding: '6px 8px 4px',
                margin: 0,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {label}
            </p>
            {groupSessions.map((session) => (
              <ChatItem
                key={session.id}
                session={session}
                isActive={activeSessionId === session.id}
                onSelect={onSelectSession}
                onShare={onShareSession}
                onRename={onRenameSession}
                onDelete={onDeleteSession}
              />
            ))}
          </div>
        ))}

        {sessions.length === 0 && (
          <p style={{ fontSize: '0.8rem', opacity: 0.4, padding: '12px 10px' }}>
            No conversations yet. Start chatting!
          </p>
        )}
      </div>

      <div
        style={{
          padding: '12px 16px',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: '#7c3aed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.85rem',
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {user?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'}
            </p>
            <p style={{ margin: 0, fontSize: '0.7rem', opacity: 0.45, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.email}
            </p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          style={{
            width: '100%',
            padding: '8px',
            borderRadius: 8,
            background: 'none',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'inherit',
            cursor: 'pointer',
            fontSize: '0.82rem',
            opacity: 0.7,
          }}
        >
          → Sign Out
        </button>
      </div>
    </aside>
  );
}

function ChatMain({
  messages,
  isLoading,
  isPowerfulMode,
  isPowerfulLoading,
  currentStatus,
  onTogglePowerfulMode,
  onSend,
}: {
  messages: ChatMessage[];
  isLoading: boolean;
  isPowerfulMode: boolean;
  isPowerfulLoading: boolean;
  currentStatus: string;
  onTogglePowerfulMode: () => void;
  onSend: (message: string, imageFile?: File | null) => void;
}) {
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = () => {
    if ((!input.trim() && !selectedImage) || isLoading || isPowerfulLoading) return;
    onSend(input.trim(), selectedImage);
    setInput('');
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        alert('Image too large. Please select an image under 4MB.');
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestions = [
    { icon: '💡', text: 'Explain quantum computing simply' },
    { icon: '📝', text: 'Help me write a professional email' },
    { icon: '🧮', text: 'Solve a math problem step by step' },
    { icon: '🇮🇳', text: 'Tell me about Indian history' },
    { icon: '💼', text: 'How to start a business in India' },
    { icon: '🎯', text: 'Give me career advice' },
  ];

  return (
    <div
      className="chat-main chat-main-wrapper"
      style={{
        marginLeft: 260,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg, #0a0a0f)',
      }}
    >
      <div className="messages-list" style={{ flex: 1, overflowY: 'auto', padding: '24px 0' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 24px' }}>
          {messages.length === 0 && !isLoading && (
            <div style={{ textAlign: 'center', paddingTop: '15vh' }}>
              <div style={{ fontSize: '3rem', marginBottom: 16 }}>💬</div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 600, marginBottom: 8 }}>
                How can I help you today?
              </h2>
              <p style={{ opacity: 0.5, marginBottom: 40, fontSize: '0.95rem' }}>
                Ask me anything — I am your general AI assistant.
              </p>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: 10,
                  maxWidth: 640,
                  margin: '0 auto',
                }}
              >
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion.text}
                    onClick={() => onSend(suggestion.text)}
                    style={{
                      padding: '14px 16px',
                      borderRadius: 12,
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: 'inherit',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: '0.85rem',
                      lineHeight: 1.4,
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(124,58,237,0.1)';
                      e.currentTarget.style.borderColor = 'rgba(124,58,237,0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                    }}
                  >
                    <span style={{ fontSize: '1.1rem', display: 'block', marginBottom: 4 }}>{suggestion.icon}</span>
                    {suggestion.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className="message-container group"
              style={{
                marginBottom: 24,
                display: 'flex',
                flexDirection: 'column',
                alignItems: message.role === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              <div
                style={{
                  fontSize: '0.72rem',
                  opacity: 0.45,
                  marginBottom: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: message.role === 'assistant' ? 'space-between' : 'flex-end',
                  width: message.role === 'assistant' ? '85%' : 'auto',
                  gap: 6,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {message.role === 'user' ? <>You <span>👤</span></> : <><span>🤖</span> Thinkior</>}
                </div>
                {message.role === 'assistant' && (
                  <MessageActions messageText={message.content} />
                )}
              </div>
              <div
                className="message-bubble"
                style={{
                  maxWidth: '85%',
                  padding: '12px 16px',
                  borderRadius: message.role === 'user' ? '18px 18px 4px 18px' : '4px 18px 18px 18px',
                  background: message.role === 'user' ? 'rgba(124,58,237,0.25)' : 'rgba(255,255,255,0.06)',
                  border: message.role === 'user' ? '1px solid rgba(124,58,237,0.3)' : '1px solid rgba(255,255,255,0.08)',
                  fontSize: '0.925rem',
                  lineHeight: 1.7,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  position: 'relative',
                }}
              >
                  {message.isPowerful && message.role === 'assistant' && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <PowerfulModeBadge />
                      {message.provider && (
                        <span style={{ fontSize: '10px', opacity: 0.5, fontStyle: 'italic', color: '#f7c948' }}>
                          Source: {message.provider.charAt(0).toUpperCase() + message.provider.slice(1)}
                        </span>
                      )}
                    </div>
                  )}
                  {message.content}
              </div>
            </div>
          ))}

          {(isLoading || isPowerfulLoading) && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: '0.72rem', opacity: 0.45, marginBottom: 6 }}>
                🤖 Thinkior
              </div>
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: '4px 18px 18px 18px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex',
                  gap: 4,
                  alignItems: 'center',
                  width: 'fit-content',
                }}
              >
                {[0, 1, 2].map((dot) => (
                  <div
                    key={dot}
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: '#a78bfa',
                      animation: `bounce 1.2s ease-in-out ${dot * 0.2}s infinite`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div
        className="chat-input-area"
        style={{
          padding: '16px 24px 24px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          background: 'inherit',
        }}
      >
        <div style={{ maxWidth: 760, margin: '0 auto', position: 'relative' }}>
          <div className="toggle-bar" style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 10 }}>
            <PowerfulModeToggle
              isPowerfulMode={isPowerfulMode}
              onToggle={onTogglePowerfulMode}
              disabled={isLoading || isPowerfulLoading}
              currentStatus={currentStatus}
            />
          </div>

          {imagePreview && (
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: 12 }}>
              <img src={imagePreview} alt="Preview" style={{ height: 80, borderRadius: 8, objectFit: 'cover' }} />
              <button
                onClick={() => { setSelectedImage(null); setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                style={{
                  position: 'absolute', top: -6, right: -6,
                  background: '#ef4444', color: '#fff', border: 'none',
                  borderRadius: '50%', width: 20, height: 20,
                  fontSize: '12px', cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center'
                }}
              >
                ×
              </button>
            </div>
          )}

          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                position: 'absolute', left: 12, zIndex: 1,
                background: 'none', border: 'none', color: '#9ca3af',
                fontSize: '1.2rem', cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center'
              }}
              title="Upload image (max 4MB)"
            >
              📎
            </button>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageSelect}
              style={{ display: 'none' }}
            />
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message Thinkior..."
              className="chat-input-box"
              rows={1}
              style={{
                width: '100%',
                padding: '14px 52px 14px 44px',
                borderRadius: 14,
                background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'inherit',
              fontSize: '0.95rem',
              lineHeight: 1.5,
              resize: 'none',
              outline: 'none',
              minHeight: 52,
              maxHeight: 200,
              overflow: 'auto',
              boxSizing: 'border-box',
              fontFamily: 'inherit',
              transition: 'border-color 0.15s',
            }}
            onFocus={(e) => { e.target.style.borderColor = 'rgba(124,58,237,0.5)'; }}
            onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; }}
            onInput={(e) => {
              const element = e.target as HTMLTextAreaElement;
              element.style.height = 'auto';
              element.style.height = `${Math.min(element.scrollHeight, 200)}px`;
            }}
          />

          <button
            onClick={handleSend}
            disabled={(!input.trim() && !selectedImage) || isLoading || isPowerfulLoading}
            className="send-button"
            style={{
              position: 'absolute',
              right: 10,
              bottom: 10,
              width: 34,
              height: 34,
              borderRadius: 8,
              background: (input.trim() || selectedImage) && !isLoading && !isPowerfulLoading ? '#7c3aed' : 'rgba(255,255,255,0.08)',
              border: 'none',
              color: '#fff',
              cursor: (input.trim() || selectedImage) && !isLoading && !isPowerfulLoading ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1rem',
              transition: 'all 0.15s',
            }}
          >
            ↑
          </button>
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.72rem', opacity: 0.3, marginTop: 8 }}>
          Thinkior can make mistakes. Verify important information.
        </p>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default function ChatPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [user, setUser] = useState<User | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const {
    isPowerfulMode,
    togglePowerfulMode,
    isPowerfulLoading,
    askPowerful,
    currentStatus,
    setCurrentStatus,
  } = usePowerfulMode();

  const loadSessions = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('id, title, created_at, updated_at')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(100); // show up to 100 past chats

      if (error) {
        console.error('[Chat] Failed to load sessions:', error.message);
        return;
      }

      console.log('[Chat] Loaded sessions:', data?.length || 0);
      setSessions((data || []) as ChatSession[]);
    } catch (err: unknown) {
      console.error('[Chat] loadSessions error:', getErrorMessage(err));
    }
  }, [supabase]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push('/auth?role=general');
        return;
      }
      setUser(data.user);
      loadSessions(data.user.id); // load on mount
    });
  }, [loadSessions, router, supabase]);

  const handleNewChat = () => {
    setActiveSessionId(null);
    setMessages([]);
    // Do NOT clear sessions — history must stay visible
    // Sessions are already loaded and should remain in sidebar
    console.log('[Chat] New chat started — sessions preserved in sidebar');
  };

  const handleSelectSession = async (sessionId: string) => {
    setActiveSessionId(sessionId);
    setMessages([]); // clear current messages first
    setIsLoading(false);

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('role, content, created_at')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true }); // oldest first

      if (error) {
        console.error('[Chat] Failed to load messages:', error.message);
        return;
      }

      console.log('[Chat] Loaded messages for session:', data?.length || 0);
      setMessages(((data || []) as Array<{ role: 'user' | 'assistant'; content: string }>).map((message) => ({
        role: message.role,
        content: message.content,
      })));

    } catch (err: unknown) {
      console.error('[Chat] handleSelectSession error:', getErrorMessage(err));
    }
  };

  const handleShareSession = async (sessionId: string) => {
    try {
      const url = `${window.location.origin}/chat?session=${sessionId}`;
      await navigator.clipboard.writeText(url);
      alert('Chat link copied to clipboard!');
    } catch (err) {
      console.error('Failed to share:', err);
    }
  };

  const handleRenameSession = async (sessionId: string) => {
    const newTitle = prompt('Enter new chat title:');
    if (!newTitle?.trim()) return;

    try {
      const { error } = await supabase
        .from('chat_sessions')
        .update({ title: newTitle.trim() })
        .eq('id', sessionId);

      if (error) throw error;
      await loadSessions(user?.id || '');
    } catch (err) {
      console.error('Failed to rename:', err);
      alert('Failed to rename chat');
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to delete this chat?')) return;

    try {
      const { error } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;
      
      if (activeSessionId === sessionId) {
        handleNewChat();
      }
      
      await loadSessions(user?.id || '');
    } catch (err) {
      console.error('Failed to delete:', err);
      alert('Failed to delete chat');
    }
  };

  const handleSend = async (userMessage: string, imageFile?: File | null) => {
    if (!user || isLoading || isPowerfulLoading) return;

    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: userMessage || '📷 [Image attached]' }];
    setMessages(newMessages);

    // Powerful mode doesn't support images natively yet. Bypass for images.
    if (isPowerfulMode && !imageFile) {
      try {
        const powerfulResult = await askPowerful(newMessages, activeSessionId);

        setMessages((previous) => [...previous, {
          role: 'assistant',
          content: powerfulResult.reply,
          isPowerful: true,
          provider: powerfulResult.provider,
        }]);

        if (powerfulResult.sessionId && !activeSessionId) {
          setActiveSessionId(powerfulResult.sessionId);
        }

        await loadSessions(user.id);
      } catch (err: unknown) {
        console.error('[Chat] powerful handleSend error:', err);
        setMessages((previous) => [...previous, {
          role: 'assistant',
          content: getErrorMessage(err) || 'Powerful Mode failed. Please try again.',
        }]);
      } finally {
        setCurrentStatus('idle');
      }
      return;
    }

    setIsLoading(true);

    try {
      let response;
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        formData.append('message', userMessage);
        if (activeSessionId) formData.append('sessionId', activeSessionId);
        
        const initialResponse = await fetch('/api/general-chat', {
          method: 'POST',
          body: formData,
        });
        response = await handleApiResponse(initialResponse, imageFile ? 'Image Upload' : 'General Chat');
      } else {
        const initialResponse = await fetch('/api/general-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: newMessages,
            sessionId: activeSessionId,
            powerfulMode: isPowerfulMode,
          }),
        });
        response = await handleApiResponse(initialResponse, isPowerfulMode ? 'Powerful Mode' : 'General Chat');
      }

      if (isRateLimitError(response)) {
        setMessages((previous) => [...previous, {
          role: 'assistant',
          content: `⚠️ ${response.message}`,
        }]);
        return;
      }

      const data = await response.json();

      if (!response.ok || data.error) {
        // Handle specific error codes gracefully without throwing
        const errorMessage = handleApiError(data.error || 'default');
        
        setMessages((previous) => [...previous, {
          role: 'assistant',
          content: errorMessage,
        }]);
        return;
      }

      // Add assistant reply to messages
      setMessages((previous) => [...previous, { role: 'assistant', content: data.reply }]);

      // Update active session ID if this was a new chat
      if (data.sessionId && !activeSessionId) {
        setActiveSessionId(data.sessionId);
      }

      // CRITICAL FIX: Always reload sessions after a message so sidebar stays current
      await loadSessions(user.id);

    } catch (err: unknown) {
      console.error('[Chat] handleSend error:', err);
      setMessages((previous) => [...previous, {
        role: 'assistant',
        content: 'Sorry, something went wrong. Please try again.',
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div style={{ opacity: 0.5 }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 9,
            display: 'none',
          }}
          className="mobile-chat-overlay"
        />
      )}

      <div className={`chat-sidebar-wrapper ${sidebarOpen ? 'open' : ''}`}>
        <ChatSidebar
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelectSession={(id) => {
            handleSelectSession(id);
            setSidebarOpen(false);
          }}
          onNewChat={() => {
            handleNewChat();
            setSidebarOpen(false);
          }}
          onShareSession={handleShareSession}
          onRenameSession={handleRenameSession}
          onDeleteSession={handleDeleteSession}
          user={user}
        />
      </div>

      <button
        className="chat-mobile-menu"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        ☰
      </button>

      <ChatMain
        messages={messages}
        isLoading={isLoading}
        isPowerfulMode={isPowerfulMode}
        isPowerfulLoading={isPowerfulLoading}
        currentStatus={currentStatus}
        onTogglePowerfulMode={togglePowerfulMode}
        onSend={handleSend}
      />

      <style>{`
        @media (max-width: 768px) {
          .chat-sidebar-wrapper .chat-sidebar-panel {
            transform: translateX(-260px);
            transition: transform 0.25s ease;
          }
          .chat-sidebar-wrapper.open .chat-sidebar-panel { transform: translateX(0); }
          .mobile-chat-overlay { display: block !important; }
          .chat-mobile-menu {
            display: flex; position: fixed; top: 12px; left: 12px;
            z-index: 11; width: 40px; height: 40px;
            align-items: center; justify-content: center;
            background: rgba(255,255,255,0.08);
            border: 1px solid rgba(255,255,255,0.15);
            border-radius: 8px; color: inherit; font-size: 1.2rem;
            cursor: pointer;
          }
          .chat-main-wrapper { margin-left: 0 !important; padding-top: 52px; }
        }
        @media (min-width: 769px) {
          .chat-mobile-menu { display: none !important; }
          .chat-sidebar-wrapper .chat-sidebar-panel { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
