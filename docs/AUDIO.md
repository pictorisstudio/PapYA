# Audio integrado de PapYá

Los 19 sonidos de public/assets/audio están conectados al juego. Las claves y rutas se editan en src/config/audioConfig.ts; los ambientes tienen ganancias menores en AUDIO_GAIN. AudioManager separa música y efectos, admite silencio y cambios de volumen activos, evita repetir simultáneamente un mismo efecto y libera los sonidos al salir de la escena. Música en bucle por escena; pausa mediante el sistema compartido del juego. El navegador puede exigir el primer toque para desbloquear audio.

Conexiones: menú/mapa/exploración usan menuMusic; cada minijuego tiene su pista. Papas buenas/malas, aciertos de Ruana, lanzamiento/explosión/público, ingredientes depositados, fuego en bucle, burbujas al cocinar, viento en bucle, colisión con roca, victoria y desbloqueo de la última ruta. No hay archivo de tela ni recuperación de fragmentos.

Los OGG de Tejo sustituyen FLAC y WAV en el registro. Se verificó cabecera OggS y existencia de los 19 recursos. Peso actual: 44.195.858 bytes. Preloader carga los audios antes de entrar al menú para evitar cargas entre retos; esta estrategia aumenta carga inicial y memoria de decodificación. Evaluar bancos y compresión adicional en Android si hace falta.

Pruebas automatizadas cubren claves, rutas, sustitución de música, liberación de sonidos y volúmenes separados. No sustituyen una prueba de escucha o decodificación en dispositivo. Falta ajustar balance y bucles escuchándolos en teléfono. La música de Ruana es acompañamiento: no se ha analizado BPM ni alineado el patrón de notas con sus compases.

El inventario audio-inventario.json conserva la migración inicial desde Sounds; los dos archivos convertidos por el equipo ya tienen hashes y tamaños distintos a ese registro histórico. Sounds fue retirado tras verificar sus copias originales.