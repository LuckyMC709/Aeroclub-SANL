# Investigación de diseño — Explorador PA-28 Cherokee 140 · LV-LLS

Fecha: 18 de noviembre de 2026
Estado: investigación inicial conservada y decisiones aplicadas en la app. Los apartados iniciales describen la propuesta del 18/11; las revisiones al final registran el estado implementado.

El inventario del material del avión (qué documentos se revisaron, qué datos están verificados y qué falta) está en [FUENTES_LV-LLS.md](FUENTES_LV-LLS.md).

---

## 1. Fuentes consultadas

### Guías de diseño de plataforma
| Fuente | Qué se tomó |
|---|---|
| [Apple HIG — Tab bars](https://developer.apple.com/design/human-interface-guidelines/tab-bars) | La barra de pestañas se usa para navegar, no para ejecutar acciones. Conviene tener pocas pestañas, con etiqueta en cada una, que la barra quede visible al cambiar de sección y que no haya desbordamiento ("More"). Hasta 5 pestañas por defecto mantienen la coherencia entre tamaños compacto y regular. Si una sección no tiene contenido, la pestaña no se oculta: se explica por qué está vacía. |
| [Apple HIG — Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) | Objetivo de toque de 44×44 pt por defecto (mínimo 28). Contraste WCAG AA: 4,5:1 para texto normal y 3:1 para texto grande o negrita. El texto debe poder ampliarse al 200 %. El color nunca debe ser la única señal. "Reducir movimiento": cambiar desplazamientos y zooms por fundidos. |
| [Apple HIG — Onboarding](https://developer.apple.com/design/human-interface-guidelines/onboarding) | Se aprende usando. La introducción es breve, se puede saltar y no se repite. Los consejos aparecen en contexto, junto a la parte de la interfaz que explican. |
| [Apple HIG — Motion](https://developer.apple.com/design/human-interface-guidelines/motion) | El movimiento tiene que tener un propósito y ser breve. Nunca debe ser la única vía para comunicar algo. No se hace esperar al usuario a que termine una animación. Se evita animar las interacciones frecuentes. |
| [Material 3 — Navigation bar](https://m3.material.io/components/navigation-bar/guidelines) | De 3 a 5 destinos, cada uno con ícono y etiqueta de 1 o 2 palabras. No se navega con gestos de deslizar. La barra va en ventanas compactas o medianas; en ventanas expandidas o de escritorio se usa un riel lateral (*navigation rail*). Si se vuelve a tocar el destino activo, la vista sube al inicio. Con lector de pantalla activo, la barra no se oculta al desplazar. |
| [Material 3 — Accesibilidad: estructura](https://m3.material.io/foundations/designing/structure) | Objetivos táctiles de 48×48 dp (unos 9 mm) con 8 dp de separación. Objetivos de puntero de 44 dp. Landmarks ARIA (navigation, search, main, region…) con etiquetas únicas. Un solo H1 y encabezados sin saltos de nivel. |
| [Android — Window size classes](https://developer.android.com/develop/ui/compose/layouts/adaptive/use-window-size-classes) | Cortes por ancho de ventana (no por tipo de dispositivo): compacto < 600, mediano 600–840, expandido 840–1200, grande 1200–1600 y extra grande ≥ 1600. |
| [Android — Canonical layouts](https://developer.android.com/develop/ui/compose/layouts/adaptive/canonical-layouts) | **Lista‑detalle** y **panel de apoyo**. En ventana expandida, el contenido principal ocupa el 70 % y el panel el 30 %. En ventana compacta, el panel pasa abajo o a una hoja inferior (*bottom sheet*). |

### Web, rendimiento y accesibilidad
| Fuente | Qué se tomó |
|---|---|
| [web.dev — Responsive web design basics](https://web.dev/articles/responsive-web-design-basics) | `meta viewport` con `width=device-width, initial-scale=1` y sin bloquear el zoom. Puntos de quiebre según el contenido, diseño *mobile‑first*, imágenes con `max-width:100%` y `width`/`height` declarados. Líneas de 70 a 80 caracteres. No esconder contenido en pantallas chicas. Consultas `hover`/`pointer`. |
| [web.dev — Core Web Vitals](https://web.dev/articles/vitals) | Metas: LCP ≤ 2,5 s, INP ≤ 200 ms y CLS ≤ 0,1, medidas en el percentil 75, separando móvil y escritorio. |
| [MDN — prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion) | Soporte amplio en navegadores (Baseline). Se reemplazan escala y desplazamiento por opacidad, en lugar de eliminar toda la respuesta visual. |
| [W3C — WCAG 2.2, 2.5.8 Target Size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) | Mínimo de 24×24 px CSS (AA) y nivel reforzado de 44×44 px (2.5.5) para los controles importantes. |

### 3D en la web
| Fuente | Qué se tomó |
|---|---|
| [three.js manual — Picking](https://threejs.org/manual/en/picking.html) y ejemplo *rendering on demand* (encontrado por búsqueda, no se pudo cargar la página completa) | Para seleccionar piezas: un `Raycaster` lanzado desde el puntero sobre mallas con nombre. Renderizar solo cuando algo cambia (controles, resize, selección), y no en bucle continuo, para ahorrar batería en el celular. |
| [model-viewer (Google, Apache 2.0)](https://modelviewer.dev/) · [docs](https://modelviewer.dev/docs/) | Componente web para glTF/GLB con atributos `alt` y `poster`, *hotspots* (`slot="hotspot-*"`) y `surfaceFromPoint`. Funciona en las dos últimas versiones de los navegadores principales. Es la vía más simple para pasar de 2D a 3D sin escribir un motor propio. |

### Ejemplos de referencia (principios, no diseño)
| Ejemplo | Principio extraído |
|---|---|
| [Bartosz Ciechanowski — *Airfoil*](https://ciechanow.ski/airfoil/) | Un deslizador por variable, simulaciones que se pueden pausar o recorrer, varias representaciones del mismo flujo (flechas, partículas, mapa de presión) y una construcción progresiva, de lo visible a lo abstracto. |
| [NASA Glenn — FoilSim](https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/foilsimstudent) / [Beginner's Guide to Aeronautics](https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/) | Cambiar variables (ángulo de ataque, velocidad) y ver al instante el efecto sobre la sustentación. Es una buena fuente conceptual para «Cómo vuela». |
| [NOVA/PBS — Getting Airborne](https://www.pbs.org/wgbh/nova/education/space/getting-airborne-wing-design.html) | Interactivo escolar con pocas variables y respuesta inmediata, pensado para principiantes. |
| Fuentes sobre el mito del «tiempo de tránsito igual» ([Cambridge Engineering](https://www.eng.cam.ac.uk/node/218)) | En «Cómo vuela» **no** se usa esa explicación incorrecta. |
| [FAA — Pilot's Handbook of Aeronautical Knowledge (FAA‑H‑8083‑25C)](https://www.faa.gov/regulations_policies/handbooks_manuals/aviation/phak) | Fuente general para explicar sistemas (cap. 7) y aerodinámica. Se marca como **«conocimiento general»** y nunca como dato del LV-LLS. |

---

## 2. Principios que se van a aplicar

1. **Se aprende tocando el avión.** La pantalla principal es el avión mismo, sin portada ni tutorial largo. Un consejo contextual breve («Tocá una parte») que se puede descartar y no vuelve a aparecer (HIG Onboarding).
2. **Navegación con 5 destinos fijos y etiquetados** (HIG + Material). Las 6 áreas pedidas se agrupan así:

   | Destino | Contiene |
   |---|---|
   | **Avión** | Explorar exterior y cabina, más la capa **Sistemas** (es la misma vista, con un selector Exterior · Cabina · Sistemas) |
   | **Cómo vuela** | Animaciones de aerodinámica con deslizadores |
   | **Recorrido** | Línea de tiempo de las 15 etapas de la checklist |
   | **Emergencias** | Escenarios de aprendizaje |
   | **Aprender** | Preguntas, glosario y «encontrá la pieza» |

   La **búsqueda** queda siempre disponible en la barra superior (landmark `search`). No es una pestaña.
3. **Diseño adaptable según el ancho de ventana, no según el dispositivo:**
   - **< 600 px:** barra inferior de 5 ítems (ícono arriba y etiqueta abajo). La ficha de la pieza abre en una hoja inferior, con altura media y deslizable a pantalla completa.
   - **600–840 px:** barra inferior con ícono y etiqueta lado a lado, o riel lateral. La ficha va en un panel lateral de 50/50.
   - **≥ 840 px:** riel lateral a la izquierda y diseño de **panel de apoyo**: avión al 70 % y ficha al 30 %.
4. **Lista‑detalle como alternativa al diagrama.** Cada vista interactiva tiene una «Lista de partes» equivalente, navegable con teclado y lector de pantalla. Así se cumple la alternativa al contenido 3D o SVG.
5. **Procedencia visible en cada dato.** Cada ficha muestra de dónde sale lo que dice:
   - `Manual de Vuelo LV-LLS` (dato verificado del avión)
   - `Checklist del aeroclub`
   - `Conocimiento general` (FAA o NASA, no específico del LV-LLS)
   - `Pendiente de confirmar`

   Esto resuelve el pedido de «no inventar y señalar lo provisional» como un patrón de interfaz, no como una nota al pie.
6. **Las checklists se muestran tal cual.** Texto literal, solo lectura, con referencia al documento y la sección, y el aviso «Material de estudio; no reemplaza la lista a bordo ni la instrucción». Los procedimientos nunca se reescriben ni se resumen.
7. **Movimiento con propósito.** Las animaciones explican algo (flujo de aire, deflexión de superficies, recorrido del combustible), se pueden pausar y nunca bloquean la interacción. Con `prefers-reduced-motion` se cambian por fundidos o estados estáticos. Las superficies de mando se animan solo cuando el usuario mueve un control.
8. **Un deslizador por variable** («Cómo vuela», al estilo de Ciechanowski y FoilSim): ángulo de ataque, velocidad, inclinación y deflexión de mando. Cada uno se muestra con al menos dos representaciones (diagrama más valor numérico o texto) para no depender del color.
9. **Objetivos táctiles de 48×48 px y separación de 8 px**, que cumplen a la vez Apple (44), Material (48) y WCAG 2.5.5 (44). Contraste mínimo de 4,5:1 en el texto y 3:1 en íconos y bordes de control.
10. **Rendimiento como requisito de diseño.** Web estática (GitHub Pages), SVG en línea para los diagramas y 3D con carga diferida solo al pedirlo, con póster estático. Imágenes con `width`/`height` y formatos modernos. Metas: LCP ≤ 2,5 s, INP ≤ 200 ms y CLS ≤ 0,1 en celular.

---

## 3. Decisiones de diseño propuestas

### 3.1 Arquitectura de información
- **Ruteo por hash** (`#/avion/flaps`, `#/recorrido/7`) para que cada pieza, etapa o escenario tenga un enlace propio y funcione en GitHub Pages sin servidor.
- **Fichas como datos, separadas de la interfaz:** un JSON por colección (`partes.json`, `sistemas.json`, `etapas.json`, `emergencias.json`, `glosario.json`, `preguntas.json`). Esquema mínimo de una ficha:
  ```json
  {
    "id": "flaps",
    "titulo": "Flaps",
    "resumen": "…",
    "explicacion": "…",
    "media": { "tipo": "svg|foto|modelo", "src": "…", "alt": "…", "credito": "…", "licencia": "…" },
    "relacionados": ["alerones", "velocidades", "etapa-13"],
    "fuente": { "doc": "Manual de Vuelo LV-LLS", "seccion": "2", "pagina": "5" },
    "estado": "verificado | general | pendiente"
  }
  ```
- Los **vínculos cruzados** forman el «mapa» del avión. Por ejemplo, Flaps se conecta con «Velocidad de extensión de flaps 100 kt» (Manual §2), con las etapas 1, 3, 7, 10, 13 y 14 de la checklist y con el escenario «Falla de motor en el despegue».

### 3.2 Explorador del avión (pantalla principal)
- **Fase 1 (2D):** ilustración técnica en SVG propia, con vista lateral, superior y de cabina. Cada pieza es un `<button>` dentro del SVG con `aria-label`, foco visible y resaltado al pasar el cursor o tocar. Se cambia de vista con un control segmentado. La capa **Sistemas** colorea los recorridos: combustible, eléctrico, pitot‑estático y vacío.
- **Fase 2 (3D, opcional):** `<model-viewer>` con *hotspots* que reutilizan los mismos `id` de las fichas. Se carga solo al tocar «Ver en 3D» y la vista 2D sigue siendo la alternativa por defecto.
- **Modelos 3D candidatos** (Sketchfab, todos **CC‑BY**, requieren atribución; ninguno representa al LV-LLS ni su pintura):
  - [«Piper Pa 28 "Cadet"» por helijah](https://sketchfab.com/3d-models/none-ba310f1e1ba349c7a54ab9db92e48970): unos 55 000 caras. Es un Cadet, no un 140.
  - [«Piper PA-28 Cherokee - General Aviation Aircraft» por INGSOC1984](https://sketchfab.com/3d-models/none-0c65c2677bbc463787905434544f035f): unas 5 900 caras.
  - [«L4D Piper PA-28 Cherokee» por danielisthebosss](https://sketchfab.com/3d-models/none-2058e613e45a4a2492b378628504debb): unas 5 400 caras.

  Antes de usar cualquiera hay que revisar la licencia en la página del modelo, la autoría original y si las piezas vienen separadas (para poder seleccionarlas). Hasta entonces, **son provisionales**.
- **Proporciones:** el Owner's Handbook trae un dibujo de 3 vistas con cotas (p. 4: envergadura de 360″, cola de 120″, etc.) y medidas en la Secc. I (envergadura de 30 ft, largo de 23,3 ft, alto de 7,3 ft). Con eso alcanza para dibujar el SVG propio con proporciones correctas.
- **Imagen de referencia de dominio público (EE. UU.):** [dibujo de 3 vistas del PA-28-140 en Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Piper_PA-28-140_Cherokee_3-view_line_drawing.png), escaneado del *Cherokee 140 Owner's Handbook* de Piper (1964). Está etiquetado PD‑scan, pero Commons advierte que **no es dominio público en algunos países**. Se usaría solo como guía de proporciones para dibujar el SVG propio, no como imagen publicada.

### 3.3 Sistemas
Se muestran como diagramas de bloques animables (flujo con guiones que avanzan; estático con movimiento reducido). Cada componente es seleccionable y lleva a su ficha. Los componentes que se nombran salen de la checklist y del Manual:
- **Combustible:** 2 tanques alares de 25 gal, selector, filtro o drenaje, bomba mecánica, bomba eléctrica auxiliar, primer, carburador, mezcla, calefactor de carburador y manómetro de presión.
- **Eléctrico:** 12 V, alternador de 60 A, batería, master, fusibles y amperímetro.
- **Motor y hélice**, **mandos de vuelo**, **tren y frenos**, **pitot‑estático y vacío** (succión 4–6 inHg según la checklist) y **luces y radio**.

**Actualización del 18/11/2026: llegó el Owner's Handbook de Piper.** Ahora hay base para dibujar diagramas propios de:
- **Combustible:** tanques → selector → filtro con drenaje (toma del cebador) → bomba eléctrica → bomba mecánica → carburador, con manómetro e indicadores.
- **Eléctrico:** batería → relé del master → barra, alternador → amperímetro → protector, regulador, arranque y fusibles.
- **Calefacción y ventilación:** el manguito sobre el escape alimenta la cabina, el desempañador y el calor del carburador.
- **Mandos de vuelo:** cables, estabilizador monobloque con aleta anti-servo y alerones diferenciales.
- **Tren y frenos.**

Reglas para los diagramas:
- Se **redibujan** en SVG propio; no se publican los escaneos.
- Los valores que difieren del LV-LLS (por ejemplo, alternador de 60 A en lugar de 35 A) se toman del Manual de Vuelo del LV-LLS.

Siguen pendientes:
- El circuito **pitot-estático**, que el Handbook no describe. Por ahora se dibuja como «conocimiento general (FAA PHAK)».
- Qué instrumentos giroscópicos son de vacío y cuáles eléctricos en el LV-LLS.

Ver [FUENTES_LV-LLS.md](FUENTES_LV-LLS.md) §2b y §4.

**Idea de interacción** (sale del Handbook): en el diagrama eléctrico, mostrar que el amperímetro indica *carga* (unos 2 A con todo apagado y luego sube con cada equipo que se enciende). Se conecta con el escenario «Falla eléctrica» de la checklist del aeroclub, donde el amperímetro marca cero.

### 3.4 Recorrido del vuelo
- Línea de tiempo horizontal en escritorio y vertical en celular, con las **15 etapas reales de la checklist del aeroclub**. Al abrir una etapa se ven sus ítems literales, con la pieza o el control resaltado en el avión.
- Inspección exterior: recorrido animado alrededor del avión con el orden de la checklist (Lado derecho, Motor, Lado izquierdo, Empenaje).

### 3.5 Emergencias para aprender
- Tarjeta de escenario con: qué está pasando, qué sistema está involucrado (vínculo al diagrama), el procedimiento **literal** del checklist de emergencias del aeroclub, y un desafío (ordenar pasos, identificar el control).
- Las respuestas del desafío salen únicamente del texto fuente; si el documento es ambiguo, el desafío no se arma.
- Aviso fijo, citado del briefing del aeroclub: emergencia simulada → ejecuta el alumno; emergencia real → ejecuta el instructor o inspector.

### 3.6 Aprender jugando
Las preguntas cortas se generan a partir de datos con `estado: verificado`. El juego «Encontrá esta pieza» reutiliza los mismos botones del SVG. El glosario está enlazado a las fichas. La búsqueda es local, sobre los JSON (sin servidor), con tolerancia a acentos.

### 3.7 Estética
Idea: **hangar y plano técnico**.

| Rol | Color propuesto | Uso |
|---|---|---|
| Fondo principal | Azul profundo `#0B1F3A` | Hangar, encabezados |
| Superficie | Azul pizarra `#13294B` | Tarjetas sobre fondo oscuro |
| Papel | Marfil `#F4F1EA` | Fichas y lectura larga (fondo claro) |
| Línea técnica | Celeste `#7FB3E0` | Trazos del plano, grilla |
| Acento cálido | Ámbar `#F2A541` | Selección, acción principal, foco |
| Semánticos | Verde, amarillo, rojo y blanco de instrumento | **Solo** para arcos de velocidad y estados, siempre con texto |

- La paleta hay que **validarla con un medidor de contraste** al implementarla. Ámbar sobre azul profundo y texto oscuro sobre ámbar deberían superar 4,5:1, pero falta medirlo.
- Tipografía: una sans‑serif legible y abierta (licencia OFL, por ejemplo IBM Plex Sans o Atkinson Hyperlegible) y una monoespaciada con números tabulares para valores (RPM, nudos).
- Fotos grandes **del LV-LLS real**: pendientes de que el aeroclub las aporte. Mientras tanto se usan ilustraciones propias, marcadas como tales.

### 3.8 Tecnología sugerida
- HTML, CSS y JS sin framework, con módulos ES, sin paso de compilación obligatorio, desplegable tal cual en GitHub Pages. Si hace falta empaquetar, se usa Vite con salida estática.
- three.js o model-viewer solo en la fase 3D, con carga diferida.
- `localStorage` para guardar el progreso del juego. No hay cuentas ni servidor.

---

## 4. Huecos que afectan el diseño
- **No hay fotos del LV-LLS** (exterior, cabina, panel). Son indispensables para «fotos grandes» y para el explorador de cabina. Ver [FUENTES_LV-LLS.md](FUENTES_LV-LLS.md).
- ~~No hay descripción de sistemas~~ → **resuelto en buena parte** con el *Cherokee 140 Owner's Handbook* de Piper, que es genérico y no específico del LV-LLS. Falta el circuito pitot-estático y que el mecánico o el instructor validen los diagramas para el LV-LLS.
- **Nuevo «sello» de procedencia:** `PA-28-140 genérico (Piper)`, para los datos del Handbook que no figuran en el Manual del LV-LLS. Se suma a los cuatro de la §2.5.
- **No se conoce la aviónica actual instalada.** La lista de equipos del Manual es de 1974.

## 5. Implementación y nueva consulta — 18/11/2026

Esta sección actualiza el alcance inicial: la investigación anterior se conserva como antecedente; a partir de aquí se implementa la app en `docs/`.

Fuentes consultadas nuevamente antes de programar:
- Apple, [Design principles](https://developer.apple.com/design/human-interface-guidelines/design-principles.md), revisión de junio de 2026: libertad de exploración, jerarquía y contexto persistente. Aplicación: navegación estable, retorno del navegador y fichas enlazables.
- [Material navigation bar](https://m3.material.io/components/navigation-bar/guidelines): página localizada; la extracción actual exige JavaScript. Se conservan los principios de la investigación previa, sin afirmar una nueva lectura completa.
- [web.dev responsive basics](https://web.dev/articles/responsive-web-design-basics) y [Learn Design](https://web.dev/learn/design): reorganizar el contenido, no ocultarlo; viewport sin bloquear zoom.
- [MDN SVG](https://developer.mozilla.org/en-US/docs/Web/SVG): tecnología elegida, vectorial y accesible mediante DOM; no se necesita WebGL para esta primera versión.
- Three.js: el enlace histórico responsive.html devuelve 404 y la portada del manual carga por JavaScript. No se incorporará una dependencia 3D ni se afirmará validación técnica de ese enlace.
- [Airfoil, Bartosz Ciechanowski](https://ciechanow.ski/airfoil/): variables acotadas y efecto visible, sin copiar sus gráficos ni código.
- [NASA Eyes](https://science.nasa.gov/eyes/): exploración centrada en objetos, con contexto explicativo.
- [Piper Design Center](https://salesandservice.piper.com/design-center/): separación exterior/interior y avión protagonista. No se transfieren especificaciones del Archer al Cherokee 140 ni sus fotos.
- [FAA PHAK](https://www.faa.gov/regulations_policies/handbooks_manuals/aviation/phak): capítulos 4–8 como referencia general de aerodinámica, controles, sistemas e instrumentos.

Decisiones finales: HTML/CSS/JS estáticos sin dependencias de producción; cinco destinos (Avión incluye Sistemas), panel lateral en escritorio y ficha debajo en móvil. Ilustraciones SVG originales con pintura y panel esquemáticos, no una reproducción certificada del LV-LLS. Los enlaces usan hash y los recursos rutas relativas para GitHub Pages. Las listas preservan el texto extraído y enlazan el PDF original para resolver formato/ortografía. No se convertirán en una checklist operativa interactiva. Los desafíos de emergencias preguntan por sistemas, no entrenan secuencias inventadas. Movimiento reducible y pausable; fuentes visibles por ficha; no se publican datos personales de planes de vuelo.

La simulación aerodinámica será cualitativa, sin velocidades de pérdida ni ángulo crítico atribuidos al LV-LLS. No se dibuja un cableado certificado: los diagramas son relaciones funcionales. Para futuro 3D: el renderer recibe identificadores de partes y emite selección; el contenido y la lista accesible permanecen independientes.

### Cambio de prioridad solicitado durante la implementación
El usuario aclaró que el centro de la experiencia debe ser un modelo 3D explorable con sistemas internos, similar en intención a la vista de inspección de War Thunder, más combustión y animaciones. Se prioriza **Three.js con geometría procedural original**, sin copiar assets de ese juego. El 2D pasa a ser alternativa accesible. Modelo de baja complejidad con selección por Raycaster, OrbitControls, presets de cámara, modo rayos X y capas de sistemas; recursos locales para no depender de CDN. Referencia técnica efectivamente leída: documentación oficial del tag r180 de [Raycaster](https://github.com/mrdoob/three.js/blob/r180/docs/api/en/core/Raycaster.html) y [OrbitControls](https://github.com/mrdoob/three.js/blob/r180/docs/examples/en/controls/OrbitControls.html). Se fija three 0.180.0, licencia MIT copiada en vendor. Render bajo demanda en reposo, animación explícita y desmontaje de recursos al cambiar de sección. El modelo se etiqueta como esquemático, con cañerías indicativas, no digital twin ni réplica de la instalación del LV-LLS.

## Revisión aplicada — 19/11/2026

Se revisó la ampliación del usuario (cabina, instrumentos, aerodinámica, sistemas y datos). Se conserva la arquitectura estática y la identidad del hangar. La navegación implementada tiene seis destinos, incluida Cabina.

Fuentes técnicas adicionales consultadas (HTTP 200 y contenido revisado):
- [MDN: setPointerCapture](https://developer.mozilla.org/en-US/docs/Web/API/Element/setPointerCapture): mantener gestos sobre perillas/volante y manejar su cancelación.
- [MDN: AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController): limpieza agrupada de eventos al desmontar una vista.
- [Three.js r180: CanvasTexture](https://github.com/mrdoob/three.js/blob/r180/docs/api/en/textures/CanvasTexture.html): textura de canvas actualizable; mismo SVG para panel accesible y representación 3D, sin duplicar simulaciones ni usar fotos de terceros.

Decisiones aplicadas:
1. **Una cabina, un estado.** Los cambios en llaves/perillas 3D llegan al mismo estado que los controles HTML. Instrumentos del panel y su textura comparten valores. La textura se rasteriza como máximo unas ocho veces por segundo para limitar trabajo; cámara y mandos se renderizan por separado.
2. **Lectura antes que miniaturización.** Regiones de acercamiento del panel; ampliación modal del instrumento en celular con cierre, foco y Escape nativos. Controles equivalentes HTML para el canvas.
3. **Respuestas honestas.** Las observaciones son una selección didáctica; no se presentan como texto original completo ni certifican chequeos. Cada etapa enlaza el documento literal conservado.
4. **Fuentes y fidelidad separadas.** Disposición, pintura, geometría de cabina, paisaje y equipos son ilustrativos. Datos documentales heredados no equivalen a validar el equipamiento actual. `cockpit-layout.js` mantiene explícitos los pendientes.
5. **Viento con magnitudes comprensibles.** Corriente vertical, ráfaga suave y ángulo efectivo; fuerza en N. Modelo cuasiestacionario, pérdida cualitativa y perfil genérico rotulados, sin presentarlos como CFD validado del Cherokee.
6. **Control del movimiento.** Pausa de sistemas/cabina, movimiento reducido, suspensión en pestaña oculta y liberación de entradas al perder foco.
7. **Tamaño pequeño real.** Revisión a 320 y 390 px; corregido ancho mínimo del escenario aerodinámico y superposición de etiquetas; fuentes de controles aumentadas.

No se descargaron modelos o fotografías de terceros para esta revisión. Cabina, paisaje y recursos gráficos nuevos son originales y provisionales. No se verificaron Core Web Vitals de campo ni se afirma fidelidad de entrenamiento.
