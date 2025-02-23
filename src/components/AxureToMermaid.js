import { createProcessor } from "./SitemapProcessor.js";
import { EventEmitter } from "../utils/EventEmitter.js";

export const createAxureToMermaid = (deps = {}) => {
  const processor = deps.processor || createProcessor();
  const eventBus = deps.eventBus || EventEmitter.default;
  
  const waitForAxureDocument = async (timeout = 10000) => {
    if (top?.$axure?.document) return;

    const observerPromise = new Promise((resolve) => {
      const observer = new MutationObserver((_, obs) => {
        if (top?.$axure?.document) {
          obs.disconnect();
          resolve();
        }
      });
      observer.observe(document, { childList: true, subtree: true });
    });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout waiting for axure.document")), timeout)
    );

    return Promise.race([observerPromise, timeoutPromise]);
  };

  const getSitemapArray = async () => {
    await waitForAxureDocument();
    return top?.$axure?.document?.sitemap?.rootNodes;
  };

  const initialize = async () => {
    eventBus.emit('core:initializing');
    
    const sitemapArray = deps.sitemapArray || await getSitemapArray();
    if (!sitemapArray) {
      eventBus.emit('core:error', { 
        type: 'initialization',
        message: 'Sitemap array required'
      });
      throw new Error('Sitemap array is required for initialization');
    }

    await processor.initialize(sitemapArray);
    eventBus.emit('core:ready');
    
    return { processor, eventBus };
  };

  return {
    initialize
  };
};