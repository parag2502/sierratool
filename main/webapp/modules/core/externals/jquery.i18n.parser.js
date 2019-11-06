/* jQuery Internationalization library 1.0.4
 * Copyright (C) 2012 Santhosh Thottingal
 * Dual licensed GPLv2 or later and MIT. */
!function(n){"use strict";var r=function(r){this.options=n.extend({},n.i18n.parser.defaults,r),this.language=n.i18n.languages[String.locale]||n.i18n.languages.default,this.emitter=n.i18n.parser.emitter};r.prototype={constructor:r,simpleParse:function(n,r){return n.replace(/\$(\d+)/g,function(n,t){var u=parseInt(t,10)-1;return void 0!==r[u]?r[u]:"$"+t})},parse:function(r,t){return r.indexOf("{{")<0?this.simpleParse(r,t):(this.emitter.language=n.i18n.languages[n.i18n().locale]||n.i18n.languages.default,this.emitter.emit(this.ast(r),t))},ast:function(n){function r(n){return function(){var r,t;for(r=0;r<n.length;r++)if(null!==(t=n[r]()))return t;return null}}function t(n){var r,t,u=F,l=[];for(r=0;r<n.length;r++){if(null===(t=n[r]()))return F=u,null;l.push(t)}return l}function u(n,r){return function(){for(var t=F,u=[],l=r();null!==l;)u.push(l),l=r();return u.length<n?(F=t,null):u}}function l(r){var t=r.length;return function(){var u=null;return n.substr(F,t)===r&&(u=r,F+=t),u}}function e(r){return function(){var t=n.substr(F).match(r);return null===t?null:(F+=t[0].length,t[0])}}function i(){var n=t([h,p]);return null===n?null:n[1]}function a(){var n=t([d,m]);return null===n?null:["REPLACE",parseInt(n[1],10)-1]}function o(){var n,r=t([g,u(0,b)]);return null===r?null:(n=r[1]).length>1?["CONCAT"].concat(n):n[0]}function c(){var n=t([w,v,a]);return null===n?null:[n[0],n[2]]}function f(){var n=t([w,v,b]);return null===n?null:[n[0],n[2]]}function s(){var n=t([E,j,O]);return null===n?null:n[1]}var g,v,h,p,d,m,$,x,C,A,P,j,w,E,O,S,b,y,F=0;if(g=l("|"),v=l(":"),h=l("\\"),p=e(/^./),d=l("$"),m=e(/^\d+/),$=e(/^[^{}\[\]$\\]/),x=e(/^[^{}\[\]$\\|]/),C=e(/^[^{}\[\]$\s]/),r([i,C]),A=r([i,x]),P=r([i,$]),w=function(n,r){return function(){var t=n();return null===t?null:r(t)}}(e(/^[ !"$&'()*,.\/0-9;=?@A-Z\^_`a-z~\x80-\xFF+\-]+/),function(n){return n.toString()}),j=r([function(){var n=t([r([c,f]),u(0,o)]);return null===n?null:n[0].concat(n[1])},function(){var n=t([w,u(0,o)]);return null===n?null:[n[0]].concat(n[1])}]),E=l("{{"),O=l("}}"),S=r([s,a,function(){var n=u(1,P)();return null===n?null:n.join("")}]),b=r([s,a,function(){var n=u(1,A)();return null===n?null:n.join("")}]),null===(y=function(){var n=u(0,S)();return null===n?null:["CONCAT"].concat(n)}())||F!==n.length)throw new Error("Parse error at position "+F.toString()+" in input: "+n);return y}},n.extend(n.i18n.parser,new r)}(jQuery);
