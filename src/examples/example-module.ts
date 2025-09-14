import type { Module, NavigationItem, Permission, RouteDefinition } from '../types/module';
import { lazy } from 'react';

/**
 * Example module demonstrating the core module system functionality.
 * This is a minimal implementation showing how to create a module
 * that integrates with the modulo's module system.
 */
export const exampleModule: Module = {
  moduleId: 'example',
  name: 'Example Module',
  version: '1.0.0',
  description: 'A simple example module demonstrating module system integration',

  async initialize() {
    return Promise.resolve();
  },

  async cleanup() {
    return Promise.resolve();
  },

  // Module content methods
  getRoutes(): RouteDefinition[] {
    return [
      {
        path: 'example',
        component: lazy(() => Promise.resolve({
          default: () => null
        })),
        label: 'Example',
      },
    ];
  },

  getNavigation(): NavigationItem[] {
    return [
      {
        label: 'Example',
        path: 'example',
      },
    ];
  },

  getPermissions(): Permission[] {
    return [
      {
        resource: 'example',
        action: 'view',
        description: 'View example module content',
      },
    ];
  }
}
