const {combineReducers} = require('redux')
const song = require('./song')

const reducers = combineReducers({song})
module.exports = reducers
