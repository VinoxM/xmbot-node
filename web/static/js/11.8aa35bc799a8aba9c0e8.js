webpackJsonp([11],{IFGT:function(t,e){},dAjm:function(t,e,i){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var o=i("YaEn"),s={name:"Index",data:function(){return{user_id:"",isCollapse:!1,menu:o.c,activeMenu:"/home"}},beforeRouteUpdate:function(t,e,i){this.flushRoute(t.fullPath),i()},watch:{},computed:{isLogin:function(){return this.user_id&&""!==this.user_id},homeTitle:function(){return this.isLogin?""+this.user_id:"未登录"},collapseClass:function(){return this.isCollapse?"el-icon-more i-more":"el-icon-more translateY-90 i-more"}},methods:{logout:function(){this.$cookies.remove("token"),this.$cookies.remove("user_id"),this.$cookies.remove("salt"),this.$cookies.remove("login_count"),window.location.reload()},flushRoute:function(t){var e=this,i=t||this.$route.fullPath;this.menu.some(function(t){return t.path===i&&(e.activeMenu=i,!0)})||(this.activeMenu="")}},created:function(){this.flushRoute()},mounted:function(){var t=this.$cookies.get("user_id");t&&(this.user_id=t)}},n={render:function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("el-container",[i("el-header",{staticClass:"xm-header"},[i("span",{staticClass:"xm-header-title"},[i("i",{staticClass:"el-icon-more i-more",class:t.collapseClass,on:{click:function(e){t.isCollapse=!t.isCollapse}}}),t._v(" "),i("span",{staticClass:"xm-home-title",staticStyle:{"margin-left":"10px"},on:{click:function(e){return t.$router.push("/home")}}},[t._v("xmBot")])]),t._v(" "),t.isLogin?i("el-dropdown",{staticClass:"float-right"},[i("span",{staticClass:"xm-home-title"},[t._v(t._s(t.homeTitle)),i("i",{staticClass:"el-icon-arrow-down el-icon--right"})]),t._v(" "),i("el-dropdown-menu",{attrs:{slot:"dropdown"},slot:"dropdown"},[i("el-dropdown-item",{nativeOn:{click:function(e){return t.logout(e)}}},[t._v("登出")])],1)],1):i("span",{staticClass:"float-right xm-home-title",on:{click:function(e){return t.$router.push("/login")}}},[t._v(t._s(t.homeTitle))])],1),t._v(" "),i("el-container",[i("el-aside",{staticStyle:{width:"auto"}},[i("el-menu",{attrs:{router:"",collapse:t.isCollapse,"default-active":t.activeMenu}},t._l(t.menu,function(e,o){return i("el-menu-item",{key:o,attrs:{index:e.path,disabled:!t.isLogin&&e.meta&&e.meta.auth}},[i("i",{class:e.icon&&""!==e.icon?e.icon:"el-icon-menu"}),t._v(" "),i("span",{attrs:{slot:"title"},slot:"title"},[t._v(t._s(e.title))])])}),1)],1),t._v(" "),i("el-main",{staticClass:"div-main",staticStyle:{"padding-top":"5px !important"}},[i("keep-alive",[i("router-view")],1)],1)],1)],1)},staticRenderFns:[]};var a=i("VU/8")(s,n,!1,function(t){i("IFGT")},"data-v-6f4cbe73",null);e.default=a.exports}});
//# sourceMappingURL=11.8aa35bc799a8aba9c0e8.js.map