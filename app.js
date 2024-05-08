const PORT = 3300
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')

console.log('hello')

const app = express()
app.use(express.json())
app.use(cors())

mongoose.connect(
  'mongodb+srv://lviv08:EcTGNgmPF6HcKdQ9@database.atog457.mongodb.net/Back_end_bayrakparts?retryWrites=true&w=majority'
)

require('./routes').Api(app)
require('./routes').Admin(app)

require('./scripts/index.js')()

const server = app.listen(3300, () => console.log('server is alive'))
