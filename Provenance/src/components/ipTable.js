import React, { PropTypes } from 'react'
import moment from 'moment'

import redis from '../redis'

import { Table, Column, Cell } from './table'
import { ipToInt } from '../util'

class HeaderCell extends React.Component {
  constructor (props) {
    super(props)

    this.onClick = this.onClick.bind(this)
  }
  onClick () {
    this.props.onClick(this.props.columnKey)
  }
  render () {
    let { sortBy, sortOrder, columnKey } = this.props
    let symbol = ''
    if (sortBy === columnKey) {
      symbol = sortOrder === 'asc' ? '\u2191' : '\u2193'
    }
    return (
      <Cell>
        <a id={this.props.children} onClick={this.onClick}>{this.props.children + ' ' + symbol}</a>
      </Cell>
    )
  }
}
HeaderCell.propTypes = {
  onClick: PropTypes.func,
  sortBy: PropTypes.string,
  sortOrder: PropTypes.string,
  columnKey: PropTypes.string,
  children: PropTypes.string
}

class TextCell extends React.Component {
  render () {
    let { data, columnKey, ...props } = this.props
    let text = data[columnKey] !== ''
      ? data[columnKey]
      : props.defaultText

    return (
      <Cell data={data} {...props}>
        <span title={text}>{text}</span>
      </Cell>
    )
  }
}
TextCell.propTypes = {
  data: PropTypes.any,
  columnKey: PropTypes.any
}

// For moment based dates
class DateCell extends React.Component {
  render () {
    let { data, columnKey, ...props } = this.props
    let text = data[columnKey] !== ''
      ? data[columnKey]
      : props.defaultText

    return (
      <Cell data={data} {...props}>
        <span title={text}>{text.format()}</span>
      </Cell>
    )
  }
}
DateCell.propTypes = {
  data: PropTypes.any,
  columnKey: PropTypes.any
}

export class ipTable extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      page: 0,
      pageSize: 16,
      sortBy: 'AccessTime',
      sortOrder: 'asc'
    }

    this.prevPage = this.prevPage.bind(this)
    this.nextPage = this.nextPage.bind(this)

    this.updateSort = this.updateSort.bind(this)
  }

  updateSort (sortKey) {
    // If currently selected, flip sortOrder
    if (sortKey === this.state.sortBy) {
      redis.add('headerClicked', {
        date: moment().format(),
        eventType: 'click',
        target: 'header ' + sortKey,
        filters: this.props.filters,
        sortKey: sortKey,
        sortOrder: this.state.sortOrder === 'asc' ? 'desc' : 'asc'
      })
      this.setState({
        page: 0,
        sortOrder: this.state.sortOrder === 'asc' ? 'desc' : 'asc'
      })
    } else {
      redis.add('headerClicked', {
        date: moment().format(),
        eventType: 'click',
        target: 'header ' + sortKey,
        sortKey: sortKey,
        sortOrder: this.state.sortOrder === 'asc' ? 'desc' : 'asc'
      })
      this.setState({
        page: 0,
        sortBy: sortKey,
        sortOrder: 'asc'
      })
    }
  }

  prevPage () {
    redis.add('pageChange', {
      date: moment().format(),
      eventType: 'click',
      target: 'prev button',
      filters: this.props.filters,
      page: this.state.page - 1
    })
    if (this.state.page > 0) {
      this.setState({
        page: this.state.page - 1
      })
    }
  }

  nextPage () {
    redis.add('pageChange', {
      date: moment().format(),
      eventType: 'click',
      target: 'next button',
      filters: this.props.filters,
      page: this.state.page + 1
    })
    let maxPages = Math.floor(this.props.data.length / this.state.pageSize)
    if (this.state.page < maxPages) {
      this.setState({
        page: this.state.page + 1
      })
    }
  }

  componentWillReceiveProps (nextProps, nextState) {
    if (this.props.showSelected !== nextProps.showSelected) {
      this.setState({
        page: 0
      })
    }
  }

  shouldComponentUpdate (nextProps, nextState) {
    return nextProps.data !== this.props.data ||
      nextState.filters !== this.state.filters ||
      nextState.page !== this.state.page ||
      nextState.pageSize !== this.state.pageSize ||
      nextState.sortBy !== this.state.sortBy ||
      nextState.sortOrder !== this.state.sortOrder
  }

  render () {
    // Sort data
    let dataTransform = (d) => +d
    if (this.state.sortBy === 'SourceIP' || this.state.sortBy === 'DestIP') {
      dataTransform = (d) => ipToInt(d)
    }
    let sortedData = this.props.data.sort((a, b) => {
      return this.state.sortOrder === 'asc'
        ? dataTransform(a[this.state.sortBy]) - dataTransform(b[this.state.sortBy])
        : dataTransform(b[this.state.sortBy]) - dataTransform(a[this.state.sortBy])
    })

    // Get page of data
    let start = this.state.page * this.state.pageSize
    let dataSubset = sortedData.slice(start, start + this.state.pageSize)
    return (
      <div className={this.props.className}>
        <Table
          onRowClick={this.props.onRowClick}
          onRowMouseOver={this.props.onRowMouseOver}
          data={dataSubset}
          selectedData={this.props.selectedData}>
          <Column
            columnKey='AccessTime'
            onColumnClick={this.props.onColumnClick}
            header={
              <HeaderCell onClick={this.updateSort}
                sortBy={this.state.sortBy}
                sortOrder={this.state.sortOrder}>
                Access Time
              </HeaderCell>}>
            <DateCell />
          </Column>
          <Column
            columnKey='SourceIP'
            header={
              <HeaderCell onClick={this.updateSort}
                sortBy={this.state.sortBy}
                sortOrder={this.state.sortOrder}>
                Src IP
              </HeaderCell>}>
            <TextCell />
          </Column>
          <Column
            columnKey='DestIP'
            header={
              <HeaderCell onClick={this.updateSort}
                sortBy={this.state.sortBy}
                sortOrder={this.state.sortOrder}>
                Dest IP
              </HeaderCell>}>
            <TextCell />
          </Column>
          <Column
            columnKey='Socket'
            header={
              <HeaderCell onClick={this.updateSort}
                sortBy={this.state.sortBy}
                sortOrder={this.state.sortOrder}>
                Socket
              </HeaderCell>}>
            <TextCell />
          </Column>
          <Column
            columnKey='ReqSize'
            header={
              <HeaderCell onClick={this.updateSort}
                sortBy={this.state.sortBy}
                sortOrder={this.state.sortOrder}>
                Req Size
              </HeaderCell>}>
            <TextCell />
          </Column>
          <Column
            columnKey='RespSize'
            header={
              <HeaderCell onClick={this.updateSort}
                sortBy={this.state.sortBy}
                sortOrder={this.state.sortOrder}>
                Resp Size
              </HeaderCell>}>
            <TextCell />
          </Column>
        </Table>
        <button className='prevBtn' onClick={this.prevPage}>
          Previous
        </button>
        <div className='info'>
          <span>
            {'Page' + ' ' + this.state.page + ' of ' + Math.floor(this.props.data.length / this.state.pageSize)}
          </span>
          <span>
            {' || ' + this.props.data.length + ' results'}
          </span>
        </div>
        <button className='nextBtn' onClick={this.nextPage}>
          Next
        </button>
      </div>
    )
  }
}

ipTable.defaultProps = {
  onColumnClick: () => {},
  onRowClick: () => {},
  onRowMouseOver: () => {},
  className: '',
  filters: {},
  data: [],
  selectedData: [],
  showSelected: false
}

ipTable.propTypes = {
  onColumnClick: PropTypes.func,
  onRowClick: PropTypes.func,
  onRowMouseOver: PropTypes.func,
  className: PropTypes.string,
  filters: PropTypes.any,
  data: PropTypes.array,
  selectedData: PropTypes.array,
  showSelected: PropTypes.bool
}

export default ipTable
