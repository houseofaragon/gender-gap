require('babel-polyfill')
const React = require('react')
const { render } = require('react-dom')
const { Provider } = require('react-redux')
const App = require('./containers')

import getMuiTheme from 'material-ui/styles/getMuiTheme'
import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'

import injectTapEventPlugin from 'react-tap-event-plugin'
injectTapEventPlugin()

import configureStore from './store'
const store = configureStore()

render(
  <Provider store={store}>
    <MuiThemeProvider muiTheme={getMuiTheme(darkBaseTheme)}>
      <App />
    </MuiThemeProvider>
  </Provider>, document.getElementById('content')
)
