import React, { Component } from 'react'
import dragDrop from 'drag-drop'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import injectTapEventPlugin from 'react-tap-event-plugin'
injectTapEventPlugin()
import timeClient from './TimeDiffClient'
import control from './Control'

import Dialog from 'material-ui/Dialog'
import TextField from 'material-ui/TextField'
import {RaisedButton, FlatButton} from 'material-ui'
import Slider from 'material-ui/Slider'
import {List, ListItem} from 'material-ui/List'
import MusicNoteIcon from 'react-material-icons/icons/image/music-note'
import SettingsIcon from 'react-material-icons/icons/action/settings'
import logo from './logo.svg'
import './App.css'

const sound = new Howl({ // eslint-disable-line
  src: ['./see-you-on-the-other-side.mp3']
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
      controlsClass: 'hidden',
      settingsModalOpen: false,
      timeServer: '192.168.0.85:8001',
      controlServer: '192.168.0.85:9090',
      maxRequests: 150
    }
    this.songs = [
      {
        file: './see-you-on-the-other-side.mp3',
        title: 'See You On The Other Side',
        author: 'Ozzy Osbourne'
      },
      {
        file: './my-little-man.mp3',
        title: 'My Little Man',
        author: 'Ozzy Osbourne'
      },
      {
        file: './old-la-tonight.mp3',
        title: 'Old La Tonight',
        author: 'Ozzy Osbourne'
      },
      {
        file: './perry-mason.mp3',
        title: 'Perry Mason',
        author: 'Ozzy Osbourne'
      }
    ]
    this.selectedSong = this.songs[0]
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
      sync: (
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
      preloading: (
        <p className="App-intro">
          <b>Preloading:</b> {message}
        </p>
      ),
      stop: (
        <p className="App-intro">
          {message}
        </p>
      ),
      selectedSong: (
        <p className="App-intro">
          <b>Selected Song:</b> {message.title} by {message.author}
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
    this.setDropArea()
  }

  setDropArea () {
    dragDrop('#dropTarget', function (files, pos) {
      console.log('Here are the dropped files', files)
      console.log('Dropped at coordinates', pos.x, pos.y)
    })
  }

  synchronize () {
    timeClient
      .connect(`ws://${this.state.timeServer}`)
      .init(this.state.maxRequests)
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
      .connect(`ws://${this.state.controlServer}`)
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
          this.setStatus('preloading', `"${this.selectedSong.title}" by ${this.selectedSong.author}`)
          this.forceFillPlaybackBuffer(() => {
            sound.play()
            this.setStatus('playing', `"${this.selectedSong.title}" by ${this.selectedSong.author}`)
          })
        }, startDiff)

        this.setStatus('willPlay', `"${this.selectedSong.title}" by ${this.selectedSong.author}`)
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
      .onSelectSong((data) => {
        console.log('CONTROLLER selected a SONG:', data)
        this.onSelectSong(data.value)
      })
  }

  play () {
    const startAt = (new Date()).getTime() + this.playDelay
    control.play({startAt})

    this.setStatus('willPlay', `"${this.selectedSong.title}" by ${this.selectedSong.author}`)
    setTimeout(() => {
      this.setStatus('preloading', `"${this.selectedSong.title}" by ${this.selectedSong.author}`)
      this.forceFillPlaybackBuffer(() => {
        sound.play()
        this.setStatus('playing', `"${this.selectedSong.title}" by ${this.selectedSong.author}`)
      })
    }, this.playDelay)
  }

  forceFillPlaybackBuffer (callback) {
    const vol = sound.volume()
    sound.volume(0)
    sound.play()

    setTimeout(() => {
      sound.stop()
      sound.volume(vol)
    }, 1000)

    setTimeout(() => {
      callback()
    }, 1500)
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

  selectSong (song) {
    console.log('-- SELECTED SONG:', song)
    control.selectSong({value: song})
    sound = new Howl({ // eslint-disable-line
      src: [song.file]
    })
    this.selectedSong = song
    this.setStatus('selectedSong', song)
  }

  onSelectSong (song) {
    sound = new Howl({ // eslint-disable-line
      src: [song.file]
    })
    this.selectedSong = song
    this.setStatus('selectedSong', song) 
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

  getSongsList () {
    const songs = this.songs.map((song) => {
      return (
        <ListItem
          primaryText={`${song.title} by ${song.author}`}
          leftIcon={<MusicNoteIcon />}
          onClick={() => this.selectSong(song)}
        />
      )
    })

    return (
      <List>
        {songs}
      </List>
    )
  }

  onSettingsModalClose () {
    console.log('server modal closed')
    this.setState({settingsModalOpen: false})
  }

  openSettingsModal () {
    this.setState({settingsModalOpen: true})
  }

  closeSettingsModal () {
    this.setState({settingsModalOpen: false})
  }

  reconnect () {
    console.log('Reconnecting...')
    this.closeSettingsModal()
    this.setStatus('sync')
    this.synchronize()
  }

  render() {
    return (
      <MuiThemeProvider>
        <div className="App" id="dropTarget">
          <div className="App-header">
            <img src={logo} className="App-logo" alt="logo" onDoubleClick={() => this.showHideControls() } />
            <h2>Audio Sync</h2>
          </div>
          
          {this.state.status}

          <SettingsIcon
            className='top-right icon-button'
            style={{color: 'gray'}}
            onClick={() => this.openSettingsModal()}
          />

          <Dialog
            title="Settings"
            actions={[
              <FlatButton onClick={() => this.closeSettingsModal()}>Close</FlatButton>,
              <FlatButton onClick={() => this.reconnect()}>Reconnect</FlatButton>
            ]}
            modal={false}
            open={this.state.settingsModalOpen}
            onRequestClose={() => this.onSettingsModalClose()}
          >
            <TextField
              style={{width: '100%'}}
              floatingLabelText="Time Server URL"
              value={this.state.timeServer}
              onChange={(event, value) => this.setState({timeServer: value})}
            />
            <TextField
              style={{width: '100%'}}
              floatingLabelText="Control Server URL"
              value={this.state.controlServer}
              onChange={(event, value) => this.setState({controlServer: value})}
            />
            <TextField
              style={{width: '100%'}}
              floatingLabelText="Requests to Analyze"
              value={this.state.maxRequests}
              onChange={(event, value) => this.setState({maxRequests: value})}
            />
          </Dialog>

          <div className="App-content">
            <div className={this.state.controlsClass}>
              <RaisedButton onClick={() => this.play()}>Play</RaisedButton>
              <RaisedButton onClick={() => this.stop()}>Stop</RaisedButton>

              <Slider defaultValue={0.5} onChange={(event, value) => this.volume(value)} />

              <div className="songs">
                {this.getSongsList()}
              </div>
            </div>
          </div>
        </div>
      </MuiThemeProvider>
    )
  }
}

export default App
