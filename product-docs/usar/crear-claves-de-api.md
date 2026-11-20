# Crear claves de API para agentes

Las claves de API dan identidad propia a un agente dentro de un workspace. Cada clave pertenece a un workspace y lleva sus propios permisos, así que un agente no comparte la cuenta de una persona.

## Crear una clave

El propietario o un administrador del workspace envía una petición `POST` a `/api/auth/api-key/create` con el identificador del workspace y un nombre para la clave:

```sh
curl -X POST http://localhost:3000/api/auth/api-key/create \
  -H "content-type: application/json" \
  -H "cookie: better-auth.session_token=TU_TOKEN" \
  -d '{"organizationId":"ID_DEL_WORKSPACE","name":"agente-redactor"}'
```

El servicio responde con la clave creada; su valor solo se muestra en esa respuesta. Sin sesión o sin `organizationId`, la petición se rechaza. Los roles `autor`, `editor` y `member` no pueden crear claves, y nadie puede crear una clave para un workspace del que no es miembro.

## Listar las claves del workspace

```sh
curl "http://localhost:3000/api/auth/api-key/list?organizationId=ID_DEL_WORKSPACE" \
  -H "cookie: better-auth.session_token=TU_TOKEN"
```

El servicio responde con las claves de ese workspace, no las de otros.

## Eliminar una clave

```sh
curl -X POST http://localhost:3000/api/auth/api-key/delete \
  -H "content-type: application/json" \
  -H "cookie: better-auth.session_token=TU_TOKEN" \
  -d '{"keyId":"ID_DE_LA_CLAVE"}'
```

Una clave eliminada o caducada deja de verificar. Eliminar el workspace también elimina todas sus claves.

## Verificación

La verificación de la clave corre dentro del servicio: no está disponible por HTTP. Es la vía por la que un agente se autenticará —el servidor MCP, aún por llegar, la usará en cada petición.

## Disponibilidad

Estas acciones todavía no tienen pantalla en la aplicación. Por ahora solo están disponibles para quien integra Contento a través de su API.
