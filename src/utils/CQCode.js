export const CQFunc = {
    // 转换CQ码
    transformCq: (message, toApi, fromApi = 'qq') => {
        if (toApi === fromApi) return message
        // 检查@
        message = checkAt(message, toApi, fromApi)
        // 检查Image
        message = checkImage(message, toApi, fromApi)
        // 检车ImageWeb
        message = checkImageWeb(message, toApi, fromApi)
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

// 是否at我
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

function checkAt(message, apiName, fromApi) {
    let cqAt = fromApi==='qq'?'[CQ:at,qq=':'<@';
    let cqEnd = fromApi==='qq'?']':'>';
    let at = message.indexOf(cqAt)
    if (at > -1) {
        let start = message.substring(0, at)
        let end = message.substring(start.length)
        end = end.replace(cqAt, '')
        let i = end.indexOf(cqEnd)
        let id = end.substring(0, i)
        end = end.substr(i + 1)
        message = start + CQCode[apiName].at(id) + end
        message = checkAt(message, apiName)
    }
    return message
}

function checkImage(message, apiName, fromApi) {
    let cqImg = fromApi==='qq'?'[CQ:image,file=file:///':'<CQ:image,file=';
    let cqEnd = fromApi==='qq'?']':'>';
    let i = message.indexOf(cqImg)
    if (i > -1) {
        let start = message.substring(0, i)
        let end = message.substring(start.length)
        end = end.replace(cqImg, '')
        let j = end.indexOf(',proxy=') > -1 ? end.indexOf(',proxy=') : end.indexOf(cqEnd)
        let url = end.substring(0, j)
        end = end.substr(end.indexOf(cqEnd) + 1)
        message = start + CQCode[apiName].img(url,fromApi !== 'qq') + end
        message = checkImage(message, apiName)
    }
    return message
}

function checkImageWeb(message, apiName, fromApi) {
    let cqImg = fromApi==='qq'?'[CQ:image,url=':'<CQ:image,url=';
    let cqEnd = fromApi==='qq'?']':'>';
    let i = message.indexOf(cqImg)
    if (i > -1) {
        let start = message.substring(0, i)
        let end = message.substring(start.length)
        end = end.replace(cqImg, '')
        let j = end.indexOf(cqEnd)
        let path = end.substring(0, j)
        end = end.substr(j + 1)
        message = start + CQCode[apiName].img_web(path) + end
        message = checkImage(message, apiName)
    }
    return message
}

const dsCode = {
    at: (id) => {
        return `<@${id}>`
    },
    img: (path) => {
        return `<CQ:image,file=${path}>`
    },
    img_web: (path) => {
        return `<CQ:image,url=${path}>`
    },
}

export const CQCode = {
    qq: cqCode,
    discord: dsCode
}
