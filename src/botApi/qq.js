import {CQWebSocket} from "cq-websocket";
import {CQCode} from "../utils/CQCode";
import {chatDb} from '../utils/chatDb'

let chatLogDb = {db:null}
let bot = null
let con_count = 0
const con_err_count = 2
const chatLog = {
    group: {},
    private: {}
}

const apiName = __filename.split(global['separator']).pop().split('.')[0]
const CQ = CQCode[apiName]

function initBot(args) {
    chatLogDb.db = new chatDb()
    const apiConf = global['config'].default['api'][apiName]
    let ops = apiConf["ws"]
    bot = new CQWebSocket(ops);
    addListener(args, apiConf)
    bot.connect()
}

function restartBot(user_id) {
    if (chatLogDb.db) chatLogDb.db.close()
    bot.disconnect()
    initBot(user_id ? ['restart', user_id] : [])
}

function closeBot(){
    if (chatLogDb.db) chatLogDb.db.close()
    bot.disconnect()
    bot = null
    global['LOG'](`已关闭Bot:${apiName}`)
    global.botReady.api[apiName] = false
    global['func']['changeBotReady']()
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

function addListener(args, apiConf) {
    global.botReady.api[apiName] = false
    global['func']['changeBotReady']()
    con_count = 0
    // 添加WebSocket监听
    bot.on('socket.connecting', (wsType, attempts) => {
        if (con_count <= con_err_count * 2) global['LOG'](`WebSocket连接中:${wsType}`)
    })
        .on('socket.failed', (wsType, attempts) => {
            if (con_count <= con_err_count * 2) global['ERR'](`WebSocket连接失败:${wsType},${Number(apiConf['ws']['reconnectionDelay'] / 1000).toFixed(0)}秒后重连`)
        })
        .on('socket.error', (wsType, err) => {
            global.botReady.api[apiName] = false
            global['func']['changeBotReady']()
            if (con_count <= con_err_count * 2) {
                con_count++
                global['ERR'](`WebSocket连接错误:${err}`)
            }
        })
        .on('socket.connect', (wsType, sock, attempts) => {
            con_count = 0
            global.botReady.api[apiName] = true
            global['func']['changeBotReady']()
            global['LOG'](`WebSocket连接成功:${sock.url}`)
        })
        .once('ready', () => {
            bot.send = {
                private: (params) => bot("send_private_msg", params),
                group: (params) => bot("send_group_msg", params)
            }
            global['LOG'](`xmBot已启动API [${apiName}]`)
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
        .on('message', (event, record, tags) => {// 监听接收信息处理
            global['func']['onReceiveLog'](record,apiName);

            // let conf = global["config"]["default"]
            let type = record["message_type"]

            switch (type) {
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
                if (CQ.checkAndReplaceAtSelf(record)) through = true
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
        });
}

function replyMsg(context, message, at = false) {
    context = global['func']['checkContextError'](context)
    let replyType = msgType[context["message_type"]]["reply"];//通过消息类型确定回复目标(群组->group_id,私聊->private_id)
    let replyId = context[replyType];//获取回复目标号码
    if (!!message) context['message'] = message
    // message = message ? message : context["message"]
    if (context['message_type'] !== 'private' && at) {//是否@发送人
        context['message'] = CQ.at(context["user_id"]) + context['message']
    }
    let params = {[replyType]: replyId, message: context['message']}//回复消息体(例:{group_id:123456}或{user_id:123456})
    let func = msgType[context["message_type"]]["type"]//获取发送api的方法名称(private()或group())
    global['func']['onSendLog'](context["message_type"], replyId, context["self_id"], context['message'],apiName);
    bot.send[func](params).then(r => {
        if (func === 'group') global['repeat']['handleRepeat'](context)// 发送群组信息,处理复读
    })
}

function replyPrivate(context) {
    context = global['func']['checkContextError'](context)
    global['func']['onSendLog']('private', context["user_id"], context["self_id"], context["message"],apiName);
    bot.send.private({user_id: context["user_id"], message: context["message"]}).then(r => {

    })
}

function replyGroup(context, at = false) {
    context = global['func']['checkContextError'](context)
    if (at) {
        context["message"] = CQ.at(context["user_id"]) + context["message"]
    }
    global['func']['onSendLog']('group', context["group_id"], context["self_id"], context["message"],apiName);
    bot.send.group({group_id: context["group_id"], message: context["message"]}).then(r => {
        global['repeat']['handleRepeat'](context)// 发送群组信息,处理复读
    })
}

export default {
    CQ, chatLog, chatLogDb, initBot, restartBot, closeBot,replyMsg, replyPrivate, replyGroup
}
