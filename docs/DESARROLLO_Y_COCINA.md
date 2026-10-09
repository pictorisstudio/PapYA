# Rutas, controles de desarrollo y Cocina

Actualización: 9 de octubre de 2026.

## Estado coherente de las rutas

El mapa conservaba las etiquetas con las que se creó y la tarjeta consultaba el guardado al abrirse. Una modificación mediante los controles de desarrollo podía dejar el mapa con una etiqueta desactualizada. Ahora ambos consultan `routeInfo` y la tarjeta calcula título, candado y difuminado juntos a partir del estado actual. Los comandos de desbloqueo de desarrollo emiten `debug:progress-changed`; el mapa se reconstruye con el nuevo progreso.

## Interruptor de desarrollo

Solo con `npm run dev` aparece **DEV: mostrar controles** arriba a la derecha. Los controles empiezan ocultos. El botón muestra u oculta el panel global, los controles específicos de cada minijuego, las guías y el acceso a práctica. La preferencia dura durante la sesión y no se guarda en el dispositivo.

La compilación con `npm run build` usa `import.meta.env.DEV=false`; no muestra el interruptor ni las herramientas. La escena de práctica también rechaza entrar en producción.

## Borrado protegido y descartable

El botón **BORRAR**, dentro del panel global de desarrollo, abre una confirmación. No borra nada al abrirla. Hay que escribir exactamente `BORRAR` y pulsar **Borrar todo el progreso**. Cancelar, Escape o Atrás cierran sin borrar. La escena se pausa mientras el diálogo está abierto.

Solo reinicia el guardado de PapYá: rutas, viajes, récords y puntajes propios. También descarta el viaje actual y regresa al menú. No usa `localStorage.clear()` ni elimina datos de otras aplicaciones.

La función está aislada en `src/dev/resetProgress.ts`, con su propia comprobación de desarrollo. `DebugPanel` solo la importa dentro de `if (import.meta.env.DEV)`. El build de producción no incluye ese módulo ni el texto de confirmación; se comprobó el resultado generado en `dist`.

Para retirarla definitivamente, eliminar `src/dev/resetProgress.ts` y el botón BORRAR con su import dinámico en `src/components/DebugPanel.ts`. No hace falta modificar guardado ni mecánicas.

## Temperatura continua

Durante la preparación el fuego permanece apagado, la temperatura no cambia y los controles y barras están ocultos. Al completar la receta se enciende el fuego, aparecen los controles y Cocina empieza calentando desde 35 %. Sube o baja a 10 puntos porcentuales por segundo; **−** cambia a descenso y **+** a ascenso, sin cambiar la temperatura instantáneamente. La barra muestra ↑ o ↓. La temperatura se limita a 0–100 %.

La cocción avanza solo entre 40 y 70 %. Por debajo se detiene; por encima se detiene y aumenta el quemado. Mantener la temperatura ideal permite completar en unos 8 segundos de cocción. No intervenir deja la cocción incompleta y termina quemando el plato. El reloj total sigue siendo de 30 segundos, incluyendo la preparación.

Velocidad y zonas se ajustan en `src/minigames/cocina/config/cocinaConfig.ts`. La integración usa pasos cortos para conservar el comportamiento con distintos tiempos de cuadro.

## Validación

21 pruebas automatizadas aprobadas, incluyendo estado actualizado de tarjetas, herramientas apagadas, guardia de producción del borrado, temperatura continua y partida sin intervención frente a control activo. Tipos y compilación aprobados.

Se probó el diálogo y su cancelación, texto incorrecto y borrado completo con `tests/dev-review.html`: este fixture usa exclusivamente memoria de la página y no toca el guardado real del dispositivo. Sirve también para probar dos rutas abiertas y verificar que no tengan candado. Recargar restaura los datos ficticios.

La comodidad y dificultad de Cocina, el teclado del diálogo y Atrás aún requieren validación en un teléfono Android. El fixture HTML es solo para desarrollo y no forma parte de `dist`.
