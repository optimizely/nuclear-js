import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'nuclear-js-react-addons'
import App from './containers/App'
import reactor from './reactor'

render(
  <Provider reactor={reactor}>
    <App />
  </Provider>,
  document.getElementById('root')
)
