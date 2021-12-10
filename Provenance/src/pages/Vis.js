import React from 'react'

import {data} from './CPV-A';
import {eyeData} from './cpv-aeye'
import { slide as Menu } from "react-burger-menu";

import GridView from '../views/GridView'
import Notes from './notes'

import imageb from './bm.png'
import image from './m.png'
import imagef from './gm.png'

import imageb1 from './bc.jpg'
import image1 from './rc.png'
import imagef1 from './gc.png'

import nicon from './notes-icon.png'

class Vis extends React.Component {
  constructor() {
    super()
    this.state = {
      sliderValue: 1
    }
  }

  updateSliderValue(value) {
    this.setState({
      sliderValue: value
    });
  }

  computeTrail() {
    let trail = [];
    let backwardTrail = 5 < this.state.sliderValue-1 ? 5 : this.state.sliderValue-1;
    let forwardTrail = 5 < data.length-this.state.sliderValue ? 5 : data.length-this.state.sliderValue;
    if(data[this.state.sliderValue-1].eventType == "click") {
      let element = document.querySelector(".nextBtn")
      console.log(element);
      element.dispatchEvent(
        new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true,
            buttons: 1
        })
      )
      element.dispatchEvent(
        new MouseEvent('mouseup', {
            view: window,
            bubbles: true,
            cancelable: true,
            buttons: 1
        })
      )
    }
    let i = 1;
    while(i <= backwardTrail) {
      trail.push(<div style={{position:"absolute", top:data[this.state.sliderValue-1-i].y, left:data[this.state.sliderValue-1-i].x}}>
        <img src={imageb} style={{height:'30px', width:'30px', opacity:'0.5'}}/>
      </div>);
      i++;
    }
    trail.push(<div style={{position:"absolute", top:data[this.state.sliderValue-1].y, left:data[this.state.sliderValue-1].x}}>
        <img src={image} style={{height:'30px', width:'30px', opacity:'1'}}/>
      </div>);
    i = 1
    while(i <= forwardTrail) {
      trail.push(<div style={{position:"absolute", top:data[this.state.sliderValue-1+i].y, left:data[this.state.sliderValue-1+i].x}}>
        <img src={imagef} style={{height:'30px', width:'30px', opacity:'0.5'}}/>
      </div>);
      i++;
    }
    return trail;
  }

  computeTrailEye() {
    let trail = [];
    let backwardTrail = 5 < this.state.sliderValue-1 ? 5 : this.state.sliderValue-1;
    let forwardTrail = 5 < eyeData.length-this.state.sliderValue ? 5 : eyeData.length-this.state.sliderValue;
    let i = 1;
    while(i <= backwardTrail) {
      trail.push(<div style={{position:"absolute", top:eyeData[this.state.sliderValue-1-i].y, left:eyeData[this.state.sliderValue-1-i].x}}>
        <img src={imageb1} style={{height:'30px', width:'30px', opacity:'0.5'}}/>
      </div>);
      i++;
    }
    trail.push(<div style={{position:"absolute", top:eyeData[this.state.sliderValue-1].y, left:eyeData[this.state.sliderValue-1].x}}>
        <img src={image1} style={{height:'30px', width:'30px', opacity:'0.9'}}/>
      </div>);
    i = 1
    while(i <= forwardTrail) {
      trail.push(<div style={{position:"absolute", top:eyeData[this.state.sliderValue-1+i].y, left:eyeData[this.state.sliderValue-1+i].x}}>
        <img src={imagef1} style={{height:'30px', width:'30px', opacity:'0.5'}}/>
      </div>);
      i++;
    }
    return trail;
  }

  render () {
    return (
      <div id="pparent">
        <div id="pcontents">
          <div className='container-fluid'>
            <div className='col'>
              <GridView />
            </div>
            <div className='col'>
              <Notes/>
            </div>
          </div>
          {this.computeTrail()}
          <div style={{position:'fixed', bottom:'0', height:'40px', width:'100%'}}>
            <div className="slidecontainer">
              <input style={{width:'95%'}} type="range" min="1" max={data.length} onChange={(event) => this.updateSliderValue(event.target.value)}/>
            </div>
          </div>
          {this.computeTrailEye()}
        </div>
      </div>
    )
  }
}

export default Vis
