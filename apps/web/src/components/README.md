# Component Alias System

Centralized component registry with flexible imports and dynamic component swapping.

## Quick Usage

```typescript
// Import from main barrel export (RECOMMENDED)
import { Button, Card, Input } from '@/components';

// Import from category
import { Button } from '@/ui';
import { MiniCart } from '@/dealer';

// Import specific file (for tree-shaking)
import { Button } from '@/components/ui/button';
```

## NPM Scripts

```bash
# Generate barrel exports from registry
pnpm components:generate

# View component statistics
pnpm components:stats
```

## Features

✅ **Stable Imports** - Paths never change
✅ **Flexible Organization** - Move files freely
✅ **Component Swapping** - Change implementations dynamically
✅ **Type Safe** - Full TypeScript support
✅ **Auto-generated** - Exports generated from registry

## Adding a Component

1. Create your component file
2. Add entry to `component-registry.json`:
   ```json
   {
     "components": {
       "ui": {
         "MyComponent": {
           "path": "./ui/my-component",
           "export": "MyComponent",
           "description": "My component"
         }
       }
     }
   }
   ```
3. Run `pnpm components:generate`
4. Import: `import { MyComponent } from '@/components';`

## Component Swapping

### Runtime Override
```typescript
import { overrideComponent } from '@/components';

overrideComponent('Button', './custom/MyButton', 'MyButton');
```

### Registry Override
Edit `component-registry.json`:
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

## File Structure

```
src/components/
├── component-registry.json         # Central registry
├── component-loader.ts             # Runtime resolution
├── index.ts                        # Main barrel export
├── ui/
│   ├── index.ts                   # Category barrel
│   └── ...components
└── dealer/
    ├── index.ts
    └── ...components
```

## Documentation

See [COMPONENT_ALIAS_SYSTEM.md](../../docs/COMPONENT_ALIAS_SYSTEM.md) for full documentation.

## Path Aliases

All available aliases:
- `@/components` - All components
- `@/ui` - UI components
- `@/dealer` - Dealer components
- `@/hooks` - Custom hooks
- `@/lib` - Utilities
- `@/context` - Context providers
