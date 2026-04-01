'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog';
import { Badge } from '@/components/ui/Badge';
import { Separator } from '@/components/ui/Separator';
import { GardenSelector } from '@/components/garden/GardenSelector';
import { StatsCards } from '@/components/garden/StatsCards';
import { QuickActions } from '@/components/garden/QuickActions';

interface Garden {
  id: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  userRole: string;
  type: string | null;
  width: number | null;
  length: number | null;
  sunExposure: string | null;
  soilType: string | null;
  tags: string[];
  coverImage: string | null;
  stats: {
    zoneCount: number;
    plotCount: number;
    activeCropCount: number;
    gardenerCount: number;
    followerCount: number;
    todoCount: number;
  };
}

interface Activity {
  id: string;
  gardenId: string;
  gardenName?: string;
  type: 'SOWING' | 'WATERING' | 'FERTILIZING' | 'HARVEST' | 'NOTE' | 'ZONE_CREATED' | 'PLOT_CREATED';
  description: string;
  createdAt: string;
}

interface GardenHubContentProps {
  gardens: Garden[];
  isOwnPage: boolean;
  username: string;
}

export function GardenHubContent({ gardens: initialGardens, isOwnPage, username }: GardenHubContentProps) {
  const { data: session } = useSession();
  const router = useRouter();
  
  const [gardens, setGardens] = useState<Garden[]>(initialGardens);
  const [selectedGardenId, setSelectedGardenId] = useState<string | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  
  // Create garden dialog
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newGardenName, setNewGardenName] = useState('');
  const [newGardenDescription, setNewGardenDescription] = useState('');
  const [newGardenType, setNewGardenType] = useState<string>('');
  const [newGardenWidth, setNewGardenWidth] = useState('');
  const [newGardenLength, setNewGardenLength] = useState('');
  const [newGardenSunExposure, setNewGardenSunExposure] = useState<string>('');
  const [newGardenSoilType, setNewGardenSoilType] = useState<string>('');
  const [newGardenTags, setNewGardenTags] = useState('');
  const [newGardenCoverImage, setNewGardenCoverImage] = useState('');
  const [creating, setCreating] = useState(false);
  
  // Add zone dialog
  const [showAddZoneDialog, setShowAddZoneDialog] = useState(false);
  const [newZoneName, setNewZoneName] = useState('');
  const [newZoneType, setNewZoneType] = useState('OUTDOOR');
  const [creatingZone, setCreatingZone] = useState(false);
  
  // Fetch activities
  const fetchActivities = useCallback(async () => {
    if (!isOwnPage) return;
    
    try {
      const res = await fetch('/api/gardens/activity');
      if (res.ok) {
        const data = await res.json();
        // Add garden name to each activity
        const activitiesWithGarden = (data.activities || []).map((activity: Activity) => {
          const garden = gardens.find(g => g.id === activity.gardenId);
          return { ...activity, gardenName: garden?.name };
        });
        setActivities(activitiesWithGarden);
      }
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    }
  }, [isOwnPage, gardens]);
  
  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);
  
  // Set main garden
  const handleSetMainGarden = async (gardenId: string) => {
    if (!isOwnPage) return;
    
    try {
      await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mainGardenId: gardenId }),
      });
    } catch (error) {
      console.error('Failed to set main garden:', error);
    }
  };
  
  // Create garden
  const handleCreateGarden = async () => {
    if (!newGardenName.trim()) return;
    
    setCreating(true);
    try {
      const res = await fetch('/api/gardens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newGardenName,
          description: newGardenDescription || undefined,
          type: newGardenType || undefined,
          width: newGardenWidth ? parseFloat(newGardenWidth) : undefined,
          length: newGardenLength ? parseFloat(newGardenLength) : undefined,
          sunExposure: newGardenSunExposure || undefined,
          soilType: newGardenSoilType || undefined,
          tags: newGardenTags ? newGardenTags.split(',').map(t => t.trim()).filter(Boolean) : undefined,
          coverImage: newGardenCoverImage || undefined,
        }),
      });
      
      if (res.ok) {
        const garden = await res.json();
        setGardens((prev) => [{ ...garden, stats: { ...garden.stats, activeCropCount: 0, gardenerCount: 0, followerCount: 0, todoCount: 0 } }, ...prev]);
        setSelectedGardenId(garden.id);
        setShowCreateDialog(false);
        // Reset form
        setNewGardenName('');
        setNewGardenDescription('');
        setNewGardenType('');
        setNewGardenWidth('');
        setNewGardenLength('');
        setNewGardenSunExposure('');
        setNewGardenSoilType('');
        setNewGardenTags('');
        setNewGardenCoverImage('');
      }
    } catch (error) {
      console.error('Failed to create garden:', error);
    } finally {
      setCreating(false);
    }
  };
  
  // Create zone
  const handleCreateZone = async () => {
    if (!newZoneName.trim() || !selectedGardenId) return;
    
    setCreatingZone(true);
    try {
      const res = await fetch(`/api/gardens/${selectedGardenId}/zones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newZoneName,
          type: newZoneType,
        }),
      });
      
      if (res.ok) {
        setShowAddZoneDialog(false);
        setNewZoneName('');
        setGardens(prev => prev.map(g => 
          g.id === selectedGardenId 
            ? { ...g, stats: { ...g.stats, zoneCount: g.stats.zoneCount + 1 } }
            : g
        ));
      }
    } catch (error) {
      console.error('Failed to create zone:', error);
    } finally {
      setCreatingZone(false);
    }
  };
  
  const selectedGarden = gardens.find((g) => g.id === selectedGardenId);
  
  // Get activity icon
  const getActivityIcon = (type: Activity['type']) => {
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
  
  // Get time ago
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
    <div className="min-h-[calc(100vh-4rem)] bg-cream-50">
      {/* Header */}
      <div className="bg-ink-100 border-b-[3px] border-ink-700 py-6 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="font-pixel text-2xl font-bold text-ink-900 tracking-wide">
                🌱 MY GARDENS
              </h1>
              <p className="font-body text-sm text-ink-600 mt-1">
                {isOwnPage ? `Welcome back, ${session?.user?.name || username}!` : `${username}'s Gardens`}
              </p>
            </div>
            
            {isOwnPage && (
              <GardenSelector
                gardens={gardens}
                currentGardenId={selectedGardenId}
                onGardenChange={setSelectedGardenId}
                onSetAsMain={handleSetMainGarden}
                onCreateGarden={() => setShowCreateDialog(true)}
              />
            )}
          </div>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* No gardens at all (own page) */}
        {isOwnPage && gardens.length === 0 && (
          <Card className="p-8 text-center">
            <div className="text-5xl mb-4">🌱</div>
            <h2 className="font-pixel text-lg font-bold text-ink-800 mb-2">
              Welcome to greenU!
            </h2>
            <p className="font-body text-sm text-ink-500 mb-4 max-w-md mx-auto">
              Start your gardening journey by creating your first garden.
              Track your plants, plan rotations, and level up!
            </p>
            <Button variant="primary" size="lg" onClick={() => setShowCreateDialog(true)}>
              ➕ CREATE YOUR FIRST GARDEN
            </Button>
          </Card>
        )}
        
        {/* No garden selected */}
        {isOwnPage && gardens.length > 0 && !selectedGarden && (
          <Card className="p-8 text-center">
            <div className="text-5xl mb-4">🌱</div>
            <h2 className="font-pixel text-lg font-bold text-ink-800 mb-2">
              Select a Garden
            </h2>
            <p className="font-body text-sm text-ink-500 mb-4">
              Choose a garden from the dropdown above or create a new one
            </p>
            <Button variant="primary" onClick={() => setShowCreateDialog(true)}>
              ➕ CREATE NEW GARDEN
            </Button>
          </Card>
        )}
        
        {/* Garden hub content */}
        {selectedGarden && (
          <>
            <Separator />
            
            {/* Garden header with cover image */}
            {selectedGarden.coverImage && (
              <div className="w-full h-48 -mx-6 -mt-4 mb-4 overflow-hidden rounded-none">
                <img 
                  src={selectedGarden.coverImage} 
                  alt={selectedGarden.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
            
            {/* Garden header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h2 className="font-pixel text-xl font-bold text-ink-900">
                  {selectedGarden.name}
                </h2>
                {selectedGarden.description && (
                  <p className="font-body text-sm text-ink-500 mt-1">
                    {selectedGarden.description}
                  </p>
                )}
                
                {/* Tags */}
                {selectedGarden.tags && selectedGarden.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedGarden.tags.map((tag, i) => (
                      <span 
                        key={i}
                        className="font-pixel text-[10px] px-2 py-0.5 bg-forest-100 text-forest-700 border border-forest-300"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
                
                {/* Meta badges */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedGarden.type && (
                    <Badge variant="outline" size="sm">
                      {selectedGarden.type === 'AMATEUR' && '🏡 Amateur'}
                      {selectedGarden.type === 'COLLECTIF' && '👥 Collectif'}
                      {selectedGarden.type === 'PROFESSIONNEL' && '💼 Pro'}
                    </Badge>
                  )}
                  {selectedGarden.width && selectedGarden.length && (
                    <Badge variant="outline" size="sm">
                      📐 {selectedGarden.width}×{selectedGarden.length}m
                    </Badge>
                  )}
                  {selectedGarden.sunExposure && (
                    <Badge variant="outline" size="sm">
                      {selectedGarden.sunExposure === 'SOUTH' && '☀️ South'}
                      {selectedGarden.sunExposure === 'EAST' && '🌅 East'}
                      {selectedGarden.sunExposure === 'WEST' && '🌇 West'}
                      {selectedGarden.sunExposure === 'NORTH' && '🌲 North'}
                    </Badge>
                  )}
                  {selectedGarden.soilType && (
                    <Badge variant="outline" size="sm">
                      🪱 {selectedGarden.soilType.toLowerCase()}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {selectedGarden.isPublic && (
                  <Badge variant="success" size="sm">PUBLIC</Badge>
                )}
                <Badge variant="outline" size="sm">
                  {(selectedGarden.userRole || 'OWNER').toUpperCase()}
                </Badge>
              </div>
            </div>
            
            {/* Stats */}
            <StatsCards stats={selectedGarden.stats} />
            
            {/* Quick Actions */}
            <QuickActions
              gardenId={selectedGarden.id}
              userRole={selectedGarden.userRole}
              onAddZone={() => setShowAddZoneDialog(true)}
              onAddCrop={() => router.push(`/garden/${selectedGarden.id}`)}
              onCreateGarden={() => setShowCreateDialog(true)}
            />
            
            {/* Activity Feed */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-pixel text-sm font-bold text-ink-800 uppercase tracking-wider">
                  ✦ RECENT ACTIVITY ✦
                </h3>
                <Badge variant="outline" size="sm">{activities.length} items</Badge>
              </div>
              
              {activities.length === 0 ? (
                <Card className="p-6 text-center">
                  <div className="text-4xl mb-2 opacity-50">🌿</div>
                  <p className="font-pixel text-sm text-ink-500">
                    No activity yet
                  </p>
                  <p className="font-body text-xs text-ink-400 mt-1">
                    Start planting to see your activity here
                  </p>
                </Card>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {activities
                    .filter(a => a.gardenId === selectedGardenId)
                    .map((activity) => (
                      <Card key={activity.id} className="p-3">
                        <div className="flex items-start gap-3">
                          <span className="text-xl flex-shrink-0">{getActivityIcon(activity.type)}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-body text-sm text-ink-800">
                              {activity.description}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="font-mono text-[10px] text-ink-400">
                                {getTimeAgo(activity.createdAt)}
                              </p>
                              {activity.gardenName && (
                                <Badge variant="secondary" size="sm">
                                  🌱 {activity.gardenName}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  {activities.filter(a => a.gardenId === selectedGardenId).length === 0 && (
                    <Card className="p-4 text-center">
                      <p className="font-body text-sm text-ink-500">
                        No activity for this garden yet
                      </p>
                    </Card>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
      
      {/* Create Garden Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>🆕 Create New Garden</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-4">
            {/* Garden Name */}
            <Input
              label="Garden Name"
              placeholder="My Vegetable Garden"
              value={newGardenName}
              onChange={(e) => setNewGardenName(e.target.value)}
              required
            />
            
            {/* Description */}
            <div>
              <label className="block font-pixel text-xs font-semibold text-ink-600 uppercase tracking-wider mb-1.5">
                Description (optional)
              </label>
              <textarea
                className="w-full px-4 py-3 bg-cream-100 border-[3px] border-ink-700 shadow-[inset_2px_2px_0px_0px_#E8DFD0,inset_-1px_-1px_0px_0px_#5C4B26] font-body text-sm resize-none"
                rows={2}
                placeholder="A brief description of your garden..."
                value={newGardenDescription}
                onChange={(e) => setNewGardenDescription(e.target.value)}
              />
            </div>
            
            {/* Garden Type */}
            <div>
              <label className="block font-pixel text-xs font-semibold text-ink-600 uppercase tracking-wider mb-2">
                Type
              </label>
              <div className="flex gap-2 flex-wrap">
                {[
                  { value: 'AMATEUR', label: '🏡 Amateur', desc: 'Personal garden' },
                  { value: 'COLLECTIF', label: '👥 Collectif', desc: 'Shared garden' },
                  { value: 'PROFESSIONNEL', label: '💼 Pro', desc: 'Market garden' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setNewGardenType(newGardenType === opt.value ? '' : opt.value)}
                    className={`flex-1 min-w-[100px] px-3 py-2 border-[3px] font-pixel text-xs font-bold transition-all ${
                      newGardenType === opt.value
                        ? 'border-forest-500 bg-forest-100 text-forest-800 shadow-[2px_2px_0px_0px_#166534]'
                        : 'border-ink-300 bg-cream-50 text-ink-600 hover:border-ink-500'
                    }`}
                  >
                    <div>{opt.label}</div>
                    <div className="font-body text-[10px] font-normal opacity-70">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Size */}
            <div>
              <label className="block font-pixel text-xs font-semibold text-ink-600 uppercase tracking-wider mb-2">
                Size (meters)
              </label>
              <div className="flex gap-3 items-center">
                <div className="flex-1">
                  <input
                    type="number"
                    placeholder="Width"
                    min="0"
                    step="0.5"
                    value={newGardenWidth}
                    onChange={(e) => setNewGardenWidth(e.target.value)}
                    className="w-full px-4 py-2.5 bg-cream-100 border-[3px] border-ink-700 shadow-[2px_2px_0px_0px_#302818] font-body text-sm"
                  />
                  <span className="font-pixel text-[10px] text-ink-500 mt-1 block text-center">Width</span>
                </div>
                <span className="font-pixel text-lg text-ink-400">×</span>
                <div className="flex-1">
                  <input
                    type="number"
                    placeholder="Length"
                    min="0"
                    step="0.5"
                    value={newGardenLength}
                    onChange={(e) => setNewGardenLength(e.target.value)}
                    className="w-full px-4 py-2.5 bg-cream-100 border-[3px] border-ink-700 shadow-[2px_2px_0px_0px_#302818] font-body text-sm"
                  />
                  <span className="font-pixel text-[10px] text-ink-500 mt-1 block text-center">Length</span>
                </div>
              </div>
            </div>
            
            {/* Sun Exposure */}
            <div>
              <label className="block font-pixel text-xs font-semibold text-ink-600 uppercase tracking-wider mb-2">
                Sun Exposure
              </label>
              <div className="flex gap-2 flex-wrap">
                {[
                  { value: 'SOUTH', label: '☀️ South', desc: 'Full sun' },
                  { value: 'EAST', label: '🌅 East', desc: 'Morning sun' },
                  { value: 'WEST', label: '🌇 West', desc: 'Afternoon sun' },
                  { value: 'NORTH', label: '🌲 North', desc: 'Shade' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setNewGardenSunExposure(newGardenSunExposure === opt.value ? '' : opt.value)}
                    className={`flex-1 min-w-[80px] px-3 py-2 border-[3px] font-pixel text-xs font-bold transition-all ${
                      newGardenSunExposure === opt.value
                        ? 'border-amber-500 bg-amber-100 text-amber-800 shadow-[2px_2px_0px_0px_#b45309]'
                        : 'border-ink-300 bg-cream-50 text-ink-600 hover:border-ink-500'
                    }`}
                  >
                    <div>{opt.label}</div>
                    <div className="font-body text-[10px] font-normal opacity-70">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Soil Type */}
            <div>
              <label className="block font-pixel text-xs font-semibold text-ink-600 uppercase tracking-wider mb-1.5">
                Soil Type
              </label>
              <select
                value={newGardenSoilType}
                onChange={(e) => setNewGardenSoilType(e.target.value)}
                className="w-full px-4 py-2.5 bg-cream-100 border-[3px] border-ink-700 shadow-[2px_2px_0px_0px_#302818] font-body text-sm"
              >
                <option value="">Select soil type...</option>
                <option value="LOAMY">Loamy (balanced, ideal)</option>
                <option value="CLAY">Clay (heavy, retains water)</option>
                <option value="SANDY">Sandy (drains fast)</option>
                <option value="SILTY">Silty (smooth, fertile)</option>
                <option value="PEAT">Peat (acidic, organic)</option>
                <option value="CHALK">Chalk (alkaline)</option>
              </select>
            </div>
            
            {/* Tags */}
            <div>
              <label className="block font-pixel text-xs font-semibold text-ink-600 uppercase tracking-wider mb-1.5">
                Tags
              </label>
              <input
                type="text"
                placeholder="#biodynamie, #indoor, #permaculture..."
                value={newGardenTags}
                onChange={(e) => setNewGardenTags(e.target.value)}
                className="w-full px-4 py-2.5 bg-cream-100 border-[3px] border-ink-700 shadow-[2px_2px_0px_0px_#302818] font-body text-sm"
              />
              <p className="font-body text-[10px] text-ink-400 mt-1">Separate with commas</p>
            </div>
            
            {/* Cover Image URL */}
            <div>
              <label className="block font-pixel text-xs font-semibold text-ink-600 uppercase tracking-wider mb-1.5">
                Cover Image URL
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={newGardenCoverImage}
                onChange={(e) => setNewGardenCoverImage(e.target.value)}
                className="w-full px-4 py-2.5 bg-cream-100 border-[3px] border-ink-700 shadow-[2px_2px_0px_0px_#302818] font-body text-sm"
              />
              <p className="font-body text-[10px] text-ink-400 mt-1">Paste an image URL (optional)</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowCreateDialog(false)}>
              CANCEL
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateGarden}
              loading={creating}
              disabled={!newGardenName.trim()}
            >
              CREATE GARDEN
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Zone Dialog */}
      <Dialog open={showAddZoneDialog} onOpenChange={setShowAddZoneDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>➕ Add New Zone</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              label="Zone Name"
              placeholder="Raised Bed 1"
              value={newZoneName}
              onChange={(e) => setNewZoneName(e.target.value)}
              required
            />
            <div>
              <label className="block font-pixel text-xs font-semibold text-ink-600 uppercase tracking-wider mb-1.5">
                Zone Type
              </label>
              <select
                className="w-full px-4 py-2.5 bg-cream-100 border-[3px] border-ink-700 shadow-[2px_2px_0px_0px_#302818] font-body text-sm"
                value={newZoneType}
                onChange={(e) => setNewZoneType(e.target.value)}
              >
                <option value="OUTDOOR">Outdoor</option>
                <option value="GREENHOUSE">Greenhouse</option>
                <option value="ORCHARD">Orchard</option>
                <option value="INDOOR">Indoor</option>
                <option value="TERRACE">Terrace</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowAddZoneDialog(false)}>
              CANCEL
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateZone}
              loading={creatingZone}
              disabled={!newZoneName.trim()}
            >
              ADD ZONE
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
