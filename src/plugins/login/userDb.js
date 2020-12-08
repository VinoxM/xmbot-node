const SqliteDb = global['SqliteDb']

export class userDb {
    constructor() {
        this.db = new SqliteDb('user')
    }

    tableExists = () => {
        return this.db.exists('user')
    }

    tableCreate = () => {
        return this.db.create('user', [
            'user_id TEXT PRIMARY KEY NOT NULL',
            'password TEXT NOT NULL',
            'login_count INTEGER NOT NULL DEFAULT 0'
        ])
    }

    createUser = (user_id) => {
        let sql = 'insert into user(user_id,password) values(?,123456)'
        return this.db.add(sql,[user_id])
    }

    getUser = (user_id) => {
        let sql = 'select 1 from user where user_id = ?'
        return this.db.sel(sql, [user_id])
    }

    updateUserPwd = (user) => {
        let sql = 'update user set password = ? where user_id = ?'
        return this.db.update(sql, [user.password, user.user_id])
    }

    validUserPwd = (user_info) => {
        let sql = 'select user_id,login_count from user where user_id=? and password=?'
        return this.db.sel(sql,[user_info.user_id,user_info.password])
    }

    updateUserLoginCount = (user_id) => {
        let sql = 'update user set login_count=login_count+1 where user_id = ?'
        return this.db.update(sql,[user_id])
    }

    getUserLoginCount = (user_id) => {
        let sql = 'select user_id,login_count from user where user_id = ?'
        return this.db.sel(sql,[user_id])
    }
}
