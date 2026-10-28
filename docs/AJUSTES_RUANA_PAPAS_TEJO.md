# Ajustes del 28 de octubre de 2026

- **Tejo:** indicador vertical de fuerza a la derecha del disco, con profundidad propia sobre el arte. Sigue la posicion del arrastre y se mantiene dentro del canvas al acercarse al borde inferior. Se limpia junto con la flecha al soltar o cancelar; no revela el destino del tiro.
- **Ruana:** usa el nivel de la sesion (0–4) para construir 18, 22, 26, 30 o 34 notas. Primero aparecen notas individuales, luego contratiempos y en los niveles 3 y 4 algunos acordes de dos dedos. No hay selector. La progresion sigue las rondas exitosas, no los intentos fallidos, y conserva el limite y reinicio voluntario existentes. El tiempo restante se deriva de la ultima nota. La musica acelera con el reloj; el pulso musical base permanece provisional.
- **Victoria de Ruana:** completar el 85 % de las notas como Bien o Perfecto permite ganar. La precision temporal y el puntaje siguen distinguiendo ambas calificaciones.
- **Papas:** gravedad de 900 a 520 y velocidad inicial de 760–940 a 580–715. La altura permanece aproximadamente igual, con alrededor de un 30 % mas de tiempo cerca de la cima. La integracion del movimiento evita diferencias de altura entre 30, 60 y 120 FPS. Se conservan los colliders circulares independientes del giro, la seleccion de la papa delantera y el soporte de varios dedos.

Trompo conserva su configuracion y comportamiento. Falta confirmar en celular la comodidad de las notas dobles y el nuevo movimiento de las papas.

Durante la revision responsive se corrigio ademas la lectura de medidas del contenedor antes de escalar: cambiar de tamaño podia dejar el canvas con sus dimensiones anteriores y recortar la escena. Se comprobo el ajuste horizontal en navegador a 844×390. Las pruebas cubren seguimiento y limpieza de la barra, patrones progresivos, acordes, victoria por aciertos y trayectorias de papas a distintos FPS.

Validacion: 62 pruebas aprobadas, revision de tipos y compilacion web. Ruana se comprobo iniciando de inmediato en vista movil; captura en `docs/previews/ruana-movil-actualizada.png`. No se genero APK.
