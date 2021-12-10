import React, { PropTypes, Children, cloneElement } from 'react'

class Row extends React.Component {
  constructor (props) {
    super(props)

    this.onClick = this.onClick.bind(this)
    this.onMouseOver = this.onMouseOver.bind(this)
  }

  onClick (event) {
    this.props.onClick(event, this.props.data, this.props.index)
  }

  onMouseOver (event) {
    this.props.onMouseOver(event, this.props.data, this.props.index)
  }

  render () {
    let { Component, selectedData, data, children } = this.props
    let cls = ''
    if (selectedData.includes(data)) {
      cls += 'selected'
    }
    return (
      <Component className={cls} onClick={this.onClick} onMouseOver={this.onMouseOver} data={data}>
        {children}
      </Component>
    )
  }
}

Row.defaultProps = {
  onClick: () => {},
  onMouseOver: () => {},
  selectedData: []
}
Row.propTypes = {
  onClick: PropTypes.func,
  onMouseOver: PropTypes.func,
  data: PropTypes.any,
  selectedData: PropTypes.any,
  index: PropTypes.number,
  Component: PropTypes.any,
  children: PropTypes.any
}

class Column extends React.Component {
  constructor (props) {
    super(props)

    this.onClick = this.onClick.bind(this)
    this.onMouseOver = this.onMouseOver.bind(this)
  }

  onClick (event) {
    event.stopPropagation() // Prevent row click handler from firing
    this.props.onColumnClick(event, this.props.data, this.props.columnKey)
  }

  onMouseOver (event) {
    event.stopPropagation() // Prevent row click handler from firing
    this.props.onColumnMouseOver(event, this.props.data, this.props.columnKey)
  }

  render () {
    let { Component, data, index, columnKey, children } = this.props

    let conditionalProp = {}
    if (this.props.onColumnClick !== null) {
      conditionalProp.onClick = this.onClick
    }

    if (this.props.onColumnMouseOver !== null) {
      conditionalProp.onMouseOver = this.onMouseOver
    }

    return (
      <Component {...conditionalProp} className={columnKey}>
        {cloneElement(Children.only(children), {
          data,
          index,
          columnKey
        })}
      </Component>
    )
  }
}

Column.defaultProps = {
  onColumnClick: null,
  onColumnMouseOver: null
}

Column.propTypes = {
  onColumnClick: PropTypes.func,
  onColumnMouseOver: PropTypes.func,
  Component: PropTypes.any,
  children: PropTypes.any,
  index: PropTypes.any,
  data: PropTypes.any,
  columnKey: PropTypes.string
}

class Cell extends React.Component {
  render () {
    let { Component, children } = this.props
    return (
      <Component>
        {children}
      </Component>
    )
  }
}

Cell.defaultProps = {
  Component: 'span'
}

Cell.propTypes = {
  Component: PropTypes.any,
  className: PropTypes.any,
  children: PropTypes.any
}

class Table extends React.Component {
  render () {
    let { RowComponent, onRowClick, onRowMouseOver, children, selectedData, data } = this.props
    return (
      <table>
        <thead>
          <Row Component='tr'>
            {children.map((e, i) => {
              return (
                <Column key={i} Component='th' columnKey={e.props.columnKey}>
                  {cloneElement(e.props.header, {
                    key: e.props.columnKey
                  })}
                </Column>
              )
            })}
          </Row>
        </thead>
        <tbody>
          {data.map((d, i) => {
            return (
              <Row key={i} Component={RowComponent} onClick={onRowClick} onMouseOver={onRowMouseOver} selectedData={selectedData} data={d} index={i}>
                {children.map((e, j) => {
                  return cloneElement(e, {
                    key: j,
                    Component: 'td',
                    data: d,
                    index: i
                  })
                })}
              </Row>
            )
          })}
        </tbody>
      </table>
    )
  }
}

Table.defaultProps = {
  data: [],
  selectedData: [],
  RowComponent: 'tr',
  onRowClick: () => {},
  onRowMouseOver: () => {}
}

Table.propTypes = {
  RowComponent: PropTypes.any,
  onRowClick: PropTypes.any,
  onRowMouseOver: PropTypes.any,
  children: PropTypes.any,
  data: PropTypes.array,
  selectedData: PropTypes.array
}

export { Table, Row, Column, Cell }
