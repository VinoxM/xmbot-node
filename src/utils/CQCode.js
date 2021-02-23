export const CQFunc = {
    transformCq: (message, toApi, fromApi = 'qq') => {
        if (toApi === fromApi) return message
        switch (fromApi) {
            case "qq":
                break
        }
        return message
    }
}

const cqCode = {
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
    checkAndReplaceAtSelf: (context) => {
        if (isAtSelf(context)) {
            context['raw_message'] = context['message'].replace(`[CQ:at,qq=${context['self_id']}]`, '').trim()
            return true
        }
        return false
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

export const CQCode = {
    qq: cqCode
}
