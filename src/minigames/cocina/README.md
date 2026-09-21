# Maestro de la Cocina Campesina

Prototipo funcional para preparar un solo Cocido Boyacense en 30 segundos. La escena mantiene un unico reloj: primero se arrastran ingredientes a la olla y, cuando la receta queda completa, comienza automaticamente la coccion.

## Flujo

`CocinaScene` coordina fases, input, HUD y resultado global. `IngredientManager` controla drag/drop y slots internos de olla. `RecipeManager` valida 5 ingredientes correctos y 0 distractores. `CookingSystem` actualiza fuego, temperatura, coccion y quemado. `CocinaScoreManager` calcula un puntaje simple al terminar, pero la victoria depende solo de cocinar el plato sin quemarlo.

## Temperatura

Los botones modifican `fireLevel`. La temperatura tiene inercia:

```ts
temperature += (fireLevel - temperature) * HEAT_RESPONSE * delta
```

En temperatura baja la coccion avanza lento. En temperatura optima avanza rapido. En temperatura alta tambien cocina, pero aumenta el quemado.

## Debug

Con `DEBUG_MODE = true`, el HUD permite completar receta, agregar/quitar distractores, forzar temperatura optima/alta, llevar coccion o quemado a 95%, forzar victoria/derrota y reiniciar. El toggle global de areas tactiles muestra drop area, slots y hit areas. Con `DEBUG_MODE = false`, estas herramientas no se crean.
