# Abrir la aplicación

Abre la dirección de Contento en tu navegador. Verás la página de inicio, con el nombre del producto como título principal.

Si la página no existe, aparece un mensaje de error de página no encontrada en texto plano. Es normal si escribiste mal la dirección. Si la aplicación debería estar disponible y no lo está, pide a quien opera el servicio que lo revise.

Las cuentas y los espacios de trabajo todavía no están disponibles. Cuando lleguen, esta página explicará cómo crear tu cuenta.

## Verificación automática

Esta página describe comportamientos que la suite de pruebas comprueba en cada cambio:

- La página de inicio muestra el nombre del producto como encabezado principal. (`App.test.tsx`: «renders the product name as the top-level heading»)
- La aplicación se monta dentro del contenedor de la página. (`main.test.tsx`: «mounts the app inside the #root element»)
- Una ruta inexistente responde con un error de página no encontrada en texto plano. (`app.test.ts`: «returns plain 404 text for unknown routes»)
