import {replyMsg} from "../../utils/bot";
const exec = require('child_process').exec;
import fs,{readJsonSync, writeJsonSync} from 'fs-extra'

let setting = null;

function initSetting() {
    setting = global["config"][__dirname.split("\\").pop()]
}

initSetting()

function match(context) {
    if (context['raw_message']!=='更新'&&context['raw_message']!=='强制更新')return
    let isAdmin = global['func']['checkIsAdmin'](context)
    let isPrivate = global['func']['checkIsPrivate'](context)
    let isGroup = global['func']['checkIsGroup'](context)
    if (isAdmin){
        if (isPrivate){
            context['message']='正在检查更新...'
            replyMsg(context,null,isGroup)
            checkVersion(context['raw_message']==='强制更新').then(res=>{
                if (res.needUpdate){
                    context['message']='有可用更新版本:'+res.ver.version+',正在下载更新...'
                    update(context['user_id'])
                }else {
                    context['message']='已是最新版本'
                }
                replyMsg(context,null,isGroup)
            }).catch(err=>{
                context['message']='更新出错'
                replyMsg(context,null,isGroup)
            })
            return
        }else context['message']='请私聊使用该指令~'
    }else context['message']='只有主人可以这么命令我~'
    replyMsg(context,null,isGroup)
}

function checkVersion(isForced = false) {
    let ver = global['version'].split('.')
    let needUpdate = false
    return new Promise((resolve, reject) => {
        global['func']['getWebFile']('http://raw.githubusercontent.com/VinoxM/xmbot-node/master/docs/v3/ver.json','get',true)
            .then((res)=>{
                let web_ver = JSON.parse(res.body)
                let new_ver = web_ver['version'].split('.')
                for (let i = 0; i < 3; i++) {
                    let res = Number(ver[i])-Number(new_ver[i])
                    if (res < 0){
                        needUpdate = true
                        break
                    }else if (res > 0){
                        break
                    }
                }
                resolve({needUpdate:isForced||needUpdate,ver:web_ver})
            })
            .catch(err=>{
                global['ERR'](err)
                reject({msg:err.message})
            })
    })
}

function update(user_id) {
    let dir = global['source'].main
    let pid = process.ppid
    let script =
        'cd '+dir+' \n' +
        'taskkill /pid '+pid+' /f\n' +
        'git pull\n' +
        'ping 127.0.0.1 -n 3\n' +
        'node index.js update ' + user_id
    let filePath = dir+'/update.bat'
    fs['writeFile'](filePath,Buffer.from(script),(err)=>{
        if (err) return false
        else {
            exec('powershell.exe -Command Start-Process -FilePath "' + filePath + '"', function (err, stdout, stderr) {
                global['LOG'](stdout)
            }).stdin.end();
            // process.exit(0)
        }
    })
}

export default {
    initSetting,
    match,
    noNeedPrefix: true
}
