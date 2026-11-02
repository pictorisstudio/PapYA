# Trompos por código de sala

Modo separado del viaje individual. El menú abre crear sala o introducir un código hexadecimal de seis caracteres. La primera opción espera al segundo jugador; entrar con el código inicia el duelo automáticamente. Cada participante controla su trompo con el joystick derecho. El primero en expulsar al rival tres veces gana. Si ambos salen en el mismo paso, se reinicia la ronda sin punto.

## Cómo probar entre dos celulares

Requiere Node.js 24 o posterior (el servidor carga el módulo compartido TypeScript con el soporte nativo de Node). Desde C:\PapYA:

```powershell
npm run build
npm run multiplayer
```

Abrir `http://localhost:8787` en el PC. Para dos celulares en la misma Wi-Fi, abrir en ambos `http://IP-DEL-PC:8787`; obtener la IP con `ipconfig`. El puerto 8787 debe ser accesible desde esa red. No usar `localhost` en el celular, porque apuntaría al propio celular. Un jugador crea sala y comparte el código; el otro lo introduce. No necesitan instalar Node en el teléfono.

Para desarrollo, mantener `npm run multiplayer` en una terminal y `npm run dev` en otra: Vite redirige `/api/multiplayer` al servidor. Para jugar por Internet, alojar el servidor y el cliente juntos detrás de HTTPS; subir únicamente dist a un alojamiento estático no habilita salas. La APK con assets locales necesitará configurar el acceso a ese servidor publicado; este cambio valida la versión web, no genera una APK.

## Implementación

- `src/multiplayer/TrompoMatch.ts`: física compartida, ambos con velocidad y aceleración iguales, sin IA; estado de ronda, marcador y ganador.
- `server/multiplayer.mjs`: salas en memoria, máximo dos participantes, credenciales aleatorias privadas y simulación de servidor a 60 pasos por segundo. El cliente envía dirección, nunca posiciones ni resultados aceptados como verdad.
- `TrompoMultiplayerScene`: interfaz de salas, consultas HTTP cada 80 ms sin peticiones superpuestas, interpolación visual y joystick local. Es una primera versión para salas privadas; no incluye predicción, clasificación pública ni persistencia de salas.
- Se neutraliza una entrada que no se actualiza en 500 ms. Tras 15 segundos sin comunicación se cierra el duelo por abandono. Las salas sin actividad se eliminan a los 15 minutos; desaparecen al reiniciar el servidor.
- Salir del duelo avisa al rival y vuelve al menú. Rotar a vertical o perder foco neutraliza el joystick; el servidor no pausa al oponente. El modo no llama a la finalización del viaje ni modifica rutas guardadas.
- Las respuestas de estado no exponen las credenciales del otro participante. Se validan tamaño de mensajes, origen del navegador, entradas finitas y ocupación. Antes de abrirlo a público amplio conviene añadir límites por IP y monitorización.

## Ajustes visuales solicitados

La arena individual se desplaza de X=770 a X=600, sin cambiar su radio, física, IA ni joystick. El duelo online usa el mismo espacio izquierdo. En Tejo se estira el fondo verticalmente a 800/720 anclado al borde inferior, compensando también el viewport ampliado. Se retiran las patas añadidas y se sitúa la sombra en el borde inferior de la cancha; sus reglas no cambian.

## Validación

`npm test`: 80 pruebas del modo existente. `npm run test:multiplayer`: 3 pruebas de simulación, empate y servidor real con creación, entrada de dos clientes, rechazo del tercero, autenticación, resultados no manipulables desde el cliente y abandono. Tipos y build correctos.

Prueba visual real en dos pestañas independientes: creación de código, entrada del segundo jugador e inicio de partida; movimiento del trompo invitado visible en ambas pantallas, sin errores de consola. Se completó el duelo con tres expulsiones: una pantalla mostró «¡Ganaste el duelo! · Tú 3 · Rival 0» y la otra «¡Buena partida! · Tú 0 · Rival 3». Capturas en `docs/previews/trompos-sala-codigo.png`, `trompos-multijugador-partida.png` y `trompos-multijugador-final.png`. Falta evaluar latencia y comodidad en dos teléfonos físicos; no se ha desplegado en Internet.
