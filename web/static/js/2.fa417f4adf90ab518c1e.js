webpackJsonp([2],{BEae:function(e,t){},Cdx3:function(e,t,n){var a=n("sB3e"),i=n("lktj");n("uqUo")("keys",function(){return function(e){return i(a(e))}})},DuF9:function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var a=n("fZjL"),i=n.n(a),c={name:"plugins-dict",data:function(){return{menu:[],loading:!0,dict:{},activeMenu:"",activeDict:[],search:""}},methods:{menuChange:function(e,t){this.activeDict=this.dict[e]},searchChange:function(e){this.activeDict=""===e?this.dict[this.activeMenu]:this.dict[this.activeMenu].filter(function(t){return t.match.some(function(t){return t.indexOf(e)>-1})})}},mounted:function(){},created:function(){var e=this;this.$ajax({url:"/getMatchDict.json"}).then(function(t){if(0===t.code){var n=t.data;e.menu=i()(n),e.dict=t.data,e.menu.length>0&&(e.activeMenu=e.menu[0],e.activeDict=e.dict[e.activeMenu]),e.loading=!1}else e.$message.error(t.msg)}).catch(function(t){e.$message.error(t)})}},s={render:function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("el-card",{attrs:{shadow:"hover"}},[n("div",{staticStyle:{position:"relative"},attrs:{slot:"header"},slot:"header"},[n("el-page-header",{attrs:{content:"帮助手册"},on:{back:function(t){return e.$router.push("/index")}}})],1),e._v(" "),n("el-container",{directives:[{name:"loading",rawName:"v-loading",value:e.loading,expression:"loading"}],staticClass:"height-auto"},[n("el-aside",[n("el-menu",{attrs:{"default-active":e.activeMenu},on:{select:e.menuChange}},e._l(e.menu,function(t,a){return n("el-menu-item",{key:a,attrs:{index:t}},[e._v(e._s(t))])}),1)],1),e._v(" "),n("el-main",[n("el-input",{attrs:{placeholder:"本页内筛选",clearable:""},on:{input:e.searchChange},model:{value:e.search,callback:function(t){e.search=t},expression:"search"}}),e._v(" "),e.activeDict&&e.activeDict.length>0?n("el-collapse",e._l(e.activeDict,function(t,a){return n("el-collapse-item",{key:a},[n("div",{attrs:{slot:"title"},slot:"title"},e._l(t.match,function(t,a){return n("el-tag",{key:a,staticStyle:{"margin-right":"10px"}},[e._v(e._s(t))])}),1),e._v(" "),n("el-row",[n("span",[e._v("描述: ")]),n("p",[e._v(e._s(t.describe))])]),e._v(" "),n("el-row",[n("el-tag",{attrs:{size:"small",type:t.startWith?"success":"info"}},[e._v("匹配开头")]),e._v(" "),n("el-tag",{attrs:{size:"small",type:t.needReplace?"success":"info"}},[e._v("去除匹配字符")])],1)],1)}),1):n("el-row",{staticStyle:{"text-align":"center","font-size":"14px",color:"#8c939d"}},[n("p",[e._v("无数据")])])],1)],1)],1)},staticRenderFns:[]};var r=n("VU/8")(c,s,!1,function(e){n("BEae")},"data-v-45b5069e",null);t.default=r.exports},fZjL:function(e,t,n){e.exports={default:n("jFbC"),__esModule:!0}},jFbC:function(e,t,n){n("Cdx3"),e.exports=n("FeBl").Object.keys},uqUo:function(e,t,n){var a=n("kM2E"),i=n("FeBl"),c=n("S82l");e.exports=function(e,t){var n=(i.Object||{})[e]||Object[e],s={};s[e]=t(n),a(a.S+a.F*c(function(){n(1)}),"Object",s)}}});
//# sourceMappingURL=2.fa417f4adf90ab518c1e.js.map