const exec = require('child_process').exec;
import fs from 'fs-extra'

let setting = null;

function initSetting() {
    setting = global["config"][__dirname.split(global['separator']).pop()]
}

const matchDict = [
    {match:['更新'],startWith:false,needReplace:false,rules:['admin','private'],func:update},
    {match:['强制更新'],startWith:false,needReplace:false,rules:['admin','private'],func:(context)=>update(context,true)},
]

initSetting()

function match(context) {
    global['func']['generalMatch'](context,matchDict)
}

function update(context,isForce = false) {
    context['message']='正在检查更新...当前版本:'+global.version
    global.replyPrivate(context)
    checkVersion(isForce).then(res=>{
        if (res.needUpdate){
            context['message']='最新版本:'+res.ver.version+',正在下载更新...'
            doUpdate(context['user_id'])
        }else {
            context['message']='已是最新版本'
        }
        global.replyPrivate(context)
    }).catch(()=>{
        context['message']='更新出错'
        global.replyPrivate(context)
    })
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

function doUpdate(user_id) {
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
            process.exit(0)
        }
    })
}

export default {
    initSetting,
    match,
    needPrefix: true,
    matchDict
}
