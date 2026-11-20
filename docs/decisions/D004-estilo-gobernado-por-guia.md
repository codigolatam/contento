# D004: Los valores visuales se gobiernan por la guía de estilo de DESIGN.md

## Estado

Aceptada

## Contexto

La tarea de navegación exigía «ningún valor de estilo literal: colores, tipografía y espaciado salen de variables CSS centralizadas» — pero el proyecto no tenía guía de estilo ni tokens: decidir qué variables existirían era decidir la estética del producto entero. Las alternativas eran:

- **Tokens sueltos sin documento** —un `:root` con valores y nada más—: cumple la letra del criterio pero no su espíritu; los tokens sin razón no enseñan a derivar el estilo de lo que aún no existe.
- **Guía con contrato y razón** —cada regla con su valor verificable y su porqué en dos dimensiones, qué protege en la interfaz y qué cambia en la experiencia—: el documento fundamenta, los tokens materializan, y ambos se revisan juntos.
- **Un framework de utilidades** (Tailwind o similar): velocidad inicial, pero introduce una estética por defecto ajena, otra dependencia que dicta los valores, y desplaza la decisión real —qué paleta, qué densidad— a la configuración de la herramienta.

## Decisión

`DESIGN.md` es la guía de estilo del proyecto: declara la paleta con roles semánticos, la escala tipográfica, el espaciado, los estados y los anti-patrones —cada regla con su razón en dos dimensiones— y se materializa en las custom properties de `:root` en `src/web/theme.css`. Un literal fuera de los tokens es deriva. Se exceptúan los literales estructurales —`0` de reset y posición, porcentajes de ancho, `auto`/`none`, `flex: 1`— y el breakpoint de media query, que no puede ser token porque los `@media` no consumen custom properties —su valor queda declarado en la guía como literal—.

## Justificación

La guía convierte cada decisión estética en un contrato verificable —el validador compara valores, no gustos— y en una decisión heredable: un componente nuevo se diseña con la sección de orientación sin leer el código. Materializar la decisión en tokens hace que cumplirla sea mecánico en lugar de disciplina. La primera aplicación ya mostró su valor: la propuesta se iteró con evidencia renderizada —el indicador redondeado pasó a regla recta, la sidebar de 240px a 200px y el breakpoint de 640px a 768px— y cada cambio quedó con su razón en el documento.

Consecuencias:

- Todo cambio de frontend pasa por la guía: el skill `aplicar-guia-estilo` valida el resultado con evidencia estática y renderizada, y `documentar-guia-estilo` lo mantiene al cerrar tareas con diff visual.
- Las decisiones estéticas nuevas entran por `DESIGN.md` antes que por el código —un token que falta es una laguna de la guía, no una licencia del componente—.
- Guía y tokens deben permanecer sincronizados; una divergencia se reporta como deriva, no se corrige en silencio.

## Referencias

- `DESIGN.md`, `src/web/theme.css`, `src/web/app.css`
- `docs/lessons/diseno-visual.md` (los valores se validan renderizados)
- `docs/tasks/007-navegacion.md`
