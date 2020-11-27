let setting = {}

function initSetting() {
    setting = global['config'][__dirname.split("\\").pop()]['pcr-homework']
}

initSetting()

export function saveHomework(context) {
    let msg = context['raw_message']
    let split = msg.split(':')
}
