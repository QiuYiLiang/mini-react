"use strict";const t=Symbol();let e=null;const n={className:"class",onClick:"onclick"};class o{type;props;children;rawType=t;el=null;updateQueue={update:null,lastUpdate:null};state={currentHook:null,firstHook:null};childElement=null;update=null;isMounted=!1;constructor(t,e,n){this.type=t,this.props=e,this.children=n}}function l(o,r,s=0,u={}){if(function(e){return e?.rawType===t}(o)){let t=o;const c=[];for(;"string"!=typeof t.type;){c.push(t);const n=e;e=o,t=t.type(t.props),e.isMounted=!0,e=n}c.forEach((e=>{e.childElement=t,e.update=()=>{l(e,r,s,t)}}));const a=u.type===t.type,p=a?u.el:document.createElement(t.type);t.el=p;const i=function(t,e){const n={};for(const o in t)t.hasOwnProperty(o)&&t[o]!==e[o]&&(n[o]=t[o]);return n}(t.props,u.props??{});!function(t,e){for(const o in e)if(e.hasOwnProperty(o)){const l=e[o];t[n[o]||o]=l}}(p,i),a||function(t,e,n){const o=e.children[n];o?o.replaceWith(t):e.appendChild(t)}(p,r,s),t.children.forEach(((t,e)=>{const n=u.children?.[e]??{};l(t,p,e,("string"==typeof n.type?n:n.childElement)??{})}))}else if(o!==u){const t=r.childNodes[s];t?t.textContent!==o&&(t.textContent=o):r.appendChild(document.createTextNode(o))}}exports.StateImpl=class{value;next;constructor(t,e=null){this.value=t,this.next=e}},exports.createElement=function(t,e,...n){return new o(t,e,n)},exports.createRoot=function(t){return{mount:e=>{let n=e.lastElementChild;for(;n;)e.removeChild(n),n=e.lastElementChild;l(t,e)}}},exports.getUpdate=function(){return null},exports.useState=function(t){const n=e,o=function(t){const n=e,o=n.isMounted,l=n.state;if(o){const t=l.currentHook;return l.currentHook=t.next,t}{const e={initValue:r=t,value:r,next:null};return l.currentHook?(e.next=l.firstHook,l.currentHook.next=e):(e.next=e,l.firstHook=e,l.currentHook=e),e}var r}(t);return[o.value,t=>{const e=n.updateQueue,l={action:()=>{o.value=t},next:null};e.lastUpdate?(e.lastUpdate.next=l,e.lastUpdate=l):(e.update=l,e.lastUpdate=l,setTimeout((()=>{for(;e.update;)e.update.action(),e.update=e.update.next;e.lastUpdate=null,n.update()}),0))}]};
//# sourceMappingURL=revue.cjs.js.map