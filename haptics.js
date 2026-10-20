/* LIFAFA HAPTICS — navigator.vibrate patterns, timeline-synced. Optional, off by default. */
(function(){
"use strict";
const supported=typeof navigator!=="undefined"&&typeof navigator.vibrate==="function";
let enabled=false, timers=[];
const P={
  tap:[12],
  soft:[20],
  double:[14,40,14],
  crack:[8,30,18],
  open:[25],
  pop:[10],
  celebrate:[15,50,15,50,25],
  reveal:[30,40,15],
  rhythm:[12,80,12,80,12,80,20],
  gentle:[18,60,12],
  burst:[8,30,8,30,8,30,8,30,20],
  success:[20,40,20,40,35]
};
function clear(){timers.forEach(clearTimeout);timers=[];if(supported)try{navigator.vibrate(0)}catch(e){}}
function pulse(name){if(!enabled||!supported)return;const pat=P[name]||P.tap;try{navigator.vibrate(pat)}catch(e){}}
function schedule(list){/* list: [{at:ms, pattern:name}] */
  clear();
  if(!enabled||!supported)return;
  const t0=performance.now();
  list.forEach(({at,pattern})=>{
    const id=setTimeout(()=>pulse(pattern),Math.max(0,at));
    timers.push(id);
  });
}
window.LifafaHaptics={
  supported,setEnabled(v){enabled=!!v;if(!enabled)clear()},
  isEnabled(){return enabled},
  pulse,schedule,clear,
  profiles:P
};
})();
