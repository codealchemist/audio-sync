const actions = {
  selectedSong: (state, action) => {
    console.log('** ACTION, selectedSong')
    console.log('** new song:', action.song)
    return action.song
  }
}

const sourceDecorators = {
  youtube: (song) => {
    const decoratedSong = Object.assign({}, song, {
      title: 'YouTube Song',
      author: 'TBD',
      url: '',
      description: '',
      image: ''
    })

    return decoratedSong
  }
}

function sourceDecorator (song) {
  if (!song.source) return song
  if (typeof sourceDecorators[song.source] !== 'function') return song

  const decoratedSong = sourceDecorators[song.source](song)
  console.log('YOUTUBE DECORATED:', decoratedSong)
  return decoratedSong
}

const decorators = [
  sourceDecorator
]

function decorate (song) {
  let decoratedSong = Object.assign({}, song)
  decorators.forEach((decorator) => {
    decoratedSong = decorator(decoratedSong)
    console.log('&& decorate: decoratedSong:', decoratedSong)
  })

  return decoratedSong
}

const reducer = (state = {}, action) => {
  console.log('== SONG REDUCER: state:', state, action)
  if (typeof actions[action.type] !== 'function') return state
    
  const newSong = actions[action.type](state, action)
  const decoratedSong = decorate(newSong)
  console.log('=== DECORATED SONG:', decoratedSong)
  return decoratedSong
}

module.exports = reducer
