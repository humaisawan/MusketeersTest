const mongoose = require('mongoose')
const dotenv = require('dotenv')
const cron = require('node-cron')
dotenv.config({path: './config.env'})

const app = require('./app')
const connectDb = require('./Config/db')
const startServer = require('./Helpers/StartServer')

connectDb()
startServer()
