let setting;

const matchDict=[
    {match:["你好","你好啊"],func:(context)=>{
            context["message"]="收到"
            global.replyMsg(context)
        }
    },
    {match: ["有人说","有人问","有人骂"],startWith:true,func:(context)=>{
            let msg = context["raw_message"];
            let filter = ["你就答","你就回答","你就骂","就答","就回答","就骂"];
            let index = -1;
            let len = 0;
            for (let f of filter) {
                index = msg.indexOf(f);
                len = f.length;
                if (index>0)break;
            }
            if (index===-1) {
                context["message"] = "你在说啥子哦~"
            }else{
                let question = msg.substring(3,index)
                let answer = msg.substring(index+len)
                let saved = false
                if (!setting["Q&A"])setting["Q&A"]=[]
                else{
                    saved = setting["Q&A"].some((o)=> o.question===question)
                }
                if (!saved){
                    setting["Q&A"].push({question:question,answer:answer})
                    global['reloadSetting'](setting,'./src/plugins',__dirname.split("\\").pop())
                    initMatchSetting()
                    context["message"] = "我学会了~"
                }else context["message"] = "问答冲突,添加失败~"
            }
            global.replyMsg(context)
        }
    },
    {match: ["查看问答"],func:(context)=>{
            let msg = "";
            let qa = setting["Q&A"];
            for (let o of qa) {
                msg += o.question+":"+o.answer+"\n"
            }
            context["message"]=msg;
            global.replyMsg(context)
        }
    },
    {match: ["删除问答:"],startWith: true,func:(context)=>{
            if (global["config"].default["master"].some((o)=>o===context["user_id"])){
                let msg = context["raw_message"].replace("删除问答:","")
                if(!setting["Q&A"].some((o,i)=>{
                    if (o.question===msg){
                        setting["Q&A"].splice(i,1)
                        global['reloadSetting'](setting,'./src',__dirname.split("\\").pop())
                        initMatchSetting()
                        context["message"]=`已删除问答:${msg}`
                        return true
                    }
                    return false
                }))context["message"] = `未找到问答:${msg}`
            }else context["message"]="只有主人可以这么命令我~"
            global.replyMsg(context)
        }
    }
]

function initMatchSetting() {
    setting = global["config"][__dirname.split("\\").pop()]
}

initMatchSetting()

function match(context) {//返回true则该条信息可以触发复读,返回false或不返回则不能触发
    let raw_msg = context["raw_message"];
    for (let m of matchDict){
        if (!m.startWith){
            if (m.match.indexOf(raw_msg) > -1) {
                m.func(context)
                return
            }
        }else{
            for (let s of m.match){
                if (raw_msg.startsWith(s)){
                    m.func(context)
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
    noNeedPrefix:true
}