export const defaultConf = {
    default:{
        "initial_time": {
            "time": 20,
            "units": "minutes"
        },
        "interval": {
            "time": 24,
            "units": "minutes"
        },
        "push_list": {
            "group": [
                902987930
            ],
            "user": [
                760254674
            ]
        },
        "rss": [
            {
                "on": true,
                "source": "https://rsshub.app/twitter/user/priconne_redive",
                "proxy": true,
                "name": "pcr_jp_twitter",
                "title": "PCR-日服推特",
                "name_filter": [
                    "PCR日服推特",
                    "PCR-日服推特"
                ],
                "link_replace": "https://twitter.com/priconne_redive/status/",
                "last_id": "1345671309619970049",
                "push_group": [],
                "push_user": [
                    760254674
                ]
            },
            {
                "on": true,
                "source": "https://rsshub.app/bilibili/user/dynamic/353840826",
                "proxy": true,
                "name": "pcr_cn_bili",
                "title": "PCR-国服bili动态",
                "name_filter": [
                    "PCR国服bili动态",
                    "PCR-国服bili动态",
                    "PCR国服动态",
                    "PCR国服B站动态"
                ],
                "link_replace": "https://t.bilibili.com/",
                "last_id": "476303296082373668",
                "push_group": [],
                "push_user": "all"
            },
            {
                "title": "Gamker攻壳Bili动态",
                "on": true,
                "proxy": true,
                "source": "https://rsshub.app/bilibili/user/dynamic/13297724",
                "name": "gamker_bili",
                "name_filter": [
                    "Gamker动态",
                    "GamkerB站动态"
                ],
                "link_replace": "https://github.com/DIYgod/RSSHub/issues/",
                "push_group": [],
                "push_user": [
                    "760254674"
                ],
                "last_id": "https://t.bilibili.com/474957468077871444"
            }
        ]
    }
}
