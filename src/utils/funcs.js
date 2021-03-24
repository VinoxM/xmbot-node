import {sendWsMsg} from "./socket";

const request = require('request')
const fs = require('fs')
const CQ = require('./CQCode')

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

// 默认匹配方法
export function generalMatch(context, matchDict) {
    let raw_msg = context["raw_message"].toLowerCase(); // 大写匹配词
    for (let m of matchDict) {
        // 检测是否需要前缀&&是否是群聊
        if (m.needPrefix && context["raw_message"] === context['message'] && global['func']['checkIsGroup'](context)) continue
        // 检测是否是开头匹配
        if (!m.startWith) {
            let index = m.match.indexOf(raw_msg)
            if (index > -1) {
                // 检测是否需要清空匹配词
                if (m.needReplace)
                    context['raw_message'] = context['raw_message'].replace(m.match[index], '').trim()
                return checkMatchRules(m, context) // 匹配执行操作
            }
        } else {
            for (let s of m.match) {
                if (raw_msg.startsWith(s)) {
                    if (m.needReplace)
                        context['raw_message'] = context['raw_message'].replace(s, '').trim()
                    return checkMatchRules(m, context)
                }
            }
        }
    }
}

// 检测匹配权限
export function checkMatchRules(m, context) {
    let check = m.rules && m.rules.length > 0 ? checkRules(m.rules, context) : -1
    if (check === -1) // 返回-1,符合权限
        return m.func(context) // 执行操作
    else {
        context['err'] = check // 保存错误码,发送权限错误信息
        global.replyMsg(context, null, true)
    }
}

function checkRules(rules, context) {
    if (rules.indexOf('admin') > -1 && !checkIsAdmin(context)) return 0 // admin权限(即机器人主人)
    if (rules.indexOf('private') > -1 && !checkIsPrivate(context)) return 1 // 私聊限制
    if (rules.indexOf('group') > -1 && !checkIsGroup(context)) return 2 // 群聊限制
    return -1
}

// admin权限检测
export function checkIsAdmin(context) {
    return global["config"].default.api[context.apiName]["master"].some((o) => String(o) === String(context['user_id']))
}

// 群聊检测
export function checkIsGroup(context) {
    return context['message_type'] === 'group'
}

// 私聊检测
export function checkIsPrivate(context) {
    return context['message_type'] === 'private'
}

// 获取网页图片,暂只支持http
export function getWebFile(url, type, needProxy = false) {
    let proxy = global['config']['default'].proxy
    return new Promise((resolve, reject) => {
        request({
            url: url,
            method: type ? type : 'GET',
            proxy: needProxy ? proxy : null,
            timeout: 1000
        }, (err, response, body) => {
            if (err) reject(err)
            else resolve({response, body})
        })
    })
}

// 下载网页文件[url:文件地址,file:保存本地地址]
export function downloadWebFile(url, file, needProxy = false) {
    let proxy = global['config']['default'].proxy
    return new Promise((resolve, reject) => {
        request({
            url: url,
            method: 'GET',
            proxy: needProxy ? proxy : null,
            timeout: 1000
        }, (err, response, body) => {
            if (!err && response.statusCode === 200) {
                let stream = fs.createWriteStream(file)
                request({
                    url: url,
                    method: 'GET',
                    proxy: needProxy ? proxy : null,
                    timeout: 1000
                }).pipe(stream).on('close', (e) => {
                    if (e) reject(err)
                    else resolve(true)
                })
            } else reject(err)
        })
    })
}

// 时区转换
export function toCCTDateString(date) {
    let d = new Date(date)
    let tmpHours = d.getHours()
    let time_zone = d.getTimezoneOffset() / 60 + 8
    if (time_zone > 0) {
        time_zone = Math.abs(time_zone) + 8
        d.setHours(tmpHours + time_zone)
    } else if (time_zone < 0) {
        time_zone -= 8
        d.setHours(tmpHours - time_zone)
    }
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
}

// 获取现在时间并转化为数字[例:2020年1月1日 12:01:02  ->  20200101120102]
export function getNowNum() {
    let date = new Date()
    return (date.getFullYear()) * 100000000 + (date.getMonth() + 1) * 1000000 + (date.getDate() * 10000 + date.getHours() * 100 + date.getMinutes())
}

// export function checkMessagePrefix(context) {
//     let prefix = global['config'].default[context.apiName].prefix
//     let through = false
//     let raw_message = ''
//     for (let p of prefix) {
//         if (context["message"].startsWith(p)) {
//             raw_message = context["message"].substring(p.length).trim();
//             through = true;
//             break;
//         }
//     }
//     return {through, raw_message}
// }

// 获取本周每天的日期[needLastWeek:需要上周,needNextWeek:需要下周,isNum:转换为数字]
export function getWeekTimeRange(needLastWeek = true, needNextWeek = true, isNum = true) {
    let now = new Date()
    let range = []
    let max = 7
    if (needLastWeek) {
        now.setDate(now.getDate() - 7 - now.getDay() + 1)
        max += 7
    } else now.setDate(now.getDate() - now.getDay() + 1)
    if (needNextWeek) max += 7
    for (let i = 1; i <= max; i++) {
        if (!isNum) range.push(new Date(now))
        else {
            range.push(now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate())
        }
        now.setDate(now.getDate() + 1)
    }
    return range
}

// 日期比较|排序;用例:array.sort(dateCompare)
export function dateCompare(a, b) {
    let x = new Date(a)
    let y = new Date(b)
    let x_num = x.getFullYear() * 10000 + (x.getMonth() + 1) * 100 + x.getDate()
    let y_num = y.getFullYear() * 10000 + (y.getMonth() + 1) * 100 + y.getDate()
    return x_num - y_num
}

// 更新Bot准备状态
export function changeBotReady() {
    let ready = false
    let bot = []
    Object.keys(global.botReady.api).map(key => {
        if (global.botReady.api[key]) {
            ready = true
            bot.push(key)
        }
    })
    global.botReady.ready = ready
    global.botReady.bot = bot
    sendBotStatusToWs()
}

export function sendBotStatusToWs(){
    sendWsMsg(JSON.stringify({data:global.botReady,type:'status'}))
}

export function checkContextError(context) {
    if (context.hasOwnProperty('err')) {
        switch (context.err) {
            case 'isNotAdmin':
            case 0:
                context['message'] = '只有主人可以这么命令我'
                break;
            case 'isNotPrivate':
            case 1:
                context['message'] = '请私聊使用该指令'
                break;
            case 'isNotGroup':
            case 2:
                context['message'] = '请在群聊中使用该指令'
                break;
        }
    }
    return context
}

// 收到信息日志
export function onReceiveLog(record, apiName) {
    let sender = `[${apiName}]`;
    if (record["message_type"] === 'group') {
        sender += `[${record["group_id"]}] `;
    }
    sender += `${record["sender"]["nickname"]}(${record["user_id"]}): -> `;
    let message = record["message"];
    global['LOG'](sender + message);
    addChatLog(record, false, apiName)
}

// 发送信息日志
export function onSendLog(msgType_, replyId, selfId, message, apiName) {
    let receiver = `[${apiName}]`;
    if (msgType_ === 'group') {
        receiver += `[${replyId}] `;
    }
    receiver += `${selfId ? selfId : 'system'}: <- `;
    global['LOG'](receiver + message);
    const record = {message_type: msgType_, message: message, user_id: selfId ? selfId : 'system'}
    record[msgType[msgType_].reply] = replyId
    record.sender = {nickname: 'system'}
    addChatLog(record, true, apiName)
}

export function addChatLog(record, isSelf = false, apiName) {

    let chatLog = global.chatLog(apiName)
    let chatLogDb = global.chatLogDb(apiName)
    const chatSaveCount = 5

    let user_id = String(record['user_id'])
    let reply_id = record[msgType[record['message_type']].reply]
    const element = {
        tableName: `${record['message_type']}_${reply_id}_${apiName}`,
        user_id: isSelf ? 'system' : user_id,
        nick_name: record.sender['nickname'],
        message: CQ.CQFunc.transformCq(record.message, 'qq', apiName),
        send_time: new Date(),
        is_self: isSelf ? 1 : 0
    }
    if (chatLog[record['message_type']][reply_id]) {
        chatLog[record['message_type']][reply_id].push(element)
    } else {
        chatLog[record['message_type']][reply_id] = [element]
    }
    sendWsMsg(JSON.stringify({data: element, type: 'elem'}))
    if (chatLog[record['message_type']][reply_id].length >= chatSaveCount) {
        let rows = []
        for (const elem of chatLog[record['message_type']][reply_id]) {
            rows = [...rows, ...[elem.user_id, elem.nick_name, elem.message, elem.send_time, elem.is_self]]
        }
        chatLogDb.saveBatch(element.tableName, rows)
        chatLog[record['message_type']][reply_id] = []
    }
}

export const getChatLog = (apiName) => {
    let chatLog = global.chatLog(apiName)
    let chatLogDb = global.chatLogDb(apiName)

    chatLogDb.getChatTables(apiName).then(async (res) => {
        const chatLog_ = {group: {}, private: {}}
        if (res.length > 0) {
            for (const r of res) {
                let s = r.name.split('_')
                if (chatLog_.hasOwnProperty(s[0])) {
                    await chatLogDb.getChatLogByTableName(r.name).then(rows => {
                        chatLog_[s[0]][s[1] + '_' + s[2]] = {rows: rows, noMore: false, hasNew: true, newCount: 0}
                    })
                }
            }
        }
        for (const k of Object.keys(chatLog.group)) {
            let key = k + '_' + apiName
            let elem = chatLog.group[key]
            if (!!elem) {
                if (chatLog_.group.hasOwnProperty(key)) {
                    chatLog_.group[key].rows = [...chatLog_.group[key].rows, ...elem]
                } else {
                    chatLog_.group[key] = {rows: elem, noMore: false, hasNew: true, newCount: 0}
                }
            }
        }
        for (const k of Object.keys(chatLog.private)) {
            let key = k + '_' + apiName
            let elem = chatLog.private[key]
            if (!!elem) {
                if (chatLog_.private.hasOwnProperty(key)) {
                    chatLog_.private[key].rows = [...chatLog_.private[key].rows, ...elem]
                } else {
                    chatLog_.private[key] = {rows: elem, noMore: false, hasNew: true, newCount: 0}
                }
            }
        }
        for (const key of Object.keys(chatLog_.private)) {
            const elem = chatLog_.private[key]
            elem.rows.map(o => {
                o.message = CQ.CQFunc.transformCq(o.message, 'qq', apiName)
                return o
            })
        }
        for (const key of Object.keys(chatLog_.group)) {
            const elem = chatLog_.group[key]
            elem.rows.map(o => {
                o.message = CQ.CQFunc.transformCq(o.message, 'qq', apiName)
                return o
            })
        }
        sendWsMsg(JSON.stringify({data: chatLog_, type: 'all'}))
    })
}

export const getChatLogMore = ({type, id, apiName, index}) => {
    let tableName = type + '_' + id;
    let chatLogDb = global.chatLogDb(apiName)
    chatLogDb.getChatLogCountByTableName(tableName, index).then(res => {
        if (res.count >= 20) {
            chatLogDb.getChatLogByTableName(tableName, 20, index).then(rows => {
                rows.map(o=>{
                    o.message = CQ.CQFunc.transformCq(o.message, 'qq', apiName)
                    return o
                })
                sendWsMsg(JSON.stringify({data: {tableName, rows}, type: 'more'}))
            })
        } else if (res.count > 0) {
            chatLogDb.getChatLogByTableName(tableName, res.count, index).then(rows => {
                rows.map(o=>{
                    o.message = CQ.CQFunc.transformCq(o.message, 'qq', apiName)
                    return o
                })
                sendWsMsg(JSON.stringify({data: {tableName, rows}, type: 'more'}))
            })
        } else {
            sendWsMsg(JSON.stringify({data: {tableName, rows: []}, type: 'more'}))
        }
    })
}
