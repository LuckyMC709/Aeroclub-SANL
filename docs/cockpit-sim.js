// Modelo educativo independiente del DOM; no es un modelo de vuelo validado.
import { clamp } from './instruments.js';
const G = 19.07, QNH = 30.06, FIELD = 1400;
const LOADS = { radio: 3, nav: 1.5, bcn: 2, land: 8, panel: 1, pump: 1.5 };
export function initialState(mode) {
  const s = {
    mode, bat: false, alt: false, pump: false, nav: false, bcn: false, land: false, panel: false, radio: false,
    mag: 'off', primer: 0, throttle: 0, mixture: 0, carb: false, sel: 'left', flaps: 0, trim: 0, pbrake: true,
    running: false, crank: 0, rpm: 0, oilP: 0, oilT: 18, fuelP: 0, suction: 0, gyro: 0, amps: 0, battery: 1,
    fuelL: 23, fuelR: 21, ias: 0, iasInd: 0, h: FIELD, altInd: FIELD + (29.92 - QNH) * 1000, kollsman: 29.92,
    hdg: 30, dgOffset: 37, hdgInd: 67, pitch: 0, roll: 0, slip: 0, turnRate: 0, vs: 0, vsInd: 0, alpha: 0,
    rollCmd: 0, pitchCmd: 0, rudder: 0, fail: {}, starve: 0, ice: 0, clear: false, dropL: 0, dropR: 0, carbChecked: false,
    comActive:118000, comStandby:118025, navFreq:110000, xpdr:'0000', xpdrMode:'stby', hobbs: 0, msg: '', stall: false, block: {}
  };
  if (mode === 'flight') Object.assign(s, {
    bat: true, alt: true, radio: true, nav: false, bcn: true, mag: 'both', mixture: 1, throttle: .76, running: true, rpm: 2280,
    oilP: 72, oilT: 82, fuelP: 4.5, suction: 5, gyro: 1, ias: 105, iasInd: 105, h: 3500, kollsman: QNH, dgOffset: 0,
    pitch: 2.8, trim: .47, pbrake: false
  });
  s.altInd = s.h + (s.kollsman - QNH) * 1000; s.hdgInd = s.hdg + s.dgOffset;
  return s;
}

export function step(s, dt) {
  const F = s.fail;
  // ---- Eléctrico ----
  const altOnline = s.alt && s.bat && s.running && s.rpm > 900 && !F.alt;
  const bus = altOnline || (s.bat && s.battery > .03);
  let load = .5;
  for (const k of Object.keys(LOADS)) if (s[k]) load += LOADS[k];
  s.bus = bus;
  const cranking = !s.running && s.mag === 'start' && s.bat && s.battery > .12;
  if (altOnline) { s.amps = load + 2 + (1 - s.battery) * 25; s.battery = Math.min(1, s.battery + dt * (2 + (1 - s.battery) * 25) / (25 * 3600)); }
  else { s.amps = 0; if (bus) s.battery = Math.max(0, s.battery - dt * (load + (cranking ? 60 : 0)) / (25 * 3600)); }
  // ---- Combustible ----
  const tank = s.sel === 'left' ? 'fuelL' : s.sel === 'right' ? 'fuelR' : null;
  const fuelThere = tank && s[tank] > .3;
  const pEng = s.running && s.rpm > 400 && !F.epump ? 4.6 : 0;
  const pElec = s.pump && bus ? 5.2 : 0;
  const pTarget = fuelThere ? Math.max(pEng, pElec) : 0;
  s.fuelP += (pTarget - s.fuelP) * Math.min(1, dt * (pTarget > s.fuelP ? 3 : .8));
  // ---- Motor ----
  if (s.mag === 'off' || s.mixture < .12) s.running = false;
  if (!s.running) {
    if (cranking) {
      s.crank += dt;
      const fuelToCyl = s.primer > 0 || s.fuelP > .5;
      const flooded = s.primer > 5 && s.throttle < .8;
      if (s.crank > 1.3 && fuelToCyl && !flooded && s.mixture > .55 && s.throttle > .04 && s.throttle < .6 && fuelThere) {
        s.running = true; s.crank = 0; s.msg = 'El motor arrancó. Soltá la llave: vuelve a BOTH.';
      } else if (s.crank > 3) s.msg = flooded ? 'Exceso de cebado en el modelo. Reiniciá el ejercicio; consultá el procedimiento vigente para el avión real.' : 'El arranque simulado no se completó. Compará la configuración con el documento original.';
    } else s.crank = 0;
  }
  if (s.running) {
    s.starve = s.fuelP < .4 ? s.starve + dt : 0;
    if (s.starve > 4) { s.running = false; s.msg = 'El motor se detuvo por falta de combustible.'; }
  }
  if (s.running && F.ice && !s.carb) s.ice = Math.min(1, s.ice + dt * .018 * (1.25 - s.throttle));
  if (s.carb) s.ice = Math.max(0, s.ice - dt * .07);
  if (s.ice > .85 && s.running) { s.running = false; s.msg = 'El hielo bloqueó el carburador y el motor se detuvo.'; }
  let target = 0;
  if (s.running) {
    target = 600 + s.throttle * 1750 + (s.mode === 'flight' ? s.ias * 4 * (.35 + .65 * s.throttle) : 0);
    if (s.mixture < .5) target *= .55 + .9 * (s.mixture - .12);
    const dropR = F.magR ? 260 : 125, dropL = 105;
    if (s.mag === 'left') target -= dropL * (s.rpm / 2000);
    if (s.mag === 'right') target -= dropR * (s.rpm / 2000);
    if (s.carb) target -= 80 * (s.rpm / 2000);
    target -= s.ice * 900;
    if (s.mag === 'start') target = 900;
  } else if (cranking) target = 180;
  else target = s.mode === 'flight' ? s.ias * 9 : 0;
  s.rpm += (target - s.rpm) * Math.min(1, dt * (s.running ? 2.2 : 1.4));
  const base = 600 + s.throttle * 1750;
  if (s.running && s.mode !== 'flight' && Math.abs(base - 2000) < 70 && Math.abs(target - s.rpm) < 15) {
    // Registro de la prueba de magnetos y calefactor: caída respecto de BOTH en frío.
    if (s.mag === 'left' && !s.carb) s.dropL = Math.round(base - s.rpm);
    if (s.mag === 'right' && !s.carb) s.dropR = Math.round(base - s.rpm);
  }
  if (s.running && s.carb && s.rpm > 1700) s.carbChecked = true;
  const oilTarget = s.running ? clamp(32 + s.rpm / 2700 * 52, 0, 86) * (s.oilT < 40 ? 1.08 : 1) : 0;
  s.oilP += (oilTarget - s.oilP) * Math.min(1, dt * (s.running ? .35 : 1.2));
  s.oilT += ((s.running ? 62 + s.rpm / 2700 * 28 : 18) - s.oilT) * dt * .02;
  s.suction += ((s.running && !F.vac ? clamp(1.5 + s.rpm / 2000 * 3.5, 0, 5.6) * (s.rpm > 300 ? 1 : s.rpm / 300) : 0) - s.suction) * Math.min(1, dt * 2);
  s.gyro = clamp(s.gyro + (s.suction > 2.8 ? dt / 14 : -dt / 45), 0, 1);
  if (s.running) {
    s.hobbs += dt / 3600;
    // Consumo ilustrativo, en US gal/h; también se consume en tierra.
    if (tank) s[tank] = Math.max(0, s[tank] - (3 + 6 * s.throttle) * dt / 3600);
  }
  // ---- Vuelo ----
  if (s.mode === 'flight') flight(s, dt);
  else { s.ias = 0; s.vs = 0; s.turnRate = 0; s.slip = 0; s.pitch = 0; s.roll = 0; }
  // ---- Indicaciones (con obstrucciones) ----
  if (F.pitot && s.block.pitot == null) s.block.pitot = { v: s.ias, h: s.h };
  if (!F.pitot) s.block.pitot = null;
  if (F.static && s.block.static == null) s.block.static = { h: s.h };
  if (!F.static) s.block.static = null;
  let v2 = s.ias * s.ias;
  if (s.block.pitot) v2 = s.block.pitot.v ** 2 + 22 * (s.h - s.block.pitot.h);
  if (s.block.static) v2 -= 22 * (s.h - s.block.static.h);
  s.iasInd = Math.sqrt(Math.max(0, v2));
  const hStatic = s.block.static ? s.block.static.h : s.h;
  s.altInd = hStatic + (s.kollsman - QNH) * 1000;
  const vsReal = s.block.static ? 0 : s.vs;
  s.vsInd += (vsReal - s.vsInd) * Math.min(1, dt / 1.6);
  s.dgOffset += (s.gyro < .8 ? 2.5 : .02) * dt;
  s.hdgInd = ((s.hdg + s.dgOffset) % 360 + 360) % 360;
  s.gyroOk = s.gyro > .8;
  s.stall = bus && s.mode === 'flight' && s.alpha > 13;
  s.ias = Math.max(0, s.ias);
}

function flight(s, dt) {
  const flapCL = [0, .15, .35, .54][s.flaps], flapCD = [0, .05, .25, .6][s.flaps];
  s.roll = clamp(s.roll + s.rollCmd * 25 * dt, -75, 75);
  const thetaT = s.pitchCmd * 15 + s.trim * 6;
  s.pitch += (thetaT - s.pitch) * Math.min(1, dt * 1.5);
  const V = Math.max(s.ias, 25), n = 1 / Math.cos(s.roll * Math.PI / 180);
  const CL = 4730 * n / (V * V);
  let alpha = CL / .09 - 2 - flapCL / .09;
  if (alpha > 15) { s.pitch -= 9 * dt; alpha = 15 + (alpha - 15) * .3; }
  s.alpha = alpha;
  const gamma = clamp(s.pitch - alpha, -35, 25);
  const P = s.running ? clamp(s.throttle, .04, 1) * (s.mixture < .5 ? .6 : 1) * (1 - s.ice * .7) * (s.carb ? .96 : 1) : -.25;
  const T = P * (4.04 - .0065 * s.ias);
  const D = 1.94e-4 * s.ias * s.ias + 4655 * n * n / (V * V) * (s.ias > 5 ? 1 : 0) + flapCD * (s.ias / 70) ** 2;
  s.ias = Math.max(0, s.ias + (T - D - G * Math.sin(gamma * Math.PI / 180)) * dt);
  s.vs = s.ias * 101.27 * Math.sin(gamma * Math.PI / 180);
  s.h = Math.max(FIELD, s.h + s.vs / 60 * dt);
  s.turnRate = 1091 * Math.tan(s.roll * Math.PI / 180) / Math.max(s.ias, 40);
  s.hdg = ((s.hdg + s.turnRate * dt) % 360 + 360) % 360;
  s.slip = clamp(s.rudder * .9 - s.rollCmd * .25, -1, 1);

}

