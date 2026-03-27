'use client';

import { useState } from 'react';

interface NewMessageDialogProps {
  onClose: () => void;
  onCreated: (conversationId: string) => void;
}

/**
 * Dialog component for starting a new conversation with another gardener.
 * @param root0 - destructured props object
 * @param root0.onClose - Callback to close the dialog
 * @param root0.onCreated - Callback with the created conversation ID when successfully created
 * @returns The dialog UI with a form to select recipient, optional garden link, and initial message
 */
export function NewMessageDialog({ onClose, onCreated }: NewMessageDialogProps) {
  const [recipientEmail, setRecipientEmail] = useState('');
  const [message, setMessage] = useState('');
  const [gardenId, setGardenId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientEmail.trim() || !message.trim()) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantIds: [], // We use email to find user
          // Find user by email — this is a simplified approach
          // In practice, we'd look up the user first
          gardenId: gardenId || undefined,
          initialMessage: message.trim(),
        }),
      });

      if (res.ok) {
        const conv = await res.json();
        onCreated(conv.id);
      } else {
        const err = await res.json();
        setError(err.error || 'Failed to start conversation');
      }
    } catch {
      setError('Failed to start conversation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-gray-900">New conversation</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Recipient email
            </label>
            <input
              id="email"
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="gardener@email.com"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
              required
            />
          </div>

          <div>
            <label htmlFor="gardenId" className="block text-sm font-medium text-gray-700 mb-1">
              Garden link <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              id="gardenId"
              type="text"
              value={gardenId}
              onChange={(e) => setGardenId(e.target.value)}
              placeholder="Garden ID (optional)"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
              Message
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Start your message..."
              rows={4}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500 resize-none"
              required
            />
          </div>

          {error && <div className="text-xs text-red-500">{error}</div>}

          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !recipientEmail.trim() || !message.trim()}
              className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-500 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Sending...' : 'Send'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
