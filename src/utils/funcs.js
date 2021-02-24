const request = require('request')
const fs = require('fs')

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
    Object.keys(global.botReady.api).map(key=>{
        if (global.botReady.api[key]) {
            ready = true
            bot.push(key)
        }
    })
    global.botReady.ready = ready
    global.botReady.bot = bot
}
