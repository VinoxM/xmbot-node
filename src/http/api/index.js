import path from 'path'
import fs from 'fs-extra'
import {BaseRequest, ObjRequest} from "../requestClass";

const request = require('request')

export const listener = {
    get: {
        '/xmbot': {
            needAuth: false,
            func: (req, res) => {
                global['LOG']('user access')
                res.setHeader('Content-Type', 'text/html')
                res.sendFile(global['source'].web + '/index.html')
            }
        },
        '/getMatchDict.json': {
            needAuth: false,
            func: (req, res) => {
                let plugins = global['plugins']
                let keys = Object.keys(plugins)
                let result = {}
                for (const key of keys) {
                    if (!plugins[key]) continue
                    result[key] = plugins[key].hasOwnProperty('matchDict') ? plugins[key]['matchDict'].map(o => {
                        return {
                            match: o.match,
                            rules: o.rules ? o.rules : [],
                            startWith: o.startWith,
                            needReplace: o.needReplace,
                            describe: o.describe,
                            needPrefix: o.hasOwnProperty('needPrefix') ? o.needPrefix : plugins[key]['needPrefix']
                        }
                    }) : []
                }
                res.send(new ObjRequest(result))
            }
        },
        '/xmbot/web/image.get': {
            func: (req, res) => {
                let proxy = global['config'].default.proxy
                let params = req.query
                if (params.hasOwnProperty('url')) {
                    request({
                        url: params.url,
                        proxy: proxy ? proxy : 'http://127.0.0.1:2802'
                    }).pipe(res)
                } else
                    res.send(BaseRequest.FAILED())
            }
        },
        '/getBotApi.json': {
            func: (req, res) => {
                let api = Object.keys(global['config'].default.api)
                res.send(new ObjRequest(api))
            }
        }
    },
    post: {}
}

function loadRequest() {
    const files = fs['readdirSync'](__dirname).filter(o => o !== 'index.js')
    if (files && files.length > 0) {
        files.forEach(file => {
            let fileName = file.split('.')[0]
            let obj = require(path.join(__dirname, fileName)).default
            for (const method of ['get', 'post']) {
                for (const key of Object.keys(obj[method])) {
                    if (listener[method].hasOwnProperty(key)) {
                        global['ERR'](`有相同的请求URL:[${method.toUpperCase()}] ${key}`)
                    } else {
                        listener[method][key] = obj[method][key]
                    }
                }
            }
        })
    }
}

loadRequest()
