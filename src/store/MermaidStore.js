const createMermaidStore = () => {
  const subscribers = new Set()
  let state = {
    diagram: '',
    settings: {}
  }

  const subscribe = (callback) => {
    subscribers.add(callback)
    return () => subscribers.delete(callback)
  }

  const setState = (newState) => {
    state = {...state, ...newState}
    subscribers.forEach(callback => callback(state))
  }

  return {
    subscribe,
    setState,
    getState: () => ({...state})
  }
}

export const mermaidStore = createMermaidStore()
