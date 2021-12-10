import mergewith from 'lodash.mergewith'
import remove from 'lodash.remove'
import isArray from 'lodash.isarray'
import isempty from 'lodash.isempty'
import keys from 'lodash.keys'
import values from 'lodash.values'
import has from 'lodash.has'

// private helper function for lodash.mergewith
const customizer = (objValue, srcValue) => {
  if (isArray(objValue)) {
    return objValue.concat(srcValue)
  }
}

// private helper function filtering array
const applyFilters = (data, filterObject) => {
  // Return all data if filter object is empty
  if (isempty(filterObject)) {
    return data
  }

  let filteredData = []

  // Get relevant keys from filterObject for dataset
  let keyArr = keys(data[0])
  for (let i = 0; i < data.length; i++) {
    let datum = data[i]
    let keep = true
    for (let j = 0; j < keyArr.length; j++) {
      if (has(filterObject, keyArr[j])) {
        if (filterObject[keyArr[j]].isRange) {
          let value = datum[keyArr[j]]
          let bounds = filterObject[keyArr[j]]
          if (!(bounds[0] < value && value < bounds[1])) {
            keep = false
          }
        } else {
          let value = datum[keyArr[j]]
          if (filterObject[keyArr[j]].indexOf(value) < 0) {
            keep = false
          }
        }
      }
    }
    if (keep) {
      filteredData.push(datum)
    }
  }

  return filteredData
}

// NOTE: Only uses first key with it's first value in its array
const toggleFilter = (state, filterObject) => {
  let key = keys(filterObject)[0]
  let value = values(filterObject)[0][0]
  // Has associated value, therefore more checks required
  if (has(state.filters, key)) {
    // Check if this is a range based filter
    if (has(filterObject[key], 'isRange')) {
      if (filterObject[key]) {
        return addFilter(state, filterObject)
      }
    }

    // Has key with associated value in array
    if (state.filters[key].indexOf(value) > -1) {
      return removeFilter(state, filterObject)
    } else { // Has key but lacks associated value
      return addFilter(state, filterObject)
    }
  } else { // Lacks any associated key
    return addFilter(state, filterObject)
  }
}

const removeFilter = (state, filterObject) => {
  let key = keys(filterObject)[0]

  let newAttributes = remove(state.filters[key], (a) => {
    return filterObject[key].indexOf(a)
  })

  if (newAttributes.length > 0) {
    state.filters[key] = newAttributes
  } else {
    delete state.filters[key]
  }

  return {
    ipData: state.ipData,
    proxData: state.proxData,
    employeeData: state.employeeData,
    ipDataFiltered: applyFilters(state.ipData, state.filters),
    proxDataFiltered: applyFilters(state.proxData, state.filters),
    employeeDataFiltered: applyFilters(state.employeeData, state.filters),
    filters: state.filters
  }
}

const addFilter = (state, filterObject) => {
  let newFilterObject = mergewith(state.filters, filterObject, customizer)
  return {
    ipData: state.ipData,
    proxData: state.proxData,
    employeeData: state.employeeData,
    ipDataFiltered: applyFilters(state.ipData, newFilterObject),
    proxDataFiltered: applyFilters(state.proxData, newFilterObject),
    employeeDataFiltered: applyFilters(state.employeeData, newFilterObject),
    filters: newFilterObject
  }
}

// NOTE: Overrides current filter values
//  creates filter if it doesn't exist
const updateFilter = (state, filterObject) => {
  let key = keys(filterObject)[0]
  let value = values(filterObject)[0]

  let newFilterObject = {}
  newFilterObject = state.filters
  newFilterObject[key] = value

  return {
    ipData: state.ipData,
    proxData: state.proxData,
    employeeData: state.employeeData,
    ipDataFiltered: applyFilters(state.ipData, newFilterObject),
    proxDataFiltered: applyFilters(state.proxData, newFilterObject),
    employeeDataFiltered: applyFilters(state.employeeData, newFilterObject),
    filters: newFilterObject
  }
}

const clearFilter = (state, filterField) => {
  let newFilterObject = {}
  newFilterObject = state.filters
  delete newFilterObject[filterField]

  return {
    ipData: state.ipData,
    proxData: state.proxData,
    employeeData: state.employeeData,
    ipDataFiltered: applyFilters(state.ipData, newFilterObject),
    proxDataFiltered: applyFilters(state.proxData, newFilterObject),
    employeeDataFiltered: applyFilters(state.employeeData, newFilterObject),
    filters: newFilterObject
  }
}

const clearFilters = (state) => {
  return {
    ipData: state.ipData,
    proxData: state.proxData,
    employeeData: state.employeeData,
    ipDataFiltered: state.ipData,
    proxDataFiltered: state.proxData,
    employeeDataFiltered: state.employeeData,
    filters: {}
  }
}

export { toggleFilter, addFilter, removeFilter, updateFilter, clearFilter, clearFilters }
