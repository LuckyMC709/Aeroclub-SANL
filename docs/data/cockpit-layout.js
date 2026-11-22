// Original illustrative layout, in SVG units. Replace only after comparison with
// authorized, current LV-LLS photographs and the installed equipment inventory.
export const cockpitReference = {
  aircraft: 'LV-LLS', status: 'illustrative', photos: [],
  pending: ['Foto frontal completa del panel', 'Consola y selector de combustible', 'Mandos del techo', 'Modelos y alimentación de los instrumentos', 'Dimensiones de referencia'],
  source: "Piper Cherokee 140 Owner’s Handbook, referencia genérica; no valida la instalación actual."
};
export const instrumentLayout = [
  ['asi',60,100,205,205], ['ai',278,100,205,205], ['alt',496,100,205,205],
  ['tb',60,318,205,205], ['dg',278,318,205,205], ['vsi',496,318,205,205],
  ['suction',60,536,118,118], ['tach',1060,100,205,205],
  ['cluster',1280,104,300,182], ['radio',728,104,300,128],
  ['xpdr',728,250,300,84], ['compass',690,6,220,74]
];
