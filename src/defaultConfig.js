export const defaultConf = {
    "api": {
        "qq": {
            "on": true,
            "ws": {
                "host":"127.0.0.1",
                "port":9222,
                "enableAPI":true,
                "enableEvent":true,
                "reconnection":true,
                "reconnectionAttempts":10,
                "reconnectionDelay":2000
            },
            "prefixOn": true,
            "prefix": ["ue"],
            "master": [],
            "isBlackGroup": true,
            "blackGroup": [],
            "whiteGroup": [],
            "enablePrivate": true,
            "readyFeedBack": false,
        }
    },
    "proxy": null,
    "base_url": "http://localhost:9221/xmBot#/",
    "socket": {
        "host": "127.0.0.1",
        "port": 9220
    }
}
