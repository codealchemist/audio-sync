import React, { Component } from 'react'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import injectTapEventPlugin from 'react-tap-event-plugin'
injectTapEventPlugin()
import timeClient from './TimeDiffClient'
import control from './Control'

import RaisedButton from 'material-ui/RaisedButton'
import Slider from 'material-ui/Slider'
import logo from './logo.svg'
import './App.css'

const sound = new Howl({ // eslint-disable-line
  src: ['./see-you-on-the-other-side.mp3'],
  preload: true
})

const quotes = [
  `"The two most powerful warriors are patience and time." --Leo Tolstoy`,
  `"If you love life, don't waste time, for time is what life is made up of. --Bruce Lee"`,
  `"They always say time changes things, but you actually have to change them yourself." --Andy Warhol`
]

class App extends Component {
  constructor(props) {
    super(props)
    
    this.state = {
      status: this.getStatusMessage(),
      controlsClass: 'hidden'
    }
    this.hasControls = false
    this.timeDiff = null
    this.playDelay = 5000 // in ms
  }

  getRandomQuote () {
    const index = Math.floor(Math.random() * (quotes.length))
    const quote = quotes[index]
    console.log('-- RANDOM QUOTE:', quote)
    return quote
  }

  getStatusMessage (status = 'default', message = 'Unable to connect to time server.') {
    const statusMessages = {
      default: (
        <p className="App-intro">
          Synchronizing...
        </p>
      ),
      ok: (
        <p className="App-intro">
          <b>Synchronized</b> successfully!
        </p>
      ),
      error: (
        <p className="App-intro">
          <b>ERROR:</b> {message}
        </p>
      ),
      willPlay: (
        <p className="App-intro">
          <b>Wait for:</b> {message}
        </p>
      ),
      playing: (
        <p className="App-intro">
          <b>Playing:</b> {message}
        </p>
      ),
      stop: (
        <p className="App-intro">
          {message}
        </p>
      )
    }

    return statusMessages[status]
  }

  setStatus (status, message) {
    this.setState({
      status: this.getStatusMessage(status, message)
    })
  }

  componentDidMount() {
    this.synchronize()
  }

  synchronize () {
    timeClient
      .connect('ws://192.168.0.120:8080')
      .init()
      .onDiff((diff) => {
        console.log('-'.repeat(80))
        console.log('--- GOT CLOCKS DIFF:', diff)
        console.log('-'.repeat(80))
        this.setStatus('ok')
        this.timeDiff = diff
        this.initControl()
      })
      .onError((error) => {
        console.log('--- WS ERROR:', error)
        this.setStatus('error')
      })
  }

  initControl () {
    control
      .connect('ws://192.168.0.120:9090')
      .onError((error) => {
        console.log('ERROR: Unable to connect to CONTROL server.')
      })
      .onPlay((data) => {
        const localTime = (new Date()).getTime()
        const startAt = data.startAt + this.timeDiff
        const startDiff = startAt - localTime
        console.log('-- GOT PLAY, start at:', startAt)
        console.log(`-- START IN: ${startDiff} ms`)
        setTimeout(() => {
          sound.play()
          this.setStatus('playing', '"See You On The Other Side", by Ozzy Osbourne.')
        }, startDiff)

        this.setStatus('willPlay', '"See You On The Other Side", by Ozzy Osbourne.')
      })
      .onStop(() => {
        sound.stop()
        this.setStatus('stop', this.getRandomQuote())
      })
      .onPause(() => {
        sound.pause()
      })
      .onVolume((data) => {
        sound.volume(data.value)
      })
  }

  play () {
    const startAt = (new Date()).getTime() + this.playDelay
    control.play({startAt})

    this.setStatus('willPlay', '"See You On The Other Side", by Ozzy Osbourne.')
    setTimeout(() => {
      sound.play()
      this.setStatus('playing', '"See You On The Other Side", by Ozzy Osbourne.')
    }, this.playDelay)
  }

  stop () {
    control.stop()
    sound.stop()
    this.setStatus('stop', this.getRandomQuote())
  }

  pause () {
    control.pause()
    sound.pause()
  }

  volume (value) {
    control.volume({value})
    sound.volume(value)
  }

  showHideControls () {
    if (this.hasControls) {
      this.setState({
        controlsClass: 'hidden'
      })
      this.hasControls = false
      return
    }

    this.setState({
      controlsClass: ''
    })
    this.hasControls = true
  }

  render() {
    return (
      <MuiThemeProvider>
        <div className="App">
          <div className="App-header">
            <img src={logo} className="App-logo" alt="logo" onDoubleClick={() => this.showHideControls() } />
            <h2>Audio Sync</h2>
          </div>
          
          {this.state.status}

          <div className="App-content">
            <div className={this.state.controlsClass}>
              <RaisedButton onClick={() => this.play()}>Play</RaisedButton>
              <RaisedButton onClick={() => this.stop()}>Stop</RaisedButton>

              <Slider defaultValue={0.5} onChange={(event, value) => this.volume(value)} />
            </div>
          </div>
        </div>
      </MuiThemeProvider>
    )
  }
}

export default App
