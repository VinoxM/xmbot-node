export function dictUrl(context) {
    let base_url = global['config'].default.base_url
    global.replyMsg(context, `${base_url}plugins-dict`)
}

export function version(context) {
    context["message"] = global['version']
    global.replyMsg(context)
}

export function reloadPlugins(context) {
    let msg = context['raw_message'].replace('重载模块:', '')
    let keys = Object.keys(global['plugins'])
    keys.push('repeat')
    if (
        keys.some(o => {
            if (o === 'default')
                return false
            return o === msg
        })
    ) {
        let suc = false
        if (msg === 'repeat') {
            suc = global['reloadRepeat'](null)
        } else {
            suc = global['reloadPlugin'](null, msg, true)
        }
        context['message'] = suc ? `重载模块${msg}完成` : `重载模块${msg}失败`
    } else context['message'] = '未找到该模块'
    global.replyMsg(context, null, global['func']['checkIsGroup'](context))
}

export function restart(context, all = false) {
    global['restartBot'](all ? null : context.apiName, context['user_id'])
}

export function restartApi(context) {
    global['restartApi'](context['raw_message'])
}

export function apiStatus(context) {
    let api = []
    for (const key of Object.keys(global.botReady.api)) {
        api.push(`${key}:${global.botReady.api[key] ? '已启动' : '未启动'}`)
    }
    global.replyMsg(context, api.join('\n'))
}
