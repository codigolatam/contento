# Kanban del pipeline y ficha de maduración

## Estado

[ ] Pendiente

## Tipo

desarrollo

## Objetivo

La primera superficie con datos de la aplicación: el kanban con
las cuatro columnas y «Nueva pieza», y la ficha que en `propuesta`
es la pantalla de maduración —los tres campos editables, ligar
recursos y el botón «Aprobar» con la enumeración de faltantes—.
Establece el patrón de data-fetching que reutilizarán las vistas
posteriores y declara el workspace activo en la interfaz.

## Dependencias

- 009 (la pantalla de acceso es prerrequisito de toda superficie
  dirigida a personas)
- 010 (la API del pipeline que consume)

## Entrada

- API del pipeline: listado de piezas con `n/4`, detalle con
  recursos, CRUD y la transición `aprobar`.
- Esqueleto de navegación existente y guía de estilo `DESIGN.md`.

## Resultado esperado

- Workspace activo en la interfaz: las vistas saben qué workspace
  muestran —declarado aquí si la tarea 009 no lo deja resuelto—.
- Kanban con las cuatro columnas, acción «Nueva pieza» y tarjetas
  que muestran la madurez `n/4` servida por el servidor.
- Ficha de la pieza: en `propuesta` es la pantalla de maduración
  —los tres campos editables, ligar recursos existentes o
  crearlos inline ya ligados, botón «Aprobar» con la enumeración
  de faltantes—; en `idea aprobada` muestra los campos congelados
  en solo lectura.
- Patrón de data-fetching reutilizable (es el primer fetch de la
  aplicación).

## Criterios de calidad

- La puerta enumera los requisitos faltantes tal como los
  devuelve el servidor.
- Los campos congelados rechazan escritura por UI.
- La interfaz usa solo tokens de la guía de estilo; textos en
  español.

## Procedimiento sugerido

1. Data-layer web: cliente y patrón de fetch/mutación.
2. Kanban con «Nueva pieza» y el `n/4` de las tarjetas.
3. Ficha como pantalla de maduración y su modo congelado.
4. Suite: la pantalla de maduración con la puerta y los
   faltantes.

## Revisión

- Subagente: [fecha] — [Aprueba | Solicita cambios]
- Usuario (ejecución): [fecha] — [Aprueba | Solicita cambios]
- Usuario (cierre): [fecha] — [Aprueba | Solicita cambios]
