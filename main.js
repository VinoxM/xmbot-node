import {globalReg} from "./src/utils/global";
import {
    globalConf,
    loadPlugins,
    saveAndReloadSettingByName,
    saveAndReloadSettingForRepeat,
    saveAndReloadConfig,
    plugins
} from "./src/config"
import repeat from "./src/repeat"
import * as http from './src/http'
import path from 'path'
import {SqliteDb} from './src/db/index'
import * as func from './src/utils/funcs'
import {readJsonSync} from 'fs-extra'
import bot from './src/botApi/index'
import {initSocket} from "./src/utils/socket"

// 路径
const source = {
    main: __dirname,
    db: path.join(__dirname, 'database'),
    web: path.join(__dirname, 'web'),
    repeat: path.join(__dirname, 'src', 'repeat'),
    plugins: path.join(__dirname, 'src', 'plugins'),
    resource: path.join(__dirname, 'resource')
}

// 版本信息
let version;

// 读取版本信息
try {
    version = readJsonSync(path.join(__dirname, 'docs', 'v3', 'ver.json'))
} catch (e) {
    global['LOG']('读取版本信息失败')
}

// 装填配置
globalReg({
    version: version ? version.version : '0.0.0',// 版本信息
    replyMsg: bot.replyMsg,// 发送信息
    replyPrivate: bot.replyPrivate,// 发送私聊信息
    replyGroup: bot.replyGroup,// 发送群组信息
    pushMsg: bot.pushMsg,
    restartBot: (apiName, user_id) => {
        global['LOG']('重启xmBot...')
        saveAndReloadConfig()
        loadPlugins('./src/plugins')
        bot.restartBot(apiName, user_id)
    },
    config: globalConf,// 配置信息
    plugins,// 插件
    repeat,// 复读
    CQ: bot.CQ,
    reloadPlugin: saveAndReloadSettingByName,// 通过名称重载配置信息(json:配置,path:路径,name:名称)
    reloadRepeat: saveAndReloadSettingForRepeat,// 重载复读信息
    reloadConfig: saveAndReloadConfig,
    source: source,// 路径
    http,// http连接
    SqliteDb,// 数据库连接
    func,
    chatLog: bot.chatLog,
    getChatLog: bot.getChatLog,
    getChatLogMore: bot.getChatLogMore
})

// 加载插件
loadPlugins('./src/plugins')

// 设置本地资源
http.useStatic(path.join(source.web, 'static'))

// 启动Socket
initSocket(globalConf.default["socket"])

// 启动Bot
const args = process.argv.splice(2)
let arr = []
for (const key of Object.keys(globalConf.default.api)) {
    if (globalConf.default.api[key].on) arr.push(key)
}
bot.initApi(args, arr)
