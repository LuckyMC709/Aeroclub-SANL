import * as T from './vendor/three.module.min.js';
import { OrbitControls } from './vendor/OrbitControls.js';
// Original procedural teaching model. Coordinates in approximate metres; NOT maintenance geometry.
export function createViewer(host,onSelect){
 const scene=new T.Scene();scene.background=new T.Color('#112d3b');scene.fog=new T.Fog('#112d3b',24,60);
 const renderer=new T.WebGLRenderer({antialias:true,alpha:false,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.6;
 host.append(renderer.domElement);const canvas=renderer.domElement;canvas.tabIndex=0;canvas.setAttribute('aria-label','Modelo 3D del Cherokee. Arrastrá para girar, usá dos dedos para zoom. Flechas para girar y teclas más y menos para acercar. Selección equivalente en Lista de partes.');
 const camera=new T.PerspectiveCamera(38,1,.05,100);camera.position.set(9,7,-10);
 const controls=new OrbitControls(camera,canvas);controls.target.set(0,.2,0);controls.enableDamping=false;controls.minDistance=1.3;controls.maxDistance=22;controls.maxPolarAngle=Math.PI*.86;controls.enablePan=false;controls.update();
 scene.add(new T.HemisphereLight(0xc6e8ff,0x49616a,2.4));const sun=new T.DirectionalLight(0xfff0d4,3.5);sun.position.set(-4,8,-4);scene.add(sun);const rim=new T.DirectionalLight(0x70b7e3,2);rim.position.set(5,2,6);scene.add(rim);
 const grid=new T.GridHelper(34,34,0x42616d,0x213e4b);grid.position.y=-1.2;scene.add(grid);
 const rings=new T.Mesh(new T.RingGeometry(6.2,6.22,96),new T.MeshBasicMaterial({color:0x486371,side:T.DoubleSide}));rings.rotation.x=-Math.PI/2;rings.position.y=-1.19;scene.add(rings);
 const aircraft=new T.Group();scene.add(aircraft);
 const all=[],skins=[],inside=[],paths=[],animated=[];let selected='',mode='exterior',layer='all',running=false,dead=false,raf=0,frame=0,explosion=0;
 const palette={body:0xd9e1dc,blue:0x4285a7,glass:0x214f65,dark:0x172b35,metal:0x8ba0a5,motor:0xf18e60,combustible:0xf3c05f,electrico:0x56d9c5,pitot:0xc299ff,mandos:0x77b9f2};
 function add(geo,color,pos,id,category='skin',parent=aircraft){const material=new T.MeshStandardMaterial({color,roughness:.5,metalness:.15,side:T.DoubleSide});const m=new T.Mesh(geo,material);m.position.set(...pos);m.userData={id,category,color,base:pos.slice()};parent.add(m);all.push(m);if(category==='skin')skins.push(m);else if(category!=='solid')inside.push(m);return m;}
 const box=(size,pos,id,color=palette.body,cat='skin',parent)=>add(new T.BoxGeometry(...size),color,pos,id,cat,parent);
 const sphere=(r,pos,id,color,cat='skin',parent)=>add(new T.SphereGeometry(r,20,12),color,pos,id,cat,parent);
 function rod(a,b,r,id,color,cat='solid',parent=aircraft){const va=new T.Vector3(...a),vb=new T.Vector3(...b),d=vb.clone().sub(va);const m=add(new T.CylinderGeometry(r,r,d.length(),10),color,va.add(vb).multiplyScalar(.5).toArray(),id,cat,parent);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());return m;}
 function pipe(points,id,color,cat){const curve=new T.CatmullRomCurve3(points.map(x=>new T.Vector3(...x)));const m=add(new T.TubeGeometry(curve,36,.026,6,false),color,[0,0,0],id,cat);paths.push({curve,category:cat});return m;}
 function loft(rows,id,color){const verts=[],indices=[],n=24;rows.forEach(([z,rx,ry,cy])=>{for(let j=0;j<=n;j++){const a=j/n*Math.PI*2;verts.push(Math.cos(a)*rx,Math.sin(a)*ry+cy,z);}});for(let i=0;i<rows.length-1;i++)for(let j=0;j<n;j++){const a=i*(n+1)+j,b=a+n+1;indices.push(a,b,a+1,b,b+1,a+1);}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(verts,3));g.setIndex(indices);g.computeVertexNormals();return add(g,color,[0,0,0],id);}
 loft([[-3.15,.24,.28,.3],[-2.85,.44,.38,.31],[-1.7,.49,.43,.33]],'motor',palette.body);
 loft([[-1.7,.49,.43,.33],[-1.15,.58,.57,.4],[.45,.58,.58,.43],[1.1,.46,.45,.4],[2.2,.25,.26,.3],[3.55,.07,.12,.27]],'fuselaje',palette.body);
 // Cabin roof and dark glazing, deliberately illustrative.
 loft([[-1.45,.4,.07,.9],[-.88,.48,.29,.96],[.35,.47,.26,.98],[.8,.34,.1,.88]],'cabina',palette.glass);
 box([.07,.08,1.65],[0,1.19,-.22],'cabina',palette.body);
 for(const side of [-1,1]){
  rod([side*.49,.82,-1],[side*.51,1.08,-.65],.035,'cabina',palette.body,'skin');
  rod([side*.54,.68,.25],[side*.47,1.08,.18],.035,'cabina',palette.body,'skin');
  pipe([[side*.48,.35,-2.5],[side*.6,.39,-.5],[side*.5,.4,1],[side*.12,.29,3.3]],'fuselaje',palette.blue,'skin');
 }
 // Rectangular low wings with rounded airfoil cross sections and dihedral.
 function wing(x0,x1,z0,z1,id,color,y0=-.02){const pos=[],idx=[];const shape=[[0,0],[.08,.095],[.3,.13],[.7,.075],[1,0],[.7,-.025],[.3,-.04],[.08,-.03]];for(const x of [x0,x1])for(const [c,h]of shape)pos.push(x,y0+Math.abs(x)*.09+h,z0+c*(z1-z0));for(let j=0;j<8;j++){let k=(j+1)%8;idx.push(j,k,j+8,k,k+8,j+8);}for(let j=1;j<7;j++){idx.push(0,j,j+1,8,8+j+1,8+j);}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();return add(g,color,[0,0,0],id);}
 for(const s of [-1,1]){
  wing(s*.48,s*4.57,-.85,.51,'alas',palette.body);
  wing(s*.6,s*2.65,.53,.87,'flaps',palette.blue);
  wing(s*2.68,s*4.5,.53,.87,'alerones',0xa4bec7);
  wing(s*4.48,s*4.6,-.83,.85,'alas',palette.blue);
  sphere(.06,[s*4.58,.46,-.43],'luces',s<0?0xe56c64:0x8fc49a,'solid');
  wing(s*.12,s*1.57,2.64,3.35,'cola',palette.body,.17);
  wing(s*.15,s*1.57,3.35,3.48,'cola',palette.blue,.17);
 }
 // Vertical fin shape in the Y/Z plane, extruded across X.
 const shape=new T.Shape();shape.moveTo(2.3,.35);shape.lineTo(3.05,1.65);shape.lineTo(3.5,1.65);shape.lineTo(3.58,.3);shape.closePath();
 const finGeo=new T.ExtrudeGeometry(shape,{depth:.12,bevelEnabled:false});finGeo.rotateY(-Math.PI/2);finGeo.translate(.06,0,0);add(finGeo,palette.body,[0,0,0],'cola');
 box([.13,1.08,.13],[0,.92,3.5],'cola',palette.blue);
 // Fixed tricycle gear, with separate wheels and brake discs.
 for(const [x,z]of [[-1.45,.15],[1.45,.15],[0,-2.2]]){
  rod([x,Math.abs(x)*.09,z],[x,-.72,z+.08],.055,'tren',palette.metal);
  const wheel=add(new T.CylinderGeometry(.23,.23,.17,24),0x15212a,[x,-.93,z+.08],'ruedas','solid');wheel.rotation.z=Math.PI/2;
  const hub=add(new T.CylinderGeometry(.105,.105,.18,20),palette.metal,[x,-.93,z+.08],'frenos','solid');hub.rotation.z=Math.PI/2;
 }
 const prop=new T.Group();prop.position.set(0,.3,-3.33);aircraft.add(prop);
 const spinner=add(new T.ConeGeometry(.2,.4,24),palette.body,[0,0,-.12],'helice','solid',prop);spinner.rotation.x=-Math.PI/2;
 for(const s of [-1,1]){const blade=box([.12,.92,.055],[0,s*.52,0],'helice',palette.dark,'solid',prop);blade.rotation.z=-.18;box([.13,.12,.06],[s*.08,s*.94,0],'helice',0xf0bc6a,'solid',prop);}
 // Internal engine: crankcase, four horizontally opposed cylinders, ignition and exhaust.
 box([.48,.42,.9],[0,.3,-2.3],'motor',palette.metal,'motor');
 for(const s of [-1,1])for(const z of [-2.57,-2.05]){
  rod([s*.18,.34,z],[s*.53,.34,z],.16,'motor',palette.motor,'motor');
  for(let j=0;j<5;j++){const f=add(new T.CylinderGeometry(.18,.18,.025,14),palette.metal,[s*(.23+j*.055),.34,z],'motor','motor');f.rotation.z=Math.PI/2;}
  pipe([[s*.44,.29,z],[s*.44,-.06,z],[s*.2,-.15,-1.8]],'motor',0xc48362,'motor');
 }
 rod([0,.3,-2.85],[0,.3,-3.32],.06,'motor',palette.motor,'motor');
 // Two tanks and functional route. Tube routing is illustrative.
 for(const s of [-1,1]){
  const tank=box([1.25,.18,.73],[s*1.45,.19,-.32],'combustible',palette.combustible,'combustible');tank.rotation.z=s*.09;
  pipe([[s*1.45,.24,-.32],[s*.7,.15,-.3],[s*.18,.1,-.05],[0,.1,-.8]],'combustible',palette.combustible,'combustible');
 }
 sphere(.12,[0,.1,-.8],'combustible',palette.combustible,'combustible');
 pipe([[0,.1,-.8],[-.25,.04,-1.5],[-.27,.06,-1.8],[0,.04,-2.2]],'combustible',palette.combustible,'combustible');
 for(const z of [-1.5,-1.8])box([.16,.18,.18],[-.25,.07,z],'combustible',palette.combustible,'combustible');
 // Panel, seats, yokes and radios, visible when cabin/open shell is selected.
 box([1.02,.4,.07],[0,.65,-1.1],'instrumentos',palette.dark,'cabina');
 for(const x of [-.34,-.12,.1])for(const y of [.59,.77]){const gauge=add(new T.CylinderGeometry(.07,.07,.025,24),0xd5e8df,[x,y,-1.05],'instrumentos','cabina');gauge.rotation.x=Math.PI/2;rod([x,y,-1.025],[x+.03,y+.025,-1.025],.007,'instrumentos',palette.dark,'cabina');}
 box([.2,.18,.07],[.35,.69,-1.04],'radio',0x54b0b2,'cabina');
 for(const x of [-.28,.28]){
  box([.36,.12,.42],[x,.2,-.18],'cabina',0x936747,'cabina');box([.36,.5,.1],[x,.45,.08],'cabina',0x936747,'cabina');
  rod([x,.48,-1],[x,.48,-.65],.025,'controles',palette.metal,'cabina');rod([x-.12,.48,-.65],[x+.12,.48,-.65],.025,'controles',palette.metal,'cabina');
  for(const dx of [-.09,.09])box([.11,.04,.18],[x+dx,.03,-.85],'controles',palette.metal,'cabina');
 }
 // Electrical model: battery, alternator and illustrative parallel loads.
 box([.33,.25,.3],[0,.03,1.1],'electrico',palette.electrico,'electrico');
 sphere(.13,[.23,.4,-2.75],'electrico',palette.electrico,'electrico');
 pipe([[0,.12,1.1],[.35,.2,.8],[.4,.35,-1],[.23,.4,-2.75]],'electrico',palette.electrico,'electrico');
 for(const s of [-1,1])pipe([[.35,.4,-1],[s*.5,.18,0],[s*4.5,.43,-.43]],'luces',palette.electrico,'electrico');
 pipe([[.35,.4,-1],[.2,.3,1],[0,.4,3.4]],'luces',palette.electrico,'electrico');
 // General pitot-static system: distinct total and static pressure paths to panel.
 pipe([[-2.8,.1,-.9],[-2.8,-.16,-.6],[-2.8,.19,-.2],[-.65,.1,-.2],[-.4,.64,-1.03]],'pitot',palette.pitot,'pitot');
 pipe([[-.52,.42,.35],[-.4,.3,0],[-.23,.6,-1.03]],'pitot',0xf4a4dc,'pitot');
 sphere(.07,[-2.8,.1,-.9],'pitot',palette.pitot,'pitot');
 // Control cable relationships.
 for(const s of [-1,1])pipe([[s*.25,.45,-.7],[s*.35,.12,-.2],[s*3.5,.37,.62]],'alerones',palette.mandos,'mandos');
 for(const y of [.08,.2])pipe([[0,y,-.8],[0,y,1.7],[0,.3,3.1]],'cola',palette.mandos,'mandos');
 // Componentes con nombre propio (ubicaciones según Owner's Handbook / lista del aeroclub; posiciones aproximadas).
 palette.vacio=0x9fd36a;
 const cyl=(r,h,pos,id,color,cat,axis='y')=>{const m=add(new T.CylinderGeometry(r,r,h,16),color,pos,id,cat);if(axis==='x')m.rotation.z=Math.PI/2;if(axis==='z')m.rotation.x=Math.PI/2;return m;};
 const carb=box([.16,.14,.14],[0,-.02,-2.22],'motor',0xd9a35c,'combustible');
 cyl(.06,.12,[-.14,.5,-1.86],'motor',palette.motor,'motor','z');cyl(.06,.12,[.14,.5,-1.86],'motor',palette.motor,'motor','z');
 cyl(.07,.1,[.18,.28,-1.86],'vacio',palette.vacio,'vacio','z');
 pipe([[.18,.28,-1.82],[.3,.55,-1.5],[-.12,.66,-1.12]],'vacio',palette.vacio,'vacio');
 cyl(.045,.12,[-.3,.62,-1.78],'frenos',0x8fb7c9,'mandos');
 pipe([[-.3,.56,-1.78],[-.2,.25,-1.3],[-.5,-.05,-.4],[-1.45,-.6,.12]],'frenos',0x8fb7c9,'mandos');pipe([[-.2,.25,-1.3],[.5,-.05,-.4],[1.45,-.6,.12]],'frenos',0x8fb7c9,'mandos');
 pipe([[-.25,.07,-1.5],[-.12,.45,-1.7],[-.36,.36,-2.3]],'combustible',0xf6dd9a,'combustible');
 box([.08,.02,.12],[-2.05,.17,-.86],'alas',0xe56c64,'pitot');
 const components=[
  ['Tanque izquierdo','combustible','combustible',[-1.45,.32,-.32],'25 gal en el borde de ataque, sujeto con tornillos (Handbook p. 8). Lista: drenar y verificar cantidad.'],
  ['Tanque derecho','combustible','combustible',[1.45,.32,-.32],'Igual al izquierdo. Total 189 L (50 gal) según el Manual de Vuelo.'],
  ['Selector de tanque','combustible','combustible',[0,.24,-.8],'Elige el tanque que alimenta al motor: izquierdo, derecho o cerrado.'],
  ['Filtro (gascolator)','combustible','combustible',[-.25,.2,-1.8],'Esquina inferior izquierda del parallamas, con drenaje rápido (Handbook p. 8). Lista: «Filtro de Combustible — Drenar y Verificar».'],
  ['Bomba eléctrica','combustible','combustible',[-.25,.2,-1.5],'Auxiliar de la bomba mecánica. Manual §3: conectada en despegues y aterrizajes.'],
  ['Carburador','motor','combustible',[0,-.14,-2.22],'Mezcla aire y combustible. Calefactor del carburador: contra el hielo (emergencia 14).'],
  ['Cebador (primer)','combustible','combustible',[-.36,.45,-2.3],'Inyecta combustible directo a los cilindros para arrancar en frío.'],
  ['Cilindros (4, opuestos)','motor','motor',[.53,.5,-2.3],'Lycoming O-320 de 150 HP (Manual §2). Refrigerado por aire, sin cowl flaps.'],
  ['Magnetos (2)','motor','motor',[0,.62,-1.86],'Encendido independiente del sistema eléctrico. Prueba: caída máx. 175 RPM, diferencia 50 (lista, etapa 7).'],
  ['Bomba de vacío','vacio','vacio',[.18,.42,-1.86],'Accionada por el motor; mueve los giróscopos. Succión 4–6 inHg (lista).'],
  ['Alternador','electrico','electrico',[.23,.58,-2.75],'60 A según el Manual del LV-LLS. Necesita la batería para excitarse.'],
  ['Batería','electrico','electrico',[0,.22,1.1],'12 V, 25 Ah, bajo el piso del compartimiento de equipaje (Handbook p. 9).'],
  ['Tubo pitot','pitot','pitot',[-2.8,-.05,-.9],'Bajo el ala izquierda. Lista: «Tubo Pitot y Estática — Verificar sin obstrucción».'],
  ['Chapita de aviso de pérdida','alas','pitot',[-2.05,.3,-.86],'Borde de ataque izquierdo. Lista: «Verificar sonido y libre movimiento».'],
  ['Depósito de líquido de frenos','frenos','mandos',[-.3,.76,-1.78],'Arriba a la izquierda del parallamas (Handbook p. 7). Lista: «Nivel Líquido de Freno».'],
  ['Panel de instrumentos','instrumentos','cabina',[0,.92,-1.1],'Abrí la cabina realista para verlos funcionando.']
 ];
 const labelBox=document.createElement('div');labelBox.className='xr-labels';host.append(labelBox);
 const tip=document.createElement('div');tip.className='xr-tip';tip.hidden=true;host.append(tip);
 const labelEls=components.map(([name,id,cat,pos,note])=>{const b=document.createElement('button');b.type='button';b.className='xr-label';b.textContent=name;b.style.setProperty('--c','#'+(palette[cat]||0xdfebe4).toString(16).padStart(6,'0'));b.addEventListener('click',e=>{e.stopPropagation();select(id);onSelect(id);tip.hidden=false;tip.innerHTML=`<strong>${name}</strong><span>${note}</span>`;});return {b,cat,v:new T.Vector3(...pos)};});
 labelEls.forEach(l=>labelBox.append(l.b));
 const KEY=new Set(['Tanque izquierdo','Batería','Cilindros (4, opuestos)','Tubo pitot','Bomba de vacío','Panel de instrumentos']);
 function placeLabels(){const show=mode==='xray';labelBox.hidden=!show;if(!show){tip.hidden=true;return;}const w=host.clientWidth,h=host.clientHeight,placed=[];
  const list=labelEls.map(l=>{const on=layer==='all'?KEY.has(l.b.textContent):layer===l.cat;const p=l.v.clone().project(camera);return {l,on:on&&p.z<1,x:(p.x+1)/2*w,y:(1-p.y)/2*h,wd:l.b.textContent.length*7.4+22};}).sort((a,b)=>a.y-b.y);
  for(const it of list){let ok=it.on&&it.x>-20&&it.x<w-12&&it.y>40&&it.y<h-40;if(ok)it.x=Math.max(6,Math.min(it.x,w-it.wd-14));if(ok)for(const q of placed)if(Math.abs(q.y-it.y)<36&&it.x<q.x+q.wd&&q.x<it.x+it.wd){ok=false;break;}it.l.b.hidden=!ok;if(ok){placed.push(it);it.l.b.style.transform=`translate(${it.x.toFixed(1)}px,${it.y.toFixed(1)}px)`;}}}
 paths.filter(p=>p.category!=='skin').forEach(p=>{for(let k=0;k<3;k++){const d=sphere(.04,[0,0,0],p.category==='pitot'?'pitot':p.category==='mandos'?'controles':p.category,0xffffff,p.category);d.userData.phase=k/3;animated.push({dot:d,curve:p.curve});}});
 const pointer=new T.Vector2(),ray=new T.Raycaster();let down=null;
 function draw(){if(dead)return;renderer.render(scene,camera);placeLabels();}
 function refresh(){all.forEach(m=>{const c=m.userData.category;const internal=!['skin','solid'].includes(c);m.visible=!internal||(mode==='cabina'?['cabina','mandos'].includes(c):(mode==='xray'&&(layer==='all'||c===layer||c==='cabina')));m.material.transparent=c==='skin'&&mode!=='exterior';m.material.opacity=c==='skin'?(mode==='exterior'?1:mode==='cabina'?.055:.09):1;m.material.depthWrite=!(c==='skin'&&mode!=='exterior');m.material.color.setHex(m.userData.color);m.material.emissive.setHex(m.userData.id===selected?0xf0ab4b:0);m.material.emissiveIntensity=m.userData.id===selected?.23:0;if(c==='skin')m.position.y=m.userData.base[1]+explosion*(m.userData.id==='motor'?1.5:m.userData.id==='alas'?.8:m.userData.id==='fuselaje'?1:0);});animated.forEach(a=>a.dot.visible=running&&mode==='xray'&&(layer==='all'||layer===a.dot.userData.category));draw();}
 function select(id){selected=id;refresh();}
 canvas.addEventListener('pointerdown',e=>{down=[e.clientX,e.clientY];});
 canvas.addEventListener('pointerup',e=>{if(!down||Math.hypot(e.clientX-down[0],e.clientY-down[1])>7)return;const r=canvas.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(pointer,camera);const hits=ray.intersectObjects(all.filter(m=>m.visible&&(mode==='exterior'||m.userData.category!=='skin')),false);if(hits[0]){select(hits[0].object.userData.id);onSelect(hits[0].object.userData.id);}});
 function orbit(dx,dy){const off=camera.position.clone().sub(controls.target),s=new T.Spherical().setFromVector3(off);s.theta+=dx;s.phi=T.MathUtils.clamp(s.phi+dy,.1,Math.PI*.85);camera.position.copy(controls.target).add(new T.Vector3().setFromSpherical(s));controls.update();draw();}
 canvas.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','-','=','Home'].includes(e.key)){e.preventDefault();if(e.key==='Home')preset('general');else if(['+','-','='].includes(e.key))zoom(e.key==='-'?1.12:.88);else orbit(e.key==='ArrowLeft'?-.15:e.key==='ArrowRight'?.15:0,e.key==='ArrowUp'?-.12:e.key==='ArrowDown'?.12:0);}});
 function zoom(f){const off=camera.position.clone().sub(controls.target);off.setLength(T.MathUtils.clamp(off.length()*f,1.3,22));camera.position.copy(controls.target).add(off);controls.update();draw();}
 function preset(type){controls.target.set(0,.2,0);if(type==='superior')camera.position.set(.01,15,.01);else if(type==='frente')camera.position.set(0,2,-15);else if(type==='lateral')camera.position.set(15,2,0);else if(type==='cabina'){camera.position.set(.05,1.15,.8);controls.target.set(0,.55,-1.1);}else if(type==='xray'){const k=host.clientWidth<host.clientHeight*1.05?1.75:1;camera.position.set(5.2*k,3.6*k,-5.4*k);controls.target.set(0,.25,-.6);}else camera.position.set(9,7,-10);controls.update();draw();}
 function tick(time){if(dead||!running)return;if(!document.hidden){if(mode==='exterior')prop.rotation.z+=.035;animated.forEach((a,i)=>{if(a.dot.userData.category==='pitot'){a.dot.position.copy(a.curve.getPoint(.85));a.dot.scale.setScalar(.65+.6*(1+Math.sin(time*.003+i)));}else a.dot.position.copy(a.curve.getPoint((time*.00015+(a.dot.userData.phase??i*.11))%1));});if(time-frame>32){draw();frame=time;}}raf=requestAnimationFrame(tick);}
 function animate(value){running=value;cancelAnimationFrame(raf);refresh();if(running)raf=requestAnimationFrame(tick);}
 controls.addEventListener('change',draw);
 const observer=new ResizeObserver(()=>{const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();draw();});observer.observe(host);
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();animate(false);host.dispatchEvent(new CustomEvent('viewer-lost'));});
 refresh();
 return {select,preset,zoom,orbit,animate,setMode(value){mode=value;refresh();if(value==='cabina')preset('cabina');else if(camera.position.distanceTo(controls.target)<5)preset('general');},setLayer(value){layer=value;mode='xray';if(camera.position.distanceTo(controls.target)>9)preset('xray');refresh();},explode(value){explosion=value;refresh();},dispose(){dead=true;cancelAnimationFrame(raf);observer.disconnect();controls.dispose();scene.traverse(o=>{o.geometry?.dispose();if(o.material){for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose();}});renderer.dispose();canvas.remove();labelBox.remove();tip.remove();}};
}
