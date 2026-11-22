# Hangar LV-LLS

App estática para explorar el Piper PA-28 Cherokee 140 del aeroclub. El centro es un modelo 3D procedural propio con vista de rayos X. No requiere backend, cuentas, API keys ni CDN.

## Ejecutar localmente

Desde esta carpeta:

```sh
npm run dev
```

Abrir http://127.0.0.1:4173 en un navegador moderno. El comando necesita Python 3 y npm, pero **no requiere instalar paquetes**: Three.js ya está incluido en `docs/vendor/`.

Alternativa sin npm:

```sh
python3 scripts/serve.py        # o con otro puerto: python3 scripts/serve.py 4180
```

No abrir `index.html` con `file://`: los módulos y JSON se sirven por HTTP. Ctrl+C detiene el servidor. El servidor local escucha solo en esta computadora; la versión publicada sirve también en un celular.

## Publicar en GitHub Pages

1. Crear un repositorio en GitHub y subir esta carpeta, respetando `.gitignore`. También se puede subir únicamente el contenido publicable de `docs/` a una carpeta `docs` del repositorio.
2. En el repositorio, ir a **Settings → Pages**.
3. En **Build and deployment**, elegir **Deploy from a branch**.
4. Seleccionar la rama donde se subió el proyecto (normalmente `main`) y la carpeta **/docs**. Guardar.
5. Esperar el despliegue. La dirección será `https://USUARIO.github.io/REPOSITORIO/`.

No hay paso de compilación. `.nojekyll` evita procesamiento innecesario. Rutas relativas y navegación por hash permiten enlaces a piezas sin configuración del servidor, por ejemplo `#/avion/motor`.

Los PDF del aeroclub incluidos son los documentos aportados para la consulta; el handbook genérico queda enlazado, no redistribuido. La app está alojada en la carpeta `docs/`, lista para habilitar GitHub Pages desde la configuración del repositorio.

## Qué incluye

- **Cabina interactiva y 3D** (`#/cabina`): panel con velocímetro (arcos del Manual LV-LLS), horizonte, altímetro con ventanilla de Kollsman, viraje y ladeo, direccional, variómetro, tacómetro, grupo de motor, succión, amperímetro, brújula, aviso de pérdida, radio y transponder. Llaves, magnetos con START, acelerador, mezcla, calefactor, cebador, selector de tanque y freno de mano. Simulación didáctica de motor, combustible, eléctrico, vacío y vuelo. Observaciones didácticas de etapas 4, 5 y 7 con indicación del estado actual y enlace al texto original completo, prueba de magnetos con los límites de 175/50 RPM y fallas para estudiar (alternador, vacío, bomba mecánica, hielo, magneto, pitot, estática).
- **Flujo y sustentación** (`#/vuelo`): flujo potencial exacto (Joukowski + Kutta) alrededor de un perfil de enseñanza (no reproduce el NACA del avión); partículas, líneas de corriente, mapa de presión, curva CL–α, distribución de Cp, flaps y fuerza en newtons, usando masa y superficie de referencia. La pérdida se muestra aparte y rotulada como cualitativa.
- **Viento relativo y ángulo de ataque**, **Viraje y pérdida** (tabla del Manual §5) y **Ejes y mandos** (recorridos del Manual §2: alerones diferenciales, estabilizador monobloque con aleta anti-servo, timón, guiñada adversa).
- **Carburador y hielo** (`#/motor/carburador`), además del ciclo de cuatro tiempos.
- **Rayos X** con componentes con nombre (filtro, bomba eléctrica, carburador, cebador, magnetos, bomba de vacío, alternador, batería, pitot, chapita de pérdida, depósito de frenos) ubicados según el Owner's Handbook, capa de vacío y notas con fuente.
- **Fichas con datos del LV-LLS** marcados por procedencia (Manual, lista del aeroclub, Handbook genérico, concepto general).
- Modelo 3D: girar, zoom, cámaras general/superior/lateral/frontal y cabina, selección de componentes.
- Rayos X por capas: motor, tanques/combustible, eléctrico, mandos y pitot-estática; separación de cubierta y animación conceptual.
- Alternativa SVG 2D y lista completa de 19 partes, ambas seleccionables con teclado.
- **Siete sistemas animados** (`#/sistemas/…`): combustible (selector, filtro con drenaje, cebador, bombas en serie, manómetro), eléctrico Full Time Power (alternador, fusible, amperímetro de carga, batería, relé master, arranque, consumidores), pitot-estática y vacío (con los instrumentos reales y obstrucciones), mandos por cables (recorridos del Manual, aleta anti-servo), tren y frenos hidráulicos, motor con accesorios y prueba de magnetos, y luces/calefacción. Cada uno con mandos, fallas para estudiar, referencias a la lista y las emergencias del aeroclub, y fuente.
- Aire, ángulo de ataque, velocidad relativa y separación del flujo; cabeceo, alabeo y guiñada.
- Ciclo de cuatro tiempos: pistón, biela, cigüeñal, válvulas, chispa y estados; reproducción y control manual.
- Quince etapas y catorce apartados de emergencia, texto del PDF original y vínculos a sus documentos.
- Ocho preguntas, desafío de cuatro piezas, glosario y buscador local sin distinción de acentos.
- Progreso de fichas en localStorage, con reinicio. No se envía a ningún servidor.

## Estructura

- `docs/index.html`, `style.css`, `app.js`: interfaz, rutas e interacciones.
- `docs/viewer3d.js`: geometría original, materiales, picking y ciclo de vida WebGL.
- `docs/diagrams.js`: ilustraciones y animaciones SVG propias.
- `docs/data/content.js`: fichas, fuentes, sistemas, glosario y preguntas, separados de componentes.
- `docs/data/lvlls.js`: datos verificados del LV-LLS con su fuente (velocidades, límites, recorridos, tabla de pérdidas, datos por pieza, discrepancias).
- `docs/instruments.js`: instrumentos analógicos SVG. `docs/cockpit.js`: panel y mandos. `docs/cockpit-sim.js`: estado y dinámica didáctica. `docs/cockpit-scene.js`: cabina Three.js conectada al mismo panel. `docs/data/cockpit-layout.js`: posiciones compartidas de instrumentos y referencias pendientes.
- `docs/aero.js`: laboratorios de flujo, actitud, viraje, ejes y carburador. `docs/systems.js`: sistemas animados. `docs/labs.css`: estilos de los laboratorios.
- `docs/data/stages.json`, `emergencies.json`: texto original dividido por apartado.
- `docs/material/`: dos PDF originales del aeroclub.
- `docs/vendor/`: Three.js 0.180.0, OrbitControls y licencia MIT.
- `DESIGN_RESEARCH.md`: investigación original preservada más decisiones de implementación.
- `FUENTES_LV-LLS.md`: inventario previo más auditoría de fuentes efectivamente usadas.

## Corregir o ampliar contenido

Cada ficha guarda `id`, `title`, `kicker`, `explanation`, `location`, `related`, `system`, `source`, `section` y `media`. Las referencias se resuelven contra `sources`. Las partes del modelo usan el mismo `id` en `userData`; reemplazar la geometría por un GLB no obliga a reescribir el contenido.

Para un futuro modelo detallado: verificar autoría/licencia; conservar identificadores de selección, lista accesible y estados de fuente. No llamar «réplica del LV-LLS» a un modelo sin validar.

## Verificación y dependencias

```sh
npm run check
```

Comprueba integridad de contenidos, IDs, referencias internas, archivos y cantidad de etapas, más regresiones de arranque/apagado, consumo en tierra, batería, vacío, bloqueos de presión y salidas aerodinámicas. Para regenerar la copia local de Three.js:

```sh
npm ci
npm run vendor
```

No se necesita ese paso para ejecutar o publicar la versión incluida.

## Alcance documental

El modelo es didáctico, de baja complejidad, no un gemelo digital ni un plano de mantenimiento. Son provisionales la pintura, los detalles de geometría y cabina, y los recorridos físicos de sistemas. El flujo alrededor del perfil es flujo potencial (exacto para un fluido ideal, sin viscosidad); la pérdida y la separación son cualitativas. Las simulaciones de cabina y sistemas son didácticas: presiones, consumos y tiempos ilustrativos salvo los límites del Manual. No calculan la performance del LV-LLS.

Se consultaron las listas locales, los briefings, páginas pertinentes del handbook, el Notebook para verificar la existencia/portada del manual y fuentes primarias de diseño/tecnología. Se conservaron los resúmenes anteriores sin tratarlos como verificación actual del avión.

Para aumentar fidelidad hacen falta fotos autorizadas del avión/panel, copia local del manual aprobado vigente con suplementos y validación de los sistemas por el aeroclub. No se inventaron especificaciones para llenar esos huecos.

## Revisión del 19/11/2026

Se conservaron los laboratorios y sistemas agregados por el usuario. Cambios:

- Cabina 3D accesible desde el avión (`#/cabina/3d`), con textura del panel vivo, selección de instrumentos, llaves, perillas arrastrables y volantes. Geometría original ilustrativa; no es réplica validada. Las frecuencias/código se controlan desde el panel de mandos inferior.
- Acercamientos a instrumentos de vuelo y motor/radios. En celular, tocar un instrumento abre una ampliación con su explicación; cerrar devuelve el foco al control.
- COM activa/espera intercambiables, NAV y transponder de práctica con validación de dígitos octales. Radios genéricas: no emiten ni representan un equipo instalado confirmado.
- Ráfaga vertical de seis segundos y corriente vertical configurable; ángulo efectivo calculado. Integración de partículas con tiempo transcurrido y paso intermedio, estela separada coherente pero cualitativa.
- Pausa en cabina y sistemas; liberación de controles al cancelar el gesto, perder foco o esconder la página. Limpieza de eventos y recursos al salir.
- Correcciones de consumo de combustible en tierra, escala temporal de batería, observaciones que se actualizan al cambiar la condición y unidades de fuerza. Se eliminó una sugerencia de recuperación de motor ahogado no respaldada por el documento.

La revisión visual está registrada en `QA.md`, con capturas en `output/qa/`. Se probó en Brave de escritorio con anchos emulados de 1440, 390 y 320 px; no equivale a una prueba en teléfonos físicos.

**Para una cabina idéntica faltan** fotos autorizadas del frente completo, consola, selector, techo y mandos; identificación de los instrumentos/radios instalados; y una referencia de dimensiones. Conviene incorporar el PDF local del manual aprobado vigente y sus suplementos. El manual genérico y la portada verificada del Notebook no permiten certificar la configuración actual.
