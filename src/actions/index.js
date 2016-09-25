export const APP_REMOVE_NODE = 'APP_REMOVE_NODE'
export const APP_TOGGLE_NAME = 'APP_TOGGLE_NAME'
export const APP_UPDATE_PATHS = 'APP_UPDATE_PATHS'
export const APP_CHANGE_OFFSET = 'APP_CHANGE_OFFSET'

export const removeNode = (udid) => (
  {
    type: APP_REMOVE_NODE,
    udid: udid
  }
)

export const toggleName = (index) => (
  {
    type: APP_TOGGLE_NAME,
    index: index
  }
)

export const updatePaths = () => (
  {
    type: APP_UPDATE_PATHS
  }
)

export const changeOffset = (name) => (
  {
    type: APP_CHANGE_OFFSET,
    name: name
  }
)
