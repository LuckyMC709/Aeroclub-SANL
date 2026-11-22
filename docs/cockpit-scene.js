// Original procedural cabin. Layout is illustrative until surveyed against LV-LLS photos.
// Instruments use the exact same live SVG as the accessible panel, not static dial images.
import * as T from './vendor/three.module.min.js';
import { instrumentLayout } from './data/cockpit-layout.js';
import { OrbitControls } from './vendor/OrbitControls.js';

export function createCockpitScene(host, panel, onInstrument, onControl) {
  const renderer = new T.WebGLRenderer({antialias:true, powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.outputColorSpace = T.SRGBColorSpace;
  const scene = new T.Scene(); scene.background = new T.Color('#9fc8dc');
  const camera = new T.PerspectiveCamera(56, 1, .05, 200);
  camera.position.set(-.62, 1.38, 2.12);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(-.35, 1.22, -.25); controls.enablePan = false;
  controls.minDistance = 1.25; controls.maxDistance = 3.2;
  controls.minAzimuthAngle = -.7; controls.maxAzimuthAngle = .7;
  controls.minPolarAngle = Math.PI*.34; controls.maxPolarAngle = Math.PI*.64;
  controls.update();
  scene.add(new T.HemisphereLight(0xe1efff, 0x333029, 2.6));
  const sun = new T.DirectionalLight(0xffead3, 2); sun.position.set(-3, 7, 4); scene.add(sun);
  const materials = [], geometries = [];
  function mesh(geo, color, pos, parent = scene) {
    geometries.push(geo); const mat = new T.MeshStandardMaterial({color, roughness:.7}); materials.push(mat);
    const obj = new T.Mesh(geo, mat); obj.position.set(...pos); parent.add(obj); return obj;
  }
  const box = (size, color, pos, parent) => mesh(new T.BoxGeometry(...size), color, pos, parent);
  function tube(a, b, radius, color, parent = scene) {
    const start = new T.Vector3(...a), end = new T.Vector3(...b), delta = end.clone().sub(start);
    const obj = mesh(new T.CylinderGeometry(radius,radius,delta.length(),12),color,start.add(end).multiplyScalar(.5).toArray(),parent);
    obj.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize()); return obj;
  }
  // Floor, sidewalls, upholstered seats, glare shield and windshield pillars.
  box([3.7,.1,4.1],0x272b2c,[0,-.25,1]);
  for (const side of [-1,1]) {
    box([.16,.9,3.8],0x454b49,[side*1.82,.2,1]);
    tube([side*1.75,.9,-.12],[side*1.58,2.45,-.52],.055,0xd5d5c8);
    tube([side*1.58,2.45,-.52],[side*1.6,2.45,2.5],.07,0xd5d5c8);
    box([1.15,.2,1.1],0x4c3426,[side*.8,-.03,2.2]);
    const seat = box([1.15,1.05,.18],0x543d30,[side*.8,.45,2.78]); seat.rotation.x=-.1;
  }
  tube([-1.58,2.45,-.52],[1.58,2.45,-.52],.06,0xd5d5c8);
  box([3.32,.12,.48],0x181e20,[0,1.95,-.16]);
  box([3.3,1.58,.11],0x252a2c,[0,1.12,-.08]);
  const texCanvas = document.createElement('canvas'); texCanvas.width=1600; texCanvas.height=780;
  const context = texCanvas.getContext('2d'); context.fillStyle='#252a2c'; context.fillRect(0,0,1600,780);
  const texture = new T.CanvasTexture(texCanvas); texture.colorSpace = T.SRGBColorSpace;
  texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
  const panelGeo = new T.PlaneGeometry(3.2,1.56); geometries.push(panelGeo);
  const panelMat = new T.MeshBasicMaterial({map:texture}); materials.push(panelMat);
  const panelMesh = new T.Mesh(panelGeo,panelMat); panelMesh.position.set(0,1.12,-.015); scene.add(panelMesh);
  const yokes = [];
  for (const side of [-1,1]) {
    tube([side*.8,.46,.04],[side*.8,.46,.68],.035,0x9a9d96);
    const y = new T.Group(); y.position.set(side*.8,.46,.7); scene.add(y); yokes.push(y);
    tube([-.27,0,0],[.27,0,0],.035,0x171c1e,y);
    for(const sign of [-1,1]){tube([sign*.27,0,0],[sign*.3,.2,0],.046,0x171c1e,y);}
    box([.18,.12,.08],0x333a3e,[0,0,0],y);
  }
  const world = new T.Group(); world.position.set(0,1.9,-32); scene.add(world);
  box([180,65,1],0xa99a72,[0,-32.5,0],world);
  // Seeded, original scenery: a teaching horizon, never a reconstruction of an aerodrome.
  for(let i=0;i<18;i++){
    const mountain=mesh(new T.ConeGeometry(5+i%4,4+(i*7)%9,4),0x7b8b83,[-70+i*8,1,-4-(i%3)],world);
    mountain.scale.z=.25;
  }
  const groundGrid = new T.GridHelper(100,30,0xc4b88d,0xb3a77e); groundGrid.position.set(0,-2,0); world.add(groundGrid);
  const nose = mesh(new T.SphereGeometry(.77,24,12),0xd9e1dc,[0,.65,-1.4]); nose.scale.set(1,.47,1.8);
  const ui = document.createElement('div'); ui.className='scene-tools';
  ui.innerHTML='<button type="button" data-reset3d>Volver al asiento</button><span>Arrastrá para mirar · tocá llaves e instrumentos · arrastrá volante y perillas</span>';
  host.append(renderer.domElement,ui);
  const canvas=renderer.domElement; canvas.tabIndex=0;
  canvas.setAttribute('aria-label','Cabina tridimensional ilustrativa. Flechas para mirar. Inicio para volver al asiento. Los mandos y las lecturas están disponibles debajo.');
  const events = new AbortController();
  let dead=false,visible=true,busy=false,lastTexture=0,raf=0,state={},image=null;
  function paintPanel(now){
    if(busy || now-lastTexture<120) return;
    busy=true;lastTexture=now;
    const copy=panel.cloneNode(true); copy.setAttribute('viewBox','0 0 1600 780');
    copy.setAttribute('width','1600');copy.setAttribute('height','780');copy.setAttribute('xmlns','http://www.w3.org/2000/svg');
    image=new Image(); image.onload=()=>{if(!dead){context.clearRect(0,0,1600,780);context.drawImage(image,0,0);texture.needsUpdate=true;}busy=false;};
    image.onerror=()=>{busy=false;};
    image.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(new XMLSerializer().serializeToString(copy));
  }
  function reset(){camera.position.set(-.62,1.38,2.12);controls.target.set(-.35,1.22,-.25);controls.update();}
  ui.querySelector('button').addEventListener('click',reset);
  canvas.addEventListener('keydown',e=>{
    if(e.key==='Home'){e.preventDefault();reset();}
    const delta={ArrowLeft:[-.08,0],ArrowRight:[.08,0],ArrowUp:[0,.06],ArrowDown:[0,-.06]}[e.key];
    if(delta){e.preventDefault();controls.target.x=T.MathUtils.clamp(controls.target.x+delta[0],-.9,.9);controls.target.y=T.MathUtils.clamp(controls.target.y+delta[1],.7,1.9);controls.update();}
  });
  const hitAreas=instrumentLayout;
  const ray=new T.Raycaster();
  function pick(e){
    const r=canvas.getBoundingClientRect();
    ray.setFromCamera(new T.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),camera);
    const hit=ray.intersectObject(panelMesh)[0];
    return hit ? [hit.uv.x*1600,(1-hit.uv.y)*780] : null;
  }
  let down=null,drag=null;
  canvas.addEventListener('pointerdown',e=>{
    down=[e.clientX,e.clientY];const p=pick(e);
    if(p && p[1]>530 && p[1]<690){const k=[[780,'carb'],[880,'throttle'],[1010,'mixture']].find(([x])=>Math.abs(p[0]-x)<35);if(k)drag={kind:'knob',key:k[1],y:e.clientY};}
    if(!drag && ray.intersectObjects(yokes,true).length)drag={kind:'yoke',x:e.clientX,y:e.clientY};
    if(drag){controls.enabled=false;canvas.setPointerCapture(e.pointerId);}
  },true);
  canvas.addEventListener('pointermove',e=>{
    if(!drag)return;
    if(drag.kind==='knob'){onControl?.({type:'knob',key:drag.key,delta:(drag.y-e.clientY)/100});drag.y=e.clientY;}
    else onControl?.({type:'yoke',roll:(e.clientX-drag.x)/90,pitch:(e.clientY-drag.y)/90});
  });
  function release(){if(drag?.kind==='yoke')onControl?.({type:'yoke',roll:0,pitch:0});drag=null;controls.enabled=true;}
  canvas.addEventListener('pointercancel',release);
  window.addEventListener('blur',release,{signal:events.signal});
  canvas.addEventListener('pointerup',e=>{
    if(drag){release();return;}
    if(!down || Math.hypot(e.clientX-down[0],e.clientY-down[1])>7)return;
    const p=pick(e);if(!p)return;const [x,y]=p;
    const area=hitAreas.find(([,ax,ay,w,h])=>x>=ax&&x<=ax+w&&y>=ay&&y<=ay+h);
    if(area){onInstrument(area[0]);return;}
    if(y>625&&y<720){const i=Math.round((x-96)/76);if(i>=0&&i<8&&Math.abs(x-(96+i*76))<30)onControl?.({type:'switch',key:['bat','alt','pump','nav','bcn','land','panel','radio'][i]});}
    if(Math.hypot(x-1150,y-400)<60)onControl?.({type:'mag'});
    if(Math.hypot(x-1300,y-400)<30)onControl?.({type:'primer'});
    if(Math.hypot(x-1440,y-410)<65)onControl?.({type:'selector'});
  });
  const resize=()=>{const r=host.getBoundingClientRect();if(!r.width||!r.height)return;renderer.setSize(r.width,r.height);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();};
  const ro=new ResizeObserver(resize);ro.observe(host);
  function frame(now){
    if(dead)return; raf=requestAnimationFrame(frame);
    if(!visible||document.hidden)return;
    paintPanel(now);
    for(const y of yokes){y.rotation.z=-(state.rollCmd||0)*.6;y.position.z=.7+(state.pitchCmd||0)*.14;}
    world.rotation.z=(state.roll||0)*Math.PI/180;
    world.position.y=1.9-(state.pitch||0)*.25;
    renderer.render(scene,camera);
  }
  resize();raf=requestAnimationFrame(frame);
  return {
    update(next){state=next;},setVisible(value){visible=value;if(value)resize();},
    dispose(){dead=true;events.abort();cancelAnimationFrame(raf);ro.disconnect();controls.dispose();if(image){image.onload=null;image.onerror=null;}texture.dispose();geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());groundGrid.geometry.dispose();groundGrid.material.dispose();renderer.dispose();host.replaceChildren();}
  };
}
