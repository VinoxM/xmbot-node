export const defaultConf = {
    default: {
        "initial_time": {
            "time": 1,
            "units": "minutes"
        },
        "interval": {
            "time": 17,
            "units": "minutes"
        },
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
        "rss": [
            {
                "title": "PCR-日服推特",
                "on": true,
                "source": "https://rsshub.app/twitter/user/priconne_redive",
                "proxy": true,
                "name": "pcr_jp_twitter",
                "name_filter": [
                    "PCR日服推特",
                    "PCR-日服推特"
                ],
                "link_replace": "https://twitter.com/priconne_redive/status/",
                "last_id": "1345671309619970049",
                "push_list": {
                    "qq": {
                        "group": "all",
                        "private": [],
                    },
                    "discord": {
                        "group": [],
                        "private": []
                    }
                },
            },
            {
                "title": "PCR-国服bili动态",
                "on": true,
                "source": "https://rsshub.app/bilibili/user/dynamic/353840826",
                "proxy": true,
                "name": "pcr_cn_bili",
                "name_filter": [
                    "PCR国服bili动态",
                    "PCR-国服bili动态",
                    "PCR国服动态",
                    "PCR国服B站动态"
                ],
                "link_replace": "https://t.bilibili.com/",
                "last_id": "476303296082373668",
                "push_list": {
                    "qq": {
                        "group": "all",
                        "private": [],
                    },
                    "discord": {
                        "group": [],
                        "private": []
                    }
                },
            },
            {
                "title": "Gamker攻壳Bili动态",
                "on": false,
                "proxy": true,
                "source": "https://rsshub.app/bilibili/user/dynamic/13297724",
                "name": "gamker_bili",
                "name_filter": [
                    "Gamker动态",
                    "GamkerB站动态"
                ],
                "link_replace": "https://github.com/DIYgod/RSSHub/issues/",
                "push_list": {
                    "qq": {
                        "group": [],
                        "private": [],
                    },
                    "discord": {
                        "group": [],
                        "private": []
                    }
                },
                "last_id": "https://t.bilibili.com/474957468077871444"
            },
            {
                "title": "UMM-日服推特",
                "on": true,
                "proxy": true,
                "source": "https://rsshub.app/twitter/user/uma_musu",
                "name": "umm_jp_twitter",
                "name_filter": [
                    "UMK日服推特",
                    "赛马娘日服推特"
                ],
                "link_replace": "https://twitter.com/uma_musu/status/",
                "push_list": {
                    "qq": {
                        "group": [],
                        "private": [],
                    },
                    "discord": {
                        "group": [],
                        "private": []
                    }
                },
                "last_id": "1364138388664672260"
            }
        ]
    }
}
