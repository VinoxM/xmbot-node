import fs from 'fs-extra'
import path from 'path'
import {CQFunc} from "../utils/CQCode";

const Api = {}

function loadApi() {
    const files = fs['readdirSync'](__dirname).filter(o => o !== 'index.js')
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
        api.initBot(args)
    })
}

export default {
    botApi,
    initApi,
    restartBot: (apiName, userId) => botApi[apiName].restartBot(userId),
    CQ: (apiName = 'qq') => botApi[apiName].CQ,
    chatLog: (apiName) => botApi[apiName].chatLog,
    getChatLog: (apiName) => {
        if (apiName) {
            botApi[apiName].getChatLog()
        } else {
            Object.values(botApi).map(o=>{
                o.getChatLog()
            })
        }
    },
    getChatLogMore: (params, apiName) => {
        if (apiName) {
            botApi[apiName].getChatLogMore(params)
        } else {
            Object.values(botApi).map(o=>{
                o.getChatLogMore(params)
            })
        }
    },
    replyMsg: (context, message, at) => {
        let apiName = context.apiName
        botApi[apiName].replyMsg(context, message, at)
    },
    replyPrivate: (context) => {
        let apiName = context.apiName
        botApi[apiName].replyPrivate(context)
    },
    replyGroup: (context, at) => {
        let apiName = context.apiName
        botApi[apiName].replyGroup(context, at)
    },
    pushMsg: (msg, pushList) => {
        for (const key of Object.keys(pushList)) {
            let list = pushList[key]
            let message = CQFunc.transformCq(msg, key)
            if (list.hasOwnProperty('private')) {
                list.private.forEach(o => {
                    botApi[key].replyPrivate({message: message, user_id: o})
                })
            }
            if (list.hasOwnProperty('group')) {
                list.group.forEach(o => {
                    botApi[key].replyGroup({message: message, group_id: o})
                })
            }
        }
    }
}
