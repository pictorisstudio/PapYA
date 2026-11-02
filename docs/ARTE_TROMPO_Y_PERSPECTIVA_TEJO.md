# Arte y perspectiva

Se registran cuatro claves estables en TROMPO_ASSETS: fondo, arena, jugador y rival. Se conservan las rutas de los PNG entregados en `public/assets/minigames/trompos/`. El fondo llena la pantalla y la base usa el centro de la arena de la simulación; un aro fino marca el límite real. Los dos trompos usan sprites de 92×92 giratorios. No cambian la física, IA, joystick ni criterios de victoria.

En Tejo, la escala del objetivo es 0,8 y su centro está en Y=260. Cancha, bocín, mechas, distancias entre blancos y radios de impacto se reducen de forma coherente. El disco visual pasa de 124 a 100 píxeles; conserva su área táctil para facilitar el agarre. El tamaño final durante el vuelo baja a 0,30. Se mantienen origen elevado y sensibilidad para alcanzar potencia máxima sin llegar al borde. Dos soportes y una sombra unen la cancha reducida con el suelo del fondo.

Validación: 80 pruebas, tipos y compilación correctos. Se comprobaron en navegador los cuatro assets del trompo y la perspectiva de Tejo. Las pruebas verifican tiros a todas las mechas y moñona con las nuevas dimensiones. Capturas: `docs/previews/trompo-arte-integrado.png` y `docs/previews/tejo-perspectiva-distancia.png`. Pendiente verificar sensación en teléfono físico.
