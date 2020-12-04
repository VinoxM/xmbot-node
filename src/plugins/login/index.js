import {userDb} from './userDb'

const uuid = require('node-uuid')
const user_db = new userDb()

user_db.tableExists().then(res => {
    if (res.count === 0) {
        user_db.tableCreate()
    }
}).catch(err => {
    global['ERR'](err)
})

let setting = {}

function initSetting() {
    setting = global["config"][__dirname.split("\\").pop()]
}

initSetting()

const matchDict = [
    {match: ['登录'], startWith: false, needReplace: false, rules: ['private'], func: login},
    {match: ['注册'], startWith: false, needReplace: false, rules: ['private'], func: register},
    {match: ['重置密码'], startWith: false, needReplace: false, rules: ['private'], func: resetPwd},
]

function match(context) {
    global['func']['generalMatch'](context, matchDict)
}

function register(context) {
    let user_id = context['user_id']
    checkUserExists(user_id).then((r) => {
        let url = global['config'].default['base_url'] + 'login'
        if (r === 0) {
            user_db.createUser(user_id).then(() => {
                context['message'] = `注册成功(账号为您的qq号码,密码123456),请前往网页登录:${url}`
                global.replyPrivate(context)
            }).catch((e) => {
                global['ERR'](e)
                context['message'] = `注册失败,请联系机器人管理员`
                global.replyPrivate(context)
            })
        } else {
            context['message'] = `您已注册,请前往网页登录:${url}`
            global.replyPrivate(context)
        }
    }).catch((e) => {
        global['ERR'](e)
        context['message'] = `注册失败,请联系机器人管理员`
        global.replyPrivate(context)
    })
}

function login(context) {
    let user_id = context['user_id']
    checkUserExists(user_id).then((r) => {
        if (r === 0) context['message'] = '您没有注册,请私聊机器人"注册"'
        else {
            let base_url = global['config'].default['base_url'] + 'login?'
            context['message'] = newUserSaltAndSave(user_id, base_url)
        }
        global.replyPrivate(context)
    }).catch((e) => {
        global['ERR'](e)
        context['message'] = '操作出错,请联系机器人管理员'
        global.replyPrivate(context)
    })
}

function resetPwd(context) {
    let user_id = context['user_id']
    checkUserExists(user_id).then((r) => {
        if (r === 1) {
            let base_url = global['config'].default['base_url'] + 'reset-pwd?'
            context['message'] = newUserSaltAndSave(user_id, base_url)
            global.replyPrivate(context)
        } else {
            context['message'] = '您没有注册,请私聊机器人"注册"'
            global.replyPrivate(context)
        }
    }).catch((e) => {
        global['ERR'](e)
        context['message'] = '操作出错,请联系机器人管理员'
        global.replyPrivate(context)
    })
}

function checkSalt(user_info) {
    let index = setting['reset_dict'].findIndex(o => {
        return o.user_id === user_info.user
    })
    if (index === -1) return -1
    let now = new Date().getTime()
    if (setting['reset_dict'][index].salt !== user_info.salt) return -2
    if (now - setting['reset_dict'][index].expTime > 0) return -3
    return 0
}

function checkUserExists(user_id) {
    return new Promise((resolve, reject) => {
        user_db.getUser(user_id).then(rows => {
            if (rows.length > 0) {
                resolve(1)
            } else {
                resolve(0)
            }
        }).catch(e => {
            reject(-1)
        })
    })
}

async function checkUserPassword(user_info) {
    let res = null
    await user_db.validUserPwd(user_info).then((r) => {
        if (r.length > 0) res = r[0]
        else res = 0
    }).catch((e) => {
        global['ERR'](e)
        res = -1
    })
    return res
}

async function selUserLoginCount(user_id) {
    let res = null
    await user_db.getUserLoginCount(user_id).then(r => {
        if (r.length > 0) res = r[0]
        else res = 0
    }).catch(e => {
        global['ERR'](e)
        res = -1
    })
    return res
}

async function newUserSaltAndSave(userId, baseUrl, salt) {
    let expireTime = 30 * 60 * 1000
    if (setting.hasOwnProperty('expireTime')) {
        let expireUnit = {
            hours: 60 * 60 * 1000,
            minutes: 60 * 1000,
            seconds: 1000
        }
        expireTime = setting['expireTime']['time'] * expireUnit[setting['expireTime']['unit']]
    }
    let user_info = {
        user_id: String(userId),
        salt: salt ? salt : uuid.v4(),
        expTime: new Date().getTime() + expireTime
    }
    let dict = setting['reset_dict']
    let index = dict.findIndex(o => {
        return o.user_id === user_info.user_id
    })
    if (index === -1) setting['reset_dict'].push(user_info)
    else setting['reset_dict'].splice(index, 1, user_info)
    await global['reloadPlugin'](setting, __dirname.split("\\").pop(), true)
    return baseUrl ? `${baseUrl}user=${user_info.user_id}&salt=${user_info.salt}` : ''
}

function savePassword(user) {
    return user_db.updateUserPwd(user)
}

function userLoginCountUp(user_id) {
    return user_db.updateUserLoginCount(user_id)
}

export default {
    initSetting,
    match,
    needPrefix: true,
    checkUserPassword,
    savePassword,
    userLoginCountUp,
    checkUserExists,
    checkSalt,
    newUserSaltAndSave,
    selUserLoginCount,
    matchDict
}
