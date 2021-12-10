import React from 'react'
import { Link } from 'react-router'

import histogram from '../pictures/histogram.png'
import bnt from '../pictures/bnt.png'
import graph from '../pictures/graph.png'
import table from '../pictures/table.png'

class Info extends React.Component {
  render () {
    return (
      <div className='container'>
        <div className='row'>
          <h5>Event Histogram</h5>
          <p>This is the event histogram. The bottom histogram shows the count for ip traffic events from the beginning to the end of the month. This histogram allows brushing which controls the more detailed histogram above to get a finer view of traffic flow for the brushed time period.</p>
          <img src={histogram} />
          <h5>Prox Card Viewer</h5>
          <p>This is the prox card viewer, it shows employee prox card information. The time viewed is control via the sliders for the day, hour, minute. White indicates their is no log of them entering the office at the given time. Green indicates they are in their office or out of the classified area and blue indicates that they are currently in the classified area. The first number indicates the office of an employee and the second indicates the employees number. Also remember that it is possible for employees to piggyback ie following behind someone without swiping their own prox card to gain access to part of the building.</p>
          <img src={bnt} />
          <p>Both the histogram and prox-card viewer control the data viewed in the graph and table</p>
          <h5>Network Graph</h5>
          <p>This is a network graph that shows employee ips and the destination ips they have communicated with. All employee IPs start with the prefix '37.170.100.x' and the suffix of the IP is an employee ID eg employee with ID 24 would have an IP of '37.170.100.24'.</p>
          <img src={graph} />
          <h5>Event Table</h5>
          <p>This table gives a detailed listing of all ip events.</p>
          <img src={table} />
          <h5>Socket Info</h5>
          <p>The following is an explanation of the 3 sockets you will see within the event table.</p>
          <dl>
            <dt>25</dt>
            <dd>Used for Simple Mail Transfer Protocol (SMTP), an Internet standard for electronic mail (email) transmission. Mail applications typically use SMTP only for sending messages to a mail server for relaying emails</dd>
            <dt>80</dt>
            <dd>Used for Hypertext Transfer Protocol (HTTP), an application protocol for distributed, collaborative, hypermedia information systems (webpages in the browser).</dd>
            <dt>8080</dt>
            <dd>Popular alternative to port 80 for offering web services. Above the restricted well known service port range (ports 1-1023)</dd>
          </dl>
          <h5>Task</h5>
          <p>You will be given 1 hour once you hit start to find as many suspicious events as possible.</p>
        </div>
        <div className='row'>
          <h5><Link to='/vis'>START</Link></h5>
        </div>
      </div>
    )
  }
}

export default Info
