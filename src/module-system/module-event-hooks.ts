import { useEffect } from 'react';
import { useModule } from './hooks';
import { useModuleEvents as useModuleEventStore } from './module-events';
import type { ModuleEvent } from '../types/module';

/**
 * Hook to subscribe to module events
 * @param moduleId - ID of the module subscribing to events
 * @param eventType - Type of event to subscribe to
 * @param callback - Callback function to handle the event
 */
export function useModuleEventSubscription(
  moduleId: string,
  eventType: string,
  callback: (event: ModuleEvent) => void
) {
  const subscribe = useModuleEventStore((state) => state.subscribe);

  useEffect(() => {
    return subscribe(moduleId, eventType, callback);
  }, [moduleId, eventType, callback, subscribe]);
}

/**
 * Hook to publish module events
 * @param moduleId - ID of the module publishing events
 * @returns Function to publish events
 */
export function useModuleEventPublisher(moduleId: string): (eventType: string, payload?: unknown) => void {
  const publish = useModuleEventStore((state) => state.publish);
  const module = useModule(moduleId);


  return (eventType: string, payload?: unknown) => {
    if (!module) {
      console.error(`Cannot publish event: module ${moduleId} not found`);
      return;
    }

    publish({
      type: eventType,
      moduleId,
      payload
    });
  };
}

/**
 * Hook to get all events for a specific module
 * @param moduleId - ID of the module to get events for
 * @returns Array of events for the module
 */
export function useModuleEvents(moduleId: string): ModuleEvent[] {
  return useModuleEventStore((state) => 
    state.events.filter((event) => event.moduleId === moduleId)
  );
}

/**
 * Hook to get events of a specific type
 * @param eventType - Type of events to get
 * @returns Array of events of the specified type
 */
export function useModuleEventsByType(eventType: string): ModuleEvent[] {
  return useModuleEventStore((state) => 
    state.events.filter((event) => event.type === eventType)
  );
}
