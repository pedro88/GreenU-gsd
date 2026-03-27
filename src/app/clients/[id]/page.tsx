'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: 'PENDING' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';
  dueDate: string | null;
  garden: { id: string; name: string } | null;
  assignee: { id: string; name: string | null; email: string };
}

interface ClientDetail {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  notes: string | null;
  tasks: Task[];
}

interface Garden {
  id: string;
  name: string;
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  IN_PROGRESS: 'bg-blue-100 text-blue-800 border-blue-200',
  DONE: 'bg-green-100 text-green-800 border-green-200',
  CANCELLED: 'bg-gray-100 text-gray-500 border-gray-200',
};

const statusLabels: Record<string, string> = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  DONE: 'Done',
  CANCELLED: 'Cancelled',
};

export default function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [client, setClient] = useState<ClientDetail | null>(null);
  const [gardens, setGardens] = useState<Garden[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewTask, setShowNewTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskGarden, setNewTaskGarden] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('');
  const [newTaskDue, setNewTaskDue] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    async function load() {
      const { id } = await params;
      try {
        const [clientRes, gardensRes] = await Promise.all([
          fetch(`/api/clients/${id}`),
          fetch('/api/gardens'),
        ]);
        if (clientRes.ok) setClient(await clientRes.json());
        if (gardensRes.ok) {
          const data = await gardensRes.json();
          setGardens(data);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !newTaskAssignee) return;
    if (!client) return;
    setCreating(true);
    try {
      const res = await fetch(`/api/clients/${client.id}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTaskTitle.trim(),
          gardenId: newTaskGarden || undefined,
          assigneeId: newTaskAssignee,
          dueDate: newTaskDue || undefined,
        }),
      });
      if (res.ok) {
        const task = await res.json();
        setClient((prev) =>
          prev ? { ...prev, tasks: [...prev.tasks, task] } : prev
        );
        setNewTaskTitle('');
        setNewTaskGarden('');
        setNewTaskAssignee('');
        setNewTaskDue('');
        setShowNewTask(false);
      }
    } catch {
      // ignore
    } finally {
      setCreating(false);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const updated = await res.json();
        setClient((prev) =>
          prev
            ? {
                ...prev,
                tasks: prev.tasks.map((t) => (t.id === taskId ? { ...t, status: updated.status } : t)),
              }
            : prev
        );
      }
    } catch {
      // ignore
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-600 border-t-transparent" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-8 text-center">
        <div className="text-4xl mb-3">🔍</div>
        <h3 className="font-semibold text-gray-700">Client not found</h3>
        <Link href="/clients" className="text-sm text-green-600 hover:text-green-700 mt-2 inline-block">
          ← Back to clients
        </Link>
      </div>
    );
  }

  const tasksByStatus = {
    PENDING: client.tasks.filter((t) => t.status === 'PENDING'),
    IN_PROGRESS: client.tasks.filter((t) => t.status === 'IN_PROGRESS'),
    DONE: client.tasks.filter((t) => t.status === 'DONE'),
    CANCELLED: client.tasks.filter((t) => t.status === 'CANCELLED'),
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/clients" className="text-gray-400 hover:text-gray-600 transition-colors">
          ← Back
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
          {client.email && <div className="text-sm text-gray-500">{client.email}</div>}
        </div>
      </div>

      {/* Client info */}
      {(client.email || client.phone) && (
        <div className="bg-white rounded-xl p-4 shadow mb-6">
          <dl className="space-y-2 text-sm">
            {client.email && (
              <div className="flex gap-4">
                <dt className="text-gray-500 w-16">Email</dt>
                <dd className="text-gray-900">{client.email}</dd>
              </div>
            )}
            {client.phone && (
              <div className="flex gap-4">
                <dt className="text-gray-500 w-16">Phone</dt>
                <dd className="text-gray-900">{client.phone}</dd>
              </div>
            )}
          </dl>
        </div>
      )}

      {/* Tasks section */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Tasks</h2>
        <button
          onClick={() => setShowNewTask(true)}
          className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-500 transition-colors"
        >
          + New task
        </button>
      </div>

      {/* New task form */}
      {showNewTask && (
        <form onSubmit={handleCreateTask} className="mb-6 bg-white rounded-xl p-4 shadow space-y-3">
          <div>
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Task title"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <select
                value={newTaskGarden}
                onChange={(e) => setNewTaskGarden(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
              >
                <option value="">No garden</option>
                {gardens.map((g) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>
            <div>
              <input
                type="date"
                value={newTaskDue}
                onChange={(e) => setNewTaskDue(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
              />
            </div>
          </div>
          <div>
            <input
              type="text"
              value={newTaskAssignee}
              onChange={(e) => setNewTaskAssignee(e.target.value)}
              placeholder="Assignee user ID (email)"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={creating || !newTaskTitle.trim()}
              className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-500 disabled:opacity-50 transition-colors"
            >
              {creating ? 'Creating...' : 'Create task'}
            </button>
            <button
              type="button"
              onClick={() => setShowNewTask(false)}
              className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Tasks by status */}
      {client.tasks.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-xl shadow">
          <div className="text-3xl mb-2">📋</div>
          <p className="text-sm text-gray-400">No tasks yet</p>
        </div>
      ) : (
        <div className="space-y-6">
          {(['PENDING', 'IN_PROGRESS', 'DONE', 'CANCELLED'] as const).map((status) => {
            const tasks = tasksByStatus[status];
            if (tasks.length === 0) return null;
            return (
              <div key={status}>
                <h3 className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                  {statusLabels[status]} ({tasks.length})
                </h3>
                <div className="space-y-2">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className={`bg-white rounded-xl p-4 shadow border ${statusColors[task.status]}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 text-sm">{task.title}</div>
                          <div className="text-xs text-gray-400 mt-0.5 space-x-1">
                            {task.garden && (
                              <span>🌱 {task.garden.name}</span>
                            )}
                            <span>Assigned to: {task.assignee.name || task.assignee.email}</span>
                            {task.dueDate && (
                              <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                        <select
                          value={task.status}
                          onChange={(e) => handleStatusChange(task.id, e.target.value)}
                          className="text-xs border border-gray-200 rounded px-2 py-1 bg-white text-gray-600 focus:outline-none"
                        >
                          {Object.entries(statusLabels).map(([val, label]) => (
                            <option key={val} value={val}>{label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
