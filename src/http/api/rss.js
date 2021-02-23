import {BaseRequest, ObjRequest} from "../requestClass";

const get = {
    '/setting/rss.json': {
        needAuth: false,
        func: (req, res) => {
            res.send(new ObjRequest(global['config']['rss']))
        }
    },
    '/rss/source/test.do': {
        func: (req, res) => {
            let params = req.query
            global['plugins']['rss'].rssSourceTest(params.source, !!params.proxy).then(r => {
                res.send(new ObjRequest(r))
            }).catch(e => {
                global['ERR'](e)
                res.send(BaseRequest.FAILED())
            })
        }
    },
}

const post = {
    '/setting/rss.save': {
        needAuth: true,
        needAdmin: true,
        func: async (req, res) => {
            let params = req.body
            let rss = global['config']['rss'].rss
            params.rss.map(o => {
                rss.some(obj => {
                    if (obj.name === o.name) {
                        o.last_id = obj.last_id
                        return true
                    }
                    return false
                })
            })
            await global['plugins']['rss']['reloadRssPlugins'](params)
            res.send(BaseRequest.SUCCESS())
        }
    },
}

export default {get,post}
