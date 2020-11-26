export const CQ = {
    at: (qq) => {
        return `[CQ:at,qq=${qq}]`
    },
    img: (path) => {
        return `[CQ:image,file=file:///${path}]`
    },
    img_web: (path, proxy = false) => {
        return `[CQ:image,url=${path}${proxy ? ',proxy=1' : ''}]`
    },
    isAtSelf: (context) => isAtSelf(context),
    checkAndReplaceAtSelf:(context)=>{
        if (isAtSelf(context)){
            context['message']=context['message'].replace(`[CQ:at,qq=${context['self_id']}]`,'')
        }
        return context
    }
}

function isAtSelf(context) {
    let message = context['message']
    const split = '[CQ:at,qq='
    let index = message.indexOf(split)
    if (index > -1) {
        let str = message.split(split)[1]
        let qq_ = str.substring(0, str.indexOf(']'))
        return qq_ === String(context['self_id'])
    }
    return false
}
