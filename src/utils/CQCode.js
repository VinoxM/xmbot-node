export const CQ = {
    at:(qq)=>{
        return `[CQ:at,qq=${qq}]`
    },
    img:(path)=>{
        return `[CQ:image,file=file:///${path}]`
    },
    img_web:(path,proxy=false)=>{
        return `[CQ:image,url=${path}${proxy?',proxy=1':''}]`
    }
}
