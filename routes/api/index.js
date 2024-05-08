const ApiRouter = require('express').Router()

ApiRouter.use('/info', require('./info'))

module.exports = ApiRouter