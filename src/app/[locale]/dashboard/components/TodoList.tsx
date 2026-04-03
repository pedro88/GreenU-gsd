'use client';

import React, { useState, useEffect } from 'react';
import TodoItem from './TodoItem';

interface Todo {
  id: string;
  title: string;
  description?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';
  dueDate?: string;
  gardenId: string;
  gardenName: string;
}

interface TodoListProps {
  userId: string;
  groupBy?: 'garden' | 'type';
}

export default function TodoList({ userId, groupBy = 'garden' }: TodoListProps) {
  const [groupedTodos, setGroupedTodos] = useState<Record<string, Todo[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const response = await fetch(`/api/dashboard/todos?userId=${userId}&groupBy=${groupBy}`);
        if (!response.ok) throw new Error('Erreur lors du chargement');
        const data = await response.json();
        setGroupedTodos(data);
      } catch (err) {
        setError('Impossible de charger les tâches');
      } finally {
        setLoading(false);
      }
    };

    fetchTodos();
  }, [userId, groupBy]);

  const handleToggle = async (todoId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/dashboard/todos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ todoId, status: newStatus }),
      });

      if (!response.ok) throw new Error('Erreur lors de la mise à jour');

      setGroupedTodos((prev) => {
        const newGroups = { ...prev };
        let movedTodo: Todo | null = null;

        for (const group of Object.keys(newGroups)) {
          const todoIndex = newGroups[group].findIndex((t) => t.id === todoId);
          if (todoIndex !== -1) {
            movedTodo = { ...newGroups[group][todoIndex], status: newStatus as Todo['status'] };
            newGroups[group] = newGroups[group].filter((t) => t.id !== todoId);
            break;
          }
        }

        if (movedTodo) {
          if (newStatus === 'DONE') {
            const today = 'Terminées';
            if (!newGroups[today]) newGroups[today] = [];
            newGroups[today].unshift(movedTodo);
          } else {
            const targetGroup = Object.keys(newGroups).find((g) => g !== 'Terminées');
            if (targetGroup) {
              newGroups[targetGroup] = [movedTodo, ...newGroups[targetGroup]];
            }
          }
        }

        return newGroups;
      });
    } catch (err) {
      console.error('Erreur:', err);
    }
  };

  if (loading) {
    return (
      <div className="pixel-card">
        <div className="px-4 py-3 border-b-[3px] border-ink-700">
          <h3 className="font-pixel text-sm font-bold uppercase tracking-widest text-ink-900">
            Tâches en cours
          </h3>
        </div>
        <div className="p-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse" style={{ background: '#e8dfd0' }}></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pixel-card">
        <div className="px-4 py-3 border-b-[3px] border-ink-700">
          <h3 className="font-pixel text-sm font-bold uppercase tracking-widest text-ink-900">
            Tâches en cours
          </h3>
        </div>
        <div className="p-4">
          <p className="font-pixel text-sm" style={{ color: '#ff5526' }}>
            {error}
          </p>
        </div>
      </div>
    );
  }

  const totalTasks = Object.values(groupedTodos).flat().length;

  return (
    <div className="pixel-card">
      <div
        className="px-4 py-3 border-b-[3px] border-ink-700 flex items-center justify-between"
        style={{ background: '#e8dfd0' }}
      >
        <h3 className="font-pixel text-sm font-bold uppercase tracking-widest text-ink-900">
          Tâches en cours
        </h3>
        <span className="font-pixel text-xs" style={{ color: '#7a6330' }}>
          {totalTasks} tâche{totalTasks !== 1 ? 's' : ''}
        </span>
      </div>

      {totalTasks === 0 ? (
        <div className="p-6 text-center">
          <svg
            className="mx-auto h-12 w-12 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="#9a7b3c"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
            />
          </svg>
          <p className="font-pixel text-sm" style={{ color: '#7a6330' }}>
            Aucune tâche pour le moment
          </p>
          <p className="text-xs mt-1" style={{ color: '#9a7b3c' }}>
            Vos tâches apparaîtront ici automatiquement
          </p>
        </div>
      ) : (
        <div className="max-h-[500px] overflow-y-auto">
          {Object.entries(groupedTodos).map(([group, todos]) => (
            <div key={group} className="p-4">
              {Object.keys(groupedTodos).length > 1 && (
                <h4
                  className="text-xs font-pixel font-bold uppercase tracking-wider mb-3"
                  style={{ color: '#5c8a4a' }}
                >
                  {group}
                </h4>
              )}
              <div className="space-y-2">
                {todos.map((todo) => (
                  <TodoItem
                    key={todo.id}
                    id={todo.id}
                    title={todo.title}
                    description={todo.description}
                    status={todo.status}
                    dueDate={todo.dueDate}
                    gardenName={todo.gardenName}
                    onToggle={handleToggle}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {totalTasks > 0 && (
        <div className="px-4 py-3 border-t-[3px] border-ink-700" style={{ background: '#e8dfd0' }}>
          <button type="button" className="btn-pixel btn-pixel-sm text-xs">
            Voir toutes les tâches
          </button>
        </div>
      )}
    </div>
  );
}
