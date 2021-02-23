import {BaseRequest, ObjRequest} from "../requestClass";
import path from "path";
import fs from "fs";
import formidable from "formidable";
import {getPcrPng} from "../request";

const get = {
    '/setting/gacha/pcr.json': {
        needAuth: false,
        func: (req, res) => {
            res.send(new ObjRequest(global['config']['gacha']['pcr']))
        }
    },
    '/setting/gacha/pcr/pools.json': {
        needAuth: false,
        func: (req, res) => {
            res.send(new ObjRequest(global['config']['gacha']['pcr-pools']))
        }
    },
    '/setting/gacha/pcr/character.json': {
        needAuth: false,
        func: (req, res) => {
            res.send(new ObjRequest(global['config']['gacha']['pcr-character']))
        }
    },
    '/setting/gacha/pcr/nickNames.json': {
        needAuth: false,
        func: (req, res) => {
            let nickNames = global['plugins']['gacha']['pcr']['nickNames']
            res.send(new ObjRequest(nickNames))
        }
    },
    '/xmbot/resource/gacha/utils/*': {
        needAuth: false,
        func: (req, res) => {
            res.setHeader('Content-Type', 'image/jpeg')
            let fileName = req.url.replace('/xmbot/resource/gacha/utils/', '')
            let filePath = path.join(global['source'].resource, 'gacha', 'utils')
            let fullPath = path.join(filePath, fileName)
            fs.access(fullPath, fs.constants.F_OK, (err) => {
                if (!err) {
                    res.sendFile(fullPath)
                } else {
                    res.send(BaseRequest.FAILED('Image Not Found!'));
                }
            })
        }
    },
    '/xmbot/resource/gacha/*': {
        needAuth: false,
        func: (req, res) => {
            res.setHeader('Content-Type', 'image/jpeg')
            let fileName = req.url.replace('/xmbot/resource/gacha/', '')
            let filePath = path.join(global['source'].resource, 'gacha')
            let fullPath = path.join(filePath, fileName)
            fs.access(fullPath, fs.constants.F_OK, (err) => {
                if (!err) {
                    res.sendFile(fullPath)
                } else {
                    res.send(BaseRequest.FAILED('Image Not Found!'));
                }
            })
        }
    },
    '/xmbot/resource/icon/unit/*': {
        needAuth: false,
        func: (req, res) => {
            res.setHeader('Content-Type', 'image/jpeg')
            let fileName = req.url.replace('/xmbot/resource/icon/unit/', '')
            let filePath = path.join(global['source'].resource, 'icon', 'unit')
            let fullPath = path.join(filePath, fileName)
            fs.access(fullPath, fs.constants.F_OK, (err) => {
                if (!err) {
                    res.sendFile(fullPath)
                } else {
                    fs['mkdir'](filePath, {recursive: true}, (e) => {
                        getPcrPng(fileName.split('.')[0], fullPath).then(r => {
                            res.sendFile(fullPath)
                        }).catch(e => {
                            let defaultFile = path.join(filePath, '000001.jpg')
                            fs.access(defaultFile, fs.constants.F_OK, (err1) => {
                                if (!err1) {
                                    res.sendFile(defaultFile)
                                } else {
                                    getPcrPng('000001', defaultFile).then(r => {
                                        res.sendFile(defaultFile)
                                    }).catch(e1 => {
                                            res.send('error!')
                                        }
                                    )
                                }
                            })
                        })
                    })
                }
            })
        }
    },
}

const post = {
    '/setting/gacha/pcr-all.save': {
        needAuth: true,
        func: (req, res) => {
            let params = req.body
            global['plugins']['gacha']['pcr']['saveSetting'](params.settings, 'setting-pcr.json')
                .then(r => {
                    global['plugins']['gacha']['pcr']['saveSetting'](params['pools'], 'setting-pcr-pools.json')
                        .then(r => {
                            res.send(BaseRequest.SUCCESS())
                        })
                        .catch(e => {
                            res.send(BaseRequest.FAILED())
                        })
                })
                .catch(e => {
                    res.send(BaseRequest.FAILED())
                })
        }
    },
    '/setting/gacha/pcr-setting.save': {
        needAuth: true,
        func: (req, res) => {
            let params = req.body
            global['plugins']['gacha']['pcr']['saveSetting'](params, 'setting-pcr.json')
                .then(r => {
                    res.send(BaseRequest.SUCCESS())
                })
                .catch(e => {
                    res.send(BaseRequest.FAILED())
                })
        }
    },
    '/setting/gacha/pcr-pools.save': {
        needAuth: true,
        func: (req, res) => {
            let params = req.body
            global['plugins']['gacha']['pcr']['saveSetting'](params, 'setting-pcr-pools.json')
                .then(r => {
                    res.send(BaseRequest.SUCCESS())
                })
                .catch(e => {
                    res.send(BaseRequest.FAILED())
                })
        }
    },
    '/setting/gacha/pcr-nickNames.save': {
        needAuth: true,
        needAdmin: true,
        func: (req, res) => {
            let form = new formidable.IncomingForm()
            form.parse(req, function (err, fields, files) {
                if (err === null) {
                    let params = fields
                    let nickNames = global['plugins']['gacha']['pcr']['nickNames']
                    let check = global['plugins']['gacha']['pcr']['checkCharTypeAndStar'](params.type, params.star)
                    if (check.flag) {
                        if (params['isEdit'] === '0' && nickNames.hasOwnProperty(params.num)) {
                            res.send(BaseRequest.FAILED('角色代号已存在'))
                        } else {
                            nickNames[params.num] = [params.type, params.star, params.num, params['jp_name'], params['cn_name']]
                            params['nickNames'] = params['nickNames'].split(',')
                            if (params['nickNames'].length >= 1 && params['nickNames'][0] !== '') {
                                nickNames[params.num] = [...nickNames[params.num], ...params['nickNames']]
                            }
                            if (files.hasOwnProperty('image')) {
                                let savePath = path.join(global['source']['resource'], 'icon', 'unit', params.num + (params.star.replace('star', '') === '3' ? '3' : '1') + '1.jpg')
                                fs.writeFileSync(savePath, fs.readFileSync(files.image.path))
                            }
                            global['plugins']['gacha']['pcr']['saveNickNames'](false, nickNames).then(() => {
                                res.send(BaseRequest.SUCCESS())
                            }).catch(e => {
                                global['ERR'](e)
                                res.send(BaseRequest.FAILED())
                            })
                        }
                    } else {
                        res.send(new BaseRequest(check.check, 500))
                    }
                } else
                    res.send(BaseRequest.FAILED('Upload Failed!'))
            })
        }
    },
    '/setting/gacha/pcr/delCharacter.do': {
        needAuth: true,
        needAdmin: true,
        func: (req, res) => {
            let params = req.body
            let nickNames = global['plugins']['gacha']['pcr']['nickNames']
            if (nickNames.hasOwnProperty(params.num)) {
                delete nickNames[params.num]
                global['plugins']['gacha']['pcr']['saveNickNames'](false, nickNames).then(() => {
                    res.send(BaseRequest.SUCCESS())
                }).catch(e => {
                    global['ERR'](e)
                    res.send(BaseRequest.FAILED())
                })
            } else {
                res.send(BaseRequest.FAILED('未找到该角色'))
            }
        }
    },
}

export default {get, post}
