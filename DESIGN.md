# Guía de estilo — Contento

Contrato verificable de la aplicación en dos mitades —visual y de comportamiento. Todo valor visual en el código debe referenciar los tokens declarados aquí —un literal fuera de la declaración de tokens es deriva— y toda interacción debe cumplir las garantías del contrato de experiencia. Además del contrato, la guía documenta los principios que arbitran las decisiones y la razón de cada regla en dos dimensiones —qué protege en la interfaz y qué cambia en la experiencia del usuario—: es el porqué de la forma visual, para que una superficie nueva se diseñe con criterio sin recurrir al código.

## Principios

- **La pieza es el centro.** Consecuencia: el chrome —barras, navegación, encabezado— se retira hasta lo mínimo y las superficies de trabajo reciben el espacio y el contraste plenos. En experiencia: el usuario trabaja sobre sus piezas sin que la interfaz compita por su atención.
- **Registro sobre adorno.** Consecuencia: la separación la hacen fondos y bordes, nunca sombras ni gradientes; la estética de libro mayor combina con un producto cuyo valor es el registro de cada cambio. En experiencia: la interfaz transmite la seriedad de un archivo, no la de una app de consumo.
- **Denso pero sereno.** Consecuencia: un back office muestra mucha información por pantalla, con ritmo de espaciado constante para que la densidad no se vuelva ruido. En experiencia: el usuario escanea listas y tableros sin fatiga.

## Atmósfera

Sobria y documental: papel, tinta y reglas. Densa en las superficies de trabajo, generosa en el aire que separa las regiones.

## Color

| Token                | Valor     | Rol                                          |
| -------------------- | --------- | -------------------------------------------- |
| `--color-background` | `#faf9f7` | fondo de página — papel cálido               |
| `--color-surface`    | `#ffffff` | regiones elevadas y campos                   |
| `--color-text`       | `#1f1d1a` | texto principal — tinta (~16:1, AAA)         |
| `--color-text-muted` | `#6f6a63` | metadatos, etiquetas y texto secundario      |
| `--color-accent`     | `#1f4e79` | acción primaria, enlace activo y foco (~9:1) |
| `--color-accent-strong` | `#173a5c` | acción primaria en hover —tinta más cargada (~12:1) |
| `--color-danger`     | `#a62639` | destrucción y errores                        |
| `--color-border`     | `#e3dfd9` | separadores y reglas                         |
| `--color-border-field` | `#8f887d` | frontera de campos interactivos (~3.4:1 sobre `--color-surface`) |

Reglas de combinación: el acento solo en acciones primarias, en el ítem de navegación activo y en el anillo de foco —nunca como fondo de texto ni en decoración—. En interfaz, un solo color de acción mantiene la señal inequívoca; en experiencia, el usuario aprende que lo azul es lo activo y encuentra la acción sin leer etiquetas. El acento es frío a propósito: no se confunde con el rojo de peligro. Texto siempre sobre `--color-background` o `--color-surface` —el par de mayor contraste disponible: lectura prolongada sin esfuerzo—, con una excepción: el texto de la acción primaria va en `--color-surface` sobre `--color-accent` —es el único texto sobre acento del producto, y su contraste (~9:1) sigue siendo AAA—. La regla `--color-border` separa regiones pasivas —donde basta una línea fina—; la frontera de un componente interactivo usa `--color-border-field` a ≥3:1 sobre su fondo —declara dónde se escribe: es información, no ornamento, y la celda del libro mayor se ve—.

## Tipografía

| Rol      | Familia         | Tamaño | Peso | Altura de línea |
| -------- | --------------- | ------ | ---- | --------------- |
| Título   | `--font-sans`   | 20px   | 600  | 1.3             |
| Cuerpo   | `--font-sans`   | 15px   | 400  | 1.5             |
| Etiqueta | `--font-sans`   | 14px   | 500  | 1.4             |
| Datos    | `--font-mono`   | 13px   | 400  | 1.4             |

`--font-sans` es la pila del sistema (`system-ui` y equivalentes); `--font-mono` es `ui-monospace` y equivalentes. Cada rol materializa su tamaño en `--font-size-*`, su peso en `--font-weight-*` y su altura de línea en `--line-height-*`.

Reglas: el chrome usa sans a 14-15px —un back office denso no admite la escala de marketing—; los datos —fechas, identificadores, claves— usan mono para distinguir valor de prosa a primera vista, y la lectura los alinea en columna; una familia serif queda reservada al contenido editorial futuro —la pieza escrita se distinguirá del chrome por su forma de letra—; el tamaño mínimo es 13px —por debajo, las etiquetas dejan de ser legibles en pantallas densas—.

## Espaciado y forma

- Unidad base: 8px en `--space-1` a `--space-4` (8/16/24/32); los espaciados son múltiplos de ella —el ritmo constante hace las superficies densas predecibles: la atención queda en el contenido, no en los huecos—.
- Radio único: `--radius` 4px —un solo radio sobrio elimina la decisión por componente—.
- Sin sombras: la separación la hacen el fondo y el borde —la profundidad no se gasta en jerarquías falsas—; las reglas miden `--border-width` 1px.
- Marca de activo: `--nav-indicator` 3px —grosor de la regla que señala la sección actual, en el borde izquierdo en sidebar y en el inferior en la fila colapsada—.
- Anillo de foco: `--focus-ring` 2px con `--focus-ring-offset` 2px —visible sin invadir el elemento—.
- Regiones fijas: `--header-height` 56px y `--sidebar-width` 200px —dimensiones del chrome que no dependen del contenido: el usuario memoriza dónde vive cada región; 200px bastan para etiquetas de sección de una palabra y devuelven trabajo a la superficie—. La tarjeta de acceso mide `--access-card-width` 360px —45 unidades de base: el ancho de un campo de correo largo más su margen interno; una columna de credenciales no compite con la superficie de trabajo y, bajo el breakpoint, ocupa el ancho disponible menos su padding—.

## Componentes

- **Encabezado**: barra de `--header-height` con el nombre del producto a la izquierda y el espacio del workspace activo a la derecha, separada del contenido por borde inferior —la cabecera es contexto constante: el usuario siempre sabe en qué producto y workspace está—.
- **Barra lateral**: ancho `--sidebar-width`, fondo `--color-background`, borde derecho; ítems de navegación como lista vertical con etiqueta en `--font-sans` 14px, padding `--space-1` horizontal y alto mínimo de 32px —la navegación es la tabla de contenido del producto: vertical, escaneable, con zona de toque suficiente—.
- **Ítem de navegación activo**: texto e indicador en `--color-accent` —la sección actual se reconoce desde la distancia, sin leer—.
- **Superficie de trabajo**: el área de contenido, padding `--space-3`, título en rol Título —cada superficie se identifica por su encabezado: el `h1` nombra el propósito de la superficie, no el producto—.
- **Tarjeta de acceso**: la pantalla fuera del chrome es una tarjeta centrada de `--color-surface` con borde `--color-border`, radio `--radius`, padding `--space-3` y ancho `--access-card-width` sobre el fondo de página —sin navegación ni encabezado, la tarjeta es la única región: concentra las credenciales y nada más—; su encabezado nombra el propósito —«Entrar», «Crear cuenta»— y el nombre del producto aparece como marca en rol Etiqueta sobre el encabezado, no como encabezado —la marca contextualiza, no ocupa el título—.
- **Campo de formulario**: etiqueta en rol Etiqueta sobre una caja de `--color-surface` con borde `--color-border-field`, radio `--radius`, padding `--space-1` y texto en rol Cuerpo —el campo es una celda del libro mayor: registra un dato sin adorno—.
- **Acción primaria**: botón relleno de `--color-accent` con texto `--color-surface`, borde `--border-width` del mismo acento, radio `--radius`, padding `--space-1` vertical y `--space-2` horizontal, en rol Etiqueta —la acción principal de cada pantalla se reconoce sin leer—; en hover el fondo pasa a `--color-accent-strong` —la confirmación se percibe como tinta más cargada, sin mover contenido—.
- **Acción secundaria**: texto en `--color-text-muted` en rol Etiqueta, sin fondo ni borde —la alternativa a la acción principal vive apagada—; en hover pasa a `--color-accent` —la intención se confirma sin competir con la primaria—.
- **Mensaje de error**: texto en `--color-danger` en rol Etiqueta bajo los campos del formulario que lo produjo y asociado a ellos, anunciado de nuevo en cada envío —el error es parte del registro: se lee donde ocurre, sin modales ni alarmas, y un reenvío con el mismo resultado no se silencia—.

## Estados

- **Foco:** anillo de 2px en `--color-accent` con offset en todo elemento interactivo —el usuario de teclado siempre sabe dónde está—.
- **Activo (navegación):** ítem con texto e indicador en `--color-accent` —la sección actual es un estado persistente que debe verse desde la distancia—.
- **Hover (navegación):** fondo `--color-surface` sobre el ítem —confirma la intención sin mover contenido—.
- **En curso:** durante el trabajo asíncrono la acción se deshabilita —fondo `--color-surface`, texto `--color-text-muted`, borde `--color-border`— y su etiqueta declara el proceso («Entrando…») —el feedback no espera a la red: el botón mismo informa de que el gesto se recibió y se está cumpliendo—.
- **Vacío** (pendiente de implementación): cuando una lista, tablero o superficie de trabajo no tiene elementos que mostrar, lo declara con un texto breve en `--color-text-muted` —el estado vacío orienta la salida en lugar de declarar la ausencia—.

## Layout

- Tres regiones: encabezado a todo lo ancho, barra lateral bajo él a la izquierda y área de contenido a la derecha —la cabecera da contexto global, la lateral da la tabla de contenidos, el área da el trabajo—.
- Por debajo de 769px de viewport —768px o menos, el borde convencional de tablet en vertical— la barra lateral colapsa a una fila de navegación horizontal bajo el encabezado —las secciones son pocas y nombradas con una palabra: caben en una fila sin menú hamburguesa, y el contenido recupera todo el ancho—; la marca del ítem activo pasa del borde izquierdo al inferior —misma regla, otra orientación—. El breakpoint es un literal de media query: las custom properties no aplican ahí.
- El espacio del workspace activo vive en el encabezado a la derecha —es contexto de sesión, no de superficie—.

## Movimiento

Sin animación. Las transiciones de estado (color, fondo, borde) duran como máximo 150ms —confirman el gesto sin convertirse en espectáculo—.

## Contrato de experiencia

Las garantías de comportamiento que cruzan toda la interfaz. Cada una declara qué garantiza y cómo se comprueba; la experiencia de un componente concreto vive en la razón de ese componente.

- **El sistema confirma cada gesto:** toda interacción produce feedback perceptible en ≤150ms, y el trabajo asíncrono declara su curso deshabilitando la acción y nombrando el proceso en su etiqueta. Comprobable: la duración de las transiciones en el CSS y el estado en curso de las acciones.
- **El teclado recorre todo lo interactivo:** todo elemento interactivo recibe foco visible, en el orden de lectura. Comprobable: recorrer la app con Tab.
- **La ubicación siempre es visible:** la sección actual y el workspace activo se ven en todo momento. Comprobable: el ítem activo de la navegación y el espacio del encabezado están presentes en cada pantalla.
- **Toda ubicación con propósito propio tiene URL:** las pantallas con propósito distinto son rutas, no estado local —se enlazan, se recargan y el botón Atrás las recorre—. Comprobable: entrar y crear cuenta tienen rutas propias.
- **La pantalla declara su región principal:** toda pantalla vive en `<main>`, dentro o fuera del chrome —quien navega por landmarks encuentra el contenido—. Comprobable: un landmark por pantalla.

## Orientación para decisiones nuevas

Para un componente o pantalla que la guía aún no describe:

1. **Identifica el rol:** contenido, acción primaria, acción secundaria o acción destructiva. El rol determina el tratamiento: el primario lleva acento, el secundario vive apagado, el destructivo usa `--color-danger`.
2. **Todo valor desde los tokens:** ningún literal; si falta un token, la decisión es de la guía, no del componente —se eleva como laguna—.
3. **Estados obligatorios:** foco con anillo, hover con confirmación, activo distinguible desde la distancia.
4. **Densidad desde la unidad:** espaciado en múltiplos de 8px; separación por borde, no por sombra.
5. **Arbitra con los principios:** si la duda es estética, el principio decide —p. ej. una sombra para «elevar» una tarjeta contradice «registro sobre adorno»—.
6. **Declara el impacto en la experiencia:** la razón que entre en la guía dice qué cambia para el usuario —percepción, acción, error, aprendizaje o accesibilidad—, no solo qué protege en la interfaz.

## Anti-patrones

Prohibido:

- Valores literales de color, tamaño, espaciado, radio o sombra fuera de la declaración de tokens. Los literales estructurales —`0` de reset y posición, porcentajes de ancho, `auto`/`none`, `flex: 1`, el breakpoint de media query— no son valores de estilo y no requieren token.
- Sombras, gradientes y píldoras.
- Iconos emoji como ilustración o como única indicación de una acción.
- El estilo de foco por defecto del navegador sin personalizar.
- Prosa explicativa en la interfaz.
