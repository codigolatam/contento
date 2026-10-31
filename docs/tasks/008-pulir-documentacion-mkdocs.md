# Pulir la documentación de producto en MkDocs

## Estado

[x] Completada

## Tipo

documentación

## Objetivo

Hacer que la documentación de producto sea útil para quien la lee: en español en toda la interfaz, con el nivel de detalle que corresponde a cada audiencia y sin información interna en las páginas de usuario.

## Dependencias

- Ninguna.

## Entrada

- Revisión visual del sitio MkDocs en `http://127.0.0.1:8000` (`mkdocs serve`), con las páginas de inicio, abrir la aplicación y arrancar el servicio.
- Configuración actual en `mkdocs.yml` y páginas en `product-docs/`.

## Resultado esperado

- La interfaz del sitio está en español: buscador, navegación y pie.
- Las páginas de usuario no muestran nombres de archivos de prueba ni títulos de prueba en inglés.
- Una sección «Para el equipo» reúne la trazabilidad entre documentación y suite de pruebas.

## Criterios de calidad

- `.venv-docs/bin/mkdocs build --strict` termina sin errores ni avisos.
- Ningún control del tema aparece en inglés, incluidos el buscador, «Previous» y «Next», y el pie.
- Ninguna página de la sección de usuario contiene nombres de archivos de prueba (`*.test.*`) ni títulos de prueba.
- Las páginas de «Usar Contento» y de «Operar el servicio» no mezclan términos técnicos sin explicarlos la primera vez.
- Cada página nueva o movida aparece en la navegación de `mkdocs.yml`.

## Procedimiento sugerido

1. Configurar el idioma del buscador y del tema, y comprobar en el navegador que no quedan textos en inglés.
2. Mover la verificación automática de cada página a una página «Para el equipo», con el mismo contenido y enlazada desde la navegación.
3. Revisar cada página de usuario con una lectura de alguien que no conoce el código y simplificar los términos técnicos.
4. Ejecutar `mkdocs build --strict` y revisar de nuevo las páginas en el navegador.

## Notas

- Con `locale: es` y `babel` instalado, el tema carga sus traducciones. La navegación, el buscador y el pie salen en español en todas las páginas.

## Revisión

- Subagente: sin revisión independiente: tarea de documentación, fuera del sub-flujo de desarrollo.
- Usuario (ejecución): 2026-10-30 — Aprueba
- Usuario (cierre): 2026-10-30 — Aprueba
