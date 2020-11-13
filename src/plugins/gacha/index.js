import path from 'path'
import * as pcr from './pcr'

let setting = null;

function initSetting() {
    setting = global["config"][__dirname.split("\\").pop()]
}

initSetting()

const matchDict = [
    {match:['添加角色'],startWith:true,needReplace:true,rules:[],func:pcr.addCharacter},
    {match:['删除角色'],startWith:true,needReplace:true,rules:[],func:pcr.delCharacter},
    {match:['删除序号角色'],startWith:true,needReplace:true,rules:[],func:(context)=>pcr.delCharacter(context,true)},
    {match:['查看角色序号'],startWith:true,needReplace:true,rules:[],func:(context)=>pcr.viewCharacter(context,true)},
    {match:['查看角色'],startWith:true,needReplace:true,rules:[],func:pcr.viewCharacter},
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

function getPng() {
    global['func']['downloadWebFile']('http://redive.estertion.win/icon/unit/100231.webp',global['source'].resource+'/123.png',true)
        .then(res=>{
            console.log(res)
        })
}

export default {
    initSetting,
    match,
    noNeedPrefix:false
}
