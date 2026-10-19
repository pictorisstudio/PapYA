# Adaptación móvil vertical

Base lógica 720×1280, Scale.FIT y orientación portrait en AndroidManifest.xml. En una pantalla con otra proporción se conserva el área jugable sin deformar los sprites. Los fondos 128×72 se muestran ampliados a 2275,56×1280 y se recortan horizontalmente; no se altera el archivo original. Podría convenir dibujar fondos verticales para conservar más detalle lateral.

Se reorganizaron menú, mapa en dos columnas, tarjetas, práctica, pausa y exploración. El botón DEV sigue disponible en desarrollo y conserva sus funciones; se recolocó dentro del ancho visible. La receta, objetivos, guardado y progresión de ritmo siguen vigentes.

Las posiciones y zonas de juego usan el espacio vertical: carriles de Ruana, vuelo y origen de Tejo, ingredientes y controles de Cocina, salto de papas y límites de Cocuy. Los indicadores antiguos se ocultan mediante applyHudLayers; GameplaySession dibuja título, tiempo real restante y pausa. Los controles de temperatura permanecen por ser parte de la mecánica; sus barras y textos secundarios se ocultan. El mensaje Ganaste y los mensajes breves de rutas permanecen.

Tejo usa el fondo actualizado sin cancha, con TEJO_ASSETS.cancha separado, bocín y mechas sobrepuestos y alineados con las zonas reales de impacto.

El logo se trasladó a public/assets/branding/logo-gobernacion.png, conservando sus bytes. Es blanco sobre transparencia y se recortan sus márgenes transparentes por frame de textura, sin editar el PNG. Boot carga logo y seis cuadros del cóndor, luego lanza la carga principal en paralelo con el logo: 900 ms de aparición, 1200 ms visible y 900 ms de desaparición. Si la carga sigue activa, Preloader muestra el cóndor sobre negro; no hay texto ni barra de carga. Menú espera tanto la carga como la finalización de los tres segundos.

Validación: 37 pruebas, tipos y build web. Se actualizaron pruebas con coordenadas de la nueva composición, conservando verificaciones de arrastre, cuatro mechas alcanzables, pausa, guardado y ritmo. Nuevas verificaciones de límites de ingredientes y carriles y HUD mínimo. La revisión visual mediante Firefox fue rechazada por aprobación automática; no se sustituyó por otro control de UI. Falta validación visual y táctil en navegador móvil y teléfono Android. No se generó un APK.
