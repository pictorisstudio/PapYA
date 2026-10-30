# Ruana a velocidad original y assets nuevos

La música de Ruana se reproduce a rate 1 en todas las dificultades. Su reloj, temporizadores y animaciones tampoco multiplican el ritmo por la aceleración general de la ronda. Cuando está disponible, RhythmClock consulta el seek del audio para evitar deriva; conserva la posición al pausar y usa su reloj local si no hay audio.

La pista WAV contiene 58,949 segundos de PCM estéreo a 44,1 kHz. Una estimación de ataques por ventanas de 10 ms, autocorrelación y ajuste de fase sobre los primeros 30 segundos dio 140 BPM y un offset aproximado de 176 ms. Estos valores están centralizados en `beatmapPrototype.ts`, para afinarlos tras una prueba auditiva en teléfono. La primera nota deja tiempo para recorrer el carril; el fragmento jugable dura aproximadamente 29,25 segundos sin cambiar la velocidad de la canción. Las cinco dificultades tienen 32, 39, 47, 54 y 62 notas: aumentan contratiempos y acordes, conservando los mismos tiempos musicales base.

Actualización de dificultad: 64, 79, 95, 110 y 126 notas, conservando aproximadamente 29,68 segundos de partida. Cada nota recorre el carril en 1000 ms, antes 1800 ms. Las notas base caen en cada pulso y los contratiempos usan medios pulsos. La canción sigue a rate 1.

Los efectos puntuales admiten instancias simultáneas: un acierto o explosión no bloquea el siguiente. Los sonidos ambientales en bucle conservan una sola instancia. Las pruebas verifican que completar un efecto no corte los otros y que se limpien al salir.

Los tres botones principales del menú comparten 380×138 píxeles visibles y se distribuyen en una fila: viajar, instrucciones y mapa. Los recortes de los PNG eliminan sus diferentes márgenes transparentes sin modificar los originales.

`src/config/uiAssets.ts` registra los botones de instrucciones, continuar y volver al menú, cuatro frames del hada y tres costales. Los botones usan frames recortados por sus márgenes transparentes, sin editar los PNG. El hada usa sus cuatro frames a 6 FPS y conserva la levitación vertical. La ayuda muestra la nueva hada también.

El costal permanece en la parte inferior izquierda con los contadores recogidas/meta y faltantes. Se muestra vacío de 0 a 6, medio lleno de 7 a 13 y lleno de 14 a 20. No se dibujan papas individuales dentro ni se crean vuelos de recogida. La validación de puntaje sigue en PotatoScoreManager.

Validación: 77 pruebas aprobadas, tipos y compilación correctos. Revisión visual en navegador del hada, instrucciones, costal y botones de pausa, sin errores de consola. Capturas en `docs/previews/menu-hada-instrucciones.png`, `costal-papas.png` y `pausa-botones-arte.png`. Pendiente ajuste auditivo fino del offset y prueba en teléfono físico; no se generó APK.
