'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { Progress } from '@/components/ui/Progress';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { Separator } from '@/components/ui/Separator';
import { SuccessAlert, DangerAlert } from '@/components/ui/Alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/Dialog';
import {
  loadSettings,
  saveSettings,
  updateLocalSetting,
  selectSettings,
  selectIsLoading,
  selectIsSaving,
  selectHasUnsavedChanges,
  selectCompletion,
  UserSettings,
} from '@/store/slices/settingsSlice';
import type { AppDispatch } from '@/store';

/**
 * Settings page - User configuration hub
 * Implements Profile, Account, Notifications, Location, Theme, and Danger Zone sections
 */
export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  
  const settings = useSelector(selectSettings);
  const isLoading = useSelector(selectIsLoading);
  const isSaving = useSelector(selectIsSaving);
  const hasUnsavedChanges = useSelector(selectHasUnsavedChanges);
  const completion = useSelector(selectCompletion);
  
  const [activeTab, setActiveTab] = useState('profile');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [deleteConfirm, setDeleteConfirm] = useState('');
  
  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);
  
  // Load settings on mount
  useEffect(() => {
    if (session?.user) {
      dispatch(loadSettings());
    }
  }, [session, dispatch]);
  
  // Clear save status after showing
  useEffect(() => {
    if (saveStatus === 'saved') {
      const timer = setTimeout(() => setSaveStatus('idle'), 2000);
      return () => clearTimeout(timer);
    }
  }, [saveStatus]);
  
  // Handle delete account
  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') return;
    
    // TODO: Call delete account API
    alert('Contact support to delete your account');
    setDeleteConfirm('');
  };
  
  // Handle save
  const handleSave = async () => {
    if (!settings) return;
    
    setSaveStatus('saving');
    const result = await dispatch(saveSettings(settings));
    
    if (saveSettings.fulfilled.match(result)) {
      setSaveStatus('saved');
    } else {
      setSaveStatus('idle');
    }
  };
  
  // Update a setting locally
  const updateSetting = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    dispatch(updateLocalSetting({ key, value }));
  };
  
  // Get initials for avatar fallback
  const getInitials = (name?: string | null, email?: string | null) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return '?';
  };
  
  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="font-pixel text-ink-500">LOADING...</div>
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
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-pixel text-2xl font-bold text-ink-900 tracking-wide">
                ⚙️ SETTINGS
              </h1>
              <p className="font-body text-sm text-ink-600 mt-1">
                Customize your greenU experience
              </p>
            </div>
            
            {/* Save button */}
            <div className="flex items-center gap-3">
              {saveStatus === 'saved' && (
                <Badge variant="success" className="animate-pulse">
                  ✓ Saved
                </Badge>
              )}
              <Button
                variant="primary"
                onClick={handleSave}
                loading={saveStatus === 'saving'}
                disabled={!hasUnsavedChanges}
              >
                SAVE CHANGES
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Profile Completion Bar */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-pixel text-xs font-semibold text-ink-700 uppercase tracking-wider">
                Profile Completion
              </span>
              <Badge variant={completion >= 100 ? 'success' : completion >= 50 ? 'warning' : 'default'}>
                {completion}%
              </Badge>
            </div>
            <Progress value={completion} className="h-3 mb-2" />
            <div className="flex flex-wrap gap-2 text-xs font-body text-ink-500">
              {(!settings?.avatarUrl) && <Badge variant="outline" size="sm">+ Add avatar</Badge>}
              {(!settings?.displayName) && <Badge variant="outline" size="sm">+ Add name</Badge>}
              {(!settings?.bio) && <Badge variant="outline" size="sm">+ Add bio</Badge>}
              {(!settings?.country) && <Badge variant="outline" size="sm">+ Set location</Badge>}
            </div>
          </CardContent>
        </Card>
        
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 w-full flex-wrap h-auto gap-1">
            <TabsTrigger value="profile" className="data-[state=active]:flex-1">👤 Profile</TabsTrigger>
            <TabsTrigger value="account" className="data-[state=active]:flex-1">🔐 Account</TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:flex-1">🔔 Notifications</TabsTrigger>
            <TabsTrigger value="location" className="data-[state=active]:flex-1">🌍 Location</TabsTrigger>
            <TabsTrigger value="theme" className="data-[state=active]:flex-1">🎨 Theme</TabsTrigger>
            <TabsTrigger value="danger" className="data-[state=active]:flex-1">🚪 Danger</TabsTrigger>
          </TabsList>
          
          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardContent className="p-6 space-y-6">
                <h2 className="font-pixel text-lg font-bold text-ink-800 tracking-wide">
                  👤 PROFILE SETTINGS
                </h2>
                
                {/* Avatar */}
                <div className="space-y-2">
                  <label className="font-pixel text-xs font-semibold text-ink-600 uppercase tracking-wider">
                    Avatar
                  </label>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                      {settings?.avatarUrl && <AvatarImage src={settings.avatarUrl} alt="Avatar" />}
                      <AvatarFallback className="text-xl">
                        {getInitials(settings?.displayName, session.user.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <Input
                        label="Avatar URL"
                        placeholder="https://example.com/avatar.jpg"
                        value={settings?.avatarUrl || ''}
                        onChange={(e) => updateSetting('avatarUrl', e.target.value || null)}
                      />
                      <p className="mt-1 font-body text-xs text-ink-400">
                        Paste a URL to your avatar image
                      </p>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                {/* Display Name */}
                <div className="space-y-2">
                  <Input
                    label="Display Name"
                    placeholder="Master Gardener"
                    value={settings?.displayName || ''}
                    onChange={(e) => updateSetting('displayName', e.target.value || null)}
                  />
                </div>
                
                {/* Bio */}
                <div className="space-y-2">
                  <Textarea
                    label="Bio"
                    placeholder="Tell us about your garden..."
                    value={settings?.bio || ''}
                    onChange={(e) => updateSetting('bio', e.target.value || null)}
                    className="min-h-[100px]"
                  />
                </div>
                
                <Separator />
                
                {/* Public Toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-pixel text-sm font-semibold text-ink-800">Public Profile</p>
                    <p className="font-body text-xs text-ink-500">
                      Allow others to discover and follow your garden
                    </p>
                  </div>
                  <Switch
                    checked={settings?.isPublic ?? true}
                    onCheckedChange={(checked) => updateSetting('isPublic', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Account Tab */}
          <TabsContent value="account">
            <Card>
              <CardContent className="p-6 space-y-6">
                <h2 className="font-pixel text-lg font-bold text-ink-800 tracking-wide">
                  🔐 ACCOUNT SETTINGS
                </h2>
                
                {/* Email */}
                <div className="space-y-2">
                  <Input
                    label="Email Address"
                    type="email"
                    value={session.user.email || ''}
                    disabled
                  />
                  <p className="font-body text-xs text-ink-400">
                    Contact support to change your email address
                  </p>
                </div>
                
                <Separator />
                
                {/* Password Change */}
                <div className="space-y-4">
                  <p className="font-pixel text-sm font-semibold text-ink-800">Change Password</p>
                  <Input
                    label="Current Password"
                    type="password"
                    placeholder="••••••••"
                  />
                  <Input
                    label="New Password"
                    type="password"
                    placeholder="••••••••"
                  />
                  <Input
                    label="Confirm New Password"
                    type="password"
                    placeholder="••••••••"
                  />
                  <Button variant="secondary" disabled>
                    CHANGE PASSWORD
                  </Button>
                </div>
                
                <Separator />
                
                {/* Two-Factor Auth */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-pixel text-sm font-semibold text-ink-800">Two-Factor Authentication</p>
                    <p className="font-body text-xs text-ink-500">
                      Add an extra layer of security (coming soon)
                    </p>
                  </div>
                  <Badge variant="outline">COMING SOON</Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card>
              <CardContent className="p-6 space-y-6">
                <h2 className="font-pixel text-lg font-bold text-ink-800 tracking-wide">
                  🔔 NOTIFICATION SETTINGS
                </h2>
                
                {/* Email Notifications */}
                <div className="space-y-4">
                  <p className="font-pixel text-xs font-semibold text-ink-600 uppercase tracking-wider">
                    Email Notifications
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-body text-sm text-ink-800">Harvest Reminders</p>
                      <p className="font-body text-xs text-ink-500">Get notified when it&apos;s time to harvest</p>
                    </div>
                    <Switch
                      checked={settings?.emailHarvest ?? true}
                      onCheckedChange={(checked) => updateSetting('emailHarvest', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-body text-sm text-ink-800">Companion Tips</p>
                      <p className="font-body text-xs text-ink-500">Weekly tips about companion planting</p>
                    </div>
                    <Switch
                      checked={settings?.emailCompanion ?? true}
                      onCheckedChange={(checked) => updateSetting('emailCompanion', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-body text-sm text-ink-800">Weekly Stats</p>
                      <p className="font-body text-xs text-ink-500">Receive your weekly garden summary</p>
                    </div>
                    <Switch
                      checked={settings?.emailWeekly ?? false}
                      onCheckedChange={(checked) => updateSetting('emailWeekly', checked)}
                    />
                  </div>
                </div>
                
                <Separator />
                
                {/* Push Notifications */}
                <div className="space-y-4">
                  <p className="font-pixel text-xs font-semibold text-ink-600 uppercase tracking-wider">
                    Push Notifications
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-body text-sm text-ink-800">🔥 Streak Reminders</p>
                      <p className="font-body text-xs text-ink-500">Don&apos;t lose your streak!</p>
                    </div>
                    <Switch
                      checked={settings?.pushStreak ?? true}
                      onCheckedChange={(checked) => updateSetting('pushStreak', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-body text-sm text-ink-800">🏆 Achievement Unlocks</p>
                      <p className="font-body text-xs text-ink-500">Celebrate your garden milestones</p>
                    </div>
                    <Switch
                      checked={settings?.pushAchievement ?? true}
                      onCheckedChange={(checked) => updateSetting('pushAchievement', checked)}
                    />
                  </div>
                </div>
                
                <Separator />
                
                {/* Quiet Hours */}
                <div className="space-y-4">
                  <p className="font-pixel text-xs font-semibold text-ink-600 uppercase tracking-wider">
                    Quiet Hours
                  </p>
                  <div className="flex items-center gap-4">
                    <Input
                      label="From"
                      type="time"
                      value={settings?.quietHoursStart || '22:00'}
                      onChange={(e) => updateSetting('quietHoursStart', e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      label="To"
                      type="time"
                      value={settings?.quietHoursEnd || '08:00'}
                      onChange={(e) => updateSetting('quietHoursEnd', e.target.value)}
                      className="flex-1"
                    />
                  </div>
                  <p className="font-body text-xs text-ink-400">
                    No notifications during these hours
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Location Tab */}
          <TabsContent value="location">
            <Card>
              <CardContent className="p-6 space-y-6">
                <h2 className="font-pixel text-lg font-bold text-ink-800 tracking-wide">
                  🌍 LOCATION SETTINGS
                </h2>
                
                <div className="space-y-4">
                  <Input
                    label="Country / Region"
                    placeholder="United States"
                    value={settings?.country || ''}
                    onChange={(e) => updateSetting('country', e.target.value || null)}
                  />
                  
                  <Input
                    label="Timezone"
                    placeholder="America/New_York"
                    value={settings?.timezone || ''}
                    onChange={(e) => updateSetting('timezone', e.target.value || null)}
                  />
                  
                  <Input
                    label="Climate Zone"
                    placeholder="USDA Zone 7b"
                    value={settings?.climateZone || ''}
                    onChange={(e) => updateSetting('climateZone', e.target.value || null)}
                  />
                  
                  <p className="font-body text-xs text-ink-400">
                    Your location helps us calculate planting schedules and frost dates
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Theme Tab */}
          <TabsContent value="theme">
            <Card>
              <CardContent className="p-6 space-y-6">
                <h2 className="font-pixel text-lg font-bold text-ink-800 tracking-wide">
                  🎨 THEME SETTINGS
                </h2>
                
                <div className="space-y-4">
                  <p className="font-pixel text-xs font-semibold text-ink-600 uppercase tracking-wider">
                    Appearance
                  </p>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <button
                      type="button"
                      onClick={() => updateSetting('theme', 'light')}
                      className={`p-4 border-[3px] transition-all ${
                        settings?.theme === 'light'
                          ? 'border-ink-800 bg-cream-100 shadow-[3px_3px_0px_0px_#302818]'
                          : 'border-ink-300 bg-cream-50 hover:border-ink-500'
                      }`}
                    >
                      <div className="text-3xl mb-2">☀️</div>
                      <div className="font-pixel text-xs font-semibold">Light</div>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => updateSetting('theme', 'dark')}
                      className={`p-4 border-[3px] transition-all ${
                        settings?.theme === 'dark'
                          ? 'border-ink-800 bg-ink-800 text-cream-50 shadow-[3px_3px_0px_0px_#302818]'
                          : 'border-ink-300 bg-cream-50 hover:border-ink-500'
                      }`}
                    >
                      <div className="text-3xl mb-2">🌙</div>
                      <div className="font-pixel text-xs font-semibold">Dark</div>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => updateSetting('theme', 'system')}
                      className={`p-4 border-[3px] transition-all ${
                        settings?.theme === 'system'
                          ? 'border-ink-800 bg-cream-100 shadow-[3px_3px_0px_0px_#302818]'
                          : 'border-ink-300 bg-cream-50 hover:border-ink-500'
                      }`}
                    >
                      <div className="text-3xl mb-2">💻</div>
                      <div className="font-pixel text-xs font-semibold">System</div>
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Danger Zone Tab */}
          <TabsContent value="danger">
            <Card className="border-terracotta-600">
              <CardContent className="p-6 space-y-6">
                <h2 className="font-pixel text-lg font-bold text-terracotta-700 tracking-wide">
                  🚪 DANGER ZONE
                </h2>
                
                <DangerAlert>
                  <p className="font-body text-sm">
                    These actions are irreversible. Please proceed with caution.
                  </p>
                </DangerAlert>
                
                {/* Export Data */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-ink-50 border-[2px] border-ink-300">
                  <div>
                    <p className="font-pixel text-sm font-semibold text-ink-800">Export Your Data</p>
                    <p className="font-body text-xs text-ink-500">
                      Download all your garden data as a JSON file
                    </p>
                  </div>
                  <Button variant="secondary">
                    📥 EXPORT
                  </Button>
                </div>
                
                {/* Delete Account with Confirmation Dialog */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-terracotta-50 border-[2px] border-terracotta-400">
                  <div>
                    <p className="font-pixel text-sm font-semibold text-terracotta-800">Delete Account</p>
                    <p className="font-body text-xs text-terracotta-600">
                      Permanently delete your account and all data
                    </p>
                  </div>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="danger">
                        🗑️ DELETE ACCOUNT
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="text-terracotta-700">⚠️ Delete Account</DialogTitle>
                        <DialogDescription>
                          This action is <strong>permanent</strong> and cannot be undone.
                          All your data including gardens, crops, and settings will be deleted.
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4 py-4">
                        <p className="font-body text-sm text-ink-600">
                          To confirm, please type <strong>DELETE</strong> below:
                        </p>
                        <Input
                          placeholder="Type DELETE to confirm"
                          value={deleteConfirm}
                          onChange={(e) => setDeleteConfirm(e.target.value)}
                        />
                      </div>
                      
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="ghost">CANCEL</Button>
                        </DialogClose>
                        <Button 
                          variant="danger" 
                          disabled={deleteConfirm !== 'DELETE'}
                          onClick={handleDeleteAccount}
                        >
                          DELETE FOREVER
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                
                <p className="font-body text-xs text-ink-400 text-center">
                  Need help? Contact our support team
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
