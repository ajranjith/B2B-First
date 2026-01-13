# Component Alias System Documentation

## 📋 Overview

The Component Alias System provides a centralized, flexible way to manage component imports in your Next.js application. It enables:

- ✅ **Stable import paths** - Always use `@/components` regardless of file structure
- ✅ **Flexible file organization** - Move files freely without breaking imports
- ✅ **Component swapping** - Change implementations without updating imports
- ✅ **No rebuild overhead** - Reorganize files without rebuilding
- ✅ **Centralized registry** - Single source of truth for all components

---

## 🏗️ Architecture

### Core Components

```
apps/web/src/components/
├── component-registry.json         # Central component registry
├── component-registry.schema.json  # JSON schema for validation
├── registry-types.ts               # TypeScript type definitions
├── component-loader.ts             # Runtime component resolution
├── component-names.d.ts            # Generated type declarations
├── index.ts                        # Main barrel export (auto-generated)
├── ui/
│   ├── index.ts                   # Category barrel export (auto-generated)
│   ├── button.tsx
│   ├── card.tsx
│   └── ...
└── dealer/
    ├── index.ts                   # Category barrel export (auto-generated)
    └── ...
```

### Supporting Files

```
apps/web/
├── scripts/
│   ├── generate-component-exports.ts  # Auto-generate barrel exports
│   └── component-stats.ts             # Display registry statistics
├── tsconfig.json                      # Enhanced path aliases
└── package.json                       # NPM scripts
```

---

## 🚀 Quick Start

### 1. Import Components

You can now import components using multiple patterns:

```typescript
// ✅ From main barrel export (RECOMMENDED)
import { Button, Card, Input, Dialog } from '@/components';

// ✅ From category barrel export
import { Button, Card } from '@/ui';
import { MiniCart } from '@/dealer';

// ✅ From specific file (if you need tree-shaking)
import { Button } from '@/components/ui/button';
import { Button } from '@/ui/button';
```

### 2. Use Enhanced Path Aliases

The following aliases are available throughout your app:

```typescript
// Components
import { Button } from '@/components';
import { Button } from '@/ui';
import { MiniCart } from '@/dealer';

// Hooks
import { useCart, useDebounce } from '@/hooks';

// Utilities
import { cn, api } from '@/lib';

// Context Providers
import { CartProvider } from '@/context';

// Any other src files
import something from '@/app/admin/...';
```

---

## 📦 Component Registry

### Registry Structure

The `component-registry.json` file is the single source of truth:

```json
{
  "version": "1.0.0",
  "components": {
    "ui": {
      "Button": {
        "path": "./ui/button",
        "export": "Button",
        "category": "ui",
        "description": "Primary button component",
        "aliases": ["PrimaryButton"]
      }
    }
  },
  "aliases": {
    "PrimaryButton": "Button"
  },
  "overrides": {}
}
```

### Registry Fields

| Field | Type | Description |
|-------|------|-------------|
| `path` | string | Relative path from components directory |
| `export` | string \| string[] | Export name(s) from the module |
| `category` | string | Component category (ui, dealer, etc.) |
| `description` | string | Component description |
| `aliases` | string[] | Alternative names for the component |
| `deprecated` | boolean | Whether component is deprecated |
| `replacement` | string | Replacement component if deprecated |

---

## 🔧 NPM Scripts

### Generate Barrel Exports

Regenerate all barrel export files from the registry:

```bash
pnpm components:generate
```

This will:
- Read `component-registry.json`
- Generate `index.ts` files for each category
- Generate main `components/index.ts`
- Generate TypeScript type declarations
- Backup any manually edited files

**Note:** This runs automatically before every build via the `prebuild` hook.

### View Component Statistics

Display information about registered components:

```bash
pnpm components:stats
```

Example output:
```
📊 Component Registry Statistics

Version: 1.0.0

📁 Categories:
   ui              21 components
   dealer          2 components
   Total           23 components

📦 All Components:

ui:
  - Alert                AlertDescription, AlertTitle
  - Avatar               Avatar, AvatarFallback, AvatarImage
  - Button               Button
  ...
```

---

## 🔄 Component Swapping

### Runtime Override

You can override component implementations at runtime:

```typescript
import { overrideComponent, clearOverride } from '@/components';

// Override Button with a custom implementation
overrideComponent('Button', './custom/MyButton', 'MyButton');

// Later, clear the override
clearOverride('Button');
```

### Registry Override

For permanent overrides, edit `component-registry.json`:

```json
{
  "overrides": {
    "Button": {
      "path": "./custom/MyButton",
      "export": "MyButton"
    }
  }
}
```

Then regenerate exports:

```bash
pnpm components:generate
```

### Use Cases

- **Feature Flags**: Show different components based on flags
- **A/B Testing**: Test component variations
- **Theme Switching**: Swap themed component sets
- **Progressive Enhancement**: Upgrade components gradually

---

## 📂 Reorganizing Components

### Moving Files

1. **Move the component file:**
   ```bash
   mv src/components/ui/button.tsx src/components/custom/button.tsx
   ```

2. **Update the registry:**
   ```json
   {
     "components": {
       "custom": {
         "Button": {
           "path": "./custom/button",
           "export": "Button"
         }
       }
     }
   }
   ```

3. **Regenerate exports:**
   ```bash
   pnpm components:generate
   ```

4. **No import changes needed!** ✅
   ```typescript
   // Still works exactly the same
   import { Button } from '@/components';
   ```

---

## 🎯 Advanced Usage

### Component Resolution API

```typescript
import {
  resolveComponent,
  getComponentsByCategory,
  getAllComponentNames,
  hasComponent,
  getComponentPath,
  getRegistryStats
} from '@/components';

// Resolve a component
const button = resolveComponent('Button');
// Returns: { name, category, path, exports, metadata }

// Get all UI components
const uiComponents = getComponentsByCategory('ui');

// Check if component exists
if (hasComponent('Button')) {
  // ...
}

// Get component import path
const path = getComponentPath('Button'); // './ui/button'

// Get registry statistics
const stats = getRegistryStats();
// Returns: { version, categories, totalComponents, ... }
```

### Type Safety

Component names are fully typed:

```typescript
import type { ComponentName, UiComponents } from '@/components';

const componentName: ComponentName = 'Button'; // ✅
const componentName: ComponentName = 'Invalid'; // ❌ TypeScript error

const uiComponent: UiComponents = 'Button'; // ✅
const uiComponent: UiComponents = 'MiniCart'; // ❌ Not in ui category
```

### Deprecation Warnings

Mark components as deprecated in the registry:

```json
{
  "components": {
    "ui": {
      "OldButton": {
        "path": "./ui/old-button",
        "export": "OldButton",
        "deprecated": true,
        "replacement": "Button"
      }
    }
  }
}
```

The generated exports will include `@deprecated` JSDoc comments:

```typescript
/** @deprecated Use Button instead */
export { OldButton } from './ui/old-button';
```

---

## 🔍 Troubleshooting

### Issue: Import not working after moving component

**Solution:** Make sure you:
1. Updated `component-registry.json` with new path
2. Ran `pnpm components:generate`
3. Restarted TypeScript server in your IDE (Cmd+Shift+P → "Restart TS Server")

### Issue: TypeScript can't find module

**Solution:**
1. Check `tsconfig.json` has the path alias configured
2. Ensure the barrel export file exists
3. Restart TypeScript server

### Issue: Build fails with "Cannot find module"

**Solution:**
1. Run `pnpm components:generate` before build (should be automatic via `prebuild`)
2. Ensure all paths in registry are correct
3. Check that files exist at specified paths

---

## 📝 Best Practices

### 1. Always Use Barrel Exports

```typescript
// ✅ Good - Uses barrel export
import { Button, Card } from '@/components';

// ❌ Avoid - Direct file import (unless needed for tree-shaking)
import { Button } from '@/components/ui/button';
```

### 2. Organize by Feature/Domain

```
components/
├── ui/           # Generic UI components
├── dealer/       # Dealer-specific components
├── admin/        # Admin-specific components
└── forms/        # Form-related components
```

### 3. Keep Registry Updated

Always update the registry when:
- Adding new components
- Moving component files
- Renaming components
- Removing components

### 4. Run Generation Before Committing

```bash
pnpm components:generate
git add .
git commit -m "feat: add new component"
```

### 5. Use Meaningful Categories

Category names should reflect:
- Feature domain (dealer, admin)
- Component type (ui, forms, layouts)
- Architectural layer (primitives, composed)

---

## 🎨 Examples

### Example 1: Adding a New Component

1. Create the component file:
   ```tsx
   // src/components/ui/badge.tsx
   export function Badge({ children }) {
     return <span className="badge">{children}</span>;
   }
   ```

2. Add to registry:
   ```json
   {
     "components": {
       "ui": {
         "Badge": {
           "path": "./ui/badge",
           "export": "Badge",
           "category": "ui",
           "description": "Badge component"
         }
       }
     }
   }
   ```

3. Regenerate exports:
   ```bash
   pnpm components:generate
   ```

4. Use it:
   ```tsx
   import { Badge } from '@/components';

   function App() {
     return <Badge>New</Badge>;
   }
   ```

### Example 2: Swapping Component Implementation

```typescript
// feature-flags.ts
import { overrideComponent } from '@/components';

if (process.env.NEXT_PUBLIC_USE_NEW_BUTTON === 'true') {
  overrideComponent('Button', './experimental/NewButton', 'NewButton');
}

// Now all imports of Button will use NewButton
// No code changes needed in consuming components!
```

### Example 3: Creating a Component Category

1. Create new directory:
   ```bash
   mkdir src/components/forms
   ```

2. Add components to registry:
   ```json
   {
     "components": {
       "forms": {
         "LoginForm": {
           "path": "./forms/LoginForm",
           "export": "LoginForm"
         },
         "SignupForm": {
           "path": "./forms/SignupForm",
           "export": "SignupForm"
         }
       }
     }
   }
   ```

3. Add path alias to `tsconfig.json`:
   ```json
   {
     "paths": {
       "@/forms": ["./src/components/forms/index.ts"],
       "@/forms/*": ["./src/components/forms/*"]
     }
   }
   ```

4. Regenerate:
   ```bash
   pnpm components:generate
   ```

5. Use it:
   ```tsx
   import { LoginForm, SignupForm } from '@/forms';
   ```

---

## 🔗 Related Documentation

- [TypeScript Module Resolution](https://www.typescriptlang.org/docs/handbook/module-resolution.html)
- [Next.js Path Aliases](https://nextjs.org/docs/advanced-features/module-path-aliases)
- [Barrel Exports Best Practices](https://basarat.gitbook.io/typescript/main-1/barrel)

---

## 📄 License

Part of the B2B-First monorepo project.
