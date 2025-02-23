/**
 * Creates a Mermaid store that manages the state of a Mermaid diagram.
 *
 * @param {Object} [initialState] - The initial state of the Mermaid store.
 * @param {string} [initialState.diagram] - The initial Mermaid diagram string.
 * @param {Object} [initialState.settings] - The initial settings for the Mermaid diagram.
 * @returns {Object} - The Mermaid store instance with the following methods:
 *   - `subscribe(callback)`: Subscribes a callback function to be called whenever the state changes.
 *   - `setState(newState)`: Updates the state of the Mermaid store.
 *   - `getState()`: Returns the current state of the Mermaid store.
 *   - `dispose()`: Disposes of the Mermaid store and clears all subscribers.
 *   - `getSnapshot()`: Returns the current state, version, and subscriber count of the Mermaid store.
 */
const createMermaidStore = (initialState = { diagram: '', settings: {} }) => {
  const subscribers = new Set()
  let state = { ...initialState }
  let isDisposed = false
  let stateVersion = 0

  const validateState = (newState) => {
    if (typeof newState.diagram !== 'string') {
      throw new Error('Diagram must be a string')
    }
    if (typeof newState.settings !== 'object') {
      throw new Error('Settings must be an object')
    }
    return true
  }

  const subscribe = (callback) => {
    if (isDisposed) return () => {}
    subscribers.add(callback)
    callback(state, stateVersion)
    return () => subscribers.delete(callback)
  }

  const setState = (newState) => {
    if (isDisposed) return

    const updatedState = {
      ...state,
      ...(typeof newState === 'function' ? newState(state) : newState)
    }

    if (validateState(updatedState)) {
      state = updatedState
      stateVersion++
      subscribers.forEach(callback => callback(state, stateVersion))
    }
  }

  const dispose = () => {
    isDisposed = true
    subscribers.clear()
  }

  const getSnapshot = () => ({
    state: { ...state },
    version: stateVersion,
    subscriberCount: subscribers.size
  })

  return {
    subscribe,
    setState,
    getState: () => ({ ...state }),
    dispose,
    getSnapshot
  }
}

export const mermaidStore = createMermaidStore()