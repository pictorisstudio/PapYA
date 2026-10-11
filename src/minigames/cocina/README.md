# Maestro de la Cocina Campesina

Prototipo funcional para preparar un solo Cocido Boyacense en 30 segundos. La escena mantiene un unico reloj: primero se arrastran ingredientes a la olla y, cuando la receta queda completa, comienza automaticamente la coccion.

## Flujo

`CocinaScene` coordina fases, input, HUD y resultado global. `IngredientManager` controla drag/drop y slots internos de olla. `RecipeManager` valida 5 ingredientes correctos y 0 distractores. `CookingSystem` actualiza fuego, temperatura, coccion y quemado. `CocinaScoreManager` calcula un puntaje simple al terminar, pero la victoria depende solo de cocinar el plato sin quemarlo.

## Temperatura

Desde el inicio, la temperatura sube constantemente a 10 puntos porcentuales por segundo. `−` cambia la dirección a descenso y `+` a ascenso, sin saltar de valor. La flecha de la barra indica la dirección actual. Durante la preparación el fuego, controles y barras están activos. Hay que regular la temperatura mientras se colocan ingredientes. El quemado avanza desde el inicio; la cocción requiere receta completa.

```ts
temperature += direction * TEMPERATURE_RATE_PER_SECOND * deltaSeconds
```

Solo se cocina en la zona ideal (40–70 %). Por debajo se detiene la cocción; por encima se detiene y aumenta el quemado. Dejarla calentando sola quema el plato antes de completarlo. Se puede completar alternando los controles para mantener la zona ideal durante aproximadamente 8 segundos. La configuración está en `cocinaConfig.ts`.

## Debug

En desarrollo, **DEV: mostrar controles** habilita los controles globales y de Cocina. Empiezan ocultos; se pueden ocultar otra vez. El HUD permite completar receta, agregar/quitar distractores, forzar temperatura ideal/alta, llevar cocción o quemado a 95 %, forzar resultado y reiniciar. En producción las herramientas se excluyen.

## Ingredientes actuales

Correctos: cubios, papa, habas, mazorca y costilla de res. Distractores: fresa, brócoli y berenjena. Sin ibias, chuguas, arvejas, tomate ni pimentón interactivos. Con arte: papa, habas, costilla y brócoli; los demás conservan un dibujo provisional con nombre. El reloj base sigue en 30 segundos y conserva la aceleración por sesión.

