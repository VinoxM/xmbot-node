import {CQWebSocket} from "cq-websocket";
import {CQ} from "./CQCode";

let bot = null

export function initBot(isRestart = false){
    let ops = global['config']["default"]["ws"]
    bot = new CQWebSocket(ops);
    addListener(isRestart)
    bot.connect()
}

export function restartBot() {
    bot.disconnect()
    initBot(true)
}

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

function addListener(isRestart){
    // 添加WebSocket监听
    bot.on('socket.connecting', (wsType, attempts) => global['LOG'](`WebSocket连接中:${wsType}`))
        .on('socket.failed', (wsType, attempts) => global['ERR'](`WebSocket连接失败:${wsType},${Number(global['config']['default']['ws']['reconnectionDelay']/1000).toFixed(0)}秒后重连`))
        .on('socket.error', (wsType, err) => {
            global['ERR'](`WebSocket连接错误:${err}`);
        })
        .once('ready',()=>{
            bot.send={
                private:(params)=>bot("send_private_msg",params),
                group:(params)=>bot("send_group_msg",params)
            }
            global['LOG']('xmBot已启动')
            if (global['config'].default['readyFeedBack']) {
                for (const m of global['config'].default['master']){
                    replyPrivate({user_id:m,self_id:'system',message:isRestart?'xmBot已重启':'xmBot已启动'})
                }
            }
        })
        .on('socket.connect', (wsType, sock, attempts) => global['LOG'](`WebSocket连接成功:${sock.url}`))
        .on('message', (event,record,tags) => {// 监听接收信息处理
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
            let canRepeat = true // 可复读标志
            let repeated = false // 已复读标志
            for (let i of Object.keys(global.plugins)) {
                let p = global.plugins[i]
                if (typeof p == 'undefined') continue // 过滤空plugins
                if (p.noNeedPrefix||(!p.noNeedPrefix&&through)){ // 不需要前缀||需要前缀
                    if ("match" in p){
                        canRepeat = p["match"](record) //返回true则该条信息可以触发复读,返回false或不返回则不能触发
                        if (canRepeat&&!repeated) {
                            global['repeat']['handleRepeat'](record)
                            repeated = true
                        }
                    }
                }
            }
        });
}

export function replyMsg(context, message, at = false){
    let replyType = msgType[context["message_type"]]["reply"];//通过消息类型确定回复目标(群组->group_id,私聊->private_id)
    let replyId = context[replyType];//获取回复目标号码
    message = message ? message : context["message"]
    if (at){//是否@发送人
        message = CQ.at(context["user_id"])+'\n'+message
    }
    let params = {[replyType]:replyId,message}//回复消息体(例:{group_id:123456}或{user_id:123456})
    let func = msgType[context["message_type"]]["type"]//获取发送api的方法名称(private()或group())
    onSendLog(context["message_type"],replyId,context["self_id"],message);
    bot.send[func](params).then(r=>{
        if (func==='group') global['repeat']['handleRepeat'](context)// 发送群组信息,处理复读
    })
}

export function replyPrivate(context) {
    onSendLog('private',context["user_id"],context["self_id"],context["message"]);
    bot.send.private({user_id: context["user_id"], message: context["message"]}).then(r=>{

    })
}

export function replyGroup(context,at = false) {
    if (at) {
        context["message"]=CQ.at(context["user_id"])+context["message"]
    }
    onSendLog('group',context["group_id"],context["self_id"],context["message"]);
    bot.send.group({group_id: context["group_id"], message: context["message"]}).then(r=>{
        global['repeat']['handleRepeat'](context)// 发送群组信息,处理复读
    })
}

// 收到信息日志
function onReceiveLog(record){
    let sender = '';
    if (record["message_type"]==='group') {
        sender += `[${record["group_id"]}] `;
    }
    sender += `${record["sender"]["nickname"]}(${record["user_id"]}): -> `;
    let message = record["message"];
    global['LOG'](sender + message);
}

// 发送信息日志
function onSendLog(msgType,replyId,selfId,message) {
    let receiver = '';
    if (msgType==='group'){
        receiver += `[${replyId}] `;
    }
    receiver += `${selfId}: <- `;
    global['LOG'](receiver + message);
}
