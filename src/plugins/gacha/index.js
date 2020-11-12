import path from 'path'

let setting = null;

function initSetting() {
    setting = global["config"][__dirname.split("\\").pop()]
}

initSetting()

function match(context) {

}

function getPng() {
    global['func']['downloadWebFile']('http://redive.estertion.win/icon/unit/100231.webp',global['source'].resource+'/123.png',true)
        .then(res=>{
            console.log(res)
        })
}

export default {
    initSetting,
    match,
    noNeedPrefix:false
}
