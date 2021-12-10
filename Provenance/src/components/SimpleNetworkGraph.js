import React, { PropTypes } from 'react'
import has from 'lodash.has'
import * as d3 from 'd3' // TODO: Reduce what's needed here

import Tooltip from './Tooltip'

class SimpleNetworkGraph extends React.Component {
  constructor (props) {
    super(props)

    this.createChart = this.createChart.bind(this)
    this.updateChart = this.updateChart.bind(this)
    this.removeChart = this.removeChart.bind(this)
    this.generateGraph = this.generateGraph.bind(this)

    const tooltipFunction = (d) => {
      let tip = d
      return tip
    }

    this.tip = new Tooltip()
      .attr('className', 'tooltip')
      .offset([-8, 0])
      .html(tooltipFunction)
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
    this.srcNodeContainer = this.chart.append('g')
      .attr('class', 'source node')
    this.srcLabelContainer = this.chart.append('g')
      .attr('class', 'source label')
    this.dstNodeContainer = this.chart.append('g')
      .attr('class', 'dest node')
    this.linkContainer = this.chart.append('g')
      .attr('class', 'links')
  }

  updateChart (props, state) {
    this.generateGraph(props, state)

    // Create source nodes
    let srcScale = d3.scalePoint()
      .domain(this.nodes.filter((d) => d.type === 'SourceIP').map((d) => d.key))
      .range([0, this.chartWidth])

    let srcNodes = this.srcNodeContainer.selectAll('.node')
      .data(srcScale.domain(), (d, i) => d)

    srcNodes.exit().remove()

    srcNodes.enter().append('circle')
        .attr('class', 'node')
        .on('mouseenter', (d, i) => {
          this.props.onMouseEnter(d3.event, d)
          this.tip.show(d3.event, d)
          this.linkContainer.selectAll('.link')
            .attr('display', (f, j) => {
              return (f.source === d) ? 'block' : 'none'
            })
        })
        .on('mouseleave', (d, i) => {
          this.tip.hide(d3.event, d)
          this.linkContainer.selectAll('.link')
            .attr('display', 'block')
        })
      .merge(srcNodes)
        .attr('cx', (d) => srcScale(d))
        .attr('cy', 0)
        .attr('r', 4)

    // Create source node labels
    let srcLabels = this.srcLabelContainer.selectAll('.label')
      .data(srcScale.domain(), (d) => d)

    srcLabels.exit().remove()

    srcLabels.enter().append('text')
        .attr('class', 'label')
        .on('mouseenter', (d, i) => {
          this.props.onMouseEnter(d3.event, d)
          this.tip.show(d3.event, d)
          this.linkContainer.selectAll('.link')
            .attr('display', (f, j) => {
              return (f.source === d) ? 'block' : 'none'
            })
        })
        .on('mouseleave', (d, i) => {
          this.tip.hide(d3.event, d)
          this.linkContainer.selectAll('.link')
            .attr('display', 'block')
        })
      .merge(srcLabels)
        .attr('x', (d) => srcScale(d) - 3)
        .attr('y', -(this.props.margin.top / 2) + 3)
        .text((d) => d.split('.')[3])

    // Create dest nodes
    let dstScale = d3.scalePoint()
      .domain(this.nodes.filter((d) => d.type === 'DestIP').map((d) => d.key))
      .range([0, this.chartWidth])

    let dstNodes = this.dstNodeContainer.selectAll('.node')
      .data(dstScale.domain(), (d) => d)

    dstNodes.exit().remove()

    dstNodes.enter().append('circle')
        .attr('class', 'node')
        .on('mouseenter', (d, i) => {
          this.props.onMouseEnter(d3.event, d)
          this.tip.show(d3.event, d)
          this.linkContainer.selectAll('.link')
            .attr('display', (f, j) => {
              return (f.target === d) ? 'block' : 'none'
            })
        })
        .on('mouseleave', (d, i) => {
          this.tip.hide(d3.event, d)
          this.linkContainer.selectAll('.link')
            .attr('display', 'block')
        })
      .merge(dstNodes)
        .attr('cx', (d) => dstScale(d))
        .attr('cy', this.chartHeight)
        .attr('r', 4)

    // Create links
    let links = this.linkContainer.selectAll('.link')
      .data(this.links, (d) => d.source + '-' + d.target)

    links.exit().remove()

    links.enter().append('path')
        .attr('class', 'link')
      .merge(links)
        .attr('d', (d, i) => {
          return 'M ' + srcScale(d.source) + ' 0 ' +
            'L ' + dstScale(d.target) + ' ' + this.chartHeight
        })
  }

  generateGraph (props, state) {
    this.nodes = []
    this.links = []

    // Generate nodes
    let nodeFlags = {}
    for (let i = 0; i < props.data.length; i++) {
      let datum = props.data[i]
      // Get source
      let sourceFlagKey = datum.SourceIP.replace('.', '')
      if (!has(nodeFlags, sourceFlagKey)) {
        nodeFlags[sourceFlagKey] = true
        this.nodes.push({
          'key': datum.SourceIP,
          'type': 'SourceIP'
        })
      }

      // Get dest
      let destFlagKey = datum.DestIP.replace('.', '')
      if (!has(nodeFlags, destFlagKey)) {
        nodeFlags[destFlagKey] = true
        this.nodes.push({
          'key': datum.DestIP,
          'type': 'DestIP'
        })
      }
    }

    // Generate links
    let linkFlags = {}
    for (let i = 0; i < props.data.length; i++) {
      let datum = props.data[i]

      let linkFlagKey = datum.SourceIP.replace('.', '') +
        '-' + datum.DestIP.replace('.', '')
      if (!has(linkFlags, linkFlagKey)) {
        linkFlags[linkFlagKey] = true
        this.links.push({
          'source': datum.SourceIP,
          'target': datum.DestIP,
          'ReqSize': +datum.ReqSize,
          'RespSize': +datum.RespSize
        })
      } else {
        for (let j = 0; j < this.links.length; j++) {
          if (this.links[j].source === datum.SourceIP && this.links[j].target === datum.DestIP) {
            this.links[j].ReqSize += (+datum.ReqSize)
            this.links[j].RespSize += (+datum.RespSize)
            break
          }
        }
      }
    }
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

SimpleNetworkGraph.defaultProps = {
  data: [],
  margin: {
    top: 20,
    left: 15,
    bottom: 5,
    right: 15
  },
  autoWidth: false,
  width: 640,
  height: 380,
  keyAccessor: 'key',
  valueAccessor: 'ReqSize',
  onMouseEnter: () => {}
}

SimpleNetworkGraph.propTypes = {
  data: PropTypes.array,
  margin: PropTypes.object,
  autoWidth: PropTypes.bool,
  width: PropTypes.number,
  height: PropTypes.number,
  numBins: PropTypes.number,
  keyAccessor: PropTypes.string,
  valueAccessor: PropTypes.string,
  onMouseEnter: PropTypes.func
}

export default SimpleNetworkGraph
