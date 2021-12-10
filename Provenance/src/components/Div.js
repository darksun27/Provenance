// NOTE: This is just a div binded for easy capture of onEnter
import React, { PropTypes } from 'react'
import moment from 'moment'

import redis from '../redis'

class Div extends React.Component {
  constructor (props) {
    super(props)

    this.onMouseEnter = this.onMouseEnter.bind(this)
  }

  onMouseEnter (e) {
    redis.add('mouseEnter', {
      date: moment().format(),
      eventType: 'mouseenter',
      target: e.target.id,
      x: e.pageX,
      y: e.pageY
    })
  }

  render () {
    let { children, ...props } = this.props
    return (
      <div {...props} onMouseEnter={this.onMouseEnter}>
        {children}
      </div>
    )
  }
}

Div.defaultProps = {
  children: ''
}

Div.propTypes = {
  children: PropTypes.any
}

export default Div
