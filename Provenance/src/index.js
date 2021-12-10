import React from 'react'
import ReactDom from 'react-dom'
import { Provider } from 'react-redux'
// import moment from 'moment'

import createStore from './store'
import redis from './redis'
import routes from './routes'

import './styles/main.styl'

const store = window.store = createStore()
window.redis = redis

// const logMouse = (e) => {
  // redis.add('mousemove', {
  //   date: moment().format(),
  //   eventType: 'mousemove',
  //   target: e.target,
  //   x: e.clientX,
  //   y: e.clientY
  // })
// }

// document.addEventListener('mousemove', logMouse, false)

ReactDom.render(
  <Provider store={store}>
    {routes}
  </Provider>
  , document.getElementById('root')
)
