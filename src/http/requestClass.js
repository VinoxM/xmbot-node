export class BaseRequest {
    constructor(msg, code) {
        this.code = code ? code : 0
        this.msg = msg ? msg : 'Success!'
    }

    static SUCCESS = (msg)=>{
        return new BaseRequest(msg?msg:'Success!', 0)
    }

    static NOT_LOGIN = (msg)=>{
        return new BaseRequest(msg?msg:'未登录', 400)
    }

    static USER_NOT_EXISTS = (msg)=>{
        return new BaseRequest(msg?msg:'用户不存在', 401)
    }

    static PASSWORD_ERROR = (msg)=>{
        return new BaseRequest(msg?msg:'密码错误', 402)
    }

    static AUTH_EXPIRED = (msg)=>{
        return new BaseRequest(msg?msg:'登录过期', 403)
    }

    static USER_LIMITS = (msg)=>{
        return new BaseRequest(msg?msg:'权限不足', 405)
    }

    static FAILED = (msg)=>{
        return new BaseRequest(msg?msg:'Failed!', 500)
    }

    static LINK_EXPIRED = (msg)=>{
        return new BaseRequest(msg?msg:'链接过期', 501)
    }
}

export class ObjRequest {
    constructor(data, code, msg) {
        this.code = code ? code : 0
        this.msg = msg ? msg : 'Success!'
        this.data = data
    }
}
