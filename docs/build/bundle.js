var app=function(){"use strict";function t(){}function e(t){return t()}function n(){return Object.create(null)}function o(t){t.forEach(e)}function r(t){return"function"==typeof t}function c(t,e){return t!=t?e==e:t!==e||t&&"object"==typeof t||"function"==typeof t}function a(t,e){t.appendChild(e)}function l(t,e,n){t.insertBefore(e,n||null)}function u(t){t.parentNode.removeChild(t)}function i(t,e){for(let n=0;n<t.length;n+=1)t[n]&&t[n].d(e)}function s(t){return document.createElement(t)}function d(t){return document.createTextNode(t)}function f(){return d(" ")}function h(t,e,n,o){return t.addEventListener(e,n,o),()=>t.removeEventListener(e,n,o)}function p(t,e,n){null==n?t.removeAttribute(e):t.getAttribute(e)!==n&&t.setAttribute(e,n)}function g(t,e){e=""+e,t.wholeText!==e&&(t.data=e)}function m(t,e){t.value=null==e?"":e}function v(t,e){for(let n=0;n<t.options.length;n+=1){const o=t.options[n];if(o.__value===e)return void(o.selected=!0)}t.selectedIndex=-1}let $;function y(t){$=t}function x(){const t=function(){if(!$)throw new Error("Function called outside component initialization");return $}();return(e,n)=>{const o=t.$$.callbacks[e];if(o){const r=function(t,e,n=!1){const o=document.createEvent("CustomEvent");return o.initCustomEvent(t,n,!1,e),o}(e,n);o.slice().forEach((e=>{e.call(t,r)}))}}}const w=[],b=[],_=[],k=[],D=Promise.resolve();let M=!1;function E(t){_.push(t)}const K=new Set;let C=0;function I(){const t=$;do{for(;C<w.length;){const t=w[C];C++,y(t),j(t.$$)}for(y(null),w.length=0,C=0;b.length;)b.pop()();for(let t=0;t<_.length;t+=1){const e=_[t];K.has(e)||(K.add(e),e())}_.length=0}while(w.length);for(;k.length;)k.pop()();M=!1,K.clear(),y(t)}function j(t){if(null!==t.fragment){t.update(),o(t.before_update);const e=t.dirty;t.dirty=[-1],t.fragment&&t.fragment.p(t.ctx,e),t.after_update.forEach(E)}}const S=new Set;let O;function N(t,e){t&&t.i&&(S.delete(t),t.i(e))}function A(t,e,n,o){if(t&&t.o){if(S.has(t))return;S.add(t),O.c.push((()=>{S.delete(t),o&&(n&&t.d(1),o())})),t.o(e)}}function L(t,e){A(t,1,1,(()=>{e.delete(t.key)}))}function T(t){t&&t.c()}function q(t,n,c,a){const{fragment:l,on_mount:u,on_destroy:i,after_update:s}=t.$$;l&&l.m(n,c),a||E((()=>{const n=u.map(e).filter(r);i?i.push(...n):o(n),t.$$.on_mount=[]})),s.forEach(E)}function z(t,e){const n=t.$$;null!==n.fragment&&(o(n.on_destroy),n.fragment&&n.fragment.d(e),n.on_destroy=n.fragment=null,n.ctx=[])}function B(t,e){-1===t.$$.dirty[0]&&(w.push(t),M||(M=!0,D.then(I)),t.$$.dirty.fill(0)),t.$$.dirty[e/31|0]|=1<<e%31}function R(e,r,c,a,l,i,s,d=[-1]){const f=$;y(e);const h=e.$$={fragment:null,ctx:null,props:i,update:t,not_equal:l,bound:n(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(r.context||(f?f.$$.context:[])),callbacks:n(),dirty:d,skip_bound:!1,root:r.target||f.$$.root};s&&s(h.root);let p=!1;if(h.ctx=c?c(e,r.props||{},((t,n,...o)=>{const r=o.length?o[0]:n;return h.ctx&&l(h.ctx[t],h.ctx[t]=r)&&(!h.skip_bound&&h.bound[t]&&h.bound[t](r),p&&B(e,t)),n})):[],h.update(),p=!0,o(h.before_update),h.fragment=!!a&&a(h.ctx),r.target){if(r.hydrate){const t=function(t){return Array.from(t.childNodes)}(r.target);h.fragment&&h.fragment.l(t),t.forEach(u)}else h.fragment&&h.fragment.c();r.intro&&N(e.$$.fragment),q(e,r.target,r.anchor,r.customElement),I()}y(f)}class U{$destroy(){z(this,1),this.$destroy=t}$on(t,e){const n=this.$$.callbacks[t]||(this.$$.callbacks[t]=[]);return n.push(e),()=>{const t=n.indexOf(e);-1!==t&&n.splice(t,1)}}$set(t){var e;this.$$set&&(e=t,0!==Object.keys(e).length)&&(this.$$.skip_bound=!0,this.$$set(t),this.$$.skip_bound=!1)}}function F(t,e,n){const o=t.slice();return o[12]=e[n],o}function P(t,e,n){const o=t.slice();return o[15]=e[n],o}function X(t){let e,n,o,r=t[1][t[15]]+"";return{c(){e=s("option"),n=d(r),e.__value=o=t[15],e.value=e.__value},m(t,o){l(t,e,o),a(e,n)},p(t,e){2&e&&r!==(r=t[1][t[15]]+"")&&g(n,r)},d(t){t&&u(e)}}}function G(t){let e,n,o,r,c,a=Object.keys(t[0].extraData||{}),g=[];for(let e=0;e<a.length;e+=1)g[e]=Q(F(t,a,e));return{c(){e=s("input"),n=f();for(let t=0;t<g.length;t+=1)g[t].c();o=d(""),p(e,"placeholder","输入可能的枚举"),p(e,"class","svelte-1ww148w")},m(a,u){l(a,e,u),l(a,n,u);for(let t=0;t<g.length;t+=1)g[t].m(a,u);l(a,o,u),r||(c=h(e,"keyup",t[5]),r=!0)},p(t,e){if(65&e){let n;for(a=Object.keys(t[0].extraData||{}),n=0;n<a.length;n+=1){const r=F(t,a,n);g[n]?g[n].p(r,e):(g[n]=Q(r),g[n].c(),g[n].m(o.parentNode,o))}for(;n<g.length;n+=1)g[n].d(1);g.length=a.length}},d(t){t&&u(e),t&&u(n),i(g,t),t&&u(o),r=!1,c()}}}function H(e){let n,o,r;return{c(){n=s("input"),p(n,"placeholder","输入不变的值"),p(n,"class","svelte-1ww148w")},m(t,c){l(t,n,c),o||(r=h(n,"change",e[4]),o=!0)},p:t,d(t){t&&u(n),o=!1,r()}}}function J(t){let e,n,r;return{c(){e=s("input"),p(e,"placeholder","数据长度"),p(e,"class","svelte-1ww148w")},m(o,c){l(o,e,c),m(e,t[0].extraData),n||(r=[h(e,"change",t[4]),h(e,"input",t[9])],n=!0)},p(t,n){5&n&&e.value!==t[0].extraData&&m(e,t[0].extraData)},d(t){t&&u(e),n=!1,o(r)}}}function Q(t){let e,n,o,r,c,i,m,v,$,y,x=t[12]+"";return{c(){e=s("span"),n=s("span"),o=d(x),r=f(),c=s("span"),i=d("X"),v=f(),p(c,"class","close svelte-1ww148w"),p(c,"data-item",m=t[12]),p(e,"class","tag svelte-1ww148w")},m(u,s){l(u,e,s),a(e,n),a(n,o),a(e,r),a(e,c),a(c,i),a(e,v),$||(y=h(c,"click",t[6]),$=!0)},p(t,e){1&e&&x!==(x=t[12]+"")&&g(o,x),5&e&&m!==(m=t[12])&&p(c,"data-item",m)},d(t){t&&u(e),$=!1,y()}}}function V(e){let n,r,c,d,g,m,$=e[2],y=[];for(let t=0;t<$.length;t+=1)y[t]=X(P(e,$,t));function x(t,e){return"randomString"===t[0].creatorKey||"randomNumber"===t[0].creatorKey?J:"holdon"===t[0].creatorKey?H:"enums"===t[0].creatorKey?G:void 0}let w=x(e),b=w&&w(e);return{c(){n=s("div"),r=s("select"),c=s("option"),c.textContent="选择数据类型";for(let t=0;t<y.length;t+=1)y[t].c();d=f(),b&&b.c(),c.selected=!0,c.disabled=!0,c.hidden=!0,c.__value="",c.value=c.__value,p(r,"class","svelte-1ww148w"),void 0===e[0].creatorKey&&E((()=>e[8].call(r))),p(n,"class","selector svelte-1ww148w")},m(t,o){l(t,n,o),a(n,r),a(r,c);for(let t=0;t<y.length;t+=1)y[t].m(r,null);v(r,e[0].creatorKey),a(n,d),b&&b.m(n,null),g||(m=[h(r,"change",e[3]),h(r,"change",e[8])],g=!0)},p(t,[e]){if(6&e){let n;for($=t[2],n=0;n<$.length;n+=1){const o=P(t,$,n);y[n]?y[n].p(o,e):(y[n]=X(o),y[n].c(),y[n].m(r,null))}for(;n<y.length;n+=1)y[n].d(1);y.length=$.length}5&e&&v(r,t[0].creatorKey),w===(w=x(t))&&b?b.p(t,e):(b&&b.d(1),b=w&&w(t),b&&(b.c(),b.m(n,null)))},i:t,o:t,d(t){t&&u(n),i(y,t),b&&b.d(),g=!1,o(m)}}}function W(t,e,n){let{selectorId:o}=e,{data:r}=e,{creatorMap:c}=e;const a=Object.keys(c),l=x();function u(t,e){l("valueChanged",{[t]:e,selectorId:o})}return t.$$set=t=>{"selectorId"in t&&n(7,o=t.selectorId),"data"in t&&n(0,r=t.data),"creatorMap"in t&&n(1,c=t.creatorMap)},[r,c,a,function(t){u("creatorKey",t.target.value)},function(t){u("extraData",t.target.value)},function(t){console.log(t),13===t.keyCode&&(u("extraData",{...r.extraData,[t.target.value]:1}),t.target.value="")},function(t){const e={...r.extraData};delete e[t.target.dataset.item],u("extraData",e)},o,function(){r.creatorKey=function(t){const e=t.querySelector(":checked")||t.options[0];return e&&e.__value}(this),n(0,r),n(2,a)},function(){r.extraData=this.value,n(0,r),n(2,a)}]}class Y extends U{constructor(t){super(),R(this,t,W,V,c,{selectorId:7,data:0,creatorMap:1})}}function Z(t,e,n){const o=t.slice();return o[14]=e[n],o}function tt(t,e,n){const o=t.slice();return o[17]=e[n],o}function et(t,e){let n,o,r,c,i,g,m,v,$;return g=new Y({props:{creatorMap:e[9],data:e[17],selectorId:e[17].id}}),g.$on("valueChanged",e[8]),{key:t,first:null,c(){n=s("div"),o=s("div"),r=d("删除"),i=f(),T(g.$$.fragment),p(o,"class","del svelte-1pxjp9d"),p(o,"data-item",c=e[17].id),p(n,"class","line svelte-1pxjp9d"),this.first=n},m(t,c){l(t,n,c),a(n,o),a(o,r),a(n,i),q(g,n,null),m=!0,v||($=h(o,"click",e[6]),v=!0)},p(t,n){e=t,(!m||1&n&&c!==(c=e[17].id))&&p(o,"data-item",c);const r={};1&n&&(r.data=e[17]),1&n&&(r.selectorId=e[17].id),g.$set(r)},i(t){m||(N(g.$$.fragment,t),m=!0)},o(t){A(g.$$.fragment,t),m=!1},d(t){t&&u(n),z(g),v=!1,$()}}}function nt(t){let e,n,o,r=t[14]+"";return{c(){e=s("div"),n=d(r),o=f()},m(t,r){l(t,e,r),a(e,n),a(e,o)},p(t,e){8&e&&r!==(r=t[14]+"")&&g(n,r)},d(t){t&&u(e)}}}function ot(t){let e,n,r,c,d,p,g,v,$,y,x,w,b,_,k,D,M,E,K,C,I,j,S=[],T=new Map,q=t[0];const z=t=>t[17].id;for(let e=0;e<q.length;e+=1){let n=tt(t,q,e),o=z(n);T.set(o,S[e]=et(o,n))}let B=t[3],R=[];for(let e=0;e<B.length;e+=1)R[e]=nt(Z(t,B,e));return{c(){e=s("div"),n=s("button"),n.textContent="增加",r=f(),c=s("button"),c.textContent="生成",d=f(),p=s("button"),p.textContent="下载 csv",g=f(),v=s("div"),$=s("span"),$.textContent="分隔符",y=f(),x=s("input"),w=f(),b=s("div"),_=s("span"),_.textContent="生成数据量",k=f(),D=s("input"),M=f();for(let t=0;t<S.length;t+=1)S[t].c();E=f(),K=s("div");for(let t=0;t<R.length;t+=1)R[t].c()},m(o,u){l(o,e,u),a(e,n),a(e,r),a(e,c),a(e,d),a(e,p),a(e,g),a(e,v),a(v,$),a(v,y),a(v,x),m(x,t[1]),a(e,w),a(e,b),a(b,_),a(b,k),a(b,D),m(D,t[2]),a(e,M);for(let t=0;t<S.length;t+=1)S[t].m(e,null);a(e,E),a(e,K);for(let t=0;t<R.length;t+=1)R[t].m(K,null);C=!0,I||(j=[h(n,"click",t[4]),h(c,"click",t[7]),h(p,"click",t[5]),h(x,"input",t[10]),h(D,"input",t[11])],I=!0)},p(t,[n]){if(2&n&&x.value!==t[1]&&m(x,t[1]),4&n&&D.value!==t[2]&&m(D,t[2]),833&n&&(q=t[0],O={r:0,c:[],p:O},S=function(t,e,n,o,r,c,a,l,u,i,s,d){let f=t.length,h=c.length,p=f;const g={};for(;p--;)g[t[p].key]=p;const m=[],v=new Map,$=new Map;for(p=h;p--;){const t=d(r,c,p),l=n(t);let u=a.get(l);u?o&&u.p(t,e):(u=i(l,t),u.c()),v.set(l,m[p]=u),l in g&&$.set(l,Math.abs(p-g[l]))}const y=new Set,x=new Set;function w(t){N(t,1),t.m(l,s),a.set(t.key,t),s=t.first,h--}for(;f&&h;){const e=m[h-1],n=t[f-1],o=e.key,r=n.key;e===n?(s=e.first,f--,h--):v.has(r)?!a.has(o)||y.has(o)?w(e):x.has(r)?f--:$.get(o)>$.get(r)?(x.add(o),w(e)):(y.add(r),f--):(u(n,a),f--)}for(;f--;){const e=t[f];v.has(e.key)||u(e,a)}for(;h;)w(m[h-1]);return m}(S,n,z,1,t,q,T,e,L,et,E,tt),O.r||o(O.c),O=O.p),8&n){let e;for(B=t[3],e=0;e<B.length;e+=1){const o=Z(t,B,e);R[e]?R[e].p(o,n):(R[e]=nt(o),R[e].c(),R[e].m(K,null))}for(;e<R.length;e+=1)R[e].d(1);R.length=B.length}},i(t){if(!C){for(let t=0;t<q.length;t+=1)N(S[t]);C=!0}},o(t){for(let t=0;t<S.length;t+=1)A(S[t]);C=!1},d(t){t&&u(e);for(let t=0;t<S.length;t+=1)S[t].d();i(R,t),I=!1,o(j)}}}function rt(t,e){return t+e}function ct(t){return parseInt((new Date).getTime()/1e3)+60*t}function at(t,e){const n="0123456789";let o="";for(let t=0;t<e;t++)o+=n[Math.round(Math.random()*(n.length-1))];return o}function lt(t,e){const n="abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ";let o="";for(let t=0;t<e;t++)o+=n[Math.round(Math.random()*(n.length-1))];return o}function ut(t,e){return e}function it(t,e){const n=Object.keys(e);return n[Math.round(Math.random()*(n.length-1))]}function st(t,e,n){let o=[],r=0,c="|",a=50;let l=[];const u={step:rt,dateStep:ct,randomString:lt,randomNumber:at,holdon:ut,enums:it};return[o,c,a,l,function(){const t={id:"col"+r++,creatorKey:void 0,extraData:void 0};n(0,o=[...o,t])},function(){let t=document.createElement("a"),e=new Blob([l.join("\n")],{type:"text"});t.href=URL.createObjectURL(e),t.download="data.csv",t.click()},function(t){const e=t.target.dataset.item,r=o.findIndex((t=>t.id===e)),c=[...o];c.splice(r,1),n(0,o=c)},function(){n(3,l=new Array(parseInt(a)||50).fill(1).map(((t,e)=>o.map((t=>u[t.creatorKey](e,t.extraData))).join(c||","))))},function(t){const{creatorKey:e,extraData:r,selectorId:c}=t.detail,a=o.findIndex((t=>t.id===c));n(0,o[a]={id:o[a].id,creatorKey:e??o[a].creatorKey,extraData:r??o[a].extraData},o)},{dateStep:"时间戳递增",randomString:"随机字符串（a-z，0-9）",randomNumber:"随机数字（0-9）",holdon:"保持输入值不变",enums:"从枚举中选择一个"},function(){c=this.value,n(1,c)},function(){a=this.value,n(2,a)}]}class dt extends U{constructor(t){super(),R(this,t,st,ot,c,{})}}function ft(e){let n,o;return n=new dt({}),{c(){T(n.$$.fragment)},m(t,e){q(n,t,e),o=!0},p:t,i(t){o||(N(n.$$.fragment,t),o=!0)},o(t){A(n.$$.fragment,t),o=!1},d(t){z(n,t)}}}return new class extends U{constructor(t){super(),R(this,t,null,ft,c,{})}}({target:document.body})}();
//# sourceMappingURL=bundle.js.map
