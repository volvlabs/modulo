import { useModuleRegistry } from './registry';
import type { RegisteredModule } from '../types/module';

/**
 * Hook to get navigation items from all enabled modules.
 * Each module can provide its own navigation items through the getNavigation() method.
 * Only enabled modules' navigation items are included.
 * 
 * @returns Array of NavigationItem objects containing path, label, icon, and permissions
 * @example
 * ```tsx
 * function Sidebar() {
 *   const navItems = useModuleNavigation();
 *   return (
 *     <nav>
 *       {navItems.map(item => (
 *         <NavLink key={item.path} to={item.path}>{item.label}</NavLink>
 *       ))}
 *     </nav>
 *   );
 * }
 * ```
 */
export function useModuleNavigation() {
  const modules = useModuleRegistry((state) => state.modules);
  
  return Object.values(modules)
    .filter((registered: RegisteredModule) => registered.isEnabled)
    .flatMap((registered: RegisteredModule) => {
      try {
        return registered.module.getNavigation?.() || [];
      } catch (error) {
        console.error(`Error getting navigation for module: ${registered.module.moduleId}`, error);
        return [];
      }
    });
}

/**
 * Hook to get route definitions from all enabled modules.
 * Each module can provide its own routes through the getRoutes() method.
 * Only enabled modules' routes are included.
 * 
 * @returns Array of RouteDefinition objects containing path, component, label, and permissions
 * @example
 * ```tsx
 * function AppRoutes() {
 *   const routes = useModuleRoutes();
 *   return (
 *     <Routes>
 *       {routes.map(route => (
 *         <Route key={route.path} path={route.path} element={<route.component />} />
 *       ))}
 *     </Routes>
 *   );
 * }
 * ```
 */
export function useModuleRoutes() {
  const modules = useModuleRegistry((state) => state.modules);
  
  return Object.values(modules)
    .filter((registered: RegisteredModule) => registered.isEnabled)
    .flatMap((registered: RegisteredModule) => {
      try {
        return registered.module.getRoutes?.() || [];
      } catch (error) {
        console.error(`Error getting routes for module: ${registered.module.moduleId}`, error);
        return [];
      }
    });
}

/**
 * Hook to get permissions from all enabled modules.
 * Each module can provide its own permissions through the getPermissions() method.
 * Only enabled modules' permissions are included.
 * 
 * @returns Array of Permission objects containing resource, action, and description
 * @example
 * ```tsx
 * function PermissionsList() {
 *   const permissions = useModulePermissions();
 *   return (
 *     <ul>
 *       {permissions.map(perm => (
 *         <li key={`${perm.resource}:${perm.action}`}>
 *           {perm.description}
 *         </li>
 *       ))}
 *     </ul>
 *   );
 * }
 * ```
 */
export function useModulePermissions() {
  const modules = useModuleRegistry((state) => state.modules);
  
  return Object.values(modules)
    .filter((registered: RegisteredModule) => registered.isEnabled)
    .flatMap((registered: RegisteredModule) => {
      try {
        return registered.module.getPermissions?.() || [];
      } catch (error) {
        console.error(`Error getting permissions for module: ${registered.module.moduleId}`, error);
        return [];
      }
    });
}

/**
 * Hook to get a specific module by its ID.
 * Returns the registered module if it exists, or undefined if not found.
 * 
 * @param moduleId - ID of the module to retrieve
 * @returns The registered module or undefined
 * @example
 * ```tsx
 * function ModuleInfo({ moduleId }: { moduleId: string }) {
 *   const module = useModule(moduleId);
 *   if (!module) return null;
 *   
 *   return (
 *     <div>
 *       <h2>{module.module.name}</h2>
 *       <p>{module.module.description}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useModule(moduleId: string) {
  return useModuleRegistry((state) => state.modules[moduleId]);
}

/**
 * Hook to get the current status of a specific module.
 * Status includes the current state (registered, initializing, initialized, error, etc.)
 * and any error information if present.
 * 
 * @param moduleId - ID of the module to get status for
 * @returns The module's status information or null if not found
 * @example
 * ```tsx
 * function ModuleStatus({ moduleId }: { moduleId: string }) {
 *   const status = useModuleStatus(moduleId);
 *   if (!status) return null;
 *   
 *   return (
 *     <div>
 *       <p>Status: {status.status}</p>
 *       {status.error && (
 *         <p>Error: {status.error.message}</p>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
export function useModuleStatus(moduleId: string) {
  return useModuleRegistry((state) => state.status[moduleId] || null);
}
