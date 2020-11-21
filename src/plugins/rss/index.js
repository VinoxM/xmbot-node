const request = require('request')
const x2js = require('x2js')

let setting = null;
let rss = []
let Rss = {}

function initMatchSetting() {
    return new Promise((resolve, reject) => {
        setting = global["config"][__dirname.split("\\").pop()]
        if (setting.hasOwnProperty('rss')){
            rss = setting['rss']
        }
        resolve()
    })
}

initMatchSetting().then(init())

async function getRss(rss) {
    return new Promise((resolve, reject) => {
        request({url:rss.source,headers:rss.headers},(err,res,body)=>{
            if (err) reject(err)
            else {
                let xmlReader = new x2js()
                Rss[rss['name']] = {rss: xmlReader.xml2js(body).rss,title:rss['title']}
                resolve()
            }
        })
    })
}

async function init() {
    for (const s of rss) {
        await getRss(s)
    }
}
