'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  sender: { id: string; name: string | null; email: string; image: string | null };
}

interface Conversation {
  id: string;
  garden: { id: string; name: string } | null;
  participants: Array<{ id: string; name: string | null; email: string; image: string | null }>;
}

interface MessageThreadProps {
  conversationId: string;
  currentUserId: string;
}

/**
 * Formats a message timestamp into a human-readable time string.
 * Shows time only for today's messages, or date+time for older messages.
 * @param dateStr - ISO date string of the message creation time
 * @returns Formatted time string (e.g., "2:30 PM" or "Mar 15, 2:30 PM")
 */
function formatMessageTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}

/**
 * Formats a date string into a relative or absolute date label for message grouping.
 * Returns "Today", "Yesterday", or a full weekday/month/day format.
 * @param dateStr - ISO date string to format
 * @returns Human-readable date label for a message date divider
 */
function formatDateDivider(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

/**
 * Message thread component displaying a conversation with message history and send functionality.
 * Supports infinite scrolling for loading older messages and real-time message sending.
 * @param props - Component props for conversation and user context
 * @param props.conversationId - ID of the conversation to display
 * @param props.currentUserId - ID of the currently authenticated user
 * @returns The rendered message thread with header, messages, and input
 */
export function MessageThread({ conversationId, currentUserId }: MessageThreadProps) {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch conversation and messages
  /**
   * Fetches conversation details and messages from the API.
   * Supports pagination via cursor for loading older messages.
   * @param cursor - Optional pagination cursor for loading older messages
   */
  async function fetchConversation(cursor?: string) {
    try {
      const url = cursor
        ? `/api/conversations/${conversationId}?cursor=${cursor}`
        : `/api/conversations/${conversationId}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setConversation(data.conversation);
        if (cursor) {
          setMessages((prev) => [...prev, ...data.messages]);
        } else {
          setMessages(data.messages);
        }
        setNextCursor(data.nextCursor);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchConversation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (!loading && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    setError('');

    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMessage.trim() }),
      });

      if (res.ok) {
        const message = await res.json();
        setMessages((prev) => [...prev, message]);
        setNewMessage('');
        textareaRef.current?.focus();
      } else {
        const err = await res.json();
        setError(err.error || 'Failed to send message');
      }
    } catch {
      setError('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const loadMore = () => {
    if (nextCursor) {
      fetchConversation(nextCursor);
    }
  };

  // Get title
  const otherParticipants = conversation?.participants.filter((p) => p.id !== currentUserId) ?? [];
  const title = conversation?.garden
    ? `🌱 ${conversation.garden.name}`
    : otherParticipants.length === 1
      ? otherParticipants[0].name || otherParticipants[0].email
      : `${otherParticipants.length} participants`;

  // Group messages by date
  const messagesByDate: Record<string, Message[]> = {};
  for (const msg of messages) {
    const dateKey = new Date(msg.createdAt).toDateString();
    if (!messagesByDate[dateKey]) messagesByDate[dateKey] = [];
    messagesByDate[dateKey].push(msg);
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      {/* Thread header */}
      <div className="flex items-center gap-3 pb-3 border-b border-gray-100 mb-3">
        <Link
          href="/messages"
          className="text-gray-400 hover:text-gray-600 transition-colors text-sm"
        >
          ← Back
        </Link>
        <div>
          <div className="font-semibold text-gray-900 text-sm">{title}</div>
          {conversation?.garden && (
            <Link
              href={`/garden/${conversation.garden.id}`}
              className="text-xs text-green-600 hover:text-green-700"
            >
              View garden →
            </Link>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-3 border-green-600 border-t-transparent" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">
            No messages yet. Start the conversation!
          </div>
        ) : (
          <>
            {nextCursor && (
              <button
                onClick={loadMore}
                className="w-full text-xs text-gray-400 hover:text-gray-600 py-2 transition-colors"
              >
                Load earlier messages
              </button>
            )}
            {Object.entries(messagesByDate).map(([dateKey, msgs]) => (
              <div key={dateKey}>
                <div className="text-center my-4">
                  <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
                    {formatDateDivider(msgs[0].createdAt)}
                  </span>
                </div>
                {msgs.map((msg) => {
                  const isMe = msg.senderId === currentUserId;
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-2`}
                    >
                      <div
                        className={`max-w-[75%] rounded-xl px-4 py-2.5 ${
                          isMe
                            ? 'bg-green-600 text-white rounded-br-sm'
                            : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                        }`}
                      >
                        {!isMe && (
                          <div className="text-xs font-medium opacity-70 mb-0.5">
                            {msg.sender.name || msg.sender.email}
                          </div>
                        )}
                        <div className="text-sm whitespace-pre-wrap break-words">{msg.content}</div>
                        <div className={`text-xs mt-1 opacity-60 ${isMe ? 'text-right' : ''}`}>
                          {formatMessageTime(msg.createdAt)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="flex gap-2">
        <textarea
          ref={textareaRef}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend(e);
            }
          }}
          placeholder="Write a message..."
          rows={2}
          className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-500 resize-none"
        />
        <button
          type="submit"
          disabled={sending || !newMessage.trim()}
          className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-500 disabled:opacity-50 transition-colors text-sm font-medium self-end"
        >
          {sending ? '...' : 'Send'}
        </button>
      </form>
      {error && <div className="text-xs text-red-500 mt-1">{error}</div>}
    </div>
  );
}
