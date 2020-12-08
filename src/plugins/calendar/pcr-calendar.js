import request from 'request'
import {CalendarDb} from './calendarDb'

export class PcrCalendar {
    constructor() {
        this.cal_db = new CalendarDb('calendar')
        this.calendar = {
            jp: {},
            tw: {},
            cn: {}
        }
        this.onInit = false
    }

    initDb = () => {
        return initDb(this.cal_db)
    }

    initCalendar = () => {
        return new Promise((resolve, reject) => {
            if (this.onInit) reject({err: 0, reason: '正在初始化中'})
            this.onInit = true
            initCalendar(this.cal_db, this.calendar)
                .then(() => {
                    this.onInit = false
                    resolve()
                })
                .catch(err => {
                    reject({err: 1, reason: err})
                })
        })
    }

    pushCalendar = (list, type, area, isGroup = true) => {
        let range = [new Date()]
        let reply_prefix = ''
        let needDate = false
        switch (type) {
            case 'today':
                reply_prefix = calendar_source[area].title + '今日活动'
                break
            case 'yesterday':
                reply_prefix = calendar_source[area].title + '昨日活动'
                range[0].setDate(range[0].getDate() - 1)
                break
            case 'tomorrow':
                reply_prefix = calendar_source[area].title + '明日活动'
                range[0].setDate(range[0].getDate() + 1)
                break
            case 'thisWeek':
                reply_prefix = calendar_source[area].title + '本周活动'
                needDate = true
                range = global['func']['getWeekTimeRange'](false, false, false)
                break
            case 'nextWeek':
                reply_prefix = calendar_source[area].title + '下周活动'
                needDate = true
                range = global['func']['getWeekTimeRange'](false, true, false).slice(7)
                break
            case 'lastWeek':
                reply_prefix = calendar_source[area].title + '上周活动'
                needDate = true
                range = global['func']['getWeekTimeRange'](true, false, false).slice(0, 8)
                break
        }
        let reply_list = []
        range.map(r => {
            let num = r.getFullYear() * 10000 + (r.getMonth() + 1) * 100 + r.getDate()
            if (this.calendar[area].hasOwnProperty(num)) {
                let info = this.calendar[area][num].join('\n')
                let d = r.getFullYear() + '/' + r.getMonth() + '/' + r.getDate()
                reply_list.push(`${needDate ? d : ''}->\n${info}`)
            }
        })
        let reply = reply_prefix + reply_list.join('\n')
        for (const elem of list) {
            let context = {message: reply}
            if (isGroup) {
                context['group_id'] = elem
                context['message_type'] = 'group'
            } else {
                context['user_id'] = elem
                context['message_type'] = 'private'
            }
            global.replyMsg(context)
        }
    }
}

function initDb(db) {
    return new Promise((resolve, reject) => {
        db.tableExists().then(res => {
            if (res.count === 0) {
                db.tableCreate()
            }
            resolve()
        }).catch((err) => {
            global['ERR'](err)
        })
    })
}

const calendar_source = {
    tw: {
        title: '台服',
        url: 'https://pcredivewiki.tw/static/data/event.json',
        props: {
            name: 'campaign_name',
            start_time: 'start_time',
            end_time: 'end_time'
        },
        needProxy: true
    },
    jp: {
        title: '日服',
        url: 'https://pcr.satroki.tech/api/Manage/GetEvents?s=jp',
        props: {
            name: 'title',
            start_time: 'startTime',
            end_time: 'endTime'
        },
        needProxy: false
    },
    cn: {
        title: '国服',
        url: 'https://pcr.satroki.tech/api/Manage/GetEvents?s=cn',
        props: {
            name: 'title',
            start_time: 'startTime',
            end_time: 'endTime'
        },
        needProxy: false
    }
}

async function initCalendar(cal_db, calendar) {
    global['LOG']('开始加载活动日历')
    for (const key of Object.keys(calendar_source)) {
        let source = calendar_source[key]
        global['LOG'](`更新${source.title}活动日历`)
        await getCalendar(source).then(async (res) => {
            let updateCount = 0
            for (const e of res) {
                let params = {
                    name: e[source.props.name],
                    start_time: new Date(e[source.props.start_time]),
                    end_time: new Date(e[source.props.end_time]),
                    area: key
                }
                await cal_db.campaignExists(params)
                    .then(r => {
                        if (r.count === 0) {
                            global['LOG'](`${source.title}活动更新 -> ${e[source.props.name]}:[${e[source.props.start_time]}-${e[source.props.end_time]}]`)
                            params.type = e['type']
                            cal_db.addCalendar(params)
                            updateCount++
                        }
                    })
            }
            if (updateCount === 0) global['LOG'](`${source.title}活动未发现更新`)
            else global['LOG'](`${source.title}活动共 ${updateCount} 个更新`)
            await initCampaign(key, cal_db, calendar)
        }).catch(err => global['ERR'](`获取${source.title}活动日历失败:${err}`))
    }
    global['LOG']('活动日历加载完成')
}

function getCalendar(source) {
    let proxy = global['config']['default'].proxy
    return new Promise((resolve, reject) => {
        request({
            url: source.url,
            timeout: 2000,
            method: 'GET',
            proxy: source.needProxy ? (proxy ? proxy : 'http://127.0.0.1:2802') : null
        }, (err, res, body) => {
            if (!err) {
                resolve(JSON.parse(body))
            } else reject(err)
        })
    })
}

async function initCampaign(area, cal_db, calendar) {
    let cal = {}
    let range = global['func']['getWeekTimeRange']()
    for (const r of range) {
        cal[r] = []
    }
    await cal_db.selByArea(area).then(res => {
        for (const r of res) {
            let sTime = new Date(r['start_time'])
            let s = sTime.getFullYear() * 10000 + (sTime.getMonth() + 1) * 100 + sTime.getDate()
            let eTime = new Date(r['end_time'])
            let e = eTime.getFullYear() * 10000 + (eTime.getMonth() + 1) * 100 + (eTime.getHours() === 4 ? eTime.getDate() - 1 : eTime.getDate())
            let ran = []
            if (s < range[0]) {
                if (e < range[0]) continue // range外
                if (e >= range[20]) { // 全range
                    ran = range
                }
                if (e >= range[0] && e < range[20]) {
                    let index = range.indexOf(e)
                    ran = range.slice(0, index + 1)
                }
            } else if (s >= range[0] && s <= range[20]) {
                let s_index = range.indexOf(s)
                if (e <= range[20]) {
                    let e_index = range.indexOf(e)
                    ran = range.slice(s_index, e_index + 1)
                } else {
                    ran = range.slice(s_index)
                }
            } else continue
            for (const elem of ran) {
                let reply = r.name
                if (elem === s && elem !== e) reply += `[New->${getDateTime(sTime)}]`
                if (elem === e && elem !== s) reply += `[End->${getDateTime(eTime)}]`
                cal[elem].push(reply)
            }
        }
        calendar[area] = cal
    })
}

function getDateTime(date) {
    let reply = ''
    let hours = date.getHours()
    let minutes = date.getMinutes()
    if (hours < 5) reply += '明天'
    reply += `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
    return reply
}
