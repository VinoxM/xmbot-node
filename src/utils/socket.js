// import express from 'express'
const WebSocketServer = require('ws').Server
const uuid = require('node-uuid')

let wss
const client = {}

export function initSocket() {
    if (wss) wss.close()
    wss = new WebSocketServer({port:9220})

    wss['on']('open',()=>{
        console.log('open')
    })

    wss['on']('connection',(ws)=>{
        ws.uuid = uuid.v4()
        global['LOG'](`ws connected:[${ws.uuid}]`)
        global.getChatLog()
        client[ws.uuid] = ws
        ws.on('message',(msg)=>{
            console.log(msg)
        })
        ws.on('close',(e)=>{
            global['LOG'](`ws closed:[${ws.uuid}]`)
            delete ws.uuid
        })
    })
}

export function sendWsMsg(msg) {
    let keys = Object.keys(client)
    for (const key of keys) {
        let ws = client[key]
        ws.send(msg)
    }
}
