# Multijugador para PapYá

## Recomendación

Empezar con un duelo de trompos para dos personas, separado del viaje individual. Probar primero en el mismo dispositivo y luego conectar dos celulares en una sala privada. Tras validar si resulta divertido y funciona con latencia, ampliar a un torneo de cinco retos si el equipo lo necesita. No se implementó networking en este cambio.

La comparación importante es alcance frente a dificultad de red: trompos exige menos pantallas y reglas nuevas, pero sus choques requieren más precisión de sincronización que un torneo por turnos. Si la prioridad es lanzar pronto una competencia de los cinco juegos, el modo por turnos en un solo dispositivo puede ser el primer producto más sencillo.

## Alternativas

| Modalidad | Experiencia | Trabajo principal | Riesgo |
|---|---|---|---|
| Cinco retos por turnos, mismo teléfono | Cada participante juega el mismo recorrido | Participantes, semilla común, comparación y marcador | Menor complejidad técnica; hay espera entre turnos |
| Trompos local simultáneo | Dos joysticks, uno por persona | Sustituir IA por segundo control, entradas independientes, reglas simétricas | Espacio de dedos y legibilidad en móvil |
| Trompos online | Cada persona juega desde su celular | Salas, servidor de física, sincronización, reconexión | Latencia en choques y costo operativo |
| Cinco retos online | Compiten en rondas comunes; trompos puede ser duelo directo | Todo lo anterior más reglas y sincronización de cinco escenas | Mayor alcance, más pruebas y casos de abandono |

## Torneo de cinco juegos

Dos participantes disputan los mismos cinco retos. Cada reto otorga un punto al mejor resultado; un empate puede dar medio punto a cada uno. Se suman victorias de retos, no puntos brutos: 1000 puntos en papas no son comparables con 500 metros del Cocuy. Recomiendo completar los cinco para que nadie pierda la oportunidad de jugarlos; un formato al primero en tres victorias puede ser opcional después. Si termina 2,5–2,5, revancha de trompos o empate compartido, según el carácter competitivo que busque el equipo.

| Reto | Comparación propuesta | Cambios necesarios |
|---|---|---|
| Ruana | Mayor porcentaje de aciertos; después precisión y menos errores | Misma canción, beatmap, nivel y calibración; música local, no transmitir audio |
| Papa | Alcanzar la meta sin podridas; si ambos la alcanzan, menor tiempo; si ninguno, más papas | Mismo patrón de aparición; definir prioridad de una derrota por podrida frente a quien sigue jugando |
| Tejo | Primero en llegar a 10; si nadie llega, mayor puntuación al terminar; empate si coinciden | Inicio y reloj comunes, figuras validadas y reglas para resultados simultáneos |
| Trompo | Sacar al oponente; empate si salen simultáneamente | Cambiar la IA por el segundo participante y usar atributos iguales |
| Cocuy | Llegar a la cima; si ambos llegan, menor tiempo; si nadie llega, mayor altura | Mismos vientos y rocas; desempate por menos golpes |

Un jugador que termina antes espera al otro y ve su resultado provisional. Se avanza cuando ambos terminan o vence el tiempo común. La pantalla final competitiva usa marcador A/B y una invitación a revancha, sin «Perdiste». El torneo no debe alterar el guardado de rutas individual hasta decidir expresamente qué recompensas otorga.

## Qué ya permite el código y qué falta

`TrompoSimulation` está separada del dibujo: se puede reutilizar sin ejecutar Phaser en el servidor. Sin embargo, actualmente su segundo cuerpo usa IA, el rival tiene aceleración y velocidad diferentes y una salida simultánea concede la victoria al rival. En PvP deben existir dos entradas humanas, condiciones simétricas y un resultado de empate. No basta con poner otro joystick.

`GameManager`, `RoundManager` y `GameplaySession` resuelven un viaje individual y avanzan en cuanto termina el jugador. Conviene añadir `MatchManager` para participantes, fase, marcador y resultados, y un adaptador de finalización competitivo. Mantener separado el progreso individual evita que una revancha desbloquee rutas accidentalmente.

Las apariciones usan azar local en distintas partes. Para competir justamente hay que generar el plan de eventos con una semilla común y enviarlo a ambos, o producirlo en servidor. Deben fijarse dificultad, duración y ritmo al comenzar la partida; no usar el progreso individual de uno para elegirlos.

## Arquitectura online propuesta

Cliente Phaser + servidor Node.js/TypeScript con salas de dos personas. Colyseus es una opción que ofrece salas, estado compartido y un tutorial oficial para Phaser. No es una dependencia que el proyecto tenga instalada actualmente.

El cliente envía dirección del joystick, secuencia de entrada y estado de conexión; el servidor calcula posiciones, choques, salidas y ganador. Propuesta inicial para evaluar: física a 60 Hz y actualizaciones de estado a 20 Hz, con interpolación visual y predicción del control propio. Son parámetros de partida, no una garantía de fluidez. Hay que medirlos en redes móviles reales.

Para los cinco retos, el servidor decide semilla, ronda, hora de inicio y reglas; valida acciones y resultados plausibles. Aceptar sin comprobación una puntuación enviada por el navegador permite manipular el resultado. Los relojes entre dispositivos necesitan sincronización y tolerancia al retardo; en Ruana, la posición del audio local gobierna el dibujo y los juicios, con compensación del dispositivo, sin intentar sincronizar cada nota por mensajes de red.

Si la app se oculta o alguien se desconecta, la partida online no puede usar la pausa individual actual para congelar al rival. Definir una ventana de reconexión, por ejemplo 10 segundos, y luego abandono; el servidor conserva la simulación o aplica una pausa acordada. Este comportamiento debe explicarse antes de la partida. La primera versión puede usar código de sala y nombres temporales, sin cuentas ni chat.

## Hoja de ruta

1. Reglas de PvP: dos entradas simétricas, empate real, revancha y resultados sin tocar rutas.
2. Duelo local: dos joysticks, control de dos dedos, probar comodidad en teléfonos. Validar si se prefiere tableta o celulares separados.
3. Prueba online privada: crear/unirse por código, servidor de física, inicio común, desconexión y revancha. Sin clasificación pública.
4. Validación: latencia, fluctuaciones de red, paquetes tardíos, segundo plano, giro a vertical, salidas simultáneas y partidas repetidas. Objetivo: ningún cliente decide un ganador diferente del servidor.
5. Torneo: semilla común y comparación por reto; primero por turnos si se quiere validar las reglas con menos infraestructura, luego simultáneo entre celulares.

No estimaría fechas sin decidir primero si será local, por turnos u online. El alojamiento estático actual sirve el cliente, pero online requiere además un proceso de servidor persistente, conexiones seguras y mantenimiento. No se necesita contratar servicios para probar el duelo local.

## Referencias técnicas

- Colyseus: https://docs.colyseus.io/
- Tutorial de Phaser: https://docs.colyseus.io/learn/tutorial/phaser
- Estado sincronizado: https://docs.colyseus.io/state
- Predicción y reconciliación: https://docs.colyseus.io/netcode

El diseño de reglas, las prioridades y la comparación de alcance son propuestas específicas para este proyecto. Las referencias respaldan las capacidades de red, no las reglas propuestas del torneo.
