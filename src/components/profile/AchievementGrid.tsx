'use client';

import { useEffect, useState } from 'react';

interface Achievement {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  rarity: string;
  xpReward: number;
  unlocked: boolean;
  unlockedAt: string | null;
}

interface AchievementGridProps {
  userId?: string;
}

const CATEGORY_ORDER = ['CULTIVATION', 'SOCIAL', 'STREAKS', 'LEVELS', 'SPECIAL'];

const CATEGORY_LABELS: Record<string, string> = {
  CULTIVATION: 'Cultivation',
  SOCIAL: 'Social',
  STREAKS: 'Streaks',
  LEVELS: 'Levels',
  SPECIAL: 'Special',
};

const RARITY_COLORS: Record<string, { bg: string; border: string; label: string }> = {
  COMMON: { bg: '#E8DFD0', border: '#5C4B26', label: '#5C4B26' },
  UNCOMMON: { bg: '#B8E0B0', border: '#2D8A2D', label: '#2D8A2D' },
  RARE: { bg: '#87CEEB', border: '#1976D2', label: '#1976D2' },
  EPIC: { bg: '#DDA0DD', border: '#7B2D8B', label: '#7B2D8B' },
  LEGENDARY: { bg: '#FFCC4D', border: '#CC6B47', label: '#CC6B47' },
};

const LOCKED_ICON = '❓';

/**
 * Retro pixel-style achievement grid showing locked/unlocked badges.
 * Grouped by category, with rarity color coding and hover tooltips.
 * @param props.userId - Optional user ID (uses API if not provided)
 * @param root0
 * @param root0.userId
 * @returns The achievement grid JSX
 */
export function AchievementGrid({ userId: _userId }: AchievementGridProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const res = await fetch('/api/achievements');
        if (res.ok) {
          const data = await res.json();
          setAchievements(data);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, []);

  // Group achievements by category
  const grouped = CATEGORY_ORDER.reduce<Record<string, Achievement[]>>((acc, cat) => {
    acc[cat] = achievements.filter((a) => a.category === cat);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="pixel-card p-6">
        <div className="font-pixel text-xs text-ink-500 tracking-widest animate-pulse">
          LOADING ACHIEVEMENTS...
        </div>
      </div>
    );
  }

  const totalUnlocked = achievements.filter((a) => a.unlocked).length;
  const totalXPFromBadges = achievements
    .filter((a) => a.unlocked)
    .reduce((sum, a) => sum + a.xpReward, 0);

  return (
    <div className="pixel-card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-pixel text-sm font-bold text-ink-900 tracking-wide uppercase">
            Achievements
          </h3>
          <p className="font-pixel text-[10px] text-ink-400 mt-0.5 tracking-widest">
            {totalUnlocked} / {achievements.length} UNLOCKED
          </p>
        </div>
        <div
          className="text-right px-3 py-1 border-[2px] border-ink-700"
          style={{ background: '#FFCC4D', boxShadow: '2px 2px 0px #302818' }}
        >
          <div className="font-pixel text-[10px] text-ink-800 tracking-widest">BADGE XP</div>
          <div className="font-pixel text-sm font-bold text-ink-900">+{totalXPFromBadges}</div>
        </div>
      </div>

      {/* Categories */}
      {CATEGORY_ORDER.map((category) => {
        const items = grouped[category];
        if (!items || items.length === 0) return null;

        return (
          <div key={category} className="mb-5 last:mb-0">
            {/* Category header */}
            <div className="flex items-center gap-2 mb-2">
              <span className="font-pixel text-[10px] text-ink-500 tracking-widest uppercase">
                {CATEGORY_LABELS[category]}
              </span>
              <div className="flex-1 border-t-[1px] border-ink-300" />
              <span className="font-pixel text-[10px] text-ink-400">
                {items.filter((a) => a.unlocked).length}/{items.length}
              </span>
            </div>

            {/* Badge grid */}
            <div className="flex flex-wrap gap-2">
              {items.map((achievement) => {
                const rarityStyle = RARITY_COLORS[achievement.rarity] ?? RARITY_COLORS.COMMON;
                const isHovered = hoveredId === achievement.id;

                return (
                  <div
                    key={achievement.id}
                    className="relative"
                    onMouseEnter={() => setHoveredId(achievement.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    {/* Badge */}
                    <div
                      className={`w-14 h-14 flex items-center justify-center text-2xl border-[3px] transition-transform ${
                        achievement.unlocked
                          ? 'cursor-default hover:scale-110'
                          : 'cursor-default grayscale'
                      }`}
                      style={{
                        background: achievement.unlocked ? rarityStyle.bg : '#E8DFD0',
                        borderColor: achievement.unlocked ? rarityStyle.border : '#B09158',
                        boxShadow: '2px 2px 0px #302818',
                      }}
                      title={achievement.name}
                    >
                      {achievement.unlocked ? achievement.icon : LOCKED_ICON}
                    </div>

                    {/* Tooltip */}
                    {isHovered && (
                      <div
                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-48 retro-dialog p-3"
                        style={{ boxShadow: '4px 4px 0px #302818' }}
                      >
                        {/* Arrow */}
                        <div
                          className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0"
                          style={{
                            borderLeft: '6px solid transparent',
                            borderRight: '6px solid transparent',
                            borderTop: '6px solid #302818',
                          }}
                        />

                        {/* Icon + Name */}
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xl">
                            {achievement.unlocked ? achievement.icon : LOCKED_ICON}
                          </span>
                          <span
                            className="font-pixel text-xs font-bold text-cream-100 leading-tight"
                            style={{ color: rarityStyle.label }}
                          >
                            {achievement.name}
                          </span>
                        </div>

                        {/* Description */}
                        <p className="font-body text-[10px] text-cream-200 leading-relaxed mb-2">
                          {achievement.description}
                        </p>

                        {/* Rarity + XP */}
                        <div className="flex items-center justify-between">
                          <span
                            className="font-pixel text-[9px] font-bold uppercase tracking-widest"
                            style={{ color: rarityStyle.label }}
                          >
                            {achievement.rarity}
                          </span>
                          <span className="font-pixel text-[10px] text-terracotta-300">
                            +{achievement.xpReward} XP
                          </span>
                        </div>

                        {/* Unlock date */}
                        {achievement.unlocked && achievement.unlockedAt && (
                          <div className="mt-1 pt-1 border-t-[1px] border-ink-600">
                            <span className="font-pixel text-[9px] text-cream-300">
                              Unlocked{' '}
                              {new Date(achievement.unlockedAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
