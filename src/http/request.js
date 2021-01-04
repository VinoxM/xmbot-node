import path from 'path'
import fs from 'fs'
import jwt from 'jsonwebtoken'
import uuid from 'node-uuid'
import formidable from 'formidable'
import {BaseRequest, ObjRequest} from "./requestClass";

const request = require('request')

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
            if (global['func']['checkIsAdmin']({user_id})) resolve()
            else reject(BaseRequest.USER_LIMITS())
        } else reject(BaseRequest.NOT_LOGIN())
    })
}

export function getPcrPng(fileName, filePath) {
    return global['func']['downloadWebFile']('https://redive.estertion.win/icon/unit/' + fileName + '.webp', filePath, true)
}

export function jwtSign(user_id, salt) {
    return jwt.sign({user_id}, salt, {expiresIn: 7 * 24 * 60 * 60})
}

export function jwtVerify(token, salt) {
    return new Promise((resolve, reject) => {
        jwt.verify(token, salt, (err) => {
            if (!err) resolve()
            else reject(err)
        })
    })
}

const listener = {
    get: {
        '/xmbot': {
            needAuth: false,
            func: (req, res) => {
                global['LOG']('user access')
                res.setHeader('Content-Type', 'text/html')
                res.sendFile(global['source'].web + '/index.html')
            }
        },
        '/login': {
            needAuth: false,
            func: (req, res) => {
                let params = req.query
                global['plugins']['login']['checkUserExists'](params.user_id).then(async (r) => {
                    if (r === 1) {
                        let check = await global['plugins']['login']['checkUserPassword'](params)
                        if (check === 0) {
                            res.send(BaseRequest.PASSWORD_ERROR())
                        } else if (check === -1) {
                            res.send(BaseRequest.FAILED('操作出错,请联系机器人管理员'))
                        } else {
                            global['plugins']['login']['userLoginCountUp'](params.user_id)
                            check.salt = uuid.v4()
                            if (check['login_count'] === 0) {
                                global['plugins']['login']['newUserSaltAndSave'](params.user_id, null, check.salt)
                            }
                            check.token = jwtSign(params.user_id, check.salt)
                            res.send(new ObjRequest(check))
                        }
                    } else {
                        res.send(BaseRequest.USER_NOT_EXISTS('用户不存在,请私聊机器人注册'))
                    }
                }).catch((e) => {
                    global['ERR'](e)
                    res.send(BaseRequest.FAILED('登录失败,请联系机器人管理员'))
                })
            }
        },
        '/login.salt': {
            needAuth: false,
            func: (req, res) => {
                let user_info = req.query
                let check = global['plugins']['login']['checkSalt'](user_info)
                let reply = null
                switch (check) {
                    case -3:
                        reply = BaseRequest.LINK_EXPIRED()
                        res.send(reply)
                        break
                    case -2:
                    case -1:
                        reply = BaseRequest.LINK_EXPIRED('链接不正确')
                        res.send(reply)
                        break
                    case 0:
                    default:
                        global['plugins']['login']['checkUserExists'](user_info.user).then(async (r) => {
                            if (r === 1) {
                                let check = await global['plugins']['login']['selUserLoginCount'](user_info.user)
                                if (check === 0) {
                                    res.send(BaseRequest.USER_NOT_EXISTS('用户不存在,请私聊机器人注册'))
                                } else if (check === -1) {
                                    res.send(BaseRequest.FAILED('操作出错,请联系机器人管理员'))
                                } else {
                                    global['plugins']['login']['userLoginCountUp'](user_info.user)
                                    check.salt = user_info.salt
                                    if (check['login_count'] === 0) {
                                        global['plugins']['login']['newUserSaltAndSave'](user_info.user, null, check.salt)
                                    }
                                    check.token = jwtSign(user_info.user, check.salt)
                                    res.send(new ObjRequest(check))
                                }
                            } else {
                                res.send(BaseRequest.USER_NOT_EXISTS('用户不存在,请私聊机器人注册'))
                            }
                        }).catch((e) => {
                            global['ERR'](e)
                            res.send(BaseRequest.FAILED('登录失败,请联系机器人管理员'))
                        })
                        break
                }
            }
        },
        '/setting/gacha/pcr.json': {
            needAuth: false,
            func: (req, res) => {
                res.send(new ObjRequest(global['config']['gacha']['pcr']))
            }
        },
        '/setting/gacha/pcr/pools.json': {
            needAuth: false,
            func: (req, res) => {
                res.send(new ObjRequest(global['config']['gacha']['pcr-pools']))
            }
        },
        '/setting/gacha/pcr/character.json': {
            needAuth: false,
            func: (req, res) => {
                res.send(new ObjRequest(global['config']['gacha']['pcr-character']))
            }
        },
        '/xmbot/resource/gacha/utils/*': {
            needAuth: false,
            func: (req, res) => {
                res.setHeader('Content-Type', 'image/jpeg')
                let fileName = req.url.replace('/xmbot/resource/gacha/utils/', '')
                let filePath = path.join(global['source'].resource, 'gacha', 'utils')
                let fullPath = path.join(filePath, fileName)
                fs.access(fullPath, fs.constants.F_OK, (err) => {
                    if (!err) {
                        res.sendFile(fullPath)
                    } else {
                        res.send(BaseRequest.FAILED('Image Not Found!'));
                    }
                })
            }
        },
        '/xmbot/resource/gacha/*': {
            needAuth: false,
            func: (req, res) => {
                res.setHeader('Content-Type', 'image/jpeg')
                let fileName = req.url.replace('/xmbot/resource/gacha/', '')
                let filePath = path.join(global['source'].resource, 'gacha')
                let fullPath = path.join(filePath, fileName)
                fs.access(fullPath, fs.constants.F_OK, (err) => {
                    if (!err) {
                        res.sendFile(fullPath)
                    } else {
                        res.send(BaseRequest.FAILED('Image Not Found!'));
                    }
                })
            }
        },
        '/xmbot/resource/icon/unit/*': {
            needAuth: false,
            func: (req, res) => {
                res.setHeader('Content-Type', 'image/jpeg')
                let fileName = req.url.replace('/xmbot/resource/icon/unit/', '')
                let filePath = path.join(global['source'].resource, 'icon', 'unit')
                let fullPath = path.join(filePath, fileName)
                fs.access(fullPath, fs.constants.F_OK, (err) => {
                    if (!err) {
                        res.sendFile(fullPath)
                    } else {
                        fs['mkdir'](filePath, {recursive: true}, (e) => {
                            getPcrPng(fileName.split('.')[0], fullPath).then(r => {
                                res.sendFile(fullPath)
                            }).catch(e => {
                                let defaultFile = path.join(filePath, '000001.jpg')
                                fs.access(defaultFile, fs.constants.F_OK, (err1) => {
                                    if (!err1) {
                                        res.sendFile(defaultFile)
                                    } else {
                                        getPcrPng('000001', defaultFile).then(r => {
                                            res.sendFile(defaultFile)
                                        }).catch(e1 => {
                                                res.send('error!')
                                            }
                                        )
                                    }
                                })
                            })
                        })
                    }
                })
            }
        },
        '/salt-valid': {
            needAuth: false,
            func: (req, res) => {
                let user_info = req.query
                let check = global['plugins']['login']['checkSalt'](user_info)
                let reply = null
                switch (check) {
                    case -3:
                        reply = BaseRequest.LINK_EXPIRED()
                        break
                    case -2:
                    case -1:
                        reply = BaseRequest.LINK_EXPIRED('链接不正确')
                        break
                    case 0:
                    default:
                        reply = BaseRequest.SUCCESS()
                        break
                }
                res.send(reply)
            }
        },
        '/reset-pwd': {
            needAuth: false,
            func: (req, res) => {
                let params = req.query
                global['plugins']['login']['savePassword'](params).then(r => {
                    res.send(BaseRequest.SUCCESS())
                }).catch(e => {
                    res.send(BaseRequest.FAILED('修改失败'))
                })
            }
        },
        '/token.valid': {
            needAuth: false,
            func: (req, res) => {
                let token = req.query.token
                let salt = req.query.salt
                if (token && salt) {
                    jwtVerify(token, salt).then(r => {
                        res.send(BaseRequest.SUCCESS())
                    }).catch(e => {
                        res.send(BaseRequest.FAILED('登录信息错误'))
                    })
                } else {
                    res.send(BaseRequest.FAILED('登录信息错误'))
                }
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
        '/checkIsAdmin.valid': {
            needAuth: true,
            func: (req, res) => {
                let query = req.query
                let check = global['func']['checkIsAdmin'](query)
                res.send(BaseRequest[check ? 'SUCCESS' : 'FAILED']())
            }
        },
        '/setting/gacha/pcr/nickNames.json': {
            needAuth: false,
            func: (req, res) => {
                let nickNames = global['plugins']['gacha']['pcr']['nickNames']
                res.send(new ObjRequest(nickNames))
            }
        },
        '/setting/rss.json': {
            needAuth: false,
            func: (req, res) => {
                res.send(new ObjRequest(global['config']['rss']))
            }
        },
        '/setting/live.json': {
            needAuth: false,
            func: (req, res) => {
                res.send(new ObjRequest(global['config']['live']))
            }
        },
        '/setting/chat.json': {
            needAuth: false,
            func: (req, res) => {
                res.send(new ObjRequest(global['config']['chat']))
            }
        },
        '/setting/repeat.json': {
            needAuth: false,
            func: (req, res) => {
                res.send(new ObjRequest(global['repeat']['setting']))
            }
        },
        '/setting/calendar/pcr.json': {
            needAuth: false,
            func: (req, res) => {
                res.send(new ObjRequest(global['config']['calendar']['pcr']))
            }
        },
        '/rss/source/test.do': {
            func: (req, res) => {
                let params = req.query
                global['plugins']['rss'].rssSourceTest(params.source, !!params.proxy).then(r => {
                    res.send(new ObjRequest(r))
                }).catch(e => {
                    global['ERR'](e)
                    res.send(BaseRequest.FAILED())
                })
            }
        },
        '/calendar/url/test.do': {
            func: (req, res) => {
                let params = req.query
                global['plugins']['calendar'].calendarTest(params.url, !!params.needProxy).then(r => {
                    res.send(new ObjRequest(r))
                }).catch(e => {
                    global['ERR'](e)
                    res.send(BaseRequest.FAILED())
                })
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
        }
    },
    post: {
        '/setting/gacha/pcr-all.save': {
            needAuth: true,
            func: (req, res) => {
                let params = req.body
                global['plugins']['gacha']['pcr']['saveSetting'](params.settings, 'setting-pcr.json')
                    .then(r => {
                        global['plugins']['gacha']['pcr']['saveSetting'](params['pools'], 'setting-pcr-pools.json')
                            .then(r => {
                                res.send(BaseRequest.SUCCESS())
                            })
                            .catch(e => {
                                res.send(BaseRequest.FAILED())
                            })
                    })
                    .catch(e => {
                        res.send(BaseRequest.FAILED())
                    })
            }
        },
        '/setting/gacha/pcr-setting.save': {
            needAuth: true,
            func: (req, res) => {
                let params = req.body
                global['plugins']['gacha']['pcr']['saveSetting'](params, 'setting-pcr.json')
                    .then(r => {
                        res.send(BaseRequest.SUCCESS())
                    })
                    .catch(e => {
                        res.send(BaseRequest.FAILED())
                    })
            }
        },
        '/setting/gacha/pcr-pools.save': {
            needAuth: true,
            func: (req, res) => {
                let params = req.body
                global['plugins']['gacha']['pcr']['saveSetting'](params, 'setting-pcr-pools.json')
                    .then(r => {
                        res.send(BaseRequest.SUCCESS())
                    })
                    .catch(e => {
                        res.send(BaseRequest.FAILED())
                    })
            }
        },
        '/setting/gacha/pcr-nickNames.save': {
            needAuth: true,
            needAdmin: true,
            func: (req, res) => {
                let form = new formidable.IncomingForm()
                form.parse(req, function (err, fields, files) {
                    if (err === null) {
                        let params = fields
                        let nickNames = global['plugins']['gacha']['pcr']['nickNames']
                        let check = global['plugins']['gacha']['pcr']['checkCharTypeAndStar'](params.type, params.star)
                        if (check.flag) {
                            if (params['isEdit'] === '0' && nickNames.hasOwnProperty(params.num)) {
                                res.send(BaseRequest.FAILED('角色代号已存在'))
                            } else {
                                nickNames[params.num] = [params.type, params.star, params.num, params['jp_name'], params['cn_name']]
                                params['nickNames'] = params['nickNames'].split(',')
                                if (params['nickNames'].length >= 1 && params['nickNames'][0] !== '') {
                                    nickNames[params.num] = [...nickNames[params.num], ...params['nickNames']]
                                }
                                if (files.hasOwnProperty('image')) {
                                    let savePath = path.join(global['source']['resource'], 'icon', 'unit', params.num + (params.star.replace('star', '') === '3' ? '3' : '1') + '1.jpg')
                                    fs.writeFileSync(savePath, fs.readFileSync(files.image.path))
                                }
                                global['plugins']['gacha']['pcr']['saveNickNames'](false, nickNames).then(() => {
                                    res.send(BaseRequest.SUCCESS())
                                }).catch(e => {
                                    global['ERR'](e)
                                    res.send(BaseRequest.FAILED())
                                })
                            }
                        } else {
                            res.send(new BaseRequest(check.check, 500))
                        }
                    } else
                        res.send(BaseRequest.FAILED('Upload Failed!'))
                })
            }
        },
        '/setting/gacha/pcr/delCharacter.do': {
            needAuth: true,
            needAdmin: true,
            func: (req, res) => {
                let params = req.body
                let nickNames = global['plugins']['gacha']['pcr']['nickNames']
                if (nickNames.hasOwnProperty(params.num)) {
                    delete nickNames[params.num]
                    global['plugins']['gacha']['pcr']['saveNickNames'](false, nickNames).then(() => {
                        res.send(BaseRequest.SUCCESS())
                    }).catch(e => {
                        global['ERR'](e)
                        res.send(BaseRequest.FAILED())
                    })
                } else {
                    res.send(BaseRequest.FAILED('未找到该角色'))
                }
            }
        },
        '/setting/rss.save': {
            needAuth: true,
            needAdmin: true,
            func: async (req, res) => {
                let params = req.body
                let rss = global['config']['rss'].rss
                params.rss.map(o => {
                    rss.some(obj => {
                        if (obj.name === o.name) {
                            o.last_id = obj.last_id
                            return true
                        }
                        return false
                    })
                })
                await global['plugins']['rss']['reloadRssPlugins'](params)
                res.send(BaseRequest.SUCCESS())
            }
        },
        '/setting/live.save': {
            needAuth: true,
            needAdmin: true,
            func: async (req, res) => {
                let params = req.body
                await global['plugins']['live']['saveSetting'](params)
                res.send(BaseRequest.SUCCESS())
            }
        },
        '/setting/chat.save': {
            needAuth: true,
            needAdmin: true,
            func: async (req, res) => {
                let params = req.body
                await global['reloadPlugin'](params, 'chat')
                await global['plugins']['chat']['initMatchSetting']()
                res.send(BaseRequest.SUCCESS())
            }
        },
        '/setting/repeat.save': {
            needAuth: true,
            needAdmin: true,
            func: async (req, res) => {
                let params = req.body
                await global['reloadRepeat'](params)
                res.send(BaseRequest.SUCCESS())
            }
        },
        '/setting/calendar/pcr.save': {
            needAuth: true,
            needAdmin: true,
            func: async (req, res) => {
                let params = req.body
                await global['plugins']['calendar']['savePcrSetting'](params)
                res.send(BaseRequest.SUCCESS())
            }
        },
        '/chat/sendMsg.do': {
            needAuth: true,
            needAdmin: true,
            func: (req, res) => {
                global.replyMsg(req.body)
                res.send(BaseRequest.SUCCESS())
            }
        },
        '/chat/getMoreMsg.json': {
            needAuth: true,
            needAdmin: true,
            func: (req, res) => {
                let params = req.body
                global.getChatLogMore(params.type,params.id,params.index)
                res.send(BaseRequest.SUCCESS())
            }
        }
    }
}
