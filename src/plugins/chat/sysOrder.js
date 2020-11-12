export function version(context){
    context["message"]=global['version']
    global.replyMsg(context)
}

export function reloadPlugins(context){
    if (global['func']['checkIsAdmin'](context)){
        if (context['message_type']==='private'){
            let msg = context['raw_message'].replace('重载模块:','')
            let keys = Object.keys(global['plugins'])
            keys.push('repeat')
            if (
                keys.some(o=> {
                    if (o==='default')
                        return false
                    return o === msg
                })
            ){
                let suc = false
                if (msg==='repeat'){
                    suc = global['reloadRepeat'](null)
                } else {
                    suc = global['reloadPlugin'](null,msg,true)
                }
                context['message']=suc?`重载模块${msg}完成`:`重载模块${msg}失败`
            }else context['message']='未找到该模块'
        }else context['message']='请私聊使用该指令~'
    }else context['message']='只有主人可以这么命令我~'
    global.replyMsg(context,null,global['func']['checkIsGroup'](context))
}

export function restart(context){
    if (global['func']['checkIsAdmin'](context)){
        if (context['message_type']==='private'){
            global['restartBot'](context['user_id'])
            return
        }else context['message']='请私聊使用该指令~'
    }else context['message']='只有主人可以这么命令我~'
    global.replyMsg(context,null,global['func']['checkIsGroup'](context))
}
