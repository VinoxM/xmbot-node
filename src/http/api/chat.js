import {BaseRequest, ObjRequest} from "../requestClass";

const get = {
    '/setting/chat.json': {
        needAuth: false,
        func: (req, res) => {
            res.send(new ObjRequest(global['config']['chat']))
        }
    },
}

const post = {
    '/setting/chat.save': {
        needAuth: true,
        needAdmin: true,
        func: async (req, res) => {
            let params = req.body
            await global['reloadPlugin'](params, 'chat')
            await global['plugins']['chat']['initMatchSetting']()
            res.send(BaseRequest.SUCCESS())
        }
    },
    '/chat/sendMsg.do': {
        needAuth: true,
        needAdmin: true,
        func: (req, res) => {
            global.replyMsg(req.body)
            res.send(BaseRequest.SUCCESS())
        }
    },
    '/chat/getMoreMsg.json': {
        needAuth: true,
        needAdmin: true,
        func: (req, res) => {
            let params = req.body
            global.getChatLogMore({type: params.type, id: params.id, index: params.index})
            res.send(BaseRequest.SUCCESS())
        }
    },
}

export default {get,post}
