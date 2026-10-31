# Claves de API por agente

## Estado

[ ] Pendiente

## Tipo

desarrollo

## Objetivo

Dar identidad propia a cada agente mediante claves de API de better-auth, con permisos por clave y ligadas a un workspace.

## Dependencias

- 004

## Entrada

- Tarea 004 completada.

## Resultado esperado

- Crear, listar, verificar y eliminar claves de API de un workspace.
- Cada clave lleva sus propios permisos.

## Criterios de calidad

- Una clave válida devuelve su workspace y sus permisos.
- Una clave eliminada o caducada no se verifica.
- Un rol sin el permiso `apiKey` no puede crear claves.
- Las claves son de organización, no de usuario.

## Procedimiento sugerido

1. Activar el plugin de API keys con `references: "organization"`.
2. Configurar el permiso `apiKey` en los roles que lo necesiten.
3. Probar creación, verificación, caducidad y eliminación.

## Notas

- El uso de estas claves por el servidor MCP queda para la propuesta 004.

## Revisión

- Subagente: [fecha] — [Aprueba | Solicita cambios]
- Usuario (ejecución): [fecha] — [Aprueba | Solicita cambios]
- Usuario (cierre): [fecha] — [Aprueba | Solicita cambios]
