(function(e){function n(n){for(var c,o,u=n[0],i=n[1],d=n[2],s=0,l=[];s<u.length;s++)o=u[s],Object.prototype.hasOwnProperty.call(a,o)&&a[o]&&l.push(a[o][0]),a[o]=0;for(c in i)Object.prototype.hasOwnProperty.call(i,c)&&(e[c]=i[c]);h&&h(n);while(l.length)l.shift()();return r.push.apply(r,d||[]),t()}function t(){for(var e,n=0;n<r.length;n++){for(var t=r[n],c=!0,o=1;o<t.length;o++){var u=t[o];0!==a[u]&&(c=!1)}c&&(r.splice(n--,1),e=i(i.s=t[0]))}return e}var c={},o={app:0},a={app:0},r=[];function u(e){return i.p+"static/js/"+({}[e]||e)+"."+{"chunk-015cdcd0":"4aa0999b","chunk-02896e07":"fe7f3463","chunk-03ae7b14":"901868ba","chunk-109009b3":"544afb44","chunk-2a487fcd":"9e388496","chunk-2d0d7658":"c02abeee","chunk-2d22e0ed":"4cf17a1a","chunk-2e1a003d":"fa8855ca","chunk-305d7d96":"d69c10cc","chunk-32fc498e":"5e7f536b","chunk-3ba5c4dc":"a4ba77fe","chunk-3cfbe9d4":"3e399b8e","chunk-419594a1":"083231dc","chunk-48c0be42":"22cc3b0d","chunk-6423d9d4":"466b8ed9","chunk-68708508":"9042b45d","chunk-69bc598c":"7b8a157a","chunk-6b48ba62":"3da83a53","chunk-74860705":"d92c73f2","chunk-91718e72":"827a4751","chunk-f43cf280":"b5d186cc","chunk-f67aab68":"9375b679"}[e]+".js"}function i(n){if(c[n])return c[n].exports;var t=c[n]={i:n,l:!1,exports:{}};return e[n].call(t.exports,t,t.exports,i),t.l=!0,t.exports}i.e=function(e){var n=[],t={"chunk-015cdcd0":1,"chunk-02896e07":1,"chunk-03ae7b14":1,"chunk-109009b3":1,"chunk-2a487fcd":1,"chunk-2e1a003d":1,"chunk-305d7d96":1,"chunk-32fc498e":1,"chunk-3cfbe9d4":1,"chunk-419594a1":1,"chunk-48c0be42":1,"chunk-6423d9d4":1,"chunk-68708508":1,"chunk-69bc598c":1,"chunk-6b48ba62":1,"chunk-91718e72":1,"chunk-f43cf280":1,"chunk-f67aab68":1};o[e]?n.push(o[e]):0!==o[e]&&t[e]&&n.push(o[e]=new Promise((function(n,t){for(var c="static/css/"+({}[e]||e)+"."+{"chunk-015cdcd0":"5c283de0","chunk-02896e07":"e44fcf48","chunk-03ae7b14":"a884ca1b","chunk-109009b3":"776d2f2f","chunk-2a487fcd":"3f6405b1","chunk-2d0d7658":"31d6cfe0","chunk-2d22e0ed":"31d6cfe0","chunk-2e1a003d":"95fdd8bf","chunk-305d7d96":"b6b0cca4","chunk-32fc498e":"428f4e6f","chunk-3ba5c4dc":"31d6cfe0","chunk-3cfbe9d4":"38b43c01","chunk-419594a1":"dfee8508","chunk-48c0be42":"d564e864","chunk-6423d9d4":"cbb0a8b6","chunk-68708508":"04e24be7","chunk-69bc598c":"29254b43","chunk-6b48ba62":"911e7247","chunk-74860705":"31d6cfe0","chunk-91718e72":"978e97a0","chunk-f43cf280":"6165609f","chunk-f67aab68":"8641e66f"}[e]+".css",a=i.p+c,r=document.getElementsByTagName("link"),u=0;u<r.length;u++){var d=r[u],s=d.getAttribute("data-href")||d.getAttribute("href");if("stylesheet"===d.rel&&(s===c||s===a))return n()}var l=document.getElementsByTagName("style");for(u=0;u<l.length;u++){d=l[u],s=d.getAttribute("data-href");if(s===c||s===a)return n()}var h=document.createElement("link");h.rel="stylesheet",h.type="text/css",h.onload=n,h.onerror=function(n){var c=n&&n.target&&n.target.src||a,r=new Error("Loading CSS chunk "+e+" failed.\n("+c+")");r.code="CSS_CHUNK_LOAD_FAILED",r.request=c,delete o[e],h.parentNode.removeChild(h),t(r)},h.href=a;var f=document.getElementsByTagName("head")[0];f.appendChild(h)})).then((function(){o[e]=0})));var c=a[e];if(0!==c)if(c)n.push(c[2]);else{var r=new Promise((function(n,t){c=a[e]=[n,t]}));n.push(c[2]=r);var d,s=document.createElement("script");s.charset="utf-8",s.timeout=120,i.nc&&s.setAttribute("nonce",i.nc),s.src=u(e);var l=new Error;d=function(n){s.onerror=s.onload=null,clearTimeout(h);var t=a[e];if(0!==t){if(t){var c=n&&("load"===n.type?"missing":n.type),o=n&&n.target&&n.target.src;l.message="Loading chunk "+e+" failed.\n("+c+": "+o+")",l.name="ChunkLoadError",l.type=c,l.request=o,t[1](l)}a[e]=void 0}};var h=setTimeout((function(){d({type:"timeout",target:s})}),12e4);s.onerror=s.onload=d,document.head.appendChild(s)}return Promise.all(n)},i.m=e,i.c=c,i.d=function(e,n,t){i.o(e,n)||Object.defineProperty(e,n,{enumerable:!0,get:t})},i.r=function(e){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},i.t=function(e,n){if(1&n&&(e=i(e)),8&n)return e;if(4&n&&"object"===typeof e&&e&&e.__esModule)return e;var t=Object.create(null);if(i.r(t),Object.defineProperty(t,"default",{enumerable:!0,value:e}),2&n&&"string"!=typeof e)for(var c in e)i.d(t,c,function(n){return e[n]}.bind(null,c));return t},i.n=function(e){var n=e&&e.__esModule?function(){return e["default"]}:function(){return e};return i.d(n,"a",n),n},i.o=function(e,n){return Object.prototype.hasOwnProperty.call(e,n)},i.p="/",i.oe=function(e){throw console.error(e),e};var d=window["webpackJsonp"]=window["webpackJsonp"]||[],s=d.push.bind(d);d.push=n,d=d.slice();for(var l=0;l<d.length;l++)n(d[l]);var h=s;r.push([0,"chunk-vendors"]),t()})({0:function(e,n,t){e.exports=t("56d7")},"034f":function(e,n,t){"use strict";t("85ec")},"365c":function(e,n,t){"use strict";t.d(n,"b",(function(){return o})),t.d(n,"e",(function(){return i})),t.d(n,"c",(function(){return l})),t.d(n,"a",(function(){return h}));var c=t("1da1"),o=(t("96cf"),t("99af"),t("d3b7"),t("bc3a").default),a="127.0.0.1",r="121.41.225.90",u="9221",i={base_url:"/",dev_url:"http://".concat(a,":").concat(u,"/"),pro_url:"http://".concat(r,":").concat(u,"/")},d="dev",s=Object({NODE_ENV:"production",VUE_APP_AJAX_PORT:"9221",VUE_APP_DEV_SERVER:"127.0.0.1",VUE_APP_PRO_SERVER:"121.41.225.90",VUE_APP_SOCKET_PORT:"9220",BASE_URL:"/"});function l(e,n){e=e||d,o.defaults.baseURL=i[e+"_url"],n.$cookies.set("curUrlPrefix",e)}function h(e){o.interceptors.request.use((function(n){var t=e.$cookies.get("salt"),c=e.$cookies.get("token"),o=e.$cookies.get("user_id");return n.headers.token=c||"",n.headers.salt=t||"",n.headers.user_id=o||"",n}),(function(n){return e.$message({type:"error",message:"请求出错"}),Promise.reject(n)})),o.interceptors.response.use((function(n){return 400===n.data["code"]||403===n.data["code"]?(e.$message({type:"error",message:n.data["msg"],duration:1e3,onClose:function(){var n=Object(c["a"])(regeneratorRuntime.mark((function n(){return regeneratorRuntime.wrap((function(n){while(1)switch(n.prev=n.next){case 0:return n.next=2,e.$router.push("/login");case 2:case"end":return n.stop()}}),n)})));function t(){return n.apply(this,arguments)}return t}()}),Promise.reject("")):n.data}),(function(n){return e.$message({type:"error",message:"服务器出错"}),Promise.reject(n)}))}d="production"!==s.NODE_ENV||s.IS_ELECTRON?"development"===s.NODE_ENV?"dev":"pro":"base",console.log("Running ENV:".concat(d)),n["d"]=o},"56d7":function(e,n,t){"use strict";t.r(n);t("e260"),t("e6cf"),t("cca6"),t("a79d"),t("d3b7"),t("3ca3"),t("ddb0");var c=t("a026"),o=function(){var e=this,n=e.$createElement,t=e._self._c||n;return t("div",{staticClass:"text-left",attrs:{id:"app"}},[t("router-view")],1)},a=[],r={name:"App",components:{},computed:{},data:function(){return{}},created:function(){}},u=r,i=(t("034f"),t("2877")),d=Object(i["a"])(u,o,a,!1,null,null,null),s=d.exports,l=t("a18c"),h=t("5c96"),f=t.n(h),p=(t("0fae"),t("365c")),b=t("2b27"),m=t.n(b),g=t("2909"),k=(t("b64b"),t("1276"),t("ac1f"),t("99af"),t("2f62"));c["default"].use(k["a"]);var v,y,w=new k["a"].Store({state:{isLogin:!1,isAdmin:!1,calendar_setting:{},chatLog:{private:{},group:{}},botReady:{ready:!1,bot:[],api:{}}},mutations:{updateIsLogin:function(e,n){e.isLogin=n},updateIsAdmin:function(e,n){e.isAdmin=n},updateCalendar:function(e,n){e.calendar_setting=n},flushChatLog:function(e,n){for(var t=["private","group"],c=0,o=t;c<o.length;c++){var a=o[c];if(n.hasOwnProperty(a))for(var r=0,u=Object.keys(n[a]);r<u.length;r++){var i=u[r],d=n[a][i];e.chatLog[a].hasOwnProperty(i)||(e.chatLog[a][i]=d)}}},pushChatLog:function(e,n){var t=n["tableName"].split("_");e.chatLog[t[0]][t[1]+"_"+t[2]]?(e.chatLog[t[0]][t[1]+"_"+t[2]].rows.push(n),e.chatLog[t[0]][t[1]+"_"+t[2]].hasNew=!0,e.chatLog[t[0]][t[1]+"_"+t[2]].newCount++):e.chatLog[t[0]][t[1]+"_"+t[2]]={rows:[n],noMore:!1,hasNew:!0,newCount:1}},appendChatLog:function(e,n){var t=n["tableName"].split("_");e.chatLog[t[0]][t[1]+"_"+t[2]]?(e.chatLog[t[0]][t[1]+"_"+t[2]].rows=[].concat(Object(g["a"])(n.rows),Object(g["a"])(e.chatLog[t[0]][t[1]+"_"+t[2]].rows)),e.chatLog[t[0]][t[1]+"_"+t[2]].noMore=n.rows.length<20):e.chatLog[t[0]][t[1]+"_"+t[2]]={rows:[n],noMore:!1,hasNew:!1}},updateBotReady:function(e,n){e.botReady=n}}}),_=0,O="dev",j="127.0.0.1",L="121.41.225.90",P="9220",C={base:"ws://".concat(L,":").concat(P,"/"),dev:"ws://".concat(j,":").concat(P,"/"),pro:"ws://".concat(L,":").concat(P,"/")},E={send:function(e){return v.send(e)},close:function(){return v.close()},ready:!1,isConnecting:!1,connect:function(e){return $(e)}};function $(e){console.log("".concat(0===_?"ws connecting":"ws reconnection [".concat(_," times]"))),v&&v.close(),E.isConnecting=!0;var n="";n=C[O],v=new WebSocket(n),A(e)}function A(e){v.onopen=function(){E.isConnecting=!1,E.ready=!0,_=0,console.log("ws connected")},v.onerror=function(){E.isConnecting=!1,E.ready=!1,console.log("ws connect error".concat(_<3?",reconnect in 2s later":",refresh page to reconnect"))},v.onclose=function(){console.log("ws closed"),E.isConnecting=!1,E.ready=!1,x(e)},v.onmessage=function(n){var t=JSON.parse(n.data);switch(console.log("Socket get [".concat(t.type,"] message"),t.data),t.type){case"all":e.$store.commit("flushChatLog",t.data);break;case"elem":e.$store.commit("pushChatLog",t.data);break;case"more":e.$store.commit("appendChatLog",t.data);break;case"status":e.$store.commit("updateBotReady",t.data);break}}}function x(e){_++,E.isConnecting||E.ready||_>3||(y&&clearTimeout(y),y=setTimeout((function(){$(e)}),2e3))}var S=t("2819"),R=t.n(S),N=t("a417");c["default"].component("xm-tags",(function(){return t.e("chunk-6423d9d4").then(t.bind(null,"f10e"))})),c["default"].component("xm-info-box",(function(){return t.e("chunk-f67aab68").then(t.bind(null,"2cfa"))})),c["default"].component("xm-menu-item",(function(){return t.e("chunk-74860705").then(t.bind(null,"5924a"))})),c["default"].component("xm-affix",(function(){return t.e("chunk-2a487fcd").then(t.bind(null,"27a1"))})),c["default"].config.productionTip=!1,c["default"].use(f.a),c["default"].use(m.a),c["default"].use(R.a),c["default"].prototype.$ajax=p["b"],c["default"].prototype.$urlConf=p["e"],c["default"].prototype.$ws=E;var T=new c["default"]({router:l["d"],store:w,components:{App:s},template:"<App/>"});c["default"].prototype.checkAuth=function(){return Object(l["a"])(T)},c["default"].prototype.updateBaseUrl=function(e){Object(p["c"])(e,T)},Object(p["a"])(T),Object(p["c"])(T.$cookies.get("curUrlPrefix"),T),Object(l["b"])(T).then((function(){T.$store.commit("updateIsAdmin",!0)})).catch((function(){T.$store.commit("updateIsAdmin",!1)})),$(T),Object(N["b"])().then((function(e){c["default"].prototype.$botApi=e.data})),T.$store.commit("updateIsLogin",!!T.$cookies.get("user_id")),T.$mount("#app")},"85ec":function(e,n,t){},a18c:function(e,n,t){"use strict";t.d(n,"c",(function(){return a})),t.d(n,"d",(function(){return u})),t.d(n,"a",(function(){return d})),t.d(n,"b",(function(){return s}));t("d3b7"),t("3ca3"),t("ddb0"),t("d81d");var c=t("a026"),o=t("8c4f");c["default"].use(o["a"]);var a=[{title:"基础设置",icon:"el-icon-setting",path:"/base-setting",name:"base-setting",meta:{title:"基础设置"},component:function(){return t.e("chunk-91718e72").then(t.bind(null,"fa59"))}},{title:"复读设置",icon:"el-icon-printer",path:"/repeat-setting",name:"repeat-setting",meta:{title:"复读设置"},component:function(){return t.e("chunk-2d22e0ed").then(t.bind(null,"f9ae"))}},{title:"Chat设置",icon:"el-icon-chat-round",path:"/chat-setting",name:"chat-setting",meta:{title:"Chat设置"},component:function(){return t.e("chunk-69bc598c").then(t.bind(null,"ac6e"))}},{title:"RSS设置",icon:"el-icon-paperclip",path:"/rss-setting",name:"rss-setting",meta:{title:"RSS设置"},component:function(){return t.e("chunk-68708508").then(t.bind(null,"6c74"))}},{title:"Live设置",icon:"el-icon-video-play",path:"/live-setting",name:"live-setting",meta:{auth:!0,noAuthHidden:!0,title:"Live设置"},component:function(){return t.e("chunk-3ba5c4dc").then(t.bind(null,"5630"))}},{title:"プリンコネ",isGroup:!1,children:[{title:"角色设置",icon:"el-icon-s-custom",path:"/pcr/character-setting",name:"pcr-character-setting",meta:{auth:!1,title:"角色设置"},component:function(){return t.e("chunk-02896e07").then(t.bind(null,"1a12"))}},{title:"卡池设置",icon:"el-icon-thumb",path:"/pcr/pool-setting",name:"pcr-pool-setting",meta:{auth:!1,title:"卡池设置"},component:function(){return t.e("chunk-305d7d96").then(t.bind(null,"a555"))}},{title:"日历设置",icon:"el-icon-date",path:"/pcr/calendar-setting",name:"calendar-setting",meta:{title:"日历设置"},component:function(){return t.e("chunk-109009b3").then(t.bind(null,"39a2"))}}]}],r=[{path:"/",redirect:"/index"},{path:"/404",component:function(){return t.e("chunk-2d0d7658").then(t.bind(null,"7746"))}},{path:"*",redirect:"/404"},{path:"/index",name:"Index",redirect:"/home",component:function(){return t.e("chunk-48c0be42").then(t.bind(null,"6e78"))},children:[{path:"/home",name:"Home",component:function(){return t.e("chunk-419594a1").then(t.bind(null,"c3b0"))}},{path:"/plugins-home",name:"PluginsHome",redirect:"/base-setting",component:function(){return t.e("chunk-015cdcd0").then(t.bind(null,"b768"))},children:i(a)},{icon:"el-icon-notebook-2",path:"/plugins-dict",name:"plugins-dict",meta:{title:"插件命令"},component:function(){return t.e("chunk-f43cf280").then(t.bind(null,"d9bb"))}},{icon:"el-icon-chat-round",path:"/bili-dynamic",name:"bili-dynamic",meta:{auth:!0,noAuthHidden:!0,title:"Bili动态管理"},component:function(){return t.e("chunk-03ae7b14").then(t.bind(null,"8b63"))}},{icon:"el-icon-chat-line-square",path:"/chat-puppet",name:"chat-puppet",meta:{auth:!0,noAuthHidden:!0,title:"聊天人偶"},component:function(){return t.e("chunk-32fc498e").then(t.bind(null,"e6a7"))}},{icon:"el-icon-date",path:"/calendar-pcr",name:"calendar-pcr",meta:{title:"PCR活动日历"},component:function(){return t.e("chunk-6b48ba62").then(t.bind(null,"e3b5"))}}]},{path:"/login",name:"login",component:function(){return t.e("chunk-3cfbe9d4").then(t.bind(null,"d570"))}},{path:"/reset-pwd",name:"resetPassword",component:function(){return t.e("chunk-2e1a003d").then(t.bind(null,"d539"))}}],u=new o["a"]({routes:r});function i(e){var n=[];return e.map((function(e){if(e.children&&e.children.length>0){var t=i(e.children);n.push.apply(n,t)}else n.push(e)})),n}function d(e){return new Promise((function(n,t){var c=e.$cookies.get("token"),o=e.$cookies.get("salt");c&&o?e.$ajax({url:"/token.valid",params:{token:c,salt:o}}).then((function(c){0===c["code"]?n():e.$message({type:"error",message:c["msg"],duration:1e3,onClose:function(){t("/login")}})})).catch((function(e){t("/index")})):e.$message({type:"error",message:"未登录",duration:1e3,onClose:function(){t("/login")}})}))}function s(e,n){return new Promise((function(t,c){var o=n||e.$cookies.get("user_id");o?e.$ajax({url:"/checkIsAdmin.valid",params:{user_id:o}}).then((function(e){0===e["code"]?t():c()})).catch((function(e){c()})):c()}))}},a417:function(e,n,t){"use strict";t.d(n,"a",(function(){return o})),t.d(n,"b",(function(){return a})),t.d(n,"c",(function(){return r})),t.d(n,"d",(function(){return u}));var c=t("365c"),o=function(){return Object(c["b"])({url:"/setting/default.json",method:"get"})},a=function(){return Object(c["b"])({url:"/getBotApi.json",method:"get"})},r=function(){return Object(c["b"])({url:"/getBotReady.json",method:"get"})},u=function(e){return Object(c["b"])({url:"/setting/default.save",method:"post",data:e})}}});
//# sourceMappingURL=app.6a5c5404.js.map