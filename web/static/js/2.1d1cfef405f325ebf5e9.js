webpackJsonp([2],{Cdx3:function(e,t,s){var a=s("sB3e"),i=s("lktj");s("uqUo")("keys",function(){return function(e){return i(a(e))}})},DuF9:function(e,t,s){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var a=s("fZjL"),i=s.n(a),n={name:"plugins-dict",data:function(){return{menu:[],loading:!0,dict:{},activeMenu:"",activeDict:[],search:"",isCollapse:!0,bodyStyle:"padding:0;text-align:center;height: 100px;display: table-cell;vertical-align: middle;width: 150px;"}},methods:{menuChange:function(e,t){this.activeDict=this.dict[e]},searchChange:function(e){this.activeDict=""===e?this.dict[this.activeMenu]:this.dict[this.activeMenu].filter(function(t){return t.match.some(function(t){return t.indexOf(e)>-1})})}},mounted:function(){},created:function(){var e=this;this.$ajax({url:"/getMatchDict.json"}).then(function(t){if(0===t.code){var s=t.data;e.menu=i()(s),e.dict=t.data,e.menu.length>0&&(e.activeMenu=e.menu[0],e.activeDict=e.dict[e.activeMenu]),e.loading=!1}else e.$message.error(t.msg)}).catch(function(t){e.$message.error(t)})}},l={render:function(){var e=this,t=e.$createElement,s=e._self._c||t;return s("el-card",{attrs:{shadow:"hover"}},[s("div",{staticStyle:{position:"relative"},attrs:{slot:"header"},slot:"header"},[s("el-page-header",{attrs:{content:"帮助手册"},on:{back:function(t){return e.$router.push("/index")}}}),e._v(" "),s("el-radio-group",{staticStyle:{position:"absolute",top:"0",right:"0"},attrs:{size:"small"},model:{value:e.isCollapse,callback:function(t){e.isCollapse=t},expression:"isCollapse"}},[s("el-radio-button",{attrs:{label:!0}},[s("i",{staticClass:"el-icon-s-unfold"})]),e._v(" "),s("el-radio-button",{attrs:{label:!1}},[s("i",{staticClass:"el-icon-menu"})])],1)],1),e._v(" "),s("el-container",{directives:[{name:"loading",rawName:"v-loading",value:e.loading,expression:"loading"}],staticClass:"height-auto"},[s("el-aside",{attrs:{width:"30%"}},[s("el-menu",{attrs:{"default-active":e.activeMenu},on:{select:e.menuChange}},e._l(e.menu,function(t,a){return s("el-menu-item",{key:a,attrs:{index:t}},[e._v(e._s(t))])}),1)],1),e._v(" "),s("el-main",[s("el-input",{attrs:{placeholder:"本页内筛选",clearable:""},on:{input:e.searchChange},model:{value:e.search,callback:function(t){e.search=t},expression:"search"}}),e._v(" "),e.activeDict&&e.activeDict.length>0?s("el-row",[e.isCollapse?s("el-collapse",e._l(e.activeDict,function(t,a){return s("el-collapse-item",{key:a},[s("div",{staticClass:"plugins-title",attrs:{slot:"title"},slot:"title"},e._l(t.match,function(t,a){return s("el-tag",{key:a,staticStyle:{"margin-right":"10px"}},[e._v(e._s(t))])}),1),e._v(" "),s("el-row",[s("p",[s("span",[e._v("权限(限制): ")]),e._v(" "),s("el-tag",{attrs:{size:"small",type:t.rules.indexOf("admin")>-1?"danger":"info"}},[e._v("\n                  "+e._s(t.rules.indexOf("admin")>-1?"仅主人":"全员")+"\n                ")]),e._v(" "),t.rules.indexOf("group")>-1?s("el-tag",{attrs:{size:"small",type:"success"}},[e._v("仅群聊")]):e._e(),e._v(" "),t.rules.indexOf("private")>-1?s("el-tag",{attrs:{size:"small",type:"success"}},[e._v("仅私聊")]):e._e()],1)]),e._v(" "),s("el-row",[s("p",[s("span",[e._v("匹配规则: ")]),e._v(" "),s("el-tag",{attrs:{size:"small",type:t.needPrefix?"success":"info"}},[e._v("匹配昵称前缀")]),e._v(" "),s("el-tag",{attrs:{size:"small",type:t.startWith?"success":"info"}},[e._v("匹配开头")]),e._v(" "),t.startWith?s("el-tag",{attrs:{size:"small",type:t.needReplace?"success":"info"}},[e._v("去除匹配的开头\n                ")]):e._e()],1)]),e._v(" "),s("el-row",[s("p",[s("span",[e._v("描述: ")]),e._v("\n                "+e._s(t.describe)+"\n              ")])])],1)}),1):s("div",e._l(e.activeDict,function(t,a){return s("el-tooltip",{key:a,staticClass:"box-tool-tip",attrs:{effect:"light",placement:"top"}},[s("div",{attrs:{slot:"content"},slot:"content"},[s("el-row",[s("span",[e._v("描述: ")]),e._v(" "),s("p",[e._v(e._s(t.describe))])]),e._v(" "),s("el-row",[s("el-tag",{attrs:{size:"small",type:t.needPrefix?"success":"info"}},[e._v("匹配昵称前缀")]),e._v(" "),s("el-tag",{attrs:{size:"small",type:t.startWith?"success":"info"}},[e._v("匹配开头")]),e._v(" "),t.startWith?s("el-tag",{attrs:{size:"small",type:t.needReplace?"success":"info"}},[e._v("去除匹配的开头\n                ")]):e._e()],1),e._v(" "),s("el-row",[s("el-tag",{attrs:{size:"small",type:t.rules.indexOf("admin")>-1?"danger":"info"}},[e._v("\n                    "+e._s(t.rules.indexOf("admin")>-1?"仅主人":"全员")+"\n                  ")]),e._v(" "),t.rules.indexOf("group")>-1?s("el-tag",{attrs:{size:"small",type:"success"}},[e._v("仅群聊")]):e._e(),e._v(" "),t.rules.indexOf("private")>-1?s("el-tag",{attrs:{size:"small",type:"success"}},[e._v("仅私聊")]):e._e()],1)],1),e._v(" "),s("el-card",{staticClass:"box-item",attrs:{shadow:"hover","body-style":e.bodyStyle}},[s("div",{staticStyle:{margin:"0 auto"}},e._l(t.match,function(t,a){return s("el-tag",{key:a,staticClass:"box-item-tag"},[e._v(e._s(t))])}),1)])],1)}),1)],1):s("el-row",{staticClass:"no-more-data"},[s("p",[e._v("无数据")])])],1)],1)],1)},staticRenderFns:[]};var c=s("VU/8")(n,l,!1,function(e){s("JHhQ")},"data-v-251635b3",null);t.default=c.exports},JHhQ:function(e,t){},fZjL:function(e,t,s){e.exports={default:s("jFbC"),__esModule:!0}},jFbC:function(e,t,s){s("Cdx3"),e.exports=s("FeBl").Object.keys},uqUo:function(e,t,s){var a=s("kM2E"),i=s("FeBl"),n=s("S82l");e.exports=function(e,t){var s=(i.Object||{})[e]||Object[e],l={};l[e]=t(s),a(a.S+a.F*n(function(){s(1)}),"Object",l)}}});
//# sourceMappingURL=2.1d1cfef405f325ebf5e9.js.map