'use client';

import { Button, buttonVariants } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardInset, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useState } from 'react';

const categories = ['Buttons', 'Inputs', 'Cards', 'Badges'] as const;
type Category = typeof categories[number];

export default function PlaygroundPage() {
  const [activeCategory, setActiveCategory] = useState<Category>('Buttons');
  const [inputValue, setInputValue] = useState('');
  const [errorInput, setErrorInput] = useState('Invalid value');

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

  const renderCategory = () => {
    switch (activeCategory) {
      case 'Buttons': return renderButtons();
      case 'Inputs': return renderInputs();
      case 'Cards': return renderCards();
      case 'Badges': return renderBadges();
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-parchment py-8 px-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="text-center">
          <h1 className="font-pixel text-3xl font-bold text-ink-900 mb-2">
            🎮 Component Playground
          </h1>
          <p className="font-body text-sm text-ink-600">
            Retro 8bit + Nature design system. Test and iterate on components.
          </p>
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