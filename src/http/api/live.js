import {BaseRequest, ObjRequest} from "../requestClass";
import request from 'request'

const get = {
    '/setting/live.json': {
        needAuth: false,
        func: (req, res) => {
            res.send(new ObjRequest(global['config']['live']))
        }
    },
    '/bili/dynamic.json': {
        needAuth: true,
        needAdmin: true,
        func: (req, res) => {
            let cookie = req.query.cookie
            let uid = req.query.uid
            let offset_id = req.query['offsetId']
            let url = `https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/space_history?` +
                `visitor_uid=${uid}&` +
                `host_uid=${uid}&` +
                `offset_dynamic_id=${offset_id}&` +
                `need_top=1&platform=web`
            request({
                url,
                headers: {cookie},
            }, (err, response, body) => {
                if (!err) {
                    let result = JSON.parse(body)
                    res.send(new ObjRequest(result))
                } else {
                    res.send(BaseRequest.FAILED())
                }
            })
        }
    },
}

const post = {
    '/setting/live.save': {
        needAuth: true,
        needAdmin: true,
        func: async (req, res) => {
            let params = req.body
            await global['plugins']['live']['saveSetting'](params)
            res.send(BaseRequest.SUCCESS())
        }
    },
    '/bili/dynamic.delete': {
        needAuth: true,
        needAdmin: true,
        func: (req, res) => {
            let url = 'https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/rm_dynamic'
            let json = req.body
            let dynamic_id = json.dynamic_id
            let csrf_token = json.csrf
            let csrf = json.csrf
            let cookie = json.cookie
            request.post({
                url,
                headers: {cookie},
                form: {
                    dynamic_id,csrf,csrf_token
                }
            }, (err, response, body) => {
                if (!err) {
                    let result = JSON.parse(body)
                    res.send(new ObjRequest(result))
                } else {
                    res.send(BaseRequest.FAILED())
                }
            })
        }
    }
}

export default {get, post}
