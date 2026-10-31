# Workspaces, roles e invitaciones

## Estado

[ ] Pendiente

## Tipo

desarrollo

## Objetivo

Establecer el workspace como frontera de tenant mediante el plugin de organizaciones de better-auth, con los roles autor y editor e invitaciones por correo.

## Dependencias

- 003

## Entrada

- Tarea 003 completada.

## Resultado esperado

- Creación de workspaces por usuarios autenticados.
- Invitación de miembros por correo, con expiración y aceptación.
- Asignación de los roles autor y editor dentro de un workspace.
- Al registrarse, cada usuario recibe un workspace personal con su nombre, del que es propietario y que no puede eliminarse.

## Criterios de calidad

- Un usuario recién registrado tiene exactamente un workspace personal, con su nombre y con él como `owner`. La creación del workspace forma parte del registro: si falla, el registro no se completa.
- El workspace personal no puede eliminarse.
- Los roles autor y editor se definen con control de acceso. Los roles por defecto `owner`, `admin` y `member` administran la organización.
- Una invitación caduca y no se puede aceptar después.
- Un miembro de un workspace no puede leer datos de otro workspace.
- Los permisos de cada rol quedan documentados en el código.

## Procedimiento sugerido

1. Definir los statements y los roles autor y editor con control de acceso.
2. Activar el plugin de organizaciones con esos roles.
3. Crear el workspace personal en el hook de registro de usuarios de better-auth, dentro del mismo registro.
4. Implementar la invitación y su aceptación.
5. Probar el aislamiento entre workspaces, la caducidad de invitaciones y la creación del workspace personal al registrarse.

## Notas

- Lo que cada rol puede hacer sobre piezas y briefs se fija en las propuestas 002 y 003. Aquí solo se definen los roles y sus permisos sobre la organización.

## Revisión

- Subagente: [fecha] — [Aprueba | Solicita cambios]
- Usuario (ejecución): [fecha] — [Aprueba | Solicita cambios]
- Usuario (cierre): [fecha] — [Aprueba | Solicita cambios]
