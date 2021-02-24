## 插件扩展开发

### 文件夹名即为插件名,做为键值存储在`global.plugin`里面

    例: 调用 global.plugin.chat 即可调用到 chat 插件 export 的方法和属性

### 文件夹里面的文件: 

`index.js` [必需] 

`defaultSetting.js`
    
`setting.json`  `setting-[其他配置].json`

`其他.js`

其中 `defaultSetting.js` 文件和 `setting.json` 文件需要有其中之一,就算 `json` 配置为空也需要有该文件

### 加载插件步骤:

    1. 加载配置文件:
       首先扫描 setting 开头的 .json 文件,
       setting.json 文件配置会作为基础属性 default 加载
       setting-其他配置.json 文件配置加载时, '其他配置' 会作为额外属性填充

       例: 
       setting.json
           {
               a: '',
               b: ''
           }
       setting-other.json
           {
               c: '',
               d: ''
           }
       setting-other1.json
           {
               e: ''
           }
           
       加载后: 
       {
           default: {
               a:'',
               b:''
           },
           other: {
               c: '',
               d: ''
           },
           other1: {
               e: ''
           }
       }
        
       如果不存在 setting 开头的 .json 文件,将会从 defaultSetting.js 文件中加载
       读取 defaultSetting.js 中的 defaultConf 属性,读取完成后会将配置写入文件
       其中 default 值会写入 setting.json 文件,其他属性会写入 setting-属性名.json 文件
        
       要调用加载的配置对象时,直接从 global.config.插件名 中获取[例:global.config.chat]
        
    2. 从文件 index.js 加载插件,保存在 global.plugin.插件名 中,要在其他插件调用插件方法时,从该属性中获取即可
       例: global.plugin.chat.initMatchSetting()

### 文件介绍:

`index.js` :

该文件为插件入口,插件的方法/属性等从该文件 `export`

    export default {
        needPrefix:false, // 插件是否需要匹配前缀 [必需]
        match, // 匹配方法 [必需]
        matchDict // 匹配字典 [必需]
        ... // 其他扩展方法
    } 
    
`match`: 可引用 `global.func.generalMatch`
    
`matchDict`:

    {
        match:['你好','hello'], // 匹配的字符
        startWith: false, // 是否是以 match 开头的;为 false 即全匹配
        needPrefix: false, // 是否需要昵称前缀
        needReplace: false, // 是否替换匹配的字符为空 [方便后面做操作时的处理]
        rules: ['private','group','admin'], // 检测规则/权限
        //[private:私聊;group:群聊;admin:仅主人] 目前仅支持了这几个权限检测
        func: function () { // 处理操作
            ... do something
        },
        ... // 待扩展
    }
    
###### `defaultSetting.js` : 默认的 `JSON` 格式配置文件

###### `setting.json` : 基础配置文件

###### `setting-其他配置.json` : 其他配置文件

###### `其他.js`

**以上内容仅供参考,具体可参照源码自行创作**
