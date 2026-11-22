# Revisión funcional y visual — 19/11/2026

Se preservó una copia previa de `docs/` en `tmp/review-baseline-2026-11-19/docs/` antes de editar. No había repositorio Git inicializado en esta carpeta; no se hicieron commits ni publicación.

## Verificación automática

`npm run check` pasa:
- Integridad de 19 fichas, siete sistemas, ocho preguntas, 15 etapas y 14 emergencias; IDs, archivos y fuentes internas.
- Arranque, apagado por mezcla, consumo en tierra, independencia de encendido respecto de batería, descarga de batería en una escala temporal razonable, falla de vacío, bloqueo de estática y pitot sellado.
- Salidas aerodinámicas finitas, límite de velocidad de campo lejano, crecimiento previo a pérdida y disminución de CL en la curva cualitativa posterior.

Todos los módulos de `docs/*.js` pasan `node --check`. No se modificaron los PDF ni los JSON de procedimientos originales.

## Navegador

Brave en macOS, viewport emulado de 1440×1000, 390×844 y 320×812. No se probaron teléfonos físicos ni Safari/iOS.

| Comprobación | Resultado observado |
|---|---|
| Avión 3D / Rayos X | Modelo, etiquetas y capas cargan; conservación del explorador previo. |
| Acceso “Cabina 3D” desde el avión | Navega a `#/cabina/3d` y carga el panel vivo. |
| Llave y perilla sobre el modelo | Bomba eléctrica cambia a ON; al arrastrar acelerador de 76 a 49 %, baja la indicación de RPM. |
| Radio COM | 123.450 MHz introducidos en espera pasan a activa mediante intercambio. |
| Transponder | Entrada 8888 se rechaza con explicación; dígitos válidos son 0–7. No hay transmisión. |
| Instrumentos en móvil | Región de vuelo legible; tocar velocímetro abre modal ampliado con explicación. Cierre devuelve a cabina. |
| Ráfaga | El ángulo efectivo y la fuerza cambian durante el pulso de seis segundos. |
| Ancho mínimo | Se corrigió escenario de aire que excedía el ancho a 320 px. Tras corrección, scrollWidth=305 con viewport=320 (barra de desplazamiento). |
| Siete sistemas | Diagramas visibles a 320 px, sin desborde horizontal; botón pausa cambia al estado “Animar sistema”. |
| Recorrido, emergencias, aprender | Títulos y destinos correctos, sin desborde a 320 px. |
| Consola | Sin errores JavaScript capturados en las vistas probadas. |

Capturas:
- `output/qa/cabina-3d-revision.jpg`
- `output/qa/mobile-instrumento.jpg`
- `output/qa/mobile-viento.jpg`

## Correcciones y límites

- Observaciones del panel ya no conservan una tilde después de desaparecer la condición; no se llaman checklist original completa. Se conserva acceso a texto literal y PDF.
- Se retiró una sugerencia no documentada para despejar exceso de cebado.
- Se separó el estado del avión de la indicación errónea de un giróscopo sin energía: la falla del instrumento no inclina el paisaje 3D.
- START, perillas y volante se liberan al perder foco/cancelar el gesto; se limpian listeners/recursos al abandonar la cabina. La prueba automática no sustituye una auditoría completa de eventos en todos los navegadores.
- Se corrigieron unidades (N), precisión del rótulo de ángulo durante ráfagas y tamaño de tipografía/etiquetas.
- Geometría 3D, paisaje, posiciones de equipos, radios y dinámica son ilustrativos. Sin fotos y validación del equipamiento actual no se puede afirmar que la cabina sea idéntica al LV-LLS.
- El flujo es potencial cuasiestacionario con aproximaciones de ala finita; separación, flaps y pérdida son cualitativos. No es CFD validado ni simulador de entrenamiento.
- La revisión no certifica exactitud de performance, entrenamiento, procedimientos o aeronavegabilidad. No se midieron Core Web Vitals de campo.
