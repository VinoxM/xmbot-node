import * as pcr from './pcr'

let setting = {}

function initSetting() {
    setting = global["config"][__dirname.split("\\").pop()]
}

initSetting()

const matchDict = [
    {match:['启用日历推送','启用日历'],startWith:false,needReplace:false,rules:['admin'],func:(context)=>pcr.toggleSwitch(context)},
    {match:['禁用日历推送','禁用日历'],startWith:false,needReplace:false,rules:['admin'],func:(context)=>pcr.toggleSwitch(context,false)},
    {match:['开启日历推送','开启日历'],startWith:true,needReplace:true,rules:['admin'],func:(context)=>pcr.toggleJobSwitch(context)},
    {match:['关闭日历推送','关闭日历'],startWith:true,needReplace:true,rules:['admin'],func:(context)=>pcr.toggleJobSwitch(context,false)},
    {match:['订阅日历推送','订阅日历'],startWith:true,needReplace:true,rules:['admin'],func:(context)=>pcr.toggleJobPush(context)},
    {match:['屏蔽日历推送','屏蔽日历'],startWith:true,needReplace:true,rules:['admin'],func:(context)=>pcr.toggleJobPush(context,false)},
    {match:['今日活动','今天活动'],startWith:false,needReplace:false,rules:[],func:(context)=>pcr.searchCalendar(context)},
    {match:['日服今日活动','日服今天活动'],startWith:false,needReplace:false,rules:[],func:(context)=>pcr.searchCalendar(context,'jp')},
    {match:['台服今日活动','台服今天活动'],startWith:false,needReplace:false,rules:[],func:(context)=>pcr.searchCalendar(context,'tw')},
    {match:['国服今日活动','国服今天活动'],startWith:false,needReplace:false,rules:[],func:(context)=>pcr.searchCalendar(context,'cn')},
    {match:['明日活动','明天活动'],startWith:false,needReplace:false,rules:[],func:(context)=>pcr.searchCalendar(context,false,'tomorrow')},
    {match:['日服明日活动','日服明天活动'],startWith:false,needReplace:false,rules:[],func:(context)=>pcr.searchCalendar(context,'jp','tomorrow')},
    {match:['台服明日活动','台服明天活动'],startWith:false,needReplace:false,rules:[],func:(context)=>pcr.searchCalendar(context,'tw','tomorrow')},
    {match:['国服明日活动','国服明天活动'],startWith:false,needReplace:false,rules:[],func:(context)=>pcr.searchCalendar(context,'cn','tomorrow')},
    {match:['本周活动','本周活动'],startWith:false,needReplace:false,rules:[],func:(context)=>pcr.searchCalendar(context,false,'thisWeek')},
    {match:['日服本周活动','日服本周活动'],startWith:false,needReplace:false,rules:[],func:(context)=>pcr.searchCalendar(context,'jp','thisWeek')},
    {match:['台服本周活动','台服本周活动'],startWith:false,needReplace:false,rules:[],func:(context)=>pcr.searchCalendar(context,'tw','thisWeek')},
    {match:['国服本周活动','国服本周活动'],startWith:false,needReplace:false,rules:[],func:(context)=>pcr.searchCalendar(context,'cn','thisWeek')},
    {match:['下周活动','下周活动'],startWith:false,needReplace:false,rules:[],func:(context)=>pcr.searchCalendar(context,false,'nextWeek')},
    {match:['日服下周活动','日服下周活动'],startWith:false,needReplace:false,rules:[],func:(context)=>pcr.searchCalendar(context,'jp','nextWeek')},
    {match:['台服下周活动','台服下周活动'],startWith:false,needReplace:false,rules:[],func:(context)=>pcr.searchCalendar(context,'tw','nextWeek')},
    {match:['国服下周活动','国服下周活动'],startWith:false,needReplace:false,rules:[],func:(context)=>pcr.searchCalendar(context,'cn','nextWeek')},
]

export default {
    matchDict,
    initSetting,
    match: (context) => global['func']['generalMatch'](context, matchDict),
    needPrefix:true
}
