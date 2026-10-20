/* LIFAFA APP — rendering, routing, theme, favourites, personalisation, ordering. */
(function(){
"use strict";
const C=window.LIFAFA_CONFIG,D=window.LIFAFA_CATALOGUE,CATS=window.LIFAFA_CATEGORIES,$=s=>document.querySelector(s);
const el=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
const store={get(k,d){try{const v=localStorage.getItem("lifafa."+k);return v==null?d:JSON.parse(v)}catch(e){return d}},
  set(k,v){try{localStorage.setItem("lifafa."+k,JSON.stringify(v))}catch(e){}}};
const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
const catName=s=>(CATS.find(c=>c.slug===s)||{}).name||s;
let favs=new Set(store.get("favs",[])),muted=store.get("muted",true),hapticOn=store.get("haptic",false),cur=null,vals={},navCount=0;

/* theme */
function setTheme(t){document.documentElement.dataset.theme=t;store.set("theme",t);$("#themeBtn").title=t==="glass"?"Switch to Neomorphism":"Switch to Liquid Glass"}
setTheme(store.get("theme",C.DEFAULT_THEME));
$("#themeBtn").onclick=()=>setTheme(document.documentElement.dataset.theme==="glass"?"neo":"glass");

/* contact links */
const waOK=/^\d{8,15}$/.test(C.WHATSAPP_NUMBER),waBase=waOK?"https://wa.me/"+C.WHATSAPP_NUMBER:"https://wa.me/";
$("#igLink").href=C.INSTAGRAM_URL;$("#waLink").href=waBase;
$("#contactBtn").href=waBase+"?text="+encodeURIComponent("Hi "+C.BRAND+"! I'd like to know more about your invitations.");

/* sound + haptics: separate toggles, both off by default until user enables */
function syncAudio(){try{window.LifafaAudio&&LifafaAudio.setEnabled(!muted)}catch(e){}}
function syncHaptics(){try{window.LifafaHaptics&&LifafaHaptics.setEnabled(!!hapticOn)}catch(e){}}
function clearHaptics(){try{window.LifafaHaptics&&LifafaHaptics.clear()}catch(e){}try{window.LifafaClearHaptics&&LifafaClearHaptics()}catch(e){}}
function sound(){if(muted)return;try{if(window.LifafaAudio){LifafaAudio.play("tap");return}
  const a=new(window.AudioContext||window.webkitAudioContext)(),o=a.createOscillator(),g=a.createGain();
  o.frequency.value=660;g.gain.setValueAtTime(.12,a.currentTime);g.gain.exponentialRampToValueAtTime(.001,a.currentTime+.35);o.connect(g);g.connect(a.destination);o.start();o.stop(a.currentTime+.35)}catch(e){}}
syncAudio();syncHaptics();
function toast(m){const t=$("#toast");t.textContent=m;t.classList.add("on");clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove("on"),2400)}

/* WhatsApp: a real link click is the most reliable way to open wa.me on phones and desktop,
   and it never reports a false "pop-up blocked" because we don't inspect window.open's result. */
function openWA(url){const a=document.createElement("a");a.href=url;a.target="_blank";a.rel="noopener noreferrer";document.body.appendChild(a);a.click();a.remove();toast("Opening WhatsApp…")}

/* cards */
function card(inv){
  const c=el("article","card surface");
  const a=el("a","clink");a.href="#/i/"+inv.id;a.setAttribute("aria-label","Open "+inv.title);
  const th=el("div","thumb");
  th.style.setProperty("--a",inv.palette[0]);th.style.setProperty("--b",inv.palette[1]);
  th.style.background=`linear-gradient(165deg,${inv.palette[0]} 0%,${inv.palette[1]} 100%)`;
  const art=el("div","thumb-art");
  const ink=(()=>{try{const h=inv.palette[1].replace("#","");const n=parseInt(h.length===3?h[0]+h[0]+h[1]+h[1]+h[2]+h[2]:h,16);const r=(n>>16)&255,g=(n>>8)&255,b=n&255;return (0.299*r+0.587*g+0.114*b)<140?"#F7F5F0":"#191919"}catch(e){return"#191919"}})();
  art.style.color=ink;
  art.append(el("p","t-kicker",catName(inv.category)),el("p","t-title",inv.title),el("div","t-line"),el("span","t-ico",inv.icon));
  th.append(art);
  const b=el("div","badges");if(inv.isNew)b.append(el("em","badge","New"));if(inv.featured)b.append(el("em","badge alt","Featured"));
  a.append(th,el("h3",null,inv.title),el("p","muted",catName(inv.category)));
  const f=el("button","fav",favs.has(inv.id)?"♥":"♡");f.setAttribute("aria-label","Favourite "+inv.title);f.setAttribute("aria-pressed",favs.has(inv.id));
  f.onclick=()=>{toggleFav(inv.id);renderAll()};
  c.append(a,b,f);return c;
}
function fill(host,list,empty){host.replaceChildren();if(!list.length){host.append(el("p","empty surface pad",empty||"Nothing here yet."));return}list.forEach(i=>host.append(card(i)))}
function toggleFav(id){favs.has(id)?favs.delete(id):favs.add(id);store.set("favs",[...favs]);if(cur&&cur.id===id)syncFav()}

/* home */
const F={q:"",c:"",s:"",o:"featured",fav:false};
function renderAll(){
  fill($("#featured"),D.filter(i=>i.featured));
  fill($("#newest"),D.filter(i=>i.isNew));
  const cg=$("#cats");cg.replaceChildren();
  CATS.forEach(c=>{const n=D.filter(i=>i.category===c.slug).length,a=el("a","cat surface");a.href="#/c/"+c.slug;a.append(el("b",null,c.name),el("span","muted",n+(n===1?" design":" designs")));cg.append(a)});
  const q=F.q.trim().toLowerCase();
  let r=D.filter(i=>(!F.c||i.category===F.c)&&(!F.s||i.style===F.s)&&(!F.fav||favs.has(i.id))&&(!q||(i.title+" "+i.description+" "+i.tags.join(" ")).toLowerCase().includes(q)));
  r.sort((a,b)=>F.o==="new"?b.collection.localeCompare(a.collection):(b.featured-a.featured));
  $("#count").textContent=r.length+" design"+(r.length===1?"":"s");
  fill($("#results"),r,F.fav&&!favs.size?"No favourites yet. Tap ♡ on a design to save it.":"No designs match. Try a different word or clear the filters.");
}
function initFilters(){
  $("#fc").append(new Option("All occasions",""));CATS.forEach(c=>$("#fc").append(new Option(c.name,c.slug)));
  $("#fs").append(new Option("All styles",""));[...new Set(D.map(i=>i.style))].forEach(s=>$("#fs").append(new Option(s[0].toUpperCase()+s.slice(1),s)));
  $("#catnav").append(...CATS.map(c=>{const a=el("a","chip",c.name);a.href="#/c/"+c.slug;return a}));
  $("#q").oninput=e=>{F.q=e.target.value;renderAll()};
  $("#fc").onchange=e=>{F.c=e.target.value;renderAll()};$("#fs").onchange=e=>{F.s=e.target.value;renderAll()};$("#fo").onchange=e=>{F.o=e.target.value;renderAll()};
  $("#favOnly").onclick=e=>{F.fav=!F.fav;e.currentTarget.setAttribute("aria-pressed",F.fav);renderAll()};
  $("#searchBtn").onclick=()=>{$("#explore").scrollIntoView({behavior:reduced?"auto":"smooth"});$("#q").focus()};
  $("#surpriseBtn").onclick=()=>{location.hash="#/i/"+D[Math.floor(Math.random()*D.length)].id};
  $("#menuBtn").onclick=e=>{const o=document.body.classList.toggle("menu-open");e.currentTarget.setAttribute("aria-expanded",o)};
  $("#menu").onclick=()=>{document.body.classList.remove("menu-open");$("#menuBtn").setAttribute("aria-expanded","false")};
}

/* viewer */
const fmt=(f,v)=>{if(f.type==="date"&&v){const d=new Date(v+"T00:00");return isNaN(d)?v:d.toLocaleDateString(undefined,{day:"numeric",month:"long",year:"numeric"})}return v};
function refresh(){if(!cur)return;cur.fields.forEach(f=>{const v=(vals[f.key]||"").trim()||f.default;$("#stage").querySelectorAll(`[data-f="${f.key}"]`).forEach(n=>n.textContent=fmt(f,v))})}
function mount(){const s=$("#stage");s.replaceChildren();s.style.setProperty("--a",cur.palette[0]);s.style.setProperty("--b",cur.palette[1]);
  const eng=window.LifafaEngines[cur.interaction.type];
  if(!eng){s.append(el("p","empty surface pad","This design could not load."));return}
  eng(s,cur,{cfg:cur.interaction.config,reduced,sound,refresh});refresh()}
function syncFav(){const b=$("#vFav"),on=favs.has(cur.id);b.textContent=on?"♥":"♡";b.setAttribute("aria-pressed",on)}
function openViewer(inv){
  cur=inv;vals={};$("#vtitle").textContent=inv.title;document.title=inv.title+" — Lifafa";
  $("#viewer").hidden=false;document.body.classList.add("noscroll");$("#editor").hidden=true;syncFav();buildForm();mount();$("#vBack").focus();
}
function closeViewer(){if($("#viewer").hidden)return;clearHaptics();$("#viewer").hidden=true;document.body.classList.remove("noscroll");cur=null;document.title="Lifafa — Little moments. Beautifully revealed."}
function buildForm(){const f=$("#eForm");f.replaceChildren();
  cur.fields.forEach(fd=>{const l=el("label",null,fd.label),i=el(fd.type==="textarea"?"textarea":"input");
    if(fd.type==="date")i.type="date";else if(fd.type!=="textarea")i.type="text";
    i.maxLength=fd.max;i.value=fd.default;i.name=fd.key;if(fd.type==="textarea")i.rows=3;
    const cnt=el("small","muted",fd.type==="date"?"":i.value.length+"/"+fd.max);
    i.oninput=()=>{vals[fd.key]=i.value.slice(0,fd.max);cnt.textContent=fd.type==="date"?"":i.value.length+"/"+fd.max;refresh()};
    l.append(i,cnt);f.append(l)})}
$("#vEdit").onclick=()=>{$("#editor").hidden=false;const i=$("#eForm").querySelector("input,textarea");i&&i.focus()};
$("#eClose").onclick=()=>{$("#editor").hidden=true;$("#vEdit").focus()};
$("#eReset").onclick=()=>{vals={};buildForm();refresh()};
$("#vReplay").onclick=()=>{clearHaptics();mount();toast("Replaying")};
$("#vFav").onclick=()=>{toggleFav(cur.id);renderAll()};
$("#vMute").onclick=()=>{muted=!muted;store.set("muted",muted);syncAudio();const b=$("#vMute");b.textContent=muted?"🔇":"🔊";b.setAttribute("aria-pressed",!muted);b.setAttribute("aria-label",muted?"Sound off":"Sound on")};
$("#vHaptic").onclick=()=>{hapticOn=!hapticOn;store.set("haptic",hapticOn);syncHaptics();if(!hapticOn)clearHaptics();const b=$("#vHaptic");b.textContent=hapticOn?"📳":"📴";b.setAttribute("aria-pressed",hapticOn);b.setAttribute("aria-label",hapticOn?"Haptics on":"Haptics off");toast(hapticOn?"Haptics on":"Haptics off")};
$("#vBack").onclick=()=>{if(navCount>1)history.back();else location.hash="#/c/"+cur.category};
$("#vShare").onclick=async()=>{const url=location.href.split("#")[0]+"#/i/"+cur.id;
  try{if(navigator.share){await navigator.share({title:cur.title+" — Lifafa",url});return}await navigator.clipboard.writeText(url);toast("Link copied")}catch(e){if(e.name!=="AbortError")toast("Copy this link: "+url)}};
$("#vOrder").onclick=()=>{
  const L=["Hi "+C.BRAND+"! I'd like to order this invitation design:","Design: "+cur.title,"ID: "+cur.id,"Category: "+catName(cur.category)];
  const P=cur.fields.filter(f=>(vals[f.key]||"").trim()).map(f=>f.label+": "+fmt(f,vals[f.key].trim()));
  if(P.length)L.push("","My details:",...P);
  L.push("","Link: "+location.href.split("#")[0]+"#/i/"+cur.id,"Please share the next steps. Thank you!");
  openWA(waBase+"?text="+encodeURIComponent(L.join("\n")));
};
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!$("#viewer").hidden){if(!$("#editor").hidden)$("#eClose").click();else $("#vBack").click()}});

/* router */
let prevRoute="home";
function route(){
  navCount++;const h=location.hash.slice(1),m=h.match(/^\/i\/([\w-]+)$/),c=h.match(/^\/c\/([\w-]+)$/),was=prevRoute;
  if(m){prevRoute="invite";const inv=D.find(i=>i.id===m[1]);if(inv){openViewer(inv);return}closeViewer();toast("That design wasn't found.");return}
  closeViewer();
  if(c&&CATS.some(x=>x.slug===c[1])){prevRoute="category";F.c=c[1];$("#fc").value=c[1];renderAll();$("#explore").scrollIntoView({behavior:reduced?"auto":"smooth"});return}
  prevRoute="home";
  /* Home ("#/" or empty) clears a category left over from a category route. Returning from a viewer keeps the visitor's current filters. */
  if((h===""||h==="/")&&was!=="invite"&&F.c){F.c="";$("#fc").value="";renderAll();scrollTo(0,0)}
}
initFilters();renderAll();addEventListener("hashchange",route);route();
})();
