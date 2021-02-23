webpackJsonp([10],{lYX6:function(t,e){},qdI8:function(t,e,i){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var l=i("mvHQ"),a=i.n(l),s=i("gyMJ"),n={name:"rss-setting",data:function(){var t=this.$botApi,e={};return t.map(function(t){e[t]={private:[],group:[]}}),{botApi:t,setting:{},loading:!1,testLoading:!1,testVisible:!1,testTitle:"",testResult:{body:"",line:""},addVisible:!1,addForm:{title:"",on:!0,proxy:!0,source:"",name:"",name_filter:[],link_replace:"",push_list:e,last_id:""},rules:{title:[{required:!0,message:"请输入标题",trigger:"blur"}],source:[{required:!0,message:"请输入源网址",trigger:"blur"}],name:[{required:!0,message:"请输入键名",trigger:"blur"}],link_replace:[{required:!0,message:"请输入提取链接",trigger:"blur"}]},submitLoading:!1}},computed:{isAdmin:function(){return this.$store.state.isAdmin}},methods:{sourceTest:function(t,e){var i,l=this;t&&""!==t&&(this.testLoading=!0,(i={source:t,proxy:e},Object(s.d)({url:"/rss/source/test.do",method:"get",params:i})).then(function(e){0===e.code?(l.testTitle=t,l.testResult=e.data,l.testVisible=!0):l.$message.error(e.msg),l.testLoading=!1}).catch(function(t){l.testLoading=!1}))},getJsonFormat:function(t){return t&&""!==t?a()(t,null,4):""},rssAdd:function(){this.addVisible=!0},rssDel:function(t){this.setting.rss.splice(t,1)},addSubmit:function(){var t=this;this.submitLoading=!0,this.$refs.addForm.validate(function(e){e?(t.setting.rss.push(t.addForm),t.addVisible=!1):t.submitLoading=!1})},addFormInit:function(){var t={};this.botApi.map(function(e){t[e]={private:[],group:[]}}),this.addForm={title:"",on:!0,proxy:!0,source:"",name:"",name_filter:[],link_replace:"",push_list:t,last_id:""}},rssSave:function(){var t,e=this;(t=this.setting,Object(s.d)({url:"/setting/rss.save",method:"post",data:t})).then(function(t){e.$message[0===t.code?"success":"error"](t.msg)})}},created:function(){var t=this;this.loading=!0,Object(s.d)({url:"/setting/rss.json",method:"get"}).then(function(e){t.setting=e.data,t.loading=!1}).catch(function(t){})}},r={render:function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("el-row",{directives:[{name:"loading",rawName:"v-loading",value:t.loading,expression:"loading"}],staticClass:"position-relative"},[i("div",{staticClass:"tool-btn"},[t.isAdmin?i("el-button",{attrs:{size:"small",type:"primary"},on:{click:t.rssSave}},[t._v("保存本页")]):t._e()],1),t._v(" "),t.loading?t._e():i("el-form",{ref:"form",attrs:{model:t.setting,"label-width":"100px"}},[i("el-form-item",{attrs:{label:"初始化时间"}},[i("el-input-number",{staticStyle:{width:"100px"},attrs:{controls:!1,size:"small",disabled:!t.isAdmin},model:{value:t.setting.initial_time.time,callback:function(e){t.$set(t.setting.initial_time,"time",e)},expression:"setting['initial_time']['time']"}}),t._v(" "),i("el-select",{staticStyle:{width:"60px"},attrs:{size:"small",disabled:!t.isAdmin},model:{value:t.setting.initial_time.units,callback:function(e){t.$set(t.setting.initial_time,"units",e)},expression:"setting['initial_time']['units']"}},[i("el-option",{attrs:{label:"时",value:"hours"}}),t._v(" "),i("el-option",{attrs:{label:"分",value:"minutes"}}),t._v(" "),i("el-option",{attrs:{label:"秒",value:"seconds"}})],1)],1),t._v(" "),i("el-form-item",{attrs:{label:"循环时间"}},[i("el-input-number",{staticStyle:{width:"100px"},attrs:{controls:!1,size:"small",disabled:!t.isAdmin},model:{value:t.setting.interval.time,callback:function(e){t.$set(t.setting.interval,"time",e)},expression:"setting['interval']['time']"}}),t._v(" "),i("el-select",{staticStyle:{width:"60px"},attrs:{size:"small",disabled:!t.isAdmin},model:{value:t.setting.interval.units,callback:function(e){t.$set(t.setting.interval,"units",e)},expression:"setting['interval']['units']"}},[i("el-option",{attrs:{label:"时",value:"hours"}}),t._v(" "),i("el-option",{attrs:{label:"分",value:"minutes"}}),t._v(" "),i("el-option",{attrs:{label:"秒",value:"seconds"}})],1)],1),t._v(" "),i("el-form-item",{attrs:{label:"推送列表"}},t._l(t.setting.push_list,function(e,l,a){return i("xm-info-box",{key:a,staticStyle:{"padding-top":"20px"},attrs:{title:String(l).toUpperCase(),retractable:""}},[i("xm-info-box",{attrs:{title:"群聊",retractable:"",retract:0===e.group.length}},[i("xm-tags",{attrs:{value:e.group,disabled:!t.isAdmin},on:{"update:value":function(i){return t.$set(e,"group",i)}}})],1),t._v(" "),i("xm-info-box",{attrs:{title:"私聊",retractable:"",retract:0===e.private.length}},[i("xm-tags",{attrs:{value:e.private,disabled:!t.isAdmin},on:{"update:value":function(i){return t.$set(e,"private",i)}}})],1)],1)}),1),t._v(" "),i("el-form-item",[i("span",{attrs:{slot:"label"},slot:"label"},[i("span",{staticClass:"icon-new-label"},[t._v("订阅源")]),t._v(" "),t.isAdmin?i("i",{staticClass:"el-icon-circle-plus-outline icon-new-button",on:{click:t.rssAdd}}):t._e()]),t._v(" "),t._l(t.setting.rss,function(e,l){return i("xm-info-box",{key:l,attrs:{editable:t.isAdmin,retractable:"",title:e.title},on:{"update:title":function(i){return t.$set(e,"title",i)}}},[t.isAdmin?i("div",{staticClass:"tool-btn"},[i("el-tooltip",{attrs:{content:"删除",placement:"left"}},[i("el-link",{attrs:{type:"danger"},on:{click:function(e){return t.rssDel(l)}}},[i("i",{staticClass:"el-icon-delete-solid"})])],1)],1):t._e(),t._v(" "),i("el-form",{staticClass:"rss-form-box",attrs:{"label-width":"80px"}},[i("el-form-item",{staticClass:"display-inline-block",staticStyle:{width:"200px"},attrs:{label:"启用"}},[i("el-switch",{attrs:{"active-color":"#13ce66",disabled:!t.isAdmin},model:{value:e.on,callback:function(i){t.$set(e,"on",i)},expression:"item.on"}})],1),t._v(" "),i("el-form-item",{staticClass:"display-inline-block",attrs:{label:"启用代理"}},[i("el-switch",{attrs:{"active-color":"#13ce66",disabled:!t.isAdmin},model:{value:e.proxy,callback:function(i){t.$set(e,"proxy",i)},expression:"item.proxy"}})],1),t._v(" "),i("el-form-item",{attrs:{label:"源网址"}},[i("el-input",{attrs:{readonly:!t.isAdmin},model:{value:e.source,callback:function(i){t.$set(e,"source",i)},expression:"item.source"}},[i("el-button",{attrs:{slot:"append",icon:"el-icon-s-promotion",loading:t.testLoading},on:{click:function(i){return t.sourceTest(e.source,e.proxy)}},slot:"append"},[t._v("测试\n              ")])],1)],1),t._v(" "),i("el-form-item",{attrs:{label:"键名"}},[i("el-input",{attrs:{readonly:""},model:{value:e.name,callback:function(i){t.$set(e,"name",i)},expression:"item.name"}})],1),t._v(" "),i("el-form-item",{attrs:{label:"关键词"}},[i("xm-tags",{attrs:{value:e.name_filter,disabled:!t.isAdmin},on:{"update:value":function(i){return t.$set(e,"name_filter",i)}}})],1),t._v(" "),i("el-form-item",{attrs:{label:"提取链接"}},[i("el-input",{attrs:{readonly:!t.isAdmin},model:{value:e.link_replace,callback:function(i){t.$set(e,"link_replace",i)},expression:"item['link_replace']"}})],1),t._v(" "),i("el-form-item",{staticClass:"not-margin",attrs:{label:"推送列表"}},t._l(e.push_list,function(e,l,a){return i("xm-info-box",{key:a,staticStyle:{"padding-top":"20px"},attrs:{title:String(l).toUpperCase(),retractable:""}},[i("xm-info-box",{attrs:{title:"群聊"}},[i("el-checkbox",{attrs:{disabled:!t.isAdmin,checked:"all"===e.group||!e.group instanceof Array,label:"全局推送"},on:{change:function(t){e.group=t?"all":[]}}}),t._v(" "),"all"!==e.group?i("xm-tags",{attrs:{value:e.group,disabled:!t.isAdmin},on:{"update:value":function(i){return t.$set(e,"group",i)}}}):t._e()],1),t._v(" "),i("xm-info-box",{attrs:{title:"私聊"}},[i("el-checkbox",{attrs:{disabled:!t.isAdmin,checked:"all"===e.private||!e.private instanceof Array,label:"全局推送"},on:{change:function(t){e.private=t?"all":[]}}}),t._v(" "),"all"!==e.private?i("xm-tags",{attrs:{value:e.private,disabled:!t.isAdmin},on:{"update:value":function(i){return t.$set(e,"private",i)}}}):t._e()],1)],1)}),1)],1)],1)})],2)],1),t._v(" "),i("el-dialog",{attrs:{visible:t.testVisible,title:t.testTitle,center:""},on:{"update:visible":function(e){t.testVisible=e}}},[i("el-collapse",{staticClass:"test-box"},[i("el-collapse-item",{attrs:{title:"body"}},[i("pre",[t._v(t._s(t.testResult.body))])]),t._v(" "),i("el-collapse-item",{attrs:{title:"line"}},[i("pre",[t._v(t._s(t.testResult.line))])])],1)],1),t._v(" "),i("el-dialog",{attrs:{visible:t.addVisible,title:"添加RSS",center:"","close-on-click-modal":!1},on:{"update:visible":function(e){t.addVisible=e},closed:t.addFormInit}},[i("el-form",{ref:"addForm",attrs:{"label-width":"90px",model:t.addForm,rules:t.rules}},[i("el-form-item",{attrs:{label:"标题",prop:"title"}},[i("el-input",{attrs:{placeholder:"输入标题"},model:{value:t.addForm.title,callback:function(e){t.$set(t.addForm,"title",e)},expression:"addForm.title"}})],1),t._v(" "),i("el-form-item",{staticClass:"display-inline-block",staticStyle:{width:"200px"},attrs:{label:"启用"}},[i("el-switch",{attrs:{"active-color":"#13ce66"},model:{value:t.addForm.on,callback:function(e){t.$set(t.addForm,"on",e)},expression:"addForm.on"}})],1),t._v(" "),i("el-form-item",{staticClass:"display-inline-block",attrs:{label:"启用代理"}},[i("el-switch",{attrs:{"active-color":"#13ce66"},model:{value:t.addForm.proxy,callback:function(e){t.$set(t.addForm,"proxy",e)},expression:"addForm.proxy"}})],1),t._v(" "),i("el-form-item",{attrs:{prop:"source"}},[i("span",{staticStyle:{height:"24px","line-height":"24px"},attrs:{slot:"label"},slot:"label"},[i("el-tooltip",{attrs:{content:"网址例子:https://docs.rsshub.app/",placement:"top"}},[i("el-link",{attrs:{href:"https://docs.rsshub.app/",target:"_blank"}},[t._v("源网址"),i("i",{staticClass:"el-icon-question"})])],1)],1),t._v(" "),i("el-input",{attrs:{placeholder:"输入源rss网址"},model:{value:t.addForm.source,callback:function(e){t.$set(t.addForm,"source",e)},expression:"addForm.source"}},[i("el-button",{attrs:{slot:"append",icon:"el-icon-s-promotion",loading:t.testLoading},on:{click:function(e){return t.sourceTest(t.addForm.source,t.addForm.proxy)}},slot:"append"},[t._v("测试\n          ")])],1)],1),t._v(" "),i("el-form-item",{attrs:{label:"键名",prop:"name"}},[i("el-input",{attrs:{placeholder:"输入键名,勿与已有rss重复"},model:{value:t.addForm.name,callback:function(e){t.$set(t.addForm,"name",e)},expression:"addForm.name"}})],1),t._v(" "),i("el-form-item",{attrs:{label:"关键词"}},[i("xm-tags",{attrs:{value:t.addForm.name_filter},on:{"update:value":function(e){return t.$set(t.addForm,"name_filter",e)}}})],1),t._v(" "),i("el-form-item",{attrs:{label:"提取链接",prop:"link_replace"}},[i("el-input",{attrs:{placeholder:"输入提取链接"},model:{value:t.addForm.link_replace,callback:function(e){t.$set(t.addForm,"link_replace",e)},expression:"addForm['link_replace']"}})],1),t._v(" "),i("el-form-item",{attrs:{label:"推送列表"}},t._l(t.addForm.push_list,function(e,l,a){return i("xm-info-box",{key:a,attrs:{title:String(l).toUpperCase(),retractable:""}},[i("xm-info-box",{attrs:{title:"群聊"}},[i("el-checkbox",{attrs:{checked:"all"===e.group||!e.group instanceof Array,label:"全局推送"},on:{change:function(t){e.group=t?"all":[]}}}),t._v(" "),"all"!==e.group?i("xm-tags",{attrs:{value:e.group,disabled:!t.isAdmin},on:{"update:value":function(i){return t.$set(e,"group",i)}}}):t._e()],1),t._v(" "),i("xm-info-box",{attrs:{title:"私聊"}},[i("el-checkbox",{attrs:{checked:"all"===e.private||!e.private instanceof Array,label:"全局推送"},on:{change:function(t){e.private=t?"all":[]}}}),t._v(" "),"all"!==e.private?i("xm-tags",{attrs:{value:e.private,disabled:!t.isAdmin},on:{"update:value":function(i){return t.$set(e,"private",i)}}}):t._e()],1)],1)}),1)],1),t._v(" "),i("el-row",{staticClass:"text-center"},[i("el-button",{attrs:{size:"small",type:"primary",loading:t.submitLoading},on:{click:t.addSubmit}},[t._v("提交")]),t._v(" "),i("el-button",{attrs:{size:"small"},on:{click:function(e){t.addVisible=!1}}},[t._v("取消")])],1)],1)],1)},staticRenderFns:[]};var o=i("VU/8")(n,r,!1,function(t){i("lYX6")},"data-v-5c3b4160",null);e.default=o.exports}});
//# sourceMappingURL=10.ed8e185348dfc1fbe307.js.map