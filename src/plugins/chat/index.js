import * as qAa from './questionAndAnswer'
import * as sysOrder from './sysOrder'
import * as pcr_hw from './pcr-homework'
let setting;

const matchDict=[
    {match: ["有人说","有人问","有人骂"],startWith:true,func:qAa.queAndAns},
    {match: ["查看问答"],func:qAa.queAndAnsView},
    {match: ["删除问答:"],startWith: true,func:qAa.queAndAndDel},
    {match: ["version","ver","版本"],func:sysOrder.version},
    {match: ['重载模块:'],startWith: true,rules:['admin','private'],func:sysOrder.reloadPlugins},
    {match: ['重启'],rules:['admin','private'],func:sysOrder.restart},
    // {match: ['保存PCR作业','保存作业','保存pcr作业'],startWith: true,needReplace:true,func:pcr_hw.saveHomework},
]

function initMatchSetting() {
    setting = global["config"][__dirname.split("\\").pop()]
}

initMatchSetting()

function match(context) {//返回true则该条信息可以触发复读,返回false或不返回则不能触发
    global['func']['generalMatch'](context,matchDict)
}

export default {
    match,
    initMatchSetting,
    needPrefix:true
}
