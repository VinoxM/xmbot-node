webpackJsonp([3],{BX9m:function(e,l){},K31e:function(e,l,o){"use strict";Object.defineProperty(l,"__esModule",{value:!0});var n={name:"login",data:function(){return{loginForm:{username:"",password:""},rules:{username:[{required:!0,message:"请输入账户",trigger:"blur"}],password:[{required:!0,message:"请输入密码",trigger:"blur"}]},loginLoading:!1}},methods:{loginSubmit:function(){var e=this;this.loginLoading=!0,this.$ajax({url:"/login"}).then(function(l){console.log(l),e.loginLoading=!1})}}},t={render:function(){var e=this,l=e.$createElement,o=e._self._c||l;return o("el-container",[o("el-main",{staticClass:"text-center"},[o("el-card",{staticClass:"login-box display-inline-block"},[o("el-row",[o("span",{staticClass:"login-title"},[e._v("登录")])]),e._v(" "),o("el-form",{staticClass:"login-form",attrs:{model:e.loginForm,"label-width":"auto",rules:e.rules}},[o("el-form-item",{attrs:{label:"账户",prop:"username"}},[o("el-input",{attrs:{placeholder:"请输入账户"},model:{value:e.loginForm.username,callback:function(l){e.$set(e.loginForm,"username",l)},expression:"loginForm.username"}})],1),e._v(" "),o("el-form-item",{attrs:{label:"密码",prop:"password"}},[o("el-input",{attrs:{type:"password",placeholder:"请输入密码"},model:{value:e.loginForm.password,callback:function(l){e.$set(e.loginForm,"password",l)},expression:"loginForm.password"}})],1)],1),e._v(" "),o("el-row",[o("el-button",{attrs:{type:"primary",icon:"el-icon-check",size:"small",loading:e.loginLoading},on:{click:e.loginSubmit}},[e._v("登录")]),e._v(" "),o("el-link",{staticClass:"login-forget-link",attrs:{type:"info"}},[o("el-icon",{staticClass:"el-icon-question"}),e._v("忘记密码")],1)],1)],1)],1)],1)},staticRenderFns:[]};var i=o("VU/8")(n,t,!1,function(e){o("BX9m")},"data-v-96a815b0",null);l.default=i.exports}});
//# sourceMappingURL=3.57a81743cad6f5ac9839.js.map