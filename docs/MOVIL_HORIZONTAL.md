# Horizontal y ajuste móvil — 19 de octubre

## Ajuste posterior: pantalla completa

La configuración vigente usa Scale.EXPAND en lugar de FIT. La cámara centra el espacio lógico 1280×720 dentro del área ampliada; únicamente se estiran los fondos y capas de pantalla completa. Los sprites, HUD y áreas de toque conservan coordenadas y proporciones. El relleno CSS descrito más abajo quedó retirado: se reutilizan las texturas de Phaser antes de renderizar, sin descargar otra imagen al cambiar de escena. visualViewport y las zonas seguras siguen activos. Las secciones de FIT y relleno lateral siguientes describen la versión anterior.

La cancha de Tejo baja con todo su blanco a Y=300 para apoyar su base sobre el suelo. La guía es una curva continua con contorno oscuro, trazo claro y aro de destino; permanece durante el vuelo y se limpia al impactar. Se comprobaron 41 pruebas, tipos y build, incluyendo alineación de vuelo con la guía y expansión del fondo sin desplazar objetos jugables. Falta confirmar la composición visual en teléfono real.

Vuelve la base lógica 1280×720 y la orientación landscape en AndroidManifest.xml. Se restauraron posiciones, límites, escenarios, menús y controles horizontales. Se mantienen el HUD mínimo, los cuatro colores de Ruana, el desplazamiento continuo de Cocuy y las mecánicas simultáneas de Cocina.

Cocina muestra temperatura, cocción y quemado en tres barras sobre los botones de temperatura. El diseño comprueba que las barras no invadan los controles inferiores.

Boot carga `public/assets/branding/logo-gobernacion-horizontal.png`, copiado del nuevo original. Conserva `logo-gobernacion.png`, que es el vertical. El logo horizontal blanco usa un frame de textura que excluye márgenes transparentes sin modificar el PNG. Continúa la aparición y desaparición de tres segundos sobre negro, con carga en paralelo y cóndor si todavía hay recursos pendientes.

## Responsive

- Scale.FIT conserva toda el área jugable y la proporción, en lugar de recortar botones para llenar una pantalla más ancha que 16:9.
- Un contenedor exterior mide el visualViewport del navegador, actualiza ancho, altura y posición cuando cambian las barras o la orientación, y refresca Phaser.
- CSS usa 100dvh con alternativa 100vh y respeta safe-area-inset para notch y barra de gestos. El contenedor interno `game` recibe el canvas.
- El espacio sobrante de los laterales se rellena con el fondo de la escena oscurecido, sin ampliar el área interactiva. Boot y carga mantienen negro.
- No se fuerza fullscreen ni se modifica el zoom del dispositivo.

40 pruebas aprobadas, revisión de tipos y compilación web. Las nuevas pruebas verifican actualizaciones del viewport y eliminación de listeners, así como los tres porcentajes de Cocina y los límites inferiores de las barras. Falta validación visual y táctil en teléfono con barras del navegador visibles/ocultas, notch y APK reconstruido. No se generó un APK en esta actualización.

`MOVIL_VERTICAL.md` queda como registro histórico de la adaptación anterior; esta configuración horizontal lo sustituye.
