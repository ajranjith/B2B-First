/**
 * Real-World Usage Example
 * Demonstrates practical use of the component alias system
 */

'use client';

import { useState } from 'react';

// BEFORE Component Alias System:
// import { Button } from '../components/ui/button';
// import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
// import { Input } from '../components/ui/input';
// import { Label } from '../components/ui/label';
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
// import { useCart } from '../hooks/useCart';
// import { cn } from '../lib/utils';

// AFTER Component Alias System:
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Input,
  Label,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components';
import { useCart } from '@/hooks';
import { cn } from '@/lib';

/**
 * Benefits Demonstrated:
 * 1. Cleaner imports - all components from one source
 * 2. No relative paths - easier to move files
 * 3. Consistent patterns - easier to maintain
 * 4. Better DX - autocomplete works perfectly
 */

export default function ProductForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
  });
  const { addItem } = useCart();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addItem({
      id: Date.now().toString(),
      name: formData.name,
      price: parseFloat(formData.price),
      quantity: 1,
    });
    setIsOpen(false);
    setFormData({ name: '', price: '', description: '' });
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Add Product</Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter product name"
                required
              />
            </div>

            <div>
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter description"
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit">Add Product</Button>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

/**
 * Migration Example:
 * How to migrate existing code to use the component alias system
 */

// BEFORE (relative imports):
/*
import { Button } from '../../../../components/ui/button';
import { Card } from '../../../../components/ui/card';
import { useCart } from '../../../../hooks/useCart';
import { api } from '../../../../lib/api';
*/

// AFTER (alias imports):
/*
import { Button, Card } from '@/components';
import { useCart } from '@/hooks';
import { api } from '@/lib';
*/

/**
 * File Reorganization Example:
 * The component alias system makes reorganization effortless
 */

export function FileReorganizationDemo() {
  // These imports will work even if we move files:
  // - Move button.tsx from ui/ to primitives/
  // - Move Card from ui/ to layouts/
  // - Move useCart from hooks/ to stores/
  //
  // Just update the registry and regenerate - no import changes needed!

  return (
    <Card>
      <CardHeader>
        <CardTitle>File Organization Freedom</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4">
          With the component alias system, you can reorganize your files without
          breaking imports throughout your codebase.
        </p>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-green-600">✓</span>
            <span>Move components between categories</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-600">✓</span>
            <span>Rename directories</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-600">✓</span>
            <span>Restructure your project</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-600">✓</span>
            <span>No import statements to update</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Component Swapping Demo:
 * Real-world use case for feature flags
 */

export function FeatureFlagDemo() {
  // In a real app, this might come from a feature flag service
  const isNewDesignEnabled = false;

  // The Button component automatically uses the right implementation
  // based on the registry override set by feature flag initialization

  return (
    <Card>
      <CardHeader>
        <CardTitle>Feature Flag Integration</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4">
          Feature flag: {isNewDesignEnabled ? 'New Design' : 'Classic Design'}
        </p>
        <Button>
          This button adapts to feature flags automatically
        </Button>
        <p className="mt-4 text-sm text-gray-600">
          No conditional rendering needed - the component registry handles it!
        </p>
      </CardContent>
    </Card>
  );
}

/**
 * Team Collaboration Benefits
 */

export function CollaborationBenefits() {
  return (
    <div className="max-w-4xl mx-auto p-8 space-y-6">
      <h1 className="text-3xl font-bold">Team Collaboration Benefits</h1>

      <Card>
        <CardHeader>
          <CardTitle>🎯 Consistent Imports Across Team</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            Everyone uses the same import pattern. No more debates about relative
            vs. absolute paths, or which alias to use.
          </p>
          <pre className="mt-2 bg-gray-100 p-2 rounded text-sm">
            {`import { Button, Card } from '@/components';`}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>🔄 Easy Code Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            When someone moves a file, you only see registry changes in the PR.
            No massive diffs with import statement updates across 50 files.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>📚 Better Documentation</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            The component registry serves as living documentation. Run{' '}
            <code className="bg-gray-100 px-2 py-1 rounded">pnpm components:stats</code>{' '}
            to see all available components.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>🚀 Faster Onboarding</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            New team members can discover and import components easily. They don't
            need to memorize the directory structure.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>🎨 Design System Evolution</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            Evolve your design system without breaking changes. Swap implementations
            gradually using feature flags or user segments.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Performance Considerations
 */

export function PerformanceNotes() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>⚡ Performance Impact</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold mb-2">Bundle Size:</h3>
          <p className="text-sm text-gray-600">
            Next.js tree-shaking works perfectly with barrel exports. Only imported
            components are included in your bundle.
          </p>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Build Time:</h3>
          <p className="text-sm text-gray-600">
            Barrel exports are generated before build. Zero runtime overhead.
            The `prebuild` hook handles this automatically.
          </p>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Development:</h3>
          <p className="text-sm text-gray-600">
            Hot module reloading works as expected. No performance degradation
            during development.
          </p>
        </div>

        <div>
          <h3 className="font-semibold mb-2">TypeScript:</h3>
          <p className="text-sm text-gray-600">
            Type checking is instant thanks to TypeScript's incremental compilation.
            The component registry is fully typed.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
