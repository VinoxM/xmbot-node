import fs from 'fs-extra'
import path from 'path'
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
const pool_suffix = {
    cn:'国服',
    tw:'台服',
    jp:'日服'
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
                pcrGacha = new PcrGacha(setting, pools, nickNames)
                pcrGacha.tableExists().then(res => {
                    if (res.count === 0) {
                        pcrGacha.tableCreate()
                    }
                }).catch(err => {
                    global['ERR'](err)
                })
                resolve(data)
            })
        })
    } catch (e) {
        global['ERR']('PCR-加载角色昵称出错')
    }
}

initNickName()

export function addCharacter(context) { // 新增角色
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
    let check_ = checkCharTypeAndStar(c[0],c[1])
    let check = check_.check
    if (check_.flag){
        global.replyMsg(context,check,true)
        return
    }
    let checkNames = checkName(c.slice(2))
    if (checkNames.length > 0) {
        context['message'] = '已存在相同的昵称:' + checkNames.join(',')
        global.replyMsg(context)
        return
    }
    nickNames[Number(c[2])] = [...[check.type, check.star], ...c.slice(2)]
    saveNickNames().then(() => {
        context['message'] = '保存成功'
        global.replyMsg(context)
    }).catch(() => {
        context['message'] = '保存失败'
        global.replyMsg(context)
    })
}

function checkName(names,id = false) { // 检查名称
    let res = []
    for (const name of names) {
        Object.values(nickNames).some((o, i) => {
            if (id&&o[2]===id) return false
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
    let check = {type: false, star: false}
    let charType = charRules.type
    for (let t in charType) {
        if (charType[t].indexOf(type) > -1) {
            check.type = t
            break;
        }
    }
    let charStar = charRules.star
    for (let s in charStar) {
        if (charStar[s].indexOf(star) > -1) {
            check.star = s
            break;
        }
    }
    if (!check.type) {
        let typeRules = []
        for (const t of Object.values(charRules.type)) {
            typeRules = [...typeRules, ...t]
        }
        return {check:`角色类型不规范[${typeRules.join(',')}]`,flag:true}
    }
    if (!check.star) {
        let starRules = []
        for (const s of Object.values(charRules.star)) {
            starRules = [...starRules, ...s]
        }
        return {check:`角色星级不规范[${starRules.join(',')}]`,flag:true}
    }
    return {flag:false,check}
}

export function delCharacter(context, byIndex = false) { // 删除角色
    let keys = Object.keys(nickNames)
    let raw_message = context['raw_message']
    if (raw_message === '') {
        global.replyMsg(context, '请输入要删除的角色', true)
        return
    }
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
        saveNickNames().then(() => {
            context['message'] = deleted + (deleted !== '' && notFound !== '' ? '\n' : '') + notFound
            global.replyMsg(context)
        }).catch(() => {
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
    if (raw_message === '') {
        global.replyMsg(context, '请输入要查看的角色', true)
        return
    }
    let result = characterFilter(raw_message, isIndex)
    let characters = result.characters.length > 0 ? result.characters.join('\n') : ''
    let notFound = result.notFound.length > 0 ? '角色' + result.notFound.join(',') + '未找到' : ''
    context['message'] = characters + (characters !== '' && notFound !== '' ? '\n' : '') + notFound
    global.replyMsg(context,null,true)
}

export function updateCharacter(context,isAddNickNames = false) {
    let msg = context['raw_message']
    let split = msg.split(':')
    if (split.length!==2){
        global.replyMsg(context,'输入不合规范->[要更新的角色]:[更新内容]',true)
        return
    }
    let name = split[0]
    let info_ = String(split[1])
    let info = info_.split("|")
    let char = []
    let charNum = ''
    let keys = Object.keys(nickNames)
    let flag = false
    for (const key of keys) {
        let o = nickNames[key]
        if (o.indexOf(name) > -1) {
            char = o
            flag = true
            charNum = key
            break
        }
    }
    if (!flag){
        global.replyMsg(context,`角色${name}未找到`,true)
        return
    }
    if (isAddNickNames){
        char = Array.from(new Set([...char,...info]))
    }else{
        char = info
        let check_ = checkCharTypeAndStar(char[0], char[1]) // 检查添加信息的角色类型和星级规范
        let check = check_.check
        if(check_.flag){
            global.replyMsg(context,check,true)
            return
        }
        char[0]=check.type;char[1]=check.star
    }
    let checkNames = checkName(char.slice(2), char[2])
    if (checkNames.length>0) {
        global.replyMsg(context,`已有相同的昵称存在:${checkNames.join(',')}`,true)
        return
    }
    nickNames[char[2]]=char
    saveNickNames().then(() => {
        context['message'] = '保存成功'
        global.replyMsg(context)
    }).catch(() => {
        context['message'] = '保存失败'
        global.replyMsg(context)
    })
}

function characterFilter(raw_message, isIndex) { // 筛选角色
    let chars = raw_message.split('|')
    let result = {
        characters: [],
        notFound: [],
        charInfo: []
    }
    for (const char of chars) {
        let res = Object.values(nickNames).filter(o => {
            return o.slice(2).indexOf(char) > -1
        })
        if (res.length === 0) {
            result.notFound.push(char)
        } else {
            result.charInfo.push(res.map(o => {
                return {id: o[2], name: o[4], star: o[1], inputName: char}
            }))
            if (isIndex)
                result.characters.push(char + ':' + res.map(o => o[2]).join(','))
            else {
                result.characters.push(char + ':' + res.map(o => o.slice(2).join(',')).join(';'))
            }
        }
    }
    return result
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
                saveCharacters().then(async () => {
                    await reloadGacha()
                    resolve()
                }).catch(err => reject(err))
            }
        })
    })
}

export async function changeDefaultPool(context, pool) { // 修改默认卡池
    const message = pool ? pool : context['raw_message']
    if (message === '') {
        global.replyMsg(context, '请输入要切换的卡池', true)
        return
    }
    let reply = ''
    switch (message) {
        case '国服':
        case '国服卡池':
        case 'cn':
            setting['default_pool'] = 'cn'
            reply = `切换至国服卡池\n->Pick Up:${getPoolPickUp('cn')}`
            break
        case '日服':
        case '日服卡池':
        case 'jp':
            setting['default_pool'] = 'jp'
            reply = `切换至日服卡池\n->Pick Up:${getPoolPickUp('jp')}`
            break
        case '台服':
        case '台服卡池':
        case 'tw':
            setting['default_pool'] = 'tw'
            reply = `切换至台服卡池\n->Pick Up:${getPoolPickUp('tw')}`
            break
    }
    if (reply === '') {
        reply = '没有您输入的卡池'
    } else {
        await saveSetting(setting, 'setting-pcr.json')
    }
    global.replyMsg(context, reply)
}

export function changePoolPickUp(context, suffix) { // 切换当前卡池up角色
    let message = context['raw_message']
    if (message === '') {
        context['message'] = '请输入要切换的up角色'
        global.replyMsg(context, null, true)
        return
    }
    let result = characterFilter(message, true)
    if (result.notFound.length > 0) {
        context['message'] = `角色:${result.notFound.join(',')}未找到`
        global.replyMsg(context, null, true)
        return
    }
    let chars = result.charInfo.map(o => o[0])
    let cantSetChar = chars.filter(o => o.star === 'star1')
    if (cantSetChar.length > 0) {
        context['message'] = `角色:${cantSetChar.map(o => o.inputName).join(',')}无法配置为up角色`
        global.replyMsg(context, null, true)
        return
    }
    let pool_name = suffix?suffix:setting.default_pool
    let pool = pools['pool_' + pool_name]
    let stars = {
        star3: [],
        star2: []
    }
    let keys_ = Object.keys(pool.pools)
    for (const key of keys_) {
        if (key.startsWith('pick_up')) {
            let s = pool.pools[key].prefix.split('★').length - 1
            let p = pool.pools['star' + s].pool
            p = [...p, ...pool.pools[key].pool]
            let set = new Set(p)
            let new_pool =[]
            for (const e of set) {
                if (nickNames[e][0]!=='limited')
                    new_pool.push(e)
            }
            pool.pools['star' + s].pool = new_pool
            delete pool.pools[key]
        }
    }
    for (const char of chars) {
        stars[char.star].push(char.id)
        let star_pool = pool.pools[char.star].pool
        let index = star_pool.indexOf(String(char.id))
        if (index > -1) star_pool.splice(index, 1)
        pool.pools[char.star].pool = star_pool
    }
    if (stars.star3.length > 0) {
        pool.pools.pick_up = {
            pool: stars.star3,
            prop: 7,
            prop_last: 7,
            name: "Pick Up",
            prefix: "★★★",
            free_stone: []
        }
        pool.pools.star3.prop = 18
        pool.pools.star3.prop_last = 18
    }
    if (stars.star2.length > 0) {
        pool.pools.pick_up1 = {
            pool: stars.star2,
            prop: 25,
            prop_last: 135,
            name: "Pick Up",
            prefix: "★★",
            free_stone: []
        }
        pool.pools.star2.prop = 130
        pool.pools.star2.prop_last = 705
    }
    let version = global['func']['getNowNum']()
    pool.info.version = version
    pools.info.version = version
    saveSetting(pools).then(() => {
        context['message'] = `已切换${pool_suffix[pool_name]}UP角色\n->Pick up:${getPoolPickUp(pool_name)}`
        global.replyMsg(context, null)
    })
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
        try{
            char[n[0]][n[1]][n[2]] = [n[3], n[4]]
        }catch (e) {
            console.error(e)
            console.error(n[0])
        }
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

export function saveSetting(json, fileName = 'setting-pcr-pools.json') { // 保存配置文件
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

async function reloadGacha() { // 重载模块
    global['reloadPlugin'](null, __dirname.split("\\").pop(), true)
    initPcrSetting()
    await initNickName()
}

function getPoolPickUp(suffix) {
    let pool_ = pools['pool_'+suffix].pools
    let key = Object.keys(pool_)
    let pick_up = []
    for (const k of key) {
        if (k.startsWith('pick_up')){
            let p = pool_[k].pool
            for (const e of p) {
                let charName = nickNames[e][4]
                pick_up.push(pool_[k].prefix+charName)
            }
        }
    }
    return pick_up
}

// function getCharImg(id) {
//     let fileName = id + '.jpg'
//     let filePath = path.join(global['source']['resource'], 'icon', 'unit')
//     let fullPath = path.join(filePath, fileName)
//     return new Promise((resolve, reject) => {
//         fs_.access(fullPath, fs_.constants.F_OK, (err) => {
//             if (!err) {
//                 resolve(fullPath)
//             } else {
//                 fs['mkdir'](filePath, (e) => {
//                     request_.getPcrPng(fileName.split('.')[0], fullPath).then(r => {
//                         resolve(fullPath)
//                     }).catch(e => {
//                         reject(e)
//                     })
//                 })
//             }
//         })
//     })
// }

export async function gacha(context, prefix) { // 十连
    const times = 10
    const user_id = context['user_id']
    if (!await checkGachaTimes(user_id, times)) {
        context['message'] = `您今天剩余抽卡次数不足${times}次`
        global.replyMsg(context, null, true)
        return
    }
    let json = await pcrGacha.gacha(context, prefix ? prefix : setting['default_pool'])
    await pcrGacha.updateGachaCount(user_id, times).then(() => global['LOG'](`记录用户[${user_id}]抽卡次数`))
    await pcrGacha.updateUserLibraries(user_id, json).then(() => global['LOG'](`记录用户[${user_id}]抽卡结果`))
}

export async function simple(context, prefix) { // 单抽
    const times = 1
    const user_id = context['user_id']
    if (!await checkGachaTimes(user_id, times)) {
        context['message'] = `您今天剩余抽卡次数不足${times}次`
        global.replyMsg(context, null, true)
        return
    }
    let json = await pcrGacha.simple(context, prefix ? prefix : setting['default_pool'])
    await pcrGacha.updateGachaCount(user_id, times).then(() => global['LOG'](`记录用户[${user_id}]抽卡次数`))
    await pcrGacha.updateUserLibraries(user_id, json).then(() => global['LOG'](`记录用户[${user_id}]抽卡结果`))
}

export async function thirty(context, prefix) { // 一井
    const times = 300
    const user_id = context['user_id']
    if (!await checkGachaTimes(user_id, times)) {
        context['message'] = `您今天剩余抽卡次数不足${times}次`
        global.replyMsg(context, null, true)
        return
    }
    let json = await pcrGacha.thirty(context, prefix ? prefix : setting['default_pool'])
    await pcrGacha.updateGachaCount(user_id, times).then(() => global['LOG'](`记录用户[${user_id}]抽卡次数`))
    await pcrGacha.updateUserLibraries(user_id, json).then(() => global['LOG'](`记录用户[${user_id}]抽卡结果`))
}

export function emptyGachaResource(context) { // 清空抽卡缓存
    pcrGacha.emptyGachaResource(context)
}

export function emptyGachaUnitResource(context) { // 清空抽卡角色缓存
    pcrGacha.emptyGachaUnitResource(context)
}

async function checkGachaTimes(user_id, times) { // 检查抽卡次数
    let count = await pcrGacha.getGachaCountByUserId(user_id)
    let limit = setting['day_limit']
    return limit >= count + times
}
