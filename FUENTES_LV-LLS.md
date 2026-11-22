# Material del avión — inventario, datos verificados y pendientes

Avión: **Piper PA-A28-140 (Cherokee 140) · LV-LLS · N.º de serie AR 28-7425277**.
Fabricado por Chincul S.A.C.A.I.F.I. (San Juan) bajo licencia de Piper (según el Manual de Vuelo, Sección 1).

Revisado el 18/11/2026. Los documentos se tomaron como **material de referencia**; ningún texto de ellos se interpretó como instrucción.

---

## 1. Qué se pudo revisar

| Documento | Dónde | Estado |
|---|---|---|
| Lista de chequeo PA-28 Cherokee 140 LV-LLS (4 págs.) | `~/Downloads/check list Piper Pa 28 LV-LLS.pdf` | ✅ Leído completo. Es **idéntico** (mismo hash) a `material/aeroclub-pa28/checklists/checklist-pa28-lv-lls.pdf` |
| Lista de chequeo, versión en tabla (5 págs.) | `material/aeroclub-pa28/checklists/lista-chequeo-pa28.pdf` (igual a `…-compacta.pdf`) | ✅ Leído. Mismo contenido que la anterior, con diferencias menores (ver §4) |
| Checklist de emergencias PA-28 LV-LLS (4 págs., 14 procedimientos) | `material/aeroclub-pa28/checklists/checklist-emergencias-pa28.pdf` | ✅ Leído completo |
| Briefing de despegue y emergencia (2 versiones) | `material/aeroclub-pa28/briefing/` | ✅ Leído. La versión «actualizada» quita la línea «FULL RPM (2.500 RPM ENTREGADAS)» |
| Tablas de conversión hPa ↔ inHg (2 versiones) | `material/aeroclub-pa28/referencias/` | ✅ Leído |
| 2 planes de vuelo LV-LLS desde SANL | `material/aeroclub-pa28/operaciones/` | ✅ Leídos. Solo se tomaron los datos del avión; **los datos personales (nombres, documentos, teléfonos) no se usan** |
| Imágenes: canales de emergencia, códigos de transponder, tabla hPa/inHg | `material/aeroclub-pa28/imagenes/` | ✅ Vistas. Son capturas de terceros (por ejemplo «@vueloIFR»), así que **no se reutilizan como imagen**; solo se toma el dato (7500 / 7600 / 7700, 121,5 MHz) |
| **Manual de Vuelo aprobado LV-LLS** (DNA-MVD N.º 03-A-022, 54 págs. escaneadas) | Notebook compartido, fuente «Manual del avión LV-LSS.pdf» (el nombre del archivo tiene un error tipográfico; el contenido es del LV-LLS) | ✅ Leído página por página desde el Notebook. **No está** en las carpetas locales ni en el Google Drive conectado |
| **Piper Cherokee 140 Owner's Handbook** (P/N 753 584, emitido en feb. 1964, revisado el 1/3/1991; 53 págs. escaneadas, sin capa de texto) | `weas cosmicas/Cherokee-140-Owner_s-Handbook.pdf` (aportado el 18/11/2026) | ✅ Leído completo. Es el manual **genérico de Piper (EE. UU.)** del PA-28-140, no el del LV-LLS. Ver §2b |
| Resto de fuentes del Notebook (RAAC 61/67/91/141, MIP del aeroclub, Meteorología, Manual del piloto privado, etc.) | Notebook | ⏸️ Solo se listaron. No son del avión y no se revisaron en detalle |
| Notebook compartido | https://notebook.google.com/notebook/39eef202-… | ✅ Accesible con tu sesión de Chrome |

> Para la app conviene tener una **copia local del PDF del Manual de Vuelo** (por ejemplo en `material/aeroclub-pa28/manual/`), así los datos se pueden citar por página sin depender del Notebook.

---

## 2. Datos verificados en el Manual de Vuelo del LV-LLS

Sección y página según el encabezado de cada hoja del Manual (Informe VB-339 / VB-266).

### Generalidades (Secc. 1)
- Uso: deportivo, entrenamiento y transporte general; 2 o 4 asientos, o 2 asientos más carga.
- Motor Lycoming de 150 HP, 4 cilindros horizontales opuestos, refrigerado por aire.
- Hélice metálica de 2 palas y paso fijo, de 1,88 m.
- Combustible: **189 L (50 gal EE. UU.)**, 25 gal en cada ala.
- Tren triciclo fijo, rueda de nariz comandable desde el puesto del piloto; las 3 ruedas son iguales (6.00×6, cubiertas de 4 telas con cámara).
- Flaps de 4 posiciones: **0°, 10°, 25° y 40°**.
- Eléctrico de **12 V**, alternador de **60 A** y batería de **25 Ah**.
- Frenos a disco, más un freno de mano en el centro del tablero.

### Limitaciones (Secc. 2)
- **Motor:** Lycoming O-320-E2A u O-320-E3D, 2700 RPM y 150 HP para todas las operaciones. Combustible: aeronafta 80/87.
- **Hélice:** Sensenich M74DM o 74DM6. Diámetro máximo 187,96 cm (74″) y mínimo 184,15 cm (72,5″). RPM estáticas: 2150–2425 con 883,35 kg y 2275–2425 con 973,95 kg.

**Velocidades (IAS):**

| Velocidad | km/h | mph | kt |
|---|---|---|---|
| Nunca exceder (VNE) | 275 | 171 | 148 |
| Crucero estructural máxima | 225 | 140 | 121 |
| Maniobra | 207 | 129 | 112 |
| Extensión de flaps | 185 | 115 | 100 |

**Marcas del velocímetro:**
- Rojo: 148 kt.
- Amarillo: 121–148 kt.
- Verde: 56–121 kt.
- Blanco: 48–100 kt.

**Instrumentos de motor:**
- Temperatura de aceite: arco verde 24–118 °C (75–245 °F); rojo 118 °C.
- Presión de aceite: arco verde 60–90 psi; amarillo 25–60 psi; rojo máximo 90 psi. Para el rojo mínimo ver la discrepancia en §4.
- Presión de combustible: verde 0,5–8 psi; rojo mínimo 0,5 psi; rojo máximo 8 psi.
- Tacómetro: verde 500–2700 RPM; rojo 2700.

**Pesos, capacidades y centro de gravedad:**
- Factores de carga: +3,8 en categoría normal y +4,4 en utilitaria. Maniobras invertidas no aprobadas.
- Peso máximo: **973,95 kg (2150 lb)** en normal y **883,35 kg (1950 lb)** en utilitaria.
- Equipaje: 90,8 kg (200 lb). Con la modificación del plano Piper 66671, 136,2 kg (300 lb) en total. Ver §4.
- Datum: 199,14 cm (78,4″) por delante del borde de ataque del ala, en la raíz. Nivelación: sobre dos tornillos del costado izquierdo del fuselaje, bajo la ventanilla.
- Asientos: 4 en normal y 2 en utilitaria.
- Aceite: **7,568 L (8 qt)** de capacidad; 5,676 L (6 qt) consumibles.

**Maniobras:**
- Categoría normal: todas las acrobáticas, incluidas las barrenas, están **prohibidas**.
- Categoría utilitaria: barrenas con flaps arriba (entrada a velocidad de pérdida), virajes escarpados, ochos perezosos y virajes de defensa (*chandelles*) a 112 kt.

**Recorridos de superficies (±2°, estabilizador ±1°):**
- Flaps: 0° a 40° abajo.
- Alerones: 30° arriba y 15° abajo.
- Timón: 27° a cada lado.
- Estabilizador: 18° arriba y 2° abajo.
- Compensador del estabilizador: 3° arriba y 12° abajo.
- Rueda de nariz: 22° a cada lado.

**Placas:**
- Recuperación de barrena: timón a fondo contra la barrena, seguido de inmediato por la palanca adelante.
- «Trabar el cerrojo antes del decolaje» (cerrojo superior de la puerta).
- Velocidad de maniobra en aire turbulento: 112 kt.

### Procedimientos normales (Secc. 3)
- El aviso de pérdida no funciona con la llave general de batería desconectada.
- La bomba eléctrica de combustible debe estar conectada en despegues y aterrizajes.
- Listas de verificación para el despegue y el aterrizaje. En el aterrizaje, flaps «controlados y regulados (100 kt)».

### Emergencia (Secc. 4)
La parte escaneada empieza en el **ítem 4** y trata solo equipos opcionales: compensador eléctrico, AutoFlite / AutoControl y aire acondicionado. **No incluye** fallas de motor, fuego, etc. Para eso, la fuente operativa es la checklist de emergencias del aeroclub.

### Performance (Secc. 5, a 2150 lb)

| Dato | Valor |
|---|---|
| Velocidad máxima a nivel del mar | 123 kt |
| Crucero 75 % a 7000 ft | 116 kt |
| Crucero económico 60 % a 4000 ft | 100 kt |
| Pérdida con flaps abajo | 47 kt / 54 mph |
| Ascenso a nivel del mar | 660 ft/min |
| Techo de servicio | 14 300 ft |
| Carrera de despegue | 800 ft (244 m) |
| Carrera de aterrizaje | 535 ft (163 m) |
| Alcance al 75 % | 629 nm |
| Alcance al 60 % | 738 nm |

**Pérdida sin potencia (mph CAS)** según inclinación:

| Inclinación | 0° | 20° | 40° | 50° | 60° |
|---|---|---|---|---|---|
| Flaps arriba | 64 | 66 | 73 | 80 | 91 |
| Flaps abajo | 55 | — | — | — | — |

En una pérdida puede perder hasta 200 ft de altura.

### Peso y balanceo (Secc. 6) y apéndices
- Contiene la planilla original de 1974 (peso vacío 1298 lb), una pesada de 1990 (Aero Baires S.A.C.) y un gráfico de envolvente de 974 kg sin fecha visible.
- Suplementos: instalación de asientos traseros y configuración **ambulancia** (camilla).
- **Ningún peso vacío debe mostrarse en la app como «actual»** sin confirmar cuál es la última pesada vigente.
- Lista de equipos (1974): estándar y opcionales. Las marcas de «instalado» son ambiguas en el escaneo.
- Acabado original: base Blanco Juneau, vivos naranja y calones azules. El plan de vuelo actual dice **«blanco con franjas celestes»**.

---

## 2b. Owner's Handbook de Piper: qué aporta

**Jerarquía de fuentes.** El propio Handbook dice que no reemplaza la instrucción de vuelo y que, si hay contradicción, **manda el Manual de Vuelo aprobado** (p. 1, «Notice»). En la app, sus datos se marcan como **«PA-28-140 genérico (Piper)»** y nunca como «LV-LLS», salvo que coincidan con el Manual de Vuelo del LV-LLS.

**Derechos.** Es una publicación de Piper con revisiones hasta 1991. Se usa como **referencia para redactar y dibujar diagramas propios**. **No** se publican sus escaneos, figuras ni fotos en la app.

### Descripción de sistemas (Secc. II, págs. 5–12, y Secc. V)
| Sistema | Qué describe | Pág. |
|---|---|---|
| **Motor** | Lycoming O-320-E2A: compresión 7:1, cilindrada 319,8 in³, peso en seco 272 lb. Arrancador con reducción, **dos magnetos**, toma para la bomba de vacío, bomba de combustible mecánica de diafragma y **carburador de flotante**. El escape de acero inoxidable tiene un manguito que da calor a la cabina y al carburador. Sin *cowl flaps*. | 2, 5 |
| **Mandos de motor** | Acelerador *push-pull* abajo al centro del panel, con freno de fricción. Mezcla *push-pull* abajo a la derecha: adelante = rica, atrás del todo = corte. Calefacción de carburador a la izquierda del acelerador: atrás = calor máximo; con calor, el aire entra **sin filtrar**. | 5–6 |
| **Hélice** | Sensenich M74DM de paso fijo, aluminio, 74″. Paso de 60″; 58″ con peso bruto de 2150 lb. | 5 |
| **Estructura** | Toda de aleación de aluminio. Perfil laminar **NACA 65₂-415**. Larguero principal pasante bajo el asiento trasero. Diedro 7°, torsión 2°. | 6, 35 |
| **Tren** | Ruedas Cleveland 6.00×6, cubiertas de 4 telas con cámara. Amortiguadores óleo-neumáticos: extensión estática de 3,25″ en la nariz y 4,50″ en el principal. Amortiguador anti-shimmy en la nariz. Presión de 24 psi en las tres ruedas. | 6–7, 27–28 |
| **Frenos** | Discos hidráulicos Cleveland. Palanca de mano con cilindro maestro bajo el panel. **Depósito de líquido arriba a la izquierda del parallamas.** El freno de estacionamiento se pone tirando la palanca y apretando el botón. Líquido MIL-H-5606. | 7, 27 |
| **Mandos de vuelo** | Doble comando con **cables**. **Estabilizador monobloque (stabilator)** con aleta *anti-servo* que hace de compensador, accionada desde el techo de la cabina. **Alerones diferenciales** para reducir la guiñada adversa. Resorte en los pedales para centrar el timón. Rueda de nariz dirigible con los pedales. | 7 |
| **Flaps** | Manuales, con resorte hacia arriba. Posiciones de 10°, 25° y 40°. **El flap derecho sirve de escalón solo si está totalmente arriba.** | 8 |
| **Combustible** | Dos tanques de 25 gal en el borde de ataque. Capacidad «estándar» de 36 gal llenando hasta el indicador del cuello, y 50 gal llenos. Recorrido: selector → **filtro con drenaje** (abajo, a la izquierda del parallamas), con toma para el **cebador** → **bomba eléctrica auxiliar** → **bomba mecánica** → carburador. Manómetro de presión e indicadores de cantidad. Drenaje en el ángulo trasero interno de cada tanque. **Hay diagrama.** | 3, 8–9, 29 |
| **Eléctrico** | Sistema Piper «Full Time Power» de 12 V: alternador, batería de 25 Ah, regulador de voltaje y relé del master. **La batería y el relé van bajo el piso del compartimiento de equipaje.** Llaves y fusibles abajo a la izquierda del panel. **El amperímetro muestra la carga del sistema**, no la descarga de la batería: unos 2 A con todo apagado y la batería cargada. **El alternador necesita unos 3 V de la batería para excitarse.** **Hay esquema eléctrico**, de baja resolución pero con la estructura legible. | 9–10, 27, 34 |
| **Calefacción y ventilación** | Manguito sobre el escape para la cabina y el desempañador, con controles abajo a la derecha del panel. Toma de aire fresco a los pies del piloto y una salida de aire en cada asiento. **Hay diagrama.** | 10–11 |
| **Cabina e instrumentos** | Horizonte artificial, direccional y viraje y ladeo **accionados por vacío** (según el Handbook). Radios al centro del panel. La foto del panel numera: brújula, velocímetro, direccional, horizonte, ADF, VHF, tacómetro, indicador de vacío, grupo de instrumentos de motor, viraje y ladeo, reloj, **luz de aviso de pérdida**, altímetro y variómetro. Asientos traseros opcionales. | 12–12a |
| **Amarre y nivelación** | Argollas bajo cada ala y en el patín de cola; barra de remolque. Nivelación sobre dos tornillos bajo la ventanilla delantera izquierda, igual que en el Manual. Placa de número de serie junto al estabilizador, lado izquierdo. | 19a, 33 |

### Operación y performance (Secc. I, III y IV)
- **Velocidades del Handbook, en mph, a peso bruto:**
  - Mejor régimen de ascenso (Vy): **85 mph (≈ 74 kt)**.
  - Mejor ángulo de ascenso (Vx): **74 mph (≈ 64 kt)**.
  - Ascenso en ruta: 100 mph.
  - Aproximación: unas 85 mph con flaps arriba, 3 mph menos por cada punto de flap.
  - Flaps hasta 115 mph (100 kt).
  - Pérdida con flaps abajo: 54 mph a 2150 lb; 9 mph más con flaps arriba.
  - Planeo del gráfico: **83 mph (≈ 72 kt)**, con 2150 lb, hélice en molinete, flaps 0° y sin viento. Da unas 2 millas terrestres por cada 1000 ft (lectura aproximada del gráfico, p. 25b).
- **Prueba de motor** (p. 16): magnetos a 2000 RPM, caída máxima de 175 RPM y diferencia máxima de 50 RPM; vacío de 5 ± 1 inHg. **Coincide con la checklist del aeroclub.**
- **Aviso de pérdida:** **luz roja** a la izquierda del panel, que se enciende entre 5 y 10 mph antes de la pérdida (p. 18).
- **Dimensiones:**
  - Envergadura: 30 ft.
  - Superficie alar: 160 ft².
  - Largo: 23,3 ft.
  - Alto: 7,3 ft.
  - Distancia entre ejes: 6,2 ft.
  - Trocha: 10,0 ft.
- **Lubricación y combustible:**
  - Aceite: 8 qt de capacidad y **2 qt de mínimo seguro**. Cambio cada 50 h.
  - Grados de aceite según la temperatura: SAE 50 por encima de 60 °F; 40 entre 30 y 90 °F; 30 entre 0 y 70 °F; 20 por debajo de 10 °F.
  - Combustible: mínimo 80/87. Si no hay, usar el 100 de menor contenido de plomo.
  - Filtro de aire: limpiarlo cada 50 h.
- **Gráficos de performance** (Secc. IV): distancia de despegue y aterrizaje, régimen de ascenso, velocidad verdadera, alcance y potencia en función de la altitud de densidad, distancia de planeo y conversión de altitud.
- **Este Handbook no tiene sección de procedimientos de emergencia.** Las emergencias de la app siguen saliendo **solo** de la checklist del aeroclub.

---

## 3. Datos del aeroclub (checklists y briefing)

Están completos y transcribibles tal cual:
- 15 etapas de la checklist normal: preparación de cabina → parada de motor.
- 14 procedimientos de emergencia.
- Briefing de despegue y emergencia de La Rioja: pista 03/21, 2800 m, y altitudes de decisión 300 / 700 ft.

Datos útiles que surgen de ellos:
- **Prueba de motor:** 2000 RPM; caída de magnetos de 175 RPM máx. y diferencia de 50 RPM máx.; succión 4–6 inHg.
- **Despegue:** rotación 65/70 kt y ascenso normal 80 kt.
- **Crucero:** 2300/2400 RPM.
- **Parada:** 1100 RPM antes de cortar la mezcla.
- **Planeo:** 76 kt (checklist de emergencias y briefing).
- **Plan de vuelo:** casilla 10, equipo **S / C** (equipo estándar y transpondedor modo C); base SANL; velocidad declarada N0090–N0100; autonomía declarada 3 h 00.

---

## 4. Discrepancias para revisar con el instructor (no resolverlas en la app)

1. **Vx / Vy invertidas en el briefing.** Dice «VX 75 kt (mejor régimen de ascenso)» y «VY 80 kt (mejor ángulo)». Por definición estándar, Vx es mejor **ángulo** y Vy mejor **régimen**. El Manual de Vuelo no publica Vx ni Vy. **El Owner's Handbook da Vx 74 mph (≈ 64 kt) y Vy 85 mph (≈ 74 kt).** Los valores del briefing (75 y 80) no coinciden con ninguno, ni en nudos ni en millas. Sospecha: confusión de unidades o etiquetas.
2. **Velocidad de rotación.** El briefing dice 60–65 kt; la checklist, 65/70 kt.
3. **Aceite.** La checklist dice «4 Min 6 Max» sin unidad. El Manual da 8 qt de capacidad y 6 qt consumibles. El Handbook da 8 qt máximo y 2 qt de mínimo seguro. Probablemente sea un criterio operativo del aeroclub, pero hay que confirmar unidad y criterio.
4. **Presión de aceite, rojo mínimo.** El Manual impreso dice 60 psi, lo que se contradice con su propio arco amarillo de 25–60 psi. Probable error de transcripción del Manual; hay que confirmarlo con el instrumento del avión.
5. **Velocidad de planeo de 76 kt.** Viene de los documentos del aeroclub; en el Manual escaneado no apareció una velocidad de mejor planeo. El gráfico de planeo del Handbook usa **83 mph (≈ 72 kt)**.
6. **Checklist de emergencias, ítem 11.** Bajo «Falla eléctrica» aparece el encabezado «Durante la carrera de despegue», que parece un arrastre de formato. Se mostraría literal.
7. **Faltas de ortografía en la checklist de emergencias** («fuefo», «abandoner», «duante», etc.). Propuesta: corregir solo la ortografía evidente, sin tocar ninguna acción, y dejar constancia. Necesita tu OK.
8. **Equipaje.** El Manual dice 90,8 kg (200 lb) y, en otra hoja, «área 1 = 200 lb, área 2 = 100 lb» tras la modificación 66671. No se sabe si el LV-LLS la tiene.
9. **Motor, hélice y batería instalados.** El Manual admite O-320-E2A o E3D, Sensenich M74DM o 74DM6, y batería de 25 o 35 Ah. Cuál tiene hoy el avión hay que confirmarlo con las libretas historiales.

**Diferencias entre el Handbook (Piper EE. UU.) y el Manual del LV-LLS (Chincul).** En todos estos casos manda el Manual:

10. **Alternador.** El Handbook dice 35 A; el Manual y su lista de equipos dicen **60 A** (Chrysler 2642997). El esquema eléctrico del Handbook puede no coincidir con el del LV-LLS.
11. **Dirección de la rueda de nariz.** El Handbook dice ±30°; el Manual dice **±22°**.
12. **Combustible.** El Handbook distingue 36 gal «estándar» y 50 gal «con reserva»; el Manual habla de 50 gal (189 L) en total. Ninguno de los dos da el **combustible utilizable**. Pendiente.
13. **Aviso de pérdida.** El Handbook describe una **luz roja**; la checklist del aeroclub pide «verificar **sonido**» de la chapita; la lista de equipos de Chincul nombra un aviso de pérdida Safe Flight. ¿El LV-LLS tiene bocina, luz o ambas?
14. **Compensador.** El Handbook ubica el comando en el techo de la cabina. Hay que confirmarlo con una foto de la cabina del LV-LLS.
15. **Frenos.** El Handbook describe palanca de mano; la lista de equipos de Chincul marca «frenos de talón (dobles)». ¿El LV-LLS tiene ambos?
16. **Técnica de despegue.** El Handbook dice dejar que despegue solo tras acelerar a 50–60 mph; la checklist del aeroclub dice rotación a 65/70 kt. Son documentos con enfoques distintos. En la app se muestra **solo** el dato del aeroclub en «Recorrido», y el del Handbook como contexto marcado «genérico».

---

## 5. Lo que falta (y quién podría aportarlo)

| Falta | Para qué | Indispensable |
|---|---|---|
| **Fotos actuales del LV-LLS**: exterior desde varios ángulos, cabina, panel de instrumentos, compartimiento del motor | Fotos grandes, explorador de cabina, juego «encontrá la pieza» | **Sí** |
| ~~Descripción de sistemas del PA-28-140~~ | — | ✅ **Resuelto en buena parte con el Owner's Handbook.** Sigue faltando: sistema **pitot-estático** (el Handbook no lo describe), esquema eléctrico del **LV-LLS** (alternador de 60 A) y confirmar qué instrumentos son eléctricos y cuáles de vacío. Esto lo puede validar el mecánico o el instructor |
| **Lista de aviónica y equipos instalados hoy** (radio COM/NAV, transpondedor, ELT, instrumentos giroscópicos) | Ficha de cabina y comunicaciones | Sí, para la cabina |
| Última planilla de peso y balanceo vigente | Si se agrega una sección de carga | No (opcional) |
| Página(s) 1–3 de la Sección 4 del Manual, si existen | Completar la referencia del Manual | No |
| Copia local del PDF del Manual de Vuelo | Citar páginas sin depender del Notebook | Recomendado |

## 6. Auditoría de esta implementación (18/11/2026)

Se conserva arriba la investigación heredada. En esta sesión se verificaron directamente:
- Inventario del proyecto y de las subcarpetas solicitadas. No había aplicación preexistente ni AGENTS.md dentro del proyecto.
- Extracción completa de las cuatro listas locales y los dos briefings. Para la app se eligió `checklist-pa28-lv-lls.pdf` como lista normal y `checklist-emergencias-pa28.pdf` como emergencia; se copiaron sin cambios a `docs/material/`.
- El handbook local de 53 páginas. Se revisaron visualmente páginas pertinentes de estructura, tren, mandos, combustible y eléctrico (numeración impresa 6–9). El resto del resumen previo NO se presenta como una nueva lectura completa en esta sesión.
- Notebook accesible en Brave: se abrió la fuente «Manual del avión LV-LSS.pdf» y se comprobó visualmente su portada. No se descargó el archivo ni se releyeron las 54 hojas en esta sesión. Los valores numéricos específicos del resumen heredado no se trasladaron como certificación de la configuración actual.
- FAA PHAK, capítulos 7 y 8 descargados de faa.gov para contrastar ciclo de cuatro tiempos y sistema pitot-estático. Los PDF de FAA son solo referencia de trabajo y no se redistribuyen en la app.

No se usaron fotografías de terceros, las capturas de la subcarpeta `imagenes/` ni los datos personales de planes de vuelo. Las fotos del LV-LLS y una copia local del manual vigente siguen siendo pendientes, pero no bloquean la experiencia didáctica genérica.

Los esquemas, modelos y animaciones son originales. La app deja explícito que panel, pintura, geometría detallada y recorrido físico de cañerías/cables son provisionales. La vista de pitot-estática representa principios generales, no la instalación comprobada del avión. La animación de combustión usa un cilindro vertical por legibilidad aunque la familia documentada tiene cilindros horizontalmente opuestos.

Las 15 etapas y 14 emergencias se generaron separando los encabezados numerados del PDF; se preservan indicaciones, erratas, valores y orden. No se mezclaron versiones. La consulta abre el PDF original para verificar formato. No hay checklist operativa con casillas, cálculo de performance ni secuencias de emergencia inventadas.

## 7. Revisión de los cambios del usuario — 19/11/2026

Ahora existe una app ampliada por el usuario, con datos numéricos en `docs/data/lvlls.js`, instrumentos, cabina y sistemas. Se conservaron sus valores y sus atribuciones; esta revisión no constituye una relectura del manual aprobado completo ni validación del equipo instalado hoy. No se modificaron los PDF normales/de emergencia ni sus textos JSON.

Se buscaron referencias visuales en el proyecto, material local del aeroclub y archivos pertinentes de Descargas: no se localizaron fotos actuales del panel. Las imágenes auxiliares del aeroclub son tablas/códigos, no referencias de geometría de la cabina. Se solicitó al usuario la ubicación de fotos de panel, consola y techo; sigue pendiente.

La cabina 3D nueva emplea el panel SVG del usuario como textura viva y geometría original ilustrativa. Su paisaje también es original, sin representar un aeródromo real. No se presenta como cabina idéntica del LV-LLS. COM/NAV, transponder, batería de 25 Ah, combustible inicial, tasas de consumo, elevación, QNH y respuestas dinámicas son valores de ejercicio, no especificaciones verificadas.

El laboratorio usa un perfil de Joukowski de enseñanza; no contiene las coordenadas del NACA instalado. Ráfagas y pérdida son aproximaciones didácticas, no resultados de ensayo ni CFD. Se corrigió la fuerza a newtons y se retiró la afirmación de que el modelo determina la pérdida del avión real.

Indispensable para cerrar la réplica: fotografías autorizadas actuales y dimensiones de referencia, inventario de aviónica/instrumentos y validación del aeroclub. La copia local del manual aprobado vigente, suplementos y esquemas aplicables sigue siendo necesaria para una validación técnica completa.
