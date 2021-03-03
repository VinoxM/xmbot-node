import Discord from 'discord.js';
import {CQCode} from "../utils/CQCode";
import {chatDb} from "../utils/chatDb";
import request from "request";

let bot = null
const apiName = __filename.split(global['separator']).pop().split('.')[0]
const CQ = CQCode[apiName]
const chatLog = {
    group: {},
    private: {}
}
const msgType = {
    group: {
        label: "群组消息",
        reply: "group_id",
        type: "group"
    },
    private: {
        label: "私聊消息",
        reply: "user_id",
        type: "private"
    }
}

let chatLogDb = {
    db: null
};

function initBot(args) {
    bot = new Discord.Client();
    chatLogDb.db = new chatDb();
    let apiConf = global['config'].default.api[apiName]
    bot.login(apiConf.token).then(() => {
    })
    addListener(args, apiConf)
}

function restartBot(user_id) {
    if (chatLogDb.db) chatLogDb.db.close()
    bot.destroy()
    initBot(user_id ? ['restart', user_id] : [])
}

function addListener(args, apiConf) {
    global.botReady.api[apiName] = false
    global['func']['changeBotReady']()
    bot.on('ready', () => {
        global.botReady.api[apiName] = true
        global['func']['changeBotReady']()
        global['LOG'](`xmBot已启动API [${apiName}]:${bot.user.tag}!`)
        let isRestart = args && args.length > 0 && args[0] === 'restart'
        let isUpdate = args && args.length > 0 && args[0] === 'update'
        if (isUpdate) {
            replyPrivate({user_id: args[1], self_id: 'system', message: '更新完成,当前版本:' + global['version']})
        } else if (isRestart) {
            replyPrivate({user_id: args[1], self_id: 'system', message: 'xmBot已重启'})
        } else {
            if (apiConf['readyFeedBack']) {
                for (const m of apiConf['master']) {
                    replyPrivate({user_id: m, self_id: 'system', message: 'xmBot已启动'})
                }
            }
        }
    })
    bot.on('message', message => {
        if (message['author'].bot) return
        if (message['type'] !== 'DEFAULT') return

        const messageType = {
            'dm': 'private',
            'text': 'group'
        }
        const record = {
            apiName: apiName,
            message_type: messageType[message['channel'].type],
            message: message['content'],
            raw_message: message['content'],
            message_id: message['id'],
            group_id: message['channel'].id,
            user_id: message['author'].id,
            sender: {
                user_id: message['author'].id,
                nickname: message['author'].username,
            },
            self_id: bot.user.id,
            sub_type: message['type'],
            channel: message['channel'],
            replyAt: message['reply']
        }
        if (message.attachments.size > 0) {
            message.attachments.forEach(e => {
                let obj = {
                    url: e.url,
                    type: getSuffixType(e.name.split('.').pop())
                }
                if (obj.type === 'image') {
                    record.message += CQ.img_web(obj.url)
                }
            })
        }

        global['func']['onReceiveLog'](record, apiName);
        switch (record.message_type) {
            case 'private':
                //enablePrivate
                if (!apiConf["enablePrivate"]) return;
                break;
            case 'group':
                //blackGroup or whiteGroup
                if (apiConf["isBlackGroup"] ? apiConf["blackGroup"].indexOf(record["group_id"]) > -1 : apiConf["whiteGroup"].indexOf(record["group_id"]) === -1) return;
                break;
            default:
                return;
        }

        //prefix
        let through = false
        if (apiConf["prefixOn"]) {
            // if (CQ.checkAndReplaceAtSelf(record)) through = true
            if (record['message_type'] === 'private') through = true
            let prefix = apiConf.prefix;
            for (let p of prefix) {
                if (record["message"].startsWith(p)) {
                    record["raw_message"] = record["message"].substring(p.length).trim();
                    through = true;
                    break;
                }
            }
        }

        //match
        let canRepeat = true // 可复读标志
        let repeated = false // 已复读标志
        for (let i of Object.keys(global.plugins)) {
            let p = global.plugins[i]
            if (typeof p == 'undefined') continue // 过滤空plugins
            if (!p.needPrefix || (p.needPrefix && through)) { // 不需要前缀||需要前缀
                if ("match" in p) {
                    record.apiName = apiName
                    canRepeat = p["match"](record) //返回true则该条信息可以触发复读,返回false或不返回则不能触发
                    if (typeof canRepeat === 'boolean' && canRepeat && !repeated) {
                        global['repeat']['handleRepeat'](record)
                        repeated = true
                    }
                }
            }
        }
    })
}

function replyMsg(context, message, at = false) {
    context = global['func']['checkContextError'](context)
    if (!!message) context['message'] = message
    let replyType = msgType[context["message_type"]]["reply"];//通过消息类型确定回复目标(群组->group_id,私聊->private_id)
    let replyId = context[replyType];//获取回复目标号码
    const channel = context.channel ? context.channel :(replyType==='group_id'?bot.channels.cache.get(replyId):bot.users.cache.get(replyId))
    if (!channel) {
        global['ERR'](`未连接Channel: [${context.user_id}]`)
        return
    }
    if (at) context['message'] = CQ.at(context['user_id']) + context['message']
    global['func']['onSendLog'](context["message_type"], replyId, context["self_id"], context['message'], apiName);
    handleCq({msg: context['message'], file: []}).then(result=>{
        channel.send(result.msg, {files: result.file}).then(r => {})
    })
}

function replyPrivate(context, message) {
    context = global['func']['checkContextError'](context)
    if (!!message) context['message'] = message
    const channel = context.channel ? context.channel : bot.users.cache.get(context.user_id)
    if (!channel) {
        global['ERR'](`未连接Channel: [${context.user_id}]`)
        return
    }
    global['func']['onSendLog']('group', context["group_id"], context["self_id"], context["message"], apiName);
    handleCq({msg: context['message'], file: []}).then(result=>{
        channel.send(result.msg, {files: result.file})
    })
}

function replyGroup(context, message, at = false) {
    context = global['func']['checkContextError'](context)
    if (!!message) context['message'] = message
    const channel = context.channel ? context.channel : bot.channels.cache.get(context.group_id)
    if (!channel) {
        global['ERR'](`未连接Channel: [${context.group_id}]`)
        return
    }
    if (at) context['message'] = CQ.at(message['user_id']) + context['message']
    global['func']['onSendLog']('group', context["group_id"], context["self_id"], context["message"], apiName);
    handleCq({msg: context['message'], file: []}).then(result=>{
        channel.send(result.msg, {files: result.file})
    })
}

function handleCq(message) {
    return new Promise(resolve=> {
        let msg = message.msg
        let cqImg = ''
        let cqEnd = '>'
        let i = -1;
        let img1 = '<CQ:image,url=', img2 = '<CQ:image,file='
        let i1 = msg.indexOf(img1), i2 = msg.indexOf(img2);
        if (i1 > -1) {
            i = i1;
            cqImg = img1;
        } else {
            i = i2;
            cqImg = img2;
        }
        if (i > -1) {
            let start = msg.substring(0, i)
            let end = msg.substring(start.length)
            end = end.replace(cqImg, '')
            let j = end.indexOf(cqEnd)
            let url = end.substring(0, j)
            end = end.substr(j + 1)
            msg = start + end
            message.msg = msg
            getWebFileBuffer(url).then(res=>{
                message.file.push(res)
                message = handleCq(message)
                resolve(message)
            }).catch(err=>{
                global['ERR'](`[${err}]无法获取图片:${url}`)
                resolve(message)
            })
        } else {
            resolve(message)
        }
    })
}

function getWebFileBuffer(url) {
    return new Promise((resolve, reject) => {
        request({
            url:url,
            proxy: global['config'].default.proxy,
            encoding: null
        }, (err,res,buffer) => {
            if (err) reject(err)
            else resolve(buffer)
        })
    })
}

function getSuffixType(str) {
    const suffixType = {
        'image': ['jpg', 'jpeg', 'png'],
        'record': ['mp3'],
        'video': ['mp4', 'avi']
    }
    for (const key of Object.keys(suffixType)) {
        if (suffixType[key].indexOf(str) > -1) return key
    }
    return false
}

export default {
    CQ,
    initBot,
    chatLog, chatLogDb, restartBot, replyMsg, replyPrivate, replyGroup
}
