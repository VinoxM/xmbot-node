import path from 'path'

const lite = require('sqlite3').verbose()

export class SqliteDb {
    constructor(dbName) {
        this.dbName = dbName
        this.database = new lite['Database'](path.join(global['source'].db, dbName + '.db'))
    }

    create = (tableName, columnDict) => {
        return new Promise((resolve, reject) => {
            let sql = `create table ${tableName}(${columnDict.join(',')});`
            checkParams(sql, [], this.dbName)
            this.database.run(sql, (err) => {
                if (err) {
                    global['ERR'](`[${this.dbName}.db]Creat ${tableName} table failed: ${err}`)
                    reject(`${tableName}表创建出错`)
                } else resolve()
            })
        })
    }

    exists = (tableName) => {
        return new Promise((resolve, reject) => {
            let sql = `select count(*) as count from sqlite_master where type='table' and name = '${tableName}';`
            checkParams(sql, [], this.dbName)
            this.database.get(sql, (err, rows) => {
                if (err) {
                    global['ERR'](`[${this.dbName}.db]Check '${tableName}' table exists failed: ${err}`)
                    reject(`检测${tableName}表存在失败`)
                } else resolve(rows)
            })
        })
    }

    update = (sql, params) => update(sql, params, this.database, this.dbName)

    add = (sql, params) => update(sql, params, this.database, this.dbName)

    del = (sql, params) => update(sql, params, this.database, this.dbName)

    sel = (sql, params) => select(sql, params, this.database, this.dbName)

    selOne = (sql, params) => select(sql, params, this.database, this.dbName, false)

    close = () => this.database['close']()

}

function update(sql, params, database, dbName) {
    return new Promise((resolve, reject) => {
        let SQL = checkParams(sql, params, dbName)
        if (SQL) global['LOG'](`[${dbName}.db]Sql execute: ${SQL}`)
        else {
            global['ERR'](`[${dbName}.db]Sql error: Sql参数不正确`)
            reject('Sql参数不正确')
        }
        database.run(sql, params, (err) => {
            if (err) {
                global['ERR'](`[${dbName}.db]Sql execute error: ${err}`)
                reject(err)
            } else resolve()
        })
    })
}

function select(sql, params, database, dbName, isAll = true) {
    return new Promise((resolve, reject) => {
        let SQL = checkParams(sql, params, dbName, isAll)
        if (SQL) {
            if (isAll) global['LOG'](`[${dbName}.db]Sql execute: ${SQL}`)
        } else {
            global['ERR'](`[${dbName}.db]Sql error: Sql参数不正确`)
            reject('Sql参数不正确')
        }
        database[isAll ? 'all' : 'get'](sql, params, (err, rows) => {
            if (err) {
                global['ERR'](`[${dbName}.db]Sql execute error: ${err}`)
                reject(err)
            } else resolve(rows)
        })
    })
}

function checkParams(sql, params, dbName, needLog = true) {
    if (needLog) global['LOG'](`[${dbName}.db]Sql prepared: ${sql}`)
    if (needLog&&params.length > 0) global['LOG'](`[${dbName}.db]Sql params: ${params.join(',')}`)
    let pLen = sql.split('?').length - 1
    if (pLen === 0) {
        return sql
    }
    if (pLen !== params.length) return false
    else {
        let i = params.length
        while (pLen--) {
            let index = i-pLen
            sql = sql.indexOf('?'+index)>-1?sql.replace('?'+index, params[index - 1]):sql.replace('?', params[index - 1])
        }
        return sql
    }
}
