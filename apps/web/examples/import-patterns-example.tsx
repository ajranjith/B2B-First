/**
 * Import Patterns Examples
 * Demonstrates all the different ways to import components
 */

// ============================================================================
// PATTERN 1: Main Barrel Export (RECOMMENDED)
// ============================================================================
// Import everything from the main components index
// This is the most convenient and recommended approach

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
  MiniCart,
  MiniCartButton
} from '@/components';

// ============================================================================
// PATTERN 2: Category-Specific Barrel Exports
// ============================================================================
// Import from specific categories when you want to be more explicit
// Good for code organization and understanding component domains

import {
  Button as UIButton,
  Card as UICard,
  Input as UIInput
} from '@/ui';

import {
  MiniCart as DealerMiniCart,
  MiniCartButton as DealerCartButton
} from '@/dealer';

// ============================================================================
// PATTERN 3: Direct File Imports
// ============================================================================
// Import from specific files when you need:
// - Better tree-shaking
// - Avoiding circular dependencies
// - Clear dependency graph

import { Button as DirectButton } from '@/components/ui/button';
import { Card as DirectCard } from '@/components/ui/card';

// Or using the full path
import { Input as DirectInput } from '@/ui/input';
import { MiniCart as DirectMiniCart } from '@/dealer/MiniCart';

// ============================================================================
// PATTERN 4: Mixed Imports
// ============================================================================
// You can mix patterns based on your needs

import { Button } from '@/components';  // Barrel export
import { Input } from '@/ui/input';     // Direct file
import { Label } from '@/ui';           // Category barrel

// ============================================================================
// PATTERN 5: Type-Only Imports
// ============================================================================
// Import only types to avoid runtime overhead

import type { ComponentName, UiComponents } from '@/components';

// ============================================================================
// PATTERN 6: Utility Imports
// ============================================================================
// Import component utilities and helpers

import {
  resolveComponent,
  getComponentsByCategory,
  getAllComponentNames,
  hasComponent,
  overrideComponent,
  clearOverride,
  getRegistryStats
} from '@/components';

// ============================================================================
// PATTERN 7: Supporting Modules
// ============================================================================
// Import from other barrel exports

import { useCart, useDebounce } from '@/hooks';
import { cn, api } from '@/lib';
import { CartProvider } from '@/context';

// ============================================================================
// EXAMPLE COMPONENT USING ALL PATTERNS
// ============================================================================

export default function ImportPatternsExample() {
  // Using utilities
  const componentStats = getRegistryStats();
  const hasButton = hasComponent('Button');

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Import Patterns Examples</h1>

      {/* Pattern 1: Main Barrel Export */}
      <section className="mb-8 p-6 border rounded-lg">
        <h2 className="text-xl font-bold mb-4">Pattern 1: Main Barrel Export</h2>
        <Card>
          <CardHeader>
            <CardTitle>Component Card</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="input1">Input Label</Label>
                <Input id="input1" placeholder="Type here..." />
              </div>
              <Button>Click Me</Button>
            </div>
          </CardContent>
        </Card>
        <pre className="mt-4 bg-gray-100 p-4 rounded text-sm">
{`import { Button, Card, Input } from '@/components';`}
        </pre>
      </section>

      {/* Pattern 2: Category Barrel */}
      <section className="mb-8 p-6 border rounded-lg">
        <h2 className="text-xl font-bold mb-4">Pattern 2: Category-Specific Imports</h2>
        <div className="space-y-2">
          <UIButton>UI Button</UIButton>
          <DealerCartButton />
        </div>
        <pre className="mt-4 bg-gray-100 p-4 rounded text-sm">
{`import { Button } from '@/ui';
import { MiniCartButton } from '@/dealer';`}
        </pre>
      </section>

      {/* Pattern 3: Direct File */}
      <section className="mb-8 p-6 border rounded-lg">
        <h2 className="text-xl font-bold mb-4">Pattern 3: Direct File Imports</h2>
        <div className="space-y-2">
          <DirectButton>Direct Button</DirectButton>
          <DirectInput placeholder="Direct input..." />
        </div>
        <pre className="mt-4 bg-gray-100 p-4 rounded text-sm">
{`import { Button } from '@/components/ui/button';
import { Input } from '@/ui/input';`}
        </pre>
      </section>

      {/* Pattern 6: Utilities */}
      <section className="mb-8 p-6 border rounded-lg">
        <h2 className="text-xl font-bold mb-4">Pattern 6: Component Utilities</h2>
        <div className="space-y-2">
          <p><strong>Has Button:</strong> {hasButton ? '✅' : '❌'}</p>
          <p><strong>Total Components:</strong> {componentStats.totalComponents}</p>
          <p><strong>Categories:</strong> {componentStats.categories}</p>
        </div>
        <pre className="mt-4 bg-gray-100 p-4 rounded text-sm">
{`import { hasComponent, getRegistryStats } from '@/components';`}
        </pre>
      </section>

      {/* Pattern 7: Supporting Modules */}
      <section className="mb-8 p-6 border rounded-lg">
        <h2 className="text-xl font-bold mb-4">Pattern 7: Supporting Modules</h2>
        <pre className="bg-gray-100 p-4 rounded text-sm">
{`import { useCart, useDebounce } from '@/hooks';
import { cn, api } from '@/lib';
import { CartProvider } from '@/context';`}
        </pre>
      </section>

      {/* Comparison Table */}
      <section className="mb-8 p-6 border rounded-lg">
        <h2 className="text-xl font-bold mb-4">When to Use Each Pattern</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 text-left">Pattern</th>
              <th className="border p-2 text-left">Use When</th>
              <th className="border p-2 text-left">Pros</th>
              <th className="border p-2 text-left">Cons</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border p-2">Main Barrel</td>
              <td className="border p-2">Default choice for all imports</td>
              <td className="border p-2">Simple, consistent, autocomplete</td>
              <td className="border p-2">Slightly larger bundle (minimal)</td>
            </tr>
            <tr>
              <td className="border p-2">Category Barrel</td>
              <td className="border p-2">Working within specific domain</td>
              <td className="border p-2">Clear domain boundaries</td>
              <td className="border p-2">Need to know categories</td>
            </tr>
            <tr>
              <td className="border p-2">Direct File</td>
              <td className="border p-2">Bundle size critical, avoiding cycles</td>
              <td className="border p-2">Best tree-shaking, no circular deps</td>
              <td className="border p-2">More verbose, path changes break</td>
            </tr>
            <tr>
              <td className="border p-2">Mixed</td>
              <td className="border p-2">Balancing convenience and optimization</td>
              <td className="border p-2">Flexible, pragmatic</td>
              <td className="border p-2">Inconsistent if not documented</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Recommendations */}
      <section className="mb-8 p-6 border rounded-lg bg-blue-50">
        <h2 className="text-xl font-bold mb-4">💡 Recommendations</h2>
        <ul className="list-disc list-inside space-y-2">
          <li><strong>Default to Pattern 1</strong> (main barrel) for consistency and developer experience</li>
          <li><strong>Use Pattern 3</strong> (direct file) only when bundle size is critical</li>
          <li><strong>Use Pattern 2</strong> (category barrel) when working extensively in one domain</li>
          <li><strong>Never mix</strong> different patterns for the same component in one file</li>
          <li><strong>Document</strong> team conventions in your project README</li>
        </ul>
      </section>
    </div>
  );
}

// ============================================================================
// TYPE SAFETY EXAMPLES
// ============================================================================

export function TypeSafetyExample() {
  // Component names are typed
  const componentName: ComponentName = 'Button'; // ✅ Valid
  // const invalid: ComponentName = 'NotAComponent'; // ❌ TypeScript error

  // Category-specific types
  const uiComponent: UiComponents = 'Button'; // ✅ Valid
  // const dealerInUI: UiComponents = 'MiniCart'; // ❌ TypeScript error

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Type Safety</h2>
      <p>Component: {componentName}</p>
      <p>UI Component: {uiComponent}</p>
    </div>
  );
}
