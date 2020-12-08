import {PcrCalendar} from './pcr-calendar'
import schedule from 'node-schedule'
import fs from "fs-extra";
import path from "path";

let pcrCalendar = null
let setting = null
let jobs = {}

function initSetting() {
    setting = global['config'][__dirname.split("\\").pop()]['pcr']
}

initSetting()

initPcr()

export function initPcr() {
    for (const key of Object.keys(jobs)) {
        let job = jobs[key]
        if (job && job.hasOwnProperty('cancel')) {
            job.cancel()
        }
    }
    pcrCalendar = new PcrCalendar()
    pcrCalendar.initDb().then(() => {
        pcrCalendar.initCalendar().then(() => {
            if (!setting.on) return
            let rules = setting.rules
            for (const rule of rules) {
                if (!rule.on) continue
                let r = new schedule.RecurrenceRule();
                for (const key of Object.keys(rule.time)) {
                    r[key] = rule.time[key]
                }
                global['LOG'](`启动PCR活动日历自动推送:${rule.name}[${getTimeLocalString(rule.time)}]`)
                jobs[rule.name] = schedule.scheduleJob(r, () => {
                    if (rule['needFlush']) {
                        pcrCalendar.initCalendar().then(() => {
                            pushCalendar(rule.push_list, rule.type, setting.push_list)
                        })
                    } else pushCalendar(rule.push_list, rule.type, setting.push_list)
                })
            }
        })
    })
}

function pushCalendar(push_list, type, all_list) {
    global['LOG'](`开始推送PCR活动日历`)
    pcrCalendar.pushCalendar(push_list.group === 'all' ? all_list.group : push_list.group, type, setting['default_area'])
    pcrCalendar.pushCalendar(push_list.private === 'all' ? all_list.private : push_list.private, type, setting['default_area'], false)
}

export function toggleSwitch(context, isOn = true) {
    setting.on = isOn
    saveSetting(setting)
    global.replyMsg(context,`已${isOn?'启用':'禁用'}PCR活动日历`)
}

export function toggleJobSwitch(context, isOn = true) {
    let msg = context['raw_message']
    if (msg === '') {
        global.replyMsg(context, `请输入要${isOn ? '开启' : '关闭'}的日历推送`)
        return
    }
    let changed = setting.rules.some(rule => {
        if (rule.filter.indexOf(String(msg).toLowerCase()) > -1) {
            rule.on = isOn
            return true
        }
        return false
    })
    if (!changed) {
        global.replyMsg(context, `日历推送${msg}未找到`)
        return
    }
    global.replyMsg(context, `已${isOn ? '开启' : '关闭'}日历推送${msg}`)
    saveSetting(setting)
}

export function toggleJobPush(context, isOn = true) {
    let isGroup = global['func']['checkIsGroup'](context)
    let key = isGroup ? 'group' : 'private'
    let msg = context['raw_message']
    if (msg === '') {
        global.replyMsg(context, `请输入要${isOn ? '订阅' : '屏蔽'}的日历推送`)
        return
    }
    let changed = false
    setting.rules.map(rule => {
        if (rule.filter.indexOf(String(msg).toLowerCase()) > -1) {
            changed = true
            let push_list = []
            if (!isOn) {
                if (rule.push_list[key] === 'all' && setting.push_list[key].indexOf(context[key + '_id']) > -1) {
                    push_list = new Array(setting.push_list[key])
                    push_list.splice(setting.push_list[key].indexOf(context[key + '_id']), 1)
                } else {
                    push_list = rule.push_list[key]
                    push_list.splice(push_list.indexOf(context[key + '_id']), 1)
                }
            } else {
                if (rule.push_list[key] === 'all') {
                    push_list = new Array(setting.push_list[key])
                } else {
                    push_list = rule.push_list[key]
                }
                push_list.push(context[key + '_id'])
            }
            rule.push_list[key] = push_list
        }
    })
    if (!changed) {
        global.replyMsg(context, `日历推送${msg}未找到`)
        return
    }
    global.replyMsg(context, `已${isOn ? '订阅' : '屏蔽'}对${isGroup ? '该群的' : '您的'}日历推送${msg}`)
    saveSetting(setting)
}

function reloadCalendar() {
    global['reloadPlugin'](null, __dirname.split("\\").pop(), true)
    initSetting()
    initPcr()
}

export function saveSetting(json, fileName = 'setting-pcr.json') { // 保存配置文件
    return new Promise((resolve, reject) => {
        fs['writeFile'](path.join(__dirname, fileName), JSON.stringify(json, null, 2), "utf8", async (err) => {
            if (err) {
                global['ERR'](err)
                reject(err)
            } else {
                reloadCalendar()
                resolve()
            }
        })
    })
}

function getTimeLocalString(time) {
    const week = {1: '周一', 2: '周二', 3: '周三', 4: '周四', 5: '周五', 6: '周六', 7: '周日'}
    let result = []
    let hasYear = time.hasOwnProperty('year')
    if (hasYear) result.push(time.year.join(',') + '年')
    let hasMonth = time.hasOwnProperty('month')
    if (hasMonth) result.push(hasYear ? (time.month.join(',') + '月') : ('每年' + time.month.join(',') + '月'))
    let hasDate = time.hasOwnProperty('date')
    if (hasDate) result.push(hasMonth ? (time.date.join(',') + '日') : ('每月' + time.date.join(',') + '日'))
    let hasWeek = time.hasOwnProperty('dayOfWeek')
    if (hasWeek) result.push('每' + time.dayOfWeek.map(o => week[o]).join(','))
    let hasHour = time.hasOwnProperty('hour')
    if (hasHour) result.push(hasYear || hasMonth || hasDate || hasWeek ? (time.hour.join(',') + '时') : ('每天' + time.hour.join(',') + '时'))
    let hasMinute = time.hasOwnProperty('minute')
    if (hasMinute) result.push(hasHour ? (time.minute.join(',') + '分') : ('每小时' + time.minute.join(',') + '分'))
    let hasSecond = time.hasOwnProperty('second')
    if (hasSecond) result.push(hasMinute ? (time.second.join(',') + '秒') : ('每分' + time.second.join(',') + '秒'))
    return result.join('/')
}
