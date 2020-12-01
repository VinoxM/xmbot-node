const request = require('request')
const fs = require('fs')

export function generalMatch(context,matchDict) {
    let raw_msg = context["raw_message"];
    for (let m of matchDict){
        if (m.needPrefix&&raw_msg===context['message']&&global['func']['checkIsGroup'](context)) continue
        if (!m.startWith){
            let index = m.match.indexOf(raw_msg.toLowerCase())
            if (index > -1) {
                if (m.needReplace)
                    context['raw_message']=context['raw_message'].replace(m.match[index],'').trim()
                return checkMatchRules(m,context)
            }
        }else{
            for (let s of m.match){
                if (raw_msg.toLowerCase().startsWith(s)){
                    if (m.needReplace)
                        context['raw_message']=context['raw_message'].replace(s,'').trim()
                    return checkMatchRules(m,context)
                }
            }
        }
    }
}

export function checkMatchRules(m,context) {
    let check = m.rules&&m.rules.length>0?checkRules(m.rules,context):'-1'
    if (check==='-1')
        return m.func(context)
    else {
        context['err']=check
        global.replyMsg(context,null,true)
    }
}

function checkRules(rules,context) {
    if (rules.indexOf('admin')>-1&&!checkIsAdmin(context)) return '0'
    if (rules.indexOf('private')>-1&&!checkIsPrivate(context)) return '1'
    if (rules.indexOf('group')>-1&&!checkIsGroup(context)) return '2'
    return '-1'
}

export function checkIsAdmin(context){
    return global["config"].default["master"].some((o)=>String(o)===String(context['user_id']))
}

export function checkIsGroup(context) {
    return context['message_type']==='group'
}

export function checkIsPrivate(context) {
    return context['message_type']==='private'
}

export function getWebFile(url,type,needProxy=false) {// 获取网页图片,暂只支持http
    let proxy = global['config']['default'].proxy
    return new Promise((resolve,reject)=>{
        request({
            url:url,
            method:type?type:'GET',
            proxy:needProxy?(proxy?proxy:'http://127.0.0.1:2802'):null,
            timeout:1000
        },(err,response,body)=>{
            if (err) reject(err)
            else resolve({response, body})
        })
    })
}

export function downloadWebFile(url,file,needProxy = false) {
    let proxy = global['config']['default'].proxy
    return new Promise((resolve,reject)=>{
        request({
            url:url,
            method:'GET',
            proxy:needProxy?(proxy?proxy:'http://127.0.0.1:2802'):null,
            timeout:1000
        },(err,response,body)=>{
            if (!err && response.statusCode === 200){
                let stream = fs.createWriteStream(file)
                request({
                    url:url,
                    method:'GET',
                    proxy:needProxy?(proxy?proxy:'http://127.0.0.1:2802'):null,
                    timeout:1000
                }).pipe(stream).on('close',(e)=>{
                    if (e) reject(err)
                    else resolve(true)
                })
            }else reject(err)
        })
    })
}

export function toCCTDateString(date) {
    let d = new Date(date)
    let tmpHours = d.getHours()
    let time_zone = d.getTimezoneOffset()/60 + 8
    if (time_zone>0){
        time_zone = Math.abs(time_zone) +8
        d.setHours(tmpHours+time_zone)
    }else if (time_zone<0){
        time_zone -= 8
        d.setHours(tmpHours-time_zone)
    }
    return `${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getDate()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}`
}

export function getNowNum(){
    let date = new Date()
    return (date.getFullYear()) * 100000000 + (date.getMonth() + 1) * 1000000 + (date.getDate() * 10000 + date.getHours() * 100 + date.getMinutes())
}

export function checkMessagePrefix(context) {
    let prefix = global['config'].default.prefix
    let through = false
    let raw_message = ''
    for (let p of prefix){
        if (context["message"].startsWith(p)) {
            raw_message=context["message"].substring(p.length).trim();
            through = true;
            break;
        }
    }
    return {through,raw_message}
}
