'use client';

import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface Activity {
  id: string;
  type: 'SOWING' | 'WATERING' | 'FERTILIZING' | 'HARVEST' | 'NOTE' | 'ZONE_CREATED' | 'PLOT_CREATED';
  description: string;
  createdAt: string;
  metadata?: Record<string, string>;
}

interface ActivityFeedProps {
  activities: Activity[];
  isLoading?: boolean;
}

/**
 * ActivityFeed - Shows recent cultivation activities
 */
export function ActivityFeed({ activities, isLoading }: ActivityFeedProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="animate-pulse">
            <Card className="p-3">
              <div className="h-8 bg-ink-100" />
            </Card>
          </div>
        ))}
      </div>
    );
  }
  
  if (activities.length === 0) {
    return (
      <Card className="p-6 text-center">
        <div className="text-4xl mb-2 opacity-50">🌿</div>
        <p className="font-pixel text-sm text-ink-500">
          No activity yet
        </p>
        <p className="font-body text-xs text-ink-400 mt-1">
          Start planting to see your activity here
        </p>
      </Card>
    );
  }
  
  const getIcon = (type: Activity['type']) => {
    const icons: Record<string, string> = {
      SOWING: '🌱',
      WATERING: '💧',
      FERTILIZING: '🌿',
      HARVEST: '🌾',
      NOTE: '📝',
      ZONE_CREATED: '➕',
      PLOT_CREATED: '📦',
    };
    return icons[type] || '•';
  };
  
  const getTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-pixel text-sm font-bold text-ink-800 uppercase tracking-wider">
          ✦ RECENT ACTIVITY ✦
        </h3>
        <Badge variant="outline" size="sm">{activities.length} items</Badge>
      </div>
      
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {activities.map((activity) => (
          <Card key={activity.id} className="p-3">
            <div className="flex items-start gap-3">
              <span className="text-xl flex-shrink-0">{getIcon(activity.type)}</span>
              <div className="flex-1 min-w-0">
                <p className="font-body text-sm text-ink-800">
                  {activity.description}
                </p>
                <p className="font-mono text-[10px] text-ink-400 mt-0.5">
                  {getTimeAgo(activity.createdAt)}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
