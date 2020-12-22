import * as pcr from "./pcr";

export const pcr_ = pcr;
export const matchDict = [
    {
        match: ['启用日历推送', '启用日历'],
        startWith: false,
        needReplace: false,
        rules: ['admin'],
        func: (context) => pcr.toggleSwitch(context),
        describe:'PCR活动日历推送启用'
    },
    {
        match: ['禁用日历推送', '禁用日历'],
        startWith: false,
        needReplace: false,
        rules: ['admin'],
        func: (context) => pcr.toggleSwitch(context, false),
        describe:'PCR活动日历推送禁用'
    },
    {
        match: ['开启日历推送', '开启日历'],
        startWith: true,
        needReplace: true,
        rules: ['admin'],
        func: (context) => pcr.toggleJobSwitch(context),
        describe:'开启PCR活动日历推送,筛选日历推送'
    },
    {
        match: ['关闭日历推送', '关闭日历'],
        startWith: true,
        needReplace: true,
        rules: ['admin'],
        func: (context) => pcr.toggleJobSwitch(context, false),
        describe:'关闭PCR活动日历推送,筛选日历推送'
    },
    {
        match: ['订阅日历推送', '订阅日历'],
        startWith: true,
        needReplace: true,
        rules: ['admin'],
        func: (context) => pcr.toggleJobPush(context),
        describe:'[用户/群聊]订阅PCR活动日历推送,筛选日历推送'
    },
    {
        match: ['屏蔽日历推送', '屏蔽日历'],
        startWith: true,
        needReplace: true,
        rules: ['admin'],
        func: (context) => pcr.toggleJobPush(context, false),
        describe:'[用户/群聊]屏蔽PCR活动日历推送,筛选日历推送'
    },
    {
        match: ['今日活动', '今天活动'],
        startWith: false,
        needReplace: false,
        rules: [],
        func: (context) => pcr.searchCalendar(context),
        describe:'查询今天的PCR[默认区服]活动'
    },
    {
        match: ['日服今日活动', '日服今天活动'],
        startWith: false,
        needReplace: false,
        rules: [],
        func: (context) => pcr.searchCalendar(context, 'jp'),
        describe:'查询今天的PCR日服活动'
    },
    {
        match: ['台服今日活动', '台服今天活动'],
        startWith: false,
        needReplace: false,
        rules: [],
        func: (context) => pcr.searchCalendar(context, 'tw'),
        describe:'查询今天的PCR台服活动'
    },
    {
        match: ['国服今日活动', '国服今天活动'],
        startWith: false,
        needReplace: false,
        rules: [],
        func: (context) => pcr.searchCalendar(context, 'cn'),
        describe:'查询今天的PCR国服活动'
    },
    {
        match: ['明日活动', '明天活动'],
        startWith: false,
        needReplace: false,
        rules: [],
        func: (context) => pcr.searchCalendar(context, false, 'tomorrow'),
        describe:'查询明天的PCR[默认区服]活动'
    },
    {
        match: ['日服明日活动', '日服明天活动'],
        startWith: false,
        needReplace: false,
        rules: [],
        func: (context) => pcr.searchCalendar(context, 'jp', 'tomorrow'),
        describe:'查询明天的PCR日服活动'
    },
    {
        match: ['台服明日活动', '台服明天活动'],
        startWith: false,
        needReplace: false,
        rules: [],
        func: (context) => pcr.searchCalendar(context, 'tw', 'tomorrow'),
        describe:'查询明天的PCR台服活动'
    },
    {
        match: ['国服明日活动', '国服明天活动'],
        startWith: false,
        needReplace: false,
        rules: [],
        func: (context) => pcr.searchCalendar(context, 'cn', 'tomorrow'),
        describe:'查询明天的PCR国服活动'
    },
    {
        match: ['本周活动'],
        startWith: false,
        needReplace: false,
        rules: [],
        func: (context) => pcr.searchCalendar(context, false, 'thisWeek'),
        describe:'查询本周的PCR[默认区服]活动'
    },
    {
        match: ['日服本周活动'],
        startWith: false,
        needReplace: false,
        rules: [],
        func: (context) => pcr.searchCalendar(context, 'jp', 'thisWeek'),
        describe:'查询本周的PCR日服活动'
    },
    {
        match: ['台服本周活动'],
        startWith: false,
        needReplace: false,
        rules: [],
        func: (context) => pcr.searchCalendar(context, 'tw', 'thisWeek'),
        describe:'查询本周的PCR台服活动'
    },
    {
        match: ['国服本周活动'],
        startWith: false,
        needReplace: false,
        rules: [],
        func: (context) => pcr.searchCalendar(context, 'cn', 'thisWeek'),
        describe:'查询本周的PCR国服活动'
    },
    {
        match: ['下周活动', '下星期活动'],
        startWith: false,
        needReplace: false,
        rules: [],
        func: (context) => pcr.searchCalendar(context, false, 'nextWeek'),
        describe:'查询下周的PCR[默认区服]活动'
    },
    {
        match: ['日服下周活动', '日服下星期活动'],
        startWith: false,
        needReplace: false,
        rules: [],
        func: (context) => pcr.searchCalendar(context, 'jp', 'nextWeek'),
        describe:'查询下周的PCR日服活动'
    },
    {
        match: ['台服下周活动', '台服下星期活动'],
        startWith: false,
        needReplace: false,
        rules: [],
        func: (context) => pcr.searchCalendar(context, 'tw', 'nextWeek'),
        describe:'查询下周的PCR台服活动'
    },
    {
        match: ['国服下周活动', '国服下星期活动'],
        startWith: false,
        needReplace: false,
        rules: [],
        func: (context) => pcr.searchCalendar(context, 'cn', 'nextWeek'),
        describe:'查询下周的PCR国服活动'
    },
]
