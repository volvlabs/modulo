import { create } from 'zustand';

import type { ModuleEvent } from '../types/module';

interface ModuleEventStore {
  events: ModuleEvent[];
  listeners: Map<string, Set<(event: ModuleEvent) => void>>;
  publish: (event: Omit<ModuleEvent, 'timestamp'>) => void;
  subscribe: (moduleId: string, eventType: string, callback: (event: ModuleEvent) => void) => () => void;
  unsubscribe: (moduleId: string, eventType: string, callback: (event: ModuleEvent) => void) => void;
}

export const useModuleEvents = create<ModuleEventStore>((set, get) => ({
  events: [],
  listeners: new Map(),

  publish: (event) => {
    const fullEvent: ModuleEvent = {
      ...event,
      timestamp: Date.now()
    };

    // Add event to history
    set((state) => ({
      events: [...state.events, fullEvent]
    }));

    // Get all listeners for this event type
    const listeners = get().listeners.get(event.type);
    if (listeners) {
      // Notify all listeners
      listeners.forEach((callback) => {
        try {
          callback(fullEvent);
        } catch (error) {
          console.error(`Error in module event listener for ${event.type}:`, error);
        }
      });
    }
  },

  subscribe: (_moduleId, eventType, callback) => {
    const { listeners } = get();
    const eventListeners = listeners.get(eventType) || new Set();
    eventListeners.add(callback);
    listeners.set(eventType, eventListeners);
    set({ listeners });

    // Return unsubscribe function
    return () => {
      get().unsubscribe(_moduleId, eventType, callback);
    };
  },

  unsubscribe: (_moduleId, eventType, callback) => {
    const { listeners } = get();
    const eventListeners = listeners.get(eventType);
    if (eventListeners) {
      eventListeners.delete(callback);
      if (eventListeners.size === 0) {
        listeners.delete(eventType);
      } else {
        listeners.set(eventType, eventListeners);
      }
      set({ listeners });
    }
  }
}));
