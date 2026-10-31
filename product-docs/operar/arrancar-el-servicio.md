# Arrancar el servicio

Esta guía es para quien instala y mantiene Contento. Si solo lo usas, ve a [Abrir la aplicación](../usar/abrir-la-aplicacion.md).

## Requisitos

- Node.js 22.22.2 o superior.
- npm, incluido con Node.js.

## Instalar las dependencias

```sh
npm install
```

## Modo desarrollo

```sh
npm run dev
```

Levanta el servidor y la aplicación con recarga automática. La aplicación se abre en `http://localhost:5173`, y las peticiones a `/health` se reenvían al servidor.

## Modo producción

Compila la aplicación antes de arrancar el servidor:

```sh
npm run build
npm start
```

Sin el paso de compilación, el servidor responde a `/health`, pero la página de inicio devuelve un error de página no encontrada.

## Puerto

El servicio escucha en el puerto 3000. Para cambiarlo, define la variable `PORT`:

```sh
PORT=4000 npm start
```

El valor debe ser un número entero entre 1 y 65535. Cualquier otro valor impide el arranque y el servidor muestra el error `Invalid PORT` con el valor recibido.

## Comprobar que el servicio responde

```sh
curl http://localhost:3000/health
```

Si el servicio está en marcha, la respuesta es:

```json
{"status":"ok"}
```

## Seguridad de los archivos

El servidor solo sirve los archivos de la carpeta compilada de la aplicación. Una petición que intente acceder a archivos fuera de esa carpeta recibe un error de página no encontrada, aunque la ruta esté codificada.

## Verificación automática

Esta guía describe comportamientos que la suite de pruebas comprueba en cada cambio:

- El servicio escucha en el puerto 3000 cuando no se define `PORT`. (`server.test.ts`: «listens on port 3000 when PORT is not set»)
- Un valor no válido en `PORT` impide el arranque. (`server.test.ts`: «rejects the invalid port %j»)
- `/health` responde 200 con el estado `ok`. (`app.test.ts`: «returns 200 with an ok status payload»)
- Los archivos fuera de la carpeta compilada no se sirven. (`app.test.ts`: «does not serve files outside the web root for the encoded traversal path %s»)
