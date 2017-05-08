class TimeDiffClient {
  constructor (timeServerUrl) {
    this.events = {
      time: (value) => this.onTime(value)
    }
    this.timesCollection = []
    this.times = {
      request: null, // time when client sends the request
      response: null, // time when client receives the response
      delay: null, // diff between request and response
      server: null // local server time
    }
    this.iterations = 0
    this.maxIterations = 15
    this.precision = 2
    this.minPrecision = 5
    this.onDiffCallback = null
    this.onErrorCallback = null
  }

  connect (timeServerUrl) {
    this.ws = new WebSocket(timeServerUrl)
    return this
  }

  init (maxIterations) {
    this.maxIterations = maxIterations || this.maxIterations
    this.ws.onopen = () => {
      log('socket open')

      // Send local type to server.
      // Server will respond with its time.
      this.request()
    }

    this.ws.onmessage = (event) => {
      const {type, value} = JSON.parse(event.data)
      if (!this.events[type]) return
      this.events[type](value)
    }

    this.ws.onerror = (event) => {
      log('ERROR:', event)
      if (typeof this.onErrorCallback === 'function') {
        this.onErrorCallback(event)
      }
    }

    return this
  }

  onDiff (callback) {
    this.onDiffCallback = callback
    return this
  }

  onError (callback) {
    this.onErrorCallback = callback
    return this
  }

  send (message) {
    const data = JSON.stringify(message)
    this.ws.send(data)
  }

  request () {
    ++this.iterations
    this.times.request = (new Date()).getTime()
    this.send({type: 'time', value: this.times.request})
  }

  reset () {
    this.times.request = null
    this.times.server = null
    this.times.delay = null
    this.times.response = null
  }

  /**
   * Returns time difference between client and server clocks.
   * If response is > 0, client is ahead.
   * If response is < 0, client is behind.
   *
   * @param  {int} options.requestTime
   * @param  {int} options.serverTime
   * @param  {int} options.responseTime
   * @return {int}
   */
  getTimeDiff ({request, server, response, delay}) {
    const approxLatency = delay / 2
    const serverTimeOnRequest = server - approxLatency
    const diff = request - serverTimeOnRequest
    log('approx latency:', approxLatency)

    if (typeof this.onDiffCallback === 'function') {
      this.onDiffCallback(diff)
    }
  }

  onTime (value) {
    this.times.server = value
    this.times.response = (new Date()).getTime()
    this.times.delay = this.times.response - this.times.request
    this.timesCollection.push(clone(this.times))
    log(`TIMES on #${this.iterations}:`, this.times)

    // Stop iterating if we got a fast enough response.
    if (this.times.delay <= this.minPrecision) {
      log(`GOT FAST response on #${this.iterations}`)
      this.getTimeDiff(this.times)
      return
    }

    if (this.iterations < this.maxIterations) {
      // Ask for server time again.
      this.request()
      return
    }

    // Pick the fastest time to calculate and approx. latency.
    const fastest = this.getFastestTimes()
    this.getTimeDiff(fastest)
  }

  getFastestTimes () {
    // Once we have all the times we need sort them by delay.
    const unsortedDelays = this.timesCollection.map((times) => {
      return times.delay
    })
    log('unsorted delays:', unsortedDelays)
    this.timesCollection = this.timesCollection.sort((times1, times2) => {
      return times1.delay - times2.delay
    })
    const sortedDelays = this.timesCollection.map((times) => {
      return times.delay
    })
    log('sorted delays:', sortedDelays)

    // On the sorted array the first one is the fastest.
    return this.timesCollection[0]
  }
}

function clone (obj) {
  return JSON.parse(JSON.stringify(obj))
}

function log () {
  console.log('[ TIME-DIFF-CLIENT ]-->', ...arguments)
}

const timeDiffClient = new TimeDiffClient()
export default timeDiffClient
