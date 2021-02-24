import fs, {readJsonSync} from 'fs-extra'
import path,{resolve} from 'path'
import {defaultConf} from './defaultConfig'

export const globalConf = {}

// 加载配置信息
function initialConf(path, name) {
    let file = resolve(__dirname, path)
    try {
        globalConf[name] = readJsonSync(file)
        global['LOG'](`已加载配置: config.json`)
    } catch (e) {
        global['ERR'](`config.json文件解析失败,加载默认配置`)
        globalConf[name] = defaultConf
        saveAndReloadConfig(defaultConf, false)
        global['LOG'](`已加载配置: config.json`)
    }
}

initialConf("./config.json", "default")

export const plugins = {}

// 加载配置
export function loadPlugins(pluginPath) {
    fs["readdir"](pluginPath, (err, files) => {
        for (let file of files) {
            let isDir = fs['lstatSync'](path.join(pluginPath,file)).isDirectory()
            if(isDir) initPluginsByName(file)
        }
    })
}

// 通过名称加载配置信息
function initSettingByName(pluginName) {
    try {
        let path_ = path.join(__dirname, 'plugins', pluginName)
        let files = fs['readdirSync'](path_)
        // 如果文件夹下有默认设置配置
        if (files.indexOf('defaultSetting.js') > -1) {
            const defaultConf = require(path.join(path_, 'defaultSetting.js'))['defaultConf']
            let fileNames = []
            for (const key of Object.keys(defaultConf)) {
                // 取出默认配置中的所有键名,拼接作为文件名
                fileNames.push(key === 'default' ? 'setting.json' : 'setting-' + key + '.json')
            }
            if (fileNames.length > 0) {
                for (let f of fileNames) {
                    if (f === 'setting.json') { // 基本配置项
                        try { // 从文件加载基本配置项
                            globalConf[pluginName] = readJsonSync(resolve(__dirname, 'plugins' , pluginName , "setting.json"))
                        } catch (e) { // 不存在该文件,即加载默认配置中的基本配置项,并保存基本配置项为文件
                            globalConf[pluginName] = defaultConf.default
                            saveSetting(defaultConf.default, path.join(__dirname, 'plugins' , pluginName , f))
                        }
                    } else { // 额外配置项
                        let name = f.substring(8).split('.')[0] // 取出额外配置键名
                        try { // 从文件加载额外配置项
                            globalConf[pluginName][name] = readJsonSync(resolve(__dirname, 'plugins' , pluginName , f))
                        } catch (e) { // 文件不存在,加载默认配置中的基本配置项,并保存为文件
                            globalConf[pluginName][name] = defaultConf[name]
                            saveSetting(defaultConf[name], path.join(__dirname, 'plugins' , pluginName , f))
                        }
                    }
                }
            }
        } else { // 文件夹下没有默认配置项,直接加载文件夹下的所有配置文件
            globalConf[pluginName] = readJsonSync(resolve(__dirname, 'plugins' , pluginName , "setting.json"))
            files = files.filter(o => {
                return o.split('.').pop() === 'json' && o !== 'setting.json' && o.startsWith('setting-')
            })
            if (files.length > 0) {
                for (let f of files) {
                    let name = f.substring(8).split('.')[0]
                    globalConf[pluginName][name] = readJsonSync(resolve(__dirname, 'plugins' , pluginName , f))
                }
            }
        }
        global['LOG'](`已加载模块配置: ${pluginName}/setting.json`)
    } catch (e) {
        global['ERR'](`${pluginName}/setting.json文件解析失败,请检查文件配置`)
        global['ERR'](`终止加载${pluginName}模块`)
        return false
    }
    return true
}

// 通过名称加载插件
function initPluginsByName(pluginName) {
    // 先加载配置文件
    if (initSettingByName(pluginName)) {
        // 完成加载配置文件后,加载模块
        try {
            plugins[pluginName] = require("./plugins/" + pluginName).default
            global['LOG'](`已加载模块: ${pluginName}`)
            return true
        } catch (e) {
            switch (e.code) {
                case "MODULE_NOT_FOUND":
                    global['ERR'](`${e.code}:${pluginName}模块未找到,请检查文件配置:${e.message}`)
                    break
                default:
                    global['ERR'](`${pluginName}模块加载失败:${e}`)
                    break
            }
            return false
        }
    }
}

// 保存json为指定路径的文件
function saveSetting(json, path) {
    let file = path
    let j = JSON.stringify(json, null, 2)
    return new Promise((resolve, reject) => {
        fs["writeFile"](file, j, "utf8", function (err) {
            if (err) {
                global["LOG"](err)
                reject(err)
            } else {
                resolve()
            }
        })
    })
}

// 通过名称保存并重载配置
export function saveAndReloadSettingByName(json, pluginName, reloadPlugin = false) {// json:配置,pluginName:插件名称,reloadPlugin:重载插件
    if (!json) { // 传入空json
        if (reloadPlugin)
            return initPluginsByName(pluginName)
        else
            return initSettingByName(pluginName)
    }
    let file = path.join(global['source']['plugins'], pluginName, "setting.json")
    let j = JSON.stringify(json, null, 2)
    return new Promise((resolve, reject) => {
        fs["writeFile"](file, j, "utf8", function (err) {
            if (err) {
                global["LOG"](err)
                reject(err)
            } else {
                if (reloadPlugin)
                    initPluginsByName(pluginName)
                else
                    initSettingByName(pluginName)
                resolve()
            }
        })
    })
}

// 保存并重载复读配置
export function saveAndReloadSettingForRepeat(json) {
    if (!json) return global['repeat']['loadRepeatJson']()
    let file = path.join(global['source'].repeat, 'setting.json')
    let j = JSON.stringify(json, null, 4)
    fs["writeFile"](file, j, "utf8", function (err) {
        if (err) {
            global["LOG"](err)
            return false
        } else {
            global['repeat']['loadRepeatJson']()
            global['repeat']['setting'] = json
        }
    })
}

// 保存并重载配置
export function saveAndReloadConfig(json = null, needReload = true) {
    if (!json) { // 传入空json,即重载config配置
        initialConf("./config.json", "default")
        return
    }
    let file = path.join(__dirname, 'config.json')
    let j = JSON.stringify(json, null, 2)
    fs["writeFile"](file, j, "utf8", function (err) {
        if (err) {
            global["LOG"](err)
        } else if (needReload) initialConf("./config.json", "default")
    })
}
