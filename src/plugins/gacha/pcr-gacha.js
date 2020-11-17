import {SqliteDb} from '../../db/index'
import {getPcrPng} from "../../http/request";
import {handleRepeat} from "../../repeat";

const sharp = require('sharp')
const fs = require('fs')
const path = require('path')
const unitPath = path.join(global.source.resource, 'icon', 'unit')
const gachaUnitPath = path.join(global.source.resource, 'gacha', 'unit')
const starPath = path.join(global.source.resource, 'gacha', 'utils', 'star.png')

export class PcrGacha {
    constructor(setting, pool, nick) {
        this.setting = setting
        this.pools = pool
        this.nickName = nick
        // this.db = new SqliteDb('gacha')
    }

    thirty = (context, prefix) => {
        let pool = this.pools['pool_' + prefix]['pools']
        let result = []
        // let curPickUp = getPoolPickUp(pool, this.nickName).join(',')
        let count = {
            star1: 0, star2: 0, star3: 0, pick_up: 0, free_stone: 0
        }
        let first_pick_up = 0
        let pick_up = {}
        for (let i = 1; i <= 300; i++) {
            let res = simple(pool, i % 10 === 0 ? 'prop_last' : 'prop', this.nickName)
            if (res.isPickUp) {
                count.pick_up += 1
                if (first_pick_up === 0) first_pick_up = i
                if (!pick_up.hasOwnProperty(res.id)) {
                    let name = ''
                    for (let j = 0; j < Number(res.star); j++) {
                        name += '★'
                    }
                    pick_up[res.id] = {name: name + res.name, count: 1}
                } else {
                    pick_up[res.id].count++
                }
                if (res.isFreeStone) count.free_stone++
            }
            count['star' + res.star]++
            if (res.isPickUp || res.star === '3') result.push(res)
        }
        let reply_info = this.setting['reply_info']
        let reply = `> ${this.pools['pool_' + prefix]['info']['name']}\n素敵な仲間が増えますよ！\n`
        let replyEnd = ''
        replyEnd += `★★★x${count.star3}，★★x${count.star2}，★x${count.star1}\n`
        let p_keys = Object.keys(pick_up)
        if (p_keys.length > 0) {
            replyEnd += 'Pick Up: '
            let arr = []
            for (const key of p_keys) {
                arr.push(pick_up[key].name + 'x' + pick_up[key].count)
            }
            replyEnd += arr.join(',')+'\n'
        }
        replyEnd += `获得${count.free_stone === 0 ? '' : '记忆碎片x' + count.free_stone * 100 + '与'}女神秘石x${count.star1 + count.star2 * 10 + count.star3 * 100}!\n`
        replyEnd += `${first_pick_up === 0 ? '' : '第' + first_pick_up + '抽首出Up角色\n'}`
        let len = count.star3
        if (first_pick_up === 0) len = -1
        if (count.star3 < 5 && count.free_stone >= 2) len = -2
        for (const info of Object.values(reply_info)) {
            if (len>=info['range'][0]&&len<=info['range'][1]){
                replyEnd+=getRandomFromArray(info['reply'])
                break
            }
        }
        handleImage(result).then(res => {
            reply += global.CQ.img(res)
            context['message'] = reply+replyEnd
            global.replyMsg(context, null, true)
        })
    }

    gacha = (context, prefix) => {
        let pool = this.pools['pool_' + prefix]['pools']
        let result = []
        for (let i = 0; i < 10; i++) {
            let res = simple(pool, i === 9 ? 'prop_last' : 'prop', this.nickName)
            result.push(res)
        }
        handleImage(result).then(res => {
            let reply = ''
            reply += global.CQ.img(res)
            context['message'] = reply
            global.replyMsg(context, null, true)
        })
    }

    simple = (context, prefix) => {
        let pool = this.pools['pool_' + prefix]['pools']
        let result = simple(pool, 'prop', this.nickName)
        handleImage([result]).then(res => {
            let reply = ''
            reply += global.CQ.img(res)
            context['message'] = reply
            global.replyMsg(context, null, true)
        })
    }
}

function simple(pool, prop, nickName) { // 单抽
    let props = []
    let pools = Object.values(pool)
    let prop_sum = 0
    pools.forEach(e => {
        props.push(Number(e[prop]))
        prop_sum += Number(e[prop])
    })
    prop_sum *= Math.random()
    let index = 0
    for (let i = 0; i < props.length; i++) {
        prop_sum -= props[i]
        if (prop_sum < 0) {
            index = i
            break
        }
    }
    let pool_sel = pools[index]['pool']
    let id = getRandomFromArray(pool_sel)
    let result = getNickNameAndStar(id, nickName)
    result.isPickUp = pools[index]['name'] === 'Pick Up'
    result.isFreeStone = pools[index]['free_stone']&&pools[index]['free_stone'].indexOf(id) > -1
    return result
}

function getRandomFromArray(arr) { // 从数组中随机获取一个元素
    let index = Math.floor((Math.random() * arr.length));
    return arr[index]
}

function getNickNameAndStar(id, nickName) { // 获取昵称和星级
    return {id: id, name: nickName[id][4], star: String(nickName[id][1]).substring(4)}
}

async function handleImage(result) { // 拼接图片
    let count = result.length
    let height = Math.ceil(count / 5) * 130
    let width = 5 * 130
    const baseOpt = {
        width: width,
        height: height,
        channels: 4,
        background: {
            r: 255, g: 255, b: 255, alpha: 0,
        },
    }

    let compositeArr = []

    for (let i = 0; i < result.length; i++) {
        let current = result[i]
        let row = Math.floor(i / 5)
        let col = i % 5
        let top = 1 + row * 130
        let left = 1 + col * 130
        let full_id = current.id + (current.star === '2' ? '1' : current.star) + '1'
        let fileName = full_id + '.jpg'
        let imageExists = await checkImageExists(unitPath, full_id)
        if (imageExists) {
            let starImgExists = await checkImageExists(gachaUnitPath, full_id)
            if (!starImgExists) await handleImageStar(full_id, Number(current.star))
        } else {
            await getImageFromWeb(unitPath, full_id, path.join(unitPath, full_id + '.jpg'))
        }
        let path_ = path.join(gachaUnitPath, fileName)
        compositeArr.push({input: path_, top, left})
    }


    let fileName = new Date().getTime() + '.jpg'
    let filePath = path.join(global.source.resource, 'gacha', fileName)
    return new Promise((resolve, reject) => {
        sharp({create: baseOpt})['composite'](compositeArr).png().toFile(filePath).then(r => {
            resolve(filePath)
        }).catch(err => {
            reject(err)
        })
    })
}

async function checkImageExists(filePath, full_id) { // 检查图片是否存在
    let fullPath = path.join(filePath, full_id + '.jpg')
    try {
        fs.statSync(fullPath)
        return true
    } catch (e) {
        return false
    }
}

function getImageFromWeb(filePath, full_id, fullPath) { // 从网页获取图片
    return new Promise((resolve, reject) => {
        fs['mkdir'](filePath, {recursive: true}, (e) => {
            getPcrPng(full_id, fullPath).then(r => {
                resolve()
            }).catch(e => {
                reject(e)
            })
        })
    })
}

async function handleImageStar(full_id, star) { // 拼接角色星级图片
    let buffer = null
    await sharp(starPath)['png']().extract({
        left: 15,
        top: 15,
        width: 72,
        height: 72
    }).resize(24, 24).toBuffer().then(data => {
        buffer = Buffer.from(data)
    })
    let arr = []
    for (let i = 0; i < star; i++) {
        arr.push({input: buffer, left: 24 * i.toFixed(0) + 8, top: 100})
    }
    return new Promise((resolve, reject) => {
        fs['mkdir'](gachaUnitPath, {recursive: true}, (e) => {
            sharp(path.join(unitPath, full_id + '.jpg'))['jpeg']().resize(128, 128)['composite'](arr).jpeg().toFile(path.join(gachaUnitPath, full_id + '.jpg'))
                .then(r => {
                    resolve()
                })
                .catch(err => {
                    reject(err)
                })
        })
    })
}

function getPoolPickUp(pool, nickName) {
    let result = []
    let keys = Object.keys(pool)
    for (const key of keys) {
        if (key.startsWith('pick_up')) {
            let res = pool[key]['pool'].map(o => {
                return pool[key].prefix + nickName[o][4]
            })
            result = [...result, ...res]
        }
    }
    return result
}
