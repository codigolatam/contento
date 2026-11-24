# D005: Documentos con tipo que gobierna su ciclo

## Estado

Aceptada

## Contexto

La propuesta 002 introduce el `documento` del workspace —hoy en
dos funciones: `recurso` (material de soporte compartible) y
`borrador` (el texto de la pieza)— y la propuesta 003 lo
expandirá con versionado. Las alternativas eran una entidad por
concepto (una tabla `recurso`, una tabla `borrador`) o una
entidad única discriminada por tipo.

## Decisión

Usamos una única entidad `documento` que lleva un `tipo`
declarando su función; el tipo gobierna su ciclo de vida: qué
puertas lo congelan, cuándo es editable y cómo se descarta.

## Justificación

El documento comparte workspace, enlaces y mecánica de
congelación entre funciones; un tipo de documento nuevo es un
valor del discriminador con su ciclo, no una tabla nueva. La
propuesta 003 añade versionado sobre la misma entidad sin migrar
nada. A cambio, las reglas de ciclo viven concentradas en el
discriminador: cada tipo nuevo exige declarar allí su
comportamiento.

## Referencias

- `docs/proposals/002-pipeline-editorial/propuesta.md`
- `docs/epics/002-pipeline-editorial.md`
