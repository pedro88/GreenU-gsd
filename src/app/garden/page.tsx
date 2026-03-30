'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GardenSelector } from '@/components/garden/GardenSelector';
import { StatsCards } from '@/components/garden/StatsCards';
import { QuickActions } from '@/components/garden/QuickActions';
import { ActivityFeed } from '@/components/garden/ActivityFeed';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog';
import { Badge } from '@/components/ui/Badge';
import { Separator } from '@/components/ui/Separator';

interface Garden {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  isPublic: boolean;
  userRole: string;
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
  type: 'SOWING' | 'WATERING' | 'FERTILIZING' | 'HARVEST' | 'NOTE' | 'ZONE_CREATED' | 'PLOT_CREATED';
  description: string;
  createdAt: string;
}

/**
 * GardenHub - Main garden management page
 * Shows all gardens, stats, quick actions, and activity feed
 */
export default function GardenHub() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [gardens, setGardens] = useState<Garden[]>([]);
  const [mainGardenId, setMainGardenId] = useState<string | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Create garden dialog
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newGardenName, setNewGardenName] = useState('');
  const [newGardenDescription, setNewGardenDescription] = useState('');
  const [creating, setCreating] = useState(false);
  
  // Add zone dialog
  const [showAddZoneDialog, setShowAddZoneDialog] = useState(false);
  const [newZoneName, setNewZoneName] = useState('');
  const [newZoneType, setNewZoneType] = useState('OUTDOOR');
  const [creatingZone, setCreatingZone] = useState(false);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);
  
  // Fetch gardens and activities
  const fetchData = useCallback(async () => {
    if (!session?.user) return;
    
    try {
      const [gardensRes, activitiesRes] = await Promise.all([
        fetch('/api/gardens'),
        fetch('/api/gardens/activity'),
      ]);
      
      if (gardensRes.ok) {
        const data = await gardensRes.json();
        setGardens(data.gardens);
        setMainGardenId(data.mainGardenId || data.gardens[0]?.id || null);
      }
      
      if (activitiesRes.ok) {
        const data = await activitiesRes.json();
        setActivities(data.activities || []);
      }
    } catch (error) {
      console.error('Failed to fetch garden data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [session?.user]);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  // Set main garden
  const handleSetMainGarden = async (gardenId: string) => {
    try {
      await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mainGardenId: gardenId }),
      });
      setMainGardenId(gardenId);
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
        }),
      });
      
      if (res.ok) {
        const garden = await res.json();
        setGardens((prev) => [garden, ...prev]);
        setMainGardenId(garden.id);
        setShowCreateDialog(false);
        setNewGardenName('');
        setNewGardenDescription('');
      }
    } catch (error) {
      console.error('Failed to create garden:', error);
    } finally {
      setCreating(false);
    }
  };
  
  // Create zone
  const handleCreateZone = async () => {
    if (!newZoneName.trim() || !mainGardenId) return;
    
    setCreatingZone(true);
    try {
      const res = await fetch(`/api/gardens/${mainGardenId}/zones`, {
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
        fetchData(); // Refresh data
      }
    } catch (error) {
      console.error('Failed to create zone:', error);
    } finally {
      setCreatingZone(false);
    }
  };
  
  const currentGarden = gardens.find((g) => g.id === mainGardenId);
  
  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="font-pixel text-ink-500 animate-pulse">LOADING...</div>
      </div>
    );
  }
  
  if (!session?.user) {
    return null;
  }
  
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-cream-50">
      {/* Header */}
      <div className="bg-ink-100 border-b-[3px] border-ink-700 py-6 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="font-pixel text-2xl font-bold text-ink-900 tracking-wide">
                🌱 GARDEN HUB
              </h1>
              <p className="font-body text-sm text-ink-600 mt-1">
                Welcome back, {session.user.name || 'Gardener'}!
              </p>
            </div>
            
            <GardenSelector
              gardens={gardens}
              currentGardenId={mainGardenId}
              onGardenChange={setMainGardenId}
              onSetAsMain={handleSetMainGarden}
              onCreateGarden={() => setShowCreateDialog(true)}
            />
          </div>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* No garden selected */}
        {!currentGarden && gardens.length > 0 && (
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
        
        {/* No gardens at all */}
        {gardens.length === 0 && (
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
        
        {/* Garden hub content */}
        {currentGarden && (
          <>
            {/* Garden header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-pixel text-xl font-bold text-ink-900">
                  {currentGarden.name}
                </h2>
                {currentGarden.description && (
                  <p className="font-body text-sm text-ink-500 mt-1">
                    {currentGarden.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {currentGarden.isPublic && (
                  <Badge variant="success" size="sm">PUBLIC</Badge>
                )}
                <Badge variant="outline" size="sm">
                  {currentGarden.userRole.toUpperCase()}
                </Badge>
              </div>
            </div>
            
            {/* Stats */}
            <StatsCards stats={currentGarden.stats} />
            
            {/* Quick Actions */}
            <QuickActions
              gardenId={currentGarden.id}
              userRole={currentGarden.userRole}
              onAddZone={() => setShowAddZoneDialog(true)}
              onAddCrop={() => router.push(`/garden/${currentGarden.id}`)}
              onCreateGarden={() => setShowCreateDialog(true)}
            />
            
            {/* Main content grid */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* Activity Feed */}
              <div className="md:col-span-2">
                <ActivityFeed activities={activities} />
              </div>
              
              {/* Quick links sidebar */}
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <h3 className="font-pixel text-sm font-bold text-ink-800 uppercase tracking-wider">
                      📊 OVERVIEW
                    </h3>
                    <Separator />
                    <div className="space-y-2">
                      <div className="flex justify-between font-body text-sm">
                        <span className="text-ink-600">Zones</span>
                        <span className="font-semibold text-ink-800">{currentGarden.stats.zoneCount}</span>
                      </div>
                      <div className="flex justify-between font-body text-sm">
                        <span className="text-ink-600">Plots</span>
                        <span className="font-semibold text-ink-800">{currentGarden.stats.plotCount}</span>
                      </div>
                      <div className="flex justify-between font-body text-sm">
                        <span className="text-ink-600">Active Crops</span>
                        <span className="font-semibold text-forest-600">{currentGarden.stats.activeCropCount}</span>
                      </div>
                      <div className="flex justify-between font-body text-sm">
                        <span className="text-ink-600">Gardeners</span>
                        <span className="font-semibold text-ink-800">{currentGarden.stats.gardenerCount + 1}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Actions */}
                <Card>
                  <CardContent className="p-4 space-y-2">
                    <Link href={`/garden/${currentGarden.id}`}>
                      <Button variant="secondary" className="w-full">
                        🌱 Open Garden Canvas
                      </Button>
                    </Link>
                    <Link href={`/analytics/${currentGarden.id}`}>
                      <Button variant="ghost" className="w-full">
                        📊 View Analytics
                      </Button>
                    </Link>
                    <Link href={`/discover/${currentGarden.id}`}>
                      <Button variant="ghost" className="w-full">
                        🌍 Share & Discover
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* Create Garden Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>🆕 Create New Garden</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              label="Garden Name"
              placeholder="My Vegetable Garden"
              value={newGardenName}
              onChange={(e) => setNewGardenName(e.target.value)}
              required
            />
            <div>
              <label className="block font-pixel text-xs font-semibold text-ink-600 uppercase tracking-wider mb-1.5">
                Description (optional)
              </label>
              <textarea
                className="w-full px-4 py-3 bg-cream-100 border-[3px] border-ink-700 shadow-[inset_2px_2px_0px_0px_#E8DFD0,inset_-1px_-1px_0px_0px_#5C4B26] font-body text-sm resize-none"
                rows={3}
                placeholder="A brief description of your garden..."
                value={newGardenDescription}
                onChange={(e) => setNewGardenDescription(e.target.value)}
              />
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
