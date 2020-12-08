import {SqliteDb} from '../../db/index'

export class CalendarDb {
    constructor(dbName) {
        this.db = new SqliteDb(dbName)
    }

    tableExists = () => {
        return this.db.exists('calendar')
    }

    tableCreate = () => {
        return this.db.create('calendar', [
            'id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT',
            'name VARCHAR(50) NOT NULL',
            'start_time TIMESTAMP',
            'end_time TIMESTAMP',
            'area TEXT NOT NULL',
            'type INTEGER NOT NULL DEFAULT 0'
        ])
    }

    addCalendar = ({name, start_time, end_time, area, type}) => {
        const sql = 'insert into calendar(name,start_time,end_time,area,type) values(?1,?2,?3,?4,?5)'
        return this.db.add(sql, [name, start_time, end_time, area, type])
    }

    addCalendarBatch = (arr) => {
        const sql = 'insert into calendar(name,start_time,end_time,area,type) values(?1,?2,?3,?4,?5)'
        return this.db.add(sql, arr)
    }

    selByArea = (area) => {
        const sql = 'select name,start_time,end_time,type from calendar where area = ?'
        return this.db.sel(sql, [area])
    }

    campaignExists = ({name,start_time,end_time,area}) => {
        const sql = 'select count(1) as count from calendar where name=?1 and start_time=?2 and end_time=?3 and area=?4'
        return this.db.selOne(sql,[name,start_time,end_time,area])
    }
}
