'use client';

import { useEffect, useRef } from 'react';

interface XPToastProps {
  xp?: number;
  level?: number;
  previousLevel?: number;
  visible: boolean;
  onClose: () => void;
  type?: 'xp' | 'levelup' | 'achievement';
  achievementName?: string;
  achievementIcon?: string;
}

/**
 * Retro pixel-style toast notification for XP gain, level ups, and achievement unlocks.
 * Appears at the bottom-right of the screen with a pixel bounce animation.
 * @param props.xp - XP amount awarded
 * @param root0
 * @param root0.xp
 * @param props.level - New level (for level-up toasts)
 * @param root0.level
 * @param props.previousLevel - Previous level (for level-up toasts)
 * @param root0.previousLevel
 * @param props.visible - Whether the toast should be visible
 * @param root0.visible
 * @param props.onClose - Callback to dismiss the toast
 * @param root0.onClose
 * @param props.type - Toast type: 'xp', 'levelup', or 'achievement'
 * @param root0.type
 * @param props.achievementName - Name of the unlocked achievement
 * @param root0.achievementName
 * @param props.achievementIcon - Icon of the unlocked achievement
 * @param root0.achievementIcon
 * @returns The toast JSX
 */
export function XPToast({
  xp,
  level,
  previousLevel,
  visible,
  onClose,
  type = 'xp',
  achievementName,
  achievementIcon,
}: XPToastProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (visible) {
      timerRef.current = setTimeout(onClose, 4000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [visible, onClose]);

  if (!visible) return null;

  const isLevelUp = type === 'levelup';
  const isAchievement = type === 'achievement';

  return (
    <div
      className={`fixed bottom-6 right-6 z-[100] ${isLevelUp ? 'animate-level-up' : isAchievement ? 'animate-achievement' : 'animate-xp-pop'}`}
      style={{ pointerEvents: 'auto' }}
    >
      <div
        className="retro-dialog px-5 py-4 min-w-[220px] max-w-[280px]"
        style={{
          boxShadow: isLevelUp ? '5px 5px 0px #CC6B47, 8px 8px 0px #302818' : '4px 4px 0px #302818',
          borderColor: isLevelUp ? '#CC6B47' : isAchievement ? '#FFCC4D' : '#4A7C59',
          borderWidth: '3px',
          background: isLevelUp
            ? 'linear-gradient(135deg, #302818 0%, #4A3728 100%)'
            : isAchievement
              ? 'linear-gradient(135deg, #302818 0%, #4A3728 100%)'
              : '#F5EFE0',
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">{isLevelUp ? '⬆️' : isAchievement ? '🏆' : '✨'}</span>
          <span
            className="font-pixel text-[10px] font-bold tracking-widest uppercase"
            style={{
              color: isLevelUp ? '#FFCC4D' : isAchievement ? '#FFCC4D' : '#4A7C59',
            }}
          >
            {isLevelUp ? 'LEVEL UP!' : isAchievement ? 'ACHIEVEMENT!' : 'XP GAINED'}
          </span>
        </div>

        {/* Content */}
        {isLevelUp && level && (
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center w-12 h-12 font-pixel text-xl font-bold border-[3px] border-ink-800"
              style={{ background: '#FFCC4D', boxShadow: '3px 3px 0px #302818' }}
            >
              {level}
            </div>
            <div>
              <div className="font-pixel text-xs text-cream-100">
                You reached level <span className="font-bold text-terracotta-300">{level}</span>
              </div>
              {previousLevel && previousLevel < level && (
                <div className="font-pixel text-[10px] text-cream-300 mt-0.5">
                  (was {previousLevel})
                </div>
              )}
            </div>
          </div>
        )}

        {isAchievement && achievementName && (
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center w-12 h-12 text-2xl border-[3px] border-ink-800"
              style={{ background: '#FFCC4D', boxShadow: '3px 3px 0px #302818' }}
            >
              {achievementIcon ?? '🏆'}
            </div>
            <div>
              <div className="font-pixel text-xs font-bold text-cream-100">{achievementName}</div>
              {xp && (
                <div className="font-pixel text-[10px] text-terracotta-300 mt-0.5">
                  +{xp} XP bonus
                </div>
              )}
            </div>
          </div>
        )}

        {!isLevelUp && !isAchievement && xp && (
          <div className="flex items-center gap-2">
            <span
              className="font-pixel text-lg font-bold"
              style={{ color: isLevelUp ? '#FFCC4D' : '#4A7C59' }}
            >
              +{xp} XP
            </span>
          </div>
        )}

        {/* Dismiss button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 font-pixel text-[10px] text-cream-300 hover:text-cream-100 transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
