// Instrumentos analógicos en SVG, dibujados para este proyecto.
// Cada fábrica devuelve { svg: string, bind(root): update(state) }.
// Las marcas de color salen del Manual de Vuelo LV-LLS (ver data/lvlls.js).
import { speeds, engine } from './data/lvlls.js';

let uid = 0;
const R = d => d * Math.PI / 180;
const P = (r, a, c = 100) => [c + r * Math.sin(R(a)), c - r * Math.cos(R(a))];
const f = n => Math.round(n * 100) / 100;
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

function arc(r, a1, a2, c = 100) {
  const [x1, y1] = P(r, a1, c), [x2, y2] = P(r, a2, c);
  return `M${f(x1)} ${f(y1)}A${r} ${r} 0 ${Math.abs(a2 - a1) > 180 ? 1 : 0} 1 ${f(x2)} ${f(y2)}`;
}
function tick(r1, r2, a, w = 1.6, color = '#f2f2ea') {
  const [x1, y1] = P(r1, a), [x2, y2] = P(r2, a);
  return `<path d="M${f(x1)} ${f(y1)}L${f(x2)} ${f(y2)}" stroke="${color}" stroke-width="${w}" stroke-linecap="butt"/>`;
}
function label(r, a, text, size = 13, color = '#f2f2ea', weight = 600) {
  const [x, y] = P(r, a);
  return `<text x="${f(x)}" y="${f(y)}" font-size="${size}" fill="${color}" font-weight="${weight}" text-anchor="middle" dominant-baseline="central">${text}</text>`;
}

// Bisel, tornillos, esfera y vidrio comunes a todos los instrumentos redondos.
function shell(inner, { title = '', id = ++uid, over = '' } = {}) {
  const k = 'i' + id;
  const screws = [45, 135, 225, 315].map(a => {
    const [x, y] = P(95, a);
    return `<g transform="translate(${f(x)} ${f(y)})"><circle r="4.6" fill="url(#${k}s)" stroke="#0a0a0a" stroke-width=".6"/><path d="M-3 -1.2L3 1.2" stroke="#1b1b1b" stroke-width="1.2" transform="rotate(${a * 1.7})"/></g>`;
  }).join('');
  return `<svg viewBox="0 0 200 200" class="inst" role="img" aria-label="${title}" font-family="'Helvetica Neue',Arial,sans-serif">
<defs>
 <radialGradient id="${k}b" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="#5b5f61"/><stop offset=".55" stop-color="#25282a"/><stop offset="1" stop-color="#0c0d0e"/></radialGradient>
 <radialGradient id="${k}f" cx="50%" cy="45%" r="60%"><stop offset="0" stop-color="#232526"/><stop offset="1" stop-color="#0d0e0f"/></radialGradient>
 <linearGradient id="${k}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset=".45" stop-color="#fff" stop-opacity=".03"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
 <radialGradient id="${k}s" cx="35%" cy="35%"><stop offset="0" stop-color="#c9cbc8"/><stop offset="1" stop-color="#55585a"/></radialGradient>
 <clipPath id="${k}c"><circle cx="100" cy="100" r="86"/></clipPath>
 <filter id="${k}d" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="1.2" dy="1.8" stdDeviation="1.2" flood-opacity=".7"/></filter>
</defs>
<rect x="2" y="2" width="196" height="196" rx="14" fill="url(#${k}b)"/>
<rect x="2.5" y="2.5" width="195" height="195" rx="13.5" fill="none" stroke="#6d7174" stroke-opacity=".5"/>
${screws}
<circle cx="100" cy="100" r="89" fill="#050505"/>
<circle cx="100" cy="100" r="86" fill="url(#${k}f)"/>
<g clip-path="url(#${k}c)">${inner(k)}</g>
${over}
<circle cx="100" cy="100" r="86" fill="url(#${k}g)" pointer-events="none"/>
<path d="M30 60A80 80 0 0 1 120 18" stroke="#fff" stroke-opacity=".12" stroke-width="6" fill="none" stroke-linecap="round" pointer-events="none"/>
</svg>`;
}
const needle = (len = 74, tail = 18, w = 3.2, color = '#f4f1e6', k = '') =>
  `<g filter="url(#${k}d)"><path d="M${-w} ${tail}L${-w * .7} ${-len + 10}L0 ${-len}L${w * .7} ${-len + 10}L${w} ${tail}Z" fill="${color}"/><circle r="7" fill="#1a1b1c" stroke="#555" stroke-width="1"/><circle r="2.2" fill="#888"/></g>`;
const rot = (el, a) => el && el.setAttribute('transform', `translate(100 100) rotate(${f(a)})`);

/* ---------- Velocímetro (nudos) ---------- */
const asiAngle = v => v <= 40 ? -172 + (Math.max(0, v) / 40) * 18 : -154 + (Math.min(v, 175) - 40) / 135 * 312;
export function airspeed() {
  const a = speeds.arcs;
  const svg = shell(k => {
    let s = '';
    s += `<path d="${arc(70, asiAngle(a.white[0]), asiAngle(a.white[1]))}" stroke="#f4f4f0" stroke-width="5.5" fill="none"/>`;
    s += `<path d="${arc(77.5, asiAngle(a.green[0]), asiAngle(a.green[1]))}" stroke="#25a346" stroke-width="7" fill="none"/>`;
    s += `<path d="${arc(77.5, asiAngle(a.yellow[0]), asiAngle(a.yellow[1]))}" stroke="#f0c419" stroke-width="7" fill="none"/>`;
    s += tick(70, 85, asiAngle(a.red), 3.4, '#e5322d');
    for (let v = 40; v <= 170; v += 5) s += tick(v % 10 ? 76 : 71, 85, asiAngle(v), v % 10 ? 1.2 : 2);
    for (let v = 40; v <= 160; v += 20) s += label(57, asiAngle(v), v, 15);
    s += `<text x="100" y="72" font-size="9" fill="#d8d8d0" text-anchor="middle" letter-spacing="1.5">AIRSPEED</text><text x="100" y="134" font-size="9" fill="#d8d8d0" text-anchor="middle" letter-spacing="1.5">KNOTS</text>`;
    s += `<g data-n="needle" transform="translate(100 100)">${needle(78, 20, 3.2, '#f4f1e6', k)}</g>`;
    return s;
  }, { title: 'Velocímetro en nudos con los arcos del Manual de Vuelo LV-LLS' });
  return { svg, bind(root) { const n = root.querySelector('[data-n=needle]'); return s => rot(n, asiAngle(s.ias)); } };
}

/* ---------- Horizonte artificial ---------- */
export function attitude() {
  const PX = 2.4;
  const svg = shell(k => {
    let ladder = '';
    for (let d = -30; d <= 30; d += 5) {
      if (!d) continue;
      const w = d % 10 ? 14 : 28, y = -d * PX;
      ladder += `<path d="M${-w} ${y}H${w}" stroke="#fff" stroke-width="${d % 10 ? 1.2 : 1.8}"/>`;
      if (!(d % 10)) ladder += `<text x="${w + 8}" y="${y + 3.5}" font-size="9" fill="#fff">${Math.abs(d)}</text><text x="${-w - 8}" y="${y + 3.5}" font-size="9" fill="#fff" text-anchor="end">${Math.abs(d)}</text>`;
    }
    const bankTicks = [10, 20, 30, 60, 90].flatMap(a => [a, -a]).map(a => tick(74, a % 30 ? 81 : 86, a, a % 30 ? 1.6 : 2.6)).join('') + `<path d="M${P(80, 45)[0] - 100} ${P(80, 45)[1] - 100}l-4 -6l7 0z" fill="#fff" transform="translate(100 100)"/>`;
    return `<defs><linearGradient id="${k}sky" x2="0" y2="1"><stop offset="0" stop-color="#0b4f8f"/><stop offset="1" stop-color="#3f8fd1"/></linearGradient><linearGradient id="${k}gnd" x2="0" y2="1"><stop offset="0" stop-color="#7a4a22"/><stop offset="1" stop-color="#3b220e"/></linearGradient></defs>
<g data-n="card" transform="translate(100 100)">
 <rect x="-200" y="-300" width="400" height="300" fill="url(#${k}sky)"/><rect x="-200" y="0" width="400" height="300" fill="url(#${k}gnd)"/>
 <path d="M-200 0H200" stroke="#fff" stroke-width="2"/>${ladder}
 <g transform="translate(-100 -100)">${bankTicks}</g>
 <path d="M0 -76L-6 -66H6Z" fill="#f4f1e6"/>
</g>
<circle cx="100" cy="100" r="86" fill="none" stroke="#0d0e0f" stroke-width="10"/>
<path d="M100 18L94 8H106Z" fill="#f08a24"/>
<g fill="none" stroke="#f08a24" stroke-width="5" stroke-linecap="round"><path d="M52 100H82L92 110M148 100H118L108 110"/></g><circle cx="100" cy="100" r="3.5" fill="#f08a24"/>
<rect x="64" y="160" width="72" height="16" rx="3" fill="#1b1c1d"/><text x="100" y="171.5" font-size="8" fill="#bcbcb5" text-anchor="middle" letter-spacing="1">ATTITUDE</text>
<g data-n="flag" opacity="0"><rect x="122" y="128" width="34" height="16" fill="#d23" transform="rotate(-20 139 136)"/><text x="139" y="139" font-size="9" fill="#fff" text-anchor="middle" transform="rotate(-20 139 136)" font-weight="700">GYRO</text></g>`;
  }, { title: 'Horizonte artificial' });
  return {
    svg, bind(root) {
      const c = root.querySelector('[data-n=card]'), flag = root.querySelector('[data-n=flag]');
      return s => { c.setAttribute('transform', `translate(100 100) rotate(${f(-s.roll)}) translate(0 ${f(clamp(s.pitch, -25, 25) * PX)})`); flag.setAttribute('opacity', s.gyroOk ? 0 : 1); };
    }
  };
}

/* ---------- Altímetro ---------- */
export function altimeter() {
  const svg = shell(k => {
    let s = '';
    for (let i = 0; i < 50; i++) s += tick(i % 5 ? 79 : 71, 85, i * 7.2, i % 5 ? 1.2 : 2.2);
    for (let i = 0; i < 10; i++) s += label(61, i * 36, i, 17);
    s += `<g data-n="hatch"><clipPath id="${k}h"><rect x="86" y="44" width="28" height="12"/></clipPath><g clip-path="url(#${k}h)">${Array.from({ length: 8 }, (_, i) => `<path d="M${80 + i * 6} 56l8 -12" stroke="#fff" stroke-width="2.6"/><path d="M${83 + i * 6} 56l8 -12" stroke="#000" stroke-width="2.6"/>`).join('')}</g></g>`;
    s += `<rect x="132" y="91" width="40" height="18" rx="2" fill="#000" stroke="#555"/><text data-n="kollsman" x="152" y="104" font-size="11" fill="#f4f1e6" text-anchor="middle" font-family="ui-monospace,monospace">29.92</text>`;
    s += `<text x="100" y="128" font-size="8" fill="#d8d8d0" text-anchor="middle" letter-spacing="1">ALT · FEET</text><text x="100" y="140" font-size="7" fill="#aaa" text-anchor="middle">100 FT</text>`;
    s += `<g data-n="h10k" transform="translate(100 100)"><path d="M0 -82L-4 -70H4Z M-.8 -70V0H.8V-70Z" fill="#f4f1e6"/></g>`;
    s += `<g data-n="h1k" transform="translate(100 100)" filter="url(#${k}d)"><path d="M-5 10L-5 -38L0 -48L5 -38L5 10Z" fill="#f4f1e6"/></g>`;
    s += `<g data-n="h100" transform="translate(100 100)">${needle(78, 16, 2.6, '#f4f1e6', k)}</g>`;
    return s;
  }, { title: 'Altímetro' });
  return {
    svg, bind(root) {
      const q = n => root.querySelector(`[data-n=${n}]`);
      const [h100, h1k, h10k, hatch, kol] = ['h100', 'h1k', 'h10k', 'hatch', 'kollsman'].map(q);
      return s => {
        const alt = s.altInd;
        rot(h100, (alt % 1000) / 1000 * 360); rot(h1k, (alt % 10000) / 10000 * 360); rot(h10k, alt / 100000 * 360);
        hatch.setAttribute('opacity', alt < 10000 ? 1 : 0); kol.textContent = s.kollsman.toFixed(2);
      };
    }
  };
}

/* ---------- Viraje y ladeo (aguja y bola) ---------- */
export function turnBank() {
  const svg = shell(k => `
<text x="100" y="52" font-size="9" fill="#d8d8d0" text-anchor="middle" letter-spacing="1">TURN &amp; BANK</text>
<g fill="#f4f1e6"><rect x="58" y="62" width="9" height="15" transform="rotate(-24 100 128)"/><rect x="133" y="62" width="9" height="15" transform="rotate(24 100 128)"/><rect x="96" y="56" width="8" height="12"/></g>
<text x="40" y="96" font-size="15" fill="#f4f1e6" font-weight="700">L</text><text x="150" y="96" font-size="15" fill="#f4f1e6" font-weight="700">R</text>
<text x="100" y="114" font-size="7" fill="#aaa" text-anchor="middle">2 MIN TURN</text>
<g data-n="needle" transform="translate(100 128)"><path d="M-3 4L-2 -64L0 -70L2 -64L3 4Z" fill="#f4f1e6" filter="url(#${k}d)"/><circle r="8" fill="#1a1b1c" stroke="#555"/></g>
<path d="M52 150Q100 172 148 150" stroke="#cfd3cf" stroke-width="17" fill="none" stroke-linecap="round"/>
<path d="M52 150Q100 172 148 150" stroke="#e9ece4" stroke-width="13" fill="none" stroke-linecap="round"/>
<path d="M91 152V167M109 152V167" stroke="#222" stroke-width="1.6"/>
<circle data-n="ball" cx="100" cy="161" r="6.4" fill="#111"/>
<g data-n="flag" opacity="0"><rect x="70" y="80" width="60" height="14" fill="#d23"/><text x="100" y="90.5" font-size="8" fill="#fff" text-anchor="middle" font-weight="700">OFF</text></g>`, { title: 'Indicador de viraje y ladeo' });
  return {
    svg, bind(root) {
      const n = root.querySelector('[data-n=needle]'), b = root.querySelector('[data-n=ball]'), flag = root.querySelector('[data-n=flag]');
      return s => {
        n.setAttribute('transform', `translate(100 128) rotate(${f(clamp(s.turnRate / 3 * 24, -40, 40))})`);
        const t = clamp(s.slip, -1, 1), x = 100 + t * 40, y = 161 - 6 * t * t; b.setAttribute('cx', f(x)); b.setAttribute('cy', f(y + 4 * (1 - t * t) - 4));
        flag.setAttribute('opacity', s.gyroOk ? 0 : 1);
      };
    }
  };
}

/* ---------- Giro direccional ---------- */
export function heading() {
  const svg = shell(k => {
    let card = '';
    for (let a = 0; a < 360; a += 5) card += tick(a % 10 ? 76 : 70, 84, a, a % 30 ? 1.2 : 2);
    const names = { 0: 'N', 90: 'E', 180: 'S', 270: 'W' };
    for (let a = 0; a < 360; a += 30) card += label(58, a, names[a] || a / 10, names[a] ? 17 : 14, names[a] ? '#f4f1e6' : '#e8e8e0');
    return `<g data-n="card" transform="translate(100 100)"><g transform="translate(-100 -100)">${card}</g></g>
<g fill="#f08a24"><path d="M100 30L95 44H105Z"/></g>
${[45, 135, 225, 315].map(a => tick(84, 89, a, 2.4, '#f08a24')).join('')}
<g transform="translate(100 104)" fill="#f08a24"><path d="M-2 -26H2V12H-2Z M-30 -6H30V0H-30Z M-12 14H12V18H-12Z"/></g>
<text x="100" y="168" font-size="7" fill="#aaa" text-anchor="middle" letter-spacing="1">DIRECTIONAL GYRO</text>
<g data-n="flag" opacity="0"><rect x="122" y="128" width="34" height="16" fill="#d23"/><text x="139" y="139.5" font-size="9" fill="#fff" text-anchor="middle" font-weight="700">GYRO</text></g>`;
  }, { title: 'Giro direccional' });
  return { svg, bind(root) { const c = root.querySelector('[data-n=card]'), flag = root.querySelector('[data-n=flag]'); return s => { rot(c, -s.hdgInd); flag.setAttribute('opacity', s.gyroOk ? 0 : 1); }; } };
}

/* ---------- Variómetro ---------- */
const vsiAngle = v => -90 + clamp(v, -2000, 2000) / 2000 * 172;
export function vsi() {
  const svg = shell(k => {
    let s = '';
    for (let v = -2000; v <= 2000; v += 100) s += tick(v % 500 ? 76 : 70, 85, vsiAngle(v), v % 500 ? 1.2 : 2.2);
    for (const v of [5, 10, 15, 20]) { s += label(58, vsiAngle(v * 100), v, 14); s += label(58, vsiAngle(-v * 100), v, 14); }
    s += label(58, -90, 0, 16);
    s += `<text x="118" y="74" font-size="8" fill="#d8d8d0">UP</text><text x="118" y="132" font-size="8" fill="#d8d8d0">DOWN</text>
<text x="118" y="96" font-size="6.5" fill="#aaa">VERTICAL SPEED</text><text x="118" y="108" font-size="6.5" fill="#aaa">100 FT / MIN</text>`;
    s += `<g data-n="needle" transform="translate(100 100)">${needle(78, 18, 3, '#f4f1e6', k)}</g>`;
    return s;
  }, { title: 'Variómetro' });
  return { svg, bind(root) { const n = root.querySelector('[data-n=needle]'); return s => rot(n, vsiAngle(s.vsInd)); } };
}

/* ---------- Tacómetro ---------- */
const tachAngle = r => -135 + clamp(r, 0, 3500) / 3500 * 270;
export function tachometer() {
  const t = engine.tach;
  const svg = shell(k => {
    let s = `<path d="${arc(77.5, tachAngle(t.green[0]), tachAngle(t.green[1]))}" stroke="#25a346" stroke-width="7" fill="none"/>` + tick(70, 86, tachAngle(t.red), 3.4, '#e5322d');
    for (let r = 0; r <= 3500; r += 100) s += tick(r % 500 ? 77 : 70, 85, tachAngle(r), r % 500 ? 1.2 : 2.2);
    for (let r = 0; r <= 35; r += 5) s += label(57, tachAngle(r * 100), r, 15);
    s += `<text x="100" y="66" font-size="8" fill="#d8d8d0" text-anchor="middle" letter-spacing="1">RPM</text><text x="100" y="77" font-size="7" fill="#aaa" text-anchor="middle">X 100</text>
<rect x="76" y="128" width="48" height="15" rx="2" fill="#000" stroke="#555"/><text data-n="hours" x="100" y="139.5" font-size="10" fill="#f4f1e6" text-anchor="middle" font-family="ui-monospace,monospace">0000.0</text>
<text x="100" y="156" font-size="6" fill="#aaa" text-anchor="middle">HOURS</text>`;
    s += `<g data-n="needle" transform="translate(100 100)">${needle(78, 18, 3.2, '#f4f1e6', k)}</g>`;
    return s;
  }, { title: 'Tacómetro con el arco verde y la línea roja del Manual de Vuelo LV-LLS' });
  return {
    svg, bind(root) {
      const n = root.querySelector('[data-n=needle]'), h = root.querySelector('[data-n=hours]');
      return s => { rot(n, tachAngle(s.rpm)); h.textContent = s.hobbs.toFixed(1).padStart(6, '0'); };
    }
  };
}

/* ---------- Instrumentos chicos: succión ---------- */
export function suction() {
  const ang = v => -120 + clamp(v, 0, 10) / 10 * 240;
  const svg = shell(k => {
    let s = `<path d="${arc(77.5, ang(engine.suction[0]), ang(engine.suction[1]))}" stroke="#25a346" stroke-width="8" fill="none"/>`;
    for (let v = 0; v <= 10; v++) s += tick(v % 2 ? 76 : 70, 85, ang(v), v % 2 ? 1.2 : 2.2);
    for (let v = 0; v <= 10; v += 2) s += label(58, ang(v), v, 16);
    s += `<text x="100" y="132" font-size="9" fill="#d8d8d0" text-anchor="middle" letter-spacing="1">SUCTION</text><text x="100" y="144" font-size="7" fill="#aaa" text-anchor="middle">IN. HG</text>`;
    s += `<g data-n="needle" transform="translate(100 100)">${needle(76, 16, 3, '#f4f1e6', k)}</g>`;
    return s;
  }, { title: 'Indicador de succión (vacío), arco verde 4–6 inHg según la lista del aeroclub' });
  return { svg, bind(root) { const n = root.querySelector('[data-n=needle]'); return s => rot(n, ang(s.suction)); } };
}

/* ---------- Grupo de instrumentos de motor (estilo Piper) ---------- */
function mini(x, y, w, h, title, min, max, bands, labels, key) {
  const cx = x + w / 2, cy = y + h - 12, r = h - 30;
  const A = v => -60 + (clamp(v, min, max) - min) / (max - min) * 120;
  const pt = (rr, a) => [cx + rr * Math.sin(R(a)), cy - rr * Math.cos(R(a))];
  const arcM = (rr, a1, a2) => { const [x1, y1] = pt(rr, a1), [x2, y2] = pt(rr, a2); return `M${f(x1)} ${f(y1)}A${rr} ${rr} 0 0 1 ${f(x2)} ${f(y2)}`; };
  let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="#0f1011" stroke="#2c2f31"/>`;
  for (const [from, to, color] of bands) {
    if (to === from) { const [a1, b1] = pt(r - 6, A(from)), [a2, b2] = pt(r + 6, A(from)); s += `<path d="M${f(a1)} ${f(b1)}L${f(a2)} ${f(b2)}" stroke="${color}" stroke-width="3"/>`; }
    else s += `<path d="${arcM(r, A(from), A(to))}" stroke="${color}" stroke-width="6" fill="none"/>`;
  }
  for (let i = 0; i <= 8; i++) { const a = -60 + i * 15, [a1, b1] = pt(r + 4, a), [a2, b2] = pt(r + 10, a); s += `<path d="M${f(a1)} ${f(b1)}L${f(a2)} ${f(b2)}" stroke="#ddd" stroke-width="1.2"/>`; }
  labels.forEach(([v, t]) => { const [lx, ly] = pt(r + 18, A(v)); s += `<text x="${f(lx)}" y="${f(ly)}" font-size="8" fill="#e8e8e0" text-anchor="middle" dominant-baseline="central">${t}</text>`; });
  s += `<text x="${cx}" y="${y + h - 4}" font-size="7.5" fill="#bbb" text-anchor="middle" letter-spacing=".8">${title}</text>`;
  s += `<g data-mini="${key}" data-cx="${cx}" data-cy="${cy}" data-min="${min}" data-max="${max}" transform="translate(${cx} ${cy}) rotate(-60)"><path d="M-1.8 4L0 ${-r - 6}L1.8 4Z" fill="#f4f1e6"/><circle r="4.5" fill="#222" stroke="#555"/></g>`;
  return s;
}
export function engineCluster() {
  const W = 330, H = 200, ot = engine.oilTempC, op = engine.oilPsi, fp = engine.fuelPsi;
  const svg = `<svg viewBox="0 0 ${W} ${H}" class="inst cluster" role="img" aria-label="Grupo de instrumentos de motor" font-family="'Helvetica Neue',Arial,sans-serif">
<defs><linearGradient id="clb" x2="0" y2="1"><stop offset="0" stop-color="#3a3e40"/><stop offset="1" stop-color="#141617"/></linearGradient><linearGradient id="clg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".16"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>
<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="12" fill="url(#clb)" stroke="#5f6366"/>
${[[14, 14], [W - 14, 14], [14, H - 14], [W - 14, H - 14]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4" fill="#9a9c99" stroke="#222"/>`).join('')}
${mini(24, 18, 90, 82, 'FUEL L', 0, 25, [[0, 3, '#e5322d']], [[0, 'E'], [12.5, '½'], [25, 'F']], 'fuelL')}
${mini(120, 18, 90, 82, 'FUEL R', 0, 25, [[0, 3, '#e5322d']], [[0, 'E'], [12.5, '½'], [25, 'F']], 'fuelR')}
${mini(216, 18, 90, 82, 'FUEL PRESS', 0, 10, [[fp.green[0], fp.green[1], '#25a346'], [fp.redMax, fp.redMax, '#e5322d'], [fp.redMin, fp.redMin, '#e5322d']], [[0, '0'], [5, '5'], [10, '10']], 'fuelP')}
${mini(24, 104, 90, 82, 'OIL TEMP', 0, 140, [[ot.green[0], ot.green[1], '#25a346'], [ot.red, ot.red, '#e5322d']], [[0, '0'], [70, '70'], [140, '°C']], 'oilT')}
${mini(120, 104, 90, 82, 'OIL PRESS', 0, 120, [[op.yellow[0], op.yellow[1], '#f0c419'], [op.green[0], op.green[1], '#25a346'], [op.redMax, op.redMax, '#e5322d']], [[0, '0'], [60, '60'], [120, 'PSI']], 'oilP')}
${mini(216, 104, 90, 82, 'AMMETER', 0, 60, [], [[0, '0'], [30, '30'], [60, '60']], 'amps')}
<rect x="2" y="2" width="${W - 4}" height="${H / 2}" rx="12" fill="url(#clg)" pointer-events="none"/>
</svg>`;
  return {
    svg, bind(root) {
      const els = [...root.querySelectorAll('[data-mini]')];
      return s => els.forEach(g => {
        const v = s[g.dataset.mini] ?? 0, min = +g.dataset.min, max = +g.dataset.max;
        g.setAttribute('transform', `translate(${g.dataset.cx} ${g.dataset.cy}) rotate(${f(-60 + (clamp(v, min, max) - min) / (max - min) * 120)})`);
      });
    }
  };
}

/* ---------- Brújula magnética (cinta) ---------- */
export function compass() {
  let tape = '';
  for (let a = -60; a <= 420; a += 5) {
    const x = a * 2.2, hd = ((a % 360) + 360) % 360;
    tape += `<path d="M${x} ${a % 10 ? 30 : 26}V38" stroke="#111" stroke-width="${a % 10 ? 1 : 1.6}"/>`;
    if (!(a % 30)) tape += `<text x="${x}" y="20" font-size="12" text-anchor="middle" fill="#111" font-weight="700">${({ 0: 'N', 90: 'E', 180: 'S', 270: 'W' })[hd] ?? hd / 10}</text>`;
  }
  const svg = `<svg viewBox="0 0 220 74" class="inst compass" role="img" aria-label="Brújula magnética" font-family="'Helvetica Neue',Arial,sans-serif">
<defs><clipPath id="cmpc"><rect x="34" y="12" width="152" height="46" rx="6"/></clipPath><linearGradient id="cmpb" x2="0" y2="1"><stop offset="0" stop-color="#3a3d3f"/><stop offset="1" stop-color="#0d0e0f"/></linearGradient><linearGradient id="cmpg" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity=".55"/><stop offset=".25" stop-color="#000" stop-opacity="0"/><stop offset=".75" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></linearGradient></defs>
<rect x="4" y="4" width="212" height="66" rx="16" fill="url(#cmpb)"/>
<rect x="34" y="12" width="152" height="46" rx="6" fill="#efe7c9"/>
<g clip-path="url(#cmpc)"><g data-n="tape">${tape}</g><rect x="34" y="12" width="152" height="46" fill="url(#cmpg)"/></g>
<path d="M110 10V60" stroke="#c62" stroke-width="2"/>
<text x="110" y="69" font-size="6" fill="#aaa" text-anchor="middle">COMPASS</text></svg>`;
  return { svg, bind(root) { const t = root.querySelector('[data-n=tape]'); return s => t.setAttribute('transform', `translate(${f(110 - s.hdg * 2.2)} 12)`); } };
}
