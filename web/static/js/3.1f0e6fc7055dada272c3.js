webpackJsonp([3],{"5RPZ":function(e,s){},K31e:function(e,s,n){"use strict";Object.defineProperty(s,"__esModule",{value:!0});var o={name:"login",data:function(){return{loading:!0,loginForm:{username:"",password:""},rules:{username:[{required:!0,message:"请输入账户",trigger:"blur"}],password:[{required:!0,message:"请输入密码",trigger:"blur"}]},loginLoading:!1}},methods:{checkQuery:function(e){var s=this;e.hasOwnProperty("user")&&e.hasOwnProperty("salt")?(this.curUser=e.user,this.$ajax({url:"/login.salt",params:e}).then(function(e){0===e.code?s.loginSuccess(e):e.code>500?s.$message({message:e.msg,type:"error",duration:1e3,onClose:function(){s.$router.push("/index")}}):s.$message({message:e.msg,type:"error",duration:1e3,onClose:function(){s.loading=!1}})})):this.loading=!1},loginSubmit:function(){var e=this;this.loginLoading=!0,this.$refs.loginForm.validate(function(s){s?e.$ajax({url:"/login",params:{user_id:e.loginForm.username,password:e.loginForm.password}}).then(function(s){0===s.code?e.loginSuccess(s):(e.loginLoading=!1,e.$message.error(s.msg))}):(e.loginLoading=!1,e.$message.warning("表单验证未通过"))})},loginSuccess:function(e){var s=this;0===e.data.login_count?this.$message({type:"success",message:"您是首次登录,请重置密码",duration:1e3,onClose:function(){s.$router.push({path:"/reset-pwd",query:{user:query.user,salt:query.salt}})}}):(this.$cookies.set("token",e.data.token),this.$cookies.set("user_id",e.data.user_id),this.$cookies.set("salt",e.data.salt),this.$cookies.set("login_count",e.data.login_count),this.$message({type:"success",message:e.msg,duration:1e3,onClose:function(){s.$router.push("/index")}}))}},mounted:function(){var e=this.$route.query;this.checkQuery(e)}},t={render:function(){var e=this,s=e.$createElement,n=e._self._c||s;return n("el-container",{directives:[{name:"loading",rawName:"v-loading",value:e.loading,expression:"loading"}]},[n("el-header",[n("h2",[e._v("XmBot")])]),e._v(" "),n("el-main",{staticClass:"text-center"},[n("el-card",{staticClass:"login-box display-inline-block"},[n("el-row",[n("span",{staticClass:"login-title"},[e._v("登录")])]),e._v(" "),n("el-form",{ref:"loginForm",staticClass:"login-form",attrs:{model:e.loginForm,"label-width":"auto",rules:e.rules}},[n("el-form-item",{attrs:{label:"账户",prop:"username"}},[n("el-input",{attrs:{placeholder:"请输入账户"},nativeOn:{keypress:function(s){return!s.type.indexOf("key")&&e._k(s.keyCode,"enter",13,s.key,"Enter")?null:e.loginSubmit(s)}},model:{value:e.loginForm.username,callback:function(s){e.$set(e.loginForm,"username",s)},expression:"loginForm.username"}})],1),e._v(" "),n("el-form-item",{attrs:{label:"密码",prop:"password"}},[n("el-input",{attrs:{type:"password",placeholder:"请输入密码"},nativeOn:{keypress:function(s){return!s.type.indexOf("key")&&e._k(s.keyCode,"enter",13,s.key,"Enter")?null:e.loginSubmit(s)}},model:{value:e.loginForm.password,callback:function(s){e.$set(e.loginForm,"password",s)},expression:"loginForm.password"}})],1)],1),e._v(" "),n("el-row",[n("el-button",{attrs:{type:"primary",icon:"el-icon-check",size:"small",loading:e.loginLoading},on:{click:e.loginSubmit}},[e._v("登录\n        ")]),e._v(" "),n("el-tooltip",{attrs:{placement:"top",content:"请私聊机器人'登录'"}},[n("el-link",{staticClass:"login-forget-link",attrs:{type:"info"}},[n("el-icon",{staticClass:"el-icon-question"}),e._v("\n            忘记密码\n          ")],1)],1)],1)],1)],1)],1)},staticRenderFns:[]};var i=n("VU/8")(o,t,!1,function(e){n("5RPZ")},"data-v-587fc138",null);s.default=i.exports}});
//# sourceMappingURL=3.1f0e6fc7055dada272c3.js.map