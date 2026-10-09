# Mapa y primeros tres puntos de la Etapa 2

Implementación: 9 de octubre de 2026.

## Mapa y tarjetas

Los tres botones inferiores miden 270 × 56, comparten tipografía y están centrados como grupo en x=640, con 26 píxeles de separación. Las cinco rutas también forman una fila centrada, con dimensiones y separaciones uniformes.

Tocar cualquier ruta abre su imagen como tarjeta grande, conservando el estado de desbloqueo. La tarjeta bloquea los controles de debajo. Se cierra con **Volver al mapa**, tocando fuera, con Escape o con el evento de Atrás de Android. Este último requiere validación en un teléfono.

Las rutas que aún no están desbloqueadas (incluida la próxima ruta) muestran una miniatura difuminada y un candado. Su tarjeta grande conserva ese difuminado y un candado central. Las rutas abiertas muestran el arte nítido sin candado. El difuminado se calcula y guarda una vez por imagen durante la sesión.

Las cinco imágenes son paisajes provisionales, no ilustraciones definitivas de lugares específicos. Para cambiarlas:

1. Guardar el arte final en `public/assets/routes/`.
2. Editar únicamente el `path` correspondiente en `ROUTE_CARD_ASSETS`, en `src/config/assets.ts`. Admite PNG, JPG o SVG. Mantener la clave `key`.
3. Recargar el juego. La tarjeta ajusta la imagen a un área de 1000 × 440 sin deformarla ni recortarla. Con esa proporción se aprovecha toda el área; otras proporciones dejan espacio libre.

## Papas: interpretación del arte

Se inspeccionaron los seis PNG y el Piskel. Todos los PNG son de 64 × 64 y tienen transparencia; su contenido visible ocupa entre 44 y 58 píxeles de ancho y entre 53 y 60 de alto. El Piskel contiene una capa y seis cuadros a 9 fps, pero visualmente los diseños cambian de forma, orientación y manchas: son tres diseños buenos y tres podridos, sin una secuencia evidente de movimiento continuo. Por ello se integraron como **variantes estáticas**. No se reproduce una animación que cambie un diseño por otro ni que mezcle buenas y podridas.

El manifiesto `POTATO_ASSETS` en `src/config/assets.ts` asigna una clave estable a cada PNG. `PreloaderScene` carga los seis archivos y las cinco tarjetas antes de entrar al menú; la barra refleja la carga real.

`Potato` elige una de las tres variantes del tipo que recibió. Conserva movimiento, giro visual y feedback existentes. La puntuación sigue en `PotatoScoreManager`, y el tipo, probabilidad y trayectoria siguen en `PotatoSpawnManager`.

## Toque independiente del sprite

- El sprite usa un cuadro de 64 × 64, con la escala de spawn existente de 0,86 a 1,12.
- La hitbox es un círculo de radio 29 antes de escalar: diámetro final aproximado de 50 a 65 píxeles lógicos. Se ajustó al área visible de los PNG, reduciendo la zona anterior de 100 × 90.
- Solo gira el sprite. La zona de toque no rota ni se convierte en un rectángulo envolvente más grande.
- La comprobación usa distancia al centro y escala. No depende de los píxeles transparentes ni del contorno del PNG.
- Si un toque cae dentro de varias zonas, se elige una sola papa: la que se dibuja delante según su profundidad. A igual profundidad, la última creada.
- El control HITBOX de desarrollo muestra el círculo que realmente se usa. Afinar el radio en `PAPA_CONFIG.POTATO_TOUCH_RADIUS` si una prueba en teléfono lo requiere.

## Validación

`npm test`: 15 pruebas aprobadas. Incluye seis archivos con claves únicas, hitbox circular independiente del giro y la escala, y selección por profundidad de papas superpuestas. `npm run typecheck` y `npm run build`: aprobados. Inspección en navegador del mapa, tarjetas, cierre y sprites; sin errores en la consulta de consola.

Los archivos PNG y Piskel originales se conservaron. No se implementó el resto de la Etapa 2, como fondo final, sonido o nuevo feedback; tampoco se verificó la comodidad del toque ni el rendimiento en un dispositivo Android.
