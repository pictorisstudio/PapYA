# Etapa 1: base funcional de PapYá

Implementación: 7 de octubre de 2026.

Actualización, 9 de octubre de 2026: transición rápida de 1,5 segundos, sin botón de inicio ni cuenta regresiva. La pausa se mantiene pendiente de la decisión del equipo.

## Comportamiento del viaje

- Antes de cada minijuego aparece una sola instrucción corta durante 1,5 segundos. Después empieza automáticamente, sin botón ni cuenta regresiva. Ese tiempo no consume tiempo del reto.
- Si no se completa un reto, se registra `won: false` y se pasa directamente al siguiente. No se muestra un mensaje de derrota.
- Si se completa, aparece **Ganaste** durante 650 ms. Después continúa el viaje.
- Cada resultado conserva su minijuego, resultado, puntaje propio y métricas. Solo se registra una vez.
- Cada reto completado aporta 100 puntos de viaje; uno no completado aporta 0. El puntaje propio se conserva separado, porque cada minijuego usa una escala distinta.
- Tres retos completados abren una ruta. Cinco representan un viaje perfecto. El progreso se registra una sola vez al terminar la ronda.

## Cambiar los textos

Editar `src/config/texts.ts`. El campo `objective` de cada minijuego contiene la instrucción breve. El archivo también contiene nombres, botones, contadores y mensajes provisionales relacionados con Boyacá.

La duración de la instrucción se cambia en `MINIGAME_INSTRUCTION_DURATION_MS` y la del mensaje de victoria en `WIN_MESSAGE_DURATION_MS`, en `src/config/constants.ts`. Las reglas de cada reto siguen en su configuración respectiva; si cambian las reglas, actualizar también las instrucciones.

## Correcciones realizadas

- Capas comunes para fondo, mundo, HUD, mensajes, depuración y overlays. El tablero de Tejo y el fondo de Cocina ya no tapan el HUD; el fuego queda delante de la base y detrás de la olla.
- Tejo permite alcanzar las cuatro mechas con arrastres dentro del canvas. La guía coincide con la trayectoria y el punto final. La victoria depende de llegar a 10 puntos.
- Cocina y Tejo respetan el dedo que inició el gesto. Soltar otro dedo no suelta un ingrediente ni lanza el tejo. Una pausa cancela un gesto incompleto.
- Cocuy comprueba la victoria después de los efectos de los obstáculos del mismo cuadro.
- Pausa común por botón, Escape, cambio de pestaña/suspensión y eventos de Android. La reanudación es voluntaria y los relojes quedan detenidos. Ruana pausa también su reloj propio.
- Guardado validado, recuperable ante JSON dañado, valores inválidos o almacenamiento no disponible; migración de la versión anterior y protección ante una versión futura.
- Selector de desarrollo para practicar un reto o los cinco en orden. La práctica no desbloquea rutas ni altera récords. Los controles de depuración se excluyen de la compilación de producción.
- Resultados finales con puntos de viaje y puntajes propios, usando mensajes neutrales de progreso.

## Cómo probar

1. Ejecutar `npm run dev` y abrir la dirección que indica Vite.
2. Usar **Probar minijuegos** para revisar un reto o los cinco en orden.
3. Verificar que la instrucción desaparezca a los 1,5 segundos y el reto comience automáticamente. Pausar y continuar; verificar que el tiempo no transcurra mientras se está en pausa.
4. Usar los controles de desarrollo WIN/LOSE para comprobar ambos desenlaces; también probar los desenlaces mediante el juego real. Estos controles fuerzan el resultado y no sustituyen una prueba de dificultad.
5. Usar **¡A viajar!** para una ronda normal: comprobar resultados y desbloqueo con tres o más retos completados.

Validación automatizada: `npm test` (13 pruebas), `npm run typecheck` y `npm run build`, todos aprobados. Las pruebas cubren guardado, migración, resultados únicos, práctica, cuatro mechas, trayectoria, gestos, pausa de Ruana, colisión final de Cocuy y salida inmediata/breve por resultado. Se inspeccionaron en navegador instrucciones, inicio, HUD y pausa.

## Pendiente de validación y siguiente etapa

El enlace de eventos nativos Android quedó implementado, pero no se compiló ni ejecutó un APK. Verificar en un teléfono el botón Atrás, cambiar de aplicación, multitoque y reanudación. Las pruebas automatizadas usan sustitutos de renderizado; no certifican rendimiento ni dificultad en un dispositivo.

Vite conserva el aviso de bundle grande (~1,48 MB sin comprimir); la compilación funciona. La optimización de carga sigue en la etapa correspondiente de la hoja de ruta.

La siguiente etapa es integrar los seis sprites existentes de papa, establecer el estándar visual del primer minijuego y pulir su feedback. Los PNG y el archivo Piskel se conservaron sin cambios.
