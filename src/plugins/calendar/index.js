import * as pcr from './pcr'

let setting = {}

function initSetting() {
    setting = global["config"][__dirname.split("\\").pop()]
}

initSetting()

const matchDict = [
    {match:['启用日历推送','启用日历'],startWith:true,needReplace:true,rules:['admin'],func:(context)=>pcr.toggleSwitch(context)},
    {match:['禁用日历推送','禁用日历'],startWith:true,needReplace:true,rules:['admin'],func:(context)=>pcr.toggleSwitch(context,false)},
    {match:['开启日历推送','开启日历'],startWith:true,needReplace:true,rules:['admin'],func:(context)=>pcr.toggleJobSwitch(context)},
    {match:['关闭日历推送','关闭日历'],startWith:true,needReplace:true,rules:['admin'],func:(context)=>pcr.toggleJobSwitch(context,false)},
    {match:['订阅日历推送','订阅日历'],startWith:true,needReplace:true,rules:['admin'],func:(context)=>pcr.toggleJobPush(context)},
    {match:['屏蔽日历推送','屏蔽日历'],startWith:true,needReplace:true,rules:['admin'],func:(context)=>pcr.toggleJobPush(context,false)},

]

export default {
    matchDict,
    initSetting,
    match: (context) => global['func']['generalMatch'](context, matchDict),
    needPrefix:true
}
