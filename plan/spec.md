# Axure-to-Mermaid Implementation Specification

## Overview
This application runs as a bookmarklet within Axure's frame system, processing sitemap data into Mermaid diagrams. The architecture prioritizes reliable frame communication, efficient DOM operations, and robust error handling.

## Core Architecture

### State Management
State is centralized using a closure-based store pattern. This approach:
- Maintains private state without class fields
- Provides immutable state access
- Implements pub/sub for change notifications
- Creates a single source of truth

```javascript
// src/core/store/mermaidStore.js
const createStore = () => {
  const state = {
    processedNodes: new Map(),
    parentChildMap: new Map(),
    mermaidText: '',
    serializedText: '',
    isAxureReady: false
  };
  
  const subscribers = new Set();
  
  return {
    getState: () => ({...state}),
    setState: (newState) => {
      Object.assign(state, newState);
      subscribers.forEach(fn => fn(state));
    },
    subscribe: (fn) => {
      subscribers.add(fn);
      return () => subscribers.delete(fn);
    }
  };
};

export const store = createStore();
```

### Event System
Cross-frame communication requires a robust event system. This implementation:
- Uses Map for O(1) event lookup
- Returns cleanup functions from subscriptions
- Supports multiple handlers per event
- Maintains handler isolation

```javascript
// src/core/events/eventBus.js
const createEventBus = () => {
  const handlers = new Map();
  
  return {
    emit: (event, data) => {
      const eventHandlers = handlers.get(event);
      if (eventHandlers) {
        eventHandlers.forEach(handler => handler(data));
      }
    },
    on: (event, handler) => {
      if (!handlers.has(event)) {
        handlers.set(event, new Set());
      }
      handlers.get(event).add(handler);
      return () => handlers.get(event)?.delete(handler);
    }
  };
};

export const eventBus = createEventBus();
```

### Axure Integration
Axure's loading behavior requires careful handling. This solution:
- Uses MutationObserver for reliable detection
- Implements proper timeout handling
- Falls back to requestIdleCallback when needed
- Provides clean sitemap access API

```javascript
// src/utils/axureLoader.js
const waitForAxure = (timeout = 10000) => {
  const checkAxure = () => new Promise(resolve => {
    const observer = new MutationObserver((_, obs) => {
      if (top?.$axure?.document) {
        obs.disconnect();
        resolve(true);
      }
    });
    observer.observe(document, { childList: true, subtree: true });
  });

  const timeoutPromise = new Promise((_, reject) => {
    (window.requestIdleCallback || setTimeout)(() => 
      reject(new Error('Axure load timeout')), timeout);
  });

  return Promise.race([checkAxure(), timeoutPromise]);
};

export const loadAxure = async () => {
  await waitForAxure();
  return top.$axure.document;
};
```

### Resource Loading
Dependencies must load reliably across network conditions:
- Implements exponential backoff retry
- Handles dev/prod CSS modes
- Loads scripts in parallel
- Manages resource lifecycle

```javascript
// src/utils/resources.js
const loadScript = (url, retries = 3) => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = url;
    script.onload = resolve;
    script.onerror = () => {
      if (retries > 0) {
        return loadScript(url, retries - 1);
      }
      reject(new Error(`Failed to load ${url}`));
    };
    document.head.appendChild(script);
  });
};

export const loadDependencies = async (isDev = false) => {
  const scripts = [
    `${CDN_URL}/pako@2.1.0/dist/pako.min.js`,
    `${CDN_URL}/js-base64@3.7.5/base64.js`
  ];

  if (isDev) {
    const styles = ['toolbar.css', 'toast.css'].map(file => 
      `${CSS_PATH}/${file}`
    );
    await Promise.all(styles.map(url => CSSLoader.load(url)));
  }

  return Promise.all(scripts.map(loadScript));
};
```


### DOM Operations
Efficient DOM manipulation is critical for performance:
- Uses DocumentFragment for batching
- Provides flexible element creation
- Implements clipboard fallbacks
- Centralizes DOM operations

```javascript
// src/utils/dom.js
const createFragment = () => document.createDocumentFragment();

const createElement = (tag, props = {}, children = []) => {
  const element = document.createElement(tag);
  
  Object.entries(props).forEach(([key, value]) => {
    if (key === 'style' && typeof value === 'object') {
      Object.assign(element.style, value);
    } else if (key === 'dataset' && typeof value === 'object') {
      Object.assign(element.dataset, value);
    } else {
      element[key] = value;
    }
  });

  children.forEach(child => {
    if (typeof child === 'string') {
      element.appendChild(document.createTextNode(child));
    } else {
      element.appendChild(child);
    }
  });

  return element;
};

export const dom = {
  createFragment,
  createElement,
  copyToClipboard: async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textarea = createElement('textarea', {
        value: text,
        style: { position: 'fixed', opacity: 0 }
      });
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      textarea.remove();
    }
  }
};
```

### Components
Factory functions replace class hierarchy:
- Maintains clean separation of concerns
- Processes nodes efficiently
- Generates standard Mermaid syntax
- Avoids this binding complexity

```javascript
// src/components/SitemapProcessor/index.js
const createSitemapProcessor = () => {
  const processNode = (node, parentId = null) => ({
    id: crypto.randomUUID(),
    name: node.pageName,
    parentId,
    type: node.type
  });

  const processNodes = (nodes, parentId = null) => {
    const processed = [];
    nodes.forEach(node => {
      const processedNode = processNode(node, parentId);
      processed.push(processedNode);
      if (node.children?.length) {
        processed.push(...processNodes(node.children, processedNode.id));
      }
    });
    return processed;
  };

  return {
    process: (nodes) => processNodes(nodes)
  };
};

// src/components/MermaidGenerator/index.js
const createMermaidGenerator = (store) => {
  const generateMarkup = (nodes) => {
    const groups = nodes.reduce((acc, node) => {
      const tier = acc.get(node.parentId) || new Set();
      tier.add(`${node.id}["${node.name}"]`);
      if (node.parentId) {
        tier.add(`${node.parentId} --- ${node.id}`);
      }
      acc.set(node.parentId, tier);
      return acc;
    }, new Map());

    return [
      'graph TD',
      Array.from(groups.values())
        .map(tier => Array.from(tier).join('\n'))
        .join('\n')
    ].join('\n');
  };

  return {
    generate: () => {
      const { processedNodes } = store.getState();
      const markup = generateMarkup(Array.from(processedNodes.values()));
      store.setState({ mermaidText: markup });
      return markup;
    }
  };
};
```

### Build Process
Build configuration handles multiple outputs:
- Generates bookmarklet code
- Manages CSS inclusion
- Optimizes for production
- Supports development mode

```javascript
// build/config.js
export const buildConfig = {
  input: './src/index.js',
  output: {
    dir: './dist',
    format: 'iife',
    name: 'AxureToMermaid'
  },
  plugins: [
    css({
      output: isDev ? 'styles.css' : 'inline'
    }),
    resolve(),
    commonjs(),
    terser({
      mangle: true,
      compress: true
    })
  ]
};
```

## Implementation Steps

1. State & Events
- Initialize store
- Set up event bus
- Create state subscribers

2. Core Functions
- Implement axureLoader
- Set up resource loading
- Create DOM utilities

3. Components
- Build SitemapProcessor
- Implement MermaidGenerator
- Create Toolbar components
- Add Toast notifications

4. Integration
- Wire up event handlers
- Connect store subscribers
- Initialize core systems

5. Build Process
- Set up asset embedding
- Configure bookmarklet generation
- Implement dev/prod modes

## Error Handling

- Use Promise.race for timeouts
- Implement retry logic for resources
- Add fallbacks for modern APIs
- Log errors to console in dev modet
