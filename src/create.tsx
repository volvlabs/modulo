import React from 'react';
import type { ModuloConfig } from './types/module';
import { ModuleInitializer } from './core/initializer';

interface CreateModuloOptions extends ModuloConfig {
  onError?: (error: Error) => void;
  onInitialized?: () => void;
}

export function createModulo({
  modules = [],
  onError,
  onInitialized
}: CreateModuloOptions) {
  function Modulo({ children }: { children: React.ReactNode }) {
    return (
      <ModuleInitializer
        modules={modules}
        onError={onError}
        onInitialized={onInitialized}
      >
        {children}
      </ModuleInitializer>
    );
  }

  return {
    Modulo
  };
}
