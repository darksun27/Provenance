import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import * as d3 from 'd3'
import moment from 'moment'

import redis from '../redis'
import Div from '../components/Div'

import { toggleFilter, updateFilter, clearFilter } from '../redux/actions'
import IpTable from '../components/ipTable'
import Histogram from '../components/histogram'
import BadgeNetwork from '../components/BadgeNetwork'
import SimpleNetworkGraph from '../components/SimpleNetworkGraph'
import MiscInfo from '../components/miscInfo'

const makeDateString = (day, hour, minute) => {
  let paddedDay = (day + '').length === 1 ? '0' + day : day
  let paddedHour = (hour + '').length === 1 ? '0' + hour : hour
  let paddedMinute = (minute + '').length === 1 ? '0' + minute : minute
  return '2008-01-' + paddedDay + 'T' + paddedHour + ':' + paddedMinute
}

class GridView extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      day: 1,
      hour: 0,
      minute: 0,
      selectedTime: moment(makeDateString(1, 0, 0)),
      selectedEvents: [],
      showSelected: false
    }

    this.detailXAxisTickFunc = (d, i) => {
      let timeFormat = d3.timeFormat('%H:%M:%S')
      return timeFormat(d)
    }

    this.onColumnClick = this.onColumnClick.bind(this)
    this.onRowClick = this.onRowClick.bind(this)
    this.onRowMouseOver = this.onRowMouseOver.bind(this)
    this.toggleSelected = this.toggleSelected.bind(this)

    this.onHistogramMouseEnter = this.onHistogramMouseEnter.bind(this)
    this.onHistogramClick = this.onHistogramClick.bind(this)
    this.onHistogramBrushStart = this.onHistogramBrushStart.bind(this)
    this.onHistogramBrushEnd = this.onHistogramBrushEnd.bind(this)

    this.onGraphNodeEnter = this.onGraphNodeEnter.bind(this)

    this.onOfficeClear = this.onOfficeClear.bind(this)
    this.onOfficeClick = this.onOfficeClick.bind(this)
    this.officeEnter = this.officeEnter.bind(this)

    this.handleDayChange = this.handleDayChange.bind(this)
    this.handleHourChange = this.handleHourChange.bind(this)
    this.handleMinuteChange = this.handleMinuteChange.bind(this)
    this.onInputMouseUp = this.onInputMouseUp.bind(this)
    this.onKeyUp = this.onKeyUp.bind(this)
  }

  onKeyUp (e) {
    let dateString = makeDateString(this.state.day, this.state.hour, this.state.minute)
    let selectedTime = moment(dateString)
    redis.add('sliderMoved', {
      date: moment().format(),
      eventType: 'keyup',
      target: e.target.id,
      filters: this.props.filters,
      bntTime: selectedTime
    })
    this.setState({
      selectedTime
    })
  }

  onInputMouseUp (e) {
    let dateString = makeDateString(this.state.day, this.state.hour, this.state.minute)
    let selectedTime = moment(dateString)
    redis.add('sliderMoved', {
      date: moment().format(),
      eventType: 'mouseup',
      target: e.target.id,
      filters: this.props.filters,
      bntTime: selectedTime
    })
    this.setState({
      selectedTime
    })
  }

  handleDayChange (e) {
    this.setState({
      day: e.target.value
    })
  }

  handleHourChange (e) {
    this.setState({
      hour: e.target.value
    })
  }

  handleMinuteChange (e) {
    this.setState({
      minute: e.target.value
    })
  }

  onOfficeClear (e) {
    this.refs.BNT.clearOffices()
    redis.add('officesCleared', {
      date: moment().format(),
      eventType: 'click',
      target: e.target.id,
      x: e.pageX,
      y: e.pageY,
      filters: this.props.filters
    })
    this.props.clearFilter('SourceIP')
  }

  officeEnter (e) {
    redis.add('officeMouseEnter', {
      date: moment().format(),
      eventType: 'mouseenter',
      target: e.target.id,
      x: e.pageX,
      y: e.pageY,
      filters: this.props.filters
    })
  }

  onOfficeClick (e, d, i) {
    redis.add('officeClicked', {
      date: moment().format(),
      eventType: 'click',
      target: e.target.id,
      x: e.pageX,
      y: e.pageY,
      filters: this.props.filters
    })
    this.props.toggleFilter({
      'SourceIP': [d.IP]
    })
  }

  toggleSelected (e) {
    // Dumb and not returning as bool form . . .
    let v = (e.target.value === 'true')
    this.setState({
      showSelected: !v
    })
    redis.add('tableToggleSelected', {
      date: moment().format(),
      eventType: 'click',
      target: e.target.id,
      setTo: !v,
      x: e.pageX,
      y: e.pageY,
      filters: this.props.filters
    })
  }

  onRowMouseOver (e, d, i) {
    redis.add('rowMouseOver', {
      date: moment().format(),
      eventType: 'mouseover',
      target: 'row: ' + i + ' data: ' + d.AccessTime,
      x: e.pageX,
      y: e.pageY,
      filters: this.props.filters
    })
  }

  onRowClick (e, d, i) {
    if (e.shiftKey) {
      let selectedEvents = this.state.selectedEvents
      if (selectedEvents.includes(d)) {
        selectedEvents.splice(selectedEvents.indexOf(d), 1)
      } else {
        selectedEvents.push(d)
      }
      this.setState({
        selectedEvents
      }, this.refs.ipTable.forceUpdate())
    }

    redis.add('rowClicked', {
      date: moment().format(),
      eventType: (e.shiftKey) ? 'shiftClick' : 'click',
      target: 'row: ' + i + ' data: ' + d.AccessTime,
      x: e.pageX,
      y: e.pageY,
      filters: this.props.filters
    })
  }

  onColumnClick (e, d, i) {
    redis.add('accessTimeClicked', {
      date: moment().format(),
      eventType: 'click',
      target: 'row: ' + i + ' data: ' + d.AccessTime,
      x: e.pageX,
      y: e.pageY,
      filters: this.props.filters
    })
    this.setState({
      selectedTime: d.AccessTime,
      day: d.AccessTime.date(),
      hour: d.AccessTime.hour(),
      minute: d.AccessTime.minute()
    })
  }

  onGraphNodeEnter (e, d) {
    redis.add('graphNodeMouseEnter', {
      date: moment().format(),
      eventType: 'mouseenter',
      target: 'graphNode',
      nodeId: d,
      x: e.pageX,
      y: e.pageY,
      filters: this.props.filters
    })
  }

  onHistogramClick (e, d) {
    let date = moment(d.x0)
    redis.add('histogramBarClick', {
      date: moment().format(),
      eventType: 'click',
      target: 'histogramBar',
      barCount: d.length,
      x: e.pageX,
      y: e.pageY,
      filters: this.props.filters
    })
    this.setState({
      selectedTime: date,
      day: date.date(),
      hour: date.hour(),
      minute: date.minute()
    })
  }

  onHistogramMouseEnter (e, d) {
    redis.add('histogramBarMouseEnter', {
      date: moment().format(),
      eventType: 'mouseenter',
      target: 'histogramBar',
      barCount: d,
      x: e.pageX,
      y: e.pageY,
      filters: this.props.filters
    })
  }

  onHistogramBrushStart (e, range) {
    redis.add('histogramBrushStart', {
      date: moment().format(),
      eventType: 'brushStart',
      target: 'histogramBrush',
      range: range,
      x: e.pageX,
      y: e.pageY,
      filters: this.props.filters
    })
  }

  onHistogramBrushEnd (e, range) {
    redis.add('histogramBrushEnd', {
      date: moment().format(),
      eventType: 'brushEnd',
      target: 'histogramBrush',
      range: range,
      x: e.pageX,
      y: e.pageY,
      filters: this.props.filters
    })
    let accessTimeFilter = {
      'AccessTime': range
    }

    accessTimeFilter.AccessTime.isRange = true
    this.props.updateFilter(accessTimeFilter)
  }

  render () {
    let selectedTimeDisplay = makeDateString(this.state.day, this.state.hour, this.state.minute)
    selectedTimeDisplay = moment(selectedTimeDisplay).format('dddd') + ' ' + selectedTimeDisplay

    let detailXDomain = typeof this.props.filters.AccessTime === 'undefined'
      ? [1199202029276, 1201835254922]
      : this.props.filters.AccessTime

    let windowHeight = window.innerHeight
    let detailHistogramHeight = (windowHeight / 2) * (3 / 5)
    let overviewHistogramHeight = (windowHeight / 2) * (2 / 5)
    let badgeNetworkHeight = ((windowHeight) / 2) * (2 / 5)
    let networkGraphHeight = (windowHeight / 2) - 42
    let ipData = this.state.showSelected
      ? this.state.selectedEvents
      : this.props.ipDataFiltered
    return (
      <div id='mainPage'>
        <div className='row'>
          <div className='seven columns'>
            <Div id='detailHistogram' className='row'>
              <Histogram data={this.props.ipDataFiltered}
                xDomain={detailXDomain} tooltip
                margin={{top: 8, left: 55, bottom: 20, right: 0}}
                yLabel='Event Count' autoWidth height={detailHistogramHeight}
                onMouseEnter={this.onHistogramMouseEnter} onClick={this.onHistogramClick}
                xAxisTicks={12} xAxisTickFunction={this.detailXAxisTickFunc} />
            </Div>
            <Div id='overviewHistogram' className='row'>
              <Histogram data={this.props.ipData}
                margin={{top: 0, left: 55, bottom: 20, right: 0}}
                yLabel='Event Count' xLabel='Access Time'
                autoWidth height={overviewHistogramHeight} brushable
                xDomain={[1199202029276, 1201835254922]}
                xAxisTicks={29} tooltip
                onBrushStart={this.onHistogramBrushStart}
                onBrushEnd={this.onHistogramBrushEnd} />
            </Div>
            <Div id='networkGraph'>
              <SimpleNetworkGraph
                onMouseEnter={this.onGraphNodeEnter}
                data={this.props.ipDataFiltered}
                height={networkGraphHeight} autoWidth />
            </Div>
          </div>
          <div className='five columns'>
            <Div id='badgeNetworkSelectedTime'>
              <span>{selectedTimeDisplay}</span>
            </Div>
            <Div id='badgeNetworkDayInput' className='badgeNetworkInput'>
              <span>{'Day: '}</span>
              <input type='range' id='daySlider' onMouseUp={this.onInputMouseUp} onKeyUp={this.onKeyUp} onChange={this.handleDayChange} value={this.state.day} min='1' max='31' step='1' />
            </Div>
            <Div id='badgeNetworkHourInput' className='badgeNetworkInput'>
              <span>{'Hour: '}</span>
              <input type='range' id='hourSlider' onMouseUp={this.onInputMouseUp} onKeyUp={this.onKeyUp} onChange={this.handleHourChange} value={this.state.hour} min='0' max='23' step='1' /> <br />
            </Div>
            <Div id='badgeNetworkMinuteInput' className='badgeNetworkInput'>
              <span>{'Minute: '}</span>
              <input type='range' id='minuteSlider' onMouseUp={this.onInputMouseUp} onKeyUp={this.onKeyUp} onChange={this.handleMinuteChange} value={this.state.minute} min='0' max='59' step='1' /> <br />
            </Div>
            <Div id='badgeNetwork'>
              <BadgeNetwork
                ref='BNT'
                employeeData={this.props.employeeData}
                selectedTime={this.state.selectedTime}
                filters={this.props.filters}
                className='badgeNetwork'
                autoWidth height={badgeNetworkHeight}
                onMouseEnter={this.officeEnter}
                onClick={this.onOfficeClick} />
            </Div>
            <Div id='badgeNetworkKey' className='badgeNetworkKey'>
              <Div id='badgeNetworkKeySquareWhite' className='square' style={{background: '#636363'}} />
              <Div id='badgeNetworkKeyLabelWhite' className='label'>no prox log</Div>
              <Div id='badgeNetworkKeySquareGreen' className='square' style={{background: '#41ab5d'}} />
              <Div id='badgeNetworkKeyLabelGreen' className='label'>prox-in-building OR prox-out-classified</Div>
              <Div id='badgeNetworkKeySquareBlue' className='square' style={{background: '#4292c6'}} />
              <Div id='badgeNetworkKeyLabelBlue' className='label'>prox-in-classified</Div>
              <Div id='badgeNetworkClear' className='badgeNetworkClear'>
                <a id='clearOffices' onClick={this.onOfficeClear} style={{float: 'right'}}>Clear</a>
              </Div>
            </Div>
            <Div id='socketInfo'>
              <MiscInfo />
            </Div>
            <Div id='ipTableToggleSelected' className='row'>
              <span>Show Selected Events: </span>
              <input id='ipTableToggle' type='checkbox' onChange={this.toggleSelected} value={this.state.showSelected} />
            </Div>
            <Div id='ipTable' className='row'>
              <IpTable
                ref='ipTable'
                onRowClick={this.onRowClick}
                onRowMouseOver={this.onRowMouseOver}
                onColumnClick={this.onColumnClick}
                showSelected={this.state.showSelected}
                selectedData={this.state.selectedEvents}
                data={ipData}
                filters={this.props.filters}
                className='twelve columns ipTable' />
            </Div>
          </div>
        </div>
      </div>
    )
  }
}

GridView.defaultProps = {
  toggleFilter: () => {},
  updateFilter: () => {},
  clearFilter: () => {},
  ipData: [],
  proxData: [],
  employeeData: [],
  ipDataFiltered: [],
  proxDataFiltered: [],
  employeeDataFiltered: []
}

GridView.propTypes = {
  toggleFilter: PropTypes.func,
  updateFilter: PropTypes.func,
  clearFilter: PropTypes.func,
  ipData: PropTypes.array,
  proxData: PropTypes.array,
  employeeData: PropTypes.array,
  ipDataFiltered: PropTypes.array,
  proxDataFiltered: PropTypes.array,
  employeeDataFiltered: PropTypes.array,
  filters: PropTypes.any
}

const mapStateToProps = (state) => {
  return {
    ipData: state.vast.ipData,
    proxData: state.vast.proxData,
    employeeData: state.vast.employeeData,
    ipDataFiltered: state.vast.ipDataFiltered,
    proxDataFiltered: state.vast.proxDataFiltered,
    employeeDataFiltered: state.vast.employeeDataFiltered,
    filters: state.vast.filters
  }
}

const mapDispatchToProps = {
  toggleFilter,
  updateFilter,
  clearFilter
}

export default connect(mapStateToProps, mapDispatchToProps)(GridView)
