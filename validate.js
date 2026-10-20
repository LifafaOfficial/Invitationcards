// Run from anywhere: node validate.js   (exit code 0 = OK, 1 = problems found)
const fs=require("fs"),path=require("path");
const CATALOGUE="data/invitations.js",ENGINES="interactions.js",w={},errs=[];
for(const f of [CATALOGUE,ENGINES]){
  try{new Function("window",fs.readFileSync(path.join(__dirname,f),"utf8"))(w)}
  catch(e){errs.push(`${f}: cannot be loaded (${e.code==="ENOENT"?"file not found":e.message})`)}}
const D=w.LIFAFA_CATALOGUE,C=Array.isArray(w.LIFAFA_CATEGORIES)?w.LIFAFA_CATEGORIES:[],E=w.LifafaEngines||{};
if(!Array.isArray(D))errs.push(`${CATALOGUE}: LIFAFA_CATALOGUE must be an array`);
if(!C.length)errs.push(`${CATALOGUE}: LIFAFA_CATEGORIES missing or empty`);
const ids=new Set(),isObj=v=>v&&typeof v==="object"&&!Array.isArray(v);
(Array.isArray(D)?D:[]).forEach((i,n)=>{
  const p=`#${n+1} ${i&&i.id?i.id:"(no id)"}`;
  if(!isObj(i)){errs.push(`#${n+1}: record is not an object`);return}
  ["id","title","category","description","style","icon","collection"].forEach(k=>{if(typeof i[k]!=="string"||!i[k].trim())errs.push(`${p}: missing or empty "${k}"`)});
  if(typeof i.id==="string"&&i.id){if(ids.has(i.id))errs.push(`${p}: duplicate id`);ids.add(i.id);if(!/^[a-z0-9-]+$/.test(i.id))errs.push(`${p}: id must use lowercase letters, numbers and dashes only`)}
  if(i.category&&!C.some(c=>c.slug===i.category))errs.push(`${p}: unknown category "${i.category}"`);
  if(!Array.isArray(i.tags)||!i.tags.length)errs.push(`${p}: "tags" must be a non-empty array`);
  if(!Array.isArray(i.palette)||i.palette.length<2)errs.push(`${p}: "palette" must be an array of 2 colours`);
  if(!isObj(i.interaction)||!i.interaction.type)errs.push(`${p}: "interaction" must be an object with a "type"`);
  else if(!E[i.interaction.type])errs.push(`${p}: unknown interaction type "${i.interaction.type}"`);
  if(!Array.isArray(i.fields))errs.push(`${p}: "fields" must be an array (use [] if none)`);
  else{const keys=new Set();i.fields.forEach((f,k)=>{
    if(!isObj(f)||!f.key||!f.label||!f.max||f.default==null){errs.push(`${p}: field #${k+1} needs key, label, max and default`);return}
    if(String(f.default).length>f.max)errs.push(`${p}: default for "${f.key}" is longer than max`);
    if(keys.has(f.key))errs.push(`${p}: duplicate field key "${f.key}"`);keys.add(f.key)})}
  if(i.assets!==undefined){if(!Array.isArray(i.assets))errs.push(`${p}: "assets" must be an array`);
    else i.assets.forEach(a=>{if(!fs.existsSync(path.join(__dirname,a)))errs.push(`${p}: missing asset "${a}"`)})}
});
if(Array.isArray(D)){
  console.log(D.length+" invitations; per category:",C.map(c=>c.slug+"="+D.filter(i=>isObj(i)&&i.category===c.slug).length).join(", "));
  if(D.length!==60)errs.push("catalogue must contain exactly 60 invitations (found "+D.length+")");
  C.forEach(c=>{const n=D.filter(i=>isObj(i)&&i.category===c.slug).length;if(n!==6)errs.push('category "'+c.slug+'" must have exactly 6 designs (found '+n+')')});
}
console.log(errs.length?"FAILED:\n"+errs.join("\n"):"OK: no problems found");
process.exit(errs.length?1:0);
