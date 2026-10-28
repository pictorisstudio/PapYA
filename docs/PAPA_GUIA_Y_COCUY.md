# Papa guía y feedback de Cocuy

## Papa guía

La papa alada del menú abre la ayuda al tocarla o pulsar Cómo jugar. Tiene una página general y una por cada minijuego de la ronda activa. No aparece una introducción obligatoria ni se modifica el progreso al consultar la ayuda. Se cierra con Entendido, ×, Escape, tocar fuera de la tarjeta o Atrás de Android.

Los textos están en `src/config/guideConfig.ts`; el dibujo y la interfaz están separados en `src/components/PapaGuide.ts`. El sprite usa la clave estable `papa-guide` y el archivo `public/assets/ui/guide/papa-guia.png`. Se puede reemplazar ese PNG sin cambiar las mecánicas. La imagen tiene canal alfa real y se conserva su transparencia.

Ajuste del menú: papa guía centrada horizontalmente en (640, 390) y mapa en (950, 270), sin cambiar sus alturas. Corrección de niebla validada con 71 pruebas, tipos y compilación; revisión visual del menú y niebla en navegador sin errores de consola. Capturas: `docs/previews/papa-guia-mapa-derecha.png` y `docs/previews/cocuy-niebla-visible.png`.

## Cocuy

- Las corrientes usan nubes celestes con tres flechas animadas en el sentido del empuje. Las nubes decorativas conservan su baja opacidad. Tocar una nube de niebla activa un velo y nueve nubes semitransparentes durante tres segundos reales, también en rondas aceleradas; el efecto se desvanece al terminar y se adapta al ancho de pantalla. El relleno del velo conserva alfa 1 y su visibilidad se controla con la opacidad del objeto.
- El cóndor se inclina según el movimiento. Al entrar en una corriente aparecen flechas breves junto a él.
- Una roca resta 25 m, desplaza al cóndor hacia abajo, aplica un pequeño retroceso lateral, parpadeo, sonido, un anillo de impacto y un texto flotante de altura perdida. Hay 900 ms de protección para evitar penalizaciones encadenadas.
- Los patrones de viento colocan una roca del lado del empuje y con retraso vertical. Ambos elementos comparten velocidad y el espacio de reacción considera la aceleración de la sesión. Se deja una pausa adicional antes del siguiente grupo y se respeta el máximo de obstáculos.
- No se restaura un panel permanente de altitud ni se añaden instrucciones durante el reto. Los controles siguen siendo mantener pulsado a izquierda o derecha; ahora cada dedo usa la cámara actual para obtener su posición.

## Arte y procedencia

Validación: 70 pruebas aprobadas, revisión de tipos y compilación web. Se comprobaron en navegador el menú, las seis páginas de ayuda, una colisión con retroceso y la animación de corrientes, así como la ayuda a 844×390. Capturas en `docs/previews/papa-guia-cocuy.png`, `papa-guia-movil.png` y `cocuy-corrientes.png`. Falta evaluar la sensación de los nuevos patrones en teléfono real. No se generó APK.

Se generó una imagen nueva con la herramienta integrada image_gen y la habilidad imagegen, sin CLI ni API key. El original se conserva en el directorio de imágenes generadas de Codex y la copia utilizada por el juego está dentro de public. Es un personaje propio con forma de papa, alas y brote, sin copiar un personaje existente.

### Prompt final

Use case: stylized-concept. Asset type: single transparent pixel-art sprite for PapYá, a Colombian Boyacá minigame collection. Primary request: an original tiny friendly fairy companion shaped like a potato, who will give optional instructions. Subject: one warm golden-brown oval potato body, a few potato-eye freckles, large expressive dark eyes with white highlights, a small welcoming smile, two small hands, a little green potato sprout on top, and two pairs of pale turquoise translucent insect-like wings attached behind it. Full character hovering, looking towards the viewer and slightly right. Style: crisp chunky SNES pixel art, consistent visible square pixel grid, limited warm earthy palette, dark plum outline and simple 3-tone shading; readable when shown at 96–180 pixels tall. Composition: single character centered filling 85 percent of a square canvas with clear margins around all wings. Background: actual transparent alpha, no floor, no environment. Constraints: original potato character, not a glowing orb, no clothing or props, no resemblance to any existing game mascot, no text, no logo, no watermark, no blurry glow or smooth illustration. Return a PNG sprite suitable for immediate use in the game.
