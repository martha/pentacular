import React from 'react';
import ReactDOM from 'react-dom';
import Tone from 'tone';
import './index.css';

var numRows = 16;
var numCols = 16;
var synth = new Tone.PolySynth(numRows).toMaster();  
// todo numRows needs to get updated here when it's updated in general too
var loop;

function Square(props) {
  var c = "square"
  if (props.isActive) {
    c = "square on"
  }
  return (
    <button className={c} onClick={props.onClick}></button>
  );
}

function StartButton(props) {
  return (
    <button onClick={
      function() {
        console.log('Starting loop');
        if (Tone.Transport.state !== 'started') {
          Tone.Transport.start();
        } else {
          loop.start();
        }
      }
    }>Start</button>
  );
}

function StopButton(props) {
  return (
    <button onClick={
      function() {
        console.log('Stopping loop');
        loop.stop();
      }
    }>Stop</button>
  );
}

class Board extends React.Component {
  constructor() {
    super();

    var pitches = Array(numRows * numCols).fill("C4");
    for (var i = 0; i < numRows * numCols; i++) {
      pitches[i] = getPitch(i);
    }

    this.state = {
      squares: Array(numRows * numCols).fill(false),
      pitches: pitches,
    };

    this.createLoop();
  }

  handleClick(i) {
    const squares = this.state.squares.slice();
    if (squares[i]) {
      squares[i] = false;
    } else {
      squares[i] = true;
    }
    // synth.triggerAttackRelease(this.state.pitches[i], "8n");
    this.setState({squares: squares});
  }

  renderSquare(i) {
    return <Square 
      isActive={this.state.squares[i]} 
      onClick={() => this.handleClick(i)}
      key={'square' + i} 
    />;
  }

  render() {
    var rows = [];
    for (var i = 0; i < numRows; i++) {
      var cols = [];
      for (var j = 0; j < numCols; j++) {
        cols.push(this.renderSquare(numRows * i + j));
      }
      rows.push(
        <div className="board-row" key={'row' + i}>{cols}</div>
      )
    }

    return (
      <div>{rows}</div>
    );
  }

  createLoop() {
    var that = this;
    console.log('Creating loop');
    var columns = Array(numCols).fill(0);
    for (var i = 0; i < numCols; i++) {
      columns[i] = i;
    }

    loop = new Tone.Sequence(function(time, col){
      var pitchesToPlay = [];
      for (var row = 0; row < numRows; row++){
        if (that.state.squares[numRows * row + col] === true){
          pitchesToPlay.push(that.state.pitches[numRows * row + col]);
          // slightly randomized velocities
          // var vel = Math.random() * 0.5 + 0.5;
          // keys.start(this.state.pitches[numRows * row + col], time, 0, "32n", 0, vel);
        }
      }
      synth.triggerAttackRelease(pitchesToPlay, "32n");
    }, columns, "16n").start(0);
    Tone.Transport.bpm.value = 80;
  }
}

class Pentacular extends React.Component {
  render() {
    return (
      <div className="pentacular">
        <div className="pentacular-board">
          <Board />
        </div>
        <div className="pentacular-info">
          <StartButton/>
          <StopButton/>
          <div>{/* status */}</div>
          <ol>{/* TODO */}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Pentacular />,
  document.getElementById('root')
);

function getPitch(i) {
  var y = Math.floor(i/numRows);
  y = -y + 15;
  var octave = 3 + Math.floor(y/5);
  var note;
  switch (y % 5) {
    case 1:
      note = "D";
      break;
    case 2:
      note = "F";
      break;
    case 3:
      note = "G";
      break;
    case 4:
      note = "A";
      break;
    default:  // case 0
      note = "C";
      break;
  }
  return note + octave;
}
