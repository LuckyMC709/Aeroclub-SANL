// Cabina interactiva: panel, mandos y una simulación didáctica simple.
// Los límites y marcas vienen del Manual de Vuelo LV-LLS; los pasos, de la lista del aeroclub.
// La dinámica (tiempos de respuesta, consumos eléctricos, caídas de RPM) es ilustrativa.
import { instrumentLayout } from './data/cockpit-layout.js';
import * as I from './instruments.js';
import { clamp } from './instruments.js';
import { initialState, step } from './cockpit-sim.js';
import { engine } from './data/lvlls.js';

const QNH = 30.06;          // QNH de ejemplo (1018 hPa en la tabla del aeroclub)

const INFO = {
  asi: ['Velocímetro', 'Compara la presión total del tubo pitot con la presión estática. La diferencia crece con la velocidad.', ['Arco blanco 48–100 kt: rango de flaps (VFE 100 kt).', 'Arco verde 56–121 kt: operación normal.', 'Arco amarillo 121–148 kt: precaución, solo en aire calmo.', 'Línea roja 148 kt: nunca exceder (VNE).'], 'Manual de Vuelo LV-LLS §2 · La escala en nudos sigue la lista del aeroclub; confirmá la graduación del instrumento instalado.'],
  ai: ['Horizonte artificial', 'Un giróscopo mantiene su orientación en el espacio; el avión gira a su alrededor. Muestra cabeceo y alabeo.', ['Fuente de energía: vacío (Owner\'s Handbook, PA-28-140 genérico).', 'Tarda en estabilizarse después de la puesta en marcha.', 'Lista, etapa 5: «Horizonte Artificial — Ajustar».'], 'Owner\'s Handbook p. 12 · Lista del aeroclub, etapa 5'],
  alt: ['Altímetro', 'Barómetro aneroide: compara la presión estática con la referencia puesta en la ventanilla de Kollsman.', ['Aguja larga: centenas de pies. Corta: miles. Fina con triángulo: decenas de miles.', 'Lista, etapas 5 y 12: «Altímetro — Ajustar QNH».', 'La tabla del aeroclub convierte hPa a inHg (ej.: 1018 hPa = 30,06 inHg).'], 'Lista y tabla de conversión del aeroclub · FAA PHAK cap. 8'],
  tb: ['Viraje y ladeo', 'La aguja indica la velocidad de giro (giróscopo). La bola, en un tubo con líquido, indica si el viraje está coordinado.', ['Aguja en la marca: viraje estándar de 3°/s (360° en 2 minutos).', 'Bola desplazada: «pisá la bola» con el pedal de ese lado.', 'Giróscopo por vacío según el Owner\'s Handbook; la bola no necesita energía.'], 'Owner\'s Handbook p. 12 · FAA PHAK cap. 8'],
  dg: ['Giro direccional', 'Giróscopo que muestra el rumbo sin las oscilaciones de la brújula, pero no busca el norte: hay que alinearlo.', ['Lista, etapa 5: «Giro Direccional — Ajustar con brújula».', 'Por precesión se desvía: se re-alinea periódicamente.', 'Etapa 8: «Giro Direccional — Ajustar en Rumbo».'], 'Lista del aeroclub, etapas 5 y 8 · Owner\'s Handbook p. 12'],
  vsi: ['Variómetro', 'Mide la velocidad de cambio de la presión estática a través de una fuga calibrada. Por eso tiene retraso.', ['Lista, etapa 5: «Variometro — Chequear en Cero».', 'Escala en cientos de pies por minuto.'], 'Lista del aeroclub, etapa 5 · FAA PHAK cap. 8'],
  tach: ['Tacómetro', 'Revoluciones del motor (y de la hélice, que va directa al cigüeñal).', ['Arco verde 500–2700 RPM, línea roja 2700 (Manual §2).', 'Lista: 1000 RPM tras la puesta en marcha; 2000 en la prueba; 2300/2400 en crucero; 1100 antes de cortar la mezcla.', 'RPM estáticas a pleno en tierra: 2275–2425 (Manual §2).'], 'Manual de Vuelo LV-LLS §2 · Lista del aeroclub'],
  cluster: ['Instrumentos de motor', 'Combustible en cada tanque, presión de combustible, temperatura y presión de aceite, y amperímetro.', ['Temp. aceite: verde 24–118 °C, rojo 118 °C. Presión de aceite: verde 60–90 psi, amarillo 25–60, rojo 90 máx.', 'Presión de combustible: verde 0,5–8 psi.', 'Lista, etapa 5: sin presión de aceite en 30 segundos, parar el motor.', 'Amperímetro (sistema Piper «Full Time Power»): muestra la carga del sistema; con todo apagado y batería cargada, ≈2 A.'], 'Manual de Vuelo LV-LLS §2 · Owner\'s Handbook p. 9–10'],
  suction: ['Succión (vacío)', 'Indica el vacío que genera la bomba accionada por el motor para los giróscopos.', ['Lista, etapa 7: «Medidor de Succión — Chequear entre 4 y 6 HG».', 'Handbook: 5 ± 1 inHg a 2000 RPM.'], 'Lista del aeroclub, etapa 7 · Owner\'s Handbook p. 16'],
  compass: ['Brújula magnética', 'La única referencia de rumbo que no necesita energía. Oscila en turbulencia y tiene errores en virajes y aceleraciones.', ['Sirve para alinear el giro direccional.'], 'FAA PHAK cap. 8'],
  stall: ['Aviso de pérdida', 'Avisa que el ala se acerca al ángulo de ataque crítico.', ['Owner\'s Handbook: luz roja a la izquierda del panel, se enciende 5–10 mph antes de la pérdida.', 'La lista del aeroclub pide verificar el «sonido» de la chapita: confirmar si el LV-LLS tiene bocina, luz o ambas.', 'Manual §3: inoperativo con la llave general de batería desconectada.'], 'Manual §3 · Owner\'s Handbook p. 18 · Lista etapa 2'],
  radio: ['Comunicación y navegación', 'Radio VHF de comunicación y receptor de navegación. Panel genérico: modelos y marcas del LV-LLS por confirmar.', ['Plan de vuelo del aeroclub: equipo «S» (estándar: VHF, VOR, ILS) y transponder «C» (modo C).', '121,5 MHz: frecuencia aeronáutica de emergencia.'], 'Planes de vuelo y material del aeroclub'],
  xpdr: ['Transponder', 'Responde a los radares con un código de 4 dígitos y, en modo C, la altitud.', ['Códigos ICE: 7500 interferencia ilícita · 7600 pérdida de comunicaciones · 7700 emergencia.', 'Lista, etapa 14: «Transponder (XPND) — Standby».'], 'Material del aeroclub · Lista etapa 14']
};

// Pasos de la lista del aeroclub (texto original) y cómo detectarlos en el simulador.
const GUIDES = {
  start: { title: '4 · Puesta en marcha', note: 'Caso «Si no hay torre de control». Con torre, primero se pide autorización.', steps: [
    ['Mezcla', 'Rica', s => s.mixture > .9],
    ['Potencia', 'Avanzar 1/4', s => s.throttle >= .12 && s.throttle <= .4],
    ['Inyector (Primer)', 'A Requerimiento', s => s.primer > 0, true],
    ['Batería', 'Conectar (ON)', s => s.bat],
    ['Luz Anticolisión', 'Conectar (ON)', s => s.bcn],
    ['Bomba Eléctrica de Combustible', 'Conectar (ON)', s => s.pump],
    ['Área de Hélice', 'Libre', s => s.clear, true],
    ['Magnetos', 'Both/Start', s => s.running && s.mag === 'both'],
    ['Acelerador', 'Ajustar 1000 RPM', s => s.running && Math.abs(s.rpm - 1000) < 120],
    ['Alternador', 'Conectar y Verificar Carga', s => s.alt && s.amps > 0]
  ] },
  after: { title: '5 · Posterior a la puesta en marcha', note: 'Si no hay presión de aceite dentro de los 30 segundos, parar el Motor.', steps: [
    ['Presión de Aceite', 'Verificar', s => s.running && s.oilP >= 25],
    ['Presión de Combustible', 'Verificar', s => s.fuelP >= .5 && s.fuelP <= 8],
    ['Presión de Vacío', 'Verificar Funcionamiento', s => s.suction > 2],
    ['Bomba de Combustible', 'Off', s => s.running && !s.pump],
    ['Velocímetro', 'Chequear en Cero', s => s.ias < 1],
    ['Horizonte Artificial', 'Ajustar', s => s.gyro > .8],
    ['Altímetro', 'Ajustar QNH', s => Math.abs(s.kollsman - QNH) < .005],
    ['Variometro', 'Chequear en Cero', s => Math.abs(s.vsInd) < 50],
    ['Giro Direccional', 'Ajustar con brújula', s => Math.abs(s.dgOffset) < 1],
    ['Indicador de Giros y Ladeos', 'Chequear', s => s.gyro > .8],
    ['Equipos Y Radios', 'Conectar (ON)', s => s.radio]
  ] },
  runup: { title: '7 · Prueba de motor en tierra', note: 'Caída máxima de magnetos 175 RPM; diferencia máxima entre ambos 50 RPM.', steps: [
    ['Freno de Parqueo', 'Colocar', s => s.pbrake],
    ['Mezcla', 'Rica', s => s.mixture > .9],
    ['Potencia', 'Ajustar 2000 RPM', s => s.running && Math.abs(s.rpm - 2000) < 60],
    ['Instrumentos de Motor', 'Chequear Arco Verde', s => s.running && s.oilP >= 60 && s.oilP <= 90 && s.oilT >= 24 && s.oilT <= 118],
    ['Magnetos', 'Comprobar Caída Max 175 RPM · Dif Max entre ambos 50 RPM', s => s.dropL > 0 && s.dropR > 0 && Math.max(s.dropL, s.dropR) <= engine.magDropMax && Math.abs(s.dropL - s.dropR) <= engine.magDiffMax],
    ['Medidor de Succión', 'Chequear entre 4 y 6 HG', s => s.suction >= 4 && s.suction <= 6],
    ['Calefactor del Carburador', 'Chequear y Verificar Caída', s => s.carbChecked],
    ['Potencia', 'Reducir 1000 RPM', s => s.carbChecked && s.running && Math.abs(s.rpm - 1000) < 120]
  ] }
};

const FAILS = [
  ['alt', 'Falla del alternador', 'Emergencia 11 · Falla eléctrica: el amperímetro marca cero y la batería se descarga.'],
  ['vac', 'Falla de la bomba de vacío', 'Succión en cero: los giróscopos pierden velocidad y aparecen las banderas.'],
  ['epump', 'Falla de la bomba mecánica de combustible', 'Emergencia 10 · Pérdida de presión de combustible: «Bomba eléctrica — Conectar».'],
  ['ice', 'Hielo en el carburador', 'Emergencia 14: «Calefacción del Carburador — Abrir». Caen las RPM de a poco.'],
  ['magR', 'Magneto derecho defectuoso', 'En la prueba de magnetos la caída supera 175 RPM: no apto para el vuelo.'],
  ['pitot', 'Pitot y drenaje obstruidos', 'Ambas aberturas bloqueadas: queda atrapada la presión total. Con la estática libre, el velocímetro aumenta al ascender. Si solo se bloquea la entrada y el drenaje queda abierto, el comportamiento es distinto (FAA PHAK cap. 8).'],
  ['static', 'Toma estática obstruida', 'Altímetro congelado y variómetro en cero.']
];

/* ======================= Interfaz ======================= */
const place = (svg, x, y, w, h) => svg.replace('<svg ', `<svg x="${x}" y="${y}" width="${w}" height="${h}" `);

const SWNAME = { bat: 'Batería', alt: 'Alternador', pump: 'Bomba eléctrica de combustible', nav: 'Luces de navegación', bcn: 'Luz anticolisión', land: 'Luz de aterrizaje', panel: 'Luces de panel', radio: 'Equipos y radios' };
function toggleSVG(id, x, label) {
  return `<g class="sw" data-sw="${id}" role="switch" tabindex="0" aria-label="${SWNAME[id]}" transform="translate(${x} 668)">
<rect x="-26" y="-34" width="52" height="68" rx="5" fill="#1a1c1d" stroke="#3c4043"/>
<circle cx="-18" cy="-26" r="2.4" fill="#777"/><circle cx="18" cy="26" r="2.4" fill="#777"/>
<circle r="11" fill="#9ea2a3" stroke="#333"/><circle r="6" fill="#4b4f51"/>
<g class="lever"><rect x="-4" y="-28" width="8" height="28" rx="4" fill="#d9dcda" stroke="#555"/><circle cy="-28" r="6" fill="#eef0ee" stroke="#666"/></g>
<text y="52" font-size="10" text-anchor="middle" fill="#e9e6d8">${label.toUpperCase()}</text></g>`;
}
function knobSVG(id, x, label, color) {
  return `<g class="knob" data-knob="${id}" role="slider" aria-valuemin="0" aria-valuemax="100" aria-orientation="vertical" tabindex="0" aria-label="${label}" transform="translate(${x} 560)">
<rect x="-30" y="-20" width="60" height="18" rx="3" fill="#1a1c1d"/><text y="-26" font-size="12" text-anchor="middle" fill="#e9e6d8" letter-spacing=".5">${label.toUpperCase()}</text>
<rect class="shaft" x="-5" y="-8" width="10" height="10" fill="#b9bdbb"/>
<g class="kh"><rect x="-26" y="0" width="52" height="30" rx="12" fill="${color}" stroke="#000" stroke-opacity=".5"/><rect x="-20" y="4" width="40" height="7" rx="3" fill="#fff" opacity=".22"/></g></g>`;
}

function panelSVG(inst) {
  const positioned = k => place(inst[k].svg, ...instrumentLayout.find(item => item[0] === k).slice(1));
  const sw = [['bat', 'Batería'], ['alt', 'Alternad.'], ['pump', 'Bomba'], ['nav', 'Nav'], ['bcn', 'Anticol.'], ['land', 'Aterriz.'], ['panel', 'Panel'], ['radio', 'Radios']];
  return `<svg class="panel-svg" viewBox="0 0 1600 780" role="group" aria-label="Panel de instrumentos del Cherokee 140 (disposición genérica)" font-family="'Helvetica Neue',Arial,sans-serif">
<defs>
 <linearGradient id="pbg" x2="0" y2="1"><stop offset="0" stop-color="#34383a"/><stop offset=".5" stop-color="#26292b"/><stop offset="1" stop-color="#1b1d1e"/></linearGradient>
 <linearGradient id="gls" x2="0" y2="1"><stop offset="0" stop-color="#0d0e0f"/><stop offset="1" stop-color="#1f2123"/></linearGradient>
 <pattern id="grain" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill="none"/><circle cx="1" cy="1" r=".6" fill="#fff" opacity=".035"/><circle cx="4" cy="4" r=".6" fill="#000" opacity=".12"/></pattern>
 <radialGradient id="lamp" cx="50%" cy="40%"><stop offset="0" stop-color="#ff8c7a"/><stop offset=".6" stop-color="#d0281c"/><stop offset="1" stop-color="#5a0d08"/></radialGradient>
</defs>
<path d="M0 110Q0 64 52 60H1548Q1600 64 1600 110V780H0Z" fill="url(#pbg)"/><path d="M0 110Q0 64 52 60H1548Q1600 64 1600 110V780H0Z" fill="url(#grain)"/>
<path d="M0 0H1600V58Q1600 84 1560 86H40Q0 84 0 58Z" fill="url(#gls)"/><path d="M40 86H1560" stroke="#4b4f52" stroke-width="2"/>
<g class="inst-hit" data-inst="compass" tabindex="0" role="button" aria-label="Brújula magnética">${positioned('compass')}</g>
${instrumentLayout.slice(0,6).map(([k]) => `<g class="inst-hit" data-inst="${k}" tabindex="0" role="button" aria-label="${INFO[k][0]}">${positioned(k)}</g>`).join('')}
<g class="inst-hit" data-inst="suction" tabindex="0" role="button" aria-label="Succión">${positioned('suction')}</g>
<g class="inst-hit" data-inst="stall" tabindex="0" role="button" aria-label="Luz de aviso de pérdida" transform="translate(222 570)"><rect x="-34" y="-22" width="68" height="62" rx="6" fill="#1a1c1d" stroke="#3c4043"/><circle data-n="stall-lamp" r="15" fill="#4a120e" stroke="#222" stroke-width="3"/><text y="32" font-size="10" text-anchor="middle" fill="#e9e6d8">STALL</text></g>
<g class="inst-hit" data-inst="radio" tabindex="0" role="button" aria-label="Radio de comunicación y navegación" transform="translate(728 104)">
 <rect width="300" height="128" rx="6" fill="#151617" stroke="#4a4e51"/><rect x="10" y="10" width="280" height="72" rx="3" fill="#050606"/>
 <text x="22" y="30" font-size="10" fill="#8a8f8c">COM</text><text data-n="com" x="22" y="64" font-size="30" fill="#5cff7a" font-family="ui-monospace,monospace" opacity=".25">118.000</text>
 <text x="170" y="30" font-size="10" fill="#8a8f8c">NAV</text><text data-n="navf" x="170" y="64" font-size="24" fill="#5cff7a" font-family="ui-monospace,monospace" opacity=".25">110.00</text>
 ${[40, 110, 190, 260].map(x => `<circle cx="${x}" cy="105" r="13" fill="#2c2f31" stroke="#555"/><circle cx="${x}" cy="105" r="7" fill="#45494b"/>`).join('')}
</g>
<g class="inst-hit" data-inst="xpdr" tabindex="0" role="button" aria-label="Transponder" transform="translate(728 250)">
 <rect width="300" height="84" rx="6" fill="#151617" stroke="#4a4e51"/><rect x="10" y="10" width="170" height="40" rx="3" fill="#050606"/>
 <text data-n="sq" x="95" y="40" font-size="26" fill="#ff5a3c" text-anchor="middle" font-family="ui-monospace,monospace" opacity=".25">0000</text>
 <text x="196" y="26" font-size="9" fill="#8a8f8c">OFF SBY ON ALT</text><circle cx="240" cy="54" r="15" fill="#2c2f31" stroke="#555"/><text x="95" y="72" font-size="9" fill="#8a8f8c" text-anchor="middle">ATC · MODO C</text>
</g>
<g class="inst-hit" data-inst="tach" tabindex="0" role="button" aria-label="Tacómetro">${positioned('tach')}</g>
<g class="inst-hit" data-inst="cluster" tabindex="0" role="button" aria-label="Instrumentos de motor">${positioned('cluster')}</g>
<g class="mag" data-mag role="button" tabindex="0" aria-label="Llave de magnetos y arranque" transform="translate(1150 400)">
 <circle r="58" fill="#1a1c1d" stroke="#3c4043"/>${['OFF', 'R', 'L', 'BOTH', 'START'].map((t, i) => { const a = (-60 + i * 30) * Math.PI / 180; return `<text x="${Math.sin(a) * 44}" y="${-Math.cos(a) * 44 + 4}" font-size="${t.length > 2 ? 9 : 11}" text-anchor="middle" fill="#e9e6d8">${t}</text>`; }).join('')}
 <g class="key"><circle r="24" fill="#a9adab" stroke="#333"/><rect x="-6" y="-30" width="12" height="44" rx="4" fill="#d5d8d6" stroke="#555"/></g>
 <text y="80" font-size="11" text-anchor="middle" fill="#e9e6d8">MAGNETOS</text></g>
<g class="primer" data-primer role="button" tabindex="0" aria-label="Cebador (primer)" transform="translate(1300 400)"><circle r="22" fill="#1a1c1d" stroke="#3c4043"/><circle class="pk" r="14" fill="#d9dcda" stroke="#555"/><text y="44" font-size="11" text-anchor="middle" fill="#e9e6d8">PRIMER</text></g>
<g class="fsel" data-fsel role="button" tabindex="0" aria-label="Selector de combustible" transform="translate(1440 410)">
 <circle r="60" fill="#22180c" stroke="#5a4321"/><text y="-38" font-size="10" text-anchor="middle" fill="#f0d79a">OFF</text><text x="-40" y="12" font-size="10" text-anchor="middle" fill="#f0d79a">IZQ</text><text x="40" y="12" font-size="10" text-anchor="middle" fill="#f0d79a">DER</text>
 <g class="fh"><path d="M-8 -44L8 -44L5 20L-5 20Z" fill="#c9a24a" stroke="#4b3511"/><circle r="12" fill="#a9832e"/></g><text y="84" font-size="11" text-anchor="middle" fill="#e9e6d8">COMBUSTIBLE</text></g>
${knobSVG('carb', 780, 'Calefactor', '#2e2f30')}${knobSVG('throttle', 880, 'Acelerador', '#1b1b1b')}${knobSVG('mixture', 1010, 'Mezcla', '#c3271d')}
<text x="880" y="700" font-size="10" text-anchor="middle" fill="#888">ACELERADOR / MEZCLA · adentro = más</text>
<g class="pbrake" data-pbrake role="button" tabindex="0" aria-label="Freno de estacionamiento" transform="translate(770 752)"><rect x="-70" y="-14" width="140" height="28" rx="6" fill="#1a1c1d" stroke="#3c4043"/><rect class="ph" x="-46" y="-8" width="92" height="16" rx="8" fill="#b9bdbb"/><text x="-80" y="4" font-size="10" text-anchor="end" fill="#e9e6d8">FRENO DE MANO</text></g>
<g transform="translate(0 0)">${sw.map(([id, l], i) => toggleSVG(id, 96 + i * 76, l)).join('')}</g>
<g transform="translate(70 600)">${Array.from({ length: 8 }, (_, i) => `<g data-fuse="${i === 0 ? 'alt' : ''}"><circle cx="${i * 76 + 26}" cy="0" r="9" fill="#2a2c2e" stroke="#555"/><circle class="fz" cx="${i * 76 + 26}" cy="0" r="5" fill="#bfc3c1"/></g>`).join('')}<text x="290" y="-16" font-size="9" fill="#999" text-anchor="middle">FUSIBLES</text></g>
<text x="1580" y="770" font-size="10" fill="#777" text-anchor="end">Disposición genérica PA-28-140 · por confirmar con fotos del LV-LLS</text>
</svg>`;
}

export function mountCockpit(host, { mode = 'ground', onInfo, initialView = 'all' } = {}) {
  let scene3d = null, scenePending = false, disposed = false, paused = matchMedia('(prefers-reduced-motion: reduce)').matches, detailUpdate = null, panelView = 'all';
  const events = new AbortController();
  let s = initialState(mode), raf = 0, last = performance.now(), alive = true, guide = mode === 'flight' ? null : 'start';
  const inst = { asi: I.airspeed(), ai: I.attitude(), alt: I.altimeter(), tb: I.turnBank(), dg: I.heading(), vsi: I.vsi(), tach: I.tachometer(), suction: I.suction(), cluster: I.engineCluster(), compass: I.compass() };
  host.innerHTML = `<div class="cockpit">
 <div class="cockpit-bar"><div class="seg" role="group" aria-label="Escenario">
   <button data-cmode="ground" aria-pressed="${mode === 'ground'}">En tierra · puesta en marcha</button><button data-cmode="flight" aria-pressed="${mode === 'flight'}">En vuelo · instrumentos</button></div>
   <div class="seg"><button data-simpause aria-pressed="${paused}">${paused ? 'Continuar simulación' : 'Pausar simulación'}</button><button class="chip" data-creset>Reiniciar</button></div></div>
 <div class="cockpit-views seg" role="group" aria-label="Vista de cabina"><button data-cview="all" aria-pressed="true">Panel completo</button><button data-cview="pilot" aria-pressed="false">Instrumentos de vuelo</button><button data-cview="engine" aria-pressed="false">Motor y radios</button><button data-cview="3d" aria-pressed="false">Cabina 3D</button></div>
 <p class="fine-print">Panel genérico interactivo · ubicación y equipos del LV-LLS pendientes de fotos.</p>
 <div class="cockpit-scene" hidden></div><div class="panel-wrap">${panelSVG(inst)}</div>
 <div class="flight-readouts" aria-label="Lecturas de la simulación"><span>Velocidad indicada <b data-live="ias"></b></span><span>Altitud indicada <b data-live="alt"></b></span><span>Motor <b data-live="rpm"></b></span><span>Vacío <b data-live="vac"></b></span><span>Batería <b data-live="bat"></b></span></div><p class="swipe-hint">↔ Deslizá el panel para ver motor, radios y magnetos. Tocá un instrumento para ver qué mide.</p>
 <p class="cockpit-msg" role="status" aria-live="polite"></p>
 <div class="cockpit-grid">
  <section class="deck" aria-label="Mandos">
   <div class="deck-group"><h3>Eléctrico</h3><div class="toggles">${[['bat', 'Batería'], ['alt', 'Alternador'], ['pump', 'Bomba eléctrica'], ['radio', 'Radios'], ['nav', 'Luces de navegación'], ['bcn', 'Anticolisión'], ['land', 'Luz de aterrizaje'], ['panel', 'Luces de panel']].map(([k, l]) => `<button data-t="${k}" aria-pressed="false">${l}</button>`).join('')}</div></div>
   <div class="deck-group"><h3>Motor</h3>
    <div class="seg mags" role="group" aria-label="Magnetos">${['off', 'right', 'left', 'both'].map(m => `<button data-m="${m}">${({ off: 'OFF', right: 'R', left: 'L', both: 'BOTH' })[m]}</button>`).join('')}<button data-start>START (mantener)</button></div>
    <label>Acelerador <output data-o="throttle"></output><input type="range" data-r="throttle" min="0" max="100"></label>
    <label>Mezcla <output data-o="mixture"></output><input type="range" data-r="mixture" min="0" max="100"></label>
    <div class="toggles"><button data-t="carb" aria-pressed="false">Calefactor de carburador</button><button data-primer-btn>Cebar (primer)</button><button data-clear>¡Hélice libre!</button></div>
    <div class="seg" role="group" aria-label="Selector de tanque">${[['off', 'Cerrado'], ['left', 'Izquierdo'], ['right', 'Derecho']].map(([v, l]) => `<button data-sel="${v}">${l}</button>`).join('')}</div></div>
   <div class="deck-group flight-only"><h3>Vuelo</h3>
    <div class="yoke-row"><div class="yoke-pad" tabindex="0" role="group" aria-label="Volante: arrastrá o usá las flechas. Izquierda/derecha alabea, arriba/abajo cabecea."><svg viewBox="0 0 200 140"><path d="M20 70Q20 30 60 30H140Q180 30 180 70V96H150V68Q150 56 136 56H64Q50 56 50 68V96H20Z" fill="#202325" stroke="#555"/><rect x="92" y="60" width="16" height="70" fill="#3a3d3f"/><circle cx="100" cy="64" r="10" fill="#c49a3d"/></svg><span class="yoke-dot"></span></div>
     <div><label>Pedales (timón) <output data-o="rudder"></output><input type="range" data-r="rudder" min="-100" max="100" value="0"></label>
     <label>Compensador <output data-o="trim"></output><input type="range" data-r="trim" min="-100" max="100"></label>
     <div class="seg" role="group" aria-label="Flaps">${[0, 1, 2, 3].map(i => `<button data-flaps="${i}">${[0, 10, 25, 40][i]}°</button>`).join('')}</div></div></div></div>
   <div class="deck-group"><h3>Ajustes</h3>
    <div class="kollsman"><span>Ventanilla del altímetro</span><button data-k="-1" aria-label="Bajar">−</button><output data-o="kollsman"></output><button data-k="1" aria-label="Subir">+</button><small>QNH del ejemplo: 1018 hPa (= 30,06 inHg en la tabla del aeroclub)</small></div>
    <div class="toggles"><button data-dg>Alinear direccional con la brújula</button><button data-t="pbrake" aria-pressed="false">Freno de estacionamiento</button></div></div>
   <div class="deck-group avionics"><h3>Radios y transponder</h3><p class="fine-print">Equipos genéricos de práctica, sin transmisión. Frecuencias y código de ejemplo; no son asignaciones operativas.</p>
    <label>COM en espera (MHz)<input data-com type="number" min="118" max="136.975" step=".025" value="118.025"></label><button class="chip" data-comswap>Intercambiar activa / espera</button><output data-comread></output>
    <label>NAV (MHz)<input data-navfreq type="number" min="108" max="117.95" step=".05" value="110.00"></label>
    <label>Código transponder<input data-code type="text" inputmode="numeric" maxlength="4" pattern="[0-7]{4}" value="0000" aria-describedby="code-help"></label><small id="code-help">Cuatro dígitos del 0 al 7. 0000 es solo el estado inicial del ejercicio.</small>
    <label>Modo transponder<select data-xmode><option value="off">OFF</option><option value="stby" selected>STBY</option><option value="on">ON</option><option value="alt">ALT</option></select></label>
   </div>
   <details class="deck-group fails"><summary>Fallas para estudiar</summary><div class="toggles">${FAILS.map(([k, l]) => `<button data-f="${k}" aria-pressed="false">${l}</button>`).join('')}</div><p class="fine-print" data-fail-note></p></details>
  </section>
  <aside class="side">
   <section class="guide" aria-label="Observaciones guiadas"></section>
   <section class="inst-info"></section>
  </aside>
 </div><dialog class="instrument-dialog" aria-label="Instrumento ampliado"><button class="chip" data-close-instrument>Cerrar instrumento</button><div class="instrument-dialog-body"></div></dialog></div>`;
  const $ = q => host.querySelector(q), $$ = q => [...host.querySelectorAll(q)];
  const updates = Object.fromEntries(Object.entries(inst).map(([k, v]) => [k, v.bind($(`[data-inst=${k}]`))]));
  const msg = $('.cockpit-msg');

  function info(k, reveal = true) {
    const [t, d, list, src] = INFO[k];
    $('.inst-info').innerHTML = `<span class="eyebrow">INSTRUMENTO</span><h3>${t}</h3><p>${d}</p><ul>${list.map(x => `<li>${x}</li>`).join('')}</ul><p class="fine-print">${src}</p>`;
    $$('.inst-hit').forEach(e => e.classList.toggle('on', e.dataset.inst === k));
    if (inst[k]) { const detail = I[({asi:'airspeed',ai:'attitude',alt:'altimeter',tb:'turnBank',dg:'heading',vsi:'vsi',tach:'tachometer',suction:'suction',cluster:'engineCluster',compass:'compass'})[k]](); const slot = document.createElement('div'); slot.className = 'instrument-detail'; slot.innerHTML = detail.svg; $('.inst-info').prepend(slot); detailUpdate = detail.bind(slot); } else detailUpdate = null;
    onInfo?.(k);
    if (reveal && matchMedia('(max-width:700px)').matches) { $('.instrument-dialog-body').append($('.inst-info')); $('.instrument-dialog').showModal(); }
  }
  function renderGuide() {
    const box = $('.guide');
    if (!guide) { box.innerHTML = `<span class="eyebrow">EN VUELO</span><h3>Probá los instrumentos</h3><ul class="tips"><li>Arrastrá el volante: el horizonte, el direccional y la aguja de viraje responden.</li><li>Inclinación de 15–20° con la bola centrada: viraje coordinado.</li><li>Reducí potencia y tirá: mirá cómo cae la velocidad y se enciende el aviso de pérdida.</li><li>Activá una falla (abajo) y observá qué instrumentos cambian.</li></ul>`; return; }
    const g = GUIDES[guide];
    box.innerHTML = `<div class="seg small" role="group" aria-label="Etapa">${Object.entries(GUIDES).map(([k, v]) => `<button data-guide="${k}" aria-pressed="${k === guide}">${({start:'Puesta en marcha',after:'Después del arranque',runup:'Prueba de motor'})[k]}</button>`).join('')}</div>
<span class="eyebrow">OBSERVACIONES DEL SIMULADOR</span><h3>${g.title}</h3><ol class="steps">${g.steps.map(([a, b, , manual], i) => `<li data-step="${i}"><span class="box" aria-hidden="true"></span><span>${a}</span><b>${b}</b>${manual ? '<small>Requiere observación: no se verifica automáticamente.</small>' : ''}</li>`).join('')}</ol><p class="fine-print">${g.note} Selección de observaciones para aprender, no una lista operativa completa. El color indica el estado actual del modelo; no certifica una verificación del piloto.</p><p class="drops" data-drops></p><a class="chip" href="#/recorrido/${({start:4,after:5,runup:7})[guide]}">Consultar etapa completa y PDF original</a>`;
  }
  function syncUI() {
    for (const b of $$('[data-t]')) b.setAttribute('aria-pressed', !!s[b.dataset.t]);
    for (const b of $$('[data-m]')) b.setAttribute('aria-pressed', s.mag === b.dataset.m);
    for (const b of $$('[data-sel]')) b.setAttribute('aria-pressed', s.sel === b.dataset.sel);
    for (const b of $$('[data-flaps]')) b.setAttribute('aria-pressed', s.flaps === +b.dataset.flaps);
    for (const b of $$('[data-f]')) b.setAttribute('aria-pressed', !!s.fail[b.dataset.f]);
    for (const k of ['throttle', 'mixture', 'trim', 'rudder']) { const r = $(`[data-r=${k}]`); const v = Math.round((k === 'rudder' ? s.rudder : s[k]) * 100); if (document.activeElement !== r) r.value = v; }
    $('[data-o=throttle]').textContent = s.throttle < .02 ? 'reducido' : s.throttle > .97 ? 'a fondo' : Math.round(s.throttle * 100) + ' %';
    $('[data-o=mixture]').textContent = s.mixture < .12 ? 'cortada' : s.mixture > .9 ? 'rica' : 'pobre';
    $('[data-o=trim]').textContent = s.trim > .05 ? 'nariz arriba' : s.trim < -.05 ? 'nariz abajo' : 'neutro';
    $('[data-o=rudder]').textContent = s.rudder > .05 ? 'derecho' : s.rudder < -.05 ? 'izquierdo' : 'centrado';
    $('[data-o=kollsman]').textContent = s.kollsman.toFixed(2) + ' inHg';
    $('[data-comread]').textContent = 'Activa: '+(s.comActive/1000).toFixed(3)+' MHz';
    $('[data-com]').value = (s.comStandby/1000).toFixed(3); $('[data-navfreq]').value = (s.navFreq/1000).toFixed(2); $('[data-code]').value = s.xpdr; $('[data-xmode]').value = s.xpdrMode;
    host.querySelector('.cockpit').dataset.mode = s.mode;
    // panel
    for (const g of $$('[data-sw]')) { g.querySelector('.lever').setAttribute('transform', s[g.dataset.sw] ? '' : 'scale(1 -1)'); g.setAttribute('aria-checked', !!s[g.dataset.sw]); }
    const ang = { off: -60, right: -30, left: 0, both: 30, start: 60 }[s.mag];
    $('.key').setAttribute('transform', `rotate(${ang})`);
    $('.fh').setAttribute('transform', `rotate(${({ off: 0, left: -90, right: 90 })[s.sel]})`);
    for (const k of ['carb', 'throttle', 'mixture']) {
      const out = k === 'carb' ? (s.carb ? 1 : 0) : 1 - s[k];
      const g = $(`[data-knob=${k}]`); g.querySelector('.kh').setAttribute('transform', `translate(0 ${out * 70})`); g.querySelector('.shaft').setAttribute('height', 10 + out * 70);
      g.setAttribute('aria-valuenow', Math.round((k === 'carb' ? (s.carb ? 1 : 0) : s[k]) * 100));
    }
    $('.ph').setAttribute('transform', s.pbrake ? 'translate(0 8)' : '');
    $('.pk').setAttribute('r', s.primer > 0 ? 11 : 14);
  }
  function setFail(k, on) {
    s.fail[k] = on;
    if (k === 'ice' && on) s.msg = 'Hielo en el carburador: atento a las RPM.';
    $('[data-fail-note]').textContent = on ? FAILS.find(x => x[0] === k)[2] : '';
    $('[data-fuse=alt] .fz').setAttribute('cy', s.fail.alt ? -6 : 0);
    syncUI();
  }
  function reset(m) { s = initialState(m); guide = m === 'flight' ? null : 'start'; renderGuide(); syncUI(); msg.textContent = m === 'flight' ? 'En crucero a 3500 ft. El volante controla alabeo y cabeceo.' : 'Avión estacionado, todo apagado. Explorá los mandos y consultá la lista original del aeroclub.'; }

  function frame() {
    const now = performance.now();
    if (!alive) return;
    const dt = Math.min(.5, (now - last) / 1000); last = now;
    if (!document.hidden && !paused) {
      const sub = Math.max(2, Math.ceil(dt / .02)); for (let i = 0; i < sub; i++) step(s, dt / sub);
      const lit = s.bus ? 1 : 0;
      const ui = { ...s, ias: s.iasInd, rpm: s.rpm, roll: s.gyroOk ? s.roll : s.roll + (1 - s.gyro) * 25, pitch: s.gyroOk ? s.pitch : s.pitch - (1 - s.gyro) * 12, turnRate: s.gyroOk ? s.turnRate : s.turnRate * s.gyro, fuelL: s.bus ? s.fuelL : 0, fuelR: s.bus ? s.fuelR : 0, amps: s.amps, hdg: s.hdg };
      for (const u of Object.values(updates)) u(ui);
      detailUpdate?.(ui); scene3d?.update({...ui, roll:s.roll, pitch:s.pitch});
      for (const [k,v] of Object.entries({ias:Math.round(s.iasInd)+' kt',alt:Math.round(s.altInd)+' ft',rpm:Math.round(s.rpm)+' RPM',vac:s.suction.toFixed(1)+' inHg',bat:Math.round(s.battery*100)+' %'})) $('[data-live='+k+']').textContent=v;
      $('[data-n=com]').textContent=(s.comActive/1000).toFixed(3); $('[data-n=navf]').textContent=(s.navFreq/1000).toFixed(2); $('[data-n=sq]').textContent=s.xpdr;
      $('[data-n=stall-lamp]').setAttribute('fill', s.stall ? 'url(#lamp)' : '#4a120e');
      for (const [sel, on] of [['[data-n=com]', s.radio && lit], ['[data-n=navf]', s.radio && lit], ['[data-n=sq]', s.radio && lit && s.xpdrMode !== 'off']]) $(sel).setAttribute('opacity', on ? 1 : .18);
      host.querySelector('.panel-svg').classList.toggle('lit', !!(s.panel && lit));
      if (s.msg) { msg.textContent = s.msg; s.msg = ''; }
      if (s.rpm > 2700) msg.textContent = 'RPM sobre la línea roja (2700): reducí potencia.';
      if (guide) {
        const g = GUIDES[guide];
        g.steps.forEach(([, , test, manual], i) => { const li = host.querySelector(`[data-step="${i}"]`); li?.classList.toggle('done', !manual && !!test(s)); });
        if (guide === 'runup') {
          const d = host.querySelector('[data-drops]');
          if (d) {
            let t = 'A 2000 RPM pasá la llave a L, volvé a BOTH, pasá a R y volvé a BOTH.';
            if (s.dropL || s.dropR) {
              t = `Caída medida · L: ${s.dropL || '—'} RPM · R: ${s.dropR || '—'} RPM`;
              if (s.dropL && s.dropR) {
                const ok = Math.max(s.dropL, s.dropR) <= engine.magDropMax && Math.abs(s.dropL - s.dropR) <= engine.magDiffMax;
                t += ` · diferencia ${Math.abs(s.dropL - s.dropR)} RPM → ${ok ? 'dentro de los límites de la lista' : 'FUERA de los límites de la lista'}`;
              }
            }
            d.textContent = t;
          }
        }
      }
    }
  }

  async function setView(view) {
    panelView = view;
    $$('[data-cview]').forEach(b => b.setAttribute('aria-pressed', b.dataset.cview === view));
    $('.panel-wrap').hidden = view === '3d'; $('.cockpit-scene').hidden = view !== '3d';
    $('.panel-svg').setAttribute('viewBox', view === 'pilot' ? '35 88 690 690' : view === 'engine' ? '710 88 890 690' : '0 0 1600 780');
    $('.panel-wrap').dataset.zoom = view;
    if (view !== '3d') { scene3d?.setVisible(false); return; }
    if (scene3d) { scene3d.setVisible(true); return; }
    if (scenePending) return;
    scenePending = true; $('.cockpit-scene').textContent = 'Preparando cabina 3D…';
    try {
      const {createCockpitScene} = await import('./cockpit-scene.js');
      if (disposed) return;
      $('.cockpit-scene').textContent = '';
      scene3d = createCockpitScene($('.cockpit-scene'), $('.panel-svg'), k => { info(k); }, action => {
        if(action.type==='switch')s[action.key]=!s[action.key];
        if(action.type==='knob'){if(action.key==='carb')s.carb=action.delta<0;else s[action.key]=clamp(s[action.key]+action.delta,0,1);}
        if(action.type==='yoke'){s.rollCmd=clamp(action.roll,-1,1);s.pitchCmd=clamp(action.pitch,-1,1);yokeDot();}
        if(action.type==='mag')s.mag={off:'right',right:'left',left:'both',both:'off',start:'both'}[s.mag];
        if(action.type==='primer')s.primer++;
        if(action.type==='selector')s.sel={left:'right',right:'off',off:'left'}[s.sel];
        syncUI();
      });
      scene3d.setVisible(panelView === '3d');
    } catch (error) { if (!disposed) { await setView('all'); msg.textContent = 'No se pudo abrir WebGL. El panel interactivo sigue disponible.'; } }
    finally { scenePending = false; }
  }
  // ---- eventos ----
  const onClick = e => {
    const t = e.target.closest('button, [data-sw], [data-inst], [data-mag], [data-primer], [data-fsel], [data-pbrake]');
    if (!t || !host.contains(t)) return;
    const d = t.dataset;
    if ('closeInstrument' in d) { $('.instrument-dialog').close(); return; }
    if ('comswap' in d) { [s.comActive,s.comStandby]=[s.comStandby,s.comActive]; syncUI(); return; }
    if (d.cview) { setView(d.cview); return; }
    if ('simpause' in d) { paused = !paused; t.setAttribute('aria-pressed',paused); t.textContent = paused ? 'Continuar simulación' : 'Pausar simulación'; return; }
    if (d.cmode) { reset(d.cmode); $$('[data-cmode]').forEach(b => b.setAttribute('aria-pressed', b.dataset.cmode === d.cmode)); return; }
    if ('creset' in d) { reset(s.mode); return; }
    if (d.t) s[d.t] = !s[d.t];
    if (d.sw) s[d.sw] = !s[d.sw];
    if (d.inst) info(d.inst);
    if (d.m) s.mag = d.m;
    if ('mag' in d && !d.m) { if (skipMagClick) skipMagClick = false; else s.mag = { off: 'right', right: 'left', left: 'both', both: 'off', start: 'both' }[s.mag]; }
    if ('primer' in d || 'primerBtn' in d) { s.primer++; msg.textContent = s.primer > 5 ? 'Cuidado: demasiado cebado puede ahogar el motor.' : `Cebado: ${s.primer} ${s.primer === 1 ? 'bombeo' : 'bombeos'}.`; }
    if ('fsel' in d) s.sel = { left: 'right', right: 'off', off: 'left' }[s.sel];
    if (d.sel) s.sel = d.sel;
    if ('pbrake' in d) s.pbrake = !s.pbrake;
    if ('clear' in d) { s.clear = true; msg.textContent = '«¡Hélice libre!»: se verifica que no haya nadie cerca de la hélice.'; }
    if (d.flaps) s.flaps = +d.flaps;
    if (d.k) s.kollsman = Math.round((s.kollsman + d.k * .01) * 100) / 100;
    if ('dg' in d) { s.dgOffset = 0; msg.textContent = 'Direccional alineado con la brújula.'; }
    if (d.f) setFail(d.f, !s.fail[d.f]);
    if (d.guide) { guide = d.guide; renderGuide(); }
    syncUI();
  };
  // START: botón «START (mantener)» o mantener apretada la llave del panel cuando está en BOTH.
  let skipMagClick = false, holdTimer = 0;
  const startDown = e => {
    const b = e.target.closest('[data-start], [data-mag]'); if (!b || !host.contains(b)) return;
    if ('start' in b.dataset) { s.mag = 'start'; syncUI(); e.preventDefault(); return; }
    if (s.mag === 'both') holdTimer = setTimeout(() => { s.mag = 'start'; skipMagClick = true; syncUI(); }, 280);
  };
  const startUp = () => { clearTimeout(holdTimer); if (s.mag === 'start') { s.mag = 'both'; syncUI(); } };
  const onInput = e => {
    const t=e.target;
    if(t.matches('[data-com]') && t.value !== '' && Number(t.value)>=118 && Number(t.value)<=136.975) s.comStandby=Math.round(Number(t.value)*1000/25)*25;
    if(t.matches('[data-navfreq]') && t.value !== '' && Number(t.value)>=108 && Number(t.value)<=117.95) s.navFreq=Math.round(Number(t.value)*1000/50)*50;
    if(t.matches('[data-code]')) { const valid=/^[0-7]{4}$/.test(t.value); t.setAttribute('aria-invalid',!valid); if(valid)s.xpdr=t.value; else msg.textContent='El código tiene cuatro dígitos entre 0 y 7.'; }
    const k=t.dataset.r;if(!k)return;s[k]=+t.value/100;syncUI();
  };
  const onKey = e => {
    const t = e.target;
    if ((e.key === 'Enter' || e.key === ' ') && t.matches('[data-sw],[data-inst],[data-mag],[data-primer],[data-fsel],[data-pbrake]')) { e.preventDefault(); t.click(); }
    if (t.matches('[data-knob]') && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) { e.preventDefault(); const k = t.dataset.knob, dv = ['ArrowUp', 'ArrowRight'].includes(e.key) ? .05 : -.05; if (k === 'carb') s.carb = dv < 0; else s[k] = clamp(s[k] + dv, 0, 1); syncUI(); }
    if (t.matches('.yoke-pad')) { const m = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key]; if (m) { e.preventDefault(); s.rollCmd = clamp(s.rollCmd + m[0] * .25, -1, 1); s.pitchCmd = clamp(s.pitchCmd + m[1] * .2, -1, 1); yokeDot(); } if (e.key === 'Home' || e.key === 'Escape') { s.rollCmd = 0; s.pitchCmd = 0; yokeDot(); } }
  };
  // Perillas del panel: arrastrar verticalmente (adentro = arriba)
  let drag = null;
  const knobDown = e => { const g = e.target.closest('[data-knob]'); if (!g) return; drag = { k: g.dataset.knob, y: e.clientY, v: g.dataset.knob === 'carb' ? (s.carb ? 0 : 1) : s[g.dataset.knob] }; g.setPointerCapture?.(e.pointerId); e.preventDefault(); };
  const knobMove = e => {
    if (!drag) return;
    const units = 780 / host.querySelector('.panel-svg').getBoundingClientRect().height; // unidades SVG por píxel
    const v = clamp(drag.v + (drag.y - e.clientY) * units / 70, 0, 1);
    if (drag.k === 'carb') s.carb = v < .5; else s[drag.k] = v; syncUI();
  };
  const knobUp = () => { drag = null; };
  // Volante
  const pad = $('.yoke-pad');
  function yokeDot() { $('.yoke-dot').style.transform = `translate(${s.rollCmd * 70}px, ${s.pitchCmd * 45}px)`; pad.querySelector('svg').style.transform = `rotate(${s.rollCmd * 35}deg) scale(${1 - s.pitchCmd * .08})`; }
  let yoking = false;
  const padSet = e => { const r = pad.getBoundingClientRect(); s.rollCmd = clamp(((e.clientX - r.left) / r.width - .5) * 2.2, -1, 1); s.pitchCmd = clamp(((e.clientY - r.top) / r.height - .5) * 2.2, -1, 1); yokeDot(); };
  pad.addEventListener('pointerdown', e => { yoking = true; pad.setPointerCapture(e.pointerId); padSet(e); });
  pad.addEventListener('pointermove', e => { if (yoking) padSet(e); });
  pad.addEventListener('pointerup', () => { yoking = false; s.rollCmd = 0; s.pitchCmd = 0; yokeDot(); });

  const release = () => { startUp(); knobUp(); yoking = false; s.rollCmd = 0; s.pitchCmd = 0; yokeDot(); };
  const listen = (el, type, fn) => el.addEventListener(type, fn, {signal: events.signal});
  listen(host, 'click', onClick);
  listen($('.instrument-dialog'), 'close', () => { $('.side').append($('.inst-info')); });
  listen(host, 'pointerdown', startDown); listen(window, 'pointerup', startUp);
  listen(host, 'keydown', e => { if (e.target.matches('[data-start]') && (e.key === ' ' || e.key === 'Enter')) { e.preventDefault(); if (!e.repeat) { s.mag = 'start'; syncUI(); } } onKey(e); });
  listen(window, 'keyup', e => { if (e.key === ' ' || e.key === 'Enter') startUp(); });
  listen(host, 'input', onInput);
  listen(host, 'change', e => {
    const t=e.target;
    if (t.matches('[data-com]')) s.comStandby=clamp(Math.round(Number(t.value)*1000/25)*25,118000,136975);
    if (t.matches('[data-navfreq]')) s.navFreq=clamp(Math.round(Number(t.value)*1000/50)*50,108000,117950);
    if (t.matches('[data-code]')) { if (/^[0-7]{4}$/.test(t.value)) s.xpdr=t.value; else msg.textContent='El código tiene cuatro dígitos entre 0 y 7.'; }
    if (t.matches('[data-xmode]')) s.xpdrMode=t.value;
    syncUI();
  });
  listen(host, 'pointerdown', knobDown); listen(window, 'pointermove', knobMove); listen(window, 'pointerup', knobUp);
  listen(window, 'pointercancel', release); listen(window, 'blur', release);
  listen(document, 'visibilitychange', () => { if (document.hidden) release(); });
  reset(mode); const initiallyPaused = paused; paused = false; frame(); paused = initiallyPaused; info(mode === 'flight' ? 'ai' : 'tach', false); yokeDot();
  if (initialView === '3d') setView('3d');
  raf = setInterval(frame, 33); host.__sim = () => s;
  return () => { disposed = true; alive = false; clearInterval(raf); clearTimeout(holdTimer); events.abort(); scene3d?.dispose(); delete host.__sim; };
}
