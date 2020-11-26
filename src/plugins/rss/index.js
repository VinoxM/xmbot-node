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

function initMatchSetting() { // 初始化设置
    return new Promise((resolve, reject) => {
        setting = global["config"][__dirname.split("\\").pop()]
        if (!setting) reject('setting is null')
        if (setting.hasOwnProperty('rss')) {
            rss = setting['rss']
        }
        resolve()
    })
}

initMatchSetting().then(() => {
    startRSSHub()
}).catch(e=>{
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
                    Rss[rss['name']] = {
                        rss: line.rss,
                        title: rss['title'],
                        last_id: rss.last_id,
                        replace: rss['link_replace'],
                        push_list: {
                            user: rss.push_user === 'all' ? setting['push_list'].user : rss.push_user,
                            group: rss.push_group === 'all' ? setting['push_list'].group : rss.push_group
                        }
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
    handleRssText()
}

function handleRssText() { // 处理Rss信息
    let replyMsg = []
    for (const key of Object.keys(Rss)) {
        let r = Rss[key]
        let items = r.rss.channel.item
        let last_id = r.last_id
        for (const [index, item] of items.entries()) {
            let str = String(item.link).replace(r.replace, "")
            let id = 0
            if (str.length>14) str = str.substring(0,14)+'.'+str.substring(14)
            id = Number(str)
            if (index === 0) last_id = id
            if (id > r.last_id) {
                let pub_date = item['pubDate']?global['func']['toCCTDateString'](item['pubDate']):''
                let message = `${r.title}(${pub_date}):\n${item.title}`
                let images = checkImg(item.description)
                if (images.length > 0) {
                    message += images.join("\n")
                }
                message+=`\nlink:${r.link}`
                replyMsg.push({message: message, push_group: r.push_list.group, push_user: r.push_list.user})
            }
        }
        let index = rss.findIndex((e) => e.name === key)
        rss[index].last_id = last_id
    }
    setting.rss = rss
    global['reloadPlugin'](setting, __dirname.split("\\").pop())
    initMatchSetting()
    if (replyMsg.length > 0) {
        global['LOG'](`RSS源共有${replyMsg.length}条新信息`)
        for (const msg of replyMsg) {
            if (msg.push_user.length>0){
                for (const user of msg.push_user){
                    global.replyPrivate({message:msg.message,user_id:user})
                }
            }
            if (msg.push_group.length>0){
                for(const group of msg.push_group){
                    global.replyGroup({message:msg.message,group_id:group})
                }
            }
        }
    } else {
        global['LOG']('RSS源没有发现新的信息')
    }
}

function checkImg(description) { // 检查是否有图片
    let des = String(description)
    let images = []
    let index_s = des.indexOf('<img')
    if (index_s > -1) {
        let sub = des.substring(index_s)
        let img_sub = sub.substring(sub.indexOf("src=") + 5)
        let img = img_sub.substring(0, img_sub.indexOf("\""))
        images.push(global.CQ.img_web(img, true))
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
