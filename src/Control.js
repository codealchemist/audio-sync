import Store from './Store'

class Control {
  constructor() {
    this.uuid = null
    this.store = new Store('control')
    this.isMaster = false
    this.onErrorCallback = null
    this.events = {
      uuid: (uuid) => {
        this.setUuid(uuid)

        // Joining process allows new clients to start playback
        // when other clients are already playing, in sync with them.
        this.join({uuid: this.uuid})

        if (typeof this.onUuidCallback !== 'function') return
        this.onUuidCallback(uuid)
      },
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
      },
      join: (data) => {
        if (typeof this.onJoinCallback !== 'function') return
        this.onJoinCallback(data)
      },
      joinAt: (data) => {
        if (data.uuid !== this.uuid) {
          log('SKIPPING joinAt, not for me.')
          return
        }
        if (typeof this.onJoinAtCallback !== 'function') return
        this.onJoinAtCallback(data)
      }
    }
  }

  connect (controlServerUrl) {
    this.ws = new WebSocket(controlServerUrl)
    this.init()
    return this
  }

  setUuid (uuid) {
    const existingUuid = this.store.get('uuid')
    if (existingUuid) {
      log('had UUID:', existingUuid)
      this.uuid = existingUuid
      return
    }

    log('got NEW UUID:', uuid)
    this.store.set('uuid', uuid)
    this.uuid = uuid
  }

  resetUuid () {
    this.store.set('uuid', null)
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

  onJoin (callback) {
    this.onJoinCallback = callback
    return this
  }

  onJoinAt (callback) {
    this.onJoinAtCallback = callback
    return this
  }

  onUuid (callback) {
    this.onUuidCallback = callback
    return this
  }

  send (message) {
    const data = JSON.stringify(message)
    this.ws.send(data)
  }

  join (data) {
    this.send({type: 'join', data})
    return this
  }

  joinAt (data) {
    this.send({type: 'joinAt', data})
    return this
  }

  play (data) {
    this.send({type: 'play', data})
    this.isMaster = true // Will answer join requests.
    return this
  }

  stop () {
    this.send({type: 'stop'})
    return this
  }

  pause () {
    this.send({type: 'pause'})
    return this
  }

  volume (data) {
    this.send({type: 'volume', data})
    return this
  }

  selectSong (data) {
    this.send({type: 'selectSong', data})
    return this
  }

  reload (data) {
    this.send({type: 'reload', data})
    return this
  }
}

function log () {
  console.log('[ CONTROL ]-->', ...arguments)
}

const control = new Control()
export default control
