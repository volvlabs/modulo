import { create, StateCreator } from 'zustand';
import { persist, PersistOptions } from 'zustand/middleware';
import { StoreApi } from 'zustand/vanilla';
import type {
  DashboardModule,
  RegisteredModule,
  ModuleRegistryState,
  ModuleStatus,
  ModuleStatusInfo,
  ModuleError
} from '../types/module';
import { checkDependencyCompatibility } from './version';

// Keep track of registered modules
const registeredModules = new Map<string, DashboardModule>();

// Get a registered module instance
export function getRegisteredModule(moduleId: string) {
  return registeredModules.get(moduleId);
}

type ModuleRegistryStore = ModuleRegistryState & {
  registerModule: (module: DashboardModule) => Promise<void>;
  unregisterModule: (moduleId: string) => Promise<void>;
  enableModule: (moduleId: string) => void;
  disableModule: (moduleId: string) => void;
  getModule: (moduleId: string) => RegisteredModule | undefined;
  getModuleStatus: (moduleId: string) => ModuleStatus;
  getModuleState: (moduleId: string) => Record<string, unknown>;
  getModuleConfig: (moduleId: string) => Record<string, unknown>;
  setModuleState: (moduleId: string, state: Record<string, unknown>) => void;
  setModuleConfig: (moduleId: string, config: Record<string, unknown>) => void;
};

type ModuleRegistryPersist = (
  config: StateCreator<ModuleRegistryStore>,
  options: PersistOptions<ModuleRegistryStore>
) => StateCreator<ModuleRegistryStore>;

export const useModuleRegistry = create(
  (persist as ModuleRegistryPersist)(
    (set: StoreApi<ModuleRegistryStore>['setState'],
      get: StoreApi<ModuleRegistryStore>['getState']) => ({
        modules: {} as Record<string, RegisteredModule>,
        status: {} as Record<string, ModuleStatusInfo>,
        state: {} as Record<string, Record<string, unknown>>,
        config: {} as Record<string, Record<string, unknown>>,

        registerModule: async (module: DashboardModule) => {
          try {
            // Check dependencies first
            if (module.dependencies) {
              const deps = module.dependencies.reduce((acc: Record<string, string>, dep: { moduleId: string; version: string; optional?: boolean }) => {
                const targetModule = get().modules[dep.moduleId];
                if (!targetModule) {
                  if (!dep.optional) {
                    throw new Error(`Required dependency ${dep.moduleId} not found`);
                  }
                  return acc;
                }
                return { ...acc, [dep.moduleId]: dep.version };
              }, {} as Record<string, string>);

              const incompatibleDeps = checkDependencyCompatibility(
                module.moduleId,
                module.version,
                deps
              );

              if (incompatibleDeps.length > 0) {
                const error: ModuleError = {
                  message: `Incompatible dependencies: ${incompatibleDeps.join(', ')}`,
                  code: 'DEPENDENCY_ERROR'
                };
                set((state: ModuleRegistryState) => ({
                  ...state,
                  status: {
                    ...state.status,
                    [module.moduleId]: {
                      status: 'dependency_error',
                      error,
                      lastUpdated: Date.now()
                    }
                  }
                }));
                throw new Error(error.message);
              }
            }

            // Set initializing status
            set((state: ModuleRegistryState) => ({
              ...state,
              status: {
                ...state.status,
                [module.moduleId]: {
                  status: 'initializing',
                  lastUpdated: Date.now()
                }
              }
            }));

            // Initialize module
            if (module.initialize) {
              await module.initialize();
            }

            // Set up initial state and config
            const initialState = module.getInitialState?.() || {};
            const initialConfig = module.getConfig?.() || {};

            // Store module in registry
            registeredModules.set(module.moduleId, module);

            // Update module status, state, and add to modules with isEnabled: true
            set((state: ModuleRegistryState) => ({
              ...state,
              modules: {
                ...state.modules,
                [module.moduleId]: {
                  module,
                  isEnabled: true
                }
              },
              status: {
                ...state.status,
                [module.moduleId]: {
                  status: 'initialized',
                  lastUpdated: Date.now()
                }
              },
              state: {
                ...state.state,
                [module.moduleId]: initialState
              },
              config: {
                ...state.config,
                [module.moduleId]: initialConfig
              }
            }));
          } catch (error) {
            const moduleError: ModuleError = {
              message: error instanceof Error ? error.message : 'Unknown error',
              stack: error instanceof Error ? error.stack : undefined,
              code: 'INITIALIZATION_ERROR'
            };

            set((state: ModuleRegistryState) => ({
              ...state,
              status: {
                ...state.status,
                [module.moduleId]: {
                  status: 'error',
                  error: moduleError,
                  lastUpdated: Date.now()
                },
              },
            }));
            throw error;
          }
        },

        unregisterModule: async (moduleId: string) => {

          const module = getRegisteredModule(moduleId);
          if (module?.cleanup) {
            await module.cleanup();
          }

          set((state: ModuleRegistryState) => {
            const { [moduleId]: ignored, ...remainingModules } = state.modules;
            const { [moduleId]: ignored1, ...remainingStatus } = state.status;
            const { [moduleId]: ignored2, ...remainingState } = state.state;
            const { [moduleId]: ignored3, ...remainingConfig } = state.config;
            void [ignored, ignored1, ignored2, ignored3];
            return {
              ...state,
              modules: remainingModules,
              status: remainingStatus,
              state: remainingState,
              config: remainingConfig
            };
          });
        },

        enableModule: (moduleId: string) => {
          set((state: ModuleRegistryState) => ({
            ...state,
            modules: {
              ...state.modules,
              [moduleId]: {
                ...state.modules[moduleId],
                isEnabled: true,
              },
            },
            status: {
              ...state.status,
              [moduleId]: {
                status: 'registered',
                lastUpdated: Date.now()
              },
            },
          }));
        },

        disableModule: (moduleId: string) => {
          set((state: ModuleRegistryState) => ({
            ...state,
            modules: {
              ...state.modules,
              [moduleId]: {
                ...state.modules[moduleId],
                isEnabled: false,
              },
            },
            status: {
              ...state.status,
              [moduleId]: {
                status: 'disabled',
                lastUpdated: Date.now()
              },
            },
          }));
        },

        getModule: (moduleId: string) => {
          return get().modules[moduleId];
        },

        getModuleStatus: (moduleId: string) => {
          return get().status[moduleId]?.status || 'registered';
        },

        getModuleState: (moduleId: string) => {
          return get().state[moduleId] || {};
        },

        getModuleConfig: (moduleId: string) => {
          return get().config[moduleId] || {};
        },

        setModuleState: (moduleId: string, state: Record<string, unknown>) => {
          set((current: ModuleRegistryState) => ({
            ...current,
            state: {
              ...current.state,
              [moduleId]: state
            }
          }));
        },

        setModuleConfig: (moduleId: string, config: Record<string, unknown>) => {
          set((current: ModuleRegistryState) => ({
            ...current,
            config: {
              ...current.config,
              [moduleId]: config
            }
          }));
        },
      }),
    {
      name: 'nebular-module-registry',
      version: 1,
    }
  )
);
