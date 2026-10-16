# Arte integrado el 16 de octubre

28 PNG revisados visualmente en `arte-16-octubre.png`, copiados sin modificar bytes y registrados en `src/config/sceneAssets.ts`. Las imágenes de fondo y mapa son 128×72; los cóndores, obstáculos y logo son 64×64. Vite los carga en PreloaderScene con claves únicas. `arte-16-octubre-inventario.json` registra origen, destino y SHA-256 para verificar la conservación antes de retirar ImagenesNuevas.

- Menú: fondo, logo, botones artísticos con zonas de toque rectangulares independientes, cóndor lateral animado de seis cuadros y mapa según rutas desbloqueadas.
- Mapa: vista del progreso de Boyacá en seis estados, desde bloqueado hasta cinco rutas. Conserva sus tarjetas y desbloqueos.
- Papas: paisaje completo y capa transparente de suelo; mantiene sprites, spawn y hitboxes.
- Ruana: fondo del taller; panel de juego semitransparente para conservar contraste de notas y carriles.
- Tejo: nuevo fondo completo reemplaza la cancha provisional. Se mantiene el bocín interactivo, las mechas y la geometría de impactos. El sprite anterior de cancha queda registrado como alternativa; no se superpone al fondo completo.
- Cocuy: cumbre, frailejones y nubes ambientales; roca y nube de obstáculos con hitboxes originales. Cóndor frontal animado con dos cuadros a 5 FPS; el lateral de seis cuadros a 8 FPS se usa en el menú. No se mezclan perspectivas dentro de una misma animación.

Las proporciones de fondos 16:9 se conservan al mostrarlos a 1280×720. No se modificaron audios, velocidad, progreso ni objetivos. Los efectos de viento conservan señales direccionales geométricas porque no hay un sprite nuevo de viento.

Validación automatizada de rutas únicas y existencia de los 28 recursos, tipos y compilación. Las pruebas no sustituyen una revisión visual y táctil de las nuevas composiciones en teléfono.
