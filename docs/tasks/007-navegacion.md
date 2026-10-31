# Esqueleto de navegación de la aplicación editorial

## Estado

[ ] Pendiente

## Tipo

desarrollo

## Objetivo

Crear el esqueleto de navegación de la aplicación editorial: layout compartido y rutas de marcador donde se montarán las superficies de trabajo de las propuestas 002 y 003.

## Dependencias

- 001

## Entrada

- Tarea 001 completada.

## Resultado esperado

- Un layout con barra lateral y encabezado, con espacio reservado para el workspace activo.
- Rutas de marcador para el pipeline, las series y las piezas, sin funcionalidad.

## Criterios de calidad

- El layout no contiene lógica de dominio.
- Ningún valor de estilo es literal: colores, tipografía y espaciado salen de variables CSS centralizadas.
- Cada ruta de marcador responde con estado 200 y un texto que identifica la superficie.

## Procedimiento sugerido

1. Definir el layout compartido y su estructura de navegación.
2. Crear las rutas de marcador.
3. Centralizar las variables de estilo en un único archivo.

## Notas

- El selector de workspace activo se completa cuando exista la tarea 004.

## Revisión

- Subagente: [fecha] — [Aprueba | Solicita cambios]
- Usuario (ejecución): [fecha] — [Aprueba | Solicita cambios]
- Usuario (cierre): [fecha] — [Aprueba | Solicita cambios]
