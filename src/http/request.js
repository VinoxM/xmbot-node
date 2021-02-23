import {BaseRequest, ObjRequest} from "./requestClass";
import {listener} from "./api/index";
import {jwtVerify} from './api/login'

export function addListener(app) {
    for (let key in listener) {
        for (let l in listener[key]) {
            if (listener[key].hasOwnProperty(l)) {
                app[key](l, (req, res) => {
                    if (!req.url.startsWith('/xmbot')) global['LOG'](`user access[${req.method}:${req.url}]`)
                    if (listener[key][l].needAuth)
                        checkAuthor(req, res).then(() => {
                            if (listener[key][l].needAdmin) {
                                checkRequestAdmin(req, res).then(listener[key][l].func(req, res))
                                    .catch(err => {
                                        res.send(err)
                                    })
                            } else
                                listener[key][l].func(req, res)
                        }).catch(err => {
                            res.send(err)
                        })
                    else
                        listener[key][l].func(req, res)
                })
            }
        }
    }
    app.get('/*', (req, res, next) => {
        let keys = Object.keys(listener.get)
        if (keys.indexOf(req.url) === -1 && !req.url.startsWith('/static')) {
            res.setHeader('Content-Type', 'text/html')
            res.sendFile(global['source'].web + '/error.html')
        } else next()
    })
}

function checkAuthor(req, res) {
    return new Promise((resolve, reject) => {
        let salt = req.headers.salt
        let token = req.headers.token
        if (!salt && !token) {
            reject(BaseRequest.NOT_LOGIN())
        }
        jwtVerify(token, salt).then(re => {
            resolve()
        }).catch(e => {
            reject(BaseRequest.AUTH_EXPIRED())
        })
    })
}

function checkRequestAdmin(req, res) {
    return new Promise((resolve, reject) => {
        let user_id = req.headers.user_id
        if (user_id && user_id !== '') {
            let apiName = req.query.user_id.split('_')[0]
            let context = {
                apiName,
                user_id: req.query.user_id.replace(apiName+'_','')
            }
            if (global['func']['checkIsAdmin'](context)) resolve()
            else reject(BaseRequest.USER_LIMITS())
        } else reject(BaseRequest.NOT_LOGIN())
    })
}

export function getPcrPng(fileName, filePath) {
    return global['func']['downloadWebFile']('https://redive.estertion.win/icon/unit/' + fileName + '.webp', filePath, true)
}
