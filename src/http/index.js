const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')

const app = express()
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

export function get(url,listener){
    app['get'](url,listener)
}

export function post(url,listener){
    app['post'](url,listener)
}

app.listen(9221)
// 跨域
app.use(cors())

export function useStatic(path){
    app.use('/static',express.static(path))
}

const request = require('./request');

request.addListener(app)
