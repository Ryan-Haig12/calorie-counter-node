const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')
const swaggerUi = require('swagger-ui-express')

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

// connect db
const db = require('./db/config')
db.connect(err => {
    if(err) {
        console.log(err)
    } else {
        console.log('Connected to PostgreSQL DB')
    }
})

const app = express()

// Body Parser Middleware
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(morgan('dev'))
app.use(cors())

// initialize swagger
const json = require('./swagger/swagger.js')
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(json, { "showExplorer": true }))

// run prior to every request
app.use(async (req, res, next) => {
    req.db = db
    next()
})
app.use(require('./util/querySanitizer'))

app.use('/api/v1/auth', require('./api/auth'))
app.use('/api/v1/calories', require('./api/calorieLog'))
app.use('/api/v1/exercise', require('./api/exerciseLog'))
app.use('/api/v1/friends', require('./api/friends'))
app.use('/api/v1/users', require('./api/users'))

const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
    console.log(`Node.js express server running on port ${ PORT }`)
    console.log(`Swagger docs server running on port ${ PORT }/api-docs`)
})
