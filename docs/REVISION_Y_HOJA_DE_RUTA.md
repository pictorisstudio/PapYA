# PapYá: revisión y hoja de ruta

> Actualización, 7 de octubre de 2026: la Etapa 1 ya está implementada. Ver [detalle, cambios y validación](ETAPA_1.md). El diagnóstico siguiente conserva la revisión original; sus hallazgos de Etapa 1 se han corregido. La validación en Android físico sigue pendiente.

Fecha: 6 de octubre de 2026. Proyecto revisado: `C:\PapYA`.

## Diagnóstico

PapYá tiene una base de prototipo funcional: cinco minijuegos con sistemas separados, una ronda que los presenta en orden aleatorio, resultados, desbloqueo de cinco rutas y guardado local. El siguiente objetivo debe ser una primera demo coherente y comprensible. Conviene terminar Cosecha de Papa como referencia de calidad y luego llevar los otros cuatro a ese mismo estándar.

La deuda principal está en la presentación de información, algunas reglas, la experiencia inicial, la conexión entre resultados y progreso, y la integración de arte y sonido. La estructura existente permite mejorar estas partes por etapas; no hace falta comenzar de cero.

### Alcance y comprobaciones

- Revisión de escenas, configuración, tipos, sistemas, entidades, HUD, guardado, progresión, assets y configuración Android.
- `npm run typecheck`: pasó.
- `npm run build`: pasó. El JavaScript generado pesa aproximadamente 1,48 MB, o 383 KB comprimido con gzip; Vite avisa de un chunk grande. Es una oportunidad de optimización, no un fallo de compilación.
- Inspección en navegador local del menú, transición, Tejo y Cocina. Confirmada la ocultación del HUD en Tejo y Cocina. Sin errores de consola en la consulta realizada.
- Inspección visual y de dimensiones de los seis PNG de papa: todos de 64 × 64. El archivo Piskel conserva seis cuadros y una configuración de 9 fps.
- Comprobaciones aisladas del código de apuntado, ascenso, cocción, precisión y guardado, usando las clases del proyecto y un sustituto mínimo de las funciones matemáticas de Phaser. Sirven para verificar reglas; no reemplazan pruebas de juego en un dispositivo.
- No se compiló ni ejecutó un APK y no se realizó una prueba exhaustiva de interacción táctil ni rendimiento en Android. Las conclusiones de dificultad necesitan pruebas con jugadores.
- Esta entrega agrega documentación; no cambia el funcionamiento del juego.

## Qué conservar

1. La división entre escenas, sistemas, entidades, UI y configuración de cada minijuego.
2. Los relojes y trayectorias separados de la representación visual, especialmente en Ruana, Tejo y Cocuy.
3. Los gestores centrales de ronda, progreso y guardado, extendiendo sus contratos cuando corresponda.
4. Los controles de depuración para desarrollo y la limpieza de eventos al salir de escenas.
5. La resolución lógica de 1280 × 720 como referencia inicial y la orientación horizontal ya declarada en Android.

## Hallazgos ordenados por urgencia

P0 significa que impide entender o completar correctamente una experiencia básica. P1 afecta el acabado de la primera demo. P2 amplía contenido o mejora mantenimiento después de estabilizarla.

| Prioridad | Hallazgo y evidencia | Acción y condición de cierre |
|---|---|---|
| P0 | **HUD oculto por el escenario.** `CookingPot` dibuja un fondo completo a profundidad 60; `TejoBoard`, a 80; `WorldScrollSystem`, a 10. Los textos principales de sus HUD quedan en profundidad 0. Confirmado visualmente en Cocina y Tejo; el mismo conflicto existe por código en Cocuy. También afecta el panel debug global. | Definir capas comunes para fondo, mundo, entidades, HUD, efectos y ventanas. Todo contador debe quedar visible durante una partida. En Cocina, separar además el fondo de la olla: el fuego está a 55 y el dibujo completo a 60. |
| P0 | **Dos mechas de Tejo son inalcanzables.** El punto final tiene `y >= 210`. Las mechas superiores están en `y = 168`, con radio 28: incluso su borde inferior queda en 196. El barrido numérico encontró cero impactos superiores y sí encontró impactos inferiores. | Ajustar la proyección del punto final para cubrir todo el tablero y comprobar las cuatro mechas mediante arrastre normal. Alinear la previsualización con el vuelo: actualmente usa un arco reducido y un tramo parcial. |
| P0 | **Introducciones insuficientes.** La transición dura 1,1 segundos y sus textos dicen “placeholder”, “provisional” o “de prueba”. Papa, Cocina, Tejo y Cocuy comienzan su reloj al crear la escena. | Mostrar objetivo, gesto y peligro con ejemplo visual, esperar “Listo” y comenzar tras cuenta regresiva. Probar que una persona nueva entiende qué hacer sin explicación externa. |
| P0 | **Guardado vulnerable a datos inválidos.** `SaveManager` mezcla JSON sin validar tipos ni versión. Con `{"unlockedRoutes":null}` la carga termina fallando al copiar el array. Se aceptan rutas inventadas, duplicadas y versiones desconocidas. Las excepciones de acceso a localStorage no están protegidas. | Validar esquema, rutas permitidas, números y versión; definir migración y recuperación. Probar guardado vacío, roto, válido, versión anterior y almacenamiento no disponible. |
| P1 | **Los puntajes de los minijuegos se pierden.** Todas las escenas entregan solo un booleano a `completeCurrentMinigame`; `RoundManager` asigna 100 por victoria y 20 por derrota. | Decidir el modelo: puntos reales normalizados entre minijuegos, o puntos de viaje por victoria con récords propios separados. Mostrar claramente qué se suma y guardar resultados completos. |
| P1 | **Pausa y reanudación incompletas.** No hay pausa de jugador común. Ruana usa `performance.now()` y no conecta su pausa a pérdida de foco o suspensión de la app. Cocuy limpia input al perder foco, pero eso no resuelve todo el ciclo de juego. | Pausar reloj, sonido, input y simulación juntos. Verificar cambio de app, bloqueo de pantalla, regreso y botón Atrás. Reanudar sin perder notas ni dejar un arrastre activo. |
| P1 | **Victoria de Cocuy usa un estado anterior a los impactos.** `ascent` se captura antes de procesar obstáculos; después se consulta `ascent.victory`. Si se llega a la meta y se recibe una roca en ese frame, puede otorgarse victoria y restaurarse la altitud. | Evaluar el estado definitivo después de todos los efectos y definir qué evento tiene precedencia. |
| P1 | **Arrastres sin dueño.** Cocina y Tejo no vinculan el gesto al identificador del pointer. En Cocina, otro toque puede reemplazar el ingrediente arrastrado y dejar estados inconsistentes. Cocuy contempla varios pointers, pero la configuración actual de Phaser solo habilita uno táctil por defecto. | Elegir un contrato de input: un dedo propietario para arrastre; dos dedos habilitados donde aporten valor. Gestionar cancelación, liberación fuera del canvas y pérdida de foco. |
| P1 | **Errores repetidos en Cocina.** `checkRecipe` aumenta `ingredientErrors` cada vez que se suelta un pointer mientras hay un ingrediente incorrecto dentro, incluso sin introducir otro distractor. El offset de arrastre se calcula restando una posición de sí misma. | Contar el error cuando ocurre la incorporación incorrecta; preservar el punto de agarre y cancelar tweens previos al retomar un ingrediente. |
| P1 | **Debug activado en toda compilación.** `DEBUG_MODE = true` habilita victorias forzadas, desbloqueos y reset. El acceso debug a resultados puede finalizar una ronda incompleta; `finishRun` no exige que haya terminado. | Separar entorno de desarrollo y entrega. Añadir acceso directo a cada minijuego para iterar y proteger la finalización de rondas. Demo pública sin botones de depuración. |
| P1 | **Assets disponibles pero desconectados.** `PreloaderScene` solo anima una barra; no carga imágenes ni audio. `Potato` todavía usa elipses. Los seis PNG y el Piskel aparecen sin seguimiento en Git. | Implementar carga real con progreso y error, integrar las papas y asegurar que sus fuentes y exportaciones se incluyen al compartir el proyecto. |
| P2 | **Rutas y recompensa aún simbólicas.** El mapa presenta cinco tarjetas sin selección ni contenido propio. Se repiten los mismos cinco retos para desbloquear la siguiente ruta. Exploración termina en otras cinco tarjetas placeholder. | Definir qué representa cada ruta y qué contenido concreto recompensa al jugador. No prometer exploración completa antes de diseñarla. |
| P2 | **Perfección sin repetición dirigida.** Una ruta solo se registra perfecta al desbloquearla. No hay una forma explícita de volver a una ruta ya desbloqueada para mejorarla. Con todo desbloqueado, resultados puede decir “Ruta no desbloqueada” aun tras una ronda ganada. | Permitir mejorar rutas o retirar esa promesa; distinguir derrota, victoria con nueva ruta y victoria con mapa completo. |
| P2 | **Audio y documentación pendientes.** `AudioManager` almacena valores pero no reproduce sonido ni guarda ajustes. README de Ruana indica ventanas de 80/160 ms, mientras el código usa 110/220 ms. | Implementar sonido y ajustes; actualizar documentación, instrucciones y reglas desde una misma fuente. |

## Balance: decisiones que requieren pruebas de juego

Estos puntos no son todos errores: pueden ser reglas intencionales, pero hoy hay que aclararlas y medirlas.

| Minijuego | Regla actual | Recomendación para la demo |
|---|---|---|
| Papa | 20 buenas en 30 segundos; una mala produce derrota inmediata; 78 % de spawns buenos. | Mantener la mecánica simple. Probar el tamaño táctil y si el castigo se siente justo. Ensayar un modo inicial con margen de error antes de cambiar permanentemente la regla. |
| Ruana | 18 notas; GOOD pesa 0,75; victoria desde 85 %. Todas GOOD dan 75 % y derrota. | Aclarar diferencia entre completar el tejido y lograr precisión alta. Considerar completar con suficientes aciertos y reservar la precisión alta para una medalla. Los taps vacíos solo muestran MISS, no penalizan el score: probar si tocar repetidamente elimina el desafío. |
| Cocina | El fuego inicial converge a 0,48, zona óptima. En simulación sin tocar fuego, la cocción desde cero se completa en unos 8,15 segundos. | Hacer que regular el fuego tenga una función real: calentamiento inicial, una perturbación controlada o una meta de calidad. Evitar oscilaciones aleatorias antes de demostrar que los controles se entienden. |
| Tejo | MECHA vale 5; se gana con 10 puntos o 3 mechas. Dos mechas ya dan victoria. | Elegir y comunicar una meta coherente. Para la demo conservar reglas arcade explícitas; una simulación más fiel sería otro alcance. Corregir alcanzabilidad antes de ajustar dificultad. |
| Cocuy | Ascenso automático con penalización de 25 m por roca. Sin daños llega a la meta; con dos golpes a los 10 y 15 segundos termina cerca de 475,1 m a los 30 segundos. | Definir tolerancia y recuperación. Probar que el jugador vea venir los obstáculos y comprenda la penalización. Las zonas de vegetación, páramo, roca y nieve se calculan, pero el escenario actual no cambia según ellas. |

## Orden de ejecución

### Etapa 1 — Base jugable y comprensible

Cerrar los P0 antes de producir escenarios finales.

- [ ] Establecer capas visuales comunes y corregir HUD, fuego y superposiciones.
- [ ] Corregir alcance de Tejo y fijar su condición de victoria.
- [ ] Sustituir textos provisionales por instrucciones reales y añadir inicio voluntario.
- [ ] Validar y recuperar guardado.
- [ ] Crear selector de minijuegos exclusivo de desarrollo, con orden reproducible de prueba.
- [ ] Resolver pausa/reanudación, propiedad de arrastre y finalización única del resultado.
- [ ] Definir contrato de resultado por minijuego y significado del puntaje global.

**Entregable:** los cinco retos se pueden abrir, entender, ganar, perder y repetir, con la información visible y guardado consistente. Una prueba de ronda completa usa controles normales; las herramientas debug sirven solo para acelerar casos concretos.

### Etapa 2 — Cosecha de Papa como muestra del acabado final

- [ ] Preparar una ficha de arte: paleta, tamaño de píxel, contorno, escalas, pivotes y legibilidad.
- [x] Cargar los seis PNG mediante claves estables. Revisar si son variantes de una papa o cuadros de animación; no asumirlo solo por sus nombres.
- [x] Reemplazar el cuerpo provisional dentro de `Potato` sin mezclar el arte con la lógica de puntaje y spawn.
- [x] Conservar una hitbox táctil independiente de la silueta y ajustar sus dimensiones con el sprite final. Evitar que una hitbox grande y rotada facilite toques ambiguos sobre papas superpuestas.

Implementados estos tres puntos el 9 de octubre de 2026. Ver [assets, hitboxes y tarjetas de rutas](ETAPA_2_ASSETS_Y_MAPA.md). El resto de la Etapa 2 continúa pendiente.
- [ ] Añadir efecto de recolección, error y objetivo cumplido; sonidos cortos y diferenciados.
- [ ] Incorporar cielo, montañas, cultivo y primer plano por capas; cuidar que el terreno oculte coherentemente la aparición de las papas.
- [ ] Probar contraste entre buena y mala durante giro y movimiento en pantalla de teléfono.
- [ ] Ajustar spawn y dificultad con pruebas de jugadores.

**Entregable:** una partida de Papa que se sienta terminada: instrucciones claras, sprites legibles, respuesta al toque, resultado y reinicio. Esa muestra fija la calidad del resto del proyecto.

### Etapa 3 — Interfaz compartida y presentación del viaje

- [ ] Aplicar un HUD consistente: objetivo, avance, tiempo, pausa y ayuda.
- [ ] Mostrar resultado de cada reto y una pantalla final que explique por qué se desbloquea una ruta.
- [ ] Diseñar menú, transiciones, botones y mapa con la misma paleta del juego de Papa.
- [ ] Definir cinco rutas con nombres, propósito y recompensa; la elección concreta de lugares queda como decisión de contenido.
- [ ] Dar contenido mínimo real a Exploración: una tarjeta ilustrada por ruta, breve contexto cultural y acceso a rejugar. No necesita convertirse en un mundo abierto.
- [ ] Añadir ajustes persistentes de música y efectos, y confirmación dentro del juego para borrar progreso.

**Entregable:** una ronda completa tiene inicio, cinco retos, cierre y recompensa reconocible. El mapa comunica progreso real.

### Etapa 4 — Terminar los otros minijuegos uno por uno

Orden propuesto por dependencias y aprovechamiento del material existente:

1. **Cocina:** reutilizar la papa como ingrediente; terminar drag/drop, receta visible y regulación del fuego. Crear los otros ingredientes, olla, fogón y estados del plato.
2. **Tejo:** cerrar antes la geometría y las reglas; luego incorporar cancha, bocín, mechas, tejo, sombra y explosión. Comprobar que lo dibujado coincida con lo que se evalúa.
3. **Cocuy:** corregir el resultado posterior a impactos; incorporar cóndor, obstáculos y fondos por zona. Probar recuperación, tiempo de reacción y controles en teléfono.
4. **Ruana:** elegir primero el audio y patrón rítmico final; construir el beatmap a partir de él. Después telar, hilo y tejido progresivo. Sin audio sincronizado, el minijuego no entrega aún su experiencia de ritmo completa.

**Entregable por minijuego:** reglas comprensibles, arte mínimo completo, sonido esencial, victoria y derrota correctas, input estable y dificultad probada. Terminar uno antes de abrir la producción final del siguiente. Los prototipos existentes siguen disponibles para probar el conjunto.

### Etapa 5 — Identidad boyacense y contenido

- [ ] Dar a cada reto una conexión clara con su ruta y el propósito de “reconstruir el territorio”.
- [ ] Revisar nombres, textos, ilustraciones, vestuario, alimentos y contexto con personas que conozcan la región. Presentar las reglas arcade como reglas del juego, no como afirmaciones culturales universales.
- [ ] Priorizar pequeñas recompensas ilustradas y diálogos breves. Añadir animaciones narrativas extensas solo cuando la demo funcione.
- [ ] Introducir dificultad progresiva, variaciones de receta o patrones y medallas únicamente después del balance inicial.

**Entregable:** el jugador reconoce una experiencia boyacense en acciones, escenarios y recompensas, además de los nombres de los retos.

### Etapa 6 — Validación Android y preparación de entrega

- [ ] Generar y probar APK después de sincronizar el build web.
- [ ] Revisar teléfono pequeño, relación ancha y tableta: áreas táctiles, texto, barras negras y recortes del dispositivo.
- [ ] Verificar primer inicio, cierre/reapertura, modo sin conexión, suspensión, botón Atrás y sonido después de reanudar.
- [ ] Medir rendimiento en un teléfono objetivo modesto; acordar un presupuesto estable de frames y memoria a partir del dispositivo disponible.
- [ ] Evitar redibujado innecesario de fondos y textos por frame donde las mediciones lo justifiquen. Introducir pooling solo si creación/destrucción produce pausas perceptibles.
- [ ] Revisar carga inicial y empaquetado; separar chunks cuando mejore el tiempo real de carga. Mover los fuentes Piskel fuera de `public` para no distribuir archivos de autoría en el build.
- [ ] Reemplazar icono, splash y favicon de plantilla; revisar versiones, créditos y procedencia de assets.
- [ ] Ejecutar una entrega con debug desactivado y comprobar ronda completa, progreso y reinicio.

**Entregable:** demo instalable, estable y presentable. Compilar la web es un paso previo, no evidencia de que Android ya esté validado.

## Producción de assets: cola mínima

La integración de las papas actuales comienza en la etapa 2. Esta lista es el orden de producción visual recomendado, sujeto a cerrar antes las reglas que afecten dimensiones y composición.

| Orden | Paquete | Mínimo necesario | Estado |
|---|---|---|---|
| 1 | Papa, elementos interactivos | 3 PNG buenos y 3 malos; efecto de toque bueno/malo; respuesta de recolección | PNG existentes, sin integrar |
| 2 | Papa, escenario | Cielo, montañas, campo de cultivo y primer plano | Pendiente |
| 3 | UI compartida | Botones, paneles, reloj, pausa, ayuda, victoria/derrota e indicador de progreso | Formas y textos provisionales |
| 4 | Menú, mapa y recompensas | Logo, representación de PapYá si se conserva, mapa legible, cinco marcadores y tarjetas | Pendiente |
| 5 | Cocina | Cubios, ibias, chuguas, habas y 3 distractores; reutilizar papa; olla, fogón, fuego, vapor y plato | Pendiente |
| 6 | Tejo | Cancha/tablero, bocín, mechas, disco, sombra, impacto y explosión | Pendiente |
| 7 | Cocuy | Cóndor con vuelo, rocas, nubes, viento; capas de vegetación/páramo/roca/nieve | Pendiente |
| 8 | Ruana | Telar, hilo/notas, marcas de toque, tejido por progreso y ruana terminada | Pendiente; depende de audio/beatmap |

Sonido mínimo, desde Papa: toque, acierto, error, inicio, victoria, derrota y desbloqueo. Después: hervor y fuego; lanzamiento e impacto de Tejo; viento y daño de Cocuy; pista rítmica y respuestas de Ruana. Una pista y sus derechos de uso deben estar resueltos antes de cerrar el beatmap final.

### Reglas para integrar sin retrabajo

- Guardar fuentes de autoría aparte de las exportaciones de runtime. Registrar autor, origen y permiso de uso.
- Para cada asset anotar clave, ruta, dimensiones, pivote, escala, escena y animación si aplica.
- Usar PNG con transparencia para entidades y una cuadrícula de píxeles coherente. Revisar cualquier escala fraccionaria: `pixelArt: true` no basta para garantizar uniformidad en todas las pantallas.
- Mantener colisiones, zonas táctiles y reglas independientes del dibujo.
- Implementar progreso de carga real y aviso de asset faltante; el temporizador actual del preloader no garantiza que una textura esté lista.
- Antes de producir muchas ilustraciones, aprobar una captura de Papa con su HUD y fondo definitivos como guía visual.

## Primer lote de trabajo

1. Corregir las capas del HUD en Cocina, Tejo y Cocuy.
2. Corregir alcance y objetivo de Tejo.
3. Añadir instrucciones, “Listo” y cuenta regresiva común.
4. Proteger guardado y separar debug de demo.
5. Implementar preloader real y cargar las papas existentes.
6. Integrar sprites, hitbox y feedback en Papa.
7. Probar Papa en teléfono y ajustar su dificultad.
8. Completar escenario y sonidos de Papa.
9. Definir puntaje y mostrar resultados coherentes.
10. Aplicar esa calidad al resto de minijuegos siguiendo las etapas anteriores.

## Criterios para la primera demo

- Un jugador nuevo entiende cada gesto sin explicación externa.
- Tiempo, objetivo y resultado son legibles en el dispositivo objetivo.
- Los cinco minijuegos se ganan y se pierden usando controles normales.
- Pausar o salir de la app no consume el tiempo de juego ni rompe el input.
- El progreso sobrevive al cierre; un guardado inválido se recupera.
- La pantalla final concuerda con los resultados de los retos y distingue el mapa ya completo.
- Las cinco rutas entregan una recompensa real y mínima.
- No quedan textos placeholder ni controles debug en la demo.
- Todos los assets necesarios viajan con el proyecto y se cargan correctamente.
- Existe una prueba en Android real; quedan documentadas las limitaciones que aún no se hayan comprobado.

El siguiente hito recomendado es cerrar una Cosecha de Papa completa y consistente dentro de una ronda estable. Nuevos minijuegos, multijugador, monetización y exploración extensa pueden esperar hasta que esa primera demo esté validada.
