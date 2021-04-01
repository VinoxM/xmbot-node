import {SqliteDb} from '../../db/index'
import {getPcrPng} from "../../http/request";

const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

const unitPath = path.join(global.source.resource, 'icon', 'unit')
const gachaPath = path.join(global.source.resource, 'gacha')
const gachaUnitPath = path.join(global.source.resource, 'gacha', 'unit')
const gachaUnitBorderPath = path.join(global.source.resource, 'gacha', 'unit', 'border')
const starPath = path.join(global.source.resource, 'gacha', 'utils', 'star.png')
const backgroundPath = path.join(global.source.resource, 'gacha', 'utils', 'background.jpg')

// const borderPath = path.join(global.source.resource, 'gacha', 'utils', 'border.png')

export class PcrGacha {
    constructor(setting, pool, nick) {
        this.setting = setting
        this.pools = pool
        this.nickName = nick
        this.db = new SqliteDb('gacha')
    }

    multiple = async (context, prefix) => {
        let pool = this.pools['pool_' + prefix]['pools']
        let result = []
        let lib = {}
        let curPickUp = getPoolPickUp(pool, this.nickName).join(',')
        let count = {
            star1: 0, star2: 0, star3: 0, pick_up: 0, free_stone: 0
        }
        let first_pick_up = 0
        let pick_up = {}
        for (let i = 1; i <= 200; i++) {
            let res = simple(pool, i % 10 === 0 ? 'prop_last' : 'prop', this.nickName)
            if (lib.hasOwnProperty(res.id)) {
                lib[res.id].count++
            } else {
                lib[res.id] = {
                    nickName: res.name,
                    count: 1,
                    star: res.star
                }
            }
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
        let reply = `> ${this.pools['pool_' + prefix]['info']['name']}:${curPickUp}\n素敵な仲間が増えますよ！\n`
        let replyEnd = ''
        replyEnd += `★★★x${count.star3}，★★x${count.star2}，★x${count.star1}\n`
        let p_keys = Object.keys(pick_up)
        if (p_keys.length > 0) {
            replyEnd += 'Pick Up: '
            let arr = []
            for (const key of p_keys) {
                arr.push(pick_up[key].name + 'x' + pick_up[key].count)
            }
            replyEnd += arr.join(',') + '\n'
        }
        replyEnd += `获得${count.free_stone === 0 ? '' : '记忆碎片x' + count.free_stone * 100 + '与'}女神秘石x${count.star1 + count.star2 * 10 + count.star3 * 100}!\n`
        replyEnd += `${first_pick_up === 0 ? '' : '第' + first_pick_up + '抽首出UP角色\n'}`
        let len = count.star3
        if (first_pick_up === 0) len = -1
        if (count.star3 < 5 && count.free_stone >= 2) len = -2
        for (const info of Object.values(reply_info)) {
            if (len >= info['range'][0] && len <= info['range'][1]) {
                replyEnd += getRandomFromArray(info['reply'])
                break
            }
        }
        await handleImage(result).then(res => {
            reply += global.CQ().img(res)
            context['message'] = reply + replyEnd
            global.replyMsg(context, null, true)
        })
        return lib
    }

    gacha = async (context, prefix) => {
        let pool = this.pools['pool_' + prefix]['pools']
        let result = []
        let lib = {}
        for (let i = 0; i < 10; i++) {
            let res = simple(pool, i === 9 ? 'prop_last' : 'prop', this.nickName)
            if (lib.hasOwnProperty(res.id)) {
                lib[res.id].count++
            } else {
                lib[res.id] = {
                    nickName: res.name,
                    count: 1,
                    star: res.star
                }
            }
            result.push(res)
        }
        await handleImage(result, false, true).then(res => {
            let curPickUp = getPoolPickUp(pool, this.nickName).join(',')
            let reply = `>${this.pools['pool_' + prefix]['info']['name']}:${curPickUp}\n素敵な仲間が増えますよ！\n`
            reply += global.CQ().img(res)
            let gachaResult = result.map(o => new Array(Number(o.star)).fill('★').join('') + ' ' + o.name)
            let gachaReply = gachaResult.slice(0, 5).join(',') + '\n' + gachaResult.slice(5).join(',')
            context['message'] = reply + gachaReply
            global.replyMsg(context, null, true)
        })
        return lib
    }

    simple = async (context, prefix) => {
        let pool = this.pools['pool_' + prefix]['pools']
        let result = simple(pool, 'prop', this.nickName)
        let lib = {}
        lib[result.id] = {
            nickName: result.name,
            count: 1,
            star: result.star
        }
        await handleImage([result], false).then(res => {
            let curPickUp = getPoolPickUp(pool, this.nickName).join(',')
            let reply = `>${this.pools['pool_' + prefix]['info']['name']}:${curPickUp}\n素敵な仲間が増えますよ！\n`
            reply += global.CQ().img(res)
            reply += new Array(Number(result.star)).fill('★').join('') + ' ' + result.name
            context['message'] = reply
            global.replyMsg(context, null, true)
        })
        return lib
    }

    close = () => this.db.close()

    emptyGachaResource = (context) => {
        emptyGachaResource().then(() => {
            context['message'] = '清空完成'
            global.replyMsg(context)
        }).catch(e => {
            global['err'](e)
            context['message'] = '清空失败'
            global.replyMsg(context)
        })
    }

    emptyGachaUnitResource = (context) => {
        emptyGachaUnitResource().then(() => {
            context['message'] = '清空完成'
            global.replyMsg(context)
        }).catch(e => {
            global['err'](e)
            context['message'] = '清空失败'
            global.replyMsg(context)
        })
    }

    tableExists = () => {
        return this.db.exists('gacha')
    }

    tableCreate = () => {
        return this.db.create('gacha', ['user_id TEXT PRIMARY KEY NOT NULL', 'last_time TEXT', 'today_times INT DEFAULT 0', 'all_times INT DEFAULT 0', 'libraries TEXT'])
    }

    userExists = async (user_id) => userExists(user_id, this.db)

    userCreate = (map) => userCreate(map, this.db)

    getGachaCountByUserId = async (user_id) => {
        const sql = 'select today_times from gacha where user_id=? and last_time=?'
        let count = 0
        await this.db.sel(sql, [user_id, getTodayNum()]).then(rows => {
            if (rows.length > 0) {
                count = rows[0].today_times
            }
        })
        return count
    }

    updateGachaCount = async (user_id, count) => {
        let check = await userExists(user_id, this.db)
        if (!check) {
            await userCreate({
                user_id: user_id,
                last_time: getTodayNum(),
                today_times: count,
                all_times: count
            }, this.db)
        } else {
            const sql = 'select last_time from gacha where user_id = ?'
            this.db.sel(sql, [user_id]).then(rows => {
                let last_time = rows[0].last_time
                if (checkIsToday(last_time)) {
                    const sql1 = 'update gacha set today_times=today_times+?,all_times=all_times+? where user_id = ?'
                    this.db.update(sql1, [count, count, user_id])
                } else {
                    const sql2 = 'update gacha set today_times=today_times+?,all_times=all_times+?,last_time=? where user_id = ?'
                    this.db.update(sql2, [count, count, getTodayNum(), user_id])
                }
            })
        }
    }

    updateUserLibraries = async (user_id, json) => {
        const sql = 'select libraries from gacha where user_id = ?'
        await this.db.sel(sql, [user_id]).then(rows => {
            if (rows.length > 0) {
                let lib = rows[0].libraries
                let data = {}
                if (lib && lib !== '') {
                    data = JSON.parse(lib)
                    let keys = Object.keys(json)
                    for (const key of keys) {
                        if (data.hasOwnProperty(key)) {
                            data[key].count += json[key].count
                        } else {
                            data[key] = {
                                nick_name: json[key].nickName,
                                star: json[key].star,
                                count: json[key].count
                            }
                        }
                    }
                } else data = json
                const sql1 = 'update gacha set libraries = ? where user_id = ?'
                this.db.update(sql1, [JSON.stringify(data), user_id])
            }
        })
    }
}

async function userExists(user_id, db) {
    let flag = false
    const sql = 'select count(1) as count from gacha where user_id = ?'
    await db.sel(sql, [user_id]).then((rows) => {
        flag = rows.length && rows[0].count > 0
    })
    return flag
}

function userCreate(map, db) {
    let params = Object.values(map)
    const sql = `insert into gacha(${Object.keys(map).join(',')}) values(${params.map(o => '?').join(',')})`
    return db.add(sql, params)
}

function checkIsToday(last) {
    if (!last) return false
    let today = getTodayNum()
    return today - Number(last) === 0
}

function getTodayNum() {
    let date = new Date()
    return date.getFullYear() * 10000 + date.getMonth() * 100 + date.getDate()
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
    result.isFreeStone = pools[index]['free_stone'] && pools[index]['free_stone'].indexOf(id) > -1
    return result
}

function getRandomFromArray(arr) { // 从数组中随机获取一个元素
    let index = Math.floor((Math.random() * arr.length));
    return arr[index]
}

function getNickNameAndStar(id, nickName) { // 获取昵称和星级
    return {id: id, name: nickName[id][4], star: String(nickName[id][1]).substring(4)}
}

async function handleImage(result, checkStar3 = true, needBackground = false) { // 拼接图片
    if (checkStar3) result = result.filter(o => o.star === '3');
    let count = result.length
    if (count === 0) return Promise.resolve('')
    const _width = needBackground ? 180 : 130
    const _height = needBackground ? 150 : 130
    let baseOpt = null
    if (!needBackground) {
        let height = Math.ceil(count / 5) * _width
        let width = (count < 5 ? count : 5) * _width
        baseOpt = {
            create: {
                width: width,
                height: height,
                channels: 4,
                background: {
                    r: 255, g: 255, b: 255, alpha: 0,
                },
            }
        }
    } else {
        await sharp(backgroundPath).resize(1280, 720).toBuffer().then(data => baseOpt = Buffer.from(data))
    }

    let compositeArr = []
    const _left = needBackground ? 214 : 1
    const _top = needBackground ? 148 : 1
    for (let i = 0; i < result.length; i++) {
        let current = result[i]
        let row = Math.floor(i / 5)
        let col = i % 5
        let top = _top + row * _height
        let left = _left + col * _width
        let full_id = current.id + (current.star === '2' ? '1' : current.star) + '1'
        let fileName = full_id + '.png'
        let imageExists = await checkImageExists(unitPath, full_id)
        if (!imageExists) {
            await getImageFromWeb(unitPath, full_id, path.join(unitPath, full_id + '.png'))
        }
        await handleImageStar(full_id, Number(current.star), needBackground)
        let path_ = path.join(needBackground ? gachaUnitBorderPath : gachaUnitPath, fileName)
        let input = path_
        if (needBackground) {
            await sharp(path_).toBuffer().then(data => {
                input = Buffer.from(data)
            }).catch(e => global.ERR(e))
        }
        compositeArr.push({input, top, left})
    }

    let fileName = new Date().getTime() + '.jpg'
    let filePath = path.join(global.source.resource, 'gacha', fileName)
    return new Promise((resolve, reject) => {
        sharp(baseOpt)['composite'](compositeArr).png().toFile(filePath).then(r => {
            resolve(filePath)
        }).catch(err => {
            reject(err)
        })
    })
}

async function checkImageExists(filePath, full_id) { // 检查图片是否存在
    let fullPath = path.join(filePath, full_id + '.png')
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

async function addImageBorder(input, star3 = false) {
    const ra = Buffer.from('' +
        '<svg>' +
        '<rect x="0" y="0" width="138" height="138" rx="5" ry="5" style="fill:#545767"/>' +
        `<rect x="1" y="1" width="136" height="136" rx="5" ry="5" style="fill:${star3 ? '#fdeb9c' : '#f9f9f8'}"/>` +
        '<rect x="4" y="4" width="130" height="130" rx="10" ry="10" style="fill:#545767"/>' +
        '</svg>'
    )
    let result = null
    await sharp(ra).composite([{
        input, top: 5, left: 5
    }]).toBuffer().then(data => {
        result = Buffer.from(data)
    })
    return result
}

async function handleImageStar(full_id, star, needBorder = false) { // 拼接角色星级图片
    let outputPath = needBorder ? gachaUnitBorderPath : gachaUnitPath
    let starImgExists = await checkImageExists(outputPath, full_id)
    if (starImgExists) return Promise.resolve()
    let buffer = null
    let unitFile = path.join(unitPath, full_id + '.png')
    if (needBorder) unitFile = await addImageBorder(unitFile, star === 3)
    await sharp(starPath)['png']().extract({
        left: 15,
        top: 15,
        width: 72,
        height: 72
    }).resize(20, 20).toBuffer().then(data => {
        buffer = Buffer.from(data)
    })
    let arr = []
    let split = needBorder ? 10 : 6
    let top = needBorder ? 108 : 104
    for (let i = 0; i < star; i++) {
        arr.push({input: buffer, left: 20 * i.toFixed(0) + split, top})
    }
    return new Promise((resolve, reject) => {
        fs['mkdir'](outputPath, {recursive: true}, (e) => {
            sharp(unitFile)['composite'](arr).png().toFile(path.join(outputPath, full_id + '.png'))
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

function emptyGachaResource() {
    return new Promise((resolve, reject) => {
        let files = fs.readdirSync(gachaPath)
        for (const file of files) {
            if (file.endsWith('.jpg')) {
                try {
                    fs.unlinkSync(path.join(gachaPath, file))
                } catch (e) {
                    reject(e)
                }
            }
        }
        resolve()
    })
}

function emptyGachaUnitResource() {
    return new Promise((resolve, reject) => {
        let files = fs.readdirSync(gachaUnitPath)
        for (const file of files) {
            if (file.endsWith('.jpg')) {
                try {
                    fs.unlinkSync(path.join(gachaUnitPath, file))
                } catch (e) {
                    reject(e)
                }
            }
        }
        resolve()
    })
}
