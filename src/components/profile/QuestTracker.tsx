'use client';

import { useEffect, useState } from 'react';

interface Quest {
  id: string;
  progress: number;
  completed: boolean;
  completedAt: string | null;
  quest: {
    title: string;
    description: string;
    targetMetric: string;
    targetValue: number;
    xpReward: number;
    icon: string;
    type: string;
  };
}

interface SeasonalQuest extends Quest {
  quest: Quest['quest'] & {
    seasonStart: string | null;
    seasonEnd: string | null;
  };
}

interface QuestTrackerProps {
  compact?: boolean;
}

/**
 * Retro pixel-style quest tracker showing daily quests and seasonal challenges.
 * Displays progress bars, XP rewards, and completion status.
 * @param props.compact - If true, shows a condensed view for the profile sidebar
 * @returns The quest tracker JSX
 */
export function QuestTracker({ compact = false }: QuestTrackerProps) {
  const [daily, setDaily] = useState<Quest[]>([]);
  const [seasonal, setSeasonal] = useState<SeasonalQuest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuests = async () => {
      try {
        const res = await fetch('/api/quests');
        if (res.ok) {
          const data = await res.json();
          setDaily(data.daily ?? []);
          setSeasonal(data.seasonal ?? []);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };

    fetchQuests();
  }, []);

  if (loading) {
    return (
      <div className="pixel-card p-4">
        <div className="font-pixel text-xs text-ink-500 tracking-widest animate-pulse">
          LOADING QUESTS...
        </div>
      </div>
    );
  }

  const completedDaily = daily.filter((q) => q.completed).length;

  if (compact) {
    return (
      <div className="space-y-2">
        {daily.slice(0, 3).map((quest) => (
          <div key={quest.id} className="flex items-center gap-2">
            <span className="text-base">{quest.completed ? '✅' : quest.quest.icon}</span>
            <div className="flex-1">
              <div className="flex justify-between">
                <span className="font-pixel text-[10px] text-ink-700">{quest.quest.title}</span>
                <span className="font-pixel text-[10px] text-ink-400">
                  {quest.progress}/{quest.quest.targetValue}
                </span>
              </div>
              <div className="h-1.5 border border-ink-600 mt-0.5">
                <div
                  className="h-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, (quest.progress / quest.quest.targetValue) * 100)}%`,
                    background: quest.completed ? '#4A7C59' : '#CC6B47',
                  }}
                />
              </div>
            </div>
          </div>
        ))}
        <div className="font-pixel text-[10px] text-ink-400 text-right">
          {completedDaily}/3 daily quests
        </div>
      </div>
    );
  }

  return (
    <div className="pixel-card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-pixel text-sm font-bold text-ink-900 tracking-wide uppercase">
            Daily Quests
          </h3>
          <p className="font-pixel text-[10px] text-ink-400 mt-0.5 tracking-widest">
            {completedDaily} / {daily.length} COMPLETED TODAY
          </p>
        </div>
        <div className="font-pixel text-[10px] text-ink-400 tracking-widest">
          Refreshes at midnight UTC
        </div>
      </div>

      {/* Daily quests */}
      <div className="space-y-3 mb-6">
        {daily.map((quest) => {
          const pct = Math.min(100, Math.round((quest.progress / quest.quest.targetValue) * 100));

          return (
            <div
              key={quest.id}
              className={`p-3 border-[2px] ${quest.completed ? 'border-forest-600' : 'border-ink-500'}`}
              style={{
                background: quest.completed ? 'rgba(74, 124, 89, 0.08)' : 'transparent',
                boxShadow: quest.completed ? 'none' : 'inset 0 0 0 1px rgba(48,40,24,0.05)',
              }}
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div
                  className={`flex items-center justify-center w-10 h-10 text-xl border-[2px] ${
                    quest.completed ? 'border-forest-600' : 'border-ink-600'
                  }`}
                  style={{
                    background: quest.completed ? '#B8E0B0' : '#E8DFD0',
                    boxShadow: '2px 2px 0px #302818',
                  }}
                >
                  {quest.completed ? '✅' : quest.quest.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`font-pixel text-xs font-bold truncate ${
                        quest.completed ? 'text-forest-700' : 'text-ink-800'
                      }`}
                    >
                      {quest.quest.title}
                    </span>
                    <span
                      className={`font-pixel text-[10px] font-bold whitespace-nowrap ${
                        quest.completed ? 'text-forest-600' : 'text-terracotta-600'
                      }`}
                    >
                      +{quest.quest.xpReward} XP
                    </span>
                  </div>

                  <p className="font-body text-[10px] text-ink-500 mt-0.5 leading-relaxed">
                    {quest.quest.description}
                  </p>

                  {/* Progress bar */}
                  <div className="flex items-center gap-2 mt-2">
                    <div
                      className="flex-1 h-3 border-[2px] border-ink-700"
                      style={{ background: '#E8DFD0' }}
                    >
                      <div
                        className="h-full transition-all duration-400"
                        style={{
                          width: `${pct}%`,
                          background:
                            pct === 100
                              ? 'linear-gradient(90deg, #4A7C59 0%, #6AAD79 100%)'
                              : 'linear-gradient(90deg, #CC6B47 0%, #FF7755 100%)',
                        }}
                      />
                    </div>
                    <span className="font-pixel text-[10px] text-ink-500 w-14 text-right">
                      {quest.progress}/{quest.quest.targetValue}
                    </span>
                  </div>

                  {quest.completed && quest.completedAt && (
                    <div className="font-pixel text-[9px] text-forest-600 mt-1">
                      Completed{' '}
                      {new Date(quest.completedAt).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Seasonal challenges */}
      {seasonal.length > 0 && (
        <>
          <div className="border-t-[2px] border-ink-400 pt-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="font-pixel text-[10px] text-terracotta-600 tracking-widest uppercase font-bold">
                Seasonal Challenges
              </span>
              <div className="flex-1 border-t-[1px] border-ink-400" />
            </div>

            {seasonal.map((quest) => {
              const pct = Math.min(
                100,
                Math.round((quest.progress / quest.quest.targetValue) * 100)
              );

              return (
                <div
                  key={quest.id}
                  className={`p-3 border-[2px] mb-2 ${
                    quest.completed ? 'border-forest-600' : 'border-terracotta-500'
                  }`}
                  style={{
                    background: quest.completed
                      ? 'rgba(74, 124, 89, 0.08)'
                      : 'rgba(204, 107, 71, 0.05)',
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="flex items-center justify-center w-10 h-10 text-xl border-[2px] border-terracotta-600"
                      style={{ background: '#FFCC4D', boxShadow: '2px 2px 0px #302818' }}
                    >
                      {quest.completed ? '✅' : quest.quest.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-pixel text-xs font-bold text-ink-800">
                          {quest.quest.title}
                        </span>
                        <span className="font-pixel text-[10px] text-terracotta-600 font-bold">
                          +{quest.quest.xpReward} XP
                        </span>
                      </div>
                      <p className="font-body text-[10px] text-ink-500 mt-0.5 leading-relaxed">
                        {quest.quest.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <div
                          className="flex-1 h-2 border-[2px] border-ink-700"
                          style={{ background: '#E8DFD0' }}
                        >
                          <div
                            className="h-full"
                            style={{
                              width: `${pct}%`,
                              background: pct === 100 ? '#4A7C59' : '#CC6B47',
                            }}
                          />
                        </div>
                        <span className="font-pixel text-[10px] text-ink-500">
                          {quest.progress}/{quest.quest.targetValue}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
