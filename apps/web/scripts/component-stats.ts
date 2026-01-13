#!/usr/bin/env tsx
/**
 * Component Registry Statistics
 * Display information about registered components
 *
 * Usage:
 *   pnpm components:stats
 *   tsx scripts/component-stats.ts
 */

import * as fs from 'fs';
import * as path from 'path';

interface ComponentRegistryEntry {
  path: string;
  export: string | string[];
  category?: string;
  description?: string;
  aliases?: string[];
  deprecated?: boolean;
  replacement?: string;
}

interface ComponentCategory {
  [componentName: string]: ComponentRegistryEntry;
}

interface ComponentRegistry {
  $schema?: string;
  version: string;
  components: {
    [category: string]: ComponentCategory;
  };
  aliases?: {
    [alias: string]: string;
  };
  overrides?: {
    [componentName: string]: {
      path: string;
      export: string | string[];
    };
  };
}

const REGISTRY_PATH = path.join(process.cwd(), 'src/components/component-registry.json');

/**
 * Load the component registry
 */
function loadRegistry(): ComponentRegistry {
  try {
    const content = fs.readFileSync(REGISTRY_PATH, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error('❌ Failed to load component registry:', error);
    process.exit(1);
  }
}

/**
 * Display component statistics
 */
function displayStats() {
  console.log('📊 Component Registry Statistics\n');

  const registry = loadRegistry();

  console.log(`Version: ${registry.version}\n`);

  // Category breakdown
  console.log('📁 Categories:');
  const categories = Object.keys(registry.components);
  categories.forEach((category) => {
    const count = Object.keys(registry.components[category]).length;
    console.log(`   ${category.padEnd(15)} ${count} components`);
  });

  const totalComponents = Object.values(registry.components).reduce(
    (sum, cat) => sum + Object.keys(cat).length,
    0
  );
  console.log(`   ${'Total'.padEnd(15)} ${totalComponents} components\n`);

  // Aliases
  if (registry.aliases && Object.keys(registry.aliases).length > 0) {
    console.log('🔗 Aliases:');
    Object.entries(registry.aliases).forEach(([alias, target]) => {
      console.log(`   ${alias} → ${target}`);
    });
    console.log('');
  }

  // Deprecated components
  const deprecated: { category: string; name: string; replacement?: string }[] = [];
  for (const [category, components] of Object.entries(registry.components)) {
    for (const [name, entry] of Object.entries(components)) {
      if (entry.deprecated) {
        deprecated.push({ category, name, replacement: entry.replacement });
      }
    }
  }

  if (deprecated.length > 0) {
    console.log('⚠️  Deprecated Components:');
    deprecated.forEach(({ category, name, replacement }) => {
      const msg = replacement ? ` (use ${replacement})` : '';
      console.log(`   ${category}/${name}${msg}`);
    });
    console.log('');
  }

  // Overrides
  if (registry.overrides && Object.keys(registry.overrides).length > 0) {
    console.log('🔄 Active Overrides:');
    Object.entries(registry.overrides).forEach(([name, override]) => {
      console.log(`   ${name} → ${override.path}`);
    });
    console.log('');
  }

  // List all components
  console.log('📦 All Components:\n');
  for (const [category, components] of Object.entries(registry.components)) {
    console.log(`${category}:`);
    const sortedComponents = Object.entries(components).sort(([a], [b]) => a.localeCompare(b));
    sortedComponents.forEach(([name, entry]) => {
      const exports = Array.isArray(entry.export) ? entry.export : [entry.export];
      const exportStr = exports.length > 3 ? `${exports.slice(0, 3).join(', ')}... (${exports.length})` : exports.join(', ');
      console.log(`  - ${name.padEnd(20)} ${exportStr}`);
    });
    console.log('');
  }

  // Usage examples
  console.log('💡 Usage Examples:\n');
  console.log('   // Import from main barrel export');
  console.log('   import { Button, Card, Input } from "@/components";\n');
  console.log('   // Import from category');
  console.log('   import { Button } from "@/ui";\n');
  console.log('   // Import from specific file');
  console.log('   import { Button } from "@/components/ui/button";\n');
}

// Run if called directly
if (require.main === module) {
  displayStats();
}

export { displayStats };
