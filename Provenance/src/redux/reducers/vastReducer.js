import moment from 'moment'

import { toggleFilter, removeFilter, addFilter, updateFilter, clearFilter, clearFilters } from './vast'
import { TOGGLE_FILTER, REMOVE_FILTER, ADD_FILTER, UPDATE_FILTER, CLEAR_FILTER, CLEAR_FILTERS } from '../actions'

import ipData from '../../data/IPLog3.5.csv'
import proxData from '../../data/proxLog.csv'
import employeeData from '../../data/employeeData.csv'

// GO ahead and convert strings into useful objects
for (let i = 0; i < ipData.length; i++) {
  ipData[i].AccessTime = moment(ipData[i].AccessTime)
}

for (let i = 0; i < proxData.length; i++) {
  proxData[i].Datetime = moment(proxData[i].Datetime)
}

const initialState = {
  ipData: ipData,
  proxData: proxData,
  employeeData: employeeData,
  ipDataFiltered: ipData,
  proxDataFiltered: proxData,
  employeeDataFiltered: employeeData,
  filters: {}
}

export default (state = initialState, action) => {
  switch (action.type) {
    case TOGGLE_FILTER: {
      return toggleFilter(state, action.filterObject)
    }
    case REMOVE_FILTER: {
      return removeFilter(state, action.filterObject)
    }
    case ADD_FILTER: {
      return addFilter(state, action.filterObject)
    }
    case UPDATE_FILTER: {
      return updateFilter(state, action.filterObject)
    }
    case CLEAR_FILTER: {
      return clearFilter(state, action.filterField)
    }
    case CLEAR_FILTERS: {
      return clearFilters(state)
    }
  }
  return state
}
