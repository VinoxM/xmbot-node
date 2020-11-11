const express = require('express')
const cors = require('cors')
const app = express()

export function get(url,listener){
    app['get'](url,listener)
}

export function post(url,listener){
    app['post'](url,listener)
}

app.listen(8081,'127.0.0.1')
app.use(cors())

export function useStatic(path){
    app.use('/static',express.static(path))
}

const request = require('./request');

request.addListener(app)
