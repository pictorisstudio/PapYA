# Prueba de Trompo y ajustes de Tejo — 27 de octubre de 2026

## Probar el reemplazo

La ronda sigue teniendo cinco minijuegos. Duelo de Trompos ocupa provisionalmente el puesto de Cocina. También aparece en DEV → TEST → Duelo de Trompos. Su arte es procedural y su música e impacto reutilizan recursos existentes; aún no tiene sprites ni audio propios.

El trompo azul es el jugador y el naranja es el rival. Ambos giran automáticamente. Un solo dedo arrastra el joystick izquierdo; al soltarlo se deja de acelerar y el trompo conserva un poco de inercia. Gana al sacar al rival del círculo. Salir del círculo o agotar 30 segundos termina el reto sin completarlo. No hay poderes, botones adicionales ni instrucciones que interrumpan el inicio.

El rival persigue al jugador y trata de recuperarse cerca del borde. Su aceleración crece durante los primeros 2,2 segundos para dar tiempo a reaccionar. Los choques tienen separación física, rebote, un destello y sonido. La simulación usa pasos pequeños para evitar atravesar cuerpos con FPS bajos. La pausa cancela el joystick y congela la escena; solo el dedo que tomó el control puede modificarlo o soltarlo.

Para volver a Cocina, cambiar `USE_TROMPO_PROTOTYPE` a `false` en `src/config/minigamesConfig.ts`. Cocina, sus assets, sonidos y récords se conservan. Trompo usa una clave propia de guardado y no sobrescribe el récord de Cocina. Las rutas y las partidas guardadas siguen siendo compatibles.

## Tejo

- La guía solo muestra una flecha corta de dirección y una barra de fuerza. No muestra la trayectoria completa ni el destino exacto.
- Al soltar se calcula el tiro con las coordenadas finales del dedo y se limpia la guía. Otro dedo no puede disparar.
- Cada mecha desaparece al explotar y sale de las zonas de impacto. No vuelve a dar cinco puntos ni a explotar en esa partida.
- Ganar requiere dos mechas distintas; acumular tiros cercanos no permite eludir esa regla. Una partida nueva repone las cuatro mechas.
- Al preparar el siguiente tiro se limpian la mira, el dedo dueño, la selección previa y la marca del impacto. La explosión ganadora conserva el comportamiento de audio junto a Ganaste.

## Validación

Las pruebas cubren preservación de guardados, controles con varios dedos, normalización del joystick, resultados únicos, tiempo agotado, choques, salida de la arena a 30/60/120 FPS, consumo de mechas y reinicio de apuntado. El equilibrio y la comodidad del joystick deben confirmarse en celular con el equipo. No se generó APK.

Se aprobaron 56 pruebas, revisión de tipos y compilación web. En navegador se comprobó la entrada a Trompo, su regreso al finalizar y un lanzamiento real de Tejo: desapareció la mecha superior izquierda y volvió el disco sin conservar la guía. Capturas en `docs/previews/`.
