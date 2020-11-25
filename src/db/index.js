import path from 'path'

const lite = require('sqlite3').verbose()

export class SqliteDb {
    constructor(dbName) {
        this.database = new lite['Database'](path.join(global['source'].db, dbName + '.db'))
    }

    create = (tableName, columnDict) => {
        return new Promise((resolve, reject) => {
            let sql = `create table ${tableName}(${columnDict.join(',')});`
            checkParams(sql, [])
            this.database.run(sql, (err) => {
                if (err) {
                    global['ERR'](`Creat ${tableName} table failed: ${err}`)
                    reject(`${tableName}表创建出错`)
                } else resolve()
            })
        })
    }

    exists = (tableName) => {
        return new Promise((resolve, reject) => {
            let sql = `select count(*) as count from sqlite_master where type='table' and name = '${tableName}';`
            checkParams(sql, [])
            this.database.get(sql, (err, rows) => {
                if (err) {
                    global['ERR'](`Check '${tableName}' table exists failed: ${err}`)
                    reject(`检测${tableName}表存在失败`)
                } else resolve(rows)
            })
        })
    }

    update = (sql, params) => update(sql, params, this.database)

    add = (sql, params) => update(sql, params, this.database)

    del = (sql, params) => update(sql, params, this.database)

    sel = (sql, params) => {
        return new Promise((resolve, reject) => {
            let SQL = checkParams(sql, params)
            if (SQL) global['LOG'](`Sql execute: ${SQL}`)
            else {
                global['ERR'](`Sql error: Sql参数不正确`)
                reject('Sql参数不正确')
            }
            this.database.all(sql, params, (err, rows) => {
                if (err) {
                    global['ERR'](`Sql execute error: ${err}`)
                    reject(err)
                } else resolve(rows)
            })
        })
    }

    close = () => this.database['close']()

}

function update(sql, params, database) {
    return new Promise((resolve, reject) => {
        let SQL = checkParams(sql, params)
        if (SQL) global['LOG'](`Sql execute: ${SQL}`)
        else {
            global['ERR'](`Sql error: Sql参数不正确`)
            reject('Sql参数不正确')
        }
        database.run(sql, params, (err) => {
            if (err) {
                global['ERR'](`Sql execute error: ${err}`)
                reject(err)
            } else resolve()
        })
    })
}

function checkParams(sql, params) {
    global['LOG'](`Sql prepared: ${sql}`)
    global['LOG'](`Sql params: ${params.join(',')}`)
    let pLen = sql.split('?').length - 1
    if (pLen === 0) {
        return sql
    }
    if (pLen !== params.length) return false
    else {
        let i = params.length
        while (pLen--) {
            sql = sql.replace('?', params[i - pLen - 1])
        }
        return sql
    }
}
