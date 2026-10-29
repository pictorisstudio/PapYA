# Fuente, música y puntuación

VCR OSD Mono se sirve desde `public/assets/fonts/vcr-osd-mono.ttf`. `prepareGameFont` espera su carga antes de crear Phaser y centraliza la fuente de todos los textos creados con `add.text`; CSS cubre los avisos web. Las imágenes con letras no cambian.

La música nueva conserva el WAV original y se copia a `public/assets/audio/01_ruana/musica-ruana.wav`; `audioConfig.ts` mantiene la clave `ruanaMusic`. Pesa aproximadamente 10,4 MB; se puede sustituir por una conversión OGG sin cambiar la clave.

Tejo suma cercanía 1, mecha 3, bocín 6 y moñona 9. La meta es 10 puntos sin requisito adicional de dos mechas. El bocín exige que el centro del disco quede dentro del radio de 32. La moñona añade contacto con una mecha activa usando un radio de disco de 20; consume esa mecha y reproduce la explosión. Las figuras son excluyentes, no se suman 6+9 ni se reutilizan mechas consumidas. La cercanía es una adaptación para un jugador, no una comparación reglamentaria de equipos. No se simula físicamente el clavado del disco.

Los contadores superiores muestran puntos/meta en Tejo y altura/meta en Cocuy. Pruebas: 76 aprobadas; tipos y compilación correctos. Revisión en navegador de la fuente y el contador de Tejo sin errores de consola. Captura: `docs/previews/tejo-fuente-puntos.png`. Pendiente evaluar en teléfono físico y escuchar el balance de la pista nueva.
