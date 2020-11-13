import fs from 'fs-extra'
import path from 'path'
import {replyMsg} from "../../utils/bot";

let setting = null;
let pools = null;
let nickNames = null;
let nickNamePath = path.join(global['source'].main,'docs','pcr');

function initPcrSetting() {
    setting = global['config'][__dirname.split("\\").pop()]['pcr']
    pools = global['config'][__dirname.split("\\").pop()]['pcr-pool']
}

initPcrSetting()

function initNickName(){
    try{
        fs['readFile'](path.join(nickNamePath,'nickname.csv'),'utf8',(err,data)=>{
            let chars = data.split(/\r?\n/)
            let nickName = {}
            for (const char of chars){
                if (char==='') continue
                let c = char.split(',')
                nickName[Number(c[0])] = c
            }
            nickNames = nickName
            global['LOG']('PCR-完成角色昵称加载')
        })
    } catch (e) {
        global['ERR']('PCR-加载角色昵称出错')
    }
}

initNickName()

export function addCharacter(context) { // 添加角色
    let raw_message = context['raw_message']
    let c = raw_message.split('|')
    if (c.length<3){
        context['message']='请输入正确长度的角色信息(最少3个信息:[序号|日文名|中文名])'
        global.replyMsg(context,null,true)
        return
    }
    if (Object.keys(nickNames).indexOf(c[0]) > -1) {
        context['message']='已有该序号的角色信息'
        global.replyMsg(context,null,true)
        return
    }
    nickNames[Number(c[0])]=c
    saveNickNames().then(res=>{
        context['message']='保存成功'
        global.replyMsg(context)
    }).catch(err=>{
        context['message']='保存失败'
        global.replyMsg(context)
    })
}

export function delCharacter(context,byIndex = false) { // 删除角色
    let keys = Object.keys(nickNames)
    let raw_message = context['raw_message']
    if (raw_message==='') return global.replyMsg(context,'请输入要删除的角色',true)
    let chars = raw_message.split('|')
    let result = {
        deleted:[],
        notFound:[]
    }
    for (const char of chars){
        let delFlag = false
        if (byIndex){
            let index = keys.indexOf(char)
            if (index>-1) {
                delete nickNames[keys[index]]
                delFlag = true
            }
        } else {
            for (const key of keys) {
                if (nickNames[key].indexOf(char) > -1) {
                    delete nickNames[key]
                    delFlag = true
                    break
                }
            }
        }
        if (delFlag)
            result.deleted.push(char)
        else
            result.notFound.push(char)
    }
    if (result.deleted.length>0){
        let deleted = result.deleted.length>0?'角色'+result.deleted.join(',')+'已删除':''
        let notFound = result.notFound.length>0?'角色'+result.notFound.join(',')+'未找到':''
        saveNickNames().then(res=>{
            context['message']=deleted+(deleted!==''&&notFound!==''?'\n':'')+notFound
            global.replyMsg(context)
        }).catch(err=>{
            context['message']='删除失败'
            global.replyMsg(context)
        })
    }else {
        context['message']='角色'+result.notFound.join(',')+'未找到'
        global.replyMsg(context,null,true)
    }
}

export function viewCharacter(context,isIndex = false) {
    let raw_message = context['raw_message']
    if (raw_message==='') return global.replyMsg(context,'请输入要删除的角色',true)
    let chars = raw_message.split('|')
    let result = {
        characters:[],
        notFound:[]
    }
    for (const char of chars){
        let res = Object.values(nickNames).filter(o=>{
            return o.indexOf(char)>-1
        })
        if (res.length===0){
            result.notFound.push(char)
        } else {
            if (isIndex)
                result.characters.push(char + ':' + res.map(o=>o[0]).join(','))
            else {
                result.characters.push(char + ':' + res.map(o=>o[2]).join(','))
            }
        }
    }
    let characters = result.characters.length>0?result.characters.join('\n'):''
    let notFound = result.notFound.length>0?'角色'+result.notFound.join(',')+'未找到':''
    context['message']=characters+(characters!==''&&notFound!==''?'\n':'')+notFound
    global.replyMsg(context)
}

function saveNickNames() {
    return new Promise((resolve, reject) => {
        let values = Object.values(nickNames);
        values.sort((a,b) => Number(a[0])-Number(b[0]))
        let str = values.map(o=>{
            return o.join(',')
        }).join('\n')
        let buffer = Buffer.from(str);
        fs['writeFile'](path.join(nickNamePath,'nickname.csv'),buffer,(err,data)=>{
            if (err) {
                global['ERR'](err)
                reject(err)
            }
            else resolve (data)
        })
    })

}
