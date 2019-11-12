const express = require('express')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const cors = require('cors')
require('dotenv').config()
const port = process.env.PORT || 80

const indexRouter = require('./routes/index')

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(logger('dev'))
app.use(cors())
app.use(cookieParser())

indexRouter(app)

app.use('/docs', express.static('doc'))

try {
  app.listen(port, () => {
    console.log(`Online on port ${port}`)
  })
} catch (error) {
  console.error(error)
}

module.exports = app
