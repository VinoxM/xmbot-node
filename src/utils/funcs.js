const request = require('request')
const fs = require('fs')

export function checkIsAdmin(context){
    return global["config"].default["master"].some((o)=>o===context['user_id'])
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
