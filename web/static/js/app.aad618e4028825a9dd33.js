webpackJsonp([5],{NHnr:function(e,n,t){"use strict";Object.defineProperty(n,"__esModule",{value:!0});var r=t("7+uW"),u={render:function(){var e=this.$createElement,n=this._self._c||e;return n("div",{attrs:{id:"app"}},[n("router-view")],1)},staticRenderFns:[]};var o=t("VU/8")({name:"App"},u,!1,function(e){t("Tml/")},null,null).exports,a=t("/ocq");r.default.use(a.a);var i=new a.a({routes:[{path:"/",redirect:"/index"},{path:"/index",name:"Index",component:function(){return t.e(1).then(t.bind(null,"dAjm"))}},{path:"/404",name:"404",component:function(){return t.e(2).then(t.bind(null,"thLP"))}},{path:"/login",name:"login",component:function(){return t.e(3).then(t.bind(null,"K31e"))}},{path:"/pcr/pool-setting",name:"pcr-pool-setting",component:function(){return t.e(0).then(t.bind(null,"/PBl"))}},{path:"*",redirect:"/404"}]}),c=t("zL8q"),p=t.n(c),s=(t("tvR6"),t("gyMJ"));r.default.config.productionTip=!1,r.default.use(p.a),r.default.prototype.$ajax=s.b;var l=new r.default({el:"#app",router:i,components:{App:o},template:"<App/>"});Object(s.a)(l)},"Tml/":function(e,n){},gyMJ:function(e,n,t){"use strict";t.d(n,"b",function(){return a}),n.a=function(e){a.interceptors.request.use(function(e){return e.headers.author="cookie",e},function(n){return e.$message({type:"error",message:"请求出错"}),u.a.reject(n)}),a.interceptors.response.use(function(e){return e.data},function(n){return e.$message({type:"error",message:"服务器出错"}),u.a.reject(n)})};var r=t("//Fk"),u=t.n(r),o=t("mw3O"),a=(t.n(o),t("mtWM").default);a.defaults.baseURL="/",n.c=a},tvR6:function(e,n){}},["NHnr"]);
//# sourceMappingURL=app.aad618e4028825a9dd33.js.map