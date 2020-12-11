import path from 'path'
import fs from 'fs'
import jwt from 'jsonwebtoken'
import uuid from 'node-uuid'
import formidable from 'formidable'

export function addListener(app) {
    for (let key in listener) {
        for (let l in listener[key]) {
            if (listener[key].hasOwnProperty(l)) {
                app[key](l, (req, res) => {
                    if (!req.url.startsWith('/xmbot')) global['LOG'](`user access[${req.method}:${req.url}]`)
                    if (listener[key][l].needAuth)
                        checkAuthor(req, res).then(()=> {
                            if (listener[key][l].needAdmin){
                                checkRequestAdmin(req,res).then(listener[key][l].func(req, res))
                                    .catch(err=>{
                                        res.send(err)
                                    })
                            }else
                                listener[key][l].func(req, res)
                        }).catch(err=> {
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
        jwtVerify(token, salt).then(re => {
            resolve()
        }).catch(e => {
            reject(new BaseRequest('登录过期', 501))
        })
    })
}

function checkRequestAdmin(req,res) {
    return new Promise((resolve, reject) => {
        let user_id = req.headers.user_id
        if (user_id&&user_id!==''){
            if (global['func']['checkIsAdmin']({user_id})) resolve()
            else reject(new BaseRequest('权限不足',503))
        }else reject(new BaseRequest('未登录',502))
    })
}

class BaseRequest {
    constructor(msg, code) {
        this.code = code ? code : 0
        this.msg = msg ? msg : 'Success!'
    }
}

class ObjRequest {
    constructor(data, code, msg) {
        this.code = code ? code : 0
        this.msg = msg ? msg : 'Success!'
        this.data = data
    }
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
                            res.send(new BaseRequest('用户密码错误', 501))
                        } else if (check === -1) {
                            res.send(new BaseRequest('操作出错,请联系机器人管理员', 500))
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
                        res.send(new BaseRequest('用户不存在,请私聊机器人注册', 501))
                    }
                }).catch((e) => {
                    global['ERR'](e)
                    res.send(new BaseRequest('登录失败,请联系机器人管理员', 500))
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
                        reply = new BaseRequest('链接过期', 502)
                        res.send(reply)
                        break
                    case -2:
                    case -1:
                        reply = new BaseRequest('链接不正确', 502)
                        res.send(reply)
                        break
                    case 0:
                    default:
                        global['plugins']['login']['checkUserExists'](user_info.user).then(async (r) => {
                            if (r === 1) {
                                let check = await global['plugins']['login']['selUserLoginCount'](user_info.user)
                                if (check === 0) {
                                    res.send(new BaseRequest('用户不存在,请私聊机器人注册', 501))
                                } else if (check === -1) {
                                    res.send(new BaseRequest('操作出错,请联系机器人管理员', 500))
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
                                res.send(new BaseRequest('用户不存在,请私聊机器人注册', 501))
                            }
                        }).catch((e) => {
                            global['ERR'](e)
                            res.send(new BaseRequest('登录失败,请联系机器人管理员', 500))
                        })
                        break
                }
            }
        },
        '/setting/pcr.json': {
            needAuth: true,
            func: (req, res) => {
                res.send(new ObjRequest(global['config']['gacha']['pcr']))
            }
        },
        '/setting/pcr/pools.json': {
            needAuth: true,
            func: (req, res) => {
                res.send(new ObjRequest(global['config']['gacha']['pcr-pools']))
            }
        },
        '/setting/pcr/character.json': {
            needAuth: true,
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
                        res.send(new BaseRequest('Image Not Found!',500));
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
                        reply = new BaseRequest('链接过期', 500)
                        break
                    case -2:
                    case -1:
                        reply = new BaseRequest('链接不正确', 500)
                        break
                    case 0:
                    default:
                        reply = new BaseRequest()
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
                    res.send(new BaseRequest())
                }).catch(e => {
                    res.send(new BaseRequest('修改失败', 500))
                })
            }
        },
        '/token.valid': {
            needAuth: false,
            func: (req, res) => {
                let token = req.query.token
                let salt = req.query.salt
                if (token&&salt){
                    jwtVerify(token,salt).then(r=>{
                        res.send(new BaseRequest())
                    }).catch(e=>{
                        res.send(new BaseRequest('登录信息错误',501))
                    })
                }else{
                    res.send(new BaseRequest('登录信息错误',501))
                }
            }
        },
        '/getMatchDict.json':{
            needAuth:false,
            func:(req,res)=>{
                let plugins = global['plugins']
                let keys = Object.keys(plugins)
                let result = {}
                for (const key of keys) {
                    if (!plugins[key]) continue
                    result[key] = plugins[key].hasOwnProperty('matchDict')?plugins[key]['matchDict'].map(o=>{
                        return {
                            match:o.match,
                            rules:o.rules?o.rules:[],
                            startWith:o.startWith,
                            needReplace:o.needReplace,
                            describe:o.describe,
                            needPrefix:o.hasOwnProperty('needPrefix')?o.needPrefix:plugins[key]['needPrefix']
                        }
                    }):[]
                }
                res.send(new ObjRequest(result))
            }
        },
        '/checkIsAdmin.valid':{
            needAuth:true,
            func:(req,res)=>{
                let query = req.query
                let check = global['func']['checkIsAdmin'](query)
                res.send(new BaseRequest('',check?0:506))
            }
        },
        '/setting/pcr/nickNames.json':{
            needAuth:true,
            func:(req,res)=>{
                let nickNames = global['plugins']['gacha']['pcr']['nickNames']
                res.send(new ObjRequest(nickNames))
            }
        }
    },
    post: {
        '/setting/pcr-all.save': {
            needAuth: true,
            func: (req, res) => {
                let params = req.body
                global['plugins']['gacha']['pcr']['saveSetting'](params.settings, 'setting-pcr.json')
                    .then(r => {
                        global['plugins']['gacha']['pcr']['saveSetting'](params['pools'], 'setting-pcr-pools.json')
                            .then(r => {
                                res.send(new BaseRequest())
                            })
                            .catch(e => {
                                res.send(new BaseRequest('Failed!', 500))
                            })
                    })
                    .catch(e => {
                        res.send(new BaseRequest('Failed!', 500))
                    })
            }
        },
        '/setting/pcr-setting.save': {
            needAuth: true,
            func: (req, res) => {
                let params = req.body
                global['plugins']['gacha']['pcr']['saveSetting'](params, 'setting-pcr.json')
                    .then(r => {
                        res.send(new BaseRequest())
                    })
                    .catch(e => {
                        res.send(new BaseRequest('Failed!', 500))
                    })
            }
        },
        '/setting/pcr-pools.save': {
            needAuth: true,
            func: (req, res) => {
                let params = req.body
                global['plugins']['gacha']['pcr']['saveSetting'](params, 'setting-pcr-pools.json')
                    .then(r => {
                        res.send(new BaseRequest())
                    })
                    .catch(e => {
                        res.send(new BaseRequest('Failed!', 500))
                    })
            }
        },
        '/setting/pcr-nickNames.save': {
            needAuth:true,
            needAdmin:true,
            func: (req,res) =>{
                let form = new formidable.IncomingForm()
                form.parse(req,function (err,fields,files) {
                    if (err===null){
                        let params = fields
                        let nickNames = global['plugins']['gacha']['pcr']['nickNames']
                        let check = global['plugins']['gacha']['pcr']['checkCharTypeAndStar'](params.type,params.star)
                        if (check.flag){
                            if (params['isEdit']==='0'&&nickNames.hasOwnProperty(params.num)) {
                                res.send(new BaseRequest('角色代号已存在',500))
                            }else{
                                nickNames[params.num]=[params.type,params.star,params.num,params['jp_name'],params['cn_name']]
                                params['nickNames']=params['nickNames'].split(',')
                                if (params['nickNames'].length>=1&&params['nickNames'][0]!==''){
                                    nickNames[params.num]=[...nickNames[params.num],...params['nickNames']]
                                }
                                if (files.hasOwnProperty('image')){
                                    let savePath = path.join(global['source']['resource'],'icon','unit',params.num+(params.star.replace('star','')==='3'?'3':'1')+'1.jpg')
                                    fs.writeFileSync(savePath,fs.readFileSync(files.image.path))
                                }
                                global['plugins']['gacha']['pcr']['saveNickNames'](false,nickNames).then(()=>{
                                    res.send(new BaseRequest('Success!',0))
                                }).catch(e=>{
                                    global['ERR'](e)
                                    res.send(new BaseRequest('Failed!',500))
                                })
                            }
                        }else{
                            res.send(new BaseRequest(check.check,500))
                        }
                    }else
                        res.send(new BaseRequest('Upload Failed!',500))
                })
            }
        },
        '/setting/pcr/delCharacter.do':{
            needAuth:true,
            needAdmin:true,
            func:(req,res)=>{
                let params = req.body
                let nickNames = global['plugins']['gacha']['pcr']['nickNames']
                if (nickNames.hasOwnProperty(params.num)) {
                    delete nickNames[params.num]
                    global['plugins']['gacha']['pcr']['saveNickNames'](false,nickNames).then(()=>{
                        res.send(new BaseRequest('Success!',0))
                    }).catch(e=>{
                        global['ERR'](e)
                        res.send(new BaseRequest('Failed!',500))
                    })
                }else{
                    res.send(new BaseRequest('未找到该角色',500))
                }
            }
        }
    }
}
