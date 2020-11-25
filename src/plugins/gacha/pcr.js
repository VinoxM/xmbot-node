import fs, {readJsonSync, writeJsonSync} from 'fs-extra'
import path from 'path'
import fs_ from 'fs'
import * as request_ from '../../http/request'
import {CQ} from '../../utils/CQCode'
import {PcrGacha} from './pcr-gacha'

let setting = null;
let pools = null;
let character = null;
let nickNames = null;
const nickNamePath = path.join(global['source'].main, 'docs', 'pcr');
const charRules = { // 角色规范
    type: {
        hidden: ['hidden', '隐藏'],
        limited: ['limited', '限定'],
        normal: ['normal', '通常', '常驻']
    },
    star: {
        star1: ['star1', '1星', '一星', '1'],
        star2: ['star2', '2星', '二星', '2'],
        star3: ['star3', '3星', '三星', '3']
    }
}
let pcrGacha = null

function initPcrSetting() { // 加载配置
    setting = global['config'][__dirname.split("\\").pop()]['pcr']
    pools = global['config'][__dirname.split("\\").pop()]['pcr-pools']
    character = global['config'][__dirname.split("\\").pop()]['pcr-character']
}

initPcrSetting()

export function initNickName(context, isReload = false) { // 加载角色
    try {
        return new Promise((resolve, reject) => {
            fs['readFile'](path.join(nickNamePath, 'nickname.csv'), 'utf8', (err, data) => {
                if (err) {
                    reject(err)
                    return
                }
                let chars = data.split(/\r?\n/)
                let nickName = {}
                for (const char of chars) {
                    if (char === '') continue
                    let c = char.split(',')
                    nickName[Number(c[2])] = c
                }
                nickNames = nickName
                global['LOG']('PCR-完成角色昵称加载')
                if (isReload) {
                    context['message'] = '完成角色昵称加载'
                    global.replyMsg(context, null, true)
                }
                if (pcrGacha) pcrGacha['close']()
                pcrGacha = new PcrGacha(setting,pools,nickNames)
                pcrGacha.tableExists().then(res=>{
                    if (res.count===0){
                        pcrGacha.tableCreate()
                    }
                }).catch(err=>{global['ERR'](err)})
                resolve(data)
            })
        })
    } catch (e) {
        global['ERR']('PCR-加载角色昵称出错')
    }
}

initNickName()

export function addCharacter(context) { // 添加角色
    let raw_message = context['raw_message']
    let c = raw_message.split('|')
    if (c.length < 5) {
        context['message'] = '请输入正确长度的角色信息(最少5个信息:[角色类型|星级|序号|日文名|中文名])'
        global.replyMsg(context, null, true)
        return
    }
    if (Object.keys(nickNames).indexOf(c[2]) > -1) {
        context['message'] = '已有该序号的角色信息'
        global.replyMsg(context, null, true)
        return
    }
    let check = checkCharTypeAndStar(c[0], c[1]) // 检查添加信息的角色类型和星级规范
    if (!check.type) {
        let typeRules = []
        for (const t of Object.values(charRules.type)) {
            typeRules = [...typeRules, ...t]
        }
        context['message'] = `角色类型不规范[${typeRules.join(',')}]`
        global.replyMsg(context)
        return
    }
    if (!check.star) {
        let starRules = []
        for (const s of Object.values(charRules.star)) {
            starRules = [...starRules, ...s]
        }
        context['message'] = `角色星级不规范[${starRules.join(',')}]`
        global.replyMsg(context)
        return
    }
    let checkNames = checkName(c.slice(2))
    if (checkNames.length > 0) {
        context['message'] = '已存在相同的昵称:' + checkNames.join(',')
        global.replyMsg(context)
        return
    }
    nickNames[Number(c[2])] = [...[check.type, check.star], ...c.slice(2)]
    saveNickNames().then(res => {
        context['message'] = '保存成功'
        global.replyMsg(context)
    }).catch(err => {
        context['message'] = '保存失败'
        global.replyMsg(context)
    })
}

function checkName(names) { // 检查名称
    let res = []
    for (const name of names) {
        Object.values(nickNames).some((o, i) => {
            if (i < 2) return false
            if (o.indexOf(name) > -1) {
                res.push(name)
                return true
            }
            return false
        })
    }
    return res
}

function checkCharTypeAndStar(type, star) { // 检查角色类型和星级规范
    let res = {type: false, star: false}
    let charType = charRules.type
    for (let t in charType) {
        if (charType[t].indexOf(type) > -1) {
            res.type = t
            break;
        }
    }
    let charStar = charRules.star
    for (let s in charStar) {
        if (charStar[s].indexOf(star) > -1) {
            res.star = s
            break;
        }
    }
    return res
}

export function delCharacter(context, byIndex = false) { // 删除角色
    let keys = Object.keys(nickNames)
    let raw_message = context['raw_message']
    if (raw_message === '') return global.replyMsg(context, '请输入要删除的角色', true)
    let chars = raw_message.split('|')
    let result = {
        deleted: [],
        notFound: []
    }
    for (const char of chars) {
        let delFlag = false
        if (byIndex) {
            let index = keys.indexOf(char)
            if (index > -1) {
                delete nickNames[keys[index]]
                delFlag = true
            }
        } else {
            for (const key of keys) {
                if (nickNames[key].slice(2).indexOf(char) > -1) {
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
    if (result.deleted.length > 0) {
        let deleted = result.deleted.length > 0 ? '角色' + result.deleted.join(',') + '已删除' : ''
        let notFound = result.notFound.length > 0 ? '角色' + result.notFound.join(',') + '未找到' : ''
        saveNickNames().then(res => {
            context['message'] = deleted + (deleted !== '' && notFound !== '' ? '\n' : '') + notFound
            global.replyMsg(context)
        }).catch(err => {
            context['message'] = '删除失败'
            global.replyMsg(context)
        })
    } else {
        context['message'] = '角色' + result.notFound.join(',') + '未找到'
        global.replyMsg(context, null, true)
    }
}

export function viewCharacter(context, isIndex = false) { // 查看角色
    let raw_message = context['raw_message']
    if (raw_message === '') return global.replyMsg(context, '请输入要查看的角色', true)
    let chars = raw_message.split('|')
    let result = {
        characters: [],
        notFound: [],
        id: []
    }
    for (const char of chars) {
        let res = Object.values(nickNames).filter(o => {
            return o.slice(2).indexOf(char) > -1
        })
        if (res.length === 0) {
            result.notFound.push(char)
        } else {
            if (isIndex)
                result.characters.push(char + ':' + res.map(o => o[2]).join(','))
            else {
                result.characters.push(char + ':' + res.map(o => o[4]).join(','))
            }
        }
    }
    let characters = result.characters.length > 0 ? result.characters.join('\n') : ''
    let notFound = result.notFound.length > 0 ? '角色' + result.notFound.join(',') + '未找到' : ''
    context['message'] = characters + (characters !== '' && notFound !== '' ? '\n' : '') + notFound
    global.replyMsg(context)
}

export function saveNickNames(fileName = 'nickname.csv') { // 保存角色到文件
    return new Promise((resolve, reject) => {
        let values = Object.values(nickNames);
        values.sort((a, b) => Number(a[2]) - Number(b[2]))
        let str = values.map(o => {
            return o.join(',')
        }).join('\n')
        let buffer = Buffer.from(str);
        fs['writeFile'](path.join(nickNamePath, fileName), buffer, (err) => {
            if (err) {
                global['ERR'](err)
                reject(err)
            } else {
                saveCharacters().then(res => {
                    reloadGacha()
                    resolve()
                }).catch(err => reject(err))
            }
        })
    })
}

export async function selectDefaultPool(context) {
    const message = context['raw_message']
    if (message==='') return global.replyMsg(context,'请输入要切换的卡池',true)
    let reply = ''
    switch (message) {
        case '国服':
        case '国服卡池':
        case 'cn':
            setting['default_pool']='cn'
            reply = '切换国服卡池成功'
            break
        case '日服':
        case '日服卡池':
        case 'jp':
            setting['default_pool']='jp'
            reply = '切换日服卡池成功'
            break
        case '台服':
        case '台服卡池':
        case 'tw':
            setting['default_pool']='tw'
            reply = '切换台服卡池成功'
            break
    }
    if (reply===''){
        reply = '没有您输入的卡池'
    }else{
        await saveSetting(setting,'setting-pcr.json')
        await reloadGacha()
    }
    global.replyMsg(context,reply,true)
}

function saveCharacters(fileName = 'setting-pcr-character.json') { // 保存角色
    let char = {
        hidden: {
            star1: {}, star2: {}, star3: {}
        },
        limited: {
            star1: {}, star2: {}, star3: {}
        },
        normal: {
            star1: {}, star2: {}, star3: {}
        }
    }
    for (const n of Object.values(nickNames)) {
        char[n[0]][n[1]][n[2]] = [n[3], n[4]]
    }
    return new Promise((resolve, reject) => {
        fs['writeFile'](path.join(__dirname, fileName), JSON.stringify(char, null, 4), "utf8", (err) => {
            if (err) {
                global['ERR'](err)
                reject(err)
            } else resolve()
        })
    })
}

export function saveSetting(json, fileName = 'setting-pcr-pools.json') {
    return new Promise((resolve, reject) => {
        fs['writeFile'](path.join(__dirname, fileName), JSON.stringify(json, null, 2), "utf8", async (err) => {
            if (err) {
                global['ERR'](err)
                reject(err)
            } else {
                await reloadGacha()
                resolve()
            }
        })
    })
}

async function reloadGacha() {
    global['reloadPlugin'](null, __dirname.split("\\").pop(), true)
    initPcrSetting()
    await initNickName()
}

function getCharImg(id) {
    let fileName = id + '.jpg'
    let filePath = path.join(global['source']['resource'], 'icon', 'unit')
    let fullPath = path.join(filePath, fileName)
    return new Promise((resolve, reject) => {
        fs_.access(fullPath, fs_.constants.F_OK, (err) => {
            if (!err) {
                resolve(fullPath)
            } else {
                fs['mkdir'](filePath, (e) => {
                    request_.getPcrPng(fileName.split('.')[0], fullPath).then(r => {
                        resolve(fullPath)
                    }).catch(e => {
                        reject(e)
                    })
                })
            }
        })
    })
}

export async function gacha(context, prefix) {
    const times = 10
    const user_id = context['user_id']
    if (!await checkGachaTimes(user_id, times)) {
        context['message'] = `您今天剩余抽卡次数不足${times}次`
        global.replyMsg(context,null,true)
        return
    }
    let json = await pcrGacha.gacha(context, prefix ? prefix : setting['default_pool'])
    await pcrGacha.updateGachaCount(user_id, times).then(r => global['LOG'](`记录用户[${user_id}]抽卡次数`))
    await pcrGacha.updateUserLibraries(user_id,json).then(r => global['LOG'](`记录用户[${user_id}]抽卡结果`))
}

export async function simple(context, prefix) {
    const times = 1
    const user_id = context['user_id']
    if (!await checkGachaTimes(user_id, times)) {
        context['message'] = `您今天剩余抽卡次数不足${times}次`
        global.replyMsg(context,null,true)
        return
    }
    let json = await pcrGacha.simple(context, prefix ? prefix : setting['default_pool'])
    await pcrGacha.updateGachaCount(user_id, times).then(r => global['LOG'](`记录用户[${user_id}]抽卡次数`))
    await pcrGacha.updateUserLibraries(user_id,json).then(r => global['LOG'](`记录用户[${user_id}]抽卡结果`))
}

export async function thirty(context,prefix) {
    const times = 300
    const user_id = context['user_id']
    if (!await checkGachaTimes(user_id, times)) {
        context['message'] = `您今天剩余抽卡次数不足${times}次`
        global.replyMsg(context,null,true)
        return
    }
    let json = await pcrGacha.thirty(context, prefix ? prefix : setting['default_pool'])
    await pcrGacha.updateGachaCount(user_id, times).then(r => global['LOG'](`记录用户[${user_id}]抽卡次数`))
    await pcrGacha.updateUserLibraries(user_id,json).then(r => global['LOG'](`记录用户[${user_id}]抽卡结果`))
}

export function emptyGachaResource(context) {
    pcrGacha.emptyGachaResource(context)
}

export function emptyGachaUnitResource(context) {
    pcrGacha.emptyGachaUnitResource(context)
}

async function checkGachaTimes(user_id,times) {
    let count = await pcrGacha.getGachaCountByUserId(user_id)
    let limit = setting['day_limit']
    return limit>=count+times
}
