import React, { PropTypes } from 'react'
import * as d3 from 'd3' // TODO: Reduce what's needed here
import moment from 'moment'

import Tooltip from './Tooltip'

class Histogram extends React.Component {
  constructor (props) {
    super(props)

    this.createChart = this.createChart.bind(this)
    this.updateChart = this.updateChart.bind(this)
    this.removeChart = this.removeChart.bind(this)

    this.onBrushStart = this.onBrushStart.bind(this)
    this.onBrushDrag = this.onBrushDrag.bind(this)
    this.onBrushEnd = this.onBrushEnd.bind(this)

    if (props.tooltip) {
      const tooltipFunction = (d) => {
        let tip = d
        return tip
      }

      this.tip = new Tooltip()
        .attr('className', 'tooltip')
        .offset([-8, 0])
        .html(tooltipFunction)

      if (props.brushable) {
        const brushTooltipFunction = (d) => {
          let x0 = (+d.target.getAttribute('x'))
          let x1 = (+d.target.getAttribute('width')) + x0
          x0 = this.xScale.invert(x0)
          x1 = this.xScale.invert(x1)
          return (moment(x0).format()) + ' to ' + (moment(x1).format())
        }

        this.brushTip = new Tooltip()
          .attr('className', 'tooltip')
          .offset([-8, 0])
          .html(brushTooltipFunction)
      }
    }
  }

  createChart () {
    let root = d3.select(this.refs.root)

    // Get real chart width/height
    let width = this.props.width
    let height = this.props.height
    if (this.props.autoWidth) {
      width = root.node().offsetWidth
    }

    this.chartWidth = width - this.props.margin.left - this.props.margin.right
    this.chartHeight = height - this.props.margin.top - this.props.margin.bottom

    let svg = root.append('svg')
      .attr('width', this.chartWidth + this.props.margin.left + this.props.margin.right)
      .attr('height', this.chartHeight + this.props.margin.top + this.props.margin.bottom)
    this.chart = svg.append('g')
      .attr('transform', 'translate(' + this.props.margin.left + ',' + this.props.margin.top + ')')
    this.barContainer = this.chart.append('g')
      .attr('class', 'bars')
    this.xAxis = this.chart.append('g')
      .attr('class', 'axis x-axis')
      .attr('transform', 'translate(0,' + this.chartHeight + ')')
    this.yAxis = this.chart.append('g')
      .attr('class', 'axis y-axis')
    this.chart.append('text')
      .attr('class', 'axis label')
      .attr('transform', 'rotate(-90)')
      .attr('text-anchor', 'end')
      .attr('y', -this.props.margin.left + 6)
      .attr('dy', '.35em')
      .text(this.props.yLabel)
    this.chart.append('text')
      .attr('x', this.chartWidth)
      .attr('y', this.chartHeight + this.props.margin.bottom + 11)
      .attr('text-anchor', 'end')
      .text(this.props.xLabel)
    if (this.props.brushable) {
      this.brush = this.chart.append('g')
        .attr('class', 'brush')
    }
  }

  updateChart (props, state) {
    this.xScale = d3.scaleTime()
      .domain(props.xDomain)
      .range([0, this.chartWidth])

    this.yScale = d3.scaleLinear()
      .range([this.chartHeight, 0])

    let bins = d3.histogram()
      .value((d) => +d.AccessTime)
      .domain(this.xScale.domain())
      .thresholds(this.xScale.ticks(100))(props.data)

    this.yScale
      .domain([0, d3.max(bins, (d) => d.length)])

    let bars = this.barContainer.selectAll('.bar')
        .data(bins)

    bars.exit().remove()

    bars.enter()
      .append('rect')
        .attr('class', 'bar')
        .on('click', (d) => {
          if (!props.brushable) {
            this.props.onClick(d3.event, d)
          }
        })
        .on('mouseenter', (d) => {
          this.props.onMouseEnter(d3.event, d.length)
          if (props.tooltip) {
            this.tip.show(d3.event, d.length)
          }
        })
        .on('mouseleave', (d) => {
          if (props.tooltip) {
            this.tip.hide(d3.event, d.length)
          }
        })
        .attr('x', (d) => this.xScale(d.x0))
        .attr('y', (d) => this.yScale(d.length))
        .attr('width', (d) => this.xScale(d.x1) - this.xScale(d.x0))
        .attr('height', (d) => this.chartHeight - this.yScale(d.length))
      .merge(bars).transition().duration(400).ease(d3.easeLinear)
        .attr('x', (d) => this.xScale(d.x0))
        .attr('y', (d) => this.yScale(d.length))
        .attr('width', (d) => this.xScale(d.x1) - this.xScale(d.x0))
        .attr('height', (d) => this.chartHeight - this.yScale(d.length))

    let xAxis = d3.axisBottom(this.xScale)
    if (props.xAxisTicks) {
      xAxis.ticks(props.xAxisTicks)
    }
    if (props.xAxisTickFunction) {
      xAxis.tickFormat((d, i) => {
        return props.xAxisTickFunction(d, i)
      })
    }
    this.xAxis.call(xAxis)
    this.yAxis.call(d3.axisLeft(this.yScale))

    if (props.brushable) {
      this.brush
        .call(d3.brushX()
          .extent([[0, 0], [this.chartWidth, this.chartHeight]])
          .on('start', this.onBrushStart)
          .on('brush', this.onBrushDrag)
          .on('end', this.onBrushEnd))
        .select('.selection')
          .on('mouseenter', (d) => this.brushTip.show(d3.event, d3.event))
          .on('mouseleave', (d) => this.brushTip.hide(d3.event, d3.event))
    }
  }

  onBrushStart () {
    this.props.onBrushStart(d3.event, d3.event.selection.map(this.xScale.invert))
  }

  onBrushDrag () {
    this.props.onBrushDrag(d3.event, d3.event.selection.map(this.xScale.invert))
  }

  onBrushEnd () {
    this.props.onBrushEnd(d3.event, d3.event.selection.map(this.xScale.invert))
  }

  removeChart () {
    let root = d3.select(this.refs.root)
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
    if (nextProps.data !== this.props.data) {
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

Histogram.defaultProps = {
  data: [],
  margin: {
    top: 5,
    left: 55,
    bottom: 35,
    right: 45
  },
  numBins: 10,
  brushable: false,
  autoWidth: false,
  width: 640,
  height: 360,
  onClick: () => {},
  onMouseEnter: () => {},
  onBrushStart: () => {},
  onBrushDrag: () => {},
  onBrushEnd: () => {},
  xAxisTickFunction: null,
  xAxisTicks: null,
  xLabel: '',
  yLabel: '',
  xAccessor: 'key',
  yAccessor: 'value',
  tooltip: false
}

Histogram.propTypes = {
  data: PropTypes.array,
  margin: PropTypes.object,
  brushable: PropTypes.bool,
  autoWidth: PropTypes.bool,
  width: PropTypes.number,
  height: PropTypes.number,
  numBins: PropTypes.number,
  onClick: PropTypes.func,
  onMouseEnter: PropTypes.func,
  onBrushStart: PropTypes.func,
  onBrushDrag: PropTypes.func,
  onBrushEnd: PropTypes.func,
  xAxisTickFunction: PropTypes.func,
  xAxisTicks: PropTypes.any,
  xLabel: PropTypes.string,
  yLabel: PropTypes.string,
  xAccessor: PropTypes.string,
  yAccessor: PropTypes.string,
  tooltip: PropTypes.bool
}

export default Histogram
