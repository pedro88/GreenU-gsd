'use client';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardInset, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useState } from 'react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/Dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { Progress, ProgressWithLabel } from '@/components/ui/Progress';
import { Avatar, AvatarImage, AvatarFallback, AvatarWithBadge } from '@/components/ui/Avatar';
import { XPToast } from '@/components/ui/XPToast';
import { Checkbox } from '@/components/ui/Checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/RadioGroup';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectLabel, SelectGroup } from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';

const categories = ['Buttons', 'Inputs', 'Cards', 'Badges', 'Dialog', 'Table', 'Tabs', 'Accordion', 'Toast', 'Progress', 'Avatar'] as const;
type Category = typeof categories[number];

export default function PlaygroundPage() {
  const [activeCategory, setActiveCategory] = useState<Category>('Buttons');
  const [inputValue, setInputValue] = useState('');
  const [errorInput, setErrorInput] = useState('Invalid value');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [checkboxChecked, setCheckboxChecked] = useState(false);
  const [radioValue, setRadioValue] = useState('tomato');
  const [switchChecked, setSwitchChecked] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastType, setToastType] = useState<'xp' | 'levelup' | 'achievement'>('xp');
  const [progressValue, setProgressValue] = useState(65);
  const [accordionOpen, setAccordionOpen] = useState<string | null>(null);
  const [theme, setTheme] = useState<'retro' | 'nature'>('retro');

  const toggleTheme = () => {
    const newTheme = theme === 'retro' ? 'nature' : 'retro';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const renderButtons = () => (
    <div className="space-y-8">
      {/* Variants */}
      <div>
        <h3 className="font-pixel text-sm font-semibold uppercase tracking-widest text-ink-600 mb-4">Variants</h3>
        <div className="flex flex-wrap gap-4">
          <Button variant="default">Default</Button>
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="outline">Outline</Button>
        </div>
      </div>

      {/* Sizes */}
      <div>
        <h3 className="font-pixel text-sm font-semibold uppercase tracking-widest text-ink-600 mb-4">Sizes</h3>
        <div className="flex flex-wrap items-center gap-4">
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
          <Button size="icon">👾</Button>
          <Button size="icon-sm">🌱</Button>
        </div>
      </div>

      {/* States */}
      <div>
        <h3 className="font-pixel text-sm font-semibold uppercase tracking-widest text-ink-600 mb-4">States</h3>
        <div className="flex flex-wrap gap-4">
          <Button>Normal</Button>
          <Button disabled>Disabled</Button>
          <Button loading>Loading</Button>
        </div>
      </div>

      {/* With Icons */}
      <div>
        <h3 className="font-pixel text-sm font-semibold uppercase tracking-widest text-ink-600 mb-4">With Icons</h3>
        <div className="flex flex-wrap gap-4">
          <Button variant="secondary">🌱 New Crop</Button>
          <Button variant="primary">📝 Save Garden</Button>
          <Button variant="danger">🗑️ Delete</Button>
        </div>
      </div>
    </div>
  );

  const renderInputs = () => (
    <div className="space-y-8">
      {/* Basic Input */}
      <div>
        <h3 className="font-pixel text-sm font-semibold uppercase tracking-widest text-ink-600 mb-4">Basic Input</h3>
        <div className="max-w-md">
          <Input
            label="Garden Name"
            placeholder="Enter your garden name..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
        </div>
      </div>

      {/* Error State */}
      <div>
        <h3 className="font-pixel text-sm font-semibold uppercase tracking-widest text-ink-600 mb-4">With Error</h3>
        <div className="max-w-md">
          <Input
            label="Email"
            type="email"
            placeholder="your@email.com"
            error={errorInput}
          />
        </div>
      </div>

      {/* Input Types */}
      <div>
        <h3 className="font-pixel text-sm font-semibold uppercase tracking-widest text-ink-600 mb-4">Input Types</h3>
        <div className="grid gap-4 max-w-md">
          <Input label="Text" type="text" placeholder="Text input" />
          <Input label="Email" type="email" placeholder="email@example.com" />
          <Input label="Password" type="password" placeholder="••••••••" />
          <Input label="Number" type="number" placeholder="42" />
        </div>
      </div>

      {/* Disabled */}
      <div>
        <h3 className="font-pixel text-sm font-semibold uppercase tracking-widest text-ink-600 mb-4">Disabled</h3>
        <div className="max-w-md">
          <Input label="Read Only" value="Locked garden" disabled />
        </div>
      </div>

      {/* Checkbox */}
      <div>
        <h3 className="font-pixel text-sm font-semibold uppercase tracking-widest text-ink-600 mb-4">Checkbox</h3>
        <div className="space-y-3 max-w-md">
          <div className="flex items-center gap-3">
            <Checkbox 
              id="water-plants" 
              checked={checkboxChecked}
              onCheckedChange={(checked) => setCheckboxChecked(checked === true)}
            />
            <label htmlFor="water-plants" className="font-body text-sm text-ink-800 cursor-pointer">
              Water plants daily
            </label>
          </div>
          <div className="flex items-center gap-3">
            <Checkbox id="fertilize" />
            <label htmlFor="fertilize" className="font-body text-sm text-ink-800 cursor-pointer">
              Apply fertilizer weekly
            </label>
          </div>
          <div className="flex items-center gap-3">
            <Checkbox id="disabled-check" disabled />
            <label className="font-body text-sm text-ink-500">Disabled option</label>
          </div>
        </div>
      </div>

      {/* Radio Group */}
      <div>
        <h3 className="font-pixel text-sm font-semibold uppercase tracking-widest text-ink-600 mb-4">Radio Group</h3>
        <div className="space-y-3 max-w-md">
          <RadioGroup value={radioValue} onValueChange={setRadioValue}>
            <div className="flex items-center gap-3">
              <RadioGroupItem value="tomato" id="r-tomato" />
              <label htmlFor="r-tomato" className="font-body text-sm text-ink-800 cursor-pointer">🍅 Tomato</label>
            </div>
            <div className="flex items-center gap-3">
              <RadioGroupItem value="pepper" id="r-pepper" />
              <label htmlFor="r-pepper" className="font-body text-sm text-ink-800 cursor-pointer">🌶️ Pepper</label>
            </div>
            <div className="flex items-center gap-3">
              <RadioGroupItem value="cucumber" id="r-cucumber" />
              <label htmlFor="r-cucumber" className="font-body text-sm text-ink-800 cursor-pointer">🥒 Cucumber</label>
            </div>
          </RadioGroup>
        </div>
      </div>

      {/* Select */}
      <div>
        <h3 className="font-pixel text-sm font-semibold uppercase tracking-widest text-ink-600 mb-4">Select</h3>
        <div className="grid gap-4 max-w-md">
          <div>
            <label className="font-pixel text-xs font-semibold uppercase tracking-wider text-ink-700 mb-2 block">
              Crop Type
            </label>
            <Select defaultValue="tomato">
              <SelectTrigger>
                <SelectValue placeholder="Select a crop..." />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Vegetables</SelectLabel>
                  <SelectItem value="tomato">🍅 Tomato</SelectItem>
                  <SelectItem value="pepper">🌶️ Pepper</SelectItem>
                  <SelectItem value="cucumber">🥒 Cucumber</SelectItem>
                  <SelectItem value="carrot">🥕 Carrot</SelectItem>
                </SelectGroup>
                <SelectGroup>
                  <SelectLabel>Herbs</SelectLabel>
                  <SelectItem value="basil">🌿 Basil</SelectItem>
                  <SelectItem value="mint">🍃 Mint</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="font-pixel text-xs font-semibold uppercase tracking-wider text-ink-700 mb-2 block">
              Disabled Select
            </label>
            <Select disabled defaultValue="locked">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="locked">Locked option</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Switch/Toggle */}
      <div>
        <h3 className="font-pixel text-sm font-semibold uppercase tracking-widest text-ink-600 mb-4">Switch (Toggle)</h3>
        <div className="space-y-4 max-w-md">
          <div className="flex items-center justify-between">
            <label className="font-body text-sm text-ink-800">Enable notifications</label>
            <Switch 
              checked={switchChecked}
              onCheckedChange={setSwitchChecked}
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="font-body text-sm text-ink-800">Auto-watering</label>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <label className="font-body text-sm text-ink-500">Disabled toggle</label>
            <Switch disabled />
          </div>
        </div>
      </div>
    </div>
  );

  const renderCards = () => (
    <div className="space-y-8">
      {/* Basic Card */}
      <div>
        <h3 className="font-pixel text-sm font-semibold uppercase tracking-widest text-ink-600 mb-4">Basic Card</h3>
        <div className="max-w-md">
          <Card>
            <CardHeader>
              <CardTitle>🌻 My Garden</CardTitle>
              <CardDescription>Created on March 15, 2026</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="font-body text-sm text-ink-700">
                A beautiful vegetable garden with tomatoes, peppers, and herbs.
              </p>
            </CardContent>
            <CardFooter>
              <Button size="sm" variant="primary">Edit</Button>
              <Button size="sm" variant="ghost">View</Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Inset Card */}
      <div>
        <h3 className="font-pixel text-sm font-semibold uppercase tracking-widest text-ink-600 mb-4">Inset Card</h3>
        <div className="max-w-md">
          <CardInset>
            <CardContent>
              <p className="font-mono text-xs text-ink-600">
                {'> System logs and debug information displayed here'}
              </p>
            </CardContent>
          </CardInset>
        </div>
      </div>

      {/* Stats Card */}
      <div>
        <h3 className="font-pixel text-sm font-semibold uppercase tracking-widest text-ink-600 mb-4">Stats Card</h3>
        <div className="grid grid-cols-2 gap-4 max-w-md">
          <Card className="p-4 text-center">
            <div className="font-pixel text-2xl font-bold text-forest-500">12</div>
            <div className="font-body text-xs text-ink-600 uppercase tracking-wider">Crops</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="font-pixel text-2xl font-bold text-terracotta-500">85%</div>
            <div className="font-body text-xs text-ink-600 uppercase tracking-wider">Success</div>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderBadges = () => (
    <div className="space-y-8">
      {/* Badge Variants */}
      <div>
        <h3 className="font-pixel text-sm font-semibold uppercase tracking-widest text-ink-600 mb-4">Variants</h3>
        <div className="flex flex-wrap gap-3">
          <Badge variant="default">Default</Badge>
          <Badge variant="primary">Primary</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="danger">Danger</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="ghost">Ghost</Badge>
        </div>
      </div>

      {/* Badge Sizes */}
      <div>
        <h3 className="font-pixel text-sm font-semibold uppercase tracking-widest text-ink-600 mb-4">Sizes</h3>
        <div className="flex flex-wrap items-center gap-3">
          <Badge size="sm">Small</Badge>
          <Badge size="default">Default</Badge>
          <Badge size="lg">Large</Badge>
        </div>
      </div>

      {/* Badge with Icons */}
      <div>
        <h3 className="font-pixel text-sm font-semibold uppercase tracking-widest text-ink-600 mb-4">With Icons</h3>
        <div className="flex flex-wrap gap-3">
          <Badge variant="success">🌱 Germinating</Badge>
          <Badge variant="primary">🍅 Fruiting</Badge>
          <Badge variant="warning">💧 Needs Water</Badge>
          <Badge variant="secondary">📅 Harvest Soon</Badge>
        </div>
      </div>

      {/* In Context */}
      <div>
        <h3 className="font-pixel text-sm font-semibold uppercase tracking-widest text-ink-600 mb-4">In Context</h3>
        <Card className="max-w-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-pixel text-sm font-bold text-ink-900">Tomato</h4>
              <p className="font-body text-xs text-ink-600">Planted 2 weeks ago</p>
            </div>
            <div className="flex gap-2">
              <Badge variant="success" size="sm">🌱 Healthy</Badge>
              <Badge variant="warning" size="sm">💧 Water</Badge>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

  const renderDialog = () => (
    <div className="space-y-8">
      <div>
        <h3 className="font-pixel text-sm font-semibold uppercase tracking-widest text-ink-600 mb-4">Dialog (Modal)</h3>
        <div className="max-w-md">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="primary">Open Dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>🌱 New Garden</DialogTitle>
                <DialogDescription>
                  Create a new garden to track your crops and progress.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <Input label="Garden Name" placeholder="My Vegetable Garden" />
                <Select defaultValue="">
                  <SelectTrigger>
                    <SelectValue placeholder="Select size..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small (4m²)</SelectItem>
                    <SelectItem value="medium">Medium (8m²)</SelectItem>
                    <SelectItem value="large">Large (16m²)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button variant="primary" onClick={() => setDialogOpen(false)}>Create Garden</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div>
        <h3 className="font-pixel text-sm font-semibold uppercase tracking-widest text-ink-600 mb-4">Confirmation Dialog</h3>
        <div className="max-w-md">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="danger">🗑️ Delete Garden</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>⚠️ Delete Garden?</DialogTitle>
                <DialogDescription>
                  This will permanently delete your garden and all associated data. This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="ghost">Cancel</Button>
                <Button variant="danger">Delete</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );

  const renderTable = () => (
    <div className="space-y-8">
      <div>
        <h3 className="font-pixel text-sm font-semibold uppercase tracking-widest text-ink-600 mb-4">Basic Table</h3>
        <div className="border-[3px] border-ink-700 shadow-[5px_5px_0px_0px_#302818] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-ink-700">
                <th className="px-4 py-3 font-pixel text-xs font-semibold text-cream-50 text-left uppercase tracking-wider">Crop</th>
                <th className="px-4 py-3 font-pixel text-xs font-semibold text-cream-50 text-left uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 font-pixel text-xs font-semibold text-cream-50 text-left uppercase tracking-wider">Planted</th>
                <th className="px-4 py-3 font-pixel text-xs font-semibold text-cream-50 text-left uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-cream-50">
              <tr className="border-b-[2px] border-ink-200 hover:bg-cream-100 transition-colors">
                <td className="px-4 py-3 font-body text-sm text-ink-800">🍅 Tomato</td>
                <td className="px-4 py-3"><Badge variant="success" size="sm">Growing</Badge></td>
                <td className="px-4 py-3 font-body text-sm text-ink-600">Mar 15</td>
                <td className="px-4 py-3"><Button size="sm" variant="ghost">View</Button></td>
              </tr>
              <tr className="border-b-[2px] border-ink-200 hover:bg-cream-100 transition-colors">
                <td className="px-4 py-3 font-body text-sm text-ink-800">🌶️ Pepper</td>
                <td className="px-4 py-3"><Badge variant="warning" size="sm">Needs Water</Badge></td>
                <td className="px-4 py-3 font-body text-sm text-ink-600">Mar 10</td>
                <td className="px-4 py-3"><Button size="sm" variant="ghost">View</Button></td>
              </tr>
              <tr className="hover:bg-cream-100 transition-colors">
                <td className="px-4 py-3 font-body text-sm text-ink-800">🥕 Carrot</td>
                <td className="px-4 py-3"><Badge variant="secondary" size="sm">Ready</Badge></td>
                <td className="px-4 py-3 font-body text-sm text-ink-600">Feb 28</td>
                <td className="px-4 py-3"><Button size="sm" variant="ghost">View</Button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h3 className="font-pixel text-sm font-semibold uppercase tracking-widest text-ink-600 mb-4">Striped Table</h3>
        <div className="border-[3px] border-ink-700 shadow-[5px_5px_0px_0px_#302818] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-ink-700">
                <th className="px-4 py-3 font-pixel text-xs font-semibold text-cream-50 text-left uppercase tracking-wider">User</th>
                <th className="px-4 py-3 font-pixel text-xs font-semibold text-cream-50 text-left uppercase tracking-wider">Level</th>
                <th className="px-4 py-3 font-pixel text-xs font-semibold text-cream-50 text-left uppercase tracking-wider">XP</th>
              </tr>
            </thead>
            <tbody className="[&>tr:nth-child(odd)]:bg-cream-100 [&>tr:nth-child(even)]:bg-cream-50">
              <tr className="border-b-[2px] border-ink-200">
                <td className="px-4 py-3 font-body text-sm text-ink-800">🌱 Gardener_01</td>
                <td className="px-4 py-3"><Badge variant="primary" size="sm">12</Badge></td>
                <td className="px-4 py-3 font-body text-sm text-ink-600">2,450</td>
              </tr>
              <tr className="border-b-[2px] border-ink-200">
                <td className="px-4 py-3 font-body text-sm text-ink-800">🍅 TomatoKing</td>
                <td className="px-4 py-3"><Badge variant="secondary" size="sm">8</Badge></td>
                <td className="px-4 py-3 font-body text-sm text-ink-600">1,820</td>
              </tr>
              <tr className="border-b-[2px] border-ink-200">
                <td className="px-4 py-3 font-body text-sm text-ink-800">🌿 HerbMaster</td>
                <td className="px-4 py-3"><Badge variant="success" size="sm">15</Badge></td>
                <td className="px-4 py-3 font-body text-sm text-ink-600">3,100</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderTabs = () => (
    <div className="space-y-8">
      <div>
        <h3 className="font-pixel text-sm font-semibold uppercase tracking-widest text-ink-600 mb-4">Basic Tabs</h3>
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="crops">Crops</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <p className="font-body text-sm text-ink-700">
              Welcome to your garden overview. Track your crops, view analytics, and manage your plants all in one place.
            </p>
          </TabsContent>
          <TabsContent value="crops">
            <p className="font-body text-sm text-ink-700">
              Your crops: 12 plants across 4 varieties. Next harvest in 3 days.
            </p>
          </TabsContent>
          <TabsContent value="settings">
            <p className="font-body text-sm text-ink-700">
              Configure your garden settings, notifications, and preferences.
            </p>
          </TabsContent>
        </Tabs>
      </div>

      <div>
        <h3 className="font-pixel text-sm font-semibold uppercase tracking-widest text-ink-600 mb-4">Tabs with Badges</h3>
        <Tabs defaultValue="active">
          <TabsList>
            <TabsTrigger value="active">Active <Badge className="ml-2" size="sm">3</Badge></TabsTrigger>
            <TabsTrigger value="completed">Completed <Badge className="ml-2" size="sm" variant="secondary">12</Badge></TabsTrigger>
            <TabsTrigger value="archived">Archived <Badge className="ml-2" size="sm" variant="ghost">8</Badge></TabsTrigger>
          </TabsList>
          <TabsContent value="active">
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-cream-100 border-[2px] border-ink-300">
                <span className="font-body text-sm">🍅 Tomato Garden</span>
                <Badge variant="success" size="sm">Growing</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-cream-100 border-[2px] border-ink-300">
                <span className="font-body text-sm">🌶️ Pepper Bed</span>
                <Badge variant="warning" size="sm">Needs Care</Badge>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="completed">
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-cream-100 border-[2px] border-ink-300">
                <span className="font-body text-sm">🥕 First Carrots</span>
                <Badge variant="secondary" size="sm">Harvested</Badge>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="archived">
            <p className="font-body text-sm text-ink-600">Archived gardens will appear here.</p>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );

  const renderAccordion = () => (
    <div className="space-y-8">
      <div>
        <h3 className="font-pixel text-sm font-semibold uppercase tracking-widest text-ink-600 mb-4">Accordion</h3>
        <div className="space-y-2 max-w-lg">
          {/* Item 1 */}
          <div className="border-[3px] border-ink-700 shadow-[3px_3px_0px_0px_#302818]">
            <button
              onClick={() => setAccordionOpen(accordionOpen === '1' ? null : '1')}
              className="w-full px-4 py-3 flex items-center justify-between bg-cream-100 hover:bg-cream-200 transition-colors"
            >
              <span className="font-pixel text-sm font-semibold text-ink-800">🌱 How do I start a garden?</span>
              <span className="font-pixel text-lg text-ink-700">{accordionOpen === '1' ? '−' : '+'}</span>
            </button>
            {accordionOpen === '1' && (
              <div className="px-4 py-3 bg-cream-50 border-t-[2px] border-ink-200">
                <p className="font-body text-sm text-ink-700">
                  Start by choosing a sunny spot with good soil drainage. Prepare your plot by clearing weeds and adding compost. Then select crops suited to your climate and season.
                </p>
              </div>
            )}
          </div>

          {/* Item 2 */}
          <div className="border-[3px] border-ink-700 shadow-[3px_3px_0px_0px_#302818]">
            <button
              onClick={() => setAccordionOpen(accordionOpen === '2' ? null : '2')}
              className="w-full px-4 py-3 flex items-center justify-between bg-cream-100 hover:bg-cream-200 transition-colors"
            >
              <span className="font-pixel text-sm font-semibold text-ink-800">💧 How often should I water?</span>
              <span className="font-pixel text-lg text-ink-700">{accordionOpen === '2' ? '−' : '+'}</span>
            </button>
            {accordionOpen === '2' && (
              <div className="px-4 py-3 bg-cream-50 border-t-[2px] border-ink-200">
                <p className="font-body text-sm text-ink-700">
                  Most vegetables need 1-2 inches of water per week. Water deeply but less frequently to encourage deep root growth. Early morning is the best time to water.
                </p>
              </div>
            )}
          </div>

          {/* Item 3 */}
          <div className="border-[3px] border-ink-700 shadow-[3px_3px_0px_0px_#302818]">
            <button
              onClick={() => setAccordionOpen(accordionOpen === '3' ? null : '3')}
              className="w-full px-4 py-3 flex items-center justify-between bg-cream-100 hover:bg-cream-200 transition-colors"
            >
              <span className="font-pixel text-sm font-semibold text-ink-800">🌿 What are companion plants?</span>
              <span className="font-pixel text-lg text-ink-700">{accordionOpen === '3' ? '−' : '+'}</span>
            </button>
            {accordionOpen === '3' && (
              <div className="px-4 py-3 bg-cream-50 border-t-[2px] border-ink-200">
                <p className="font-body text-sm text-ink-700">
                  Companion plants are species that grow well together and can help with pest control, pollination, and maximizing garden space. For example, tomatoes grow well with basil.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderToast = () => (
    <div className="space-y-8">
      <div>
        <h3 className="font-pixel text-sm font-semibold uppercase tracking-widest text-ink-600 mb-4">Toast Notifications</h3>
        <div className="flex flex-wrap gap-3">
          <Button 
            variant="primary"
            onClick={() => { setToastType('xp'); setToastVisible(true); }}
          >
            ✨ Show XP Toast
          </Button>
          <Button 
            variant="secondary"
            onClick={() => { setToastType('levelup'); setToastVisible(true); }}
          >
            ⬆️ Show Level Up
          </Button>
          <Button 
            variant="outline"
            onClick={() => { setToastType('achievement'); setToastVisible(true); }}
          >
            🏆 Show Achievement
          </Button>
        </div>
      </div>

      <div>
        <h3 className="font-pixel text-sm font-semibold uppercase tracking-widest text-ink-600 mb-4">Toast States</h3>
        <div className="space-y-4">
          <div className="p-4 bg-ink-100 border-[2px] border-ink-300">
            <p className="font-pixel text-xs text-ink-600 mb-2">XP GAINED</p>
            <div className="retro-dialog px-4 py-3 max-w-[200px]" style={{ border: '3px solid #4A7C59', boxShadow: '4px 4px 0px #302818', background: '#F5EFE0' }}>
              <div className="flex items-center gap-2">
                <span className="font-pixel text-lg font-bold" style={{ color: '#4A7C59' }}>+50 XP</span>
              </div>
            </div>
          </div>
          <div className="p-4 bg-ink-100 border-[2px] border-ink-300">
            <p className="font-pixel text-xs text-ink-600 mb-2">LEVEL UP</p>
            <div className="retro-dialog px-4 py-3 max-w-[200px]" style={{ border: '3px solid #CC6B47', boxShadow: '5px 5px 0px #CC6B47, 8px 8px 0px #302818', background: 'linear-gradient(135deg, #302818 0%, #4A3728 100%)' }}>
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-10 h-10 font-pixel text-lg font-bold border-[3px] border-ink-800" style={{ background: '#FFCC4D', boxShadow: '3px 3px 0px #302818' }}>
                  5
                </div>
                <span className="font-pixel text-xs text-cream-100">LEVEL UP!</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProgress = () => (
    <div className="space-y-8">
      <div>
        <h3 className="font-pixel text-sm font-semibold uppercase tracking-widest text-ink-600 mb-4">Progress Bar</h3>
        <div className="max-w-md space-y-4">
          <ProgressWithLabel label="Garden Progress" value={progressValue} />
          <ProgressWithLabel label="XP to Level 12" value={75} />
        </div>
      </div>

      <div>
        <h3 className="font-pixel text-sm font-semibold uppercase tracking-widest text-ink-600 mb-4">Progress States</h3>
        <div className="max-w-md space-y-4">
          <div>
            <p className="font-pixel text-xs text-ink-600 mb-2">0% Empty</p>
            <Progress value={0} />
          </div>
          <div>
            <p className="font-pixel text-xs text-ink-600 mb-2">25% Quarter</p>
            <Progress value={25} />
          </div>
          <div>
            <p className="font-pixel text-xs text-ink-600 mb-2">50% Half</p>
            <Progress value={50} />
          </div>
          <div>
            <p className="font-pixel text-xs text-ink-600 mb-2">75% Three-Quarters</p>
            <Progress value={75} />
          </div>
          <div>
            <p className="font-pixel text-xs text-ink-600 mb-2">100% Complete</p>
            <Progress value={100} />
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-pixel text-sm font-semibold uppercase tracking-widest text-ink-600 mb-4">Interactive</h3>
        <div className="max-w-md space-y-4">
          <ProgressWithLabel label="Adjust Progress" value={progressValue} />
          <div className="flex gap-2">
            <Button size="sm" onClick={() => setProgressValue(Math.max(0, progressValue - 10))}>−10</Button>
            <Button size="sm" onClick={() => setProgressValue(Math.min(100, progressValue + 10))}>+10</Button>
            <Button size="sm" variant="ghost" onClick={() => setProgressValue(0)}>Reset</Button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAvatar = () => (
    <div className="space-y-8">
      <div>
        <h3 className="font-pixel text-sm font-semibold uppercase tracking-widest text-ink-600 mb-4">Basic Avatar</h3>
        <div className="flex items-center gap-4">
          <Avatar>
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback style={{ background: '#4A7C59' }}>GM</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback style={{ background: '#CC6B47' }}>PK</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback style={{ background: '#6B5B45' }}>AL</AvatarFallback>
          </Avatar>
        </div>
      </div>

      <div>
        <h3 className="font-pixel text-sm font-semibold uppercase tracking-widest text-ink-600 mb-4">Avatar Sizes</h3>
        <div className="flex items-center gap-4">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-[10px]">SM</AvatarFallback>
          </Avatar>
          <Avatar className="h-10 w-10">
            <AvatarFallback>MD</AvatarFallback>
          </Avatar>
          <Avatar className="h-14 w-14">
            <AvatarFallback className="text-lg">LG</AvatarFallback>
          </Avatar>
          <Avatar className="h-20 w-20">
            <AvatarFallback className="text-2xl">XL</AvatarFallback>
          </Avatar>
        </div>
      </div>

      <div>
        <h3 className="font-pixel text-sm font-semibold uppercase tracking-widest text-ink-600 mb-4">Avatar with Level Badge</h3>
        <div className="flex items-center gap-6">
          <AvatarWithBadge level={5}>
            <AvatarFallback>JD</AvatarFallback>
          </AvatarWithBadge>
          <AvatarWithBadge level={12} badgePosition="top-right">
            <AvatarFallback style={{ background: '#4A7C59' }}>GM</AvatarFallback>
          </AvatarWithBadge>
          <AvatarWithBadge level={99} badgePosition="bottom-left">
            <AvatarFallback style={{ background: '#CC6B47' }}>MK</AvatarFallback>
          </AvatarWithBadge>
        </div>
      </div>

      <div>
        <h3 className="font-pixel text-sm font-semibold uppercase tracking-widest text-ink-600 mb-4">Avatar Group</h3>
        <div className="flex items-center">
          <div className="flex -space-x-3">
            <Avatar className="border-cream-50">
              <AvatarFallback style={{ background: '#4A7C59' }}>GM</AvatarFallback>
            </Avatar>
            <Avatar className="border-cream-50">
              <AvatarFallback style={{ background: '#CC6B47' }}>PK</AvatarFallback>
            </Avatar>
            <Avatar className="border-cream-50">
              <AvatarFallback style={{ background: '#6B5B45' }}>AL</AvatarFallback>
            </Avatar>
            <Avatar className="border-cream-50">
              <AvatarFallback style={{ background: '#8B7355' }}>+3</AvatarFallback>
            </Avatar>
          </div>
          <span className="ml-3 font-body text-sm text-ink-600">3 gardeners online</span>
        </div>
      </div>
    </div>
  );

  const renderCategory = () => {
    switch (activeCategory) {
      case 'Buttons': return renderButtons();
      case 'Inputs': return renderInputs();
      case 'Cards': return renderCards();
      case 'Badges': return renderBadges();
      case 'Dialog': return renderDialog();
      case 'Table': return renderTable();
      case 'Tabs': return renderTabs();
      case 'Accordion': return renderAccordion();
      case 'Toast': return renderToast();
      case 'Progress': return renderProgress();
      case 'Avatar': return renderAvatar();
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-parchment py-8 px-4">
      {/* XP Toast */}
      <XPToast
        visible={toastVisible}
        onClose={() => setToastVisible(false)}
        type={toastType}
        xp={toastType === 'xp' ? 50 : toastType === 'achievement' ? 100 : undefined}
        level={toastType === 'levelup' ? 5 : undefined}
        previousLevel={toastType === 'levelup' ? 4 : undefined}
        achievementName={toastType === 'achievement' ? 'First Harvest' : undefined}
        achievementIcon={toastType === 'achievement' ? '🏆' : undefined}
      />

      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="text-center">
          <h1 className="font-pixel text-3xl font-bold text-ink-900 mb-2">
            🎮 Component Playground
          </h1>
          <p className="font-body text-sm text-ink-600 mb-4">
            Retro 8bit + Nature design system. Test and iterate on components.
          </p>
          {/* Theme Toggle */}
          <div className="inline-flex items-center gap-3 px-4 py-2 border-[3px] border-ink-700 shadow-[3px_3px_0px_0px_#302818]">
            <span className={`font-pixel text-sm ${theme === 'retro' ? 'text-ink-900' : 'text-ink-400'}`}>Retro 8bit</span>
            <button
              onClick={toggleTheme}
              className={`relative w-14 h-7 border-[3px] border-ink-700 transition-all duration-200 ${
                theme === 'nature' 
                  ? 'bg-forest-500 shadow-[2px_2px_0px_0px_#302818]' 
                  : 'bg-cream-200 shadow-[2px_2px_0px_0px_#302818]'
              }`}
              style={{ boxShadow: '3px 3px 0px #302818' }}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 border-[2px] border-ink-700 transition-all duration-200 ${
                  theme === 'nature' ? 'left-[calc(100%-24px)]' : 'left-0.5'
                }`}
                style={{ 
                  background: theme === 'nature' ? '#F5EFE0' : '#FFCC4D',
                  boxShadow: '2px 2px 0px #302818'
                }}
              />
            </button>
            <span className={`font-pixel text-sm ${theme === 'nature' ? 'text-ink-900' : 'text-ink-400'}`}>🌿 Nature</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto">
        <div className="flex gap-8">
          {/* Sidebar */}
          <nav className="w-48 shrink-0">
            <div className="sticky top-8">
              <h2 className="font-pixel text-xs font-semibold uppercase tracking-widest text-ink-600 mb-3">
                Categories
              </h2>
              <ul className="space-y-2">
                {categories.map((cat) => (
                  <li key={cat}>
                    <button
                      onClick={() => setActiveCategory(cat)}
                      className={`w-full text-left px-3 py-2 font-pixel text-sm transition-all duration-75 border-[2px] ${
                        activeCategory === cat
                          ? 'bg-cream-500 border-ink-700 text-ink-900 shadow-[2px_2px_0px_0px_#302818]'
                          : 'bg-cream-100 border-transparent text-ink-600 hover:bg-cream-200 hover:border-ink-500'
                      }`}
                    >
                      {cat}
                    </button>
                  </li>
                ))}
              </ul>

              {/* Design Tokens */}
              <div className="mt-8">
                <h2 className="font-pixel text-xs font-semibold uppercase tracking-widest text-ink-600 mb-3">
                  Colors
                </h2>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-cream-500 border border-ink-700" />
                    <span className="font-mono text-xs text-ink-600">cream-500</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-terracotta-500 border border-ink-700" />
                    <span className="font-mono text-xs text-ink-600">terracotta-500</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-forest-500 border border-ink-700" />
                    <span className="font-mono text-xs text-ink-600">forest-500</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-ink-700 border border-ink-700" />
                    <span className="font-mono text-xs text-ink-600">ink-700</span>
                  </div>
                </div>
              </div>
            </div>
          </nav>

          {/* Content Area */}
          <main className="flex-1">
            <Card className="p-6">
              <div className="mb-6 pb-4 border-b-[2px] border-ink-200">
                <h2 className="font-pixel text-xl font-bold text-ink-900">
                  {activeCategory}
                </h2>
              </div>
              <div className="space-y-8">
                {renderCategory()}
              </div>
            </Card>
          </main>
        </div>
      </div>
    </div>
  );
}
