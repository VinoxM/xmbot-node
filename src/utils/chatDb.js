import {SqliteDb} from "../db";

export class chatDb {
    constructor() {
        this.db = new SqliteDb('chat')
    }

    saveBatch = (tableName, rows) => {
        createTable(this.db, tableName).then(() => {
            let sql = `insert into ${tableName}(user_id,nick_name,message,send_time,is_self) values(?,?,?,?,?)`
            for (let i = 0; i < rows.length / 5 - 1; i++) {
                sql += ',(?,?,?,?,?)'
            }
            this.db.add(sql, rows)
        }).catch(err => {
            global['err'](err)
        })
    }

    getChatTables = (apiName) => {
        const sql = `select name from sqlite_master where type = 'table' and name != 'sqlite_sequence' and name like '%_${apiName}'`
        return this.db.sel(sql, [])
    }

    getChatLogCountByTableName = (tableName, id) => {
        const sql = `select count(1) as count from ${tableName} where id < ${id}`
        return this.db.selOne(sql, [])
    }

    getChatLogByTableName = (tableName, limit = 20, offset = -1) => {
        const sql = `select id,user_id,nick_name,message,send_time,is_self from ${tableName} order by id limit ${limit} offset ${offset > -1 ? `(select count(1) from ${tableName} where id < ${offset})-20` : `(select count(1) from ${tableName})-20`}`
        return this.db.sel(sql, [])
    }

    close = () => this.db.close()
}

function createTable(db, tableName) {
    return new Promise((resolve, reject) => {
        db.exists(tableName).then(res => {
            if (res.count === 0) {
                db.create(tableName, [
                    'id INTEGER PRIMARY KEY AUTOINCREMENT',
                    'user_id TEXT NOT NULL',
                    'nick_name TEXT NOT NULL',
                    'message TEXT NOT NULL',
                    'send_time TIME_STAMP NOT NULL',
                    'is_self INTEGER NOT NULL DEFAULT 0'
                ]).then(() => {
                    resolve()
                }).catch(err => {
                    reject(err)
                })
            } else resolve()
        }).catch(err => {
            reject(err)
        })
    })
}
