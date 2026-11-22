// Datos del Piper PA-A28-140 LV-LLS con su procedencia.
// manual    = Manual de Vuelo aprobado LV-LLS (DNA-MVD N.º 03-A-022, Informes VB-339 / VB-266). Fuente que manda.
// checklist = Lista de chequeo / emergencias / briefing del aeroclub.
// handbook  = Piper Cherokee 140 Owner's Handbook (genérico PA-28-140, no específico del LV-LLS).
// Ver FUENTES_LV-LLS.md para el detalle y las discrepancias.

export const refs = {
  manual: 'Manual de Vuelo LV-LLS',
  checklist: 'Lista del aeroclub',
  briefing: 'Briefing del aeroclub',
  handbook: 'PA-28-140 genérico (Piper)',
  faa: 'Concepto general (FAA)'
};

// Velocidades indicadas (kt) — Manual §2 e) / f)
export const speeds = {
  vne: 148, vno: 121, va: 112, vfe: 100,
  arcs: { white: [48, 100], green: [56, 121], yellow: [121, 148], red: 148 },
  stallFlapsDownKt: 47,               // Manual §5
  maxSL: 123, cruise75: 116, cruise60: 100,
  // Lista del aeroclub
  rotation: '65/70', climb: 80, glide: 76,
  // Handbook (mph, peso bruto)
  vxMph: 74, vyMph: 85, glideChartMph: 83
};

// Pérdida sin potencia, mph CAS, 2150 lb — Manual §5 (Performance)
export const stallByBank = { bank: [0, 20, 40, 50, 60], flapsUp: [64, 66, 73, 80, 91], flapsDown0: 55 };

export const engine = {
  model: 'Lycoming O-320-E2A u O-320-E3D', hp: 150, rpmMax: 2700, fuel: 'Aeronafta 80/87',
  tach: { green: [500, 2700], red: 2700 },
  oilTempC: { green: [24, 118], red: 118 },
  oilPsi: { green: [60, 90], yellow: [25, 60], redMax: 90 },
  fuelPsi: { green: [0.5, 8], redMin: 0.5, redMax: 8 },
  staticRpm: [2275, 2425],
  // Lista del aeroclub
  startRpm: 1000, runupRpm: 2000, magDropMax: 175, magDiffMax: 50, suction: [4, 6], cruiseRpm: [2300, 2400], shutdownRpm: 1100,
  // Handbook
  compression: '7:1', displacement: '319,8 in³', cylinders: 4, oilQt: 8, oilMinQt: 2
};

export const propeller = { model: 'Sensenich M74DM o 74DM6', diaMaxCm: 187.96, diaMinCm: 184.15, type: 'Metálica, dos palas, paso fijo' };

export const travel = { // Manual §2 r)
  flaps: [0, 10, 25, 40], aileronUp: 30, aileronDown: 15, rudder: 27,
  stabUp: 18, stabDown: 2, trimUp: 3, trimDown: 12, noseWheel: 22
};

export const facts = [
  // [grupo, etiqueta, valor, fuente, nota]
  ['Identificación', 'Modelo', 'Piper PA-A28-140 (Cherokee 140), fabricado por Chincul bajo licencia', 'manual'],
  ['Identificación', 'Número de serie', 'AR 28-7425277', 'manual'],
  ['Motor', 'Motor', 'Lycoming O-320-E2A u O-320-E3D · 4 cilindros opuestos, refrigerado por aire', 'manual', 'Cuál está instalado hoy: confirmar en la libreta del motor.'],
  ['Motor', 'Potencia', '150 HP a 2700 RPM', 'manual'],
  ['Motor', 'Combustible', 'Aeronafta 80/87', 'manual'],
  ['Motor', 'Relación de compresión', '7:1', 'handbook'],
  ['Hélice', 'Hélice', 'Sensenich M74DM o 74DM6 · metálica, 2 palas, paso fijo', 'manual'],
  ['Hélice', 'Diámetro', '184,15 a 187,96 cm (72,5″ a 74″)', 'manual'],
  ['Hélice', 'RPM estáticas a pleno', '2275 a 2425 RPM (con 973,95 kg)', 'manual'],
  ['Combustible y aceite', 'Capacidad de combustible', '189 L (50 gal) en dos tanques alares', 'manual', 'El Handbook habla de 36 gal «estándar» y 50 con reserva. Combustible utilizable: pendiente.'],
  ['Combustible y aceite', 'Aceite', '7,57 L (8 qt) de capacidad · 5,68 L (6 qt) consumibles', 'manual'],
  ['Eléctrico', 'Sistema', '12 V · alternador de 60 A · batería de 25 Ah', 'manual', 'El Handbook genérico dice 35 A: manda el Manual del LV-LLS.'],
  ['Pesos', 'Peso máximo', '973,95 kg (2150 lb) normal · 883,35 kg (1950 lb) utilitaria', 'manual'],
  ['Pesos', 'Factor de carga', '+3,8 normal · +4,4 utilitaria · maniobras invertidas no aprobadas', 'manual'],
  ['Pesos', 'Asientos', '4 en normal · 2 en utilitaria', 'manual'],
  ['Superficies', 'Flaps', '0°, 10°, 25° y 40° (manuales)', 'manual'],
  ['Superficies', 'Alerones', '30° arriba · 15° abajo (diferenciales)', 'manual'],
  ['Superficies', 'Estabilizador monobloque', '18° arriba · 2° abajo', 'manual'],
  ['Superficies', 'Compensador del estabilizador', '3° arriba · 12° abajo', 'manual'],
  ['Superficies', 'Timón de dirección', '27° a cada lado', 'manual'],
  ['Superficies', 'Rueda de nariz', '22° a cada lado', 'manual', 'El Handbook genérico dice 30°.'],
  ['Estructura', 'Perfil alar', 'NACA 65₂-415 (flujo laminar)', 'handbook'],
  ['Estructura', 'Diedro / torsión', '7° / 2°', 'handbook'],
  ['Estructura', 'Envergadura · largo · alto', '30 ft · 23,3 ft · 7,3 ft', 'handbook'],
  ['Tren', 'Ruedas y frenos', '6.00×6 · frenos a disco hidráulicos · freno de mano', 'manual'],
  ['Tren', 'Presión de neumáticos', '24 psi en las tres ruedas', 'handbook'],
  ['Performance (2150 lb)', 'Velocidad máxima a nivel del mar', '123 kt', 'manual'],
  ['Performance (2150 lb)', 'Crucero 75 % a 7000 ft', '116 kt', 'manual'],
  ['Performance (2150 lb)', 'Ascenso a nivel del mar', '660 ft/min', 'manual'],
  ['Performance (2150 lb)', 'Techo de servicio', '14 300 ft', 'manual'],
  ['Performance (2150 lb)', 'Carrera de despegue / aterrizaje', '244 m / 163 m', 'manual'],
  ['Operación (lista del aeroclub)', 'Prueba de motor', '2000 RPM · caída máx. 175 RPM · diferencia máx. 50 RPM · succión 4–6 inHg', 'checklist'],
  ['Operación (lista del aeroclub)', 'Despegue', 'Rotación 65/70 kt · ascenso normal 80 kt', 'checklist'],
  ['Operación (lista del aeroclub)', 'Crucero', '2300/2400 RPM', 'checklist'],
  ['Operación (lista del aeroclub)', 'Planeo (emergencias)', '76 kt', 'checklist', 'El gráfico del Handbook usa 83 mph (≈72 kt).']
];

export const discrepancies = [
  'Briefing: «VX 75 kt (mejor régimen)» y «VY 80 kt (mejor ángulo)». Por definición, Vx es mejor ángulo y Vy mejor régimen. El Handbook da Vx 74 mph (≈64 kt) y Vy 85 mph (≈74 kt).',
  'Rotación: el briefing dice 60–65 kt; la lista, 65/70 kt.',
  'Aceite: la lista dice «4 Min 6 Max» sin unidad; el Manual da 8 qt de capacidad.',
  'Presión de aceite: el Manual impreso pone el rojo mínimo en 60 psi, que contradice su arco amarillo de 25–60 psi. Confirmar con el instrumento.',
  'Aviso de pérdida: el Handbook describe una luz roja; la lista pide verificar el «sonido» de la chapita.',
  'Alternador: 60 A (Manual LV-LLS) frente a 35 A (Handbook genérico).',
  'Rueda de nariz: 22° (Manual) frente a 30° (Handbook).'
];

// Datos verificados por pieza, para las fichas del explorador. [etiqueta, valor, fuente]
export const partFacts = {
  motor: [['Modelo', 'Lycoming O-320-E2A u O-320-E3D', 'manual'], ['Potencia', '150 HP a 2700 RPM', 'manual'], ['Cilindros', '4 horizontales opuestos, refrigerado por aire', 'manual'], ['Combustible', 'Aeronafta 80/87', 'manual'], ['Aceite', '8 qt de capacidad · 6 qt consumibles', 'manual'], ['Prueba de motor', '2000 RPM · caída de magnetos máx. 175, diferencia máx. 50', 'checklist']],
  helice: [['Modelo', 'Sensenich M74DM o 74DM6, metálica de paso fijo', 'manual'], ['Diámetro', '184,15 a 187,96 cm', 'manual'], ['RPM estáticas a pleno', '2275 a 2425', 'manual'], ['Inspección', '«Hélice — Verificar estado»', 'checklist']],
  alas: [['Perfil', 'NACA 65₂-415, flujo laminar', 'handbook'], ['Envergadura', '30 ft (≈ 9,1 m) · 160 ft² de superficie', 'handbook'], ['Diedro / torsión', '7° / 2°', 'handbook'], ['Pérdida sin potencia', '64 mph flaps arriba · 55 mph flaps abajo (2150 lb)', 'manual']],
  flaps: [['Posiciones', '0°, 10°, 25° y 40°, accionamiento manual', 'manual'], ['Velocidad máxima con flaps', '100 kt (arco blanco hasta 100)', 'manual'], ['Detalle', 'El flap derecho sirve de escalón solo totalmente arriba', 'handbook']],
  alerones: [['Recorrido', '30° arriba · 15° abajo (diferenciales)', 'manual'], ['Inspección', '«Alerón — Verificar Charnelas y Movimiento»', 'checklist']],
  cola: [['Estabilizador monobloque', '18° arriba · 2° abajo', 'manual'], ['Compensador', '3° arriba · 12° abajo', 'manual'], ['Timón de dirección', '27° a cada lado', 'manual']],
  tren: [['Tipo', 'Triciclo fijo, amortiguadores óleo-neumáticos', 'manual'], ['Rueda de nariz', 'Dirigible con los pedales, 22° a cada lado', 'manual'], ['Extensión estática', '3,25″ nariz · 4,50″ principales', 'handbook']],
  ruedas: [['Ruedas', '6.00×6, cubiertas de 4 telas con cámara', 'manual'], ['Presión', '24 psi en las tres', 'handbook']],
  frenos: [['Tipo', 'Disco hidráulico; freno de mano en el centro del tablero', 'manual'], ['Líquido', 'MIL-H-5606; depósito arriba a la izquierda del parallamas', 'handbook']],
  combustible: [['Capacidad', '189 L (50 gal), un tanque de 25 gal en cada ala', 'manual'], ['Recorrido', 'Selector → filtro → bomba eléctrica → bomba mecánica → carburador', 'handbook'], ['Presión', 'Arco verde 0,5–8 psi', 'manual'], ['Bomba eléctrica', 'Conectada en despegues y aterrizajes', 'manual']],
  electrico: [['Sistema', '12 V · alternador 60 A · batería 25 Ah', 'manual'], ['Batería', 'Bajo el piso del compartimiento de equipaje', 'handbook'], ['Amperímetro', 'Muestra la carga del sistema (≈2 A con todo apagado)', 'handbook']],
  instrumentos: [['Velocímetro', 'Blanco 48–100 · verde 56–121 · amarillo 121–148 · rojo 148 kt', 'manual'], ['Tacómetro', 'Verde 500–2700 · rojo 2700 RPM', 'manual'], ['Aceite', 'Temp. 24–118 °C · presión 60–90 psi', 'manual']],
  vacio: [['Succión en la prueba', '4 a 6 inHg', 'checklist'], ['Instrumentos', 'Horizonte, direccional y viraje (Handbook genérico)', 'handbook']],
  pitot: [['Ubicación', 'Ala izquierda («Tubo Pitot y Estática»)', 'checklist'], ['Instrumentos', 'Velocímetro (total y estática) · altímetro y variómetro (estática)', 'faa']],
  controles: [['Transmisión', 'Doble comando por cables', 'handbook'], ['Compensador', 'Manija en el techo de la cabina (Handbook; confirmar en el LV-LLS)', 'handbook']],
  cabina: [['Asientos', '4 en categoría normal · 2 en utilitaria', 'manual'], ['Equipaje', '90,8 kg (200 lb)', 'manual'], ['Peso máximo', '973,95 kg normal · 883,35 kg utilitaria', 'manual']],
  fuselaje: [['Estructura', 'Aleación de aluminio', 'handbook'], ['Largo / alto', '23,3 ft / 7,3 ft', 'handbook']],
  luces: [['En la lista', 'Navegación, anticolisión, aterrizaje y cabina', 'checklist'], ['Punta de ala', 'Roja a la izquierda, verde a la derecha (convención)', 'faa']],
  radio: [['Plan de vuelo', 'Equipo S (VHF, VOR, ILS) · transponder modo C', 'checklist'], ['Emergencia', '121,5 MHz · códigos 7500 / 7600 / 7700', 'checklist']]
};
