import React, { RefAttributes, type ComponentType } from 'react';
import { IconType } from 'react-icons';

// Type for any valid React component that can be used as an icon
type AnyIcon = ComponentType<IconType | SVGElement | RefAttributes<SVGSVGElement> | JSX.Element>;

export interface RouteDefinition {
  path: string;
  component: React.ComponentType;
  label: string;
  icon?: AnyIcon;
  permissions?: string[];
  layout?: 'default' | 'blank';
}

export interface NavigationItem {
  label: string;
  path: string;
  icon?: AnyIcon;
  permissions?: string[];
  children?: NavigationItem[];
}

export interface Permission {
  resource: string;
  action: string;
  description: string;
}

export interface DashboardModule {
  moduleId: string;
  name: string;
  version: string; // Semver format
  description: string;
  dependencies?: ModuleDependency[];
  
  // Module lifecycle methods
  initialize?: () => Promise<void> | void;
  cleanup?: () => Promise<void> | void;
  
  // Module content methods
  getRoutes: () => RouteDefinition[];
  getNavigation: () => NavigationItem[];
  getPermissions: () => Permission[];
  
  // Module state and config
  getInitialState?: () => Record<string, unknown>;
  getConfig?: () => Record<string, unknown>;
}

export interface RegisteredModule {
  module: DashboardModule;
  isEnabled: boolean;
}

export interface ModuleRegistryState {
  modules: Record<string, RegisteredModule>;
  status: Record<string, ModuleStatusInfo>;
  state: Record<string, Record<string, unknown>>;
  config: Record<string, Record<string, unknown>>;
}

export interface ModuleError {
  message: string;
  stack?: string;
  code?: string;
}

export type ModuleStatus = 
  | 'registered'    // Initial state when module is registered
  | 'initializing'  // Module is currently running initialize()
  | 'initialized'   // Module has completed initialization
  | 'error'         // Module encountered an error
  | 'disabled'      // Module is manually disabled
  | 'dependency_error'; // Module has unmet dependencies

export interface ModuleStatusInfo {
  status: ModuleStatus;
  error?: ModuleError;
  lastUpdated: number;
}

export interface ModuleVersion {
  major: number;
  minor: number;
  patch: number;
}

export interface ModuleDependency {
  moduleId: string;
  version: string; // Semver range
  optional?: boolean;
}

export interface ModuleEvent {
  type: string;
  moduleId: string;
  payload?: unknown;
  timestamp: number;
}

export interface DashboardConfig {
  modules: DashboardModule[];
  onModuleError?: (moduleId: string, error: Error) => void;
  onModuleInitialized?: (moduleId: string) => void;
}
