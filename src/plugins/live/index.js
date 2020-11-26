import fs from "fs-extra";
import path from "path";

const request = require('request')

let setting = {}
let areaList = []
let roomInfo = {}
let rtmpInfo = {}

function initSetting() {
    setting = global["config"][__dirname.split("\\").pop()]
}

let area_info = {id:0,name:''}

initSetting()

const matchDict = [
    {match: ["开始直播","开播"], startWith: false, needReplace: false, rules: ['admin'], func: startLive},
    {match: ["关闭直播","下播"], startWith: false, needReplace: false, rules: ['admin'], func: stopLive},
    {match: ["修改直播间标题:","修改直播间标题"], startWith: true, needReplace: true, rules: ['admin'], func: changeTitle},
    {match: ["修改直播分区:","修改直播分区"], startWith: true, needReplace: true, rules: ['admin'], func: changeArea},
    {match: ["更新直播cookie:","更新直播cookie"], startWith: true, needReplace: true, rules: ['admin','private'], func: updateCookie},
    {match: ["更新直播token:","更新直播token"], startWith: true, needReplace: true, rules: ['admin','private'], func: updateToken},
    {match: ["直播信息"], startWith: false, needReplace: false, rules: [], func: getRoomInfo},
    {match: ["查看用户直播信息:","查看用户直播信息"], startWith: true, needReplace: true, rules: [], func: (context)=>getRoomInfo(context,true)},
    {match: ["查看直播间信息:","查看直播间信息"], startWith: true, needReplace: true, rules: [], func: (context)=>getRoomInfo(context,true,true)},
]

function match(context) {
    global['func']['generalMatch'](context, matchDict)
}

function getAreaList() {
    return new Promise((resolve, reject) => {
        request({
            url: 'https://api.live.bilibili.com/room/v1/Area/getList',
            method: 'GET',
            headers: {cookie: setting.cookie}
        }, (err, res, body) => {
            if (!err) {
                let result = JSON.parse(body)
                resolve(result)
            } else
                reject(err)
        })
    })
}

getAreaList().then(res => {
    let area = []
    let resData = res.data
    for (const d of resData) {
        d.list.map(o=>{
            area.push({id:o.id,name:o.name})
        })
    }
    areaList = area
    global['LOG']('已获取直播区域')
}).catch(err => {
    global['ERR'](`获取直播区域失败:${err}`)
})

function getRoomBaseInfo(id,isByRoomId = true) {
    let params = ''
    if (id){
        params = isByRoomId?`room_ids=${id}`:`uids=${id}`
    } else {
        params = `room_ids=${setting['room_id']}`
    }
    return new Promise((resolve, reject) => {
        request({
            url: `https://api.live.bilibili.com/xlive/web-room/v1/index/getRoomBaseInfo?req_biz=link-center&`+params,
            method: 'GET',
            headers: {cookie: setting.cookie}
        }, (err, res, body) => {
            if (!err) {
                let result = JSON.parse(body)
                resolve(result)
            } else
                reject(err)
        })
    })
}

function getStreamInfo() {
    return new Promise((resolve, reject) => {
        request({
            url: `https://api.live.bilibili.com/live_stream/v1/StreamList/get_stream_by_roomId?room_id=${setting.room_id}`,
            method: 'GET',
            headers: {cookie: setting.cookie}
        }, (err, res, body) => {
            if (!err) {
                let result = JSON.parse(body)
                resolve(result)
            } else
                reject(err)
        })
    })
}

async function flushRoomInfo(needFlushRtmp = true){
    await getRoomBaseInfo().then(res => {
        roomInfo = res.data['by_room_ids'][setting['room_id']]
        if (roomInfo.online===1&&needFlushRtmp){
            getStreamInfo().then(res=>{
                rtmpInfo=res.data['rtmp']
            }).catch(err=>{
                global['ERR'](`获取直播流信息失败:${err}`)
            })
        }
        global['LOG']('已获取直播房间信息')
    }).catch(err => {
        global['ERR'](`获取直播房间信息失败:${err}`)
    })
}

flushRoomInfo().then()

function startLive(context) {
    if (roomInfo['live_status']===1){
        global.replyMsg(context,`已开始直播\n${getLiveStr()}`+(global['func']['checkIsGroup']?getRtmpStr(rtmpInfo):''),true)
        return
    }
    if (roomInfo['area_id']){
        area_info= {id:roomInfo['area_id'],name:roomInfo['area_name']}
    }else{
        let area = context['raw_message']
        if(area===''){
            global.replyMsg(context,'请输入直播分区',true)
            return
        }
        let flag = areaList.some(o=>{
            if (String(o.id)===area||String(o.name)===area){
                area_info= {id:o.id,name:o.name}
                return true
            }
            return false
        })
        if (!flag){
            global.replyMsg(context,`未找到分区:${area}`,true)
            return
        }
    }
    request.post({
        url:'https://api.live.bilibili.com/room/v1/Room/startLive',
        form:{room_id:setting['room_id'],platform:'pc',area_v2:area_info.id,csrf_token:setting['csrf_token'],csrf:setting['csrf_token']},
        headers:{cookie:setting.cookie}
    },(err,response,body)=>{
        if (err){
            global['ERR'](`开始直播出错:${err}`)
            global.replyMsg(context,'开始直播出错',true)
        }else{
            let res = JSON.parse(body)
            if (res.code!==0){
                global.replyMsg(context,`开始直播失败:${res.msg}`,true)
                return
            }
            let rtmp = {
                addr:res.data['rtmp']['addr'],
                code:res.data['rtmp']['code']
            }
            rtmpInfo = rtmp
            let live_info = getLiveStr()
            let rtmp_info = getRtmpStr(rtmp)
            global.replyMsg(context,`开始直播成功\n${live_info}`+(global['func']['checkIsGroup'](context)?'':rtmp_info),true)
            flushRoomInfo(false).then()
        }
    })
}

function stopLive(context) {
    if (roomInfo['live_status']===0){
        global.replyMsg(context,'您未开始直播',true)
        return
    }
    request.post({
        url:'https://api.live.bilibili.com/room/v1/Room/stopLive',
        form:{room_id:setting['room_id'],platform:'pc',csrf_token:setting['csrf_token'],csrf:setting['csrf_token']},
        headers:{cookie:setting.cookie}
    },(err,response,body)=>{
        if (err){
            global['ERR'](`关闭直播出错:${err}`)
            global.replyMsg(context,'关闭直播出错',true)
        }else{
            let res = JSON.parse(body)
            if (res.code===0){
                global.replyMsg(context,'关闭直播成功',true)
                flushRoomInfo().then()
            }else{
                global.replyMsg(context,`关闭直播失败:${res.msg}`,true)
            }
        }
    })
}

function changeTitle(context) {
    let title = context['raw_message']
    updateTitle(title).then(res=>{
        if (res.code === 0) {
            global.replyMsg(context,'修改直播间标题成功',true)
            flushRoomInfo(false).then()
        }else{
            global.replyMsg(context,`修改直播间标题失败:${res.msg}`,true)
        }
    }).catch(err=>{
        global['ERR'](`修改直播间标题出错:${err}`)
        global.replyMsg(context,'修改直播间标题出错',true)
    })
}

function updateTitle(title) {
    return new Promise((resolve, reject) => {
        request.post({
            url:'https://api.live.bilibili.com/room/v1/Room/update',
            form:{room_id:setting['room_id'],title:title,csrf_token:setting['csrf_token'],csrf:setting['csrf_token']},
            headers:{cookie:setting.cookie}
        },(err,response,body)=>{
            if (err){
                reject(err)
            }else{
                let res = JSON.parse(body)
                resolve(res)
            }
        })
    })
}

function changeArea(context) {
    let area = context['raw_message']
    let flag = areaList.some(o=>{
        if (String(o.id)===area||String(o.name)===area){
            area_info= {id:o.id,name:o.name}
            return true
        }
        return false
    })
    if (!flag){
        global.replyMsg(context,`未找到分区:${area}`,true)
        return
    }
    updateArea(area_info.id).then(res=>{
        if (res.code===0){
            global.replyMsg(context,`成功切换分区为${area}`,true)
        }else{
            global.replyMsg(context,`切换分区${area}失败:${res.msg}`,true)
        }
    }).catch(err=>{
        global['ERR'](`切换分区出错:${err}`)
        global.replyMsg(context,`切换分区${area}出错`,true)
    })
}

function updateArea(area_id) {
    return new Promise((resolve, reject) => {
        request.post({
            url:'https://api.live.bilibili.com/room/v1/Room/update',
            form:{room_id:setting['room_id'],area_id:area_id,csrf_token:setting['csrf_token'],csrf:setting['csrf_token']},
            headers:{cookie:setting.cookie}
        },(err,response,body)=>{
            if (err){
                reject(err)
            }else{
                let res = JSON.parse(body)
                resolve(res)
            }
        })
    })
}

function getRoomInfo(context,byId = false,byRoomIds = false) {
    if (byId){
        let id = context['raw_message']
        if (id===''){
            global.replyMsg(context,`请输入要查询的${byRoomIds?'直播间':'用户'}直播信息的id`)
            return
        }
        getRoomBaseInfo(id,byRoomIds).then(res=>{
            if (res.code===0){
                if (res.data&&res.data.length>0){
                    let key = byRoomIds?'by_room_ids':'by_uids'
                    global.replyMsg(context,getLiveStr(res.data[key][id],true,true))
                }else{
                    global.replyMsg(context,`未找到${byRoomIds?'直播间':'用户'}${id}的信息`,false)
                }
            }else{
                global.replyMsg(context,`获取${byRoomIds?'直播间':'用户'}${id}直播信息失败:${res.msg}`,false)
            }
        }).catch(err=>{
            global['ERR'](`获取直播信息失败:${err}`)
            global.replyMsg(context,`获取${byRoomIds?'直播间':'用户'}${id}直播信息出错`,false)
        })
    }else{
        flushRoomInfo(false).then(()=>{
            global.replyMsg(context,getLiveStr(null,true,true),false)
        })
    }
}

function getRtmpStr(rtmp) {
    return `您的rtmp地址:${rtmp.addr}\n直播码:${rtmp.code}\n`
}

function getLiveStr(info,needLiveStatus = false,needUserInfo = false) {
    let room_info = {}
    if (info) room_info = info
    else room_info = roomInfo
    return (needUserInfo?`${room_info['uname']}(${room_info['uid']})\n`:'')
        +`直播间地址:${room_info['live_url']}\n直播间标题:${room_info.title}-分区[${room_info['area_name']}]\n`
        +(needLiveStatus?(room_info['live_status']===1?'直播中':'未开播'):'')
}

function updateCookie(context) {
    let cookie = context['raw_message']
    if (cookie===''){
        global.replyMsg(context,'请输入要更新的cookie',true)
        return
    }
    setting.cookie=cookie
    saveSetting(setting).then(()=>{
        global.replyMsg(context,'更新cookie成功',true)
    }).catch((err)=>{
        global['ERR'](`更新cookie失败:${err}`)
        global.replyMsg(context,'更新cookie失败',true)
    })
}

function updateToken(context) {
    let token = context['raw_message']
    if (token===''){
        global.replyMsg(context,'请输入要更新的cookie',true)
        return
    }
    setting['csrf_token']=token
    saveSetting(setting).then(()=>{
        global.replyMsg(context,'更新token成功',true)
    }).catch((err)=>{
        global['ERR'](`更新token失败:${err}`)
        global.replyMsg(context,'更新token失败',true)
    })
}

function saveSetting(json,fileName = 'setting.json') {
    return new Promise((resolve, reject) => {
        fs['writeFile'](path.join(__dirname, fileName), JSON.stringify(json, null, 2), "utf8", async (err) => {
            if (err) {
                global['ERR'](err)
                reject(err)
            } else {
                await reloadLive()
                resolve()
            }
        })
    })
}

async function reloadLive() {
    global['reloadPlugin'](null, __dirname.split("\\").pop(), true)
    initSetting()
}

export default {
    initSetting,
    match,
    noNeedPrefix: false,
}
