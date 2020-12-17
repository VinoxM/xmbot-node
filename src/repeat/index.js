import fs,{readJsonSync, writeJsonSync} from 'fs-extra'
import {resolve} from 'path'

let setting = {}

function loadRepeatJson(){
    try{
        setting = readJsonSync(resolve(__dirname,"./setting.json"))
        global['LOG'](`已加载配置: repeat/setting.json`)
        return true
    }catch (e) {
        global['ERR'](`repeat/setting.json文件解析失败,请检查文件配置`)
        return false
    }
}

loadRepeatJson()

const repeat = {

}

function getRepeatCount(groupId) {
    let repeatCount = 0;
    if (setting["isRandom"]){
        let ran = setting["repeatRange"];
        let len = Number(ran[1]-ran[0])
        repeatCount = Math.round(Math.random()*len)+Number(ran[0])
    }else{
        repeatCount = setting["repeatCount"];
    }
    global["LOG"](`群组${groupId}刷新复读次数为:${repeatCount}`)
    return repeatCount;
}

function handleRepeat(context) {
    if (!setting["repeatOn"]) return;
    if (context["message_type"]==='group'){
        let groupId = context["group_id"]
        let msg = context["message"]
        if (!repeat[groupId]){//群组未记录
            repeat[groupId]={
                lastMsg:null,//最后一条信息
                lastRepeat:null,//最后复读的信息,防止重复复读
                curCount:1,//当前复读次数
                repeatCount:getRepeatCount(groupId)//触发复读的次数
            }
        }
        if (setting["imgRepeatOn"]){
            msg = removeCQCodeImgUrl(msg)
        }
        if (repeat[groupId].lastMsg === msg) {//是复读
            repeat[groupId].curCount++;//复读次数增加
            if (repeat[groupId].lastRepeat===msg)return;//与最后复读信息相同,则不复读
            if (repeat[groupId].curCount===repeat[groupId].repeatCount){//触发复读次数
                global.replyGroup(context);//复读
                repeat[groupId].curCount=1;//重置复读次数
                repeat[groupId].repeatCount=getRepeatCount(groupId);//重设触发复读次数
                repeat[groupId].lastRepeat=msg;//记录最后复读信息
            }
        }else {//不是复读
            repeat[groupId].curCount=1;//重置当前复读次数
            repeat[groupId].lastRepeat=null;//重置上条复读信息
        }
        repeat[groupId].lastMsg = msg;
    }
}

function removeCQCodeImgUrl(msg) {//去除复读信息中的url信息,此项可能导致复读判断不成功
    let image = msg.split("[CQ:image,")
    let result = image[0]
    if (image.length > 1){
        for (let i = 1; i < image.length; i++) {
            let img = image[i]
            let imgE = img.indexOf("]");
            let urlS = img.indexOf(",url=");
            let url = img.substring(urlS,imgE);
            img = img.replace(url,"");
            result += img;
        }
    }
    return result;
}

export default {
    setting,
    dict:repeat,
    handleRepeat,
    loadRepeatJson
}
