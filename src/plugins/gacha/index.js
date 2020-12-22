import {pcr_,matchDict} from './matchDict'

let setting = null;

function initSetting() {
    setting = global["config"][__dirname.split("\\").pop()]
}

initSetting()

function match(context) {
    global['func']['generalMatch'](context,matchDict)
}

export default {
    initSetting,
    match,
    needPrefix:true,
    pcr:pcr_,
    matchDict
}
