/**
 * Component Swapping Examples
 * Demonstrates how to dynamically swap component implementations
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components';
import { overrideComponent, clearOverride, resolveComponent } from '@/components';

/**
 * Example 1: Feature Flag Based Component Swapping
 */
export function FeatureFlagExample() {
  useEffect(() => {
    // Check feature flag
    const useExperimentalButton = process.env.NEXT_PUBLIC_EXPERIMENTAL_BUTTON === 'true';

    if (useExperimentalButton) {
      // Override Button component with experimental version
      overrideComponent('Button', './experimental/ExperimentalButton', 'ExperimentalButton');
    }

    return () => {
      // Cleanup on unmount
      clearOverride('Button');
    };
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Feature Flag Example</h2>
      <Button>This button adapts based on feature flags</Button>
    </div>
  );
}

/**
 * Example 2: A/B Testing Component Swapping
 */
export function ABTestingExample() {
  const [variant, setVariant] = useState<'A' | 'B'>('A');

  useEffect(() => {
    // Randomly assign variant
    setVariant(Math.random() > 0.5 ? 'A' : 'B');
  }, []);

  useEffect(() => {
    if (variant === 'B') {
      overrideComponent('Button', './variants/ButtonVariantB', 'ButtonVariantB');
    } else {
      clearOverride('Button');
    }
  }, [variant]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">A/B Testing Example</h2>
      <p className="mb-2">Current Variant: {variant}</p>
      <Button>Test Button</Button>
      <button
        onClick={() => setVariant(variant === 'A' ? 'B' : 'A')}
        className="ml-2 px-4 py-2 bg-gray-200 rounded"
      >
        Switch Variant
      </button>
    </div>
  );
}

/**
 * Example 3: Theme-based Component Swapping
 */
export function ThemeExample() {
  const [theme, setTheme] = useState<'light' | 'dark' | 'colorful'>('light');

  useEffect(() => {
    switch (theme) {
      case 'dark':
        overrideComponent('Button', './themes/DarkButton', 'DarkButton');
        overrideComponent('Card', './themes/DarkCard', 'DarkCard');
        break;
      case 'colorful':
        overrideComponent('Button', './themes/ColorfulButton', 'ColorfulButton');
        overrideComponent('Card', './themes/ColorfulCard', 'ColorfulCard');
        break;
      default:
        clearOverride('Button');
        clearOverride('Card');
    }
  }, [theme]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Theme Swapping Example</h2>
      <div className="flex gap-2 mb-4">
        <button onClick={() => setTheme('light')} className="px-4 py-2 bg-gray-200 rounded">
          Light Theme
        </button>
        <button onClick={() => setTheme('dark')} className="px-4 py-2 bg-gray-800 text-white rounded">
          Dark Theme
        </button>
        <button onClick={() => setTheme('colorful')} className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded">
          Colorful Theme
        </button>
      </div>
      <Button>Themed Button</Button>
    </div>
  );
}

/**
 * Example 4: Runtime Component Inspection
 */
export function ComponentInspectorExample() {
  const [componentName, setComponentName] = useState('Button');
  const [resolvedInfo, setResolvedInfo] = useState<any>(null);

  const inspectComponent = () => {
    const info = resolveComponent(componentName);
    setResolvedInfo(info);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Component Inspector</h2>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={componentName}
          onChange={(e) => setComponentName(e.target.value)}
          className="border px-3 py-2 rounded"
          placeholder="Component name"
        />
        <button
          onClick={inspectComponent}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Inspect
        </button>
      </div>
      {resolvedInfo && (
        <pre className="bg-gray-100 p-4 rounded overflow-auto">
          {JSON.stringify(resolvedInfo, null, 2)}
        </pre>
      )}
    </div>
  );
}

/**
 * Example 5: Progressive Enhancement
 * Load enhanced version after hydration
 */
export function ProgressiveEnhancementExample() {
  const [enhanced, setEnhanced] = useState(false);

  useEffect(() => {
    // After component mounts, load enhanced version
    const timer = setTimeout(() => {
      overrideComponent('Button', './enhanced/EnhancedButton', 'EnhancedButton');
      setEnhanced(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Progressive Enhancement Example</h2>
      <p className="mb-2">Enhanced: {enhanced ? '✅' : '⏳ Loading...'}</p>
      <Button>This button will enhance after 2 seconds</Button>
    </div>
  );
}

/**
 * Main Example Component
 */
export default function ComponentSwappingExamples() {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Component Swapping Examples</h1>

      <div className="space-y-8">
        <div className="border rounded-lg p-6">
          <FeatureFlagExample />
        </div>

        <div className="border rounded-lg p-6">
          <ABTestingExample />
        </div>

        <div className="border rounded-lg p-6">
          <ThemeExample />
        </div>

        <div className="border rounded-lg p-6">
          <ComponentInspectorExample />
        </div>

        <div className="border rounded-lg p-6">
          <ProgressiveEnhancementExample />
        </div>
      </div>
    </div>
  );
}
