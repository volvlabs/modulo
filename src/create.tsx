import React from 'react';
import type { DashboardConfig } from './types/module';
import { ModuleInitializer } from './module-system/initializer';

interface CreateDashboardOptions extends DashboardConfig {
  onError?: (error: Error) => void;
  onInitialized?: () => void;
}

export function createDashboard({
  modules = [],
  onError,
  onInitialized
}: CreateDashboardOptions) {
  // Create the root component that will bootstrap the dashboard
  function DashboardRoot({ children }: { children: React.ReactNode }) {
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

  // Return the root component
  return {
    DashboardRoot
  };
}

// Example usage in a project:
/*
import { createDashboard } from '@nebularcore/dashboard';
import { CustomModule } from './modules/custom';

const { DashboardRoot } = createDashboard({
  modules: [CustomModule],
  onInitialized: () => {
    console.log('Dashboard initialized');
  }
});

// In your app's entry point:
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DashboardRoot>
      <App />
    </DashboardRoot>
  </React.StrictMode>
);
*/
