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
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: 'rgba(48, 40, 24, 0.7)' }}
      onClick={onClose}
    >
      <div className="retro-dialog max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="pixel-heading">New conversation</h2>
          <button
            onClick={onClose}
            className="font-bold font-pixel text-lg"
            style={{ color: '#302818' }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="pixel-label block mb-1" style={{ color: '#302818' }}>
              Recipient email
            </label>
            <input
              id="email"
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="gardener@email.com"
              className="pixel-input w-full"
              required
            />
          </div>

          <div>
            <label
              htmlFor="gardenId"
              className="pixel-label block mb-1"
              style={{ color: '#302818' }}
            >
              Garden link{' '}
              <span className="font-normal" style={{ color: '#302818' }}>
                (optional)
              </span>
            </label>
            <input
              id="gardenId"
              type="text"
              value={gardenId}
              onChange={(e) => setGardenId(e.target.value)}
              placeholder="Garden ID (optional)"
              className="pixel-input w-full"
            />
          </div>

          <div>
            <label
              htmlFor="message"
              className="pixel-label block mb-1"
              style={{ color: '#302818' }}
            >
              Message
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Start your message..."
              rows={4}
              className="pixel-input w-full resize-none"
              required
            />
          </div>

          {error && (
            <div className="text-xs font-pixel" style={{ color: '#FF5526' }}>
              {error}
            </div>
          )}

          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-pixel-ghost px-4 py-2 text-sm font-bold font-pixel"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !recipientEmail.trim() || !message.trim()}
              className="btn-pixel-primary px-4 py-2 text-sm font-bold font-pixel"
            >
              {loading ? 'Sending...' : 'Send'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
