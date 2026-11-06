# CORDA

Tu juego, con dirección. Prototipo de app para academias de tenis, con vistas para jugador, coach y tutor: plan semanal (tenis y físico), competencias, progreso con encuestas diarias del jugador y evaluaciones del coach, mensualidad, academia y perfil.

## Qué hay aquí

- `1 App CORDA (version final)/dist/`: la app. Es HTML, CSS y JavaScript sin dependencias ni paso de compilación.
  - `index.html`: vista de computadora.
  - `movil.html`: vista de celular.
  - `assets/`: video de bienvenida, póster y fotos de entrenamiento físico.
- `1 App CORDA (version final)/ASSET_CREDITS.md`: créditos del video (Mixkit) y las fotos (Pexels).
- `2 Codigo fuente/`: todo el código en un solo documento Markdown.
- `4 Marca y diseno/`: logotipos y la sección «Sobre CORDA».
- `LEEME.md`: guía de las carpetas.

## Cómo abrirla

```bash
cd "1 App CORDA (version final)"
ruby -run -e httpd dist -p 8001
```

Luego abre http://localhost:8001 (o http://localhost:8001/movil.html para la vista de celular). También sirve cualquier servidor estático que apunte a `dist/`.

Los datos se guardan solo en el navegador (localStorage); no hay servidor ni base de datos.
