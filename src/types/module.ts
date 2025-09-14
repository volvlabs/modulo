import React, { RefAttributes, type ComponentType } from 'react';

type AnyIcon = ComponentType<React.ReactNode | SVGElement | RefAttributes<SVGSVGElement>>;

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

export interface Module {
  moduleId: string;
  name: string;
  version: string;
  description: string;
  dependencies?: ModuleDependency[];
  
  initialize?: () => Promise<void> | void;
  cleanup?: () => Promise<void> | void;
  
  getRoutes: () => RouteDefinition[];
  getNavigation: () => NavigationItem[];
  getPermissions: () => Permission[];
  
  getInitialState?: () => Record<string, unknown>;
  getConfig?: () => Record<string, unknown>;
}

export interface RegisteredModule {
  module: Module;
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
  | 'registered'
  | 'initializing' 
  | 'initialized'  
  | 'error'        
  | 'disabled'     
  | 'dependency_error';

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
  version: string;
  optional?: boolean;
}

export interface ModuleEvent {
  type: string;
  moduleId: string;
  payload?: unknown;
  timestamp: number;
}

export interface ModuloConfig {
  modules: Module[];
  onModuleError?: (moduleId: string, error: Error) => void;
  onModuleInitialized?: (moduleId: string) => void;
}
