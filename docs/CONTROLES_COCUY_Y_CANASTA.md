# Controles del Cocuy y canasta de cosecha

- `CondorControls.ts` añade dos botones de 190×116, con flechas y respuesta de color al mantener pulsado. Usa el sistema de movimiento existente, admite dedos independientes y libera la entrada al salir del botón, soltar, pausar o perder el foco. Se conserva el toque por mitades como alternativa.
- La guía opcional explica los botones. Los controles se dibujan sobre el mundo y la niebla, debajo de la pausa.
- `HarvestBasket.ts` dibuja una canasta provisional y reutiliza las tres variantes de papa buena. Se llena con hasta veinte papas y muestra recogidas/meta y faltantes. Solo cuentan las recogidas buenas validadas por `PotatoScoreManager`; las animaciones no modifican el puntaje.
- La canasta no es interactiva y queda detrás de las papas jugables para no ocultarlas ni bloquear los toques. Cada papa buena produce una animación breve hacia la canasta; se cancelan las animaciones al salir.
- El dibujo y las etiquetas están separados de la lógica de spawn y puntaje, para reemplazar el arte posteriormente.

Validación: tipos, compilación y 73 pruebas aprobadas. En navegador se comprobó movimiento al mantener pulsado el botón izquierdo y una recogida con contador 1/20 y 19 faltantes; sin errores de consola. Capturas en `docs/previews/cocuy-botones-direccion.png` y `docs/previews/papas-canasta.png`. Pendiente probar la comodidad de los controles en un teléfono físico.
