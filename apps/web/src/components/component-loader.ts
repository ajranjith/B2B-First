/**
 * Component Loader Utility
 * Runtime component resolution and loading from registry
 */

import type { ComponentRegistry, ResolvedComponent } from './registry-types';
import registryData from './component-registry.json';

const registry: ComponentRegistry = registryData as ComponentRegistry;

/**
 * Component cache to avoid repeated lookups
 */
const componentCache = new Map<string, ResolvedComponent>();

/**
 * Resolve a component name to its path and metadata
 * Handles aliases and overrides
 */
export function resolveComponent(componentName: string): ResolvedComponent | null {
  // Check cache first
  if (componentCache.has(componentName)) {
    return componentCache.get(componentName)!;
  }

  // Check if it's an alias
  const actualName = registry.aliases?.[componentName] || componentName;

  // Check for overrides first
  if (registry.overrides?.[actualName]) {
    const override = registry.overrides[actualName];
    const resolved: ResolvedComponent = {
      name: actualName,
      category: 'override',
      path: override.path,
      exports: Array.isArray(override.export) ? override.export : [override.export],
      metadata: {
        path: override.path,
        export: override.export,
        description: `Override for ${actualName}`,
      },
    };
    componentCache.set(componentName, resolved);
    return resolved;
  }

  // Search through categories
  for (const [category, components] of Object.entries(registry.components)) {
    if (components[actualName]) {
      const entry = components[actualName];
      const resolved: ResolvedComponent = {
        name: actualName,
        category,
        path: entry.path,
        exports: Array.isArray(entry.export) ? entry.export : [entry.export],
        metadata: entry,
      };
      componentCache.set(componentName, resolved);
      return resolved;
    }
  }

  return null;
}

/**
 * Get all components in a category
 */
export function getComponentsByCategory(category: string): ResolvedComponent[] {
  const components = registry.components[category];
  if (!components) return [];

  return Object.entries(components).map(([name, entry]) => ({
    name,
    category,
    path: entry.path,
    exports: Array.isArray(entry.export) ? entry.export : [entry.export],
    metadata: entry,
  }));
}

/**
 * Get all available component names
 */
export function getAllComponentNames(): string[] {
  const names: string[] = [];
  for (const components of Object.values(registry.components)) {
    names.push(...Object.keys(components));
  }
  return names;
}

/**
 * Get all categories
 */
export function getAllCategories(): string[] {
  return Object.keys(registry.components);
}

/**
 * Check if a component exists
 */
export function hasComponent(componentName: string): boolean {
  return resolveComponent(componentName) !== null;
}

/**
 * Get component path for import
 */
export function getComponentPath(componentName: string): string | null {
  const resolved = resolveComponent(componentName);
  return resolved ? resolved.path : null;
}

/**
 * Override a component implementation at runtime
 * Useful for feature flags, A/B testing, or hot-swapping
 */
export function overrideComponent(
  componentName: string,
  newPath: string,
  exportNames: string | string[]
): void {
  if (!registry.overrides) {
    registry.overrides = {};
  }

  registry.overrides[componentName] = {
    path: newPath,
    export: exportNames,
  };

  // Clear cache for this component
  componentCache.delete(componentName);
}

/**
 * Clear a component override
 */
export function clearOverride(componentName: string): void {
  if (registry.overrides) {
    delete registry.overrides[componentName];
  }
  componentCache.delete(componentName);
}

/**
 * Clear all overrides
 */
export function clearAllOverrides(): void {
  if (registry.overrides) {
    registry.overrides = {};
  }
  componentCache.clear();
}

/**
 * Get registry statistics
 */
export function getRegistryStats() {
  const categories = Object.keys(registry.components);
  const totalComponents = Object.values(registry.components).reduce(
    (sum, cat) => sum + Object.keys(cat).length,
    0
  );
  const aliases = Object.keys(registry.aliases || {}).length;
  const overrides = Object.keys(registry.overrides || {}).length;

  return {
    version: registry.version,
    categories: categories.length,
    totalComponents,
    aliases,
    overrides,
    categoryBreakdown: categories.map((cat) => ({
      name: cat,
      count: Object.keys(registry.components[cat]).length,
    })),
  };
}

/**
 * Export the raw registry for advanced use cases
 */
export { registry };
