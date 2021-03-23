import fs from 'fs-extra'
import path from 'path'
import {CQFunc} from "../utils/CQCode";

const Api = {}

function loadApi() {
    const files = fs['readdirSync'](__dirname).filter(o => o !== 'index.js' && o.split('.').pop() === 'js')
    if (files && files.length > 0) {
        files.forEach(file => {
            let fileName = file.split('.')[0]
            Api[fileName] = require(path.join(__dirname, fileName))
        })
    }
}

loadApi()

const botApi = {}

function initApi(args, arr = ['qq']) {
    arr.forEach(e => {
        botApi[e] = Api[e].default
        let api = Api[e].default
        let arg = []
        if (args.length > 0 && Array.from(args).slice(2).indexOf(e) > -1) {
            arg = args.slice(0, 2)
        }
        api.initBot(arg)
    })
}

export default {
    botApi,
    initApi,
    closeApi: (apiName) => {
        botApi[apiName].closeBot()
    },
    restartBot: (apiName, userId) => {
        if (!!apiName) {
            botApi[apiName].restartBot(userId)
        } else {
            for (const key of Object.keys(botApi)) {
                let botElem = botApi[key]
                botElem.restartBot(key === apiName ? userId : null)
            }
        }
    },
    restartApi: (apiName) => botApi[apiName].restartBot(),
    CQ: (apiName = 'qq') => botApi[apiName].CQ,
    chatLog: (apiName) => botApi[apiName].chatLog,
    chatLogDb: (apiName) => botApi[apiName].chatLogDb.db,
    getChatLog: (apiName) => {
        if (apiName) {
            global['func'].getChatLog(apiName)
        } else {
            for (const key of Object.keys(botApi)) {
                global['func'].getChatLog(key)
            }
        }
    },
    replyMsg: (context, message, at) => {
        let apiName = context.apiName
        let fromApi = !!context['fromApi'] ? context['fromApi'] : 'qq'
        context['message'] = CQFunc.transformCq(context['message'], apiName, fromApi)
        botApi[apiName].replyMsg(context, message, at)
    },
    replyPrivate: (context) => {
        let apiName = context.apiName
        let fromApi = !!context['fromApi'] ? context['fromApi'] : 'qq'
        context['message'] = CQFunc.transformCq(context['message'], apiName, fromApi)
        botApi[apiName].replyPrivate(context)
    },
    replyGroup: (context, at) => {
        let apiName = context.apiName
        let fromApi = !!context['fromApi'] ? context['fromApi'] : 'qq'
        context['message'] = CQFunc.transformCq(context['message'], apiName, fromApi)
        botApi[apiName].replyGroup(context, at)
    },
    pushMsg: (msg, pushList) => {
        for (const key of Object.keys(pushList)) {
            let list = pushList[key]
            let message = CQFunc.transformCq(msg, key)
            if (list.hasOwnProperty('private')) {
                list.private.forEach(o => {
                    if (botApi.hasOwnProperty(key)) {
                        botApi[key].replyPrivate({message: message, user_id: o})
                    }
                })
            }
            if (list.hasOwnProperty('group')) {
                list.group.forEach(o => {
                    if (botApi.hasOwnProperty(key)) {
                        botApi[key].replyGroup({message: message, group_id: o})
                    }
                })
            }
        }
    }
}
