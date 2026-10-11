# Arte de Cocina y Tejo

Revisión: 10 de octubre de 2026.

Los 14 PNG se recuperaron de `dist/assets/minigames` y se copiaron a `public/assets/minigames`, conservando sus bytes originales. Se normalizaron los nombres de las copias, incluyendo el espacio al final de `Brocoli .png`. Los archivos originales de dist no se borraron manualmente.

`public` contiene los recursos fuente que Vite sirve en desarrollo y copia al compilar. `dist` es la salida generada de la compilación y no debe usarse para guardar originales: una compilación puede reemplazarla. Añadir futuros recursos en public, nunca en dist.

Todos los PNG son de 64 × 64 píxeles. Se revisaron visualmente en `assets-cocina-tejo.png`. Las claves estables y rutas están en `src/config/assets.ts`; PreloaderScene los carga como imágenes independientes. Integrados en las escenas: olla por capas, papa, habas y distractores de Cocina; mechas, sombra y disco detallado de Tejo. Cubios, ibias y chuguas conservan el dibujo provisional. Arvejas, costilla y disco simple permanecen disponibles sin modificar la receta ni alternar diseños.

## Cocina

| Original | Nombre en public | Uso visual |
| --- | --- | --- |
| Alverjas.png | arvejas.png | Ingrediente, pendiente de definir en la receta |
| Brocoli .png | brocoli.png | Distractor actual |
| Costilla-Vaca.png | costilla-vaca.png | Ingrediente, pendiente de definir en la receta |
| Habas.png | habas.png | Ingrediente correcto actual |
| Papa.png | papa.png | Ingrediente correcto actual |
| Pimenton.png | pimenton.png | Distractor actual |
| Tomate.png | tomate.png | Distractor actual |
| Olla-Atras.png | olla-atras.png | Parte trasera de la olla |
| Olla-CaldoMedio.png | olla-caldo-medio.png | Caldo, capa interior |
| Olla-completaFrente.png | olla-frente.png | Cuerpo y frente de la olla |

Las tres piezas de la olla son capas, no una animación. Comparten escala y posición; el frente se dibuja encima de los ingredientes depositados y debajo del ingrediente arrastrado. Faltan sprites para cubios, ibias y chuguas; no cambiar esos ingredientes por arvejas o costilla solo para acomodar el arte disponible. Las zonas de arrastre y de la olla deben permanecer independientes del dibujo.

## Tejo

| Original | Nombre en public | Uso visual |
| --- | --- | --- |
| Mecha-Tejo.png | mecha.png | Mecha triangular |
| sombra_tejo.png | sombra.png | Sombra del disco |
| Tejo-Solo.png | tejo-simple.png | Disco de diseño simple |
| TejolindomejorqueeldeMiguel.png | tejo-detallado.png | Disco de diseño detallado |

Los dos discos son alternativas de arte, no cuadros de una animación. El juego usa el disco detallado; el simple permanece como alternativa. Al integrarlo, conservar las zonas circulares de impacto y toque; una mecha triangular no debe modificar por sí sola el balance del lanzamiento.

Los minijuegos arrancan directamente desde TransitionScene, sin letrero ni temporizador de instrucciones.

## Actualización de receta

La selección vigente es cubios, papa, habas, mazorca y costilla de res, con fresa, brócoli y berenjena como distractores. La costilla ya está integrada. No hay PNG de cubios, mazorca, fresa o berenjena. Arvejas, tomate y pimentón se conservan como archivos originales, pero se retiraron del registro de carga y no aparecen en el minijuego. La tabla anterior documenta el inventario inicial, no la receta vigente.

