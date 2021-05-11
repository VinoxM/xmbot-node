const request = require('request')

const url = 'https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/space_history',
    params = {
        csrf: '',
        visitor_uid: 0,
        host_uid: 0,
        offset_dynamic_id: 0,
        need_top: 1,
        platform: 'web'
    }
let cookie = ''

function initBaseSetting() {
    const setting = global.config['spider'].bili
    cookie = setting.visitor.cookie
    params.visitor_uid = parseInt(setting.visitor.uid)
    params.csrf = setting.visitor.csrf
}

initBaseSetting()

function getDynamicByUid(uid) {
    params.host_uid = uid
    request({
        url,
        method:'GET',
        qs: params, headers: {cookie}
    }, (err, res, body) => {
        const result = JSON.parse(body)
        // console.log(result)
    })
}

// getDynamicByUid(353840826)
