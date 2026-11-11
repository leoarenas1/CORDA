# CORDA final

Todo lo de CORDA en una sola carpeta. Reunido el 5 de noviembre de 2026.

## Qué hay en cada carpeta

**1 App CORDA (version final)**
La versión buena de la app, con todas las correcciones hasta «Mi perfil» en el menú.
- `dist/` es la app: `index.html` (computadora) y `movil.html` (celular).
- `dist/assets/` tiene el video de bienvenida, su póster y las 6 fotos de entrenamiento físico.
- `ASSET_CREDITS.md` tiene los créditos del video (Mixkit) y de las fotos (Pexels).

**2 Codigo fuente**
`CORDA_codigo_fuente_corregido.md`: el código de la versión final en un solo documento, separado por archivo. Las fotos y el video no van dentro; están en la carpeta 1.

**3 Version publicada en claude.ai**
La misma app, tal como se subió a claude.ai (sin las marcas de caché `?v=`).

**4 Marca y diseno**
Los dos logotipos de CORDA y la sección «Sobre CORDA» (`SobreCorda.jsx` y `sobre-corda.css`).

**6 Pagina web corda.mx**
La página de venta de CORDA (corda.mx): qué es, qué gana una academia, precio de CORDA Conecta, formulario de demo y botones de descarga. Ver su `LEEME.md` para lo que falta configurar antes de publicar. Tiene su propio repositorio privado (`CORDA-PAGINA`) y su propia base de datos en Supabase (su script SQL está en su carpeta `supabase/`). Nada de esto va en el repositorio de la app.

**5 Version original**
La app como estaba antes de las correcciones, más `corda-fixes.patch` con los primeros tres arreglos.

## Links en línea (privados, solo para tu cuenta)

- App CORDA en claude.ai: https://claude.ai/artifact/6HB89o3ohXS8Wzt7NuPF5n
- Misión, visión y valores: https://claude.ai/artifact/NAhGvvjPPUA3r9vCHxwe1w
- Sistema de diseño CORDA: https://claude.ai/artifact/TnT9cmgS8AATBX95rNThWp

## Cómo abrir la app en esta Mac

En Terminal, desde la carpeta «1 App CORDA (version final)»:

```bash
ruby -run -e httpd dist -p 8001
```

Luego abre http://localhost:8001 en el navegador (o http://localhost:8001/movil.html para la vista de celular). Los datos se guardan en ese navegador.
