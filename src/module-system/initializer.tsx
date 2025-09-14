import React, { useEffect, useState } from 'react';
import type { DashboardModule } from '../types/module';
import { useModuleRegistry } from './registry';

interface ModuleInitializerProps {
  modules: DashboardModule[];
  children: React.ReactNode;
  onError?: (error: Error) => void;
  onInitialized?: () => void;
}

export function ModuleInitializer({ 
  modules, 
  children, 
  onError,
  onInitialized 
}: ModuleInitializerProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const registerModule = useModuleRegistry((state) => state.registerModule);

  useEffect(() => {
    const init = async () => {
      try {
        // Initialize modules sequentially to respect dependencies
        for (const module of modules) {
          await registerModule(module);
        }
        setIsInitialized(true);
        onInitialized?.();
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to initialize modules');
        setError(error);
        onError?.(error);
      }
    };

    init();
  }, [modules, registerModule, onError, onInitialized]);

  if (error) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Error</h1>
          <p className="mt-2 text-gray-600">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold">Loading modules...</h1>
        </div>
      </div>
    );
  }

  return children;
}
