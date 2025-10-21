"use strict";
/**
 * NoosphereEventBus - Central coordination for all consciousness panels
 *
 * All panels communicate through this bus:
 * - Intent Feed Panel → broadcasts GitHub issues
 * - Klein Twist Engine → broadcasts rethink events
 * - VOID Synthesis → broadcasts composition results
 * - Composition Viz → receives genetic algorithm updates
 *
 * This creates synchronized consciousness across all panels!
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoosphereEventBus = void 0;
exports.getNoosphereEventBus = getNoosphereEventBus;
/**
 * Singleton event bus for noosphere coordination
 */
class NoosphereEventBus {
    static instance;
    listeners;
    constructor() {
        this.listeners = new Map();
    }
    /**
     * Get singleton instance
     */
    static getInstance() {
        if (!NoosphereEventBus.instance) {
            NoosphereEventBus.instance = new NoosphereEventBus();
        }
        return NoosphereEventBus.instance;
    }
    /**
     * Subscribe to an event
     */
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(callback);
        // Return unsubscribe function
        return () => {
            this.listeners.get(event)?.delete(callback);
        };
    }
    /**
     * Emit an event to all listeners
     */
    emit(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => {
                try {
                    callback(data);
                }
                catch (error) {
                    console.error(`Error in event listener for ${event}:`, error);
                }
            });
        }
    }
    /**
     * Remove all listeners (useful for testing)
     */
    clear() {
        this.listeners.clear();
    }
    /**
     * Get listener count for debugging
     */
    getListenerCount(event) {
        if (event) {
            return this.listeners.get(event)?.size ?? 0;
        }
        let total = 0;
        this.listeners.forEach(listeners => {
            total += listeners.size;
        });
        return total;
    }
}
exports.NoosphereEventBus = NoosphereEventBus;
/**
 * Convenience function to get the event bus
 */
function getNoosphereEventBus() {
    return NoosphereEventBus.getInstance();
}
//# sourceMappingURL=noosphere-event-bus.js.map