// Laboratorio aerodinámico: flujo potencial alrededor de un perfil de Joukowski con condición de Kutta.
// Es la solución exacta de flujo ideal (sin viscosidad) para esa forma: velocidades, presiones y sustentación
// salen de la teoría, no de una animación dibujada. La separación (pérdida) NO la predice esta teoría:
// se muestra aparte, de forma cualitativa y rotulada.
import { clamp } from './instruments.js';

// ---- aritmética compleja mínima ----
const add = (a, b) => [a[0] + b[0], a[1] + b[1]], sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const mul = (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
const div = (a, b) => { const d = b[0] * b[0] + b[1] * b[1]; return [(a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d]; };
const csqrt = a => { const r = Math.hypot(a[0], a[1]); const re = Math.sqrt((r + a[0]) / 2); const im = Math.sign(a[1] || 1) * Math.sqrt(Math.max(0, (r - a[0]) / 2)); return [re, im]; };
const abs = a => Math.hypot(a[0], a[1]);
const expi = t => [Math.cos(t), Math.sin(t)];

const RHO = 1.225, S = 14.86, W = 973.95 * 9.81, AR = 30 * 30 / 160; // LV-LLS: 160 ft², 30 ft, 973,95 kg
const FLAP_CAMBER = [0, .028, .06, .09];

export function model(alphaDeg, flaps) {
  const ex = .118, ey = .044 + FLAP_CAMBER[flaps];          // Perfil de enseñanza: NO son coordenadas del NACA 65₂-415
  const mu = [-ex, ey], a = Math.hypot(1 + ex, ey), beta = Math.asin(ey / a);
  const al = alphaDeg * Math.PI / 180;
  const gamma = 4 * Math.PI * a * Math.sin(al + beta);      // Kutta: el flujo deja el borde de fuga suavemente
  // forma del perfil (para dibujo, cuerda y Cp)
  const surf = [];
  for (let i = 0; i <= 240; i++) { const t = -beta + i / 240 * 2 * Math.PI; const z = jk(add(mu, mul([a, 0], expi(t)))); surf.push({ t, z }); }
  let xmin = Infinity, xmax = -Infinity; for (const p of surf) { xmin = Math.min(xmin, p.z[0]); xmax = Math.max(xmax, p.z[0]); }
  const chord = xmax - xmin, cl = 2 * gamma / chord;      // Kutta–Joukowski: L' = ρ U Γ, U = 1
  return { ex, ey, mu, a, beta, al, gamma, surf, xmin, xmax, chord, cl };
}
const jk = z => add(z, div([1, 0], z));
// Velocidad compleja conjugada w = u − i v en el plano del perfil (U = 1, viento a ángulo α)
export function velocity(m, z) {
  const r = csqrt(sub(mul(z, z), [4, 0]));
  let zeta = mul([.5, 0], add(z, r)); if (abs(zeta) < 1) zeta = mul([.5, 0], sub(z, r));
  if (abs(sub(zeta, m.mu)) < m.a * 1.0005) return null;   // dentro del perfil
  return velZeta(m, zeta);
}
// Misma velocidad, evaluada directamente en el plano del círculo (útil sobre la superficie)
function velZeta(m, zeta) {
  const zp = sub(zeta, m.mu);
  const e = expi(-m.al), ei = expi(m.al);
  const dW = add(sub(e, div(mul([m.a * m.a, 0], ei), mul(zp, zp))), div([0, m.gamma / (2 * Math.PI)], zp));
  const dz = sub([1, 0], div([1, 0], mul(zeta, zeta)));
  if (abs(dz) < 1e-3) return [0, 0];
  return div(dW, dz);
}
// Curva «real» aproximada para comparar (ilustrativa): pendiente reducida y pérdida.
export function stallAngle(flaps) { return 15 - flaps * 1.6; }
export function clReal(m, alpha, flaps) {
  const as = stallAngle(flaps), base = m.cl * .9;
  if (alpha <= as) return base;
  const mAt = model(as, flaps).cl * .9;
  return mAt * (1 - .42 * (1 - Math.exp(-(alpha - as) / 3.5)));
}

export function mountAero(host) {
  host.innerHTML = `<div class="aero">
 <div class="aero-stage"><canvas class="aero-canvas" aria-label="Simulación del flujo de aire alrededor del perfil del ala. Las partículas siguen el flujo calculado; los colores indican presión."></canvas>
  <div class="aero-legend"><span class="lo">presión baja</span><span class="grad"></span><span class="hi">presión alta</span></div>
  <div class="aero-badges"><span data-a="state"></span></div></div>
 <div class="aero-side">
  <div class="aero-controls">
   <label>Ángulo de ataque <output data-a="alpha"></output><input type="range" data-a="alphaIn" min="-8" max="24" step=".5" value="5"></label>
   <label>Velocidad <output data-a="speed"></output><input type="range" data-a="speedIn" min="40" max="148" value="90"></label>
   <label>Corriente vertical <output data-a="gust"></output><input type="range" data-a="gustIn" min="-10" max="10" step="1" value="0"></label>
   <p class="fine-print">Positivo: aire ascendente. Cambia el ángulo efectivo por atan(viento vertical / velocidad). Aproximación cuasiestacionaria.</p>
   <button class="chip" data-gustpulse aria-pressed="false">Probar ráfaga de 6 segundos</button>
   <div class="seg" role="group" aria-label="Flaps">${[0, 10, 25, 40].map((d, i) => `<button data-flap="${i}" aria-pressed="${i === 0}">Flaps ${d}°</button>`).join('')}</div>
   <div class="seg" role="group" aria-label="Qué mostrar">${[['p', 'Partículas'], ['s', 'Líneas de corriente'], ['c', 'Presión']].map(([k, l]) => `<button data-show="${k}" aria-pressed="${k !== 's'}">${l}</button>`).join('')}<button data-pause aria-pressed="false">Ⅱ Pausa</button></div>
  </div>
  <div class="aero-readout">
   <div><span>Ángulo de ataque efectivo</span><b data-a="effective"></b></div><div><span>Coeficiente de sustentación del perfil (CL)</span><b data-a="cl"></b></div>
   <div><span>Fuerza estimada del modelo</span><b data-a="lift"></b></div>
   <div class="wide"><div class="bar"><i data-a="liftbar"></i><em style="left:${100 / 1.6}%"></em></div><small>La marca equivale a 973,95 kg de masa de referencia. La fuerza se expresa en newtons. Modelo ilustrativo de ala finita, no predicción de performance del LV-LLS.</small></div>
  </div>
 </div>
 <div class="aero-charts">
  <figure><figcaption>Sustentación según el ángulo de ataque</figcaption><canvas class="cl-chart" aria-label="Curva de CL en función del ángulo de ataque"></canvas><p class="fine-print"><b class="k1">—</b> teoría ideal (no predice pérdida) · <b class="k2">—</b> modelo cualitativo con pérdida.</p></figure>
  <figure><figcaption>Presión a lo largo de la cuerda</figcaption><canvas class="cp-chart" aria-label="Distribución del coeficiente de presión en extradós e intradós"></canvas><p class="fine-print"><b class="k3">—</b> extradós (arriba) · <b class="k4">—</b> intradós (abajo). Hacia arriba en el gráfico = más succión. El área entre ambas curvas es la sustentación.</p></figure>
 </div>
 <p class="aero-note" data-a="note" role="status"></p>
</div>`;
  const $ = q => host.querySelector(q), $$ = q => [...host.querySelectorAll(q)];
  const cv = $('.aero-canvas'), ctx = cv.getContext('2d');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let baseAlpha = 5, gust = 0, pulseTime = null, flowTime = 0, lastTick = performance.now(), fieldTime = 0;
  let alpha = 5, speed = 90, flaps = 0, show = { p: true, s: false, c: true }, paused = reduce, m = model(alpha, flaps);
  let W2 = 0, H2 = 0, dpr = 1, scale = 1, ox = 0, oy = 0, field = null, parts = [], timer = 0, alive = true;
  if (reduce) $('[data-pause]').setAttribute('aria-pressed', 'true');

  const toScreen = (x, y) => [ox + x * scale, oy - y * scale];
  const toWorld = (sx, sy) => [(sx - ox) / scale, (oy - sy) / scale];
  const rotA = (p, ang) => { const c = Math.cos(ang), s = Math.sin(ang); return [p[0] * c - p[1] * s, p[0] * s + p[1] * c]; };
  // Pantalla: viento horizontal de izquierda a derecha y perfil inclinado α (nariz arriba).
  function velDisplay(p) {
    const z = rotA(p, m.al); const w = velocity(m, z); if (!w) return null;
    return rotA([w[0], -w[1]], -m.al);
  }
  function shapeDisplay() { return m.surf.map(s => rotA(s.z, -m.al)); }

  function resize() {
    const r = cv.getBoundingClientRect(); dpr = Math.min(2, devicePixelRatio || 1);
    W2 = Math.max(300, r.width); H2 = Math.max(220, r.height);
    cv.width = W2 * dpr; cv.height = H2 * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    scale = Math.min(W2 / 6.6, H2 / 4.3); ox = W2 * .5; oy = H2 * .56;
    seed(); buildField();
  }
  const N = () => (W2 < 600 ? 520 : 1100);
  function newParticle(anywhere) {
    const [x0] = toWorld(0, 0), [x1] = toWorld(W2, 0), [, y0] = toWorld(0, H2), [, y1] = toWorld(0, 0);
    return { x: anywhere ? x0 + Math.random() * (x1 - x0) : x0 - Math.random() * .3, y: y0 + Math.random() * (y1 - y0), age: Math.random() * 200, trail: [] };
  }
  function seed() { parts = Array.from({ length: N() }, () => newParticle(true)); }

  // Mapa de presión (Cp = 1 − |V|²) calculado en una grilla y suavizado al dibujar.
  function buildField() {
    const gw = Math.ceil(W2 / 6), gh = Math.ceil(H2 / 6), off = new OffscreenCanvasSafe(gw, gh), img = off.ctx.createImageData(gw, gh);
    for (let j = 0; j < gh; j++) for (let i = 0; i < gw; i++) {
      const v = velDisplay(toWorld((i + .5) * W2 / gw, (j + .5) * H2 / gh)); const k = (j * gw + i) * 4;
      if (!v) { img.data[k + 3] = 0; continue; }
      const cp = clamp(1 - (v[0] * v[0] + v[1] * v[1]), -2.2, 1);
      const [r, g, b] = cp < 0 ? mix([20, 44, 58], [64, 176, 222], Math.min(1, -cp / 1.6)) : mix([20, 44, 58], [240, 150, 70], cp);
      img.data[k] = r; img.data[k + 1] = g; img.data[k + 2] = b; img.data[k + 3] = 255;
    }
    off.ctx.putImageData(img, 0, 0); field = off.canvas; buildStreamlines();
  }
  const mix = (a, b, t) => a.map((x, i) => Math.round(x + (b[i] - x) * t));

  function separated(p) {
    // Zona separada (cualitativa): sobre el extradós, detrás de un punto que avanza con α por encima del ángulo de pérdida.
    const over = alpha - stallAngle(flaps); if (over <= 0) return 0;
    const z = rotA(p, m.al); const xs = m.xmax - (m.chord * clamp(.25 + over * .07, .25, .95));
    if (z[0] < xs || z[0] > m.xmax + 2.2) return 0;
    const top = .1 + m.ey * 2 + (z[0] - xs) * (.25 + over * .025);
    return z[1] > 0 && z[1] < top ? 1 - z[1] / top * .6 : 0;
  }

  function stepParticles(dt) {
    const sp = .9 * dt; flowTime += dt;
    for (const p of parts) {
      let v = velDisplay([p.x, p.y]);
      if (!v) { Object.assign(p, newParticle(false)); continue; }
      const sep = separated([p.x, p.y]);
      if (sep) { const t = p.x * 3.8 - flowTime * 2.4; v = [v[0] * (1 - .8 * sep) + Math.sin(t) * .5 * sep, v[1] * (1 - .8 * sep) + Math.cos(t) * .6 * sep]; }
      else { const mid = velDisplay([p.x + v[0] * sp / 2, p.y + v[1] * sp / 2]); if (mid) v = mid; }
      p.x += v[0] * sp; p.y += v[1] * sp; p.age += dt; p.spd = Math.hypot(v[0], v[1]); p.sep = sep;
      p.trail.push(p.x, p.y); if (p.trail.length > 16) p.trail.splice(0, 2);
      const [sx, sy] = toScreen(p.x, p.y);
      if (sx > W2 + 20 || sy < -20 || sy > H2 + 20 || p.age > 400) Object.assign(p, newParticle(false));
    }
  }

  let slines = [];
  function buildStreamlines() {
    slines = [];
    const [x0] = toWorld(0, 0), [, yTop] = toWorld(0, 0), [, yBot] = toWorld(0, H2);
    for (let y = yBot + .1; y < yTop; y += (yTop - yBot) / 26) {
      let p = [x0, y]; const path = new Path2D(); path.moveTo(...toScreen(...p));
      for (let i = 0; i < 700; i++) { const v = velDisplay(p); if (!v) break; const n = Math.hypot(...v) || 1; p = [p[0] + v[0] / n * .03, p[1] + v[1] / n * .03]; const [sx, sy] = toScreen(...p); path.lineTo(sx, sy); if (sx > W2) break; }
      slines.push(path);
    }
  }
  function streamlines() { ctx.lineWidth = 1.1; ctx.strokeStyle = 'rgba(214,236,240,.6)'; for (const p of slines) ctx.stroke(p); }

  function arrow(x1, y1, x2, y2, color, w = 3, label = '') {
    const a = Math.atan2(y2 - y1, x2 - x1); ctx.strokeStyle = ctx.fillStyle = color; ctx.lineWidth = w;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - 12 * Math.cos(a - .4), y2 - 12 * Math.sin(a - .4)); ctx.lineTo(x2 - 12 * Math.cos(a + .4), y2 - 12 * Math.sin(a + .4)); ctx.fill();
    if (label) { ctx.font = '600 12px Inter,Arial,sans-serif'; ctx.fillText(label, x2 + 8, y2 - 6); }
  }

  function draw() {
    ctx.clearRect(0, 0, W2, H2);
    ctx.fillStyle = '#10232c'; ctx.fillRect(0, 0, W2, H2);
    if (show.c && field) { ctx.imageSmoothingEnabled = true; ctx.globalAlpha = .85; ctx.drawImage(field, 0, 0, W2, H2); ctx.globalAlpha = 1; }
    if (show.s) streamlines();
    if (show.p) {
      ctx.lineWidth = 1.4;
      for (const p of parts) {
        if (p.trail.length < 4) continue;
        const t = clamp((p.spd - .6) / 1.2, 0, 1);
        ctx.strokeStyle = p.sep > .1 ? 'rgba(255,140,110,.85)' : `rgba(${Math.round(190 + 65 * t)},${Math.round(225 + 10 * t)},${Math.round(240 - 120 * t)},${.35 + .5 * t})`;
        ctx.beginPath(); let [sx, sy] = toScreen(p.trail[0], p.trail[1]); ctx.moveTo(sx, sy);
        for (let i = 2; i < p.trail.length; i += 2) { [sx, sy] = toScreen(p.trail[i], p.trail[i + 1]); ctx.lineTo(sx, sy); }
        ctx.stroke();
      }
    }
    // perfil
    const shp = shapeDisplay(); ctx.beginPath(); shp.forEach((p, i) => { const [sx, sy] = toScreen(...p); i ? ctx.lineTo(sx, sy) : ctx.moveTo(sx, sy); }); ctx.closePath();
    const g = ctx.createLinearGradient(0, oy - 40, 0, oy + 40); g.addColorStop(0, '#f2f1ea'); g.addColorStop(1, '#a9bcc2');
    ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = '#2d4a55'; ctx.lineWidth = 1.5; ctx.stroke();
    // cuerda
    const le = rotA([m.xmin, 0], -m.al), te = rotA([m.xmax, 0], -m.al); ctx.setLineDash([5, 5]); ctx.strokeStyle = '#4f6e79'; ctx.beginPath(); ctx.moveTo(...toScreen(...le)); ctx.lineTo(...toScreen(...te)); ctx.stroke(); ctx.setLineDash([]);
    // punto de estancamiento
    let best = null; for (const s of m.surf.slice(60, 200)) { const v = velZeta(m, add(m.mu, mul([m.a * 1.002, 0], expi(s.t)))); const sp = abs(v); if (!best || sp < best.sp) best = { sp, z: s.z }; }
    if (best) { const [sx, sy] = toScreen(...rotA(best.z, -m.al)); ctx.fillStyle = '#ffd36b'; ctx.beginPath(); ctx.arc(sx, sy, 5, 0, 7); ctx.fill(); ctx.font = '11px Inter,Arial,sans-serif'; ctx.fillText('punto de estancamiento', sx - 30, sy + 24); }
    // vectores: viento relativo y sustentación (perpendicular al viento)
    arrow(22, H2 - 52, 130, H2 - 52, '#cfe3ea', 3, 'VIENTO RELATIVO');
    const L = clReal(m, alpha, flaps), q = (speed / 90) ** 2, [cx, cy] = toScreen(...rotA([m.xmin + m.chord * .27, .35], -m.al));
    const len = clamp(L * q * 70, -120, H2 * .42);
    arrow(cx, cy, cx, cy - len, '#efb568', 4, 'SUSTENTACIÓN');
    // ángulo de ataque
    ctx.strokeStyle = '#efb568'; ctx.lineWidth = 1.5; const r0 = 70, [lx, ly] = toScreen(...le);
    ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx + r0 + 30, ly); ctx.stroke();
    ctx.beginPath(); ctx.arc(lx, ly, r0, Math.min(0, m.al), Math.max(0, m.al)); ctx.stroke(); ctx.fillStyle = '#efb568'; ctx.font = '600 12px Inter,Arial,sans-serif'; ctx.fillText(`α ${alpha.toFixed(1)}°`, lx + r0 + 6, ly - 8 - (m.al > 0 ? 10 : -14));
  }

  function charts() {
    for (const [sel, fn] of [['.cl-chart', clChart], ['.cp-chart', cpChart]]) {
      const c = $(sel), r = c.getBoundingClientRect(), d = Math.min(2, devicePixelRatio || 1); c.width = r.width * d; c.height = r.height * d;
      const x = c.getContext('2d'); x.setTransform(d, 0, 0, d, 0, 0); x.clearRect(0, 0, r.width, r.height); fn(x, r.width, r.height);
    }
  }
  function axes(x, w, h, xr, yr, xl, yl, ticksX, ticksY) {
    const px = v => 34 + (v - xr[0]) / (xr[1] - xr[0]) * (w - 44), py = v => h - 24 - (v - yr[0]) / (yr[1] - yr[0]) * (h - 34);
    x.strokeStyle = '#d5ddd8'; x.lineWidth = 1; x.font = '10px Inter,Arial,sans-serif'; x.fillStyle = '#5a6f76';
    for (const t of ticksX) { x.beginPath(); x.moveTo(px(t), 8); x.lineTo(px(t), h - 24); x.stroke(); x.fillText(t, px(t) - 6, h - 10); }
    for (const t of ticksY) { x.beginPath(); x.moveTo(34, py(t)); x.lineTo(w - 10, py(t)); x.stroke(); x.fillText(t, 4, py(t) + 3); }
    x.fillText(xl, w - 60, h - 26); x.save(); x.translate(12, 18); x.fillText(yl, 0, 0); x.restore();
    return [px, py];
  }
  function clChart(x, w, h) {
    const [px, py] = axes(x, w, h, [-8, 24], [-.6, 2.6], 'α (°)', 'CL', [-5, 0, 5, 10, 15, 20], [0, 1, 2]);
    x.lineWidth = 2; x.strokeStyle = '#7fb3e0'; x.beginPath(); for (let a = -8; a <= 24; a += .5) { const v = model(a, flaps).cl; a === -8 ? x.moveTo(px(a), py(v)) : x.lineTo(px(a), py(v)); } x.stroke();
    x.strokeStyle = '#c7843f'; x.beginPath(); for (let a = -8; a <= 24; a += .5) { const v = clReal(model(a, flaps), a, flaps); a === -8 ? x.moveTo(px(a), py(v)) : x.lineTo(px(a), py(v)); } x.stroke();
    const as = stallAngle(flaps); x.setLineDash([4, 4]); x.strokeStyle = '#c0392b'; x.beginPath(); x.moveTo(px(as), 8); x.lineTo(px(as), h - 24); x.stroke(); x.setLineDash([]);
    x.fillStyle = '#c0392b'; x.fillText('≈ pérdida', px(as) + 4, 18);
    x.fillStyle = '#102c3b'; x.beginPath(); x.arc(px(alpha), py(clReal(m, alpha, flaps)), 5, 0, 7); x.fill();
  }
  function cpChart(x, w, h) {
    // separar extradós e intradós por el borde de ataque (x mínima)
    let iLE = 0; m.surf.forEach((s, i) => { if (s.z[0] < m.surf[iLE].z[0]) iLE = i; });
    const pts = m.surf.map((s, i) => { const v = velZeta(m, add(m.mu, mul([m.a * 1.002, 0], expi(s.t)))); const cp = v ? 1 - (v[0] * v[0] + v[1] * v[1]) : 1; return { xc: (s.z[0] - m.xmin) / m.chord, cp: clamp(cp, -14, 1.2), upper: i < iLE }; });
    const top = Math.max(3, Math.ceil(Math.max(...pts.map(p => -p.cp)))), step = top > 6 ? 2 : 1;
    const ticks = []; for (let t = -1; t <= top; t += step) ticks.push(t);
    const [px, py] = axes(x, w, h, [0, 1], [-1.2, top + .2], 'x/c', '−Cp', [0, .25, .5, .75, 1], ticks);
    for (const [up, col] of [[true, '#2b7bb9'], [false, '#c7843f']]) {
      x.strokeStyle = col; x.lineWidth = 2; x.beginPath(); let first = true;
      for (const p of pts.filter(p => p.upper === up && p.xc > .004 && p.xc < .996)) { const X = px(p.xc), Y = py(-p.cp); first ? x.moveTo(X, Y) : x.lineTo(X, Y); first = false; }
      x.stroke();
    }
  }

  function readouts() {
    const pulse = pulseTime == null ? 0 : 6 * Math.sin(Math.PI * pulseTime / 6) ** 2;
    alpha = baseAlpha + Math.atan2(gust + pulse, speed) * 180 / Math.PI;
    m = model(alpha, flaps);
    $('[data-a=gust]').textContent = (gust + pulse).toFixed(1) + ' kt';
    $('[data-a=effective]').textContent = alpha.toFixed(1) + '°';
    const cl = clReal(m, alpha, flaps), clW = cl * AR / (AR + 2), V = speed * .5144, L = .5 * RHO * V * V * S * clW, kg = L / 9.81;
    $('[data-a=alpha]').textContent = baseAlpha.toFixed(1).replace('.', ',') + '°';
    $('[data-a=speed]').textContent = speed + ' kt';
    $('[data-a=cl]').textContent = cl.toFixed(2).replace('.', ',') + (alpha > stallAngle(flaps) ? '  (teoría ideal: ' + m.cl.toFixed(2).replace('.', ',') + ')' : '');
    $('[data-a=lift]').textContent = `≈ ${Math.round(L).toLocaleString('es-AR')} N`;
    $('[data-a=liftbar]').style.width = clamp(L / W / 1.6 * 100, 0, 100) + '%';
    $('[data-a=liftbar]').classList.toggle('over', L >= W);
    const stalled = alpha > stallAngle(flaps);
    $('[data-a=state]').textContent = stalled ? 'Flujo separado: PÉRDIDA (representación cualitativa)' : alpha < 0 ? 'Ángulo negativo: observá el CL' : 'Flujo adherido';
    $('[data-a=state]').className = stalled ? 'bad' : '';
    // velocidad a la que esta sustentación iguala el peso
    const vEq = clW > .05 ? Math.sqrt(2 * W / (RHO * S * clW)) / .5144 : null;
    $('[data-a=note]').innerHTML = stalled
      ? `Superaste el ángulo de ataque crítico (≈${stallAngle(flaps)}° en este modelo). El flujo ya no sigue el extradós, la succión se pierde y la sustentación <b>baja</b> aunque aumentes el ángulo. La teoría ideal no puede mostrar esto: por eso la zona rosada es una representación aproximada.`
      : vEq ? `En este modelo idealizado, la fuerza iguala el peso de referencia a <b>${Math.round(vEq)} kt</b>; no es una velocidad utilizable para operar el avión. Más lento, hace falta más ángulo; al llegar al crítico aparece la pérdida. Referencia del Manual: pérdida sin potencia a 64 mph (≈56 kt) con flaps arriba y 54 mph (47 kt) con flaps abajo.`
        : 'Con ángulo muy bajo o negativo, el ala casi no sustenta.';
  }

  function tick() {
    if (!alive) return;
    const now = performance.now(), dt = Math.min(.08,(now-lastTick)/1000); lastTick = now;
    if (!paused && !document.hidden) {
      if (pulseTime != null) { pulseTime += dt; if (pulseTime >= 6) { pulseTime = null; $('[data-gustpulse]').setAttribute('aria-pressed',false); } readouts(); if(now-fieldTime>150 || pulseTime==null){buildField();charts();fieldTime=now;} }
      stepParticles(dt * (speed / 90));
    }
    draw();
  }
  const onInput = e => {
    const k = e.target.dataset.a;
    if (k === 'alphaIn') { baseAlpha = +e.target.value; readouts(); buildField(); charts(); }
    if (k === 'speedIn') { speed = +e.target.value; readouts(); buildField(); charts(); }
    if (k === 'gustIn') { gust = +e.target.value; readouts(); buildField(); charts(); }
  };
  const onClick = e => {
    const b = e.target.closest('button'); if (!b) return;
    if ('gustpulse' in b.dataset) { pulseTime = pulseTime == null ? 0 : null; b.setAttribute('aria-pressed',pulseTime != null); readouts(); buildField(); charts(); }
    if (b.dataset.flap) { flaps = +b.dataset.flap; $$('[data-flap]').forEach(x => x.setAttribute('aria-pressed', x === b)); readouts(); buildField(); charts(); }
    if (b.dataset.show) { show[b.dataset.show] = !show[b.dataset.show]; b.setAttribute('aria-pressed', show[b.dataset.show]); }
    if ('pause' in b.dataset) { paused = !paused; b.setAttribute('aria-pressed', paused); b.textContent = paused ? '▷ Animar' : 'Ⅱ Pausa'; }
  };
  host.addEventListener('input', onInput); host.addEventListener('click', onClick);
  const ro = new ResizeObserver(() => { resize(); charts(); draw(); }); ro.observe($('.aero-stage'));
  readouts(); resize(); charts(); draw();
  if (paused) $('[data-pause]').textContent = '▷ Animar';
  timer = setInterval(tick, 33);
  return () => { alive = false; clearInterval(timer); ro.disconnect(); host.removeEventListener('input',onInput); host.removeEventListener('click',onClick); };
}

// Canvas fuera de pantalla compatible con navegadores sin OffscreenCanvas
function OffscreenCanvasSafe(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; this.canvas = c; this.ctx = c.getContext('2d'); }

/* ---------- Actitud, trayectoria y ángulo de ataque ---------- */
export function mountAttitude(host) {
  host.innerHTML = `<div class="att-lab"><svg viewBox="0 0 640 300" role="img" aria-label="Avión con su actitud, su trayectoria y el viento relativo">
<defs><marker id="am" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto"><path d="M0 0L8 4.5L0 9Z" fill="currentColor"/></marker></defs>
<rect width="640" height="300" fill="#10232c"/><path d="M0 200H640" stroke="#3f6b78" stroke-width="2"/><text x="10" y="194" font-size="11" fill="#7fa6b2">HORIZONTE</text>
<g data-g="path" style="color:#7fb3e0"><path d="M320 150L600 150" stroke="currentColor" stroke-width="3" marker-end="url(#am)"/><text x="520" y="140" font-size="12" fill="currentColor">trayectoria</text></g>
<g data-g="wind" style="color:#cfe3ea"><path d="M120 150L250 150" stroke="currentColor" stroke-width="3" stroke-dasharray="8 6" marker-end="url(#am)"/><text x="80" y="140" font-size="12" fill="currentColor">viento relativo</text></g>
<g data-g="plane"><path d="M230 150C240 140 280 138 360 140L420 128L432 132L420 146L440 150L420 156L360 160C290 164 245 162 230 150Z" fill="#e6e9e2" stroke="#2d4a55"/><path d="M300 152L370 154" stroke="#2d4a55" stroke-width="5"/><path d="M200 150H470" stroke="#efb568" stroke-dasharray="4 5"/><text x="440" y="120" font-size="12" fill="#efb568">eje del avión</text></g>
<text data-g="txt" x="20" y="285" font-size="14" fill="#efb568" font-weight="600"></text></svg>
<div class="att-controls"><label>Actitud (cabeceo) <output data-o="th"></output><input type="range" data-i="th" min="-10" max="20" value="8"></label>
<label>Trayectoria (subir/bajar) <output data-o="ga"></output><input type="range" data-i="ga" min="-10" max="12" value="3"></label>
<p class="fine-print">Ángulo de ataque = actitud − trayectoria. El viento relativo siempre viene <b>de frente a la trayectoria</b>, no del horizonte.</p></div></div>`;
  const q = s => host.querySelector(s);
  function upd() {
    const th = +q('[data-i=th]').value, ga = +q('[data-i=ga]').value, aoa = th - ga;
    q('[data-g=plane]').setAttribute('transform', `rotate(${-th} 320 150)`);
    q('[data-g=path]').setAttribute('transform', `rotate(${-ga} 320 150)`);
    q('[data-g=wind]').setAttribute('transform', `rotate(${-ga} 320 150)`);
    q('[data-o=th]').textContent = th + '°'; q('[data-o=ga]').textContent = (ga > 0 ? '+' : '') + ga + '°';
    q('[data-g=txt]').textContent = `Ángulo de ataque: ${aoa}°  ${aoa > 15 ? '— por encima del crítico: pérdida, aunque la nariz no esté muy arriba' : aoa < 0 ? '— negativo' : ''}`;
  }
  host.addEventListener('input', upd); upd();
  return () => {};
}

/* ---------- Viraje y pérdida: tabla del Manual de Vuelo LV-LLS (§5) ---------- */
import { stallByBank } from './data/lvlls.js';
export function mountTurn(host) {
  const T = stallByBank;
  const interp = b => { for (let i = 0; i < T.bank.length - 1; i++) if (b <= T.bank[i + 1]) { const t = (b - T.bank[i]) / (T.bank[i + 1] - T.bank[i]); return T.flapsUp[i] + t * (T.flapsUp[i + 1] - T.flapsUp[i]); } return T.flapsUp.at(-1); };
  host.innerHTML = `<div class="turn-lab"><svg viewBox="0 0 640 330" role="img" aria-label="Avión visto de frente en un viraje, con la sustentación dividida en componentes">
<defs><marker id="tm" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto"><path d="M0 0L8 4.5L0 9Z" fill="currentColor"/></marker></defs>
<rect width="640" height="330" fill="#10232c"/><path d="M0 260H640" stroke="#3f6b78" stroke-width="2"/>
<g data-t="lift" style="color:#efb568"><path d="M320 170V60" stroke="currentColor" stroke-width="5" marker-end="url(#tm)"/></g>
<g style="color:#7fb3e0"><path data-t="vert" d="M320 170V90" stroke="currentColor" stroke-width="3" stroke-dasharray="6 5" marker-end="url(#tm)"/><path data-t="horiz" d="M320 170H360" stroke="currentColor" stroke-width="3" stroke-dasharray="6 5" marker-end="url(#tm)"/></g>
<g style="color:#d9e5e8"><path d="M320 170V250" stroke="currentColor" stroke-width="4" marker-end="url(#tm)"/><text x="330" y="246" font-size="12" fill="currentColor">PESO</text></g>
<g data-t="plane"><path d="M120 172L300 160H340L520 172L520 178L340 176H300L120 178Z" fill="#e6e9e2" stroke="#2d4a55"/><circle cx="320" cy="168" r="22" fill="#e6e9e2" stroke="#2d4a55"/><circle cx="320" cy="168" r="12" fill="#214f65"/><path d="M314 146L320 120L326 146Z" fill="#e6e9e2" stroke="#2d4a55"/><path d="M300 190V214M340 190V214" stroke="#9cb1b5" stroke-width="5"/></g>
<text data-t="ltxt" x="340" y="70" font-size="12" fill="#efb568">SUSTENTACIÓN</text>
<text x="20" y="300" font-size="12" fill="#7fb3e0">- - - componente vertical (sostiene el peso) · componente horizontal (hace girar)</text></svg>
<div class="turn-side"><label>Inclinación <output data-o="b"></output><input type="range" data-i="b" min="0" max="60" value="30"></label>
<div class="aero-readout"><div><span>Factor de carga</span><b data-o="n"></b></div><div><span>Pérdida sin potencia, flaps arriba</span><b data-o="vs"></b></div><div><span>Aumento respecto de alas niveladas</span><b data-o="inc"></b></div></div>
<table class="mini-table"><caption>Manual de Vuelo LV-LLS §5 · mph CAS · 2150 lb · sin potencia</caption><tr><th>Inclinación</th>${T.bank.map(b => `<th>${b}°</th>`).join('')}</tr><tr><td>Flaps arriba</td>${T.flapsUp.map(v => `<td>${v}</td>`).join('')}</tr><tr><td>Flaps abajo</td><td>${T.flapsDown0}</td>${T.bank.slice(1).map(() => '<td>—</td>').join('')}</tr></table>
<p class="fine-print">Para seguir a la misma altura en viraje, la componente vertical tiene que igualar al peso: la sustentación total debe crecer en 1/cos(inclinación). Más sustentación con el mismo ala = más ángulo de ataque, y el ángulo crítico se alcanza a mayor velocidad. Fijate que la tabla del Manual sigue casi exacto la raíz de ese factor: 64 × √(1/cos 60°) = 90,5 mph (el Manual dice 91).</p></div></div>`;
  const q = s => host.querySelector(s);
  function upd() {
    const b = +q('[data-i=b]').value, n = 1 / Math.cos(b * Math.PI / 180), vs = interp(b);
    q('[data-t=plane]').setAttribute('transform', `rotate(${b} 320 170)`);
    const L = 80 * n, vx = Math.sin(b * Math.PI / 180) * L, vy = Math.cos(b * Math.PI / 180) * L;
    q('[data-t=lift] path').setAttribute('d', `M320 170L${320 + vx} ${170 - vy}`);
    q('[data-t=vert]').setAttribute('d', `M320 170V${170 - vy}`); q('[data-t=horiz]').setAttribute('d', `M320 170H${320 + vx}`);
    q('[data-t=ltxt]').setAttribute('x', 330 + vx); q('[data-t=ltxt]').setAttribute('y', 165 - vy);
    q('[data-o=b]').textContent = b + '°'; q('[data-o=n]').textContent = n.toFixed(2).replace('.', ',') + ' g';
    q('[data-o=vs]').textContent = `≈ ${Math.round(vs)} mph (${Math.round(vs * .869)} kt)`;
    q('[data-o=inc]').textContent = '+' + Math.round((vs / T.flapsUp[0] - 1) * 100) + ' %';
  }
  host.addEventListener('input', upd); upd();
  return () => {};
}

/* ---------- Ejes y mandos (recorridos del Manual de Vuelo LV-LLS §2 r) ---------- */
import { travel } from './data/lvlls.js';
export function mountAxes(host) {
  host.innerHTML = `<div class="axes-lab">
<svg viewBox="0 0 960 340" role="img" aria-label="Tres vistas del avión: lateral para el cabeceo, frontal para el alabeo y superior para la guiñada">
<defs><marker id="xm" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0L7 4L0 8Z" fill="#efb568"/></marker></defs>
<rect width="960" height="340" rx="10" fill="#10232c"/>
<g font-size="11" fill="#9fc0ca" letter-spacing="1"><text x="20" y="26">CABECEO · EJE LATERAL</text><text x="340" y="26">ALABEO · EJE LONGITUDINAL</text><text x="660" y="26">GUIÑADA · EJE VERTICAL</text></g>
<path d="M320 40V320M640 40V320" stroke="#24414d"/>
<!-- vista lateral -->
<path d="M30 190H300" stroke="#2e5562" stroke-dasharray="4 6"/>
<g data-x="pitch" transform="rotate(0 160 190)">
 <path d="M50 192C60 178 90 172 130 172L150 162H190L210 172L250 178L268 150H282L286 182L276 194L130 202C90 204 60 202 50 192Z" fill="#e6e9e2" stroke="#2d4a55"/>
 <path d="M150 164H188L200 173H140Z" fill="#214f65"/><path d="M110 192H190" stroke="#2d4a55" stroke-width="4"/>
 <g data-x="stab" transform="rotate(0 262 186)"><path d="M254 184L300 182L302 188L254 189Z" fill="#7fb3e0" stroke="#2d4a55"/><g data-x="tab" transform="rotate(0 296 185)"><path d="M296 183L314 183L314 187L296 188Z" fill="#efb568"/></g></g>
 <circle cx="160" cy="190" r="3" fill="#efb568"/>
</g>
<text data-x="ptxt" x="20" y="300" font-size="12" fill="#efb568"></text><text data-x="ptxt2" x="20" y="318" font-size="11" fill="#9fc0ca"></text>
<!-- vista frontal -->
<g data-x="roll" transform="rotate(0 480 180)">
 <path d="M340 178L462 168H498L620 178V186L498 184H462L340 186Z" fill="#e6e9e2" stroke="#2d4a55"/>
 <ellipse cx="480" cy="176" rx="20" ry="22" fill="#e6e9e2" stroke="#2d4a55"/><ellipse cx="480" cy="170" rx="11" ry="10" fill="#214f65"/>
 <path d="M476 154L480 124L484 154Z" fill="#e6e9e2" stroke="#2d4a55"/><path d="M455 160H505" stroke="#7fb3e0" stroke-width="3"/>
 <g data-x="ailL"><rect x="342" y="178" width="58" height="5" fill="#7fb3e0"/></g><g data-x="ailR"><rect x="560" y="178" width="58" height="5" fill="#7fb3e0"/></g>
 <path d="M462 198V214M498 198V214M480 198V214" stroke="#9cb1b5" stroke-width="4"/>
</g>
<text data-x="rtxt" x="340" y="300" font-size="12" fill="#efb568"></text><text data-x="rtxt2" x="340" y="318" font-size="11" fill="#9fc0ca"></text>
<!-- vista superior -->
<g data-x="yaw" transform="rotate(0 800 175)">
 <path d="M792 80Q800 62 808 80L812 150L940 156V182L812 186L806 262L834 268V282L766 282V268L794 262L788 186L660 182V156L788 150Z" fill="#e6e9e2" stroke="#2d4a55"/>
 <path d="M792 108H808L810 140H790Z" fill="#214f65"/><path d="M780 66H820" stroke="#2d4a55" stroke-width="4"/>
 <g data-x="rud" transform="rotate(0 800 282)"><path d="M797 282H803L802 302H798Z" fill="#7fb3e0" stroke="#2d4a55"/></g>
</g>
<path data-x="advyaw" d="" stroke="#ff9c7c" stroke-width="3" fill="none" marker-end="url(#xm)"/>
<text data-x="ytxt" x="660" y="300" font-size="12" fill="#efb568"></text><text data-x="ytxt2" x="660" y="318" font-size="11" fill="#ff9c7c"></text>
</svg>
<div class="axes-controls">
 <label>Volante adelante / atrás <output data-o="p"></output><input type="range" data-i="p" min="-100" max="100" value="0"></label>
 <label>Volante izquierda / derecha <output data-o="r"></output><input type="range" data-i="r" min="-100" max="100" value="0"></label>
 <label>Pedales <output data-o="y"></output><input type="range" data-i="y" min="-100" max="100" value="0"></label>
 <div class="seg"><button data-center>Centrar mandos</button><button data-level>Nivelar el avión</button></div>
 <ul class="tips"><li><b>Estabilizador monobloque</b>: se mueve entero (Manual: 18° arriba, 2° abajo). Su aleta anti-servo (ámbar) se mueve hacia el mismo lado para dar «peso» al mando, y también es el compensador.</li><li><b>Alerones diferenciales</b>: el que sube se mueve más (30°) que el que baja (15°), para reducir la guiñada adversa.</li><li><b>Guiñada adversa</b>: al alabear sin pedal, la nariz tiende hacia el lado contrario (flecha rosada). El pedal del lado del viraje la corrige.</li></ul>
 <p class="fine-print">Recorridos: Manual de Vuelo LV-LLS §2 r. La respuesta del avión es esquemática, no una dinámica de vuelo real. Diferencial de alerones y aleta anti-servo: Owner's Handbook p. 7.</p>
</div></div>`;
  const q = s => host.querySelector(s);
  let st = { p: 0, r: 0, y: 0, pitch: 0, roll: 0, yaw: 0, rollRate: 0 }, alive = true;
  const v = k => +q(`[data-i=${k}]`).value / 100;
  function frame() {
    if (!alive) return;
    const p = v('p'), r = v('r'), y = v('y');
    st.pitch += ((-p * 18) - st.pitch) * .08;                // atrás (−) = nariz arriba
    st.rollRate = r * 1.6; st.roll = clamp(st.roll + st.rollRate, -60, 60);
    const adverse = -st.rollRate * 2.2;
    st.yaw += ((y * 22 + adverse) - st.yaw) * .1;
    const stab = p < 0 ? -p * travel.stabUp : -p * travel.stabDown; // positivo = borde de fuga arriba
    q('[data-x=pitch]').setAttribute('transform', `rotate(${(-st.pitch).toFixed(2)} 160 190)`);
    q('[data-x=stab]').setAttribute('transform', `rotate(${(-stab).toFixed(2)} 262 186)`);
    q('[data-x=tab]').setAttribute('transform', `rotate(${(-stab * .6).toFixed(2)} 296 185)`);
    const rightDefl = r > 0 ? -r * travel.aileronUp : -r * travel.aileronDown;
    const leftDefl = r > 0 ? r * travel.aileronDown : r * travel.aileronUp; // positivo = abajo
    q('[data-x=ailR]').setAttribute('transform', `translate(0 ${(rightDefl * .45).toFixed(2)})`);
    q('[data-x=ailL]').setAttribute('transform', `translate(0 ${(leftDefl * .45).toFixed(2)})`);
    q('[data-x=roll]').setAttribute('transform', `rotate(${st.roll.toFixed(2)} 480 180)`);
    q('[data-x=yaw]').setAttribute('transform', `rotate(${st.yaw.toFixed(2)} 800 175)`);
    q('[data-x=rud]').setAttribute('transform', `rotate(${(-y * travel.rudder).toFixed(2)} 800 282)`);
    const a = Math.abs(adverse) > 1 ? adverse : 0;
    q('[data-x=advyaw]').setAttribute('d', a ? `M800 52 q ${a > 0 ? 30 : -30} -12 ${a > 0 ? 50 : -50} 0` : '');
    q('[data-x=ptxt]').textContent = p < -.02 ? `Volante atrás → estabilizador ${Math.round(-p * travel.stabUp)}° arriba → nariz arriba` : p > .02 ? `Volante adelante → estabilizador ${Math.round(p * travel.stabDown * 10) / 10}° abajo → nariz abajo` : 'Estabilizador neutro';
    q('[data-x=ptxt2]').textContent = 'Recorrido total: 18° arriba · 2° abajo';
    q('[data-x=rtxt]').textContent = Math.abs(r) > .02 ? `Alerón ${r > 0 ? 'derecho' : 'izquierdo'} ${Math.round(Math.abs(r) * travel.aileronUp)}° arriba · ${r > 0 ? 'izquierdo' : 'derecho'} ${Math.round(Math.abs(r) * travel.aileronDown)}° abajo` : 'Alerones neutros';
    q('[data-x=rtxt2]').textContent = `Inclinación ${Math.round(Math.abs(st.roll))}° ${st.roll > 1 ? 'a la derecha' : st.roll < -1 ? 'a la izquierda' : ''}`;
    q('[data-x=ytxt]').textContent = Math.abs(y) > .02 ? `Timón ${Math.round(Math.abs(y) * travel.rudder)}° a la ${y > 0 ? 'derecha' : 'izquierda'} · rueda de nariz hasta ${travel.noseWheel}° en tierra` : 'Timón neutro';
    q('[data-x=ytxt2]').textContent = a ? 'Guiñada adversa: la nariz va hacia el lado contrario' : '';
    q('[data-o=p]').textContent = p < -.02 ? 'atrás' : p > .02 ? 'adelante' : 'neutro';
    q('[data-o=r]').textContent = r < -.02 ? 'izquierda' : r > .02 ? 'derecha' : 'neutro';
    q('[data-o=y]').textContent = y < -.02 ? 'izquierdo' : y > .02 ? 'derecho' : 'centrados';
  }
  const t = setInterval(frame, 33);
  host.addEventListener('click', e => { if (e.target.closest('[data-center]')) host.querySelectorAll('[data-i]').forEach(i => i.value = 0); if (e.target.closest('[data-level]')) { st.roll = 0; st.yaw = 0; } });
  frame();
  return () => { alive = false; clearInterval(t); };
}

/* ---------- Carburador y hielo (criterios generales FAA PHAK cap. 7) ---------- */
export function mountCarb(host) {
  host.innerHTML = `<div class="carb-lab"><div class="carb-visual">
<svg viewBox="0 0 520 420" role="img" aria-label="Corte de un carburador de flotante: venturi, surtidor, mariposa del acelerador y formación de hielo">
<defs><linearGradient id="cw" x2="1"><stop offset="0" stop-color="#7fb3e0"/><stop offset="1" stop-color="#c4e3f5"/></linearGradient><pattern id="icep" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="#eaf6ff"/><path d="M0 8L8 0" stroke="#b9d9ee"/></pattern></defs>
<rect width="520" height="420" rx="10" fill="#10232c"/>
<text x="20" y="28" font-size="11" fill="#9fc0ca" letter-spacing="1">CARBURADOR DE FLOTANTE · CORTE ESQUEMÁTICO</text>
<path d="M150 400V300Q150 250 190 220Q205 205 205 170V40H315V170Q315 205 330 220Q370 250 370 300V400" fill="#1d3a46" stroke="#5f7f8b" stroke-width="3"/>
<g class="carb-air">${Array.from({ length: 10 }, (_, i) => `<path d="M${215 + i * 10} 400V300Q${230 + i * 6} 240 ${232 + i * 5.5} 170V40" stroke="#9cc9de" stroke-width="2" fill="none" opacity=".55"/>`).join('')}</g>
<text x="380" y="380" font-size="11" fill="#9fc0ca">AIRE ↑ (desde el filtro</text><text x="380" y="395" font-size="11" fill="#9fc0ca">o del calefactor)</text>
<rect x="390" y="250" width="100" height="70" rx="6" fill="#2a2310" stroke="#8a6d2b"/><path d="M392 285H488V318H392Z" fill="#d9a35c" opacity=".75"/><text x="440" y="270" font-size="10" fill="#f0d79a" text-anchor="middle">CUBA</text><text x="440" y="306" font-size="10" fill="#2b1a05" text-anchor="middle">nafta</text>
<path d="M392 300H330L262 200" stroke="#d9a35c" stroke-width="4" fill="none"/>
<g class="carb-spray" fill="#efb568">${Array.from({ length: 14 }, (_, i) => `<circle cx="${250 + (i % 5) * 6}" cy="${190 - i * 8}" r="${2.2 - i * .08}"/>`).join('')}</g>
<g font-size="11" fill="#efb568"><text x="14" y="176">VENTURI</text><text x="14" y="192">el aire se acelera,</text><text x="14" y="207">baja la presión</text><text x="14" y="222">y la nafta se</text><text x="14" y="237">evapora: la</text><text x="14" y="252">temperatura cae.</text></g>
<g data-c="ice" fill="#f4fbff" fill-opacity=".92" stroke="#9fd3f0" stroke-width="1.2"><path d="M205 150Q211 170 205 196Z"/><path d="M315 150Q309 170 315 196Z"/><ellipse cx="260" cy="110" rx="0" ry="0"/></g>
<g data-c="valve" transform="rotate(-30 260 110)"><rect x="210" y="106" width="100" height="8" rx="3" fill="#c7cfcf" stroke="#2d4a55"/></g><circle cx="260" cy="110" r="5" fill="#2d4a55"/>
<text x="330" y="114" font-size="11" fill="#cfe3ea">MARIPOSA (acelerador)</text>
<text x="325" y="58" font-size="11" fill="#9fc0ca">↑ AL MOTOR</text>
<text data-c="temp" x="14" y="300" font-size="12" fill="#7fb3e0"></text><text data-c="temp2" x="14" y="316" font-size="11" fill="#7fb3e0"></text>
</svg></div>
<div class="carb-side">
 <label>Temperatura exterior <output data-o="t"></output><input type="range" data-i="t" min="-15" max="40" value="12"></label>
 <label>Humedad relativa <output data-o="h"></output><input type="range" data-i="h" min="10" max="100" value="80"></label>
 <label>Potencia <output data-o="p"></output><input type="range" data-i="p" min="10" max="100" value="40"></label>
 <div class="toggles"><button data-heat aria-pressed="false">Calefactor de carburador</button><button data-reset-ice>Reiniciar</button></div>
 <div class="aero-readout"><div><span>Riesgo de hielo (criterio general)</span><b data-o="risk"></b></div><div><span>RPM (ilustrativas)</span><b data-o="rpm"></b></div><div><span>Hielo acumulado</span><b data-o="ice"></b></div></div>
 <p class="carb-msg" data-o="msg" role="status"></p>
 <ul class="tips"><li>Lista, etapa 7: «Calefactor del Carburador — Chequear y Verificar Caída».</li><li>Etapas 12 y 13: «Calefactor del Carburador — A Requerimiento».</li><li>Emergencia 14 · Formación de hielo en el carburador: «Calefacción del Carburador — Abrir · Mezcla — Efectuar máxima suavidad».</li></ul>
 <p class="fine-print">FAA PHAK cap. 7: el hielo puede formarse con temperaturas exteriores bastante altas si hay humedad; con −7 a 21 °C y humedad alta hay que estar especialmente atento, y es más probable con potencia reducida. El aire caliente pasa sin filtrar (Owner's Handbook p. 6). Tiempos y RPM: ilustrativos.</p>
</div></div>`;
  const q = s => host.querySelector(s);
  let ice = 0, heat = false, alive = true, rpmShown = 2300;
  const val = k => +q(`[data-i=${k}]`).value;
  function risk() {
    const t = val('t'), h = val('h'), p = val('p');
    let r = 0;
    if (t >= -7 && t <= 21) r = .55; else if (t > 21 && t <= 38) r = .3; else if (t < -7 && t > -15) r = .12;
    r *= clamp((h - 35) / 50, 0, 1.2);
    r *= p < 60 ? 1.35 : .8;
    return clamp(r, 0, 1);
  }
  function frame() {
    if (!alive) return;
    const r = risk(), p = val('p');
    if (heat) ice = Math.max(0, ice - .02); else ice = Math.min(1, ice + r * .006);
    const base = 1100 + p / 100 * 1250, target = Math.max(0, base - ice * 900 - (heat ? 75 : 0));
    rpmShown += (target - rpmShown) * .1;
    q('[data-c=valve]').setAttribute('transform', `rotate(${-(90 - p * .85)} 260 110)`);
    const ip = q('[data-c=ice]').children; const w = 4 + ice * 26;
    ip[0].setAttribute('d', `M205 ${150 - ice * 30}Q${205 + w} 170 205 ${196 + ice * 20}Z`); ip[1].setAttribute('d', `M315 ${150 - ice * 30}Q${315 - w} 170 315 ${196 + ice * 20}Z`);
    ip[2].setAttribute('rx', ice * 46); ip[2].setAttribute('ry', ice * 9);
    q('[data-c=ice]').setAttribute('opacity', ice > .02 ? 1 : 0);
    const tv = val('t') - (heat ? -40 : 20);
    q('[data-c=temp]').textContent = `Venturi ≈ ${Math.round(tv)} °C`; q('[data-c=temp2]').textContent = heat ? '(con aire caliente)' : '(puede bajar ~20 °C)';
    q('[data-o=t]').textContent = val('t') + ' °C'; q('[data-o=h]').textContent = val('h') + ' %'; q('[data-o=p]').textContent = p + ' %';
    q('[data-o=risk]').textContent = r > .45 ? 'ALTO' : r > .2 ? 'moderado' : r > .05 ? 'bajo' : 'muy bajo';
    q('[data-o=risk]').className = r > .45 ? 'bad' : '';
    q('[data-o=rpm]').textContent = Math.round(rpmShown) + ' RPM';
    q('[data-o=ice]').textContent = Math.round(ice * 100) + ' %';
    q('[data-o=msg]').textContent = heat ? (ice > .05 ? 'Calefactor abierto: primero caen un poco las RPM (aire caliente, menos denso) y el motor puede sacudirse mientras se derrite el hielo; después las RPM se recuperan.' : 'Calefactor abierto: caída leve de RPM, como se verifica en la prueba de motor.') : ice > .6 ? 'Las RPM bajan solas y el motor pierde potencia: síntoma típico de hielo en el carburador.' : ice > .2 ? 'Se está formando hielo en la mariposa y el venturi: el paso de aire se achica.' : '';
    host.querySelector('.carb-spray').style.opacity = heat || ice < .9 ? 1 : .3;
  }
  host.addEventListener('click', e => {
    if (e.target.closest('[data-heat]')) { heat = !heat; e.target.closest('[data-heat]').setAttribute('aria-pressed', heat); }
    if (e.target.closest('[data-reset-ice]')) { ice = 0; heat = false; q('[data-heat]').setAttribute('aria-pressed', false); }
  });
  const t = setInterval(frame, 50); frame();
  return () => { alive = false; clearInterval(t); };
}
