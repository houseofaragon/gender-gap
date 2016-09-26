import { createStore, applyMiddleware } from 'redux'
import createLogger from 'redux-logger'
import { reducer } from './reducers'

export default function configureStore (initialState) {
  return applyMiddleware(createLogger())(createStore)(reducer, initialState, window.devToolsExtension && window.devToolsExtension())
}

// Disable the logger for better performance
// export default function configureStore(initialState) {
//   return createStore(reducer, initialState);
// }
