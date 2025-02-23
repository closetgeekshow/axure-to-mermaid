# Code Review for Axure-to-Mermaid

WHO THE HELL designed this mess? *breathes deeply* Okay, let's break this down...

## Overall Structure

The good:
- Separation of concerns is decent
- Utils are properly isolated
- Event handling is somewhat sane

The bad:
1. Too much `this` flying around like a drunk mosquito
2. State management is scattered like confetti
3. Private methods are inconsistently marked
4. DOM manipulation is inefficient
5. Event handling could be more centralized

## Immediate Critical Changes Needed

### 1. Centralize State Management

```javascript
// src/store/MermaidStore.js
export class MermaidStore {
  #state = {
    processedNodes: new Map(),
    parentChildMap: new Map(),
    currentText: '',
    isReady: false
  };
  
  #subscribers = new Set();

  setState(newState) {
    this.#state = { ...this.#state, ...newState };
    this.#notifySubscribers();
  }

  subscribe(callback) {
    this.#subscribers.add(callback);
    return () => this.#subscribers.delete(callback);
  }

  #notifySubscribers() {
    for (const callback of this.#subscribers) {
      callback(this.#state);
    }
  }
}
```

### 2. Proper Loading Pattern

```javascript
// src/utils/axureLoader.js
export const AxureLoader = {
  async waitForAxure(timeout = 10000) {
    const fallback = () => new Promise((_, reject) => {
      (window.requestIdleCallback || setTimeout)(() => 
        reject(new Error('Axure load timeout')), timeout);
    });

    const observe = () => new Promise(resolve => {
      const observer = new MutationObserver((_, obs) => {
        if (top?.$axure?.document) {
          obs.disconnect();
          resolve();
        }
      });
      observer.observe(document, { childList: true, subtree: true });
    });

    return Promise.race([observe(), fallback()]);
  }
};
```

### 3. Modern Event Handling

```javascript
// src/utils/EventEmitter.js
export class EventEmitter {
  static #defaultInstance = new EventEmitter();
  #events = new Map();

  static getDefault() {
    return this.#defaultInstance;
  }

  emit(event, data) {
    const handlers = this.#events.get(event);
    if (!handlers) return;
    handlers.forEach(handler => handler(data));
  }
}
```

### 4. Proper DOM Management

```javascript
// src/components/Toolbar.js
export class Toolbar {
  #fragment = document.createDocumentFragment();
  #buttonHandlers = new Map();

  constructor() {
    this.#initializeContainer();
    this.#attachEventDelegation();
  }

  #initializeContainer() {
    const container = document.createElement('div');
    container.id = 'toolbar-container';
    
    // Single event listener for all buttons
    container.addEventListener('click', e => {
      const button = e.target.closest('[data-action]');
      if (!button) return;
      
      const handler = this.#buttonHandlers.get(button.dataset.action);
      if (handler) handler(e);
    });

    this.#fragment.appendChild(container);
  }
}
```

### 5. Resource Loading

```javascript
// src/config/resourceLoader.js
export const ResourceLoader = {
  async loadResources(isDev = false) {
    const resources = [
      ...DEPENDENCIES,
      ...ICONS.map(icon => `${CDN_URL}/${icon}`),
    ];

    if (isDev) {
      const cssFiles = ['toolbar.css', 'components.css'];
      resources.push(...cssFiles.map(file => `${CSS_PATH}/${file}`));
    } else {
      // Inject minified CSS directly
      const style = document.createElement('style');
      style.textContent = MINIFIED_CSS;
      document.head.appendChild(style);
    }

    return Promise.all(resources.map(loadResource));
  }
};
```

## Major Issues and Solutions

1. **State Management**: Your state is scattered across multiple components like a teenager's dirty laundry. Centralize it!

2. **Event Handling**: Stop creating new event listeners for every damn button! Use event delegation.

3. **Resource Loading**: Your dependency loading is about as reliable as a chocolate teapot. Add proper retry logic and parallel loading.

4. **Type Safety**: JavaScript is loose enough without you making it worse. Add proper type checking and validation.

5. **Error Handling**: Your error handling is like Swiss cheese - full of holes. Add proper error boundaries and logging.

## Code Smells That Need Fixing

1. `processSitemap` using `flatMap` and `reduce` - it's clever but too damn clever. Make it readable:

```javascript
function processSitemap(nodes, parentId = null) {
  const processed = [];
  
  for (const node of nodes) {
    const id = crypto.randomUUID();
    processed.push({
      id,
      name: node.pageName,
      parentId,
      type: node.type
    });

    if (node.children?.length) {
      processed.push(...processSitemap(node.children, id));
    }
  }

  return processed;
}
```

2. Replace that abomination of a hash function with `crypto.randomUUID()`. What is this, 1995?

3. Stop using `setTimeout` like it's candy. Use `requestIdleCallback` with a proper fallback:

```javascript
const scheduler = window.requestIdleCallback || (cb => setTimeout(cb, 1));
scheduler(() => { /* your code */ });
```

## Final Thoughts

1. Move all CSS to separate files and use a proper build process. This isn't 2005 - we have tools for this.

2. Your EventEmitter implementation isn't terrible, but it needs proper cleanup and default instance handling.

3. The folder structure is okay, but move components that belong together into feature folders.


And for God's sake, add some proper documentation. Not those useless JSDoc comments that just restate the obvious, but actual documentation about WHY things are done the way they are.

Fix these issues and it might actually be usable by someone other than its creator.

*removes Linus hat*
