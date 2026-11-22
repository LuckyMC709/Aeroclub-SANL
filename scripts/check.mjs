import {readFile,stat} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {parts,systems,questions,stageParts,emergencyParts,sources} from '../docs/data/content.js';
const ids=new Set(parts.map(p=>p.id));assert.equal(ids.size,parts.length);
for(const p of parts){assert.ok(sources[p.source]);assert.ok(p.title&&p.explanation&&p.media);for(const r of p.related)assert.ok(ids.has(r),r);}
for(const s of systems)for(const [id]of s.nodes)assert.ok(ids.has(id),id);
for(const q of questions){assert.ok(q.answer>=0&&q.answer<q.options.length);assert.ok(ids.has(q.part));}
for(const group of stageParts)for(const id of group)assert.ok(ids.has(id));
for(const id of emergencyParts)assert.ok(ids.has(id));
for(const [file,count]of [['stages',15],['emergencies',14]]){const data=JSON.parse(await readFile(`docs/data/${file}.json`,'utf8'));assert.equal(data.length,count);for(const [i,s]of data.entries()){assert.equal(s.id,String(i+1));assert.ok(s.text.length>0);await stat('docs/'+s.source);}}
for(const path of ['index.html','app.js','viewer3d.js','diagrams.js','style.css','labs.css','instruments.js','cockpit.js','aero.js','systems.js','data/lvlls.js','vendor/three.module.min.js','vendor/three.core.min.js','vendor/OrbitControls.js','vendor/THREE-LICENSE.txt'])await stat('docs/'+path);
// Datos del LV-LLS: fuentes válidas y coherencia de los arcos del Manual
const {partFacts,refs,speeds,stallByBank,facts}=await import('../docs/data/lvlls.js');
for(const [id,list] of Object.entries(partFacts)){assert.ok(ids.has(id),'partFacts: '+id);for(const [,,src] of list)assert.ok(refs[src],'fuente desconocida '+src);}
for(const f of facts)assert.ok(refs[f[3]],'fuente desconocida '+f[3]);
const a=speeds.arcs;assert.ok(a.white[0]<a.green[0]&&a.green[1]===a.yellow[0]&&a.yellow[1]===a.red&&a.red===speeds.vne);
assert.equal(stallByBank.bank.length,stallByBank.flapsUp.length);
// La tabla del Manual sigue la ley 1/√cos(inclinación) dentro de 1,5 mph
stallByBank.bank.forEach((b,i)=>assert.ok(Math.abs(stallByBank.flapsUp[0]/Math.sqrt(Math.cos(b*Math.PI/180))-stallByBank.flapsUp[i])<1.5,'tabla de pérdida '+b));
// Cada sistema de content.js tiene su diagrama animado
const sysSrc=await readFile('docs/systems.js','utf8');const sysMap=sysSrc.match(/const SYS = \{([^}]*)\}/)[1];for(const s of systems)assert.ok(new RegExp('\\b'+s.id+':').test(sysMap),'sistema sin diagrama: '+s.id);
console.log(`PASS: ${parts.length} fichas, ${systems.length} sistemas animados, ${questions.length} preguntas, 15 etapas, 14 emergencias, ${Object.keys(partFacts).length} fichas con datos del LV-LLS y enlaces internos.`);
