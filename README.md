# Contento

*El backoffice editorial donde trabajan personas y agentes.*

Contento gestiona el **trabajo** de producir contenido: planificar, encuadrar, redactar, revisar y medir las piezas. No publica ni sirve al lector — exporta el resultado terminado a tu canal: un blog en Astro, un CMS cualquiera.

Su diferencia estructural: está diseñado para que el trabajo lo ejecuten **agentes**, no solo humanos. El servidor MCP es el contrato programático oficial del producto, no una integración secundaria.

> **Estado:** fase fundacional. Este repositorio aún no contiene código.

## Características

- **Pipeline editorial:** `idea → lista → en redacción → en revisión → publicado`, en kanban interactivo y configurable por workspace.
- **Puertas reales:** promover una idea exige sus requisitos verificables; aprobar el brief y la revisión son confirmaciones humanas explícitas.
- **Calendario editorial** con fechas objetivo por pieza y drag & drop.
- **Story budget:** la vista de «qué viene» — en redacción, en revisión, próximas.
- **Briefs pegados a cada pieza** con audiencia, promesa, alcance, investigación y checklist de publicación.
- **Series** como arcos editoriales, con su marco propio y progreso por capítulo.
- **Comentarios y sugerencias anclados** al borrador, con informes de revisión como entidad propia.
- **Roles y asignaciones** por workspace, con responsable y deadline por pieza.
- **Notificaciones** por cambio de estado.
- **Analítica de etapa:** tiempo por estado, velocidad de producción y audit log consultable.
- **Mantenimiento de publicados:** revisión de vigencia programada y alertas de contenido que envejece.

## MCP: agentes de primera clase

El servidor MCP expone todo lo que el gestor editorial permite hacer:

- **Resources:** piezas, series, briefs, borradores, informes, guía de estilo, estados y métricas.
- **Tools:** capturar pieza, promover, mover estado, crear y aprobar brief, registrar informe de revisión, exportar — y las puertas, que exigen aprobación humana por diseño.
- **Gobernanza:** identidad por agente (claves propias, no cuentas compartidas), scopes por operación y audit log por evento.

El agente redacta y revisa *dentro* de Contento, con la guía de estilo del workspace disponible como resource.

## Markdown nativo

- **Editor Markdown** como corazón de la producción, con versiones y vista previa.
- **Exportación por destino:** genera el `.md` que la colección del destino espera — frontmatter según su perfil, cuerpo intacto.
- **Exportación total:** todas las entidades son exportables a Markdown; la portabilidad es requisito, no cortesía.
- **Fase 2:** Contento abre el PR directamente en el repo del destino.

## Qué no es

- No publica contenido, no genera sitios ni tiene frontend de lectura.
- No es broadcast, rundowns ni print.
- No monetiza contenido (paywalls, suscripciones): eso es territorio del destino.
- No coordina redes sociales: los destinos son salidas de exportación.
