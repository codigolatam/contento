# Servidor MCP: agentes de primera clase

## Estado

[ ] Borrador

## Problema

Ninguna herramienta de la categoría trata al agente como trabajador
de primera clase: los flujos asumen que quien redacta, investiga y
revisa es una persona con un editor delante. Un agente que quiera
operar el trabajo editorial no tiene contrato programático propio.

Para el primer usuario —un autor cuyos skills ya redactan y revisan—
la consecuencia es que los agentes trabajan por fuera del sistema,
sobre archivos, en lugar de dentro del backoffice.

## Oportunidad

El servidor MCP es el diferencial estructural del producto: el
contrato programático oficial, no una integración más. Con resources
que exponen el dominio y tools que ejecutan las operaciones del
gestor —con las puertas exigiendo aprobación humana por diseño— el
agente redacta y revisa dentro de Contento.

Sobre el mismo proceso Hono, el servidor convive con el dominio sin
adaptadores ni despliegue extra.

## Forma de solución

Capa programática nueva sobre el dominio existente: un servidor MCP
en el mismo proceso de la aplicación, con resources de lectura y
tools de operación, y su modelo de gobernanza.

## Solución

Servidor MCP con el SDK oficial de TypeScript montado en el proceso
Hono. Resources: piezas, series, briefs, borradores, guía de estilo
y estados. Tools: capturar pieza, promover, mover estado, capturar y
desplegar serie, crear y aprobar brief —con las puertas exigiendo
aprobación humana.

Gobernanza: identidad por agente con claves propias (las API keys de
la fundación), scopes por operación, aprobación humana en las
puertas y audit log por evento sobre el registro de la fundación.

## Alternativas consideradas

- Servidor MCP como proceso separado: añade despliegue y
  acoplamiento operativo sin beneficio; el mismo proceso comparte el
  dominio directamente.
- API REST genérica en lugar de MCP: la API existe igualmente como
  transporte, pero no expone las primitivas agente-nativas que hacen
  a MCP el contrato oficial.
- Registrar informes de revisión como tool del MVP: el informe quedó
  fuera del corte; las tools se amplían con esa propuesta.

## Fuera de alcance

- Tools de exportación y registro de informes de revisión (dependen
  de la propuesta de revisión y exportación, fuera del corte).
- Métricas como resource (dependen de la analítica de etapa).
- Clientes concretos: la conversión de los skills locales en
  clientes del MCP es trabajo posterior.

## Investigaciones de apoyo

- Ninguna.

## Borradores

## Revisión

- Usuario: [fecha] — [Aprueba | Solicita cambios | Rechaza]
