export default class Store {
  constructor (namespace) {
    this.namespace = namespace
  }

  set (key, value) {
    let data = JSON.parse(localStorage.getItem(this.namespace)) || {}

    // Overwrite existing data for current namespace.
    if (value === undefined) {
      localStorage.setItem(this.namespace, key)
      return
    }

    if (typeof value === 'object') value = JSON.stringify(value)
    data[key] = value
    localStorage.setItem(this.namespace, JSON.stringify(data))
  }

  get (key) {
    let data = localStorage.getItem(this.namespace)
    if (typeof data !== 'string') return data

    try {
      data = JSON.parse(data)
      if (key) data = data[key]
      return data
    } catch (e) {
      return data
    }
  }
}
