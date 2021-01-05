import {pcr_,matchDict} from './matchDict'
import schedule from 'node-schedule'

let setting = {}

function initSetting() {
    setting = global["config"][__dirname.split("\\").pop()]
}

initSetting()

export default {
    matchDict,
    initSetting,
    match: (context) => global['func']['generalMatch'](context, matchDict),
    needPrefix:true,
    savePcrSetting:(json)=>pcr_.saveSetting(json),
    calendarTest:pcr_.calendarTest,
    getAllCalendar:pcr_.getAllCalendar
}
