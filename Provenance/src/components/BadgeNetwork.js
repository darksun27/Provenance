import React, { PropTypes } from 'react'
import * as d3 from 'd3'
import moment from 'moment'
import cloneDeep from 'lodash.clonedeep'

import proxData from '../data/proxLog.csv'
import Tooltip from './Tooltip'

// NOTE: This is visualization was created specifically for the vast 2009 dataset
class BadgeNetwork extends React.Component {
  constructor (props) {
    super(props)

    this.createChart = this.createChart.bind(this)
    this.updateChart = this.updateChart.bind(this)
    this.removeChart = this.removeChart.bind(this)

    this.clearOffices = this.clearOffices.bind(this)
    this.processData = this.processData.bind(this)
    this.selectedIPs = d3.map()

    const tooltipFunction = (d) => {
      let tip = ''
      tip += '<span>Office: ' + d.Office + '</span></br>'
      tip += '<span>Employee ID: ' + d.EmployeeID + '</span></br>'
      tip += '<span>IP Address: ' + d.IP + '</span>'
      return tip
    }

    this.tip = new Tooltip()
      .attr('className', 'tooltip')
      .html(tooltipFunction)
  }

  clearOffices () {
    this.selectedIPs.clear()
    console.log(this.selectedIPs)
  }

  processData (props) {
    let dataMap = d3.map()

    // NOTE: Assumes prox data is sorted by descending Datetime
    for (let i = 0; i < props.proxData.length; i++) {
      let datum = props.proxData[i]
      if (datum.Datetime.isBefore(props.selectedTime) && !dataMap.has(datum.ID)) {
        dataMap.set(datum.ID, datum)
      }
      if (dataMap.size() === 60) {
        break
      }
    }
    return dataMap
  }

  createChart () {
    let root = d3.select(this.refs.root)

    // Get real chart width/height
    this.width = this.props.width
    this.height = this.props.height
    if (this.props.autoWidth) {
      this.width = root.node().offsetWidth
    }

    let svg = root.append('svg')
      .attr('width', this.width)
      .attr('height', this.height)
    this.chart = svg.append('g')
    this.officeContainer = this.chart.append('g')
      .attr('class', 'offices')
    this.officeTextContainer = this.chart.append('g')
      .attr('class', 'officesText')
  }

  updateChart (props, state) {
    // Process map data
    let dataMap = this.processData(props)

    // NOTE: Scale domains require a 'wrapped' index
    let xScale = d3.scaleBand()
      .domain(d3.range(0, 12))
      .range([0, this.width])

    let yScale = d3.scaleBand()
      .domain(d3.range(0, 5))
      .range([this.height, 0])

    let offices = this.officeContainer.selectAll('.office')
      .data(props.employeeData, (d) => {
        return d.EmployeeID + '-' +
          props.selectedTime.format() + '-' +
          this.selectedIPs.has(d.IP)
      })

    offices.exit().remove()

    let self = this
    offices.enter()
      .append('rect').merge(offices)
        .attr('class', 'office')
        .attr('id', (d) => 'office ' + d.Office + '-' + d.EmployeeID)
        .attr('width', xScale.bandwidth())
        .attr('height', yScale.bandwidth())
        .attr('x', (d, i) => xScale(i % 12))
        .attr('y', (d, i) => props.height - yScale(Math.floor(i / 12)) - yScale.bandwidth())
        .on('click', function (d, i) {
          if (self.selectedIPs.has(d.IP)) {
            self.selectedIPs.remove(d.IP)
          } else {
            self.selectedIPs.set(d.IP, true)
          }
          // let fillOpacity = self.selectedIPs.has(d.IP) ? 1.0 : 0.50
          // d3.select(this)
          //   .attr('fill-opacity', fillOpacity)
          props.onClick(d3.event, d, props)
        })
        .on('mouseenter', (d, i) => {
          this.props.onMouseEnter(d3.event, d, i)
          this.tip.show(d3.event, d)
        })
        .on('mouseleave', (d, i) => { this.tip.hide(d3.event, d) })
        .attr('stroke', 'black')
        .attr('fill-opacity', (d) => this.selectedIPs.has(d.IP) ? 1.0 : 0.50)
        .attr('fill', (d) => {
          let color = '#636363'
          if (dataMap.has(d.EmployeeID)) {
            let type = dataMap.get(d.EmployeeID).Type
            if (type === 'prox-in-building' || type === 'prox-out-classified') {
              color = '#41ab5d'
            } else if (type === 'prox-in-classified') {
              color = '#4292c6'
            }
          }
          return color
        })

    let officeText = this.officeTextContainer.selectAll('.officeText')
        .data(props.employeeData, (d, i) => d.Office + '-' + d.EmployeeID)
    officeText.exit().remove()
    officeText.enter().append('text')
      .attr('class', 'officeText')
      .attr('id', (d) => 'office ' + d.Office + '-' + d.EmployeeID)
      .style('pointer-events', 'none')
      .attr('x', (d, i) => xScale(i % 12) + 3)
      .attr('y', (d, i) => props.height - yScale(Math.floor(i / 12)) - 3)
      .text((d) => {
        return d.Office + '-' + d.EmployeeID
      })
  }

  removeChart () {
    let root = d3.select(this.refs.root)
    this.tip.destroy()
    root.selectAll('*').remove()
  }

  componentDidMount () {
    this.createChart()
    this.updateChart(this.props, this.state)
  }

  componentWillUnmount () {
    this.removeChart()
  }

  shouldComponentUpdate (nextProps, nextState) {
    this.updateChart(nextProps, nextState)
    if (!nextProps.selectedTime.isSame(this.props.selectedTime)) {
      this.updateChart(nextProps, nextState)
    }
    return false
  }

  render () {
    return (
      <div ref='root' />
    )
  }
}

BadgeNetwork.defaultProps = {
  proxData: cloneDeep(proxData).reverse(),
  autoWidth: false,
  selectedTime: moment('2008-01-03T07:28'),
  width: 720,
  height: 160,
  onClick: () => {},
  onMouseEnter: () => {}
}

BadgeNetwork.propTypes = {
  employeeData: PropTypes.array.isRequired,
  proxData: PropTypes.array.isRequired,
  selectedTime: PropTypes.any,
  autoWidth: PropTypes.bool,
  width: PropTypes.number,
  height: PropTypes.number,
  onClick: PropTypes.func,
  onMouseEnter: PropTypes.func
}

export default BadgeNetwork
