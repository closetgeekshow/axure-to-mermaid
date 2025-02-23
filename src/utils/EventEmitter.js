/**
 * The `EventEmitter` class provides a simple event emitter implementation.
 * It allows you to subscribe to and emit events, as well as unsubscribe from events.
 * The `EventEmitter` class is designed to be lightweight and easy to use.
 *
 * @example
 * const emitter = new EventEmitter();
 * emitter.on('myEvent', (data) => {
 *   console.log('myEvent triggered with data:', data);
 * });
 * emitter.emit('myEvent', { foo: 'bar' });
 */
export class EventEmitter { 
  static default = new EventEmitter();
  
  constructor() {
    this.events = new Map();
    this.disposed = false;
  }

  /**
   * Subscribes a callback function to the specified event.
   * If the event does not exist, it will be created.
   * The returned function can be used to unsubscribe the callback.
   *
   * @param {string} event - The name of the event to subscribe to.
   * @param {Function} callback - The function to be called when the event is emitted.
   * @returns {Function} - A function that can be called to unsubscribe the callback.
   */
  on(event, callback) {
    if (this.disposed) return () => {};
    
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event).add(callback);
    return () => this.off(event, callback);
  }

  /**
   * Unsubscribes the specified callback function from the given event.
   * If the event no longer has any subscribed callbacks, it will be removed.
   *
   * @param {string} event - The name of the event to unsubscribe from.
   * @param {Function} callback - The callback function to unsubscribe.
   */
  off(event, callback) {
    if (this.disposed) return;
    
    if (this.events.has(event)) {
      this.events.get(event).delete(callback);
      // Cleanup empty event sets
      if (this.events.get(event).size === 0) {
        this.events.delete(event);
      }
    }
  }

  /**
   * Emits the specified event with the provided data.
   * If the event has any subscribed callbacks, they will be called with the data.
   * If the EventEmitter instance has been disposed, this method will return without doing anything.
   *
   * @param {string} event - The name of the event to emit.
   * @param {any} data - The data to pass to the event callbacks.
   */
  emit(event, data) {
    if (this.disposed) return;
    
    if (this.events.has(event)) {
      for (const callback of this.events.get(event)) {
        callback(data);
      }
    }
  }

  /**
   * Subscribes to the specified event and calls the provided callback function only once.
   * The callback will be called with the event data, and then the subscription will be automatically removed.
   *
   * @param {string} event - The name of the event to subscribe to.
   * @param {Function} callback - The function to be called when the event is emitted.
   * @returns {Function} - A function that can be called to unsubscribe the callback.
   */
  once(event, callback) {
    if (this.disposed) return () => {};
    
    const unsubscribe = this.on(event, (...args) => {
      unsubscribe();
      callback(...args);
    });
    return unsubscribe;
  }

  /**
   * Disposes of the EventEmitter instance, clearing all registered events and setting the `disposed` flag to `true`.
   * After calling this method, the EventEmitter instance should no longer be used.
   */
  dispose() {
    this.disposed = true;
    this.events.clear();
    this.events = null;
  }

  /**
   * Removes the event listener for the specified event.
   * If the EventEmitter instance has been disposed, this method will return without doing anything.
   *
   * @param {string} event - The name of the event to remove.
   */
  clearEvent(event) {
    if (this.disposed) return;
    
    if (this.events.has(event)) {
      this.events.delete(event);
    }
  }

  /**
   * Clears all registered events for the EventEmitter instance.
   * If the EventEmitter instance has been disposed, this method will return without doing anything.
   */
  clearAllEvents() {
    if (this.disposed) return;
    this.events.clear();
  }
}