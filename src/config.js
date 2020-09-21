import fs,{readJsonSync, writeJsonSync} from 'fs-extra'
import {resolve} from 'path'
export const globalConf = {}

function initialConf(path, name) {
    let file = resolve(__dirname,path)
    globalConf[name]=readJsonSync(file)
}

initialConf("./config.json","default")

export const plugins = {}

export function loadPlugins(pluginPath) {
    fs["readdir"](pluginPath,(err,files)=>{
        for (let file of files) {
            initPluginsByName("./plugins/",file)
        }
    })
}

function initSettingByName(pluginPath,pluginName) {
    try{
        globalConf[pluginName]=readJsonSync(resolve(__dirname,pluginPath+pluginName+"/setting.json"))
        global['LOG'](`已加载模块配置: ${pluginName}/setting.json`)
    }catch (e) {
        global['ERR'](`${pluginName}/setting.json文件解析失败,请检查文件配置`)
        global['ERR'](`终止加载${pluginName}模块`)
        return false
    }
    return true
}

export function initPluginsByName(pluginPath,pluginName){
    if (initSettingByName(pluginPath, pluginName)) {
        try{
            plugins[pluginName]=require(pluginPath+pluginName).default
            global['LOG'](`已加载模块: ${pluginName}`)
        }catch (e) {
            switch (e.code) {
                case "MODULE_NOT_FOUND":
                    global['ERR'](`${e.code}:${pluginName}模块未找到,请检查文件配置`)
                    break
                default:
                    global['ERR'](`${e.code}:${pluginName}模块加载失败`)
                    break
            }
        }
    }
}

export function saveAndReloadSettingByName(json,pluginPath,pluginName) {
    let file = pluginPath+"/"+pluginName+"/setting.json"
    let j = JSON.stringify(json,null,4)
    fs["writeFileSync"](file,j,"utf8",function (err) {
        if (err)
            global["LOG"](err)
        else
            initSettingByName(pluginPath,pluginName)
    })
}