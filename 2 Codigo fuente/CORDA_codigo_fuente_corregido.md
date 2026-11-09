# CORDA · Código fuente

Exportación: 4 de noviembre de 2026.

Versión local: `fc7c04709b6ec84fe85a14aaf14c9bc450b8f0f7`.

Corregido el 4 de noviembre de 2026: tres errores en `dist/app.js`, `dist/community.js` y `dist/dashboard-language.js` (volver al registro ya no borra objetivos ni revisiones; los tutores aparecen en el directorio; las traducciones no cambian el texto escrito por los usuarios).

Inicio de sesión añadido el 4 de noviembre de 2026: nuevo archivo `dist/auth.js` (cuentas con correo y contraseña guardadas solo en este navegador, con la contraseña protegida por hash PBKDF2; opción «Recordarme» y botón «Cerrar sesión»), y cambios en `dist/app.js`, `dist/roles.js`, `dist/index.html` y `dist/style.css`.

Rediseño y sección añadidos el 4 de noviembre de 2026: tokens del brand book en `dist/styles/tokens.css` (tema «cancha» por defecto y «arena»), `dist/style.css` reescrito usando solo esos tokens, tarjeta de próxima sesión con «Confirmar asistencia», sección «Sobre CORDA» (misión, visión y valores) en `dist/sobre-corda.js` y `dist/styles/sobre-corda.css`, y video de fondo en la portada.

Portada, reseñas y asistente añadidos el 4 de noviembre de 2026: la portada ya no tiene botón de pausa (el video corre en bucle), suma accesos directos a Instagram, correo y WhatsApp, pie alineado y una flecha animada hacia la misión; sección de reseñas de ejemplo con desplazamiento automático en `dist/resenas.js`; y Ace, el asistente guiado de CORDA, en `dist/ace.js` y `dist/styles/ace.css`.

Progreso y sesiones actualizados el 4 de noviembre de 2026: «Mi progreso» ahora tiene una encuesta diaria del jugador, la evaluación diaria del coach (con pregunta de asistencia) y tres gráficas (cómo se siente el jugador, cómo lo ve el coach y la comparación) con periodo diario, semanal, mensual, trimestral o anual; el 100 % es la meta escrita al registrarse y los torneos añadidos aparecen solos en las gráficas (`dist/progress-hub.js`). En la ventana de cada sesión se quitaron el enlace a la biblioteca, el estado por horario y el botón «Completar sesión»; la guía se llama «Explicación del ejercicio» e incluye un recuadro para el video.

Ajustes del 4 de noviembre de 2026 (segunda ronda): el recuadro del video quedó debajo de los pasos de «Explicación del ejercicio»; la encuesta del jugador también pregunta si fue al entrenamiento y, si no fue, omite las demás preguntas; y los archivos de `dist/index.html` y `dist/movil.html` llevan una marca de versión (`?v=…`) para que el navegador siempre cargue la versión más reciente.

> **Ajustes del 5 de noviembre de 2026.** Meta guiada en el registro (paso 7), fotos de fondo según el tipo de entrenamiento físico (`dist/assets/sesiones/`), «Mi progreso» simplificado (solo resumen y tres gráficas), «Competencias» arriba en «Mi plan», «Mi perfil» en el menú principal y versión de caché `?v=20261105i`.

> **Ajustes del 6 de noviembre de 2026.** Colores 60-30-10 (fondo verde, tarjetas arena, lima solo en la acción principal), «Mi perfil» y «Cerrar sesión» centrados al final, torneos próximos destacados en «Competencias», periodos de «Mi progreso» que se abren según los días con datos, resumen de progreso sin puntos faltantes ni próximo torneo, «Mi academia» con video de fondo en toda la página, equipo sin tarjetas y sin botones de pausa en videos en bucle. Versión de caché `?v=20261106p`.

> **Fase A de Supabase (8 nov 2026):** registro e inicio de sesión con cuentas reales. `dist/vendor/supabase-2.119.0.js` es la librería oficial @supabase/supabase-js 2.119.0 (no se copia aquí; se descarga de https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.119.0/dist/umd/supabase.js). El SQL está en la carpeta `supabase/`.

> **Fase B de Supabase (8 nov 2026):** `dist/sync.js` sincroniza plan, encuestas, evaluaciones, metas, torneos, mensualidades, anuncios y citas con la tabla `items` (SQL en `supabase/03_datos_compartidos.sql`).

> **Recuperar contraseña y lista de academias (8 nov 2026):** «¿Olvidaste tu contraseña?» manda un enlace por correo; la academia se elige de la lista de Supabase (`supabase/04_academias_publicas.sql`).

> **Privacidad de perfiles (8 nov 2026):** en «Mi academia» solo se ven nombre, rol y lo que cada quien escriba en su ficha; las metas ya no se muestran (`supabase/05_privacidad_perfiles.sql`).

> **Fase C y clases particulares (8 nov 2026):** fotos y comprobantes en Supabase Storage (`supabase/06_fotos_y_comprobantes.sql`); el jugador sube el comprobante de una clase particular y solo lo ve el coach elegido (`supabase/07_clases_particulares.sql`).

> **Saludo del día (8 nov 2026):** el recuadro de abajo a la izquierda saluda por nombre con una frase distinta cada día según el rol.

> **Biblioteca de video (8 nov 2026):** los coaches comparten videos de YouTube con categoría y nota; el jugador los ve dentro de la app y marca «Ya lo vi» (`supabase/08_videos_vistos.sql`).

> **Calendario del celular (8 nov 2026):** `dist/calendar.js` genera un archivo .ics con los entrenamientos de las próximas 4 semanas (recordatorio 1 h antes, se actualiza sin duplicar) y un aviso diario en Inicio cuando hay algo nuevo.

> **Avisos legales (9 nov 2026):** `dist/legal.js` trae el Aviso de privacidad, los Términos y condiciones y el Consentimiento de madre, padre o tutor. El registro pide aceptarlos (los jugadores indican si son mayores o menores de 18 años; los tutores dan su consentimiento) y las cuentas que ya existían ven una ventana de aceptación. La constancia se guarda en `profiles.details.consent`. Borrador: falta completar el domicilio y que lo revise una persona abogada. Versión de caché `?v=20261109a`.

> **Menores y tutor, y «Análisis del coach» (9 nov 2026):** el jugador menor de 18 años escribe el correo de su tutor y puede seguir usando la app; en Inicio ve un aviso con botones para mandar la invitación por WhatsApp o correo (`dist/guardian.js`). El tutor crea su cuenta con ese correo, acepta la invitación y administra al jugador; `supabase/09_tutor_autorizado.sql` hace que solo así se vincule. «Mi progreso» del jugador se llama ahora «Análisis del coach» mientras se define cómo medir su trayectoria con números. Versión de caché `?v=20261109b`.

Códigos de acceso de un solo uso (access.js, SQL 10): la academia y el rol salen del código al registrarse.

## Cómo usar este documento

Contiene el código completo de los archivos de texto de la aplicación, separado por ruta. Para reconstruirla, copia cada bloque en un archivo con la ruta indicada y sirve la carpeta `dist` con un servidor web estático. Por ejemplo: `python3 -m http.server 8000 --directory dist`.

Es un prototipo con almacenamiento local en el navegador; este código no incluye autenticación real ni una base de datos compartida. Los archivos de imagen y video se enumeran al final, pero no se incrustan en este Markdown: deben copiarse a las rutas correspondientes para conservar los fondos y fotografías.

## Índice



## Recursos multimedia (no incluidos como bytes)

| Ruta | Tamaño (bytes) | SHA-256 |
|---|---:|---|
| `dist/assets/corda-plyo.webp` | 64044 | `630959a972c98e871a35e8d98a596c8bd968c2b7a524403309cff87761feae2e` |
| `dist/assets/corda-strength.webp` | 42824 | `e142073404c178feb17ddd6bb2bfa22d7aea06f87a70f0e937733455a73c8437` |
| `dist/assets/tennis-close-poster.jpg` | 67152 | `d8eaf205267ef66458141b975fc4ce8c17f026cda3d4892c2179f645a07f5486` |
| `dist/assets/tennis-close.mp4` | 4502040 | `487f730ea520088f6ac4802411353557d21df9fa99823dca71bb21682768ed53` |
| `dist/assets/tennis-poster.jpg` | 78214 | `68da7bd94d28fafc8443cb94a44263f1a0bacd07808630cd3f424a165eb48da7` |
| `dist/assets/tennis-rally-poster.jpg` | 62223 | `4a2f5eefc2fad6d38c23a8ca66eaf3d04192743f8cfef129431dc23de5176a04` |
| `dist/assets/tennis-rally.mp4` | 1988990 | `e997f76b05fbb059620d6a457aa136b1471042fedccc8d3a1df7a332710a014b` |
| `dist/assets/tennis.mp4` | 1792323 | `e3ebb2d5860ef0d288743581c36b38cb730521b230eeb7f5bd818d23983fcbe4` |
| `dist/assets/sesiones/agilidad.jpg` | 280671 | `cc72003eae6d240bb4b36963aa27a6bb3f273a090d66a61b0ccf01daf5143387` |
| `dist/assets/sesiones/cardio.jpg` | 130528 | `06a2df03fe3e454459187093f4c0d220bdb7e83b5d2e0c5f76e25f9fe3328488` |
| `dist/assets/sesiones/fuerza.jpg` | 245098 | `41245cc4c54e61c8e648968fc26813b98bdea97bd866b3cc3c7b343598172d27` |
| `dist/assets/sesiones/isometria.jpg` | 102151 | `d5c5ca4fab8b69243d6bf25f1c7a7985e59d71181aaf6b080423a13c06c9580d` |
| `dist/assets/sesiones/movilidad.jpg` | 238373 | `6872ae9bb48cd5eb60e2e0fe4a26f73b895ea763025d053b9c637424583bb9ce` |
| `dist/assets/sesiones/pliometria.jpg` | 335934 | `f96f934b9ac8879b5a57f4494f002866f7eb5eea8ffa774e86a358180268bb36` |
