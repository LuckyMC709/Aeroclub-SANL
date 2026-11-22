import assert from 'node:assert/strict';
import {initialState,step} from '../docs/cockpit-sim.js';
import {model,velocity,clReal} from '../docs/aero.js';
const advance=(s,secs)=>{for(let i=0;i<secs*50;i++)step(s,.02);return s;};
let s=initialState('ground'); advance(s,3);assert.equal(s.rpm,0);assert.equal(s.running,false);
Object.assign(s,{bat:true,pump:true,mixture:1,throttle:.25,mag:'start'});advance(s,3);assert.equal(s.running,true);s.mag='both';advance(s,6);assert.ok(s.rpm>900&&s.rpm<1100);
const fuel=s.fuelL;advance(s,60);assert.ok(s.fuelL<fuel,'fuel must burn on the ground');
s.bat=false;s.alt=false;advance(s,5);assert.equal(s.running,true,'ignition is independent of battery');
s.mixture=0;advance(s,5);assert.equal(s.running,false);assert.ok(s.rpm<5);
s=initialState('flight');s.fail.alt=true;advance(s,60);assert.ok(s.battery>.99,'battery model must not drain in seconds');assert.equal(s.amps,0);
s=initialState('flight');s.fail.vac=true;advance(s,60);assert.ok(s.suction<.01);assert.equal(s.gyroOk,false);
s=initialState('flight');s.fail.static=true;step(s,.02);const h=s.altInd;s.h+=500;step(s,.02);assert.equal(s.altInd,h,'static blockage freezes altitude');
s=initialState('flight');s.fail.pitot=true;step(s,.02);const v=s.iasInd;s.h+=500;step(s,.02);assert.ok(s.iasInd>v,'sealed pitot indicates higher speed in climb');
for(const flap of [0,1,2,3]) for(const a of [-8,0,5,10,16,24]){
 const m=model(a,flap);assert.ok(Number.isFinite(m.cl));assert.ok(Number.isFinite(clReal(m,a,flap)));
 const far=velocity(m,[100,50]);assert.ok(Math.abs(Math.hypot(...far)-1)<.03,'far field tends to freestream');
}
assert.ok(model(10,0).cl>model(0,0).cl);assert.ok(clReal(model(24,0),24,0)<clReal(model(15,0),15,0));
console.log('PASS: start, shutdown, ground fuel, magneto independence, battery, vacuum, pressure blockages and aerodynamic finite outputs.');
