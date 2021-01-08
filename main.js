import {globalReg} from "./src/utils/global";
import {globalConf,loadPlugins,saveAndReloadSettingByName,saveAndReloadSettingForRepeat,saveAndReloadConfig,plugins} from "./src/config"
import repeat from "./src/repeat"
import * as http from './src/http'
import path from 'path'
import {SqliteDb} from './src/db/index'
import {chatLog,getChatLog,getChatLogMore,initBot,restartBot,replyMsg,replyPrivate,replyGroup} from "./src/utils/bot";
import * as func from './src/utils/funcs'
import fs,{readJsonSync, writeJsonSync} from 'fs-extra'
import {CQ} from './src/utils/CQCode'

console.log(process.platform)

const source = {// 路径
    main:__dirname,
    db:path.join(__dirname, 'database'),
    web:path.join(__dirname,'web'),
    repeat:path.join(__dirname,'src','repeat'),
    plugins:path.join(__dirname,'src','plugins'),
    resource:path.join(__dirname,'resource')
}

// 版本信息
let version;

try{
    version = readJsonSync(path.join(__dirname,'docs','v3','ver.json')) // 读取版本信息
}catch (e) {
    global['LOG']('读取版本信息失败')
}

// 装填配置
globalReg({
    version:version?version.version:'0.0.0',// 版本信息
    replyMsg,// 发送信息
    replyPrivate,// 发送私聊信息
    replyGroup,// 发送群组信息
    restartBot:restart,
    config:globalConf,// 配置信息
    plugins,// 插件
    repeat,// 复读
    CQ,
    reloadPlugin:(json,name,reloadPlugin)=>{return saveAndReloadSettingByName(json,name,reloadPlugin)},// 通过名称重载配置信息(json:配置,path:路径,name:名称)
    reloadRepeat:(json)=>{saveAndReloadSettingForRepeat(json)},// 重载复读信息
    reloadConfig:(json)=>{saveAndReloadConfig(json)},
    source:source,// 路径
    http,// http连接
    SqliteDb,// 数据库连接
    func,
    chatLog,
    getChatLog,
    getChatLogMore
})

const args = process.argv.splice(2)

// 加载插件
loadPlugins('./src/plugins')

// 设置本地资源
http.useStatic(path.join(source.web,'static'))

// 启动Bot
initBot(args)

function restart(user_id) {
    global['LOG']('重启xmBot...')
    saveAndReloadConfig(null)
    loadPlugins('./src/plugins')
    restartBot(user_id)
}
