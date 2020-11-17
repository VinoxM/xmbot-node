import path from 'path'
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
]

function match(context) {
    let raw_msg = context["raw_message"];
    for (let m of matchDict){
        if (!m.startWith){
            let index = m.match.indexOf(raw_msg)
            if (index > -1) {
                if (m.needReplace)
                    context['raw_message']=context['raw_message'].replace(m.match[index],'').trim()
                return checkRules(m,context)
            }
        }else{
            for (let s of m.match){
                if (raw_msg.startsWith(s)){
                    if (m.needReplace)
                        context['raw_message']=context['raw_message'].replace(s,'').trim()
                    return checkRules(m,context)
                }
            }
        }
    }
}

function checkRules(m,context) {
    let check = m.rules&&m.rules.length>0?global['func']['checkMatchRules'](m.rules,context):-1
    if (check===-1)
        return m.func(context)
    else {
        context['err']=check
        global.replyMsg(context)
    }
}

export default {
    initSetting,
    match,
    noNeedPrefix:false,
    pcr
}
