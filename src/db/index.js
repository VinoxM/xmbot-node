import path from 'path'
export const lite =require('sqlite3').verbose()

function openDb(fileName,mode,callback) {
    return new lite['Database'](path.join(global['_dirname'],fileName), mode, callback)
}

function closeDb(db) {
    if (Array.isArray(db)) {
        for (let d of db){
            d.close()
        }
    } else {
        db.close()
    }
}

export const db = {
    closeDb,
    openDb
}
