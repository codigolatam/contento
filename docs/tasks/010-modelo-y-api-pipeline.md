# Modelo y API del pipeline editorial

## Estado

[ ] Pendiente

## Tipo

desarrollo

## Objetivo

El cimiento del pipeline, solo servidor: la resolución del actor
—sesión o clave de API hacia workspace— que hoy no existe, el
montaje de rutas de dominio sobre la base de datos, el modelo de
piezas, los documentos `recurso` y sus enlaces, y la primera
puerta humana. Toda superficie posterior consume esta API.

## Dependencias

- Ninguna de tareas: la resolución de actor usa `session`,
  `member` y `apikey` de la fundación.

## Entrada

- Esquema drizzle actual (`src/server/schema.ts`) con `event`,
  `member`, `session`, `apikey`.
- La propuesta, sección Solución: estados, primera puerta,
  recursos, permisos.
- `recordEvent`/`listEvents` de `events.ts` a nivel base de
  datos; `createApp` sin acceso a DB hoy.

## Resultado esperado

- Resolución de actor: un middleware o utilidad compartida que
  identifica al actor —persona por sesión o agente por clave de
  API— y el workspace al que se aplica la petición; todas las
  rutas de dominio se montan sobre ella.
- Modelo: `pieza` (workspace, estado, tema, pregunta del lector,
  ángulo, campos congelados), `documento` (workspace, tipo,
  título, cuerpo, enlace, congelado) y el enlace pieza↔recurso.
  El enum de estados incluye `descartada` desde el principio
  aunque aún sea inalcanzable.
- API: crear pieza (nace en `propuesta`), editar campos antes de
  congelar, crear recurso, ligar, desligar y borrar, y la
  transición `aprobar` —que verifica los cuatro requisitos,
  enumera los faltantes, congela los campos y registra el evento
  con el actor—.
- El alta de la pieza y cada transición registran su evento con
  el actor.
- Permisos en el servidor: `aprobar` exige actor de sesión
  (cualquier miembro; `403` a clave de API); desligar o borrar
  recursos de una pieza aprobada también. Ligar sigue libre tras
  la puerta; todo lo demás lo puede hacer el agente.
- Endpoints de lectura que la interfaz necesitará: listado de
  piezas con su madurez `n/4` calculada en el servidor y detalle
  de pieza con sus recursos.

## Criterios de calidad

- La puerta enumera los requisitos faltantes.
- Los campos congelados rechazan escritura por API.
- Cada `403` de clave de API —aprobar y quitar soporte de pieza
  aprobada— queda cubierto en la suite.
- La madurez `n/4` la calcula el servidor.

## Procedimiento sugerido

1. Resolución de actor (sesión/clave → workspace) y montaje de
   rutas de dominio con acceso a la base de datos.
2. Esquema y migración de `pieza`, `documento` y el enlace.
3. API de piezas, recursos y enlaces con la frontera sesión/clave
   y el registro del evento de aprobación.
4. Suite: la puerta completa, los `403`, la congelación y el
   `n/4` servido.

## Notas

- La entidad `documento` nace aquí; la propuesta 003 la expande
  con versionado —declararlo en el diseño de la tabla evita
  duplicarla después.
- La resolución del workspace para una persona en sesión usa el
  mecanismo que el servidor ya ofrece (`activeOrganizationId` o
  equivalente); fijar la elección en el plan técnico de la tarea.

## Revisión

- Subagente: [fecha] — [Aprueba | Solicita cambios]
- Usuario (ejecución): [fecha] — [Aprueba | Solicita cambios]
- Usuario (cierre): [fecha] — [Aprueba | Solicita cambios]
