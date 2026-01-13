/**
 * Component Registry Type Definitions
 * Provides type-safe access to component metadata and paths
 */

export interface ComponentRegistryEntry {
  /** Relative path to component file from components directory */
  path: string;
  /** Export name(s) from the module */
  export: string | string[];
  /** Component category (e.g., 'ui', 'dealer', 'forms') */
  category?: string;
  /** Component description */
  description?: string;
  /** Alternative names for the component */
  aliases?: string[];
  /** Whether the component is deprecated */
  deprecated?: boolean;
  /** Replacement component if deprecated */
  replacement?: string;
}

export interface ComponentCategory {
  [componentName: string]: ComponentRegistryEntry;
}

export interface ComponentRegistry {
  /** Schema reference */
  $schema?: string;
  /** Registry version */
  version: string;
  /** Component categories and their components */
  components: {
    [category: string]: ComponentCategory;
  };
  /** Component name aliases mapping */
  aliases?: {
    [alias: string]: string;
  };
  /** Component implementation overrides for swapping */
  overrides?: {
    [componentName: string]: {
      path: string;
      export: string | string[];
    };
  };
}

export interface ResolvedComponent {
  /** Original component name */
  name: string;
  /** Component category */
  category: string;
  /** Full path to component */
  path: string;
  /** Export names */
  exports: string[];
  /** Registry entry metadata */
  metadata: ComponentRegistryEntry;
}
