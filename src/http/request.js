export function addListener(app) {
    for (let key in listener){
        for (let l in listener[key]){
            if (listener[key].hasOwnProperty(l)) {
                app.get(l,(req,res)=>{
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
    app.post('/*',(req,res,next)=>{
        next()
    })
}

const listener = {
    get:{
        '/': {
            needAuth:false,
            func:(req,res)=>{
                res.setHeader('Content-Type', 'text/html')
                res.sendFile(global['source'].web + '/index.html')
            }
        },
        '/login':{
            needAuth: true,
            func:(req,res)=>{
                res.send('ok!')
            }
        }
    },
    post:{

    }
}

function checkAuthor(req,res) {
    return new Promise((resolve,reject)=>{
        if (req.headers.author==='cookie'){
            resolve()
        }else{
            res.send(new BaseRequest(501,'登录过期'))
        }
    })
}

class BaseRequest{
    constructor(msg,code) {
        this.code=code?code:200
        this.msg=msg?msg:'Success!'
    }
}

class ObjRequest{
    constructor(data,code,msg) {
        this.code=code?code:200
        this.msg=msg?msg:'Success!'
        this.data=data
    }
}
