# PRD — Fundación del backoffice y cuentas

Un autor que produce contenido con agentes necesita un espacio donde su trabajo tenga cuentas, workspaces y acceso controlado para agentes. Este conjunto establece esa base antes de que existan las piezas editoriales.

## Usuarios

- El autor que usa Contento.
- Sus colaboradores, con rol autor o editor.
- Sus agentes, cada uno con su propia clave.

## Casos de uso

- **CU-1 — Entrar en la aplicación:** un autor se registra con correo y contraseña y accede después.
  - Borde: las credenciales incorrectas se rechazan sin revelar cuál de los dos datos falla.
- **CU-2 — Crear un workspace adicional:** un usuario autenticado crea un workspace adicional y queda como propietario.
- **CU-3 — Invitar a un colaborador:** un propietario o administrador invita por correo con rol autor o editor.
  - Borde: una invitación caducada no se puede aceptar.
- **CU-4 — Dar acceso a un agente:** un propietario o administrador crea una clave de API para el workspace con sus permisos.
  - Borde: una clave eliminada o caducada deja de funcionar.
- **CU-5 — Empezar con un espacio propio:** al registrarse, el autor recibe un workspace personal con su nombre, del que es propietario.
  - Variante: el workspace personal puede renombrarse, pero no eliminarse.
  - Borde: si la creación del workspace falla, el registro no se completa.

## Comportamiento esperado

- **Cuentas:** registro, acceso y cierre de sesión con correo y contraseña. Cada cuenta nueva recibe su workspace personal.
- **Workspaces y roles:** un miembro no ve datos de otro workspace. El workspace personal se nombra con el nombre de su autor, puede renombrarse y no puede eliminarse. Los roles por defecto administran la organización; autor y editor se definen aparte.
- **Claves de agente:** una clave pertenece a un workspace y solo tiene los permisos que se le concedieron.
- **Navegación:** la aplicación muestra un esqueleto con las secciones pipeline, series y piezas, sin funcionalidad todavía.

## Criterios de éxito

Un autor se registra y ya tiene su workspace personal. Crea o usa un workspace, invita a un editor y deja operar a un agente con su clave, sin que ningún miembro vea datos ajenos.

## Fuera de alcance

- Recuperación de contraseña y verificación de correo.
- El pipeline, las series y las piezas (propuestas 002 y 003).
- El servidor MCP (propuesta 004).
- El registro de eventos como caso de uso: existe como infraestructura, pero ninguna acción de este conjunto lo alimenta. Su primer consumidor es la propuesta 002.
