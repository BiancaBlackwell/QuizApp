(this["webpackJsonpfrontend-react"]=this["webpackJsonpfrontend-react"]||[]).push([[0],{148:function(e,c){},160:function(e,c,t){"use strict";t.r(c);var s=t(93),a=t(0),n=t.n(a),l=t(17),r=t.n(l),o=function(e){e&&e instanceof Function&&t.e(3).then(t.bind(null,173)).then((function(c){var t=c.getCLS,s=c.getFID,a=c.getFCP,n=c.getLCP,l=c.getTTFB;t(e),s(e),a(e),n(e),l(e)}))},i=t(58),j=t(7),b=t(92),d=t(30),h=t.n(d),m=t(59),u=t(10),x=(t(99),t(25)),O=t.n(x),f=t(172),p=t(166),k=t(167),N=t(168),v=t(169),y=t(170),g=t(171),w=t(91),C=t(90),S=t(86),F=t.n(S).a.connect("".concat("http://quizzically.app:5000")),P=t(1),q="http://quizzically.app:5000";function D(){var e=Object(a.useState)({userid:void 0,roomid:void 0}),c=Object(u.a)(e,2),t=c[0],s=c[1],n=Object(a.useState)(!1),l=Object(u.a)(n,2),r=l[0],o=l[1],i=Object(a.useState)(!0),b=Object(u.a)(i,2),d=b[0],x=b[1],f=Object(a.useState)(""),p=Object(u.a)(f,2),k=p[0],N=p[1];Object(a.useEffect)((function(){t.userid&&t.roomid&&O.a.get("".concat(q,"/backend/joinRoom/").concat(t.userid,"=").concat(t.roomid)).then((function(e){o(!0)}),(function(e){alert("Failed to join lobby, sorry!")}))}),[t]);function v(){return y.apply(this,arguments)}function y(){return(y=Object(m.a)(h.a.mark((function e(){var c;return h.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return x(!1),console.log("Creating User"),e.next=4,O.a.get("".concat(q,"/backend/createUser"));case 4:c=e.sent,console.log("Joining Room"+k),s({roomid:k,userid:c.data});case 7:case"end":return e.stop()}}),e)})))).apply(this,arguments)}function g(){return(g=Object(m.a)(h.a.mark((function e(){var c,t;return h.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return x(!1),console.log("Creating User"),e.next=4,O.a.get("".concat(q,"/backend/createUser"));case 4:return c=e.sent,console.log("Creating Room"),e.next=8,O.a.get("".concat(q,"/backend/createRoom"));case 8:t=e.sent,console.log({roomid:t.data,userid:c.data}),s({roomid:t.data,userid:c.data});case 11:case"end":return e.stop()}}),e)})))).apply(this,arguments)}return Object(P.jsxs)("div",{className:"coontainer-fluid",children:[Object(P.jsx)("br",{}),Object(P.jsx)("br",{}),Object(P.jsx)("br",{}),Object(P.jsx)("br",{}),Object(P.jsx)("div",{className:"row text-center m-3",children:Object(P.jsx)("h1",{className:"text-nowrap main-title",children:"Quiz App"})}),Object(P.jsx)("br",{}),Object(P.jsx)("br",{}),Object(P.jsx)("br",{}),Object(P.jsx)("div",{className:"row align-items-center justify-content-center m-3",children:Object(P.jsx)("div",{className:"col-3",children:Object(P.jsxs)("div",{className:"input-group",children:[Object(P.jsx)("input",{type:"text",className:"form-control text-nowrap",placeholder:"Lobby Code",onChange:function(e){return function(e){N(e.target.value)}(e)},onKeyPress:function(e){"Enter"===e.key&&v()}}),Object(P.jsxs)("div",{className:"input-group-btn",children:[Object(P.jsx)("button",{type:"submit",enabled:d.toString(),className:"btn btn-dark text-nowrap form-control",style:{width:"auto"},onClick:v,children:"Join"}),r&&Object(P.jsx)(j.a,{to:{pathname:"/game/".concat(t.roomid),state:{roomid:t.roomid,userid:t.userid}}})]})]})})}),Object(P.jsx)("div",{className:"row text-center",children:Object(P.jsxs)("div",{className:"col",children:[Object(P.jsx)("button",{type:"submit",enabled:d.toString(),className:"btn btn-dark text-nowrap",onClick:function(){return g.apply(this,arguments)},children:"Create"}),r&&Object(P.jsx)(j.a,{to:{pathname:"/game/".concat(t.roomid),state:{roomid:t.roomid,userid:t.userid}}})]})})]})}function K(e){var c=Object(a.useState)("lobby"),t=Object(u.a)(c,2),s=t[0],n=t[1],l=Object(a.useState)([]),r=Object(u.a)(l,2),o=r[0],i=r[1],j=Object(a.useState)([]),d=Object(u.a)(j,2),h=d[0],m=d[1],x=Object(a.useState)(!1),f=Object(u.a)(x,2),p=f[0],k=f[1],N=Object(a.useState)(!1),v=Object(u.a)(N,2),y=v[0],g=v[1],w=Object(a.useState)({}),C=Object(u.a)(w,2),S=C[0],D=C[1],K=Object(a.useState)([]),I=Object(u.a)(K,2),R=I[0],Q=I[1],E=Object(a.useState)((function(){return e.location.state?e.location.state.roomid:void 0})),L=Object(u.a)(E,2),H=L[0],z=(L[1],Object(a.useState)((function(){return e.location.state?e.location.state.userid:void 0}))),G=Object(u.a)(z,2),M=G[0],J=G[1];Object(a.useEffect)((function(){void 0===M&&O.a.get("".concat(q,"/backend/createUser")).then((function(e){200===e.status?J(e.data):alert("Wasn't able to create your userid, sorry!")})),F.on("message",(function(e){console.log("Recieved message: ["+e.message+"] from "+e.userid);var c=o;c.push(e),i(Object(b.a)(c))})),F.on("updatePlayers",(function(e){console.log("Updating Players",e),m(e)})),F.on("yesStart",(function(){console.log("Host can now start the game!"),g(!0)})),F.on("noStart",(function(){console.log("Not enough players ready to start the game!"),g(!1)})),F.on("newHost",(function(e){console.log("New Host is "+e.userid),M===e.userid&&k(!0)})),F.on("trivia",(function(e){console.log("Everyone is ready! Now starting the Trivia!",e),D(e),n("trivia")})),F.on("displayNextQuestion",(function(e){console.log("Displaying the Next Question",e),D(e)})),F.on("outOfQuestions",(function(e){console.log("End of Round! Displaying Victory Page!",e),Q(e),n("victory")})),F.emit("identify",{roomid:H,userid:M})}),[]);return Object(P.jsxs)("div",{children:["lobby"===s&&Object(P.jsx)(A,{roomid:H,userid:M,messages:o,players:h,amHost:p,canStart:y}),"trivia"===s&&Object(P.jsx)(T,{roomid:H,userid:M,players:h,question:S}),"victory"===s&&Object(P.jsx)(U,{roomid:H,userid:M,players:h,toLobby:function(){console.log("Going back to Lobby!"),F.emit("clearScores",{roomid:H}),n("lobby")},victoryStats:R})]})}function A(e){var c=e.userid,t=e.roomid,s=e.messages,n=e.players,l=e.amHost,r=e.canStart,o=Object(a.useState)(""),i=Object(u.a)(o,2),j=i[0],b=i[1],d=Object(a.useState)(!1),h=Object(u.a)(d,2),m=h[0],x=h[1],O=Object(a.useState)({backgroundColor:"#464866"}),f=Object(u.a)(O,2),p=f[0],k=f[1],N=Object(a.useRef)(null);Object(a.useEffect)((function(){!function(){var e;null===(e=N.current)||void 0===e||e.scrollIntoView({behavior:"smooth"})}()}),[s]);var v=function(){""!==j&&(console.log("Sending message: ["+j+"] to room "+t),F.emit("sendMessage",{roomid:t,userid:c,message:j}),b(""))};return Object(P.jsx)("div",{className:"coontainer-fluid",children:Object(P.jsxs)("div",{className:"row",children:[Object(P.jsx)(Q,{players:n}),Object(P.jsxs)("div",{className:"col-10",children:[Object(P.jsx)("br",{}),Object(P.jsx)("h1",{className:"lobby-heading text-center text-middle",children:"Main Lobby"}),Object(P.jsxs)("p",{className:"uid text-center",id:"uid",children:[l?"\u2605\u2605\u2605"+c+"\u2605\u2605\u2605":c," "]}),Object(P.jsx)("br",{}),Object(P.jsx)("br",{}),Object(P.jsx)("br",{}),Object(P.jsxs)("div",{className:"row",children:[Object(P.jsxs)("div",{className:"col-6",children:[Object(P.jsx)("div",{className:"row message_holder",style:{textAlign:"left"},children:Object(P.jsxs)("div",{children:[0===s.length&&Object(P.jsx)("h3",{className:"message_placeholder",children:"No message yet.."}),s.length>0&&s.map((function(e,c){return Object(P.jsx)("div",{children:"server"===e.userid?Object(P.jsx)("div",{children:Object(P.jsx)("b",{children:e.message})}):Object(P.jsxs)("div",{children:[e.userid,": ",e.message]})},c)})),Object(P.jsx)("div",{ref:N})]})}),Object(P.jsxs)("div",{className:"input-group",children:[Object(P.jsx)("input",{type:"text",className:"text-nowrap form-control message",style:{fontSize:"18px",placeholder:"Message"},value:j,name:"message",onChange:function(e){return function(e){b(e.target.value)}(e)},onKeyPress:function(e){"Enter"===e.key&&v()}}),Object(P.jsx)("button",{type:"submit",className:"btn btn-dark text-nowrap",onClick:function(){return v()},children:"Send"})]}),Object(P.jsx)("br",{}),Object(P.jsx)("div",{style:{textAlign:"center"},children:Object(P.jsx)("button",{type:"submit",className:"btn btn-dark text-nowrap",onClick:function(){return function(){if(!l||l&&r){var e=!m;console.log("Toggling ready state to: "+e),F.emit(e?"readyUser":"unreadyUser",{roomid:t,userid:c,message:j}),k(e?{backgroundColor:"#25274d"}:{backgroundColor:"#464866"}),x(e)}}()},style:{backgroundColor:p.backgroundColor},children:l?"Start":"Ready"})})]}),Object(P.jsx)(I,{})]})]})]})})}function I(e){var c=Object(a.useState)("10s"),t=Object(u.a)(c,2),s=t[0],n=t[1],l=Object(a.useState)("15"),r=Object(u.a)(l,2),o=r[0],i=r[1],j=function(e){console.log("Submitting Gamemode: "+e)},b=["15s","30s","60s","\u221e"],d=["10","15","20","\u221e"];return Object(P.jsx)("div",{className:"col-5",style:{marginLeft:"15px"},children:Object(P.jsxs)(f.a,{defaultActiveKey:"profile",id:"uncontrolled-tab-example",children:[Object(P.jsx)(p.a,{eventKey:"home",title:"Quick Play",tabClassName:"profile-tabitem",children:Object(P.jsxs)(k.a,{className:"mt-1",children:[Object(P.jsx)(R,{text:"Classic",code:0,onClick:j}),Object(P.jsx)(R,{text:"Speed Round",code:1,onClick:j}),Object(P.jsx)(R,{text:"Endless",code:2,onClick:j})]})}),Object(P.jsxs)(p.a,{eventKey:"profile",title:"Advanced",tabClassName:"profile-tabitem",children:[Object(P.jsxs)(k.a,{className:"mt-2",children:[Object(P.jsx)(N.a,{children:Object(P.jsxs)(v.a,{className:"justify-content-center",children:[Object(P.jsx)(v.a.Prepend,{children:Object(P.jsx)(v.a.Text,{id:"btnGroupAddon",style:{backgroundColor:"#85c3cf",border:"#25274d",color:"#212121"},children:"Time per Question"})}),Object(P.jsxs)(y.a,{as:g.a,title:s,id:"bg-nested-dropdown",onSelect:function(e){console.log("Changing Time Control to: "+b[e]),n(b[e])},children:[Object(P.jsx)(w.a.Item,{eventKey:"0",children:"15s"}),Object(P.jsx)(w.a.Item,{eventKey:"1",children:"30s"}),Object(P.jsx)(w.a.Item,{eventKey:"2",children:"60s"}),Object(P.jsx)(w.a.Item,{eventKey:"3",children:"\u221e"})]})]})}),Object(P.jsx)(N.a,{children:Object(P.jsxs)(v.a,{className:"justify-content-center",children:[Object(P.jsx)(v.a.Prepend,{children:Object(P.jsx)(v.a.Text,{id:"btnGroupAddon",style:{backgroundColor:"#85c3cf",border:"#25274d",color:"#212121"},children:"# of Questions"})}),Object(P.jsxs)(y.a,{as:g.a,title:o,id:"bg-nested-dropdown",onSelect:function(e){console.log("Changing the Number of Questions to: "+d[e]),i(d[e])},children:[Object(P.jsx)(w.a.Item,{eventKey:"0",children:"10"}),Object(P.jsx)(w.a.Item,{eventKey:"1",children:"15"}),Object(P.jsx)(w.a.Item,{eventKey:"2",children:"20"}),Object(P.jsx)(w.a.Item,{eventKey:"3",children:"\u221e"})]})]})})]}),Object(P.jsxs)("div",{className:"row mt-3",children:[Object(P.jsxs)("div",{className:"col",children:[Object(P.jsxs)("div",{className:"form-check",children:[Object(P.jsx)("input",{className:"form-check-input",type:"checkbox"}),Object(P.jsx)("label",{className:"form-check-label",htmlFor:"flexSwitchCheckDefault",children:"Animals"})]}),Object(P.jsxs)("div",{className:"form-check",children:[Object(P.jsx)("input",{className:"form-check-input",type:"checkbox"}),Object(P.jsx)("label",{className:"form-check-label",htmlFor:"flexSwitchCheckChecked",children:"Brain Teasers"})]}),Object(P.jsxs)("div",{className:"form-check",children:[Object(P.jsx)("input",{className:"form-check-input",type:"checkbox"}),Object(P.jsx)("label",{className:"form-check-label",htmlFor:"flexSwitchCheckDefault",children:"Celebrities"})]}),Object(P.jsxs)("div",{className:"form-check",children:[Object(P.jsx)("input",{className:"form-check-input",type:"checkbox"}),Object(P.jsx)("label",{className:"form-check-label",htmlFor:"flexSwitchCheckChecked",children:"Entertainment"})]}),Object(P.jsxs)("div",{className:"form-check",children:[Object(P.jsx)("input",{className:"form-check-input",type:"checkbox"}),Object(P.jsx)("label",{className:"form-check-label",htmlFor:"flexSwitchCheckDefault",children:"For Kids"})]}),Object(P.jsxs)("div",{className:"form-check",children:[Object(P.jsx)("input",{className:"form-check-input",type:"checkbox"}),Object(P.jsx)("label",{className:"form-check-label",htmlFor:"flexSwitchCheckChecked",children:"General"})]}),Object(P.jsxs)("div",{className:"form-check",children:[Object(P.jsx)("input",{className:"form-check-input",type:"checkbox"}),Object(P.jsx)("label",{className:"form-check-label",htmlFor:"flexSwitchCheckDefault",children:"Geography"})]}),Object(P.jsxs)("div",{className:"form-check",children:[Object(P.jsx)("input",{className:"form-check-input",type:"checkbox"}),Object(P.jsx)("label",{className:"form-check-label",htmlFor:"flexSwitchCheckChecked",children:"History"})]}),Object(P.jsxs)("div",{className:"form-check",children:[Object(P.jsx)("input",{className:"form-check-input",type:"checkbox"}),Object(P.jsx)("label",{className:"form-check-label",htmlFor:"flexSwitchCheckDefault",children:"Hobbies"})]}),Object(P.jsxs)("div",{className:"form-check",children:[Object(P.jsx)("input",{className:"form-check-input",type:"checkbox"}),Object(P.jsx)("label",{className:"form-check-label",htmlFor:"flexSwitchCheckChecked",children:"Humanities"})]}),Object(P.jsxs)("div",{className:"form-check",children:[Object(P.jsx)("input",{className:"form-check-input",type:"checkbox"}),Object(P.jsx)("label",{className:"form-check-label",htmlFor:"flexSwitchCheckDefault",children:"Literature"})]})]}),Object(P.jsxs)("div",{className:"col",children:[Object(P.jsxs)("div",{className:"form-check",children:[Object(P.jsx)("input",{className:"form-check-input",type:"checkbox"}),Object(P.jsx)("label",{className:"form-check-label",htmlFor:"flexSwitchCheckChecked",children:"Movies"})]}),Object(P.jsxs)("div",{className:"form-check",children:[Object(P.jsx)("input",{className:"form-check-input",type:"checkbox"}),Object(P.jsx)("label",{className:"form-check-label",htmlFor:"flexSwitchCheckDefault",children:"Music"})]}),Object(P.jsxs)("div",{className:"form-check",children:[Object(P.jsx)("input",{className:"form-check-input",type:"checkbox"}),Object(P.jsx)("label",{className:"form-check-label",htmlFor:"flexSwitchCheckChecked",children:"Newest"})]}),Object(P.jsxs)("div",{className:"form-check",children:[Object(P.jsx)("input",{className:"form-check-input",type:"checkbox"}),Object(P.jsx)("label",{className:"form-check-label",htmlFor:"flexSwitchCheckDefault",children:"People"})]}),Object(P.jsxs)("div",{className:"form-check",children:[Object(P.jsx)("input",{className:"form-check-input",type:"checkbox"}),Object(P.jsx)("label",{className:"form-check-label",htmlFor:"flexSwitchCheckChecked",children:"Rated"})]}),Object(P.jsxs)("div",{className:"form-check",children:[Object(P.jsx)("input",{className:"form-check-input",type:"checkbox"}),Object(P.jsx)("label",{className:"form-check-label",htmlFor:"flexSwitchCheckDefault",children:"Religion/Faith"})]}),Object(P.jsxs)("div",{className:"form-check",children:[Object(P.jsx)("input",{className:"form-check-input",type:"checkbox"}),Object(P.jsx)("label",{className:"form-check-label",htmlFor:"flexSwitchCheckChecked",children:"Science/Technology"})]}),Object(P.jsxs)("div",{className:"form-check",children:[Object(P.jsx)("input",{className:"form-check-input",type:"checkbox"}),Object(P.jsx)("label",{className:"form-check-label",htmlFor:"flexSwitchCheckDefault",children:"Sports"})]}),Object(P.jsxs)("div",{className:"form-check",children:[Object(P.jsx)("input",{className:"form-check-input",type:"checkbox"}),Object(P.jsx)("label",{className:"form-check-label",htmlFor:"flexSwitchCheckChecked",children:"Television"})]}),Object(P.jsxs)("div",{className:"form-check",children:[Object(P.jsx)("input",{className:"form-check-input",type:"checkbox"}),Object(P.jsx)("label",{className:"form-check-label",htmlFor:"flexSwitchCheckDefault",children:"Video Games"})]}),Object(P.jsxs)("div",{className:"form-check",children:[Object(P.jsx)("input",{className:"form-check-input",type:"checkbox"}),Object(P.jsx)("label",{className:"form-check-label",htmlFor:"flexSwitchCheckChecked",children:"World"})]})]})]})]})]})})}function R(e){return Object(P.jsx)(C.a,{variant:"dark",className:"mt-2",onClick:function(){e.onClick(e.code)},children:e.text})}function Q(e){return Object(P.jsxs)("div",{className:"col-2 sidebar text-center",style:{height:"100vh"},children:[Object(P.jsx)("br",{}),Object(P.jsx)("h3",{style:{color:"#e8f9fc"},children:"Players"}),e.players&&e.players.map((function(e,c){return e.score>=0?Object(P.jsxs)("div",{className:"player card mb-2",style:{backgroundColor:e.backgroundColor},children:[Object(P.jsx)("h5",{className:"card-title mb-0",children:e.name}),Object(P.jsxs)("p",{className:"card-text",children:[e.score," pts."]})]},c):Object(P.jsx)("div",{className:"player card mb-2",style:{backgroundColor:e.backgroundColor},children:Object(P.jsx)("h5",{className:"card-title mb-0",children:e.name})},c)}))]})}function T(e){var c=e.userid,t=e.roomid,s=e.players,a=e.question;return Object(P.jsx)("div",{className:"coontainer-fluid",children:Object(P.jsxs)("div",{className:"row",children:[Object(P.jsx)(Q,{players:s}),Object(P.jsx)(E,{userid:c,roomid:t,question:a})]})})}function E(e){var c=function(c){console.log("Submitting Answer: "+c),F.emit("submitAnswer",{roomid:e.roomid,userid:e.userid,answer:c})};return Object(P.jsxs)("div",{className:"col-10 text-center",children:[Object(P.jsx)("br",{}),Object(P.jsx)("br",{}),Object(P.jsx)("h1",{className:"display-3",style:{color:"#212121"},children:Object(P.jsxs)("strong",{children:["Question ",e.question.number]})}),Object(P.jsx)("div",{className:"row",children:Object(P.jsx)("div",{className:"col-8 offset-2",children:Object(P.jsx)("div",{className:"jumbotron",children:Object(P.jsxs)("p",{className:"lead",style:{fontSize:"25pt"},children:[" ",e.question.question," "]})})})}),Object(P.jsx)("br",{}),Object(P.jsxs)("div",{className:"row",children:[Object(P.jsx)("div",{className:"col"}),e.question.answers.slice(0,2).map((function(e,t){return Object(P.jsx)(L,{answer:e,submitAnswer:c,row:0,col:t},t)})),Object(P.jsx)("div",{className:"col"})]}),Object(P.jsx)("br",{}),Object(P.jsxs)("div",{className:"row",children:[Object(P.jsx)("div",{className:"col"}),e.question.answers.slice(2).map((function(e,t){return Object(P.jsx)(L,{answer:e,submitAnswer:c,row:1,col:t},t)})),Object(P.jsx)("div",{className:"col"})]})]})}function L(e){var c=[[0,1],[2,3]];return Object(P.jsx)("div",{className:"col-3 same-height",children:Object(P.jsx)("button",{className:"btn btn-primary btn-lg answer w-100 h-100",onClick:function(){e.submitAnswer(c[e.row][e.col])},children:e.answer})})}function H(e){return Object(P.jsxs)("div",{className:"row d-flex justify-content-center",children:[Object(P.jsx)("h2",{className:"display-3",style:{color:"#212121"},children:"Questions"}),e.questions&&e.questions.map((function(e,c){return Object(P.jsx)("div",{className:"card question mb-3 w-75",children:Object(P.jsxs)("div",{className:"card-body",children:[Object(P.jsxs)("h5",{className:"card-title mb-0",children:["Question ",e.number]}),Object(P.jsx)("p",{className:"card-text",children:e.question}),Object(P.jsx)("div",{className:"row",children:e.answers&&e.answers.map((function(c,t){return Object(P.jsxs)("div",{className:"col",children:[" ",e.correct_answer===t?Object(P.jsx)("h6",{children:c}):Object(P.jsx)("h6",{className:"text-muted",children:c})," "]},t)}))})]})},c)}))]})}function U(e){var c=e.players,t=e.toLobby,s=e.victoryStats;return Object(P.jsx)("div",{className:"coontainer-fluid",children:Object(P.jsxs)("div",{className:"row",children:[Object(P.jsx)(Q,{players:c}),Object(P.jsxs)("div",{className:"col-10 text-center",children:[Object(P.jsx)("br",{}),Object(P.jsx)("h1",{className:"display-3",style:{color:"#212121"},children:Object(P.jsx)("strong",{children:"Final Scores"})}),Object(P.jsxs)("div",{className:"col-xs-12",style:{height:"20px"},children:[Object(P.jsx)("br",{}),Object(P.jsx)(z,{podium:s.podium}),Object(P.jsx)("br",{}),Object(P.jsx)("button",{type:"submit",className:"btn btn-dark text-nowrap w-75",onClick:function(){t()},children:"Return to Lobby"}),Object(P.jsx)("div",{className:"col-xs-12",style:{height:"20px"}}),Object(P.jsx)(H,{questions:s.questions})]})]})]})})}function z(e){var c=e.podium;return Object(P.jsx)("div",{className:"row",children:Object(P.jsx)("div",{className:"row",children:c.topPlayers&&c.topPlayers.map((function(e,t){return Object(P.jsxs)("div",{div:!0,className:1===c.topPlayers.length?"row align-self-end":"col align-self-end",children:[1===c.topPlayers.length&&Object(P.jsx)("div",{className:"col"}),Object(P.jsxs)("div",{className:"col",children:[Object(P.jsxs)("div",{className:"card player",children:[Object(P.jsx)("div",{className:"col-xs-12",style:{height:e.height+"px"}}),Object(P.jsx)("h5",{className:"card-title mb-0",children:e.name}),Object(P.jsxs)("p",{className:"card-text",children:[e.score," pts."]})]}),Object(P.jsx)("div",{className:"col",children:Object(P.jsx)("h5",{children:t+1})})]}),1===c.topPlayers.length&&Object(P.jsx)("div",{className:"col"})]},t)}))})})}r.a.render(Object(P.jsx)(n.a.StrictMode,{children:Object(P.jsx)(i.a,{children:Object(P.jsxs)(j.d,{children:[Object(P.jsx)(j.b,{path:"/game/:roomId",render:function(e){return Object(P.jsx)(K,Object(s.a)({},e))}}),Object(P.jsx)(j.b,{path:"/",children:Object(P.jsx)(D,{})})]})})}),document.getElementById("root")),o()},99:function(e,c,t){}},[[160,1,2]]]);
//# sourceMappingURL=main.f9c1a555.chunk.js.map