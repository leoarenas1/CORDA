# Pruebas de seguridad de las reglas de Supabase

Scripts: [`pruebas_seguridad.sql`](pruebas_seguridad.sql) (datos, códigos y registro) y [`pruebas_seguridad_storage.sql`](pruebas_seguridad_storage.sql) (fotos y comprobantes). Se corre en Supabase → SQL Editor → New query → Run.
Usa personas inventadas (jugadores, tutores y coaches de dos academias de mentira) y se deshace solo al terminar:
el mensaje rojo «ERROR» con el reporte es lo esperado y no deja ningún dato.

## Qué se comprueba

- Un jugador no lee datos de otro jugador ni de otra academia, ni la libreta privada del coach; no puede volverse Coach,
  cambiarse de academia, escribirse una evaluación, editar o borrar lo del coach, ni crear códigos de acceso.
- Un tutor solo ve al jugador que lo nombró (o al que su código lo ligó); uno que nadie nombró no ve a ningún jugador.
- Un coach de otra academia no ve nada; un coach sin aprobar tampoco; un coach no ve los pagos ni la libreta privados de otro coach.
- Sin sesión no se puede leer datos ni perfiles, ni crear códigos.
- Los códigos de acceso sirven una sola vez; no sirven si están revocados, vencidos o son de otro perfil.
  Coach y Tutor no se registran sin código; un jugador sin código queda sin academia aunque escriba la de otra.
  El código de dueño no le quita la academia a su dueño actual.

## Resultados

| Fecha | Ajustes aplicados | Resultado |
|---|---|---|
| 2026-11-09 | 01 a 11 | Datos, códigos y registro: **69 bien, 0 fallaron** |
| 2026-11-09 | 01 a 11 | Archivos (Storage): 41 bien, 1 falló (un archivo privado llamado `avatar.jpg` lo veía toda la academia) |
| 2026-11-09 | 01 a 12 | Archivos (Storage), tras el ajuste 12: **42 bien, 0 fallaron** |
| 2026-11-10 | 01 a 13 | Datos, códigos y registro, con las pruebas del chequeo de estado físico: **73 bien, 0 fallaron** |

## Alcance y límites

- Prueba las reglas de la base de datos (RLS, funciones y el registro). No recorre la app con cuentas reales de punta a punta.
- Los archivos (Storage, bucket `media`) se prueban con el segundo script. Las pruebas se hacen con datos de la base, no subiendo archivos reales por la API de Storage.
- Volver a correrla después de cada ajuste que toque reglas o permisos, y agregar una fila a la tabla de resultados.
