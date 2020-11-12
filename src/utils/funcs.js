const request = require('request')

export function checkIsAdmin(context){
    return global["config"].default["master"].some((o)=>o===context['user_id'])
}

export function checkIsGroup(context) {
    return context['message_type']==='group'
}

export function checkIsPrivate(context) {
    return context['message_type']==='private'
}

export function getWebFile(url,type,proxy=false) {
    return new Promise((resolve,reject)=>{
        request({
            url:url,
            method:type,
            proxy:proxy?'http://127.0.0.1:2802':null,
            timeout:1000
        },(err,response,body)=>{
            if (err) reject(err)
            else resolve({response, body})
        })
    })
}
