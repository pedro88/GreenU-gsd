'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { NewMessageDialog } from '@/components/messages/NewMessageDialog';

interface ConversationPreview {
  id: string;
  garden: { id: string; name: string } | null;
  participants: Array<{ id: string; name: string | null; email: string; image: string | null }>;
  otherParticipants: Array<{ id: string; name: string | null; email: string; image: string | null }>;
  lastMessage: {
    id: string;
    content: string;
    senderId: string;
    senderName: string | null;
    createdAt: string;
  } | null;
  updatedAt: string;
  participantCount: number;
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}

function getConversationTitle(conv: ConversationPreview, currentUserId: string): string {
  if (conv.garden) return conv.garden.name;
  if (conv.otherParticipants.length === 1) {
    return conv.otherParticipants[0].name || conv.otherParticipants[0].email;
  }
  return conv.otherParticipants
    .slice(0, 3)
    .map((p) => p.name || p.email)
    .join(', ');
}

export default function MessagesPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<ConversationPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showNewMessage, setShowNewMessage] = useState(false);

  useEffect(() => {
    async function fetchConversations() {
      try {
        const res = await fetch('/api/conversations');
        if (res.ok) {
          const data = await res.json();
          setConversations(data);
          // Get current user ID from first conversation participant or session
          const me = data?.[0]?.participants?.find(
            (p: { id: string }) => p.id !== undefined
          );
          // We need to get the current user separately
          const meRes = await fetch('/api/auth/session');
          const meData = await meRes.json();
          setCurrentUserId(meData?.user?.id ?? null);
        }
      } catch (e) {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    fetchConversations();
  }, []);

  const handleConversationCreated = (conversationId: string) => {
    router.push(`/messages/${conversationId}`);
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/profile" className="text-gray-400 hover:text-gray-600 transition-colors">
            ← Back
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        </div>
        <button
          onClick={() => setShowNewMessage(true)}
          className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-500 transition-colors"
        >
          + New message
        </button>
      </div>

      {/* Inbox */}
      {conversations.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">💬</div>
          <h3 className="font-semibold text-gray-700 mb-1">No messages yet</h3>
          <p className="text-sm text-gray-400 mb-4">
            Start a conversation about a garden or with another gardener.
          </p>
          <button
            onClick={() => setShowNewMessage(true)}
            className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-500 transition-colors"
          >
            Start a conversation
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow divide-y divide-gray-100">
          {conversations.map((conv) => (
            <Link
              key={conv.id}
              href={`/messages/${conv.id}`}
              className="flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors"
            >
              {/* Avatar */}
              <div className="flex-shrink-0">
                {conv.otherParticipants.length === 1 ? (
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-semibold text-sm">
                    {(conv.otherParticipants[0].name || conv.otherParticipants[0].email)[0].toUpperCase()}
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-semibold text-xs">
                    {conv.participantCount}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <div className="font-semibold text-gray-900 text-sm truncate">
                    {getConversationTitle(conv, currentUserId ?? '')}
                  </div>
                  <div className="text-xs text-gray-400 flex-shrink-0">
                    {conv.lastMessage && formatTime(conv.lastMessage.createdAt)}
                  </div>
                </div>
                {conv.garden && (
                  <div className="text-xs text-green-600 mb-0.5">
                    🌱 {conv.garden.name}
                  </div>
                )}
                {conv.lastMessage && (
                  <div className="text-xs text-gray-500 truncate">
                    <span className="font-medium text-gray-600">
                      {conv.lastMessage.senderName || 'You'}:
                    </span>{' '}
                    {conv.lastMessage.content}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* New message dialog */}
      {showNewMessage && (
        <NewMessageDialog
          onClose={() => setShowNewMessage(false)}
          onCreated={handleConversationCreated}
        />
      )}
    </div>
  );
}
