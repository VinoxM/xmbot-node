import {matchDict} from './matchDict'

let setting;

function initMatchSetting() {
    setting = global["config"][__dirname.split(global['separator']).pop()]
}

initMatchSetting()

function match(context) {//返回true则该条信息可以触发复读,返回false或不返回则不能触发
    let raw_msg = context["raw_message"];
    for (let m of matchDict){
        if (m.needPrefix&&raw_msg===context['message']&&global['func']['checkIsGroup'](context)) continue
        if (!m.startWith){
            let index = m.match.indexOf(raw_msg.toLowerCase())
            if (index > -1) {
                if (m.needReplace)
                    context['raw_message']=context['raw_message'].replace(m.match[index],'').trim()
                global['func']['checkMatchRules'](m,context)
                return
            }
        }else{
            for (let s of m.match){
                if (raw_msg.toLowerCase().startsWith(s)){
                    if (m.needReplace)
                        context['raw_message']=context['raw_message'].replace(s,'').trim()
                    global['func']['checkMatchRules'](m,context)
                    return
                }
            }
        }
    }
    let msg = context["message"]
    for (let qa of setting["Q&A"]) {
        if (msg === qa.question){
            context["message"]=qa.answer
            global.replyMsg(context)
            return
        }
    }
    return true
}

export default {
    match,
    initMatchSetting,
    needPrefix:false,
    matchDict
}
