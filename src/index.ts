// Export types
export type {
  DashboardModule,
  DashboardConfig,
  NavigationItem,
  Permission,
  RouteDefinition,
  RegisteredModule,
  ModuleStatus,
  ModuleEvent
} from './types/module';

// Export module system
export { ModuleInitializer } from './module-system/initializer';
export { useModuleRegistry } from './module-system/registry';
export {
  useModule,
  useModuleNavigation,
  useModulePermissions,
  useModuleRoutes,
  useModuleStatus
} from './module-system/hooks';

// Export event system
export {
  useModuleEvents,
  useModuleEventSubscription,
  useModuleEventPublisher,
  useModuleEventsByType
} from './module-system/module-event-hooks';

// Export create function for bootstrapping
export { createDashboard } from './create';
