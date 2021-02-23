import {BaseRequest, ObjRequest} from "../requestClass";

const get = {
    '/setting/default.json': {
        func: (req, res) => {
            const defaultConf = global['config'].default
            res.send(new ObjRequest(defaultConf))
        }
    }
}

const post = {
    '/setting/default.save': {
        needAuth: true,
        needAdmin: true,
        func: (req, res) => {
            let params = req.body
            global['reloadConfig'](params)
            res.send(BaseRequest.SUCCESS())
        }
    }
}

export default {get,post}
