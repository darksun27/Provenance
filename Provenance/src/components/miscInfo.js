import React, { PropTypes } from 'react'

class MiscInfo extends React.Component {
  render () {
    return (
      <div className={this.props.className}>
        <span style={{fontWeight: 'bold'}}>Prox Info</span>
        <p>Employees are REQUIRED to card into and out of the classified area. Though they may piggyback into the building. No logs are kept of employees leaving.</p>
        <span style={{fontWeight: 'bold'}}>Socket Info</span>
        <dl>
          <dt>25</dt>
          <dd>Used for Simple Mail Transfer Protocol (SMTP). Generally for relaying emails.</dd>
          <dt>80</dt>
          <dd>Used for Hypertext Transfer Protocol (HTTP). Generally used for web pages.</dd>
          <dt>8080</dt>
          <dd>Popular alternative to port 80 for offering web services. Above the restricted well known service port range (ports 1-1023)</dd>
        </dl>
      </div>
    )
  }
}

MiscInfo.defaultProps = {
  className: ''
}

MiscInfo.propTypes = {
  className: PropTypes.string
}

export default MiscInfo
