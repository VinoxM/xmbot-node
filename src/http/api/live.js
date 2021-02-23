import {BaseRequest, ObjRequest} from "../requestClass";

const get = {
    '/setting/live.json': {
        needAuth: false,
        func: (req, res) => {
            res.send(new ObjRequest(global['config']['live']))
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
}

export default {get,post}
