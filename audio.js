/* LIFAFA AUDIO — Web Audio synth effects. Off by default until user enables. */
(function(){
"use strict";
let ctx=null, master=null, enabled=false;
function ac(){if(!ctx){ctx=new(window.AudioContext||window.webkitAudioContext)();master=ctx.createGain();master.gain.value=.35;master.connect(ctx.destination)}if(ctx.state==="suspended")ctx.resume();return ctx}
function env(g,t,a=.01,d=.15,s=.0,r=.2){const now=t;g.gain.setValueAtTime(0,now);g.gain.linearRampToValueAtTime(.9,now+a);g.gain.linearRampToValueAtTime(s,now+a+d);g.gain.exponentialRampToValueAtTime(.001,now+a+d+r)}
function noise(dur){const c=ac(),buf=c.createBuffer(1,c.sampleRate*dur,c.sampleRate),d=buf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;const s=c.createBufferSource();s.buffer=buf;return s}
const FX={
  tap(){if(!enabled)return;const c=ac(),o=c.createOscillator(),g=c.createGain();o.type="sine";o.frequency.value=880;g.gain.value=.15;env(g,c.currentTime,.005,.04,0,.05);o.connect(g);g.connect(master);o.start();o.stop(c.currentTime+.1)},
  pop(){if(!enabled)return;const c=ac(),o=c.createOscillator(),g=c.createGain(),n=noise(.08),ng=c.createGain();o.type="triangle";o.frequency.setValueAtTime(400,c.currentTime);o.frequency.exponentialRampToValueAtTime(80,c.currentTime+.1);g.gain.value=.4;env(g,c.currentTime,.001,.08,0,.05);ng.gain.value=.25;env(ng,c.currentTime,.001,.06,0,.04);const f=c.createBiquadFilter();f.type="bandpass";f.frequency.value=1200;n.connect(f);f.connect(ng);ng.connect(master);o.connect(g);g.connect(master);o.start();n.start();o.stop(c.currentTime+.15);n.stop(c.currentTime+.1)},
  crack(){if(!enabled)return;const c=ac(),n=noise(.12),g=c.createGain(),f=c.createBiquadFilter();f.type="highpass";f.frequency.value=800;g.gain.value=.35;env(g,c.currentTime,.001,.05,0,.08);n.connect(f);f.connect(g);g.connect(master);n.start();n.stop(c.currentTime+.12)},
  paper(){if(!enabled)return;const c=ac(),n=noise(.25),g=c.createGain(),f=c.createBiquadFilter();f.type="bandpass";f.frequency.value=1800;f.Q.value=0.5;g.gain.value=.18;env(g,c.currentTime,.02,.15,.05,.12);n.connect(f);f.connect(g);g.connect(master);n.start();n.stop(c.currentTime+.3)},
  open(){if(!enabled)return;const c=ac(),o=c.createOscillator(),g=c.createGain();o.type="sine";o.frequency.setValueAtTime(220,c.currentTime);o.frequency.linearRampToValueAtTime(440,c.currentTime+.25);g.gain.value=.2;env(g,c.currentTime,.02,.2,.1,.2);o.connect(g);g.connect(master);o.start();o.stop(c.currentTime+.45)},
  sparkle(){if(!enabled)return;const c=ac();[0,.05,.1].forEach((d,i)=>{const o=c.createOscillator(),g=c.createGain();o.type="sine";o.frequency.value=1200+i*400;g.gain.value=.12;env(g,c.currentTime+d,.005,.06,0,.08);o.connect(g);g.connect(master);o.start(c.currentTime+d);o.stop(c.currentTime+d+.15)})},
  whoosh(){if(!enabled)return;const c=ac(),n=noise(.35),g=c.createGain(),f=c.createBiquadFilter();f.type="lowpass";f.frequency.setValueAtTime(400,c.currentTime);f.frequency.linearRampToValueAtTime(2000,c.currentTime+.2);g.gain.value=.22;env(g,c.currentTime,.05,.2,.05,.15);n.connect(f);f.connect(g);g.connect(master);n.start();n.stop(c.currentTime+.4)},
  chime(){if(!enabled)return;const c=ac();[523,659,784].forEach((f,i)=>{const o=c.createOscillator(),g=c.createGain();o.type="sine";o.frequency.value=f;g.gain.value=.14;env(g,c.currentTime+i*.08,.01,.3,.05,.35);o.connect(g);g.connect(master);o.start(c.currentTime+i*.08);o.stop(c.currentTime+i*.08+.6)})},
  soft(){if(!enabled)return;const c=ac(),o=c.createOscillator(),g=c.createGain();o.type="sine";o.frequency.value=330;g.gain.value=.12;env(g,c.currentTime,.03,.25,.05,.3);o.connect(g);g.connect(master);o.start();o.stop(c.currentTime+.5)},
  success(){if(!enabled)return;const c=ac();[392,523,659].forEach((f,i)=>{const o=c.createOscillator(),g=c.createGain();o.type="triangle";o.frequency.value=f;g.gain.value=.18;env(g,c.currentTime+i*.1,.01,.2,.08,.25);o.connect(g);g.connect(master);o.start(c.currentTime+i*.1);o.stop(c.currentTime+i*.1+.5)})},
  scratch(){if(!enabled)return;const c=ac(),n=noise(.06),g=c.createGain(),f=c.createBiquadFilter();f.type="bandpass";f.frequency.value=2500;f.Q.value=2;g.gain.value=.12;env(g,c.currentTime,.001,.04,0,.03);n.connect(f);f.connect(g);g.connect(master);n.start();n.stop(c.currentTime+.07)},
  blow(){if(!enabled)return;const c=ac(),n=noise(.4),g=c.createGain(),f=c.createBiquadFilter();f.type="lowpass";f.frequency.setValueAtTime(600,c.currentTime);f.frequency.exponentialRampToValueAtTime(100,c.currentTime+.35);g.gain.value=.2;env(g,c.currentTime,.05,.25,.05,.15);n.connect(f);f.connect(g);g.connect(master);n.start();n.stop(c.currentTime+.45)},
  firework(){if(!enabled)return;const c=ac(),o=c.createOscillator(),g=c.createGain(),n=noise(.2),ng=c.createGain();o.type="sine";o.frequency.setValueAtTime(800,c.currentTime);o.frequency.exponentialRampToValueAtTime(100,c.currentTime+.3);g.gain.value=.25;env(g,c.currentTime,.01,.15,0,.2);ng.gain.value=.3;env(ng,c.currentTime+.05,.001,.15,0,.1);const f=c.createBiquadFilter();f.type="highpass";f.frequency.value=400;n.connect(f);f.connect(ng);ng.connect(master);o.connect(g);g.connect(master);o.start();n.start(c.currentTime+.05);o.stop(c.currentTime+.35);n.stop(c.currentTime+.25)}
};
window.LifafaAudio={
  setEnabled(v){enabled=!!v;if(enabled)ac()},
  isEnabled(){return enabled},
  play(name){const fn=FX[name];if(fn)try{fn()}catch(e){}},
  unlock(){try{ac()}catch(e){}}
};
})();
