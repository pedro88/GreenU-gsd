'use client';

import React, { useState } from 'react';

interface TodoItemProps {
  id: string;
  title: string;
  description?: string;
  status: string;
  dueDate?: string;
  gardenName: string;
  onToggle: (id: string, newStatus: string) => void;
  onUndo?: (id: string) => void;
}

function formatDueDate(dateStr: string): { text: string; isOverdue: boolean; isDueSoon: boolean } {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / 86400000);

  const isOverdue = diffMs < 0;
  const isDueSoon = diffDays <= 2 && diffDays >= 0;

  let text = '';
  if (diffDays === 0) text = "Aujourd'hui";
  else if (diffDays === 1) text = 'Demain';
  else if (diffDays === -1) text = 'Hier';
  else if (diffDays < -1) text = `Il y a ${Math.abs(diffDays)}j`;
  else text = `Dans ${diffDays}j`;

  return { text, isOverdue, isDueSoon };
}

export default function TodoItem({
  id,
  title,
  description,
  status,
  dueDate,
  gardenName,
  onToggle,
  onUndo,
}: TodoItemProps) {
  const [showUndo, setShowUndo] = useState(false);
  const isCompleted = status === 'DONE';

  const handleToggle = () => {
    const newStatus = isCompleted ? 'PENDING' : 'DONE';
    onToggle(id, newStatus);

    if (newStatus === 'DONE' && onUndo) {
      setShowUndo(true);
      setTimeout(() => setShowUndo(false), 5000);
    }
  };

  const handleUndo = () => {
    if (onUndo) {
      onUndo(id);
      setShowUndo(false);
    }
  };

  const dueDateInfo = dueDate ? formatDueDate(dueDate) : null;

  const getDueDateStyles = () => {
    if (!dueDateInfo || isCompleted) return { bg: '#e8dfd0', color: '#7a6330' };
    if (dueDateInfo.isOverdue) return { bg: '#ffdddd', color: '#cc3322' };
    if (dueDateInfo.isDueSoon) return { bg: '#ffeecc', color: '#cc7711' };
    return { bg: '#e8dfd0', color: '#7a6330' };
  };

  const dueDateStyles = getDueDateStyles();

  return (
    <div
      className={`group relative p-3 transition-all ${isCompleted ? 'opacity-60' : ''}`}
      style={{
        background: '#fff8e7',
        borderLeft: `4px solid ${isCompleted ? '#9a7b3c' : '#4ca64c'}`,
        borderBottom: '2px solid #e8dfd0',
      }}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          type="button"
          onClick={handleToggle}
          className="flex-shrink-0 w-6 h-6 flex items-center justify-center transition-all"
          style={{
            background: isCompleted ? '#4ca64c' : '#fff8e7',
            border: `3px solid ${isCompleted ? '#2d6a2d' : '#5c4b26'}`,
            boxShadow: isCompleted ? 'none' : '2px 2px 0px 0px #302818',
          }}
          aria-label={isCompleted ? 'Marquer comme non terminé' : 'Marquer comme terminé'}
        >
          {isCompleted && (
            <svg
              className="h-3 w-3 text-cream-50"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4
              className="text-sm font-pixel"
              style={{
                color: isCompleted ? '#9a7b3c' : '#302818',
                textDecoration: isCompleted ? 'line-through' : 'none',
              }}
            >
              {title}
            </h4>
            {dueDateInfo && !isCompleted && (
              <span
                className="flex-shrink-0 text-xs font-pixel px-2 py-1"
                style={{
                  background: dueDateStyles.bg,
                  color: dueDateStyles.color,
                  border: `2px solid ${dueDateInfo.isOverdue ? '#cc3322' : dueDateInfo.isDueSoon ? '#cc7711' : '#b09158'}`,
                  boxShadow: '1px 1px 0px 0px #302818',
                }}
              >
                {dueDateInfo.text}
              </span>
            )}
          </div>

          {description && (
            <p
              className="text-sm mt-1 font-body"
              style={{ color: isCompleted ? '#9a7b3c' : '#7a6330' }}
            >
              {description}
            </p>
          )}

          <div className="flex items-center gap-2 mt-2">
            <span
              className="text-xs font-pixel flex items-center gap-1"
              style={{ color: '#5c8a4a' }}
            >
              <svg
                className="w-3 h-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              {gardenName}
            </span>
          </div>
        </div>
      </div>

      {showUndo && (
        <div className="absolute -top-8 left-0 right-0 flex justify-center" style={{ zIndex: 10 }}>
          <div
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-pixel"
            style={{
              background: '#302818',
              color: '#fff8e7',
              boxShadow: '2px 2px 0px 0px #5c4b26',
            }}
          >
            <span>Tâche terminée</span>
            <button
              type="button"
              onClick={handleUndo}
              className="font-pixel underline"
              style={{ color: '#ffcc4d' }}
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
