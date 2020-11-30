import * as pcr from './pcr'

let setting = null;

function initSetting() {
    setting = global["config"][__dirname.split("\\").pop()]
}

initSetting()

const matchDict = [
    {match:['当前卡池'],startWith:false,needReplace:false,rules:[],func:pcr.currentPool},
    {match:['新增角色'],startWith:true,needReplace:true,rules:['admin','private'],func:pcr.addCharacter},
    {match:['删除角色'],startWith:true,needReplace:true,rules:[],func:pcr.delCharacter},
    {match:['删除序号角色'],startWith:true,needReplace:true,rules:[],func:(context)=>pcr.delCharacter(context,true)},
    {match:['查看角色序号'],startWith:true,needReplace:true,rules:[],func:(context)=>pcr.viewCharacter(context,true)},
    {match:['查看角色'],startWith:true,needReplace:true,rules:[],func:pcr.viewCharacter},
    {match:['重载角色昵称'],startWith:true,needReplace:false,rules:['admin','private'],func:(context)=>pcr.initNickName(context,true)},
    {match:['十连'],startWith:false,needReplace:false,rules:[],func:(context)=>pcr.gacha(context)},
    {match:['国服十连'],startWith:false,needReplace:false,rules:[],func:(context)=>pcr.gacha(context,'cn')},
    {match:['日服十连'],startWith:false,needReplace:false,rules:[],func:(context)=>pcr.gacha(context,'jp')},
    {match:['台服十连'],startWith:false,needReplace:false,rules:[],func:(context)=>pcr.gacha(context,'tw')},
    {match:['单抽'],startWith:false,needReplace:false,rules:[],func:(context)=>pcr.simple(context)},
    {match:['国服单抽'],startWith:false,needReplace:false,rules:[],func:(context)=>pcr.simple(context,'cn')},
    {match:['日服单抽'],startWith:false,needReplace:false,rules:[],func:(context)=>pcr.simple(context,'jp')},
    {match:['台服单抽'],startWith:false,needReplace:false,rules:[],func:(context)=>pcr.simple(context,'tw')},
    {match:['来一井'],startWith:false,needReplace:false,rules:[],func:(context)=>pcr.thirty(context)},
    {match:['国服来一井'],startWith:false,needReplace:false,rules:[],func:(context)=>pcr.thirty(context,'cn')},
    {match:['日服来一井'],startWith:false,needReplace:false,rules:[],func:(context)=>pcr.thirty(context,'jp')},
    {match:['台服来一井'],startWith:false,needReplace:false,rules:[],func:(context)=>pcr.thirty(context,'tw')},
    {match:['清空抽卡缓存'],startWith:false,needReplace:false,rules:['admin'],func:(context)=>pcr.emptyGachaResource(context)},
    {match:['清空抽卡角色缓存'],startWith:false,needReplace:false,rules:['admin'],func:(context)=>pcr.emptyGachaUnitResource(context)},
    {match:['切换卡池','卡池切换'],startWith:true,needReplace:true,rules:['group'],func:(context)=>pcr.changeDefaultPool(context)},
    {match:['切换日服卡池'],startWith:false,needReplace:false,rules:['group'],func:(context)=>pcr.changeDefaultPool(context,'jp')},
    {match:['切换台服卡池'],startWith:false,needReplace:false,rules:['group'],func:(context)=>pcr.changeDefaultPool(context,'tw')},
    {match:['切换国服卡池'],startWith:false,needReplace:false,rules:['group'],func:(context)=>pcr.changeDefaultPool(context,'cn')},
    {match:['切换up角色','切换up'],startWith:true,needReplace:true,rules:['group'],func:(context)=>pcr.changePoolPickUp(context)},
    {match:['切换国服up角色','切换国服up'],startWith:true,needReplace:true,rules:['group'],func:(context)=>pcr.changePoolPickUp(context,'cn')},
    {match:['切换日服up角色','切换日服up'],startWith:true,needReplace:true,rules:['group'],func:(context)=>pcr.changePoolPickUp(context,'jp')},
    {match:['切换台服up角色','切换台服up'],startWith:true,needReplace:true,rules:['group'],func:(context)=>pcr.changePoolPickUp(context,'tw')},
    {match:['修改角色','更新角色'],startWith:true,needReplace:true,rules:['admin'],func:(context)=>pcr.updateCharacter(context)},
    {match:['添加角色昵称'],startWith:true,needReplace:true,rules:['admin'],func:(context)=>pcr.updateCharacter(context,true)},
    {match:['移除卡池角色'],startWith:true,needReplace:true,rules:['admin'],func:(context)=>pcr.removeCharFromPool(context)},
    {match:['移除日服角色'],startWith:true,needReplace:true,rules:['admin'],func:(context)=>pcr.removeCharFromPool(context,'jp')},
    {match:['移除国服角色'],startWith:true,needReplace:true,rules:['admin'],func:(context)=>pcr.removeCharFromPool(context,'cn')},
    {match:['移除台服角色'],startWith:true,needReplace:true,rules:['admin'],func:(context)=>pcr.removeCharFromPool(context,'tw')},
]

function match(context) {
    global['func']['generalMatch'](context,matchDict)
}

export default {
    initSetting,
    match,
    needPrefix:true,
    pcr,
    matchDict
}
