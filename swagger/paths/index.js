const auth = require('./auth')
const calorieLog = require('./calorieLog')
const exerciseLog = require('./exerciseLog')
const friends = require('./friends')
const users = require('./users')

module.exports =  {
    paths: {
        ...auth,
        ...calorieLog,
        ...exerciseLog,
        ...friends,
        ...users
    }
}
