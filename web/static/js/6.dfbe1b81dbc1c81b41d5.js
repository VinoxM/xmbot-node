webpackJsonp([6],{"30WY":function(t,e,i){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var n={name:"xm-tags",data:function(){return{list:[],inputValue:"",inputVisible:!1}},props:{value:Array,label:{type:String,default:"Tag"},type:{type:String,default:"primary"},disabled:{type:Boolean,default:!1}},watch:{value:function(t){this.list=this.value}},methods:{newTag:function(){var t=this;this.inputVisible=!0,this.$nextTick(function(e){t.$refs.input.focus()})},inputConfirm:function(){""!==this.inputValue&&(this.list.push(this.inputValue),this.$emit("update",this.list)),this.inputValue="",this.inputVisible=!1},tagClose:function(t){this.list.splice(t,1),this.$emit("update",this.list)}},created:function(){this.list=this.value}},s={render:function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("span",[t._l(t.list,function(e,n){return i("el-tag",{key:n,staticClass:"xm-tag",attrs:{type:t.type,closable:!t.disabled},on:{close:function(e){return t.tagClose(n)}}},[t._v(t._s(e))])}),t._v(" "),t.inputVisible?i("el-input",{ref:"input",staticClass:"input-new-tag",attrs:{size:"small"},on:{blur:t.inputConfirm},nativeOn:{keyup:function(e){return!e.type.indexOf("key")&&t._k(e.keyCode,"enter",13,e.key,"Enter")?null:t.inputConfirm(e)}},model:{value:t.inputValue,callback:function(e){t.inputValue=e},expression:"inputValue"}}):t._e(),t._v(" "),t.disabled||t.inputVisible?t._e():i("el-button",{staticClass:"button-new-tag",attrs:{size:"small"},on:{click:t.newTag}},[t._v("+ New "+t._s(t.label))])],2)},staticRenderFns:[]};var l=i("VU/8")(n,s,!1,function(t){i("NolO")},"data-v-b51e6904",null);e.default=l.exports},NolO:function(t,e){}});
//# sourceMappingURL=6.dfbe1b81dbc1c81b41d5.js.map