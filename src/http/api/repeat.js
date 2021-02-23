import {BaseRequest, ObjRequest} from "../requestClass";

const get = {
    '/setting/repeat.json': {
        needAuth: false,
        func: (req, res) => {
            res.send(new ObjRequest(global['repeat']['setting']))
        }
    },
}

const post = {
    '/setting/repeat.save': {
        needAuth: true,
        needAdmin: true,
        func: async (req, res) => {
            let params = req.body
            await global['reloadRepeat'](params)
            res.send(BaseRequest.SUCCESS())
        }
    },
}

export default {get,post}
