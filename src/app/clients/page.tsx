'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  notes: string | null;
  createdAt: string;
  _count: { tasks: number };
  tasks: Array<{
    id: string;
    title: string;
    status: string;
    dueDate: string | null;
  }>;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    async function fetchClients() {
      try {
        const res = await fetch('/api/clients');
        if (res.ok) setClients(await res.json());
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    fetchClients();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim(), email: newEmail.trim() }),
      });
      if (res.ok) {
        const client = await res.json();
        setClients((prev) => [{ ...client, _count: { tasks: 0 }, tasks: [] }, ...prev]);
        setNewName('');
        setNewEmail('');
        setShowNew(false);
      }
    } catch {
      // ignore
    } finally {
      setCreating(false);
    }
  };

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    IN_PROGRESS: 'bg-blue-100 text-blue-800',
    DONE: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-gray-100 text-gray-500',
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/profile" className="text-gray-400 hover:text-gray-600 transition-colors">
            ← Back
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-500 transition-colors"
        >
          + New client
        </button>
      </div>

      {/* New client form */}
      {showNew && (
        <form onSubmit={handleCreate} className="mb-6 bg-white rounded-xl p-4 shadow space-y-3">
          <div>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Client name"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
              autoFocus
            />
          </div>
          <div>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="Email (optional)"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={creating || !newName.trim()}
              className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-500 disabled:opacity-50 transition-colors"
            >
              {creating ? 'Creating...' : 'Add client'}
            </button>
            <button
              type="button"
              onClick={() => { setShowNew(false); setNewName(''); setNewEmail(''); }}
              className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Client list */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-600 border-t-transparent" />
        </div>
      ) : clients.length === 0 && !showNew ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">👥</div>
          <h3 className="font-semibold text-gray-700 mb-1">No clients yet</h3>
          <p className="text-sm text-gray-400 mb-4">Add your first client to start managing their garden tasks.</p>
          <button
            onClick={() => setShowNew(true)}
            className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-500 transition-colors"
          >
            Add your first client
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {clients.map((client) => (
            <Link
              key={client.id}
              href={`/clients/${client.id}`}
              className="block bg-white rounded-xl p-4 shadow hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-gray-900">{client.name}</div>
                  {client.email && (
                    <div className="text-xs text-gray-400 mt-0.5">{client.email}</div>
                  )}
                </div>
                <div className="text-xs text-gray-400 whitespace-nowrap">
                  {client._count.tasks} task{client._count.tasks !== 1 ? 's' : ''}
                </div>
              </div>
              {client.tasks.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {client.tasks.slice(0, 3).map((task) => (
                    <span
                      key={task.id}
                      className={`text-xs px-2 py-0.5 rounded-full ${statusColors[task.status] ?? 'bg-gray-100 text-gray-600'}`}
                    >
                      {task.title.length > 25 ? task.title.slice(0, 25) + '...' : task.title}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
