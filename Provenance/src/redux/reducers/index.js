import { combineReducers } from 'redux'
import { routerStateReducer } from 'redux-router'
import vastReducer from './vastReducer'

export default combineReducers({
  vast: vastReducer,
  router: routerStateReducer
})
