import path from 'path'

const lite = require('sqlite3').verbose()

export class SqliteDb {
    constructor(dbName) {
        this.database = new lite['Database'](path.join(global['source'].db, dbName + '.db'))
    }

    update = (sql, params) => {
        return new Promise((resolve, reject) => {
            let SQL = checkParams(sql, params)
            if (SQL) global['LOG'](`Execute Sql: ${SQL}`)
            else {
                global['ERR'](`Sql error: Sql参数不正确`)
                reject('Sql参数不正确')
            }
            this.database.run(sql, params, (err) => {
                if (err) {
                    global['ERR'](`Sql execute error: ${err}`)
                    reject(err)
                } else resolve()
            })
        })
    }

    add = (sql, params) => SqliteDb.update(sql, params)
    del = (sql, params) => SqliteDb.update(sql, params)

    sel = (sql, params) => {
        return new Promise((resolve, reject) => {
            let SQL = checkParams(sql, params)
            if (SQL) global['LOG'](`Execute Sql: ${SQL}`)
            else {
                global['ERR'](`Sql error: Sql参数不正确`)
                reject('Sql参数不正确')
            }
            this.database.get(sql, params, (err, rows) => {
                if (err) {
                    global['ERR'](`Sql execute error: ${err}`)
                    reject(err)
                } else resolve(rows)
            })
        })
    }

    close = () => this.database['close']()

}

function checkParams(sql, params) {
    let pLen = sql.split('?').length - 1
    if (pLen === 0) return sql
    if (pLen !== params.length) return false
    else {
        let i = params.length
        while (i--) {
            sql.replace('?', params[i - pLen])
        }
        return sql
    }
}
