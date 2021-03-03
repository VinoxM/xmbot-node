export const defaultConf = {
    default:{

    },
    pcr:{
        "on": true,
        "push_list": {
            "qq": {
                "group": [],
                "private": []
            },
            "discord": {
                "group": [],
                "private": []
            }
        },
        "default_area": "tw",
        "rules": [
            {
                "on": true,
                "title": "今日活动",
                "time": {
                    "hour": [
                        8
                    ],
                    "minute": [
                        0
                    ]
                },
                "type": "today",
                "name": "today",
                "filter": [
                    "pcr今日活动推送",
                    "pcr今天活动推送",
                    "pcr今日活动",
                    "pcr今天活动"
                ],
                "push_list": {
                    "qq": {
                        "group": "all",
                        "private": []
                    },
                    "discord": {
                        "group": [],
                        "private": []
                    }
                },
                "needFlush": true
            },
            {
                "on": true,
                "title": "明日活动",
                "time": {
                    "hour": [
                        23
                    ],
                    "minute": [
                        3
                    ]
                },
                "type": "tomorrow",
                "name": "tomorrow",
                "filter": [
                    "pcr明日活动推送",
                    "pcr明天活动推送",
                    "pcr明日活动",
                    "pcr明天活动"
                ],
                "push_list": {
                    "qq": {
                        "group": "all",
                        "private": "all"
                    },
                    "discord": {
                        "group": [],
                        "private": []
                    }
                },
                "needFlush": false
            },
            {
                "on": false,
                "title": "下周活动",
                "type": "nextWeek",
                "name": "nextWeek",
                "time": {
                    "dayOfWeek": [
                        "7"
                    ],
                    "hour": [
                        "23"
                    ],
                    "minute": [
                        "30"
                    ],
                    "second": [
                        "0"
                    ]
                },
                "filter": [],
                "push_list": {
                    "qq": {
                        "group": "all",
                        "private": "all"
                    },
                    "discord": {
                        "group": [],
                        "private": []
                    }
                },
                "needFlush": false
            }
        ],
        "calendar_source": {
            "tw": {
                "title": "台服",
                "url": "https://pcredivewiki.tw/static/data/event.json",
                "props": {
                    "name": "campaign_name",
                    "start_time": "start_time",
                    "end_time": "end_time"
                },
                "needProxy": true
            },
            "jp": {
                "title": "日服",
                "url": "https://pcr.satroki.tech/api/Manage/GetEvents?s=jp",
                "props": {
                    "name": "title",
                    "start_time": "startTime",
                    "end_time": "endTime"
                },
                "needProxy": false
            },
            "cn": {
                "title": "国服",
                "url": "https://pcr.satroki.tech/api/Manage/GetEvents?s=cn",
                "props": {
                    "name": "title",
                    "start_time": "startTime",
                    "end_time": "endTime"
                },
                "needProxy": false
            }
        }
    }
}
