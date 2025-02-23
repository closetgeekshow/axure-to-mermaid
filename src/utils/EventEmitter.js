export class EventEmitter {
  static default = new EventEmitter();
  
  constructor() {
    this.events = new Map();
    this.disposed = false;
  }

  on(event, callback) {
    if (this.disposed) return () => {};
    
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event).add(callback);
    return () => this.off(event, callback);
  }

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

  emit(event, data) {
    if (this.disposed) return;
    
    if (this.events.has(event)) {
      for (const callback of this.events.get(event)) {
        callback(data);
      }
    }
  }

  once(event, callback) {
    if (this.disposed) return () => {};
    
    const unsubscribe = this.on(event, (...args) => {
      unsubscribe();
      callback(...args);
    });
    return unsubscribe;
  }

  dispose() {
    this.disposed = true;
    this.events.clear();
    this.events = null;
  }

  clearEvent(event) {
    if (this.disposed) return;
    
    if (this.events.has(event)) {
      this.events.delete(event);
    }
  }

  clearAllEvents() {
    if (this.disposed) return;
    this.events.clear();
  }
}