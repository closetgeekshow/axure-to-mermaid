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