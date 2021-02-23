import {BaseRequest, ObjRequest} from "../requestClass";

const get = {
    '/setting/calendar/pcr.json': {
        needAuth: false,
        func: (req, res) => {
            res.send(new ObjRequest(global['config']['calendar']['pcr']))
        }
    },
    '/calendar/url/test.do': {
        func: (req, res) => {
            let params = req.query
            global['plugins']['calendar'].calendarTest(params.url, !!params.needProxy).then(r => {
                res.send(new ObjRequest(r))
            }).catch(e => {
                global['ERR'](e)
                res.send(BaseRequest.FAILED())
            })
        }
    },
    '/calendar/getAll.json': {
        func: (req, res) => {
            global['plugins']['calendar'].getAllCalendar().then(result => {
                res.send(new ObjRequest(result))
            })
        }
    },
}

const post = {
    '/setting/calendar/pcr.save': {
        needAuth: true,
        needAdmin: true,
        func: async (req, res) => {
            let params = req.body
            await global['plugins']['calendar']['savePcrSetting'](params)
            res.send(BaseRequest.SUCCESS())
        }
    },
}

export default {get,post}
