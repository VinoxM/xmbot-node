export function curse(context) {
    let msg = context['raw_message']
    let curse = ['shabi','傻逼','煞笔','沙比','sb','啥b','萨比']
    if(curse.some(o=>String(msg).toLowerCase().indexOf(o)>-1)){
        let self = ['xcw','小仓唯','镜华']
        if (self.some(o=>String(msg).toLowerCase().indexOf(o)>-1)){
            global.replyMsg(context,'啥b,爬',true)
            return
        }
        global.replyMsg(context,msg)
    }
}
