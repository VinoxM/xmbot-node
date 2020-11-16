export const globalReg = obj => Object.assign(global,obj)

globalReg({
    now:()=>new Date().toLocaleString(),
    //控制台日志打印封装
    LOG: msg => console.log(`[${global.now()}][INFO]${getCallerFileNameAndLine('LOG')}  `+ msg),
    //控制台错误打印封装
    ERR: err => console.error(`[${global.now()}][ERROR]${getCallerFileNameAndLine('ERR')}  `+ err)
})

//获取日志打印的文件名和行数
function getCallerFileNameAndLine(logType){
    function getException() {
        try {
            throw Error('');
        } catch (err) {
            return err;
        }
    }

    const err = getException();

    const stack = err.stack;
    const stackArr = stack.split('\n');
    let callerLogIndex = 0;
    for (let i = 0; i < stackArr.length; i++) {
        if (stackArr[i].indexOf(`at ${logType}`)>0 && i+1 < stackArr.length){
            callerLogIndex = i+1;
            break;
        }
    }
    if (callerLogIndex !== 0){
        const callerStackLine = stackArr[callerLogIndex];
        return `[${callerStackLine.substring(callerStackLine.lastIndexOf('\\src') +1, callerStackLine.lastIndexOf(':'))}]`
    }else return ''

}
