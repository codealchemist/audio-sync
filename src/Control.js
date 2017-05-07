class Control {
  constructor() {
    this.onErrorCallback = null
    this.events = {
      play: (data) => {
        if (typeof this.onPlayCallback !== 'function') return
        this.onPlayCallback(data)
      },
      stop: (data) => {
        if (typeof this.onStopCallback !== 'function') return
        this.onStopCallback(data)
      },
      pause: (data) => {
        if (typeof this.onPauseCallback !== 'function') return
        this.onPauseCallback(data)
      },
      volume: (data) => {
        if (typeof this.onVolumeCallback !== 'function') return
        this.onVolumeCallback(data)
      },
      selectSong: (data) => {
        if (typeof this.onSelectSongCallback !== 'function') return
        this.onSelectSongCallback(data)
      },
      reload: (data) => {
        if (typeof this.onReloadCallback !== 'function') return
        this.onReloadCallback(data)
      }
    }
  }

  connect (controlServerUrl) {
    this.ws = new WebSocket(controlServerUrl)
    this.init()
    return this
  }

  init () {
    this.ws.onopen = () => {
      log('socket open')
    }

    this.ws.onmessage = (event) => {
      log('got message', event)
      const {type, data} = JSON.parse(event.data)
      if (!this.events[type]) return
      this.events[type](data)
    }

    this.ws.onerror = (event) => {
      log('ERROR:', event)
      if (typeof this.onErrorCallback === 'function') {
        this.onErrorCallback(event)
      }
    }

    return this
  }

  onError (callback) {
    this.onErrorCallback = callback
    return this
  }

  onPlay (callback) {
    this.onPlayCallback = callback
    return this
  }

  onStop (callback) {
    this.onStopCallback = callback
    return this
  }

  onPause (callback) {
    this.onPauseCallback = callback
    return this
  }

  onVolume (callback) {
    this.onVolumeCallback = callback
    return this
  }

  onSelectSong (callback) {
    this.onSelectSongCallback = callback
    return this
  }

  onReload (callback) {
    this.onReloadCallback = callback
    return this
  }

  send (message) {
    const data = JSON.stringify(message)
    this.ws.send(data)
  }

  play (data) {
    this.send({type: 'play', data})
  }

  stop () {
    this.send({type: 'stop'})
  }

  pause () {
    this.send({type: 'pause'})
  }

  volume (data) {
    this.send({type: 'volume', data})
  }

  selectSong (data) {
    this.send({type: 'selectSong', data})
  }

  reload (data) {
    this.send({type: 'reload', data})
  }
}

function log () {
  console.log('[ CONTROL ]-->', ...arguments)
}

const control = new Control()
export default control
