# Ascenso al Cocuy

Quinto minijuego funcional de PapYa. El jugador controla horizontalmente un condor mientras el ascenso ocurre de forma automatica durante un unico reloj de 30 segundos.

## Separacion clave

`AscentSystem` mantiene `altitudeProgress` como verdad logica de gameplay, de `0` a `500 m`. `WorldScrollSystem` mueve el escenario solo como representacion visual. Los metros no dependen de pixeles recorridos.

## Input

La pantalla se divide en dos zonas tactiles invisibles: izquierda y derecha. Mientras el pointer esta presionado, `CondorMovementSystem` aproxima la velocidad horizontal hacia el maximo configurado; al soltar desacelera hacia `0`. En multitouch, el ultimo pointer activo decide la direccion; al soltarlo, vuelve al pointer activo anterior si existe.

## Obstaculos

`ObstacleSpawnManager` crea rocas, nubes y viento con pesos configurables y dificultad progresiva. `ObstacleEffectSystem` aplica efectos una sola vez por obstaculo activado:

- `ROCK`: resta metros y muestra feedback.
- `CLOUD`: activa un overlay reutilizable de visibilidad reducida.
- `WIND`: aplica influencia lateral temporal, contrarrestable con input.

## Debug

Con `DEBUG_MODE = true`, el HUD permite spawnear obstaculos, limpiar, ajustar altitud, simular impactos/efectos, forzar victoria/derrota y reiniciar. El toggle global de areas tactiles muestra hitboxes y la division LEFT/RIGHT. Con `DEBUG_MODE = false`, estas herramientas no se crean.
