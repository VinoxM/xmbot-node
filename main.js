import {CQWebSocket} from "cq-websocket";
import {globalReg} from "./src/utils/global";
import {CQ} from "./src/utils/CQCode";
import {globalConf,loadPlugins,initPluginsByName,saveAndReloadSettingByName,plugins} from "./src/config"
import fs from "fs-extra";

const bot = new CQWebSocket(globalConf["default"]["ws"]);
const msgType = {
    group:{
        label:"群组消息",
        reply:"group_id",
        type:"group"
    },
    private: {
        label:"私聊消息",
        reply:"user_id",
        type:"private"
    }
}

globalReg({
    bot,
    replyMsg,
    replyPrivate,
    replyGroup,
    config:globalConf,
    plugins,
    reloadSetting:(json,path,name)=>{saveAndReloadSettingByName(json,path,name)}
})

loadPlugins('./src/plugins')
initPluginsByName('./','repeat')

bot.send={
    private:(params)=>bot("send_private_msg",params),
    group:(params)=>bot("send_group_msg",params)
}

bot.on('socket.connecting', (wsType, attempts) => global['LOG'](`WebSocket连接中:${wsType}`))
.on('socket.failed', (wsType, attempts) => global['ERR'](`WebSocket连接失败:${wsType}`))
.on('socket.error', (wsType, err) => {
    global['ERR'](`WebSocket连接错误:${wsType}`);
    global['ERR'](err);
})
.on('socket.connect', (wsType, sock, attempts) => global['LOG'](`WebSocket连接成功:${sock.url}`));

bot.connect()

function replyMsg(context, message, at = false){
    let replyType = msgType[context["message_type"]]["reply"];//通过消息类型确定回复目标(群组->group_id,私聊->private_id)
    let replyId = context[replyType];//获取回复目标号码
    message = message ? message : context["message"]
    if (at){//是否@发送人
        message = CQ.at(context["user_id"])+message
    }
    let params = {[replyType]:replyId,message}//回复消息体(例:{group_id:123456}或{user_id:123456})
    let func = msgType[context["message_type"]]["type"]//获取发送api的方法名称(private()或group())
    onSendLog(context["message_type"],replyId,context["self_id"],message);
    return bot.send[func](params)
}

function replyPrivate(context) {
    onSendLog(context["message_type"],context["user_id"],context["self_id"],context["message"]);
    return bot.send.private({user_id:context["user_id"],message:context["message"]})
}

function replyGroup(context) {
    onSendLog(context["message_type"],context["group_id"],context["self_id"],context["message"]);
    return bot.send.group({group_id:context["group_id"],message:context["message"]})
}

bot.on('message', (event,record,tags) => {
    onReceiveLog(record);

    let conf = global["config"]["default"]
    let type = record["message_type"]

    switch (type) {
        case 'private':
            //enablePrivate
            if (!conf["enablePrivate"])return;
            break;
        case 'group':
            //blackGroup or whiteGroup
            if (conf["isBlackGroup"]?conf["blackGroup"].indexOf(record["group_id"])>-1:conf["whiteGroup"].indexOf(record["group_id"])===-1) return;
            break;
        default:
            return;
    }

    //prefix
    let through = false
    if (conf["prefixOn"]){
        let prefix = conf.prefix;
        for (let p of prefix){
            if (record["message"].startsWith(p)) {
                record["raw_message"]=record["message"].substring(p.length);
                through = true;
                break;
            }
        }
    }

    //match
    let canRepeat = true
    for (let i of Object.keys(global.plugins)) {
        if (i==='repeat')continue
        let p = global.plugins[i]
        if (typeof p == 'undefined') continue
        if (p.noNeedPrefix||(!p.noNeedPrefix&&through)){
            if ("match" in p){
                canRepeat = p["match"](record)//返回true则该条信息可以触发复读,返回false或不返回则不能触发
            }
        }
    }
    if (canRepeat)global.plugins.repeat["handle"](record);
});

function onReceiveLog(record){
    let sender = '';
    if (record["message_type"]==='group') {
        sender += `[${record["group_id"]}] `;
    }
    sender += `${record["sender"]["nickname"]}(${record["user_id"]}): -> `;
    let message = record["message"];
    global['LOG'](sender + message);
}

function onSendLog(msgType,replyId,selfId,message) {
    let receiver = '';
    if (msgType==='group'){
        receiver += `[${replyId}] `;
    }
    receiver += `${selfId}: <- `;
    global['LOG'](receiver + message);
}