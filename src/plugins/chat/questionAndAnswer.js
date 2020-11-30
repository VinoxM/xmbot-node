export async function queAndAns(context) {
    let setting = global['config']['chat']
    let msg = context["raw_message"];
    let filter = ["你就答", "你就回答", "你就骂", "就答", "就回答", "就骂"];
    let index = -1;
    let len = 0;
    for (let f of filter) {
        index = msg.indexOf(f);
        len = f.length;
        if (index > 0) break;
    }
    if (index === -1) {
        context["message"] = "你在说啥子哦~"
    } else {
        let question = msg.substring(3, index)
        let answer = msg.substring(index + len)
        let saved = false
        if (!setting["Q&A"]) setting["Q&A"] = []
        else {
            saved = setting["Q&A"].some((o) => o.question === question)
        }
        if (!saved) {
            setting["Q&A"].push({question: question, answer: answer})
            await global['reloadPlugin'](setting, __dirname.split("\\").pop())
            global['plugins']['chat']['initMatchSetting']()
            context["message"] = "我学会了~"
        } else context["message"] = "问答冲突,添加失败~"
    }
    global.replyMsg(context, null, global['func']['checkIsGroup'](context))
}

export function queAndAnsView(context){
    let setting = global['config']['chat']
    let msg = "";
    let qa = setting["Q&A"];
    for (let o of qa) {
        msg += o.question+":"+o.answer+"\n"
    }
    context["message"]=msg;
    global.replyMsg(context,null,global['func']['checkIsGroup'](context))
}

export function queAndAndDel(context){
    let setting = global['config']['chat']
    if (global['func']['checkIsAdmin'](context)){
        let msg = context["raw_message"].replace("删除问答:","")
        if(!setting["Q&A"].some(async (o,i)=>{
            if (o.question===msg){
                setting["Q&A"].splice(i,1)
                await global['reloadPlugin'](setting,__dirname.split("\\").pop())
                global['plugins']['chat']['initMatchSetting']()
                context["message"]=`已删除问答:${msg}`
                return true
            }
            return false
        }))context["message"] = `未找到问答:${msg}`
    }else context["err"]=0
    global.replyMsg(context,null,global['func']['checkIsGroup'](context))
}
