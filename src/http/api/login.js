import {BaseRequest, ObjRequest} from "../requestClass";
import uuid from "node-uuid";
import jwt from "jsonwebtoken";

const get = {
    '/login': {
        needAuth: false,
        func: (req, res) => {
            let params = req.query
            let user_id = params.apiName + '_' + params.user_id
            global['plugins']['login']['checkUserExists'](user_id).then(async (r) => {
                if (r === 1) {
                    let check = await global['plugins']['login']['checkUserPassword']({
                        user_id: user_id,
                        password: params.password
                    })
                    if (check === 0) {
                        res.send(BaseRequest.PASSWORD_ERROR())
                    } else if (check === -1) {
                        res.send(BaseRequest.FAILED('操作出错,请联系机器人管理员'))
                    } else {
                        check.salt = uuid.v4()
                        if (check['login_count'] === 0) {
                            global['plugins']['login']['newUserSaltAndSave'](user_id, null, check.salt)
                        } else {
                            global['plugins']['login']['userLoginCountUp'](user_id)
                        }
                        check.token = jwtSign(user_id, check.salt)
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
                    let fullUserName = user_info.user
                    global['plugins']['login']['checkUserExists'](fullUserName).then(async (r) => {
                        if (r === 1) {
                            let check = await global['plugins']['login']['selUserLoginCount'](fullUserName)
                            if (check === 0) {
                                res.send(BaseRequest.USER_NOT_EXISTS('用户不存在,请私聊机器人注册'))
                            } else if (check === -1) {
                                res.send(BaseRequest.FAILED('操作出错,请联系机器人管理员'))
                            } else {
                                global['plugins']['login']['userLoginCountUp'](fullUserName)
                                check.salt = user_info.salt
                                if (check['login_count'] === 0) {
                                    global['plugins']['login']['newUserSaltAndSave'](fullUserName, null, check.salt)
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
            global['plugins']['login']['savePassword'](params).then(async r => {
                await global['plugins']['login']['userLoginCountUp'](params.user_id)
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
    '/checkIsAdmin.valid': {
        needAuth: true,
        func: (req, res) => {
            let apiName = req.query.user_id.split('_')[0]
            let context = {
                apiName,
                user_id: req.query.user_id.replace(apiName+'_','')
            }
            let check = global['func']['checkIsAdmin'](context)
            res.send(BaseRequest[check ? 'SUCCESS' : 'FAILED']())
        }
    }
}

const post = {}

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

export default {
    get,
    post
}
