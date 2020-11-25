import * as pcr from './pcr'

let setting = null;

function initSetting() {
    setting = global["config"][__dirname.split("\\").pop()]
}

initSetting()

const matchDict = [
    {match:['添加角色'],startWith:true,needReplace:true,rules:['admin','private'],func:pcr.addCharacter},
    {match:['删除角色'],startWith:true,needReplace:true,rules:[],func:pcr.delCharacter},
    {match:['删除序号角色'],startWith:true,needReplace:true,rules:[],func:(context)=>pcr.delCharacter(context,true)},
    {match:['查看角色序号'],startWith:true,needReplace:true,rules:[],func:(context)=>pcr.viewCharacter(context,true)},
    {match:['查看角色'],startWith:true,needReplace:true,rules:[],func:pcr.viewCharacter},
    {match:['重载角色昵称'],startWith:true,needReplace:true,rules:[],func:(context)=>pcr.initNickName(context,true)},
    {match:['十连'],startWith:false,needReplace:true,rules:[],func:(context)=>pcr.gacha(context)},
    {match:['国服十连'],startWith:false,needReplace:true,rules:[],func:(context)=>pcr.gacha(context,'cn')},
    {match:['日服十连'],startWith:false,needReplace:true,rules:[],func:(context)=>pcr.gacha(context,'jp')},
    {match:['台服十连'],startWith:false,needReplace:true,rules:[],func:(context)=>pcr.gacha(context,'tw')},
    {match:['单抽'],startWith:false,needReplace:true,rules:[],func:(context)=>pcr.simple(context)},
    {match:['国服单抽'],startWith:false,needReplace:true,rules:[],func:(context)=>pcr.simple(context,'cn')},
    {match:['日服单抽'],startWith:false,needReplace:true,rules:[],func:(context)=>pcr.simple(context,'jp')},
    {match:['台服单抽'],startWith:false,needReplace:true,rules:[],func:(context)=>pcr.simple(context,'tw')},
    {match:['来一井'],startWith:false,needReplace:true,rules:[],func:(context)=>pcr.thirty(context)},
    {match:['国服来一井'],startWith:false,needReplace:true,rules:[],func:(context)=>pcr.thirty(context,'cn')},
    {match:['日服来一井'],startWith:false,needReplace:true,rules:[],func:(context)=>pcr.thirty(context,'jp')},
    {match:['台服来一井'],startWith:false,needReplace:true,rules:[],func:(context)=>pcr.thirty(context,'tw')},
    {match:['清空抽卡缓存'],startWith:false,needReplace:false,rules:['admin'],func:(context)=>pcr.emptyGachaResource(context)},
    {match:['清空抽卡角色缓存'],startWith:false,needReplace:false,rules:['admin'],func:(context)=>pcr.emptyGachaUnitResource(context)},
    {match:['切换卡池','卡池切换'],startWith:true,needReplace:true,rules:['group'],func:(context)=>pcr.selectDefaultPool(context)},
]

function match(context) {
    global['func']['generalMatch'](context,matchDict)
}

export default {
    initSetting,
    match,
    noNeedPrefix:false,
    pcr
}
