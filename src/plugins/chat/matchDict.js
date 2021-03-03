import * as qAa from "./questionAndAnswer";
import * as chat from "./chat";
import * as sysOrder from "./sysOrder";

export const matchDict=[
    {match: ["有人说","有人问","有人骂"],startWith:true,func:qAa.queAndAns},
    {match: ["骂"],startWith:true,needReplace:true,func:chat.curse},
    {match: ["查看问答"],func:qAa.queAndAnsView},
    {match: ["删除问答:"],startWith: true,func:qAa.queAndAndDel},
    {match: ["version","ver","版本"],func:sysOrder.version},
    {match: ['重载模块:'],needPrefix:true,startWith: true,rules:['admin','private'],func:sysOrder.reloadPlugins},
    {match: ['重启'],needPrefix:true,rules:['admin','private'],func:sysOrder.restart},
    {match: ['全部重启'],needPrefix:true,rules:['admin','private'],func:(context)=>sysOrder.restart(context,true)},
    {match: ['重启api:'],needPrefix:true,startWith: true,needReplace: true,rules:['admin','private'],func:sysOrder.restartApi},
    {match: ['api状态','查看api','机器人状态','bot状态'],rules:[],func:sysOrder.apiStatus},
    {match: ['帮助手册'],needPrefix:true,rules:[],func:sysOrder.dictUrl},
]
