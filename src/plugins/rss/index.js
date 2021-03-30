const request = require('request')
const x2js = require('x2js')

let setting = {};
let rss = []
let Rss = {}
let interval_pro = null
const timeUnits = {
    seconds: {time: 1000, title: '秒'},
    minutes: {time: 60 * 1000, title: '分钟'},
    hours: {time: 60 * 60 * 1000, title: '小时'}
}

const matchDict = [
    {
        match: ["屏蔽rss", "屏蔽推送"],
        startWith: true,
        needReplace: true,
        rules: ['admin'],
        func: shieldRss
    },
    {
        match: ["订阅rss", "订阅推送"],
        startWith: true,
        needReplace: true,
        rules: ['admin'],
        func: subscribeRss
    },
    {
        match: ["启用rss", "启用推送"],
        startWith: true,
        needReplace: true,
        rules: ['admin', 'private'],
        func: openRss
    },
    {
        match: ["关闭rss", "关闭推送"],
        startWith: true,
        needReplace: true,
        rules: ['admin', 'private'],
        func: closeRss
    },
]

function initMatchSetting() { // 初始化设置
    return new Promise((resolve, reject) => {
        setting = global["config"][__dirname.split(global['separator']).pop()]
        if (!setting) reject('setting is null')
        if (setting.hasOwnProperty('rss')) {
            rss = setting['rss']
        }
        resolve()
    })
}

initMatchSetting().then(() => {
    startRSSHub()
}).catch(e => {
    global['ERR'](e)
})

async function getRss(rss) { // 获取RSS源
    global['LOG'](`正在获取RSS源:${rss.title}`)
    let proxy = global['config']['default'].proxy
    return new Promise((resolve, reject) => {
        request({
            url: rss.source,
            headers: rss.headers,
            proxy: rss.proxy ? (proxy ? proxy : 'http://127.0.0.1:2802') : null,
        }, (err, res, body) => {
            if (err) {
                global['ERR'](`获取RSS源失败:${rss.title}`)
                reject(err)
            } else {
                let xmlReader = new x2js()
                let line = xmlReader.xml2js(body)
                if (line.rss) {
                    let push_list = {}
                    for (const key of Object.keys(rss.push_list)) {
                        push_list[key] = {
                            group: rss.push_list[key].group==='all'?setting['push_list'][key].group:rss.push_list[key].group,
                            private: rss.push_list[key].private==='all'?setting['push_list'][key].private:rss.push_list[key].private
                        }
                    }
                    Rss[rss['name']] = {
                        rss: line.rss,
                        title: rss['title'],
                        last_id: rss.last_id,
                        word_filter: rss['word_filter'],
                        replace_link: rss['link_replace'],
                        push_list: push_list
                    }
                    global['LOG'](`成功获取RSS源:${rss.title}`)
                } else {
                    global['ERR'](`获取RSS源失败:${rss.title}`)
                    reject(err)
                }
                resolve()
            }
        })
    })
}

async function loadAllRss() { // 加载所有RSS订阅
    global['LOG']('RSS订阅信息加载开始---')
    for (const s of rss) {
        if (!s.on) continue
        await getRss(s).catch(e => {
            global['ERR'](e)
        })
    }
    await handleRssText()
}

async function handleRssText() { // 处理Rss信息
    let replyMsg = []
    for (const key of Object.keys(Rss)) {
        let r = Rss[key]
        let items = r.rss.channel.item
        let last_id = r.last_id
        // console.log('Last Id :' + last_id)
        if (!Array.isArray(items)) items = [items]
        let isLast = true
        for (const [index, item] of items.entries()) {
            if (checkWordFilter(item.description,r.word_filter)) continue
            let str = String(item.link).replace(r['replace_link'], "")
            if (isLast) {
                last_id = str
                isLast = false
            }
            // console.log(str)
            if (strCompareTo(str, r.last_id)) {
                let pub_date = item['pubDate'] ? global['func']['toCCTDateString'](item['pubDate']) : ''
                let message = `${r.title}(${pub_date}):\n${item.title}`
                let images = checkImg(item.description)
                if (images.length > 0) {
                    message += images.join("\n")
                }
                message += `\n链接:${item.link}`
                replyMsg.push({message: message, push_list:r.push_list})
            } else {
                break
            }
        }
        let index = rss.findIndex((e) => e.name === key)
        rss[index].last_id = last_id
    }
    setting.rss = rss
    await reloadRssPlugins()
    if (replyMsg.length > 0) {
        global['LOG'](`RSS源共有${replyMsg.length}条新信息`)
        for (const msg of replyMsg) {
            global['pushMsg'](msg.message,msg.push_list)
        }
    } else {
        global['LOG']('RSS源没有发现新的信息')
    }
}

function checkWordFilter(title,filters) {
    return filters.some(o=>{
        return title.indexOf(o) > -1
    })
}

function checkImg(description) { // 检查是否有图片
    let des = String(description)
    let images = []
    let index_s = des.indexOf('<img')
    if (index_s > -1) {
        let sub = des.substring(index_s)
        let img_sub = sub.substring(sub.indexOf("src=") + 5)
        let img = img_sub.substring(0, img_sub.indexOf("\""))
        images.push(global.CQ().img_web(img, true))
        if (img_sub.indexOf("<img") > -1) {
            let res = checkImg(img_sub)
            if (res.length > 0) images = [...images, ...res]
        }
    }
    return images
}

function startRSSHub() { // 开始运行RSS检查
    let init_ = setting['initial_time']
    let init_time = (Number(init_.time) * timeUnits[init_['units']].time).toFixed(0)
    let init_title = timeUnits[init_['units']].title
    global['LOG'](`${init_.time}${init_title}后开始加载RSS订阅信息`)
    let inter_ = setting['interval']
    let interval = (Number(inter_.time) * timeUnits[inter_['units']].time).toFixed(0)
    let interval_title = timeUnits[inter_['units']].title
    setTimeout(() => {
        loadAllRss().then(() => {
            global['LOG'](`RSS订阅信息加载结束---,下次加载在${inter_.time}${interval_title}后`)
            interval_pro = setInterval(() => {
                loadAllRss().then(() => global['LOG'](`RSS订阅信息加载结束---,下次加载在${inter_.time}${interval_title}后`))
            }, interval)
        })
    }, init_time)
}

async function shieldRss(context) {
    let title = context['raw_message']
    if (title === '') {
        global.replyMsg(context, '请输入要屏蔽的推送', true)
        return
    }
    let isGroup = global['func']['checkIsGroup'](context)
    let changed = false
    setting.rss = rss.map(o => {
        if (o['name_filter'].indexOf(title.toUpperCase()) > -1) {
            changed = true
            let key = isGroup ? 'group' : 'user'
            let reply_id = context[key + '_id']
            let push_list = []
            let apiName = context.apiName
            if (o.push_list[apiName][key] === 'all') {
                push_list = new Array(setting.push_list[apiName][key])
            } else {
                push_list = o.push_list[apiName][key]
            }
            push_list.splice(push_list.indexOf(reply_id), 1)
            o.push_list[apiName][key] = push_list
        }
        return o
    })
    if (changed) {
        await reloadRssPlugins()
        global.replyMsg(context, `已屏蔽对${isGroup ? '该群' : '您'}的${title}推送`)
    } else {
        global.replyMsg(context, `未找到${title}推送`)
    }
}

async function subscribeRss(context) {
    let title = context['raw_message']
    if (title === '') {
        global.replyMsg(context, '请输入要订阅的推送', true)
        return
    }
    let isGroup = global['func']['checkIsGroup'](context)
    let changed = false
    setting.rss = rss.map(o => {
        if (o['name_filter'].indexOf(title.toUpperCase()) > -1) {
            changed = true
            let key = isGroup ? 'group' : 'user'
            let reply_id = context[key + '_id']
            let push_list = []
            let apiName = context.apiName
            if (o.push_list[apiName][key] === 'all') {
                push_list = new Array(setting.push_list[apiName][key])
            } else {
                push_list = o.push_list[apiName][key]
            }
            if (push_list.indexOf(reply_id) === -1) {
                push_list.push(reply_id)
            }
            o.push_list[apiName][key] = push_list
        }
        return o
    })
    if (changed) {
        await reloadRssPlugins()
        global.replyMsg(context, `已订阅对${isGroup ? '该群' : '您'}的${title}推送`)
    } else {
        global.replyMsg(context, `未找到${title}推送`)
    }
}

async function openRss(context) {
    let title = context['raw_message']
    if (title === '') {
        global.replyMsg(context, '请输入要启用的推送', true)
        return
    }
    let changed = false
    setting.rss = rss.map(o => {
        if (o['name_filter'].indexOf(title.toUpperCase()) > -1) {
            changed = true
            o.on = true
        }
        return o
    })
    if (changed) {
        await reloadRssPlugins()
        global.replyMsg(context, `已启用推送${title}`)
    } else {
        global.replyMsg(context, `未找到推送${title}`)
    }
}

async function closeRss(context) {
    let title = context['raw_message']
    if (title === '') {
        global.replyMsg(context, '请输入要关闭的推送', true)
        return
    }
    let changed = false
    setting.rss = rss.map(o => {
        if (o['name_filter'].indexOf(title.toUpperCase()) > -1) {
            changed = true
            o.on = false
        }
        return o
    })
    if (changed) {
        await reloadRssPlugins()
        global.replyMsg(context, `已关闭推送${title}`)
    } else {
        global.replyMsg(context, `未找到推送${title}`)
    }
}

function strCompareTo(a, b) { // a>b return true; a<=b return false
    if (a.length !== b.length)
        return a.length > b.length
    for (let i = 0; i < a.length; i += 4) {
        let end = (i + 4 < a.length) ? (i + 4) : a.length
        let x = Number(a.substring(i, end))
        let y = Number(b.substring(i, end))
        if (x !== y)
            return x > y
    }
    return false
}

async function reloadRssPlugins(json = false) {
    await global['reloadPlugin'](json ? json : setting, __dirname.split(global['separator']).pop())
    await initMatchSetting()
}

function rssSourceTest(source, proxy) {
    return new Promise((resolve, reject) => {
        request({
            url: source,
            proxy: proxy ? global['config']['default'].proxy : null
        }, (err, res, body) => {
            if (err) reject(err)
            let xmlReader = new x2js()
            let line = xmlReader.xml2js(body)
            resolve({body: body, line: line})
        })
    })
}

export default {
    match: (context) => {
        global['func']['generalMatch'](context, matchDict)
    },
    needPrefix: true,
    matchDict,
    rssSourceTest,
    reloadRssPlugins
}
