import React, { useState } from "react";

class Notes extends React.Component {
    constructor() {
        super()
        this.state = {
            notesArray: [],
            notesValue: ""
        }
    }
    computeNotes() {
        let notes = []
        for(let i = 0; i < this.state.notesArray.length; i++) {
            notes.push(<div>
                <p>{this.state.notesArray[i]}</p>
            </div>);
        }
        return notes;
    }
    handleTextChange(e) {
        this.setState({
            notesArray: this.state.notesArray,
            notesValue: e.target.value
        });
    }
    handleClick(value) {
        let temp = [...this.state.notesArray, value]
        this.setState({
            notesArray: temp,
            notesValue: ""
        });
    }
    render() {
        return (
            <div>
                {this.computeNotes()}
                <textarea id="w3review" name="w3review" rows="5" cols="20" onChange={(e) => this.handleTextChange(e)} value={this.state.notesValue}>
                </textarea>
                <input type="button" value="Add" onClick={this.handleClick.bind(this,this.state.notesValue)}/>
            </div>
        );
        
    }
}
export default Notes;