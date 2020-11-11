import fs,{readJsonSync, writeJsonSync} from 'fs-extra'
import {resolve} from 'path'
import {loadRepeatJson} from "./repeat";
export const globalConf = {}

// 加载配置信息
function initialConf(path, name) {
    let file = resolve(__dirname,path)
    try{
        globalConf[name]=readJsonSync(file)
        global['LOG'](`已加载配置: config.json`)
        return true
    }catch (e) {
        global['ERR'](`config.json文件解析失败,请检查文件配置`)
        return false
    }
}

initialConf("./config.json","default")

export const plugins = {}

// 加载配置
export function loadPlugins(pluginPath) {
    fs["readdir"](pluginPath,(err,files)=>{
        for (let file of files) {
            initPluginsByName(file)
        }
    })
}

// 通过名称加载配置信息
function initSettingByName(pluginName) {
    try{
        globalConf[pluginName]=readJsonSync(resolve(__dirname,"./plugins/"+pluginName+"/setting.json"))
        global['LOG'](`已加载模块配置: ${pluginName}/setting.json`)
    }catch (e) {
        global['ERR'](`${pluginName}/setting.json文件解析失败,请检查文件配置`)
        global['ERR'](`终止加载${pluginName}模块`)
        return false
    }
    return true
}

// 通过名称加载插件
function initPluginsByName(pluginName){
    if (initSettingByName(pluginName)) {
        try{
            plugins[pluginName]=require("./plugins/"+pluginName).default
            global['LOG'](`已加载模块: ${pluginName}`)
            return true
        }catch (e) {
            switch (e.code) {
                case "MODULE_NOT_FOUND":
                    global['ERR'](`${e.code}:${pluginName}模块未找到,请检查文件配置`)
                    break
                default:
                    global['ERR'](`${e.code}:${pluginName}模块加载失败`)
                    break
            }
            return false
        }
    }
}

// 通过名称保存并重载配置
export function saveAndReloadSettingByName(json,pluginName,reloadPlugin = false) {// json:配置,pluginPath:插件路径,pluginName:插件名称
    if (!json){
        if (reloadPlugin)
            return initPluginsByName(pluginName)
        else
            return initSettingByName(pluginName)
    }
    let file = path.join("./plugins/",pluginName,"setting.json")
    let j = JSON.stringify(json,null,4)
    fs["writeFileSync"](file,j,"utf8",function (err) {
        if (err)
            global["LOG"](err)
        else {
            if (reloadPlugin)
                return initPluginsByName(pluginName)
            else
                return initSettingByName(pluginName)
        }
    })
}

// 保存并重载复读配置
export function saveAndReloadSettingForRepeat(json) {
    if (!json) return global['repeat']['loadRepeatJson']()
    let file = path.join(global['source'].repeat,'setting.json')
    let j = JSON.stringify(json,null,4)
    fs["writeFileSync"](file,j,"utf8",function (err) {
        if (err) {
            global["LOG"](err)
            return false
        }else
            return global['repeat']['loadRepeatJson']()
    })
}

// 保存并重载配置
export function saveAndReloadConfig(json) {
    if (!json) return initialConf("./config.json","default")
    let file = path.join(__dirname,'config.json')
    let j = JSON.stringify(json,null,4)
    fs["writeFileSync"](file,j,"utf8",function (err) {
        if (err) {
            global["LOG"](err)
            return false
        }else
            return initialConf("./config.json","default")
    })
}
