import path from 'path'
import fs from 'fs'

export function addListener(app) {
    for (let key in listener){
        for (let l in listener[key]){
            if (listener[key].hasOwnProperty(l)) {
                app[key](l,(req,res)=>{
                    if (!req.url.startsWith('/xmbot')) global['LOG'](`user access[${req.method}:${req.url}]`)
                    if (listener[key][l].needAuth)
                        checkAuthor(req,res).then(listener[key][l].func(req,res))
                    else
                        listener[key][l].func(req,res)
                })
            }
        }
    }
    app.get('/*',(req,res,next)=>{
        let keys = Object.keys(listener.get)
        if (keys.indexOf(req.url)===-1&&!req.url.startsWith('/static')) {
            res.setHeader('Content-Type', 'text/html')
            res.sendFile(global['source'].web + '/error.html')
        }else next()
    })
}

function checkAuthor(req,res) {
    return new Promise((resolve,reject)=>{
        if (req.headers.author==='cookie'){
            resolve()
        }else{
            res.send(new BaseRequest('登录过期',501))
        }
    })
}

class BaseRequest{
    constructor(msg,code) {
        this.code=code?code:0
        this.msg=msg?msg:'Success!'
    }
}

class ObjRequest{
    constructor(data,code,msg) {
        this.code=code?code:0
        this.msg=msg?msg:'Success!'
        this.data=data
    }
}

export function getPcrPng(fileName,filePath) {
    console.log(fileName)
    return global['func']['downloadWebFile']('https://redive.estertion.win/icon/unit/'+fileName+'.webp',filePath,true)
}

const listener = {
    get:{
        '/xmbot': {
            needAuth:false,
            func:(req,res)=>{
                global['LOG']('user access')
                res.setHeader('Content-Type', 'text/html')
                res.sendFile(global['source'].web + '/index.html')
            }
        },
        '/login':{
            needAuth: false,
            func:(req,res)=>{
                res.send('ok!')
            }
        },
        '/setting/pcr.json':{
            needAuth: true,
            func:(req,res)=>{
                res.send(new ObjRequest(global['config']['gacha']['pcr']))
            }
        },
        '/setting/pcr/pools.json':{
            needAuth: true,
            func:(req,res)=>{
                res.send(new ObjRequest(global['config']['gacha']['pcr-pools']))
            }
        },
        '/setting/pcr/character.json':{
            needAuth: true,
            func:(req,res)=>{
                res.send(new ObjRequest(global['config']['gacha']['pcr-character']))
            }
        },
        '/xmbot/resource/icon/unit/*':{
            needAuth: false,
            func:(req,res)=>{
                res.setHeader('Content-Type', 'image/jpeg')
                let fileName = req.url.replace('/xmbot/resource/icon/unit/','')
                let filePath = path.join(global['source'].resource,'icon','unit')
                let fullPath = path.join(filePath,fileName)
                fs.access(fullPath, fs.constants.F_OK, (err) => {
                    if (!err){
                        res.sendFile(fullPath)
                    } else {
                        fs['mkdir'](filePath,{ recursive: true },(e)=>{
                            getPcrPng(fileName.split('.')[0],fullPath).then(r=>{
                                res.sendFile(fullPath)
                            }).catch(e=>{
                                let defaultFile = path.join(filePath,'000001.jpg')
                                fs.access(defaultFile,fs.constants.F_OK,(err1)=>{
                                    if (!err1){
                                        res.sendFile(defaultFile)
                                    }else{
                                        getPcrPng('000001',defaultFile).then(r=>{
                                            res.sendFile(defaultFile)
                                        }).catch(e1=> {
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
        }
    },
    post:{
        '/setting/pcr-all.save':{
            needAuth: true,
            func:(req,res)=>{
                let params = req.body
                global['plugins']['gacha']['pcr']['saveSetting'](params.settings,'setting-pcr.json')
                    .then(r=>{
                        global['plugins']['gacha']['pcr']['saveSetting'](params['pools'],'setting-pcr-pools.json')
                            .then(r=>{
                                res.send(new BaseRequest())
                            })
                            .catch(e=>{
                                res.send(new BaseRequest('Failed!',500))
                            })
                    })
                    .catch(e=>{
                        res.send(new BaseRequest('Failed!',500))
                    })
            }
        },
        '/setting/pcr-setting.save':{
            needAuth: true,
            func:(req,res)=>{
                let params = req.body
                global['plugins']['gacha']['pcr']['saveSetting'](params,'setting-pcr.json')
                    .then(r=>{
                        res.send(new BaseRequest())
                    })
                    .catch(e=>{
                        res.send(new BaseRequest('Failed!',500))
                    })
            }
        },
        '/setting/pcr-pools.save':{
            needAuth: true,
            func:(req,res)=>{
                let params = req.body
                global['plugins']['gacha']['pcr']['saveSetting'](params,'setting-pcr-pools.json')
                    .then(r=>{
                        res.send(new BaseRequest())
                    })
                    .catch(e=>{
                        res.send(new BaseRequest('Failed!',500))
                    })
            }
        }
    }
}
