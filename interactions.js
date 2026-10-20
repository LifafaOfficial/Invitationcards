/* LIFAFA ENGINES — interaction types + timeline for sound/haptics. */
(function(){
"use strict";
const el=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x)e.innerHTML=x;return e};
function confetti(host,reduced){
  if(reduced)return;const cols=["#f4b942","#d6246e","#6fd3c0","#8a5cf6","#fff"];
  for(let i=0;i<48;i++){const s=el("span","confetto");
    s.style.cssText=`left:50%;top:45%;background:${cols[i%5]};--x:${(Math.random()-.5)*340}px;--y:${-60-Math.random()*260}px;--r:${Math.random()*720}deg;animation-delay:${Math.random()*.15}s`;
    host.appendChild(s);setTimeout(()=>s.remove(),2200);}
}
function play(name){try{window.LifafaAudio&&LifafaAudio.play(name)}catch(e){}}
function hap(name){try{window.LifafaHaptics&&LifafaHaptics.pulse(name)}catch(e){}}
function hapSeq(list){try{window.LifafaHaptics&&LifafaHaptics.schedule(list)}catch(e){}}
function clearH(){try{window.LifafaHaptics&&LifafaHaptics.clear()}catch(e){}}

const E={
candles(stage,inv,api){
  const n=inv.interaction.config.candles||5;
  const wrap=el("div","cakewrap");
  const cake=el("button","cake");cake.type="button";cake.setAttribute("aria-label","Blow out the candles");
  let c="<div class='candles'>";for(let i=0;i<n;i++)c+=`<i class="candle" style="--d:${i*.17}s"><b class="flame"></b></i>`;
  cake.innerHTML=c+"</div><div class='tier t1'></div><div class='tier t2'></div><div class='plate'></div>";
  const hint=el("p","hint","Tap the cake to blow out the candles");
  const msg=el("div","reveal","<h2>Happy Birthday, <span data-f='name'></span>!</h2><p data-f='message'></p><p class='when'>Party on <span data-f='date'></span></p>");
  wrap.append(msg,cake,hint);stage.appendChild(wrap);
  cake.addEventListener("click",()=>{if(wrap.classList.contains("done"))return;
    wrap.classList.add("done");hint.textContent="Wish made!";
    play("blow");hapSeq([{at:0,pattern:"soft"},{at:200,pattern:"soft"},{at:500,pattern:"celebrate"}]);
    setTimeout(()=>{confetti(stage,api.reduced);play("success")},api.reduced?0:500);});
},
envelope(stage,inv,api){
  const w=el("div","env");
  w.innerHTML=`<div class="card2"><p class="kicker">Together with their families</p><h2 data-f="name"></h2><p data-f="message"></p><p class="when"><span data-f="date"></span><br><span data-f="venue"></span></p></div><div class="pocket"></div><div class="flap"></div>`;
  const seal=el("button","seal",inv.interaction.config.seal||"L");seal.type="button";seal.setAttribute("aria-label","Break the wax seal to open");
  const hint=el("p","hint","Tap the seal to open");
  w.appendChild(seal);stage.append(w,hint);
  seal.addEventListener("click",()=>{if(w.classList.contains("open"))return;
    seal.classList.add("broken");play("crack");hap("crack");
    setTimeout(()=>{w.classList.add("open");hint.textContent="";play("paper");hap("open")},api.reduced?0:350);});
},
scratch(stage,inv,api){
  const w=el("div","scratchwrap");
  w.innerHTML=`<div class="prize"><p class="kicker">Congratulations</p><h2 data-f="name"></h2><p class="big" data-f="degree"></p><p data-f="message"></p></div>`;
  const cv=el("canvas","foil");cv.setAttribute("aria-label","Scratch surface");w.appendChild(cv);
  const btn=el("button","btn","Reveal without scratching");btn.type="button";
  stage.append(w,el("p","hint","Scratch the gold with your finger"),btn);
  const reveal=()=>{if(w.classList.contains("shown"))return;w.classList.add("shown");play("success");hap("reveal");confetti(stage,api.reduced);btn.hidden=true};
  btn.addEventListener("click",reveal);
  requestAnimationFrame(()=>{
    const r=w.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);
    cv.width=r.width*dpr;cv.height=r.height*dpr;const x=cv.getContext("2d");x.scale(dpr,dpr);
    const g=x.createLinearGradient(0,0,r.width,r.height);g.addColorStop(0,"#f4d27a");g.addColorStop(.5,"#fff0b8");g.addColorStop(1,"#d9a441");
    x.fillStyle=g;x.fillRect(0,0,r.width,r.height);x.fillStyle="#7a5a12";x.font="italic 22px Georgia,serif";x.textAlign="center";x.fillText("scratch here",r.width/2,r.height/2);
    x.globalCompositeOperation="destination-out";let down=false,k=0;
    const dot=e=>{const b=cv.getBoundingClientRect();x.beginPath();x.arc(e.clientX-b.left,e.clientY-b.top,22,0,7);x.fill();
      if(++k%12===0)play("scratch");
      if(++k%8===0){const d=x.getImageData(0,0,cv.width,cv.height).data;let c=0,t=0;for(let i=3;i<d.length;i+=64){t++;if(!d[i])c++}
        if(c/t>(inv.interaction.config.reveal||.5))reveal();}};
    cv.addEventListener("pointerdown",e=>{down=true;cv.setPointerCapture(e.pointerId);dot(e)});
    cv.addEventListener("pointermove",e=>{if(down)dot(e)});
    cv.addEventListener("pointerup",()=>down=false);
  });
},
balloons(stage,inv,api){
  const n=inv.interaction.config.count||6;
  const wrap=el("div","ballwrap");
  const sky=el("div","ballsky");
  const msg=el("div","reveal ballmsg","<h2>Happy Birthday, <span data-f='name'></span>!</h2><p data-f='message'></p><p class='when'><span data-f='date'></span> · <span data-f='venue'></span></p>");
  const hint=el("p","hint","Pop every balloon to reveal the invite");
  const cols=["#ff6b9d","#6fd3c0","#f4b942","#8a5cf6","#ff8a65","#4fc3f7"];
  let left=n;
  for(let i=0;i<n;i++){
    const b=el("button","balloon");b.type="button";b.setAttribute("aria-label","Pop balloon "+(i+1));
    b.style.cssText=`--c:${cols[i%cols.length]};--x:${(i-(n-1)/2)*18}%;--d:${i*.12}s`;
    b.innerHTML="<span class='bbody'></span><span class='bstr'></span>";
    b.addEventListener("click",()=>{if(b.classList.contains("popped"))return;
      b.classList.add("popped");play("pop");hap("pop");left--;
      if(left<=0){wrap.classList.add("done");hint.textContent="Party time!";confetti(stage,api.reduced);play("celebrate");hap("celebrate")}});
    sky.appendChild(b);
  }
  wrap.append(msg,sky,hint);stage.appendChild(wrap);
},
giftbox(stage,inv,api){
  const wrap=el("div","giftwrap");
  const box=el("button","gift");box.type="button";box.setAttribute("aria-label","Open the gift box");
  box.innerHTML="<div class='glid'></div><div class='gbody'><div class='gbow'></div></div><div class='gtop'></div>";
  const msg=el("div","reveal giftmsg","<p class='kicker'>A little something for</p><h2 data-f='name'></h2><p data-f='message'></p><p class='when'>Celebrate on <span data-f='date'></span></p>");
  const hint=el("p","hint","Tap the gift to open it");
  wrap.append(msg,box,hint);stage.appendChild(wrap);
  box.addEventListener("click",()=>{if(wrap.classList.contains("done"))return;
    wrap.classList.add("done");hint.textContent="Surprise!";
    hapSeq([{at:0,pattern:"gentle"},{at:400,pattern:"reveal"}]);play("paper");
    setTimeout(()=>{play("open");confetti(stage,api.reduced)},api.reduced?0:400);});
},
stars(stage,inv,api){
  const n=inv.interaction.config.count||7;
  const wrap=el("div","starwrap");
  const sky=el("div","starsky");
  const msg=el("div","reveal starmsg","<p class='kicker'>Under a sky of wishes</p><h2 data-f='name'></h2><p data-f='message'></p><p class='when'><span data-f='date'></span></p>");
  const hint=el("p","hint","Tap the stars to light them up");
  let lit=0;
  const positions=[[12,20],[78,15],[45,8],[22,55],[68,48],[35,35],[88,38]];
  for(let i=0;i<n;i++){
    const s=el("button","star");s.type="button";s.setAttribute("aria-label","Light star "+(i+1));
    const p=positions[i%positions.length];
    s.style.cssText=`left:${p[0]}%;top:${p[1]}%;--d:${i*.1}s`;
    s.innerHTML="★";
    s.addEventListener("click",()=>{if(s.classList.contains("lit"))return;
      s.classList.add("lit");play("sparkle");hap("tap");lit++;
      if(lit>=n){wrap.classList.add("done");hint.textContent="Wish granted!";play("chime");hap("success")}});
    sky.appendChild(s);
  }
  wrap.append(msg,sky,hint);stage.appendChild(wrap);
},
partyblast(stage,inv,api){
  const wrap=el("div","blastwrap");
  const scene=el("button","blastscene");scene.type="button";scene.setAttribute("aria-label","Start the party");
  scene.innerHTML="<div class='blastbanner'><span>PARTY</span></div><div class='blasttable'></div>";
  const msg=el("div","reveal blastmsg","<h2>It's <span data-f='name'></span>'s Birthday!</h2><p data-f='message'></p><p class='when'><span data-f='date'></span> · <span data-f='venue'></span></p>");
  const hint=el("p","hint","Tap to start the celebration");
  wrap.append(msg,scene,hint);stage.appendChild(wrap);
  scene.addEventListener("click",()=>{if(wrap.classList.contains("done"))return;
    wrap.classList.add("done");hint.textContent="Let's go!";play("firework");hap("burst");
    confetti(stage,api.reduced);
    if(!api.reduced)setTimeout(()=>{confetti(stage,false);play("success")},400);});
},
foldnote(stage,inv,api){
  const wrap=el("div","notewrap");
  const note=el("button","foldnote");note.type="button";note.setAttribute("aria-label","Unfold the birthday note");
  note.innerHTML=`<div class="nfront"><span class="nseal">♥</span><p>For you</p></div>
    <div class="ninside"><p class="kicker">A secret note for</p><h2 data-f="name"></h2><p data-f="message"></p><p class="when"><span data-f="date"></span></p></div>`;
  const hint=el("p","hint","Tap the note to unfold it");
  wrap.append(note,hint);stage.appendChild(wrap);
  note.addEventListener("click",()=>{if(wrap.classList.contains("done"))return;
    wrap.classList.add("done");hint.textContent="";play("paper");hap("open");setTimeout(()=>play("soft"),300);});
},
/* NEW ENGINES */
petals(stage,inv,api){
  const wrap=el("div","petalwrap");
  const flower=el("button","flower");flower.type="button";flower.setAttribute("aria-label","Open the flower");
  let petals="";for(let i=0;i<6;i++)petals+=`<span class="petal" style="--a:${i*60}deg"></span>`;
  flower.innerHTML=petals+"<span class='fcenter'></span>";
  const msg=el("div","reveal petalmsg","<h2 data-f='name'></h2><p data-f='message'></p><p class='when'><span data-f='date'></span></p>");
  const hint=el("p","hint","Tap the flower to bloom");
  wrap.append(msg,flower,hint);stage.appendChild(wrap);
  flower.addEventListener("click",()=>{if(wrap.classList.contains("done"))return;
    wrap.classList.add("done");hint.textContent="";play("whoosh");hap("gentle");setTimeout(()=>play("soft"),400);});
},
lantern(stage,inv,api){
  const wrap=el("div","lanternwrap");
  const sky=el("div","lansky");
  const n=inv.interaction.config.count||5;
  const msg=el("div","reveal lanmsg","<h2 data-f='name'></h2><p data-f='message'></p><p class='when'><span data-f='date'></span></p>");
  const hint=el("p","hint","Tap lanterns to light them");
  let lit=0;
  for(let i=0;i<n;i++){
    const L=el("button","lantern");L.type="button";L.setAttribute("aria-label","Light lantern "+(i+1));
    L.style.cssText=`--x:${10+i*18}%;--d:${i*.15}s`;
    L.innerHTML="<span class='lbody'></span><span class='lglow'></span>";
    L.addEventListener("click",()=>{if(L.classList.contains("on"))return;
      L.classList.add("on");play("soft");hap("tap");lit++;
      if(lit>=n){wrap.classList.add("done");hint.textContent="";play("chime");hap("success")}});
    sky.appendChild(L);
  }
  wrap.append(msg,sky,hint);stage.appendChild(wrap);
},
medal(stage,inv,api){
  const wrap=el("div","medalwrap");
  const m=el("button","medal");m.type="button";m.setAttribute("aria-label","Reveal the medal");
  m.innerHTML="<div class='mribbon'></div><div class='mdisc'><span class='mstar'>★</span></div>";
  const msg=el("div","reveal medalmsg","<p class='kicker'>Achievement unlocked</p><h2 data-f='name'></h2><p class='big' data-f='degree'></p><p data-f='message'></p>");
  const hint=el("p","hint","Tap the medal to reveal");
  wrap.append(msg,m,hint);stage.appendChild(wrap);
  m.addEventListener("click",()=>{if(wrap.classList.contains("done"))return;
    wrap.classList.add("done");hint.textContent="";play("success");hap("reveal");confetti(stage,api.reduced);});
},
countdown(stage,inv,api){
  const wrap=el("div","cdwrap");
  const display=el("div","cddisplay","3");
  const btn=el("button","btn primary","Start countdown");btn.type="button";
  const msg=el("div","reveal cdmsg","<h2 data-f='name'></h2><p data-f='message'></p><p class='when'><span data-f='date'></span> · <span data-f='venue'></span></p>");
  const hint=el("p","hint","Tap to count down to the big day");
  wrap.append(msg,display,btn,hint);stage.appendChild(wrap);
  btn.addEventListener("click",()=>{if(wrap.classList.contains("done"))return;
    btn.hidden=true;let n=3;display.textContent=n;play("tap");hap("tap");
    const tick=()=>{n--;if(n>0){display.textContent=n;play("tap");hap("tap");setTimeout(tick,700)}
      else{display.textContent="♥";wrap.classList.add("done");hint.textContent="";play("chime");hap("celebrate");confetti(stage,api.reduced)}};
    setTimeout(tick,700);});
},
flipcard(stage,inv,api){
  const wrap=el("div","flipwrap");
  const card=el("button","flipcard");card.type="button";card.setAttribute("aria-label","Flip the card");
  card.innerHTML=`<div class="ffront"><p class="kicker">Tap to open</p><span class="fico">${inv.icon||"💌"}</span></div>
    <div class="fback"><h2 data-f="name"></h2><p data-f="message"></p><p class="when"><span data-f="date"></span></p></div>`;
  const hint=el("p","hint","Tap the card to flip");
  wrap.append(card,hint);stage.appendChild(wrap);
  card.addEventListener("click",()=>{if(wrap.classList.contains("done"))return;
    wrap.classList.add("done");hint.textContent="";play("paper");hap("open");});
},
fireworks(stage,inv,api){
  const wrap=el("div","fwwrap");
  const sky=el("button","fwsky");sky.type="button";sky.setAttribute("aria-label","Launch fireworks");
  sky.innerHTML="<span class='fwprompt'>✨ Launch ✨</span>";
  const msg=el("div","reveal fwmsg","<h2 data-f='name'></h2><p data-f='message'></p><p class='when'><span data-f='date'></span></p>");
  const hint=el("p","hint","Tap the sky to celebrate");
  wrap.append(msg,sky,hint);stage.appendChild(wrap);
  sky.addEventListener("click",()=>{if(wrap.classList.contains("done"))return;
    wrap.classList.add("done");hint.textContent="";
    play("firework");hap("burst");
    for(let i=0;i<3;i++)setTimeout(()=>{confetti(stage,api.reduced);play("firework");hap("pop")},i*350);
    setTimeout(()=>play("success"),1100);});
},
hearts(stage,inv,api){
  const wrap=el("div","heartwrap");
  const n=inv.interaction.config.count||5;
  const area=el("div","heartarea");
  const msg=el("div","reveal heartmsg","<h2 data-f='name'></h2><p data-f='message'></p><p class='when'><span data-f='date'></span></p>");
  const hint=el("p","hint","Tap the hearts");
  let hit=0;
  for(let i=0;i<n;i++){
    const h=el("button","heartbtn");h.type="button";h.textContent="♥";h.setAttribute("aria-label","Heart "+(i+1));
    h.style.cssText=`--x:${8+i*18}%;--d:${i*.1}s`;
    h.addEventListener("click",()=>{if(h.classList.contains("hit"))return;
      h.classList.add("hit");play("soft");hap("soft");hit++;
      if(hit>=n){wrap.classList.add("done");hint.textContent="";play("chime");hap("success")}});
    area.appendChild(h);
  }
  wrap.append(msg,area,hint);stage.appendChild(wrap);
},
ring(stage,inv,api){
  const wrap=el("div","ringwrap");
  const box=el("button","ringbox");box.type="button";box.setAttribute("aria-label","Open the ring box");
  box.innerHTML="<div class='rbase'></div><div class='rlid'></div><div class='rring'>◇</div>";
  const msg=el("div","reveal ringmsg","<p class='kicker'>Will you…</p><h2 data-f='name'></h2><p data-f='message'></p><p class='when'><span data-f='date'></span></p>");
  const hint=el("p","hint","Tap to open the box");
  wrap.append(msg,box,hint);stage.appendChild(wrap);
  box.addEventListener("click",()=>{if(wrap.classList.contains("done"))return;
    wrap.classList.add("done");hint.textContent="";play("open");hap("reveal");setTimeout(()=>play("sparkle"),300);});
},
photoframe(stage,inv,api){
  const wrap=el("div","framewrap");
  const frame=el("button","pframe");frame.type="button";frame.setAttribute("aria-label","Reveal the invitation");
  frame.innerHTML=`<div class="fborder"><div class="fphoto"><span class="fph">${inv.icon||"📷"}</span></div></div>`;
  const msg=el("div","reveal framemsg","<h2 data-f='name'></h2><p data-f='message'></p><p class='when'><span data-f='date'></span> · <span data-f='venue'></span></p>");
  const hint=el("p","hint","Tap the frame to reveal");
  wrap.append(msg,frame,hint);stage.appendChild(wrap);
  frame.addEventListener("click",()=>{if(wrap.classList.contains("done"))return;
    wrap.classList.add("done");hint.textContent="";play("soft");hap("gentle");});
},
rangoli(stage,inv,api){
  const wrap=el("div","rangoliwrap");
  const art=el("button","rangoli");art.type="button";art.setAttribute("aria-label","Reveal the pattern");
  art.innerHTML="<div class='rpattern'></div>";
  const msg=el("div","reveal rangmsg","<h2 data-f='name'></h2><p data-f='message'></p><p class='when'><span data-f='date'></span></p>");
  const hint=el("p","hint","Tap the rangoli to celebrate");
  wrap.append(msg,art,hint);stage.appendChild(wrap);
  art.addEventListener("click",()=>{if(wrap.classList.contains("done"))return;
    wrap.classList.add("done");hint.textContent="";play("chime");hap("celebrate");confetti(stage,api.reduced);});
}};
window.LifafaEngines=E;
window.LifafaClearHaptics=clearH;
})();
