(()=>{"use strict";new Map;const e=new Map,t=new Map,n={Div:"div",Text:"text"},r="append";function o(e){return e.type===n.Text}const l=function(){let e=0;return function(){return e++,function(t){return`v${e}-${t}`}}}();function c(n){if(o(n)){const e=document.createDocumentFragment();return n.children.forEach((t=>{const n=document.createTextNode(t??"\n");e.appendChild(n)})),e}const{type:r,key:l,props:u,children:i=[]}=n,s=document.createElement(r);return t.set(l,s),i&&i.map((t=>{if("string"==typeof t){const n=e.get(t);return n?c(n):document.createTextNode(t)}return c(t)})).forEach((e=>s.appendChild(e))),s}function u(t,n,l="root"){const c=[];if(t.type!==n.type||t.key!==n.key)return c.push({type:"replace",parentKey:l,prevKey:t.key,lateKey:n.key}),c;if(o(t)||o(n))return c;const i=t,s=n,p=i.children,a=s.children,y=p.length,d=a.length,f=p.map((t=>e.get(t))),h=a.map((t=>e.get(t)));if(y!==d){if(y<d){const e=new Set(p);return a.filter((t=>!e.has(t))).forEach((e=>c.push({type:r,parentKey:s.key,prevKey:null,lateKey:e}))),c}if(y>d){const e=new Set(a);return p.filter((t=>!e.has(t))).forEach((e=>c.push({type:"remove",parentKey:i.key,prevKey:e,lateKey:null}))),c}}i.key!==s.key&&alert(`???? ${i.key}, ${s.key}`);for(let e=0;e<d;e++)c.push(...u(f[e],h[e],s.key));return c}const i=document.getElementById("root"),s=function(){let t=0;const r=l();return function(o){const l=r(t++);return[l,function(t,...r){if(o===n.Text){const t=function(e,t){return{type:n.Text,key:e,children:Array.isArray(t)?t:[t]}}(l,r);return e.set(l,t),t}const c=function(e,t,n=null,r){return{type:e,key:t,props:n,children:r}}(o,l,t,function(e){return e.map((e=>"string"==typeof e?e:e.key))}(r));return e.set(l,c),c}]}}();let p;if(i){const[n,o]=s("div");let l,a,y=o(null,function(e="World"){return`Hello ${e}`}("root"));setTimeout((()=>{for(let e=1;e<5;e++){const[e,t]=s("text"),n=t(null,`text ${e}`),[r,l]=s("div"),c=l(null,n);y=o(null,...y.children,c)}l=structuredClone(y),console.log("v1",l),i.appendChild(c(y)),p=y,setTimeout((()=>{for(let e=1;e<5;e++){const[e,t]=s("text"),n=t(null,`text2 ${e}`),[r,l]=s("div"),c=l(null,n);y=o(null,...y.children,c)}var n;a=structuredClone(y),console.log("v2",a),n=u(l,a),console.log("patch",n),n.forEach((n=>{const o=t.get(n.parentKey);if(o){if(n.type===r){const t=e.get(n.lateKey);if(!t)return void console.warn("vChild not found!",t);const r=document.createElement(t.type);t.children.forEach((t=>{const n=e.get(t);if(n){const e=c(n);e&&r.appendChild(e)}})),o.appendChild(r)}}else console.warn("this really should never happen",n.parentKey)}))}),2e3)}),2e3)}else console.log("null")})();