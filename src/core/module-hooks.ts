import { useModuleRegistry } from './registry';

export function useModuleConfig(moduleId: string) {
  return useModuleRegistry((state) => state.getModuleConfig(moduleId));
}

export function useModuleState(moduleId: string) {
  const state = useModuleRegistry((state) => state.getModuleState(moduleId));
  const setState = useModuleRegistry((state) => state.setModuleState);

  return [state, (newState: Record<string, unknown>) => setState(moduleId, newState)] as const;
}

export function useModuleError(moduleId: string) {
  return useModuleRegistry((state) => state.status[moduleId]?.error);
}

export function useModuleStatusInfo(moduleId: string) {
  return useModuleRegistry((state) => state.status[moduleId]);
}

export function useModuleDependencies(moduleId: string) {
  return useModuleRegistry((state) => state.modules[moduleId]?.module.dependencies || []);
}
