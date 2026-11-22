// Sistemas animados del LV-LLS: diagramas interactivos con flujo animado.
// Recorridos y componentes según el Owner's Handbook (PA-28-140 genérico) y el Manual de Vuelo LV-LLS.
// La ubicación física es esquemática. Presiones, consumos y tiempos son ilustrativos salvo que se indique la fuente.
import * as I from './instruments.js';
import { clamp } from './instruments.js';
import { engine, travel } from './data/lvlls.js';

const fmt = (n, d = 0) => Number(n).toLocaleString('es-AR', { minimumFractionDigits: d, maximumFractionDigits: d });
const rad = d => d * Math.PI / 180;
const pol = (cx, cy, r, a) => [cx + r * Math.sin(rad(a)), cy - r * Math.cos(rad(a))];
const arcD = (cx, cy, r, a0, a1) => { const [x0, y0] = pol(cx, cy, r, a0), [x1, y1] = pol(cx, cy, r, a1); return `M${x0.toFixed(1)} ${y0.toFixed(1)}A${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`; };

/* ---------- piezas de dibujo ---------- */
const pipe = (d, f, color, w = 9) => `<path class="pipe" d="${d}" stroke-width="${w}"/><path class="flow" data-f="${f}" d="${d}" stroke="${color}"/>`;
const box = (x, y, w, h, t, sub = '', e = '', tone = '#1d3a46') =>
  `<g${e ? ` data-e="${e}"` : ''}><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${tone}" stroke="#5f7f8b" stroke-width="1.5"/><text x="${x + w / 2}" y="${y + (sub ? h / 2 - 2 : h / 2 + 4)}" text-anchor="middle" font-size="11" font-weight="700" fill="#e4f0f3">${t}</text>${sub ? `<text x="${x + w / 2}" y="${y + h / 2 + 12}" text-anchor="middle" font-size="9" fill="#9fc0ca">${sub}</text>` : ''}</g>`;
// Manómetro simple: 240° de recorrido
function gauge(id, cx, cy, r, min, max, title, unit, arcs = [], ticks = []) {
  const A = v => -120 + (clamp(v, min, max) - min) / (max - min) * 240;
  let s = `<circle cx="${cx}" cy="${cy}" r="${r + 5}" fill="#0b1114" stroke="#3a4a52"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="#141a1d"/>`;
  for (const [a, b, c] of arcs) s += `<path d="${arcD(cx, cy, r - 5, A(a), A(b))}" stroke="${c}" stroke-width="5" fill="none"/>`;
  for (const t of ticks) { const [x0, y0] = pol(cx, cy, r - 1, A(t)), [x1, y1] = pol(cx, cy, r - 10, A(t)), [lx, ly] = pol(cx, cy, r - 18, A(t)); s += `<path d="M${x0} ${y0}L${x1} ${y1}" stroke="#ddd" stroke-width="1.4"/><text x="${lx}" y="${ly + 3}" font-size="8" fill="#ddd" text-anchor="middle">${t}</text>`; }
  s += `<text x="${cx}" y="${cy + r + 18}" font-size="9" font-weight="700" fill="#cfe3ea" text-anchor="middle">${title}</text><text x="${cx}" y="${cy + r * .5}" font-size="8" fill="#9fc0ca" text-anchor="middle">${unit}</text>`;
  s += `<g data-g="${id}" data-min="${min}" data-max="${max}" transform="translate(${cx} ${cy}) rotate(-120)"><path d="M-2 6L0 ${-(r - 6)}L2 6Z" fill="#f4f1e6"/><circle r="4" fill="#333" stroke="#777"/></g>`;
  return s;
}

/* ---------- controles ---------- */
const tg = (k, label) => `<button type="button" data-t="${k}" aria-pressed="false">${label}</button>`;
const ac = (k, label, cls = '') => `<button type="button" data-a="${k}" class="${cls}">${label}</button>`;
const rg = (k, label, min, max, step, val) => `<label>${label} <output data-o="${k}"></output><input type="range" data-r="${k}" min="${min}" max="${max}" step="${step}" value="${val}"></label>`;
const sg = (k, opts, label) => `<div class="seg small" role="group" aria-label="${label}">${opts.map(([v, t]) => `<button type="button" data-s="${k}" data-v="${v}" aria-pressed="false">${t}</button>`).join('')}</div>`;
const grp = (title, inner) => `<div class="sys-group"><h3>${title}</h3>${inner}</div>`;
const fails = inner => `<div class="sys-group fails"><h3>Fallas para estudiar</h3><div class="toggles">${inner}</div></div>`;

/* =====================================================================
   1 · COMBUSTIBLE
   ===================================================================== */
function fuel() {
  const st = { sel: 'left', qL: 18, qR: 22, pump: false, running: true, mechFail: false, water: 0, fast: false, p: 4.6, starve: 0, prime: 0, drain: 0, sample: 0 };
  const svg = `<svg viewBox="0 0 640 440" role="img" aria-label="Sistema de combustible: tanques alares, selector, filtro con drenaje, cebador, bomba eléctrica, bomba mecánica, manómetro y carburador">
<rect width="640" height="440" rx="10" fill="#10232c"/>
<text x="16" y="24" font-size="11" fill="#9fc0ca" letter-spacing="1">COMBUSTIBLE · RECORRIDO FUNCIONAL (Owner's Handbook, PA-28-140)</text>
<path d="M20 70H262M378 70H620" stroke="#2f4955" stroke-width="2" stroke-dasharray="4 5"/>
${pipe('M205 72H270V140H294', 'fL', '#e9a640')}${pipe('M435 72H370V140H346', 'fR', '#e9a640')}
${pipe('M320 166V196', 'main', '#e9a640')}${pipe('M320 242V270', 'main', '#e9a640')}${pipe('M320 310V334', 'main', '#e9a640')}${pipe('M360 354H392', 'main', '#e9a640')}${pipe('M444 374V398', 'main', '#e9a640')}
${pipe('M350 219H446', 'prime', '#f3d08a', 6)}${pipe('M556 219H604V415H580', 'prime', '#f3d08a', 6)}
${pipe('M376 354V380H224', 'gauge', '#e9a640', 5)}
${pipe('M290 232H262', 'drain', '#e9a640', 5)}
<g><rect x="40" y="42" width="170" height="58" rx="12" fill="#0d1a20" stroke="#8a6d2b" stroke-width="2"/><rect data-e="lvlL" x="44" y="46" width="162" height="50" rx="9" fill="#d9a35c" opacity=".8"/><text x="125" y="36" text-anchor="middle" font-size="11" font-weight="700" fill="#f0d79a">TANQUE IZQUIERDO</text><text data-e="tL" x="125" y="76" text-anchor="middle" font-size="12" font-weight="700" fill="#2b1a05"></text><circle cx="206" cy="98" r="4" fill="#8a6d2b"/></g>
<g><rect x="430" y="42" width="170" height="58" rx="12" fill="#0d1a20" stroke="#8a6d2b" stroke-width="2"/><rect data-e="lvlR" x="434" y="46" width="162" height="50" rx="9" fill="#d9a35c" opacity=".8"/><text x="515" y="36" text-anchor="middle" font-size="11" font-weight="700" fill="#f0d79a">TANQUE DERECHO</text><text data-e="tR" x="515" y="76" text-anchor="middle" font-size="12" font-weight="700" fill="#2b1a05"></text><circle cx="434" cy="98" r="4" fill="#8a6d2b"/></g>
<g><circle cx="320" cy="140" r="27" fill="#24434f" stroke="#9fc0ca" stroke-width="2"/><text x="320" y="106" text-anchor="middle" font-size="9" fill="#9fc0ca">OFF</text><text x="280" y="124" text-anchor="end" font-size="9" fill="#9fc0ca">IZQ</text><text x="360" y="124" font-size="9" fill="#9fc0ca">DER</text><g data-e="selp" transform="translate(320 140) rotate(-90)"><path d="M-5 8L0 -22L5 8Z" fill="#efb568"/><circle r="5" fill="#10232c"/></g><text x="364" y="160" font-size="10" fill="#cfe3ea">SELECTOR</text></g>
${box(290, 196, 60, 46, 'FILTRO', 'con drenaje')}
<g data-e="sample" opacity="0"><rect x="234" y="208" width="24" height="54" rx="5" fill="#0b1114" stroke="#cfe3ea"/><rect data-e="sFuel" x="237" y="222" width="18" height="36" rx="3" fill="#d9a35c" opacity=".85"/><rect data-e="sWater" x="237" y="258" width="18" height="0" rx="3" fill="#6fb3e8"/><text x="246" y="278" text-anchor="middle" font-size="9" fill="#cfe3ea">muestra</text></g>
${box(446, 199, 110, 40, 'CEBADOR', 'bomba manual en cabina')}
${box(280, 270, 80, 40, 'BOMBA', 'eléctrica', 'epump')}
${box(280, 334, 80, 40, 'BOMBA', 'mecánica (motor)', 'mpump')}
${box(392, 334, 104, 40, 'CARBURADOR', 'cuba y venturi')}
<g data-e="eng"><rect x="380" y="398" width="200" height="34" rx="6" fill="#2a2310" stroke="#8a6d2b" stroke-width="1.5"/><text data-e="engT" x="480" y="420" text-anchor="middle" font-size="11" font-weight="700" fill="#f0d79a"></text></g>
${gauge('p', 180, 376, 40, 0, 10, 'PRESIÓN COMB.', 'psi', [[.5, 8, '#25a346']], [0, 5, 10])}
</svg>`;
  const side = grp('Mandos', `<p class="sys-label">Selector de tanque</p>${sg('sel', [['off', 'OFF'], ['left', 'Izquierdo'], ['right', 'Derecho']], 'Selector de tanque')}
<div class="toggles">${tg('pump', 'Bomba eléctrica')}${tg('running', 'Motor en marcha')}</div>
<div class="toggles">${ac('prime', 'Cebar (una bombeada)')}${ac('drain', 'Drenar el filtro')}</div>`) +
    grp('Combustible en los tanques', `${rg('qL', 'Izquierdo', 0, 25, .5, 18)}${rg('qR', 'Derecho', 0, 25, .5, 22)}<div class="toggles">${tg('fast', 'Tiempo rápido (consumir)')}</div>`) +
    fails(`${tg('mechFail', 'Falla la bomba mecánica')}${ac('water', 'Agua en el combustible')}`);
  const tips = ['Etapa 2 · Inspección exterior: «Tanque de Combustible — Drenar y verificar cantidad» y «Filtro de Combustible — Drenar y Verificar».',
    'Etapa 4: «Bomba Eléctrica de Combustible — Conectar (ON)». Etapa 5: «Presión de Combustible — Verificar» y «Bomba de Combustible — Off».',
    'Etapas 8 y 13: bomba eléctrica ON para despegue y aterrizaje; etapa 13: «Tanque de Combustible — Tanque Mayor Cantidad».',
    'Emergencia 10 · Pérdida de presión de combustible: «Bomba eléctrica de combustible — Conectar» y «Selector de Tanque — Verificar mayor cantidad».'];
  const fine = 'Recorrido del Owner\'s Handbook (PA-28-140 genérico, págs. 8–9): selector → filtro con drenaje (toma del cebador) → bomba eléctrica → bomba mecánica → carburador. Capacidad total 189 L / 50 gal (Manual LV-LLS); 25 gal por tanque (Handbook). Presiones, tiempos y consumo: ilustrativos. Arco verde 0,5–8 psi: Manual LV-LLS.';
  function tick(dt, ui) {
    const qKey = st.sel === 'left' ? 'qL' : st.sel === 'right' ? 'qR' : null;
    const avail = qKey && st[qKey] > 0;
    const pEng = st.running && !st.mechFail ? 4.6 : 0, pEl = st.pump ? 5.2 : 0;
    const target = avail ? Math.max(pEng, pEl) : 0;
    st.p += (target - st.p) * Math.min(1, dt * (target > st.p ? 3 : .7));
    if (st.running) {
      st.starve = st.p < .4 ? st.starve + dt : 0;
      if (st.starve > 3.5) { st.running = false; st.starve = 0; ui.say('El motor se detuvo: no le llega combustible.'); }
      if (st.fast && avail) st[qKey] = Math.max(0, st[qKey] - dt * .35);
      if (st.water > .3 && Math.random() < dt * .25) ui.say('El motor falla de a ratos: hay agua en el combustible. En tierra, se detecta drenando antes del vuelo.');
      if (st.water > .9 && Math.random() < dt * .3) { st.running = false; ui.say('El agua llegó al carburador y el motor se detuvo.'); }
    }
    st.prime = Math.max(0, st.prime - dt); st.drain = Math.max(0, st.drain - dt); st.sample = Math.max(0, st.sample - dt * .12);
    const flowing = st.p > .3 && (st.running || st.pump);
    ui.flow('fL', flowing && st.sel === 'left'); ui.flow('fR', flowing && st.sel === 'right');
    ui.flow('main', flowing, 1.6 - st.p / 6); ui.flow('gauge', st.p > .3, 2);
    ui.flow('prime', st.prime > 0 && avail, .5); ui.flow('drain', st.drain > 0 && avail, .5);
    for (const [k, e] of [['qL', 'L'], ['qR', 'R']]) { const h = st[k] / 25 * 50; ui.attr('lvl' + e, { y: 96 - h, height: Math.max(0, h) }); ui.text('t' + e, `${fmt(st[k], 1)} gal`); }
    ui.attr('selp', { transform: `translate(320 140) rotate(${st.sel === 'left' ? -90 : st.sel === 'right' ? 90 : 0})` });
    ui.cls('epump', 'active', st.pump); ui.cls('mpump', 'active', st.running && !st.mechFail); ui.cls('mpump', 'failed', st.mechFail);
    ui.text('engT', st.running ? 'MOTOR EN MARCHA' : 'MOTOR DETENIDO');
    ui.needle('p', st.p);
    ui.attr('sample', { opacity: st.sample > 0 ? 1 : 0 });
    const wH = Math.min(1, st.water) * 26; ui.attr('sWater', { y: 258 - wH, height: wH }); ui.attr('sFuel', { height: 36 - wH });
    ui.out('pP', `${fmt(st.p, 1)} psi`); ui.out('tank', qKey ? `${st.sel === 'left' ? 'Izquierdo' : 'Derecho'} · ${fmt(st[qKey], 1)} gal` : 'Cerrado (OFF)');
    ui.out('src', st.p < .3 ? 'Ninguna' : !target ? 'Ninguna: la presión cae' : pEl && pEng ? 'Bomba mecánica + eléctrica' : pEl ? 'Bomba eléctrica' : 'Bomba mecánica');
    ui.out('eng', st.running ? 'En marcha' : 'Detenido');
    if (!ui.busy()) ui.hint(!avail && st.sel !== 'off' ? 'El tanque seleccionado está vacío. Emergencia 10: bomba eléctrica ON y selector al tanque de mayor cantidad.'
      : st.sel === 'off' ? (st.running ? 'Selector en OFF: el motor consume lo que queda en cañerías y cuba, y se detiene.' : 'Selector en OFF: así queda al terminar (etapa 15).')
        : st.mechFail && st.running && !st.pump ? 'Falló la bomba mecánica y la presión cae. Emergencia 10: conectá la bomba eléctrica.'
          : st.mechFail && st.pump ? 'La bomba eléctrica sostiene la presión sin la mecánica: por eso se usa en despegue y aterrizaje.'
            : st.pump && st.running ? 'Las dos bombas están en serie: si una falla, la otra mantiene la presión.'
              : st.running ? 'La bomba mecánica, movida por el motor, alimenta al carburador.' : 'Motor detenido: sin bombas no hay presión. Probá la bomba eléctrica.');
  }
  const actions = {
    prime(ui) { const q = st.sel === 'left' ? st.qL : st.sel === 'right' ? st.qR : 0; st.prime = 1.2; ui.say(q > 0 ? 'El cebador inyecta nafta directo a los cilindros, sin pasar por el carburador.' : 'El cebador no aspira nada: el selector está cerrado o el tanque vacío.'); },
    drain(ui) { const q = st.sel === 'left' ? st.qL : st.sel === 'right' ? st.qR : 0; if (q <= 0) { ui.say('No sale nada: abrí un tanque con combustible.'); return; } st.drain = 1.2; st.sample = 1; const had = st.water > .05; st.water = Math.max(0, st.water - .4); ui.say(had ? 'El agua es más pesada y se junta abajo de la muestra. Seguí drenando hasta que salga limpia.' : 'Muestra limpia: sin agua ni sedimentos.'); },
    water(ui) { st.water = 1; ui.say('Entró agua (condensación o carga contaminada). Se junta en el punto más bajo: drená el filtro.'); }
  };
  const read = `<div><span>Presión de combustible</span><b data-o="pP"></b></div><div><span>Tanque en uso</span><b data-o="tank"></b></div><div><span>Fuente de presión</span><b data-o="src"></b></div><div><span>Motor</span><b data-o="eng"></b></div>`;
  return { st, svg, side, read, tips, fine, tick, actions };
}

/* =====================================================================
   2 · ELÉCTRICO
   ===================================================================== */
const LOADS = [['radio', 'Radio', 'Com/Nav', 3, 'Radio Com/Nav'], ['nav', 'Luces', 'nav.', 1.5, 'Luces de navegación'], ['bcn', 'Luz', 'anticol.', 2, 'Luz anticolisión'], ['land', 'Luz', 'aterriz.', 8, 'Luz de aterrizaje'], ['epump', 'Bomba', 'comb.', 1.5, 'Bomba de combustible'], ['panel', 'Luces', 'cabina', 1, 'Luces de cabina']];
function electrical() {
  const st = { bat: true, alt: true, running: true, radio: true, nav: false, bcn: true, land: false, epump: false, panel: false, altFail: false, breaker: false, overload: false, fast: false, charge: .85, excited: true, crank: 0, amps: 0, rot: 0 };
  let loadsSVG = '';
  LOADS.forEach(([k, a, b], i) => {
    const x = 334 + i * 47;
    loadsSVG += `${pipe(`M${x + 18} 200V246`, 'l-' + k, '#f0d264', 5)}<rect x="${x + 12}" y="216" width="12" height="9" rx="2" fill="#2c3b42" stroke="#7f9aa3"/><g data-e="ld-${k}"><rect x="${x}" y="246" width="36" height="36" rx="6" fill="#1d3a46" stroke="#5f7f8b"/><circle data-e="lamp-${k}" cx="${x + 18}" cy="264" r="9" fill="#2a3a40"/></g><text x="${x + 18}" y="298" text-anchor="middle" font-size="9" fill="#cfe3ea">${a}</text><text x="${x + 18}" y="309" text-anchor="middle" font-size="9" fill="#cfe3ea">${b}</text>`;
  });
  const svg = `<svg viewBox="0 0 640 440" role="img" aria-label="Sistema eléctrico Full Time Power: alternador, fusible, amperímetro, barra, batería, relé master, motor de arranque y consumidores">
<rect width="640" height="440" rx="10" fill="#10232c"/>
<text x="16" y="24" font-size="11" fill="#9fc0ca" letter-spacing="1">ELÉCTRICO 12 V · «FULL TIME POWER» (esquema funcional, no es el cableado)</text>
${pipe('M128 100H290M370 100H430V200', 'alt', '#f0d264')}
${pipe('M90 138V178H150', 'field', '#9fd36a', 4)}${pipe('M250 178H300V200', 'field', '#9fd36a', 4)}
${pipe('M150 332H300V200', 'bat', '#f0d264')}
${pipe('M90 364V404H190', 'start', '#ff8a5c', 7)}
<path d="M300 200H616" stroke="#c9a54a" stroke-width="10" stroke-linecap="round"/><text x="612" y="190" text-anchor="end" font-size="10" fill="#f0d79a">BARRA</text>
${loadsSVG}
<g><circle cx="90" cy="100" r="38" fill="#1d3a46" stroke="#9fc0ca" stroke-width="2"/><g data-e="rotor" transform="translate(90 100)"><path d="M-24 0H24M0 -24V24" stroke="#5f7f8b" stroke-width="5"/></g><circle cx="90" cy="100" r="9" fill="#10232c"/><text x="90" y="54" text-anchor="middle" font-size="11" font-weight="700" fill="#e4f0f3">ALTERNADOR 60 A</text><text x="90" y="152" text-anchor="middle" font-size="9" fill="#9fc0ca">movido por correa</text></g>
<g data-e="brk"><rect x="214" y="88" width="32" height="24" rx="4" fill="#2c3b42" stroke="#9fc0ca"/><text x="230" y="104" text-anchor="middle" font-size="9" fill="#e4f0f3">ALT</text><text data-e="brkT" x="230" y="80" text-anchor="middle" font-size="9" fill="#ffb4a2"></text></g>
${gauge('amps', 330, 96, 40, 0, 60, 'AMPERÍMETRO', 'A', [[0, 60, '#2d4a55']], [0, 30, 60])}
${box(150, 160, 100, 36, 'REGULADOR', 'excita el campo')}
<g><rect x="30" y="300" width="120" height="64" rx="7" fill="#1d3a46" stroke="#9fc0ca" stroke-width="2"/><rect x="40" y="340" width="100" height="12" rx="3" fill="#0b1114"/><rect data-e="chg" x="41" y="341" width="98" height="10" rx="2" fill="#7bd38b"/><text x="90" y="320" text-anchor="middle" font-size="11" font-weight="700" fill="#e4f0f3">BATERÍA</text><text x="90" y="333" text-anchor="middle" font-size="9" fill="#9fc0ca">12 V · 25 Ah</text></g>
<g><rect x="190" y="312" width="80" height="40" rx="6" fill="#1d3a46" stroke="#5f7f8b"/><text x="230" y="328" text-anchor="middle" font-size="10" font-weight="700" fill="#e4f0f3">RELÉ MASTER</text><path data-e="contact" d="M210 342L250 342" stroke="#efb568" stroke-width="3"/></g>
${box(190, 388, 110, 32, 'MOTOR DE ARRANQUE', '', 'starter')}
<g><rect x="330" y="350" width="286" height="70" rx="8" fill="none" stroke="#7f9aa3" stroke-dasharray="5 4"/><text x="344" y="372" font-size="11" font-weight="700" fill="#e4f0f3">MAGNETOS → BUJÍAS</text><text x="344" y="390" font-size="10" fill="#9fc0ca">Generan su propia chispa con el giro del motor:</text><text x="344" y="404" font-size="10" fill="#9fc0ca">el motor sigue andando sin batería ni alternador.</text></g>
</svg>`;
  const side = grp('Llaves', `<div class="toggles">${tg('bat', 'Batería (master)')}${tg('alt', 'Alternador')}${tg('running', 'Motor en marcha')}${ac('start', 'START')}${ac('reset', 'Resetear fusible ALT')}</div>`) +
    grp('Consumidores', `<div class="toggles">${LOADS.map(([k, , , , t]) => tg(k, t)).join('')}</div><div class="toggles">${tg('fast', 'Tiempo rápido (×60)')}</div>`) +
    fails(`${tg('altFail', 'Falla el alternador')}${tg('breaker', 'Salta el fusible ALT')}${tg('overload', 'Sobrecarga (+25 A)')}`);
  const tips = ['Etapa 4: «Batería — Conectar (ON)» … «Alternador — Conectar y Verificar Carga».',
    'Emergencia 11 · Falla eléctrica: si el amperímetro marca cero, alternador OFF, cargas al mínimo, verificar y resetear el fusible del alternador, alternador ON; si no se restablece, alternador OFF y aterrizar tan pronto sea posible.',
    'Emergencia 12 · Sobrecarga eléctrica: con más de 20 A sobre la carga conocida, alternador ON y batería OFF; si la carga baja, reducir cargas al mínimo y aterrizar tan pronto sea posible.',
    'Etapa 15: «Batería/Alternador — Off».'];
  const fine = '12 V, alternador de 60 A y batería de 25 Ah: Manual LV-LLS (el Handbook genérico dice 35 A). Owner\'s Handbook págs. 9–10: el amperímetro muestra la carga del sistema (unos 2 A con todo apagado y batería cargada) y el alternador necesita unos 3 V de la batería para excitarse. Consumo de cada equipo y autonomía: ilustrativos. El aviso de pérdida es eléctrico: no funciona con la batería desconectada (Manual §3).';
  function tick(dt, ui) {
    const k = st.fast ? 60 : 1;
    const cranking = st.crank > 0 && st.bat && st.charge > .12;
    if (st.crank > 0) { st.crank -= dt; if (cranking && st.crank <= 0) { st.running = true; ui.say('El motor arrancó. Ahora el alternador puede tomar la carga.'); } if (!cranking) { st.crank = 0; ui.say(st.bat ? 'La batería no tiene carga suficiente para el arranque.' : 'Con la batería desconectada no hay arranque.'); } }
    const canRun = st.alt && st.running && !st.altFail && !st.breaker;
    st.excited = canRun && (st.excited || (st.bat && st.charge > .1));
    const bus = st.excited || (st.bat && st.charge > .02);
    let load = .5; for (const [key, , , a] of LOADS) if (st[key]) load += a;
    if (st.excited) {
      st.amps = load + (st.bat ? (1 - st.charge) * 25 + (st.overload ? 25 : 0) : 0);
      if (st.bat) st.charge = Math.min(1, st.charge + dt * k * .002);
    } else {
      st.amps = 0;
      if (bus && st.bat) st.charge = Math.max(0, st.charge - dt * k * (load + (cranking ? 100 : 0)) / (25 * 3600));
    }
    st.rot += dt * (st.running ? 720 : 0);
    ui.attr('rotor', { transform: `translate(90 100) rotate(${st.rot % 360})` });
    ui.flow('alt', st.excited, .9); ui.flow('field', st.excited || (st.alt && st.bat), 1.2);
    ui.flow('bat', st.bat && (st.excited ? st.charge < .995 : bus), .9, st.excited);
    ui.flow('start', cranking, .35);
    for (const [key] of LOADS) { const on = bus && st[key]; ui.flow('l-' + key, on, 1); ui.attr('lamp-' + key, { fill: on ? '#ffe28a' : '#2a3a40' }); }
    ui.attr('contact', { d: st.bat ? 'M210 342L250 342' : 'M210 342L246 330' });
    ui.attr('chg', { width: 98 * st.charge, fill: st.charge > .5 ? '#7bd38b' : st.charge > .2 ? '#efb568' : '#e5604a' });
    ui.text('brkT', st.breaker ? 'SALTÓ' : ''); ui.cls('starter', 'active', cranking);
    ui.needle('amps', st.amps);
    const autonomy = st.charge * 25 / load * 60;
    ui.out('amps', `${fmt(st.amps, 1)} A`); ui.out('load', `${fmt(load, 1)} A`); ui.out('chg', `${Math.round(st.charge * 100)} %`);
    ui.out('src', !bus ? 'Ninguna: barra sin energía' : st.excited ? 'Alternador' : 'Batería (se descarga)');
    ui.out('auto', st.excited ? '—' : bus ? `≈ ${fmt(autonomy)} min (teórico)` : '—');
    if (!ui.busy()) ui.hint(st.overload && st.excited && st.bat ? 'El amperímetro marca más de 20 A sobre lo normal. Emergencia 12: alternador ON, batería OFF.'
      : st.overload && !st.bat && st.excited ? 'Con la batería afuera la carga volvió a lo normal. Reducí cargas y aterrizá tan pronto sea posible.'
        : (st.altFail || st.breaker) && st.running ? `Amperímetro en cero: todo sale de la batería. Emergencia 11: reducí cargas${st.breaker ? ' y probá «Resetear fusible ALT»' : ''}.`
          : !st.bat && st.excited ? 'El alternador sigue con la batería desconectada porque ya estaba excitado. Solo en una falla (emergencia 12).'
            : !st.bat && !st.excited ? 'Sin batería no hay barra ni aviso de pérdida. Y el alternador no puede excitarse solo.'
              : !st.alt && st.running ? 'Alternador desconectado: la batería alimenta todo y el amperímetro marca cero.'
                : !st.running ? 'Motor detenido: el alternador no genera. Mantené START para arrancar.'
                  : 'Full Time Power: el amperímetro muestra lo que entrega el alternador (consumo + carga de la batería).');
  }
  const actions = { reset(ui) { const was = st.breaker; st.breaker = false; ui.say(was ? 'Fusible reseteado. Si vuelve a saltar, no insistas: alternador OFF y aterrizar.' : 'El fusible del alternador está bien.'); }, start(ui) { if (st.running) { ui.say('El motor ya está en marcha.'); return; } st.crank = 1.6; ui.say('El motor de arranque toma decenas de amperes de la batería…'); } };
  const read = `<div><span>Amperímetro</span><b data-o="amps"></b></div><div><span>Consumo de los equipos</span><b data-o="load"></b></div><div><span>Carga de la batería</span><b data-o="chg"></b></div><div><span>Alimenta la barra</span><b data-o="src"></b></div><div><span>Autonomía de batería</span><b data-o="auto"></b></div>`;
  return { st, svg, side, read, tips, fine, tick, actions };
}

/* =====================================================================
   3 · INSTRUMENTOS: PITOT-ESTÁTICA Y VACÍO
   ===================================================================== */
const P0 = 101325, pAlt = h => P0 * Math.pow(1 - 6.8756e-6 * h, 5.2559), altP = p => (1 - Math.pow(p / P0, 1 / 5.2559)) / 6.8756e-6, QK = .1621; // q [Pa] = 0,1621·V[kt]²
function instruments() {
  const st = { ias: 95, vs: 0, rpm: 2300, alt: 3000, pitot: false, drainB: false, stat: false, vac: false, pt: 0, ps: 0, vsInd: 0, altPrev: 3000, spin: 1, roll: 0, hdgDrift: 0, init: false };
  const svg = `<svg viewBox="0 0 640 300" role="img" aria-label="Sistema pitot-estático y sistema de vacío con sus instrumentos">
<rect width="640" height="300" rx="10" fill="#10232c"/>
<text x="16" y="22" font-size="11" fill="#9fc0ca" letter-spacing="1">PITOT-ESTÁTICA Y VACÍO · PRINCIPIO GENERAL (FAA PHAK cap. 8)</text>
${pipe('M92 82H180V58H420', 'tot', '#7fb3e0', 7)}
${pipe('M66 171H300V76H420', 'st', '#c7b8f0', 7)}${pipe('M300 121H420', 'st', '#c7b8f0', 7)}${pipe('M300 171H420', 'st', '#c7b8f0', 7)}
${pipe('M110 254H630', 'vac', '#9fd36a', 8)}
<path d="M20 50H150" stroke="#2f4955" stroke-width="3"/><text x="20" y="44" font-size="9" fill="#7f9aa3">ala izquierda (ubicación a confirmar)</text>
<path d="M36 74H92V82" stroke="#cfe3ea" stroke-width="7" fill="none" stroke-linecap="round"/><text x="36" y="104" font-size="10" fill="#cfe3ea">tubo pitot</text>
<g data-e="xRam" opacity="0"><circle cx="34" cy="74" r="9" fill="#e5604a"/><text x="34" y="78" text-anchor="middle" font-size="10" fill="#fff">✕</text></g>
<g data-e="xDrn" opacity="0"><circle cx="64" cy="84" r="6" fill="#e5604a"/></g><text x="56" y="120" font-size="8" fill="#7f9aa3">orificio de drenaje</text>
<path d="M20 150V196" stroke="#2f4955" stroke-width="3"/><circle cx="56" cy="171" r="9" fill="#24434f" stroke="#cfe3ea" stroke-width="2"/><text x="20" y="214" font-size="10" fill="#cfe3ea">toma estática</text>
<g data-e="xSt" opacity="0"><circle cx="56" cy="171" r="10" fill="#e5604a"/><text x="56" y="175" text-anchor="middle" font-size="10" fill="#fff">✕</text></g>
<text x="190" y="50" font-size="9" fill="#7fb3e0">PRESIÓN TOTAL</text><text x="150" y="164" font-size="9" fill="#c7b8f0">PRESIÓN ESTÁTICA</text>
${box(420, 42, 120, 40, 'VELOCÍMETRO', 'total − estática')}${box(420, 104, 120, 34, 'ALTÍMETRO', 'estática')}${box(420, 154, 120, 34, 'VARIÓMETRO', 'estática (con fuga calibrada)')}
<text x="16" y="232" font-size="9" fill="#9fd36a">VACÍO: aire de cabina aspirado por la bomba</text>
${box(20, 236, 90, 36, 'FILTRO', 'aire de cabina')}${box(140, 236, 90, 36, 'HORIZONTE', 'giróscopo', 'gAI')}${box(250, 236, 90, 36, 'DIRECCIONAL', 'giróscopo', 'gDG')}${box(360, 236, 90, 36, 'VIRAJE', 'giróscopo', 'gTB')}${box(470, 236, 70, 36, 'REGULADOR')}
<g><circle cx="590" cy="254" r="22" fill="#1d3a46" stroke="#9fc0ca" stroke-width="2"/><g data-e="vrot" transform="translate(590 254)"><path d="M-14 0H14M0 -14V14" stroke="#5f7f8b" stroke-width="4"/></g><text x="590" y="292" text-anchor="middle" font-size="9" fill="#cfe3ea">BOMBA (motor)</text></g>
</svg>`;
  const insts = [['asi', I.airspeed(), 'Velocímetro'], ['alt', I.altimeter(), 'Altímetro'], ['vsi', I.vsi(), 'Variómetro'], ['ai', I.attitude(), 'Horizonte'], ['tb', I.turnBank(), 'Viraje y ladeo'], ['dg', I.heading(), 'Direccional'], ['suc', I.suction(), 'Succión']];
  const extra = `<div class="sys-insts">${insts.map(([k, x, t]) => `<figure data-inst="${k}">${x.svg}<figcaption>${t}</figcaption></figure>`).join('')}</div>`;
  const side = grp('Vuelo (valores reales)', `${rg('ias', 'Velocidad', 0, 140, 1, 95)}${rg('vs', 'Velocidad vertical', -1000, 1000, 50, 0)}${rg('rpm', 'RPM del motor', 0, 2700, 50, 2300)}`) +
    fails(`${tg('pitot', 'Pitot obstruido')}${tg('drainB', 'Drenaje del pitot obstruido')}${tg('stat', 'Toma estática obstruida')}${tg('vac', 'Falla la bomba de vacío')}${ac('clear', 'Destapar todo')}`);
  const tips = ['Etapa 2 · Inspección exterior: «Tubo Pitot y Estática — Verificar sin obstrucción».',
    'Etapa 5: «Velocímetro — Chequear en Cero», «Variometro — Chequear en Cero», «Presión de Vacío — Verificar Funcionamiento».',
    'Etapa 7: «Medidor de Succión — Chequear entre 4 y 6 HG» (Handbook: 5 ± 1 inHg a 2000 RPM).'];
  const fine = 'El Owner\'s Handbook no describe el sistema pitot-estático del PA-28-140: se muestran los principios de FAA PHAK cap. 8 y la ubicación de las tomas es esquemática (a confirmar en el LV-LLS). Si el avión tiene fuente estática alternativa: por confirmar. Giróscopos accionados por vacío según el Handbook; confirmar la instalación actual. Tiempos de respuesta: ilustrativos.';
  let upd = [];
  function bind(host) { upd = insts.map(([k, x]) => x.bind(host.querySelector(`[data-inst=${k}]`))); }
  function tick(dt, ui) {
    st.alt = clamp(st.alt + st.vs / 60 * dt, 0, 12000);
    const psReal = pAlt(st.alt), ptReal = psReal + QK * st.ias * st.ias;
    if (!st.init) { st.ps = psReal; st.pt = ptReal; st.init = true; }
    if (!st.stat) st.ps = psReal;
    if (!st.pitot) st.pt = ptReal; else if (!st.drainB) st.pt += (st.ps - st.pt) * Math.min(1, dt * .8);
    const iasInd = Math.sqrt(Math.max(0, st.pt - st.ps) / QK);
    const altInd = altP(st.ps);
    const rate = (altInd - st.altPrev) / Math.max(dt, 1e-3) * 60; st.altPrev = altInd;
    st.vsInd += (rate - st.vsInd) * Math.min(1, dt * 1.2);
    const suction = st.vac || st.rpm < 300 ? 0 : clamp(1.5 + st.rpm / 2000 * 3.5, 0, 5.6);
    const spinT = suction > 2.8 ? 1 : 0;
    st.spin += (spinT - st.spin) * dt * (spinT > st.spin ? .5 : .06);
    const ok = st.spin > .6;
    if (!ok) { st.roll += dt * (1 - st.spin) * 9; st.hdgDrift += dt * (1 - st.spin) * 6; } else { st.roll *= Math.pow(.2, dt); st.hdgDrift *= Math.pow(.5, dt); }
    const pitch = st.vs / 1000 * 5;
    const s = { ias: iasInd, altInd, kollsman: 29.92, vsInd: st.vsInd, roll: ok ? 0 : st.roll, pitch: ok ? pitch : pitch + st.roll * .4, gyroOk: ok, turnRate: 0, slip: 0, hdgInd: (90 + st.hdgDrift) % 360, suction };
    upd.forEach(u => u(s));
    ui.flow('tot', !st.pitot && st.ias > 5, 1.4 - st.ias / 140); ui.flow('st', !st.stat, 1.4);
    ui.flow('vac', suction > .5, 1.6 - suction / 6);
    ui.attr('vrot', { transform: `translate(590 254) rotate(${(performance.now() / 1000 * st.rpm / 6) % 360})` });
    ui.attr('xRam', { opacity: st.pitot ? 1 : 0 }); ui.attr('xDrn', { opacity: st.drainB ? 1 : 0 }); ui.attr('xSt', { opacity: st.stat ? 1 : 0 });
    for (const g of ['gAI', 'gDG', 'gTB']) ui.cls(g, 'active', ok), ui.cls(g, 'failed', !ok);
    ui.out('ias', `${st.ias} kt`); ui.out('vs', `${st.vs > 0 ? '+' : ''}${st.vs} ft/min`); ui.out('rpm', `${st.rpm}`);
    ui.out('v', `${fmt(st.ias)} kt real · ${fmt(iasInd)} kt indicada`); ui.out('h', `${fmt(st.alt)} ft real · ${fmt(altInd)} ft indicada`); ui.out('suc', `${fmt(suction, 1)} inHg`);
    if (!ui.busy()) ui.hint(st.pitot && st.drainB && st.stat ? 'Todo obstruido: el velocímetro queda clavado y altímetro y variómetro congelados.'
      : st.pitot && st.drainB ? 'Pitot y drenaje tapados: el velocímetro se comporta como un altímetro. Si subís, marca más velocidad; si bajás, menos.'
        : st.pitot ? 'Pitot tapado con el drenaje libre: la presión total se escapa y el velocímetro cae a cero.'
          : st.stat ? 'Estática tapada: altímetro congelado, variómetro en cero. Al subir el velocímetro marca de menos; al bajar, de más.'
            : st.vac || st.rpm < 300 ? 'Sin succión los giróscopos pierden velocidad de a poco y el horizonte y el direccional empiezan a derivar.'
              : suction < 4 ? 'Succión baja. En la prueba de motor (2000 RPM) tiene que estar entre 4 y 6 inHg.'
                : 'Mové la velocidad vertical y la velocidad, y después probá obstruir las tomas.');
  }
  const actions = { clear() { st.pitot = st.drainB = st.stat = st.vac = false; } };
  const read = `<div><span>Velocidad</span><b data-o="v"></b></div><div><span>Altitud</span><b data-o="h"></b></div><div><span>Succión</span><b data-o="suc"></b></div>`;
  return { st, svg, extra, side, read, tips, fine, tick, actions, bind };
}

/* =====================================================================
   4 · MANDOS Y SUPERFICIES
   ===================================================================== */
function controls() {
  const st = { roll: 0, pitch: 0, yaw: 0, trim: 0, flaps: 0, fl: 0 };
  const svg = `<svg viewBox="0 0 640 440" role="img" aria-label="Mandos de vuelo vistos desde arriba: cables del volante a alerones y estabilizador, pedales a timón y rueda de nariz, palanca de flaps y compensador">
<rect width="640" height="440" rx="10" fill="#10232c"/>
<text x="16" y="24" font-size="11" fill="#9fc0ca" letter-spacing="1">MANDOS POR CABLES · VISTA SUPERIOR ESQUEMÁTICA</text>
<path d="M320 44C340 50 346 80 346 130V340L332 372H308L294 340V130C294 80 300 50 320 44Z" fill="#1a2f38" stroke="#3d5a66"/>
<path d="M294 132L40 140V196L294 200ZM346 132L600 140V196L346 200Z" fill="#1a2f38" stroke="#3d5a66"/>
<path d="M230 372H410V396H230Z" fill="#1a2f38" stroke="#3d5a66"/>
<g data-e="ailL"><rect x="58" y="196" width="104" height="14" rx="2" fill="#4a7f95"/></g><g data-e="ailR"><rect x="478" y="196" width="104" height="14" rx="2" fill="#4a7f95"/></g>
<rect data-e="flapL" x="170" y="198" width="120" height="12" rx="2" fill="#7b5f9a"/><rect data-e="flapR" x="350" y="198" width="120" height="12" rx="2" fill="#7b5f9a"/>
<rect data-e="stab" x="232" y="374" width="176" height="20" rx="3" fill="#a77b2c" opacity=".9"/>
<g data-e="rud" transform="translate(320 396) rotate(0)"><rect x="-4" y="0" width="8" height="34" rx="3" fill="#4a9f6a"/></g>
<g data-e="nose" transform="translate(320 64) rotate(0)"><rect x="-5" y="-10" width="10" height="20" rx="3" fill="#cfe3ea"/></g>
<path class="cable" data-c="ail" d="M312 168V188H110V200M328 168V188H530V200" stroke="#7fb3e0"/>
<path class="cable" data-c="stab" d="M316 176V374" stroke="#efb568"/>
<path class="cable" data-c="rudL" d="M300 112V160H304V396" stroke="#7bd38b"/><path class="cable" data-c="rudR" d="M340 112V160H336V396" stroke="#7bd38b"/>
<path class="cable" data-c="nose" d="M320 112V76" stroke="#cfe3ea"/>
<path class="cable" data-c="trim" d="M326 150V374" stroke="#d8a6e0"/>
<path class="cable" data-c="flap" d="M352 214H230M352 214H410" stroke="#b49ad6"/>
<g data-e="yoke"><rect x="300" y="160" width="40" height="8" rx="4" fill="#e4f0f3"/></g><text x="352" y="166" font-size="9" fill="#e4f0f3">volante</text>
<rect x="296" y="106" width="12" height="10" rx="2" fill="#9fd36a"/><rect x="332" y="106" width="12" height="10" rx="2" fill="#9fd36a"/><text x="352" y="114" font-size="9" fill="#e4f0f3">pedales</text>
<text x="360" y="232" font-size="9" fill="#e4f0f3">palanca de flaps</text><text x="250" y="148" font-size="9" fill="#e4f0f3">compensador (techo)</text>
<g font-size="10" font-weight="700"><text data-e="tAilL" x="110" y="232" text-anchor="middle" fill="#7fb3e0"></text><text data-e="tAilR" x="530" y="232" text-anchor="middle" fill="#7fb3e0"></text><text data-e="tFlap" x="230" y="232" text-anchor="middle" fill="#b49ad6"></text><text data-e="tStab" x="226" y="366" text-anchor="end" fill="#efb568"></text><text data-e="tRud" x="340" y="426" fill="#7bd38b"></text><text data-e="tNose" x="336" y="62" fill="#cfe3ea"></text></g>
<g transform="translate(470 290)"><rect x="-10" y="-40" width="170" height="104" rx="8" fill="#0d1a20" stroke="#3d5a66"/><text x="0" y="-24" font-size="9" fill="#9fc0ca">ESTABILIZADOR · VISTA LATERAL</text>
<g data-e="stabSide" transform="translate(30 14) rotate(0)"><path d="M-14 0C-14 -6 -6 -8 0 -8L80 -2V2L0 8C-6 8 -14 6 -14 0Z" fill="#a77b2c"/><g data-e="tab" transform="translate(80 0) rotate(0)"><rect x="0" y="-2" width="26" height="4" rx="1" fill="#d8a6e0"/></g></g>
<circle cx="30" cy="14" r="3" fill="#10232c"/><text data-e="tTab" x="0" y="54" font-size="9" fill="#d8a6e0"></text></g>
</svg>`;
  const side = grp('Volante', `${rg('roll', 'Girar (alerones)', -1, 1, .05, 0)}${rg('pitch', 'Tirar / empujar (estabilizador)', -1, 1, .05, 0)}<div class="toggles">${ac('center', 'Centrar mandos')}</div>`) +
    grp('Pedales, flaps y compensador', `${rg('yaw', 'Pedales (timón y rueda de nariz)', -1, 1, .05, 0)}<p class="sys-label">Flaps (palanca manual)</p>${sg('flaps', travel.flaps.map(v => [v, v + '°']), 'Flaps')}${rg('trim', 'Compensador (nariz abajo ↔ arriba)', -1, 1, .05, 0)}`);
  const tips = ['Etapa 8 · Antes del despegue: mandos libres y en el sentido correcto (verificar en la lista).',
    'Alerones diferenciales: el que sube se mueve el doble que el que baja (30° / 15°). Eso reduce la guiñada adversa.',
    'Estabilizador monobloque con aleta anti-servo: la aleta se mueve en el mismo sentido que el borde de fuga y endurece el mando; el compensador corre su posición neutra.',
    'El flap derecho sirve de escalón solo si está totalmente arriba (Owner\'s Handbook p. 8).'];
  const fine = 'Recorridos: Manual LV-LLS §2 r) (alerones 30°↑/15°↓, estabilizador 18°↑/2°↓, aleta 3°↑/12°↓, timón 27°, rueda de nariz 22°, flaps 0/10/25/40°). Mandos por cables, alerones diferenciales y aleta anti-servo: Owner\'s Handbook p. 7. Trazado de cables, poleas y relación de la aleta anti-servo: esquemáticos. Para ver cómo responde el avión, abrí Cómo vuela → Ejes y mandos.';
  function tick(dt, ui) {
    st.fl += (st.flaps - st.fl) * Math.min(1, dt * 3);
    const r = st.roll, p = st.pitch;
    const ailR = r > 0 ? -travel.aileronUp * r : -travel.aileronDown * r; // + = abajo
    const ailL = r > 0 ? travel.aileronDown * r : travel.aileronUp * r;
    const stab = p > 0 ? travel.stabUp * p : travel.stabDown * p; // + = borde de fuga arriba
    const trimN = st.trim > 0 ? travel.trimDown * st.trim : travel.trimUp * st.trim; // + = aleta abajo (nariz arriba)
    const tab = clamp(-trimN + stab * .6, -travel.trimDown - 10, travel.trimUp + 10); // + = aleta arriba (relativo); relación ilustrativa
    const rud = travel.rudder * st.yaw, nose = travel.noseWheel * st.yaw;
    ui.attr('yoke', { transform: `rotate(${r * 35} 320 164)` });
    ui.cls('ailL', 'up', ailL < -1); ui.cls('ailR', 'up', ailR < -1); ui.cls('ailL', 'down', ailL > 1); ui.cls('ailR', 'down', ailR > 1);
    ui.text('tAilL', `${Math.abs(ailL) < .5 ? '0°' : `${fmt(Math.abs(ailL))}° ${ailL < 0 ? '↑' : '↓'}`}`); ui.text('tAilR', `${Math.abs(ailR) < .5 ? '0°' : `${fmt(Math.abs(ailR))}° ${ailR < 0 ? '↑' : '↓'}`}`);
    ui.attr('flapL', { height: 12 + st.fl * .5 }); ui.attr('flapR', { height: 12 + st.fl * .5 }); ui.text('tFlap', `flaps ${fmt(st.fl)}°`);
    ui.text('tStab', `${Math.abs(stab) < .5 ? '0°' : `${fmt(Math.abs(stab))}° ${stab > 0 ? '↑' : '↓'}`}`);
    ui.attr('rud', { transform: `translate(320 396) rotate(${-rud})` }); ui.text('tRud', `timón ${fmt(Math.abs(rud))}°`);
    ui.attr('nose', { transform: `translate(320 64) rotate(${nose})` }); ui.text('tNose', `${fmt(Math.abs(nose))}°`);
    ui.attr('stabSide', { transform: `translate(30 14) rotate(${-stab})` }); ui.attr('tab', { transform: `translate(80 0) rotate(${-tab})` });
    ui.text('tTab', `aleta ${fmt(Math.abs(tab))}° ${tab > .5 ? '↑' : tab < -.5 ? '↓' : ''} respecto del estabilizador`);
    ui.cable('ail', r * 30); ui.cable('stab', -p * 30); ui.cable('rudL', st.yaw * 30); ui.cable('rudR', -st.yaw * 30); ui.cable('nose', st.yaw * 20); ui.cable('trim', st.trim * 30); ui.cable('flap', st.fl);
    ui.out('roll', r === 0 ? 'centro' : r > 0 ? 'derecha' : 'izquierda'); ui.out('pitch', p === 0 ? 'neutro' : p > 0 ? 'tirar' : 'empujar'); ui.out('yaw', st.yaw === 0 ? 'centro' : st.yaw > 0 ? 'derecho' : 'izquierdo'); ui.out('trim', st.trim === 0 ? 'neutro' : st.trim > 0 ? 'nariz arriba' : 'nariz abajo');
    ui.out('ail', `izq ${fmt(Math.abs(ailL))}° ${ailL < -.5 ? '↑' : ailL > .5 ? '↓' : ''} · der ${fmt(Math.abs(ailR))}° ${ailR < -.5 ? '↑' : ailR > .5 ? '↓' : ''}`);
    ui.out('stab', `${fmt(Math.abs(stab))}° ${stab > .5 ? '↑ (nariz arriba)' : stab < -.5 ? '↓' : ''}`); ui.out('rud', `${fmt(Math.abs(rud))}° · rueda ${fmt(Math.abs(nose))}°`);
    if (!ui.busy()) ui.hint(Math.abs(r) > .1 ? `Girando a la ${r > 0 ? 'derecha' : 'izquierda'}: el alerón ${r > 0 ? 'derecho' : 'izquierdo'} sube ${fmt(travel.aileronUp * Math.abs(r))}° y el otro baja solo ${fmt(travel.aileronDown * Math.abs(r))}°. El que baja genera más resistencia: eso es la guiñada adversa, que se corrige con pedal.`
      : Math.abs(st.yaw) > .1 ? 'Los pedales mueven el timón y, en tierra, la rueda de nariz. Un resorte los centra.'
        : Math.abs(p) > .1 ? 'El estabilizador se mueve entero. La aleta anti-servo acompaña el movimiento y hace que el mando se sienta más firme.'
          : Math.abs(st.trim) > .1 ? 'El compensador mueve la aleta para que el estabilizador quede en la posición deseada sin hacer fuerza en el volante.'
            : 'Mové el volante, los pedales, los flaps o el compensador: los cables se desplazan y las superficies responden.');
  }
  const actions = { center() { st.roll = st.pitch = st.yaw = 0; } };
  const read = `<div><span>Volante</span><b><span data-o="roll"></span> · <span data-o="pitch"></span></b></div><div><span>Alerones</span><b data-o="ail"></b></div><div><span>Estabilizador</span><b data-o="stab"></b></div><div><span>Timón</span><b data-o="rud"></b></div>`;
  return { st, svg, side, read, tips, fine, tick, actions };
}

/* =====================================================================
   5 · TREN Y FRENOS
   ===================================================================== */
function gear() {
  const st = { power: .2, brake: 0, park: false, yaw: 0, v: 0, dist: 0, press: 0 };
  // Trocha 10 ft y distancia entre ejes 6,2 ft (Handbook) → 26 px/ft
  const TR = 10 * 26, WB = 6.2 * 26, cx = 320, ny = 110, my = ny + WB;
  const wheel = (x, y, e) => `<g data-e="${e}" transform="translate(${x} ${y})"><rect x="-9" y="-22" width="18" height="44" rx="6" fill="#222" stroke="#666"/><path class="tread" d="M0 -22V22" stroke="#888" stroke-width="16" stroke-dasharray="2 6"/></g>`;
  const svg = `<svg viewBox="0 0 640 440" role="img" aria-label="Tren triciclo fijo y frenos hidráulicos: palanca, cilindro maestro, depósito, cañerías y discos en las ruedas principales">
<rect width="640" height="440" rx="10" fill="#10232c"/>
<text x="16" y="24" font-size="11" fill="#9fc0ca" letter-spacing="1">TREN TRICICLO FIJO Y FRENOS · VISTA SUPERIOR</text>
<path data-e="path" d="" stroke="#efb56866" stroke-width="2" stroke-dasharray="6 6" fill="none"/>
<path d="M320 60C338 66 342 90 342 130V400H298V130C298 90 302 66 320 60Z" fill="#1a2f38" stroke="#3d5a66"/>
<path d="M298 220L60 228V280L298 284ZM342 220L580 228V280L342 284Z" fill="#1a2f38" stroke="#3d5a66" opacity=".7"/>
${pipe(`M320 168V196H${cx - TR / 2}V${my - 4}`, 'brk', '#e5604a', 5)}${pipe(`M320 196H${cx + TR / 2}V${my - 4}`, 'brk', '#e5604a', 5)}${pipe('M262 138H300V168', 'res', '#e5604a', 4)}
${box(214, 120, 48, 30, 'DEPÓSITO', '')}
<rect x="304" y="150" width="32" height="20" rx="4" fill="#1d3a46" stroke="#9fc0ca"/><text x="356" y="156" font-size="9" fill="#e4f0f3">cilindro maestro</text><text x="356" y="168" font-size="9" fill="#e4f0f3">+ palanca de freno</text>
<g data-e="lever" transform="translate(320 150) rotate(0)"><path d="M0 0V-26" stroke="#efb568" stroke-width="5" stroke-linecap="round"/><circle cy="-26" r="5" fill="#efb568"/></g>
${wheel(cx, ny, 'wN')}${wheel(cx - TR / 2, my, 'wL')}${wheel(cx + TR / 2, my, 'wR')}
<rect data-e="calL" x="${cx - TR / 2 + 10}" y="${my - 8}" width="8" height="16" rx="2" fill="#555"/><rect data-e="calR" x="${cx + TR / 2 - 18}" y="${my - 8}" width="8" height="16" rx="2" fill="#555"/>
<text x="${cx - TR / 2}" y="${my + 40}" text-anchor="middle" font-size="9" fill="#cfe3ea">disco hidráulico</text><text x="${cx + TR / 2}" y="${my + 40}" text-anchor="middle" font-size="9" fill="#cfe3ea">disco hidráulico</text>
<text x="${cx + 16}" y="${ny - 26}" font-size="9" fill="#cfe3ea">rueda de nariz dirigible</text>
<text x="20" y="${my + 74}" font-size="9" fill="#9fc0ca">Trocha 10,0 ft · entre ejes 6,2 ft (Handbook) · neumáticos 6.00×6 a 24 psi</text>
<g transform="translate(470 330)"><rect x="-10" y="-14" width="160" height="96" rx="8" fill="#0d1a20" stroke="#3d5a66"/><text x="0" y="2" font-size="9" fill="#9fc0ca">AMORTIGUADOR ÓLEO-NEUMÁTICO</text>
<rect x="20" y="12" width="16" height="34" rx="2" fill="#5f7f8b"/><rect data-e="piston" x="23" y="40" width="10" height="20" rx="2" fill="#cfe3ea"/><circle data-e="tire" cx="28" cy="68" r="8" fill="#222" stroke="#666"/>
<text x="48" y="28" font-size="9" fill="#cfe3ea">extensión estática</text><text x="48" y="40" font-size="9" fill="#cfe3ea">nariz 3,25″</text><text x="48" y="52" font-size="9" fill="#cfe3ea">principal 4,50″</text></g>
</svg>`;
  const side = grp('Rodaje', `${rg('power', 'Potencia', 0, 1, .05, .2)}${rg('yaw', 'Pedales (dirección)', -1, 1, .05, 0)}`) +
    grp('Freno', `${rg('brake', 'Palanca de freno', 0, 1, .05, 0)}<div class="toggles">${tg('park', 'Freno de estacionamiento')}</div>`);
  const tips = ['Etapa 2: «Rueda y Sistema de Freno — Verificar estado» y «Nivel Liquido de Freno — Verificar cantidad».',
    'Etapa 6 · Rodaje: «Freno de Parqueo — Liberar» y «Frenos — Verificar».',
    'Etapas 7 y 15: freno de parqueo colocado.',
    'Freno de estacionamiento: se tira la palanca y se aprieta el botón (Owner\'s Handbook p. 7).'];
  const fine = 'Owner\'s Handbook págs. 6–7 y 27: ruedas Cleveland 6.00×6, discos hidráulicos, palanca de mano con cilindro maestro, depósito arriba a la izquierda del parallamas, líquido MIL-H-5606, amortiguadores óleo-neumáticos, 24 psi. Rueda de nariz 22° (Manual LV-LLS; el Handbook dice 30°). Discrepancia: la lista de equipos de Chincul menciona frenos de talón dobles. Si el LV-LLS los tiene, también puede frenar cada rueda por separado: confirmar. Aceleración, frenado y radios de giro: ilustrativos.';
  function tick(dt, ui) {
    const lever = st.park ? Math.max(st.brake, .7) : st.brake;
    st.press += (lever - st.press) * Math.min(1, dt * 6);
    const acc = st.power * 6 - .25 * st.v - st.press * 14 * (st.v > .05 ? 1 : 0);
    st.v = clamp(st.v + acc * dt, 0, 20); if (st.press > .5 && st.power < .45 && st.v < .3) st.v = 0;
    if (st.press > .6 && st.power > .45) st.v = Math.min(st.v, .3 * st.power);
    st.dist += st.v * dt * 18;
    const steer = travel.noseWheel * st.yaw;
    ui.attr('wN', { transform: `translate(${cx} ${ny}) rotate(${steer})` });
    for (const e of ['wN', 'wL', 'wR']) ui.dash(e, -st.dist);
    ui.attr('lever', { transform: `translate(320 150) rotate(${-lever * 50})` });
    const c = st.press > .05 ? `hsl(8 ${50 + st.press * 40}% ${35 + st.press * 20}%)` : '#555';
    ui.attr('calL', { fill: c }); ui.attr('calR', { fill: c });
    ui.flow('brk', st.press > .05, 1.2 - st.press * .8); ui.flow('res', Math.abs(lever - st.press) > .02, .5);
    // Trayectoria: radio = entre ejes / tan(dirección)
    if (Math.abs(steer) > .5) {
      const R = WB / Math.tan(rad(Math.abs(steer))), sgn = Math.sign(steer), ox = cx + sgn * R;
      const a1 = rad(70); ui.attr('path', { d: `M${cx} ${my}A${R} ${R} 0 0 ${sgn > 0 ? 1 : 0} ${(ox - sgn * R * Math.cos(a1)).toFixed(1)} ${(my - R * Math.sin(a1)).toFixed(1)}` });
      ui.out('rad', `≈ ${fmt(R / 26 * .3048, 1)} m (ilustrativo)`);
    } else { ui.attr('path', { d: `M${cx} ${my}V40` }); ui.out('rad', 'recto'); }
    const comp = clamp(st.press * st.v * .15 + st.press * .3, 0, 1);
    ui.attr('piston', { y: 40 - comp * 8 }); ui.attr('tire', { cy: 68 - comp * 8 });
    ui.out('power', `${Math.round(st.power * 100)} %`); ui.out('brake', `${Math.round(st.brake * 100)} %`); ui.out('yaw', st.yaw === 0 ? 'centro' : `${st.yaw > 0 ? 'derecho' : 'izquierdo'} ${Math.round(Math.abs(st.yaw) * 100)} %`);
    ui.out('v', `${fmt(st.v, 1)} kt`); ui.out('pr', `${Math.round(st.press * 100)} %`); ui.out('steer', `${fmt(Math.abs(steer))}° ${steer > .5 ? 'a la derecha' : steer < -.5 ? 'a la izquierda' : ''}`);
    if (!ui.busy()) ui.hint(st.park && st.power > .45 ? 'Freno de estacionamiento puesto con potencia alta: así se hace la prueba de motor (etapa 7).'
      : st.park ? 'Freno de estacionamiento colocado: la palanca queda trabada y la presión se mantiene en los discos.'
        : st.press > .1 && st.v > .5 ? 'La palanca empuja líquido del cilindro maestro a los dos discos a la vez: frena las dos ruedas por igual.'
          : Math.abs(steer) > 2 ? 'Los pedales dirigen la rueda de nariz: cuanto más ángulo, más cerrado el giro. El freno de mano frena las dos ruedas por igual: no ayuda a girar.'
            : 'Dale potencia para rodar, dirigí con los pedales y frená con la palanca.');
  }
  const read = `<div><span>Velocidad de rodaje</span><b data-o="v"></b></div><div><span>Presión de freno</span><b data-o="pr"></b></div><div><span>Rueda de nariz</span><b data-o="steer"></b></div><div><span>Radio de giro</span><b data-o="rad"></b></div>`;
  return { st, svg, side, read, tips, fine, tick };
}

/* =====================================================================
   6 · MOTOR, HÉLICE Y ACCESORIOS
   ===================================================================== */
function power() {
  const st = { throttle: .25, mixture: 1, mag: 'both', carb: false, running: true, rpm: 1000, ang: 0, phase: 0, dropL: null, dropR: null, oil: 70, info: '' };
  const cyl = [[150, 168, 'L'], [150, 238, 'L'], [400, 196, 'R'], [400, 266, 'R']];
  const ACC = {
    mag: ['Magnetos (2)', 'Dos generadores independientes de chispa, movidos por el motor. Cada uno alimenta una bujía de cada cilindro: si falla uno, el otro mantiene el encendido con una pequeña caída de RPM.', 'Owner\'s Handbook p. 5 · Lista, etapa 7'],
    alt: ['Alternador', 'Movido por correa. Genera la electricidad cuando el motor gira (60 A según el Manual LV-LLS). Lista, etapa 2: «Correa de alternador — Verificar tensión».', 'Manual LV-LLS · Lista del aeroclub'],
    vac: ['Bomba de vacío', 'Accionada por el motor. Aspira aire a través de los giróscopos. Lista, etapa 7: succión entre 4 y 6 inHg.', 'Owner\'s Handbook p. 5 y 16'],
    fpump: ['Bomba de combustible mecánica', 'De diafragma, movida por el motor. La bomba eléctrica está en serie como respaldo.', 'Owner\'s Handbook p. 5 y 8'],
    carb: ['Carburador de flotante', 'Mezcla aire y nafta en el venturi. Puede formar hielo: por eso existe el calefactor.', 'Owner\'s Handbook p. 5'],
    starter: ['Motor de arranque', 'Motor eléctrico con reducción que hace girar el cigüeñal para arrancar. Toma mucha corriente de la batería.', 'Owner\'s Handbook p. 5'],
    exh: ['Escape y manguitos de calor', 'Escape de acero inoxidable con un manguito que calienta el aire para la cabina y para el carburador.', 'Owner\'s Handbook p. 5'],
    prop: ['Hélice Sensenich', 'Metálica, dos palas, paso fijo, directa al cigüeñal: las RPM del motor son las de la hélice. Diámetro 184,15 a 187,96 cm.', 'Manual LV-LLS']
  };
  const hot = (k, inner) => `<g class="sys-hot" data-acc="${k}" tabindex="0" role="button" aria-label="${ACC[k][0]}">${inner}</g>`;
  const svg = `<svg viewBox="0 0 640 440" role="img" aria-label="Motor Lycoming O-320 de cuatro cilindros opuestos visto desde arriba, con hélice, magnetos, alternador, bomba de vacío, bomba de combustible, carburador y escape">
<rect width="640" height="440" rx="10" fill="#10232c"/>
<text x="16" y="24" font-size="11" fill="#9fc0ca" letter-spacing="1">LYCOMING O-320 · 150 HP · VISTA SUPERIOR ESQUEMÁTICA</text>
${hot('prop', `<rect x="300" y="46" width="40" height="22" rx="10" fill="#cfd6d6"/><g data-e="prop" transform="translate(320 56) scale(1 1)"><path d="M-170 -4Q-90 -10 0 -4V4Q-90 10 -170 4ZM170 -4Q90 -10 0 -4V4Q90 10 170 4Z" fill="#8f9a9c" stroke="#cfd6d6"/></g>`)}
<rect x="250" y="80" width="140" height="220" rx="14" fill="#3a4448" stroke="#7f8b8f"/><text x="320" y="196" text-anchor="middle" font-size="10" fill="#cfd6d6">cárter</text>
<path data-e="crank" d="M320 70V300" stroke="#cfd6d6" stroke-width="5" stroke-dasharray="12 6"/>
${cyl.map(([x, y, s], i) => `<g data-e="cyl${i}"><rect x="${x}" y="${y}" width="100" height="52" rx="6" fill="#55636a" stroke="#93a2a8"/>${Array.from({ length: 8 }, (_, j) => `<path d="M${x + 10 + j * 11} ${y}V${y + 52}" stroke="#41505a" stroke-width="3"/>`).join('')}<circle data-e="pa${i}" cx="${s === 'L' ? x + 14 : x + 86}" cy="${y + 14}" r="5" fill="#333"/><circle data-e="pb${i}" cx="${s === 'L' ? x + 14 : x + 86}" cy="${y + 38}" r="5" fill="#333"/></g>`).join('')}
${hot('starter', box(170, 90, 70, 30, 'ARRANQUE', ''))}${hot('alt', `<circle cx="440" cy="112" r="20" fill="#1d3a46" stroke="#9fc0ca"/><g data-e="altr" transform="translate(440 112)"><path d="M-12 0H12M0 -12V12" stroke="#5f7f8b" stroke-width="4"/></g><path d="M340 96L428 98M340 128L428 126" stroke="#7f8b8f" stroke-width="2"/><text x="466" y="116" font-size="10" fill="#e4f0f3">ALTERNADOR</text>`)}
${hot('mag', `<circle cx="285" cy="326" r="16" fill="#6a3f2a" stroke="#c98d6b"/><circle cx="355" cy="326" r="16" fill="#6a3f2a" stroke="#c98d6b"/><text x="285" y="330" text-anchor="middle" font-size="10" fill="#fff">L</text><text x="355" y="330" text-anchor="middle" font-size="10" fill="#fff">R</text><text x="320" y="356" text-anchor="middle" font-size="10" fill="#e4f0f3">MAGNETOS</text>`)}
<path data-e="wL" d="M285 310C250 300 180 200 164 182M285 310C240 300 180 270 164 252M285 310C330 280 470 230 486 210M285 310C340 300 470 290 486 280" stroke="#d98a5f" stroke-width="1.5" fill="none" opacity=".6"/>
<path data-e="wR" d="M355 310C300 280 180 230 164 206M355 310C300 300 180 300 164 276M355 310C380 260 470 200 486 182M355 310C390 290 470 270 486 252" stroke="#e7c06a" stroke-width="1.5" fill="none" opacity=".6"/>
${hot('vac', `<circle cx="320" cy="388" r="16" fill="#1d3a46" stroke="#9fd36a"/><g data-e="vacr" transform="translate(320 388)"><path d="M-10 0H10M0 -10V10" stroke="#9fd36a" stroke-width="3"/></g><text x="342" y="392" font-size="10" fill="#e4f0f3">BOMBA DE VACÍO</text>`)}
${hot('fpump', box(170, 372, 90, 32, 'BOMBA COMB.', 'mecánica'))}
${hot('carb', box(460, 372, 110, 32, 'CARBURADOR', 'debajo del motor'))}
${hot('exh', `<path d="M200 300C210 330 230 340 250 344M450 318C440 336 420 342 390 346" stroke="#a46a3a" stroke-width="7" fill="none"/><rect x="40" y="300" width="110" height="40" rx="6" fill="#3a2a1a" stroke="#a46a3a"/><text x="95" y="316" text-anchor="middle" font-size="10" fill="#f0d79a">ESCAPE + MANGUITOS</text><text x="95" y="330" text-anchor="middle" font-size="9" fill="#d7b98a">calor a cabina y carburador</text>`)}
${pipe('M150 320H206', 'heat', '#ff9a5c', 5)}
<g data-e="air"><text x="580" y="424" text-anchor="end" font-size="9" fill="#9fc0ca" data-e="airT"></text></g>
</svg>`;
  const side = grp('Mandos de motor', `${rg('throttle', 'Acelerador', 0, 1, .01, .25)}${rg('mixture', 'Mezcla (atrás = corte)', 0, 1, .01, 1)}<p class="sys-label">Magnetos</p>${sg('mag', [['off', 'OFF'], ['right', 'R'], ['left', 'L'], ['both', 'BOTH']], 'Llave de magnetos')}<div class="toggles">${tg('carb', 'Calefactor de carburador')}${ac('start', 'Arrancar')}${ac('runup', 'Prueba de motor 2000 RPM')}</div>`) +
    `<div class="sys-group"><h3>Tocá un accesorio</h3><p class="sys-acc" data-o="acc">Cada pieza del dibujo explica qué hace.</p></div>`;
  const tips = ['Etapa 7 · Prueba de motor a 2000 RPM: caída máxima de magnetos 175 RPM y diferencia máxima entre ambos 50 RPM.',
    'Etapa 4: 1000 RPM después de la puesta en marcha. Etapa 15: 1100 RPM antes de cortar la mezcla.',
    'Mezcla push-pull: adelante rica, atrás del todo corte (Owner\'s Handbook p. 6).'];
  const fine = 'Lycoming O-320-E2A u O-320-E3D, 150 HP a 2700 RPM y hélice Sensenich de paso fijo: Manual LV-LLS. Accesorios: Owner\'s Handbook p. 5. Posiciones de los accesorios y cableado de bujías: esquemáticos. RPM, caídas y presiones: ilustrativas. La hélice gira en cámara lenta para que se vea.';
  function tick(dt, ui) {
    if (st.mag === 'off' || st.mixture < .12) { if (st.running) ui.say(st.mag === 'off' ? 'Magnetos en OFF: sin chispa, el motor se detiene.' : 'Mezcla cortada: sin combustible, el motor se detiene. Así se apaga (etapa 15).'); st.running = false; }
    let target = 0;
    if (st.running) {
      target = 600 + st.throttle * 1750;
      if (st.mixture < .5) target *= .55 + .9 * (st.mixture - .12);
      if (st.mag === 'left') target -= 105 * (st.rpm / 2000);
      if (st.mag === 'right') target -= 125 * (st.rpm / 2000);
      if (st.carb) target -= 80 * (st.rpm / 2000);
    }
    st.rpm += (target - st.rpm) * Math.min(1, dt * (st.running ? 2.2 : 1.2));
    const base = 600 + st.throttle * 1750;
    if (st.running && Math.abs(base - 2000) < 70 && Math.abs(target - st.rpm) < 15 && !st.carb && st.mixture > .9) {
      if (st.mag === 'left') st.dropL = Math.round(base - st.rpm);
      if (st.mag === 'right') st.dropR = Math.round(base - st.rpm);
    }
    st.oil += ((st.running ? clamp(32 + st.rpm / 2700 * 52, 0, 86) : 0) - st.oil) * Math.min(1, dt * .8);
    const rev = st.rpm / 2700 * 2.2; // vueltas por segundo en cámara lenta
    st.ang += rev * 360 * dt; st.phase += rev * 2 * dt;
    ui.attr('prop', { transform: `translate(320 56) scale(${Math.cos(rad(st.ang)).toFixed(3)} 1)` });
    ui.attr('altr', { transform: `translate(440 112) rotate(${st.ang * 2.4 % 360})` }); ui.attr('vacr', { transform: `translate(320 388) rotate(${st.ang * 1.3 % 360})` });
    ui.dash('crank', -st.ang / 10);
    const firing = st.running ? [0, 2, 1, 3][Math.floor(st.phase) % 4] : -1;
    cyl.forEach((_, i) => {
      const on = i === firing && (st.phase % 1) < .45;
      ui.attr('pa' + i, { fill: on && (st.mag === 'both' || st.mag === 'left') ? '#ffe28a' : '#333' });
      ui.attr('pb' + i, { fill: on && (st.mag === 'both' || st.mag === 'right') ? '#ffe28a' : '#333' });
      ui.cls('cyl' + i, 'fire', on);
    });
    ui.attr('wL', { opacity: st.running && (st.mag === 'both' || st.mag === 'left') ? .9 : .15 });
    ui.attr('wR', { opacity: st.running && (st.mag === 'both' || st.mag === 'right') ? .9 : .15 });
    ui.flow('heat', st.running && st.carb, .7);
    ui.text('airT', st.carb ? 'aire caliente al carburador (sin filtrar)' : 'aire frío filtrado al carburador');
    const suction = st.running ? clamp(1.5 + st.rpm / 2000 * 3.5, 0, 5.6) : 0;
    ui.out('throttle', `${Math.round(st.throttle * 100)} %`); ui.out('mixture', st.mixture < .12 ? 'corte' : st.mixture > .9 ? 'rica' : `${Math.round(st.mixture * 100)} %`);
    ui.out('rpm', `${fmt(st.rpm)} RPM${st.rpm > engine.rpmMax ? ' (¡sobre la línea roja!)' : ''}`); ui.out('oil', `${fmt(st.oil)} psi`); ui.out('suc', `${fmt(suction, 1)} inHg`);
    ui.out('alt', st.running && st.rpm > 900 ? 'genera' : 'no genera');
    const okL = st.dropL != null && st.dropL <= engine.magDropMax, okR = st.dropR != null && st.dropR <= engine.magDropMax;
    ui.out('drops', st.dropL == null && st.dropR == null ? 'a 2000 RPM, pasá a L y a R' : `L −${st.dropL ?? '?'} · R −${st.dropR ?? '?'}${st.dropL != null && st.dropR != null ? ` · dif. ${Math.abs(st.dropL - st.dropR)} ${okL && okR && Math.abs(st.dropL - st.dropR) <= engine.magDiffMax ? '✓' : '✗'}` : ''}`);
    if (!ui.busy()) ui.hint(!st.running ? 'Motor detenido. Mezcla rica, magnetos en BOTH y «Arrancar».'
      : st.mag === 'left' || st.mag === 'right' ? `Con un solo magneto encienden la mitad de las bujías: la combustión es más lenta y caen las RPM. Límite: ${engine.magDropMax} RPM de caída y ${engine.magDiffMax} de diferencia.`
        : st.carb ? 'Con el calefactor entra aire caliente y menos denso: las RPM bajan un poco. En la prueba se verifica esa caída.'
          : st.mixture < .5 ? 'Mezcla muy pobre: el motor pierde potencia.'
            : 'Dos bujías por cilindro, una de cada magneto. La hélice va directa al cigüeñal.');
  }
  const actions = {
    start(ui) { if (st.running) return ui.say('El motor ya está en marcha.'); if (st.mag === 'off' || st.mixture < .55) return ui.say('Para arrancar: mezcla rica y magnetos en BOTH.'); st.running = true; st.rpm = 300; ui.say('Arrancó. Llevalo a 1000 RPM (etapa 4).'); },
    runup(ui) { st.throttle = (2000 - 600) / 1750; st.mag = 'both'; st.carb = false; st.mixture = 1; ui.say('A 2000 RPM. Pasá a L, volvé a BOTH, pasá a R y volvé a BOTH.'); }
  };
  const read = `<div><span>Tacómetro</span><b data-o="rpm"></b></div><div><span>Presión de aceite</span><b data-o="oil"></b></div><div><span>Succión</span><b data-o="suc"></b></div><div><span>Alternador</span><b data-o="alt"></b></div><div><span>Prueba de magnetos</span><b data-o="drops"></b></div>`;
  function bind(host) {
    const show = k => { const [t, d, src] = ACC[k]; host.querySelector('[data-o=acc]').innerHTML = `<b>${t}.</b> ${d}<small>${src}</small>`; host.querySelectorAll('.sys-hot').forEach(g => g.classList.toggle('on', g.dataset.acc === k)); };
    host.querySelectorAll('.sys-hot').forEach(g => { g.addEventListener('click', () => show(g.dataset.acc)); g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show(g.dataset.acc); } }); });
  }
  return { st, svg, side, read, tips, fine, tick, actions, bind };
}

/* =====================================================================
   7 · CABINA: LUCES, CALEFACCIÓN Y VENTILACIÓN
   ===================================================================== */
function cabin() {
  const st = { nav: false, bcn: true, land: false, panel: false, heat: 0, defrost: 0, fresh: .3, oat: 5, running: true, cabinT: 12, t: 0 };
  const svg = `<svg viewBox="0 0 640 440" role="img" aria-label="Luces exteriores y circuito de calefacción y ventilación de la cabina">
<rect width="640" height="440" rx="10" fill="#0c1a21"/>
<text x="16" y="24" font-size="11" fill="#9fc0ca" letter-spacing="1">LUCES, CALEFACCIÓN Y VENTILACIÓN · VISTA SUPERIOR</text>
<path d="M320 50C342 56 348 90 348 140V350L334 380H306L292 350V140C292 90 298 56 320 50Z" fill="#1a2f38" stroke="#3d5a66"/>
<path d="M292 150L40 160V214L292 220ZM348 150L600 160V214L348 220Z" fill="#1a2f38" stroke="#3d5a66"/><path d="M236 380H404V402H236Z" fill="#1a2f38" stroke="#3d5a66"/><path d="M316 380H324V420H316Z" fill="#1a2f38" stroke="#3d5a66"/>
<circle data-e="glowL" cx="40" cy="186" r="26" fill="#ff3b3b" opacity="0"/><circle data-e="nL" cx="40" cy="186" r="6" fill="#4a2020"/>
<circle data-e="glowR" cx="600" cy="186" r="26" fill="#3bff7a" opacity="0"/><circle data-e="nR" cx="600" cy="186" r="6" fill="#204a2a"/>
<circle data-e="glowT" cx="320" cy="420" r="20" fill="#fff" opacity="0"/><circle data-e="nT" cx="320" cy="420" r="5" fill="#444"/>
<circle data-e="glowB" cx="320" cy="392" r="30" fill="#ff4a3a" opacity="0"/><circle data-e="nB" cx="320" cy="392" r="5" fill="#4a2020"/>
<path data-e="beam" d="M320 54L270 0H370Z" fill="#fff6c8" opacity="0"/>
<text x="40" y="236" text-anchor="middle" font-size="9" fill="#ff9a9a">roja · izq.</text><text x="600" y="236" text-anchor="middle" font-size="9" fill="#9affb8">verde · der.</text><text x="350" y="426" font-size="9" fill="#cfe3ea">blanca · cola</text>
<text x="352" y="388" font-size="9" fill="#ffb4a2">anticolisión (ubicación a confirmar)</text><text x="380" y="44" font-size="9" fill="#fff6c8">luz de aterrizaje (ubicación a confirmar)</text>
<rect x="296" y="64" width="48" height="56" rx="6" fill="#2a2310" stroke="#8a6d2b"/><text x="320" y="88" text-anchor="middle" font-size="9" fill="#f0d79a">MOTOR</text>
<path d="M330 118V128" stroke="#a46a3a" stroke-width="6"/><rect x="314" y="124" width="28" height="12" rx="3" fill="#a46a3a"/><text x="356" y="134" font-size="9" fill="#d7b98a">manguito de calor en el escape</text>
${pipe('M318 136V156H300V232', 'heat', '#ff9a5c', 7)}${pipe('M300 158H272V146', 'defr', '#ffc39a', 5)}${pipe('M120 176H292', 'fresh', '#7fd0ff', 6)}
<rect x="296" y="232" width="48" height="96" rx="6" fill="#203640" stroke="#5f7f8b"/><text x="320" y="252" text-anchor="middle" font-size="9" fill="#e4f0f3">CABINA</text><text data-e="tC" x="320" y="290" text-anchor="middle" font-size="14" font-weight="700" fill="#efb568"></text>
<text x="230" y="140" font-size="9" fill="#ffc39a">desempañador</text><text x="110" y="170" font-size="9" fill="#7fd0ff">aire fresco</text>
<g data-e="co" opacity="0"><rect x="380" y="250" width="230" height="48" rx="6" fill="#5a1a14" stroke="#e5604a"/><text x="392" y="270" font-size="10" font-weight="700" fill="#ffd0c2">Si el manguito tiene una fisura,</text><text x="392" y="286" font-size="10" fill="#ffd0c2">puede entrar monóxido de carbono (CO).</text></g>
</svg>`;
  const side = grp('Luces', `<div class="toggles">${tg('nav', 'Luces de navegación')}${tg('bcn', 'Anticolisión')}${tg('land', 'Luz de aterrizaje')}${tg('panel', 'Luces de cabina')}</div>`) +
    grp('Calefacción y ventilación', `${rg('heat', 'Calefacción de cabina', 0, 1, .05, 0)}${rg('defrost', 'Desempañador', 0, 1, .05, 0)}${rg('fresh', 'Aire fresco', 0, 1, .05, .3)}${rg('oat', 'Temperatura exterior (°C)', -10, 35, 1, 5)}<div class="toggles">${tg('running', 'Motor en marcha')}${ac('leak', 'Fisura en el manguito')}</div>`);
  const tips = ['Etapa 2: «Borde Marginal y Luz — Verificar estado» y «Luz Anticolisión — Verificar estado». Etapa 4: «Luz Anticolisión — Conectar (ON)».',
    'Etapa 6: «Luces de Nav y Cabina — A Requerimiento». Etapas 8 y 13: «Luz de Aterrizaje — Conectar (ON)»; etapas 10 y 14: Off.',
    'Etapa 7: «Calefacción de Cabina — Cerrado». Emergencia 5 · Fuego eléctrico: «Calefacción de cabina — Cerrar».',
    'Etapa 15: «Luz de Navegación, Anticolisión y Cabina — Off».',
    'Radio: 121,5 MHz es la frecuencia aeronáutica de emergencia. Transponder: 7600 pérdida de comunicaciones, 7700 emergencia (material del aeroclub). Modelos instalados en el LV-LLS: a confirmar. Probalos en la Cabina.'];
  const fine = 'Calefacción por manguito sobre el escape, desempañador y tomas de aire fresco: Owner\'s Handbook págs. 10–11 (PA-28-140 genérico). Colores de las luces de navegación: norma general. Ubicación de la anticolisión y la luz de aterrizaje en el LV-LLS: a confirmar. Temperaturas: ilustrativas. Riesgo de CO por fisura en el escape: concepto general (FAA).';
  let leak = 0;
  function tick(dt, ui) {
    st.t += dt; leak = Math.max(0, leak - dt * .05);
    const heatIn = st.running ? (st.heat + st.defrost * .4) * 38 : 0;
    const target = st.oat + heatIn * (1 - st.fresh * .45) + 4 - st.fresh * 3;
    st.cabinT += (target - st.cabinT) * Math.min(1, dt * .25);
    const blink = (st.t % 1.1) < .12;
    ui.attr('glowL', { opacity: st.nav ? .45 : 0 }); ui.attr('nL', { fill: st.nav ? '#ff5050' : '#4a2020' });
    ui.attr('glowR', { opacity: st.nav ? .45 : 0 }); ui.attr('nR', { fill: st.nav ? '#50ff8a' : '#204a2a' });
    ui.attr('glowT', { opacity: st.nav ? .35 : 0 }); ui.attr('nT', { fill: st.nav ? '#fff' : '#444' });
    ui.attr('glowB', { opacity: st.bcn && blink ? .7 : 0 }); ui.attr('nB', { fill: st.bcn && blink ? '#ff6a5a' : '#4a2020' });
    ui.attr('beam', { opacity: st.land ? .35 : 0 });
    ui.flow('heat', st.running && st.heat > .02, 1.4 - st.heat); ui.flow('defr', st.running && st.defrost > .02, 1.4 - st.defrost); ui.flow('fresh', st.fresh > .02, 1.4 - st.fresh);
    ui.text('tC', `${fmt(st.cabinT)} °C`); ui.attr('co', { opacity: leak > 0 && st.heat > .05 ? 1 : 0 });
    let amps = 0; for (const [k, a] of [['nav', 1.5], ['bcn', 2], ['land', 8], ['panel', 1]]) if (st[k]) amps += a;
    ui.out('heat', `${Math.round(st.heat * 100)} %`); ui.out('defrost', `${Math.round(st.defrost * 100)} %`); ui.out('fresh', `${Math.round(st.fresh * 100)} %`); ui.out('oat', `${st.oat} °C`);
    ui.out('amps', `${fmt(amps, 1)} A (ilustrativo)`); ui.out('cab', `${fmt(st.cabinT)} °C`);
    if (!ui.busy()) ui.hint(leak > 0 && st.heat > .05 ? 'Si sentís olor a escape, dolor de cabeza o somnolencia con la calefacción abierta: cerrala y abrí el aire fresco.'
      : !st.running && st.heat > .05 ? 'Sin motor no hay calor: el manguito toma la temperatura del escape.'
        : st.land ? 'La luz de aterrizaje es el consumidor más grande del panel: se apaga después del despegue (etapa 10).'
          : 'El calor sale del escape: el aire pasa por un manguito alrededor del caño y entra a la cabina sin mezclarse con los gases.');
  }
  const actions = { leak(ui) { leak = 1; ui.say('Simulación: fisura en el manguito de calor.'); } };
  const read = `<div><span>Temperatura en cabina</span><b data-o="cab"></b></div><div><span>Consumo de luces</span><b data-o="amps"></b></div>`;
  return { st, svg, side, read, tips, fine, tick, actions };
}

const SYS = { combustible: fuel, electrico: electrical, instrumentos: instruments, mandos: controls, rodaje: gear, potencia: power, cabina: cabin };
export const animatedSystems = Object.keys(SYS);

/* ---------- montaje común ---------- */
export function mountSystem(host, id) {
  const S = (SYS[id] || fuel)();
  const st = S.st; const events = new AbortController(); let paused = matchMedia('(prefers-reduced-motion: reduce)').matches;
  host.innerHTML = `<div class="sys-lab" data-paused="${paused}"><div class="sys-visual"><button class="chip" data-system-pause aria-pressed="${paused}">${paused ? 'Animar sistema' : 'Pausar sistema'}</button>${S.svg}${S.extra || ''}<p class="sys-msg" role="status" aria-live="polite" data-o="msg"></p></div>
<div class="sys-side">${S.side}<div class="aero-readout">${S.read}</div></div>
<div class="sys-foot"><ul class="tips">${S.tips.map(t => `<li>${t}</li>`).join('')}</ul><p class="fine-print">${S.fine}</p></div></div>`;
  const q = s => host.querySelector(s), qa = s => host.querySelectorAll(s);
  const cache = new Map();
  const el = (attr, k) => { const key = attr + k; if (!cache.has(key)) cache.set(key, [...qa(`[${attr}="${k}"]`)]); return cache.get(key); };
  let sayUntil = 0, lastMsg = '';
  const msgEl = q('[data-o=msg]');
  const setMsg = t => { if (t !== lastMsg) { msgEl.textContent = t; lastMsg = t; } };
  const ui = {
    flow(k, on, dur = 1, rev = false) { for (const e of el('data-f', k)) { e.classList.toggle('on', !!on); e.classList.toggle('rev', !!rev); if (on) e.style.animationDuration = `${clamp(dur, .2, 99).toFixed(2)}s`; } },
    attr(k, o) { for (const e of el('data-e', k)) for (const [a, v] of Object.entries(o)) e.setAttribute(a, typeof v === 'number' ? +v.toFixed(2) : v); },
    text(k, t) { for (const e of el('data-e', k)) if (e.textContent !== t) e.textContent = t; },
    cls(k, c, on) { for (const e of el('data-e', k)) e.classList.toggle(c, !!on); },
    dash(k, off) { for (const e of el('data-e', k)) { const t = e.matches('.tread,[data-e=crank]') ? e : e.querySelector('.tread'); if (t) t.style.strokeDashoffset = off.toFixed(1); } },
    cable(k, off) { for (const e of el('data-c', k)) e.style.strokeDashoffset = off.toFixed(1); },
    needle(k, v) { for (const e of el('data-g', k)) { const mn = +e.dataset.min, mx = +e.dataset.max, a = -120 + (clamp(v, mn, mx) - mn) / (mx - mn) * 240, [, tr] = e.getAttribute('transform').match(/^(translate\([^)]*\))/) || []; e.setAttribute('transform', `${tr} rotate(${a.toFixed(1)})`); } },
    out(k, t) { for (const e of el('data-o', k)) if (e.textContent !== t) e.textContent = t; },
    say(t) { setMsg(t); sayUntil = performance.now() + 4500; },
    hint(t) { setMsg(t); },
    busy: () => performance.now() < sayUntil
  };
  const sync = () => {
    qa('[data-t]').forEach(b => b.setAttribute('aria-pressed', String(!!st[b.dataset.t])));
    qa('[data-s]').forEach(b => b.setAttribute('aria-pressed', String(String(st[b.dataset.s]) === b.dataset.v)));
    qa('[data-r]').forEach(r => { if (document.activeElement !== r && +r.value !== st[r.dataset.r]) r.value = st[r.dataset.r]; });
  };
  host.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b || !host.contains(b)) return;
    if ('systemPause' in b.dataset) { paused = !paused; b.setAttribute('aria-pressed',paused); b.textContent = paused ? 'Animar sistema' : 'Pausar sistema'; q('.sys-lab').dataset.paused = paused; }
    if (b.dataset.t) st[b.dataset.t] = !st[b.dataset.t];
    else if (b.dataset.s) { const v = b.dataset.v; st[b.dataset.s] = isNaN(+v) ? v : +v; }
    else if (b.dataset.a) S.actions?.[b.dataset.a]?.(ui);
    sync();
  }, {signal:events.signal});
  host.addEventListener('input', e => { const r = e.target.closest('[data-r]'); if (r) st[r.dataset.r] = +r.value; }, {signal:events.signal});
  S.bind?.(host);
  sync();
  // Salidas de los deslizadores que el sistema no formatea: valor crudo
  const written = new Set(), out0 = ui.out;
  ui.out = (k, t) => { written.add(k); out0(k, t); };
  let last = performance.now(), n = 0, plain = null;
  const frame = () => {
    const now = performance.now(), dt = Math.min(.5, (now - last) / 1000); last = now;
    if (document.hidden) return;
    S.tick(paused ? 0 : dt, ui);
    plain ??= [...qa('[data-r]')].filter(r => !written.has(r.dataset.r)).map(r => [r.dataset.r, +r.step < 1 ? 1 : 0]);
    for (const [k, d] of plain) out0(k, fmt(st[k], d));
    if (++n % 10 === 0) sync();
  };
  frame();
  const timer = setInterval(frame, 33);
  return () => {clearInterval(timer);events.abort();};
}
