# @volvlabs/modulo

Core functionality for building modular, extensible applications.

## Installation

```bash
npm install @volvlabs/modulo
```

## Quick Start

```typescript
import { createModulo } from '@volvlabs/modulo';

const { ModuloRoot } = createModulo({
  api: {
    baseUrl: import.meta.env.VITE_API_URL
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
```

## Creating Custom Modules

Create a class that implements the `Module` interface:

```typescript
import type { Module } from '@volvlabs/modulo';

export class CustomModule implements Module {
  moduleId = 'custom-module';
  name = 'Custom Module';
  version = '1.0.0';
  description = 'Custom module description';

  // Lifecycle methods
  async initialize() {
    // Module initialization logic
  }

  async cleanup() {
    // Module cleanup logic
  }

  // Content methods
  getRoutes() {
    return [
      {
        path: 'custom',
        component: CustomPage,
        label: 'Custom Page',
        permissions: ['custom:read'],
      },
    ];
  }

  getNavigation() {
    return [
      {
        label: 'Custom',
        path: 'custom',
        permissions: ['custom:read'],
      },
    ];
  }

  getPermissions() {
    return [
      {
        resource: 'custom',
        action: 'read',
        description: 'Read custom module data',
      },
    ];
  }
}
```

## Available Hooks

- `useModule(moduleId)`: Get a specific module's instance
- `useModuleNavigation()`: Get navigation items from all enabled modules
- `useModuleRoutes()`: Get routes from all enabled modules
- `useModulePermissions()`: Get permissions from all enabled modules
- `useModuleStatus(moduleId)`: Get a module's current status

## Module Registry

The module registry manages the lifecycle and state of all modules:

```typescript
import { useModuleRegistry } from '@nebularcore/dashboard';

// In your component
const registerModule = useModuleRegistry((state) => state.registerModule);
const unregisterModule = useModuleRegistry((state) => state.unregisterModule);
const enableModule = useModuleRegistry((state) => state.enableModule);
const disableModule = useModuleRegistry((state) => state.disableModule);
```

## Inter-Module Communication

Modules can communicate with each other using the event system:

```typescript
import { 
  useModuleEventPublisher,
  useModuleEventSubscription,
  useModuleEvents,
  useModuleEventsByType
} from '@nebularcore/dashboard';

// Publishing events
function PublisherComponent() {
  const publish = useModuleEventPublisher('module-a');
  
  const handleClick = () => {
    publish('data-updated', { value: 42 });
  };
  
  return <button onClick={handleClick}>Update Data</button>;
}

// Subscribing to events
function SubscriberComponent() {
  const [value, setValue] = useState<number>();
  
  useModuleEventSubscription('module-b', 'data-updated', (event) => {
    setValue(event.payload.value);
  });
  
  return <div>Value from Module A: {value}</div>;
}

// Getting all events for a module
const moduleEvents = useModuleEvents('module-a');

// Getting all events of a specific type
const dataUpdateEvents = useModuleEventsByType('data-updated');
```

## Module State Management

Each module can have its own state container:

```typescript
import { useModuleState, useModuleConfig } from '@volvlabs/modulo';

// In your module implementation
export class CustomModule implements Module {
  // ...
  
  getInitialState() {
    return {
      count: 0,
      items: [],
    };
  }
  
  getConfig() {
    return {
      apiEndpoint: '/api/custom',
      refreshInterval: 5000,
    };
  }
}

// In your components
function CustomComponent() {
  const state = useModuleState('custom-module');
  const config = useModuleConfig('custom-module');
  
  return (
    <div>
      <p>Count: {state.count}</p>
      <p>API Endpoint: {config.apiEndpoint}</p>
    </div>
  );
}
```

## Configuration

The modulo can be configured with various options:

```typescript
const { Modulo } = createModulo({
  // Required: List of modules to load
  modules: [RBACModule, CustomModule],
  
  // Optional: Authentication configuration
  auth: {
    baseUrl: '/api/auth',
    tokenStorage: 'localStorage',
    refreshTokenPath: '/refresh',
  },
  
  // Optional: API configuration
  api: {
    baseUrl: '/api',
    headers: {
      'X-Custom-Header': 'value',
    },
  },
  
  // Optional: Theme configuration
  theme: {
    primary: '#007AFF',
    secondary: '#5856D6',
  },
  
  // Optional: Event handlers
  onError: (error) => {
    console.error('Dashboard error:', error);
  },
  onInitialized: () => {
    console.log('Dashboard initialized');
  },
});
```

## License

MIT
