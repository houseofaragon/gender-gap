const { APP_REMOVE_NODE, APP_TOGGLE_NAME, APP_UPDATE_PATHS, APP_CHANGE_OFFSET } = require('../actions')
const { getInitialValues, getPathsAndScales } = require('./utils')

const [data, names, dates] = getInitialValues()

const initialState = {
  data: data,               // The raw dataset with all names and dates
  view: [500, 275],         // ViewBox: Width, Height
  trbl: [15, 10, 10, 40],   // Margins: Top, Right, Bottom, Left
  names: names,             // An object with fruti names and active flag
  dates: dates,             // An array of UTC dates in the data series
  offset: 'stacked',        // The current offset: stacked, stream or expanded
  yScale: () => {},         // y-scale default value
  xScale: () => {},         // x-scale default value
  mounted: {},              // Currently Mounted Nodes
  removed: {}               // Nodes removed since last update
}

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    
    case APP_TOGGLE_NAME:
      return reduceToggleNode(state, action)

    case APP_REMOVE_NODE:
      return reduceRemoveNode(state, action)

    case APP_UPDATE_PATHS:
      return reduceUpdatePaths(state, action)

    case APP_CHANGE_OFFSET:
      return reduceChangeOffset(state, action)

    default:
      return state
  }
}

const reduceToggleNode = (state, action) => {
  const newState = {}
  Object.assign(newState, state, toggleNode(state, action))
  return newState
}

const reduceRemoveNode = (state,action) => {
  const newState = {}
  Object.assign(newState, state, { removed: removedNode(state, action.udid) })
  return newState
}

const reduceUpdatePaths = (state,action) => {
  const newState = {}
  Object.assign(newState, state, updateNodes(state, state.names, state.offset))
  return newState
}

const reduceChangeOffset = (state,action) => {
  const newState = {}
  Object.assign(newState, state, updateNodes(state, state.names, action.name))
  return newState
}

const updateNodes = (state, names, offset) => {
  const {view, trbl, data, dates, mounted, removed} = state

  const nodes = {}

  const dims = [
    view[0] - trbl[1] - trbl[3],
    view[1] - trbl[0] - trbl[2]
  ]

  const [paths, x, y] = getPathsAndScales(dims, data, names, dates, offset)

  for (const key in paths) {
    nodes[key] = {
      udid: key,
      path: paths[key]
    }

    if (mounted[key] && !removed[key]) {
      nodes[key].type = 'UPDATING'
    } else {
      nodes[key].type = 'ENTERING'
    }
  }

  for (const key in mounted) {
    if (!nodes[key] && !removed[key]) {
      nodes[key] = {
        udid: mounted[key].udid,
        path: mounted[key].path,
        type: 'EXITING'
      }
    }
  }

  return {
    mounted: nodes,
    removed: {},
    names: names,
    dates: dates,
    offset: offset,
    xScale: x,
    yScale: y
  }
}

const toggleNode = (state, action) => {
  const {index} = action

  const names = [
    ...state.names.slice(0, index),
    {name: state.names[index].name, show: !state.names[index].show},
    ...state.names.slice(index + 1)
  ]

  return updateNodes(state, names, state.offset)
}

const removedNode = (state, udid) => {
  const removed = {}
  removed[udid] = true

  return Object.assign({}, state.removed, removed)
}


