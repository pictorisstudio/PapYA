# Horizontal obligatorio

- Android ya conserva `android:screenOrientation="landscape"` en `android/app/src/main/AndroidManifest.xml`.
- La web solicita `screen.orientation.lock('landscape')` al iniciar, al interactuar y al entrar en pantalla completa. El rechazo o ausencia de esta API no genera un error.
- Si el viewport es vertical, CSS oculta el juego desde la carga inicial y muestra «Gira tu celular». El contenedor queda inerte y la entrada Phaser se deshabilita.
- El guard detiene Game y solicita la pausa habitual del minijuego. Pausa inmediatamente la escena antes de detener Game para congelar también el reloj de Ruana basado en `performance.now`. Al volver a horizontal se mantiene la pantalla de pausa para continuar voluntariamente. No se pierde tiempo ni se altera el progreso.
- La web depende de las restricciones del navegador para rotar físicamente la pantalla; el respaldo obligatorio impide jugar en vertical aunque el navegador rechace el bloqueo.

Validación: 75 pruebas, tipos y compilación aprobadas. Navegador a 390×844 muestra solo el aviso; a 844×390 vuelve el juego. Se giró durante Ruana y se confirmó que el tiempo conservaba 14 segundos al regresar, con la pausa activa y sin errores de consola. Captura: `docs/previews/horizontal-obligatorio.png`. No se generó APK ni se probó en teléfono físico.
