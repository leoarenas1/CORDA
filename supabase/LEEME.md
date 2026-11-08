# CORDA + Supabase

Plan para que la app tenga cuentas reales y datos compartidos entre jugador, coach y tutor.

## Por fases

| Fase | Qué cambia | Estado |
|---|---|---|
| **A · Cuentas** | Registro e inicio de sesión reales con correo y contraseña. Se guarda el perfil de cada persona (correo, nombre, rol, academia). | ✅ Funcionando (8 nov 2026). SQL: `01_cuentas.sql` + `02_perfil_completo.sql` |
| **B · Datos compartidos** | Plan (sesiones), encuestas y evaluaciones, competencias, revisiones del coach, anuncios y equipo de la academia. El coach ve lo de sus jugadores. | Pendiente |
| **C · Archivos** | Fotos de perfil y comprobantes de pago en Supabase Storage. | Pendiente |
| **D · Pasar datos** | Al entrar por primera vez, ofrecer subir lo que ya está guardado en el navegador. | Pendiente |

Mientras se termina cada fase, lo que todavía no está en Supabase sigue guardándose en el navegador como hoy.

## Crear el proyecto (lo hace Leonardo)

1. Entra a https://supabase.com y crea una cuenta.
2. **New project**:
   - Name: `corda`
   - Database password: genera una y guárdala en tu gestor de contraseñas. No la compartas.
   - Region: **East US (North Virginia)**, la más cercana a México disponible.
3. Cuando termine de crearse, ve a **SQL Editor → New query**, pega todo `01_cuentas.sql` y presiona **Run**. Haz lo mismo con `02_perfil_completo.sql`.
   - Al crear el proyecto: **Enable Data API** activado, **Automatically expose new tables** desactivado y **Enable automatic RLS** activado.
4. Ve a **Authentication → Sign In / Providers → Email** y deja activado **Confirm email**.
5. En **Authentication → URL Configuration**, pon en **Site URL** la dirección donde vive la app (hoy `http://localhost:8001`; cuando se publique, su dominio).
6. Ve a **Project Settings → API** (o **Connect**) y copia solo estos dos datos:
   - **Project URL** (algo como `https://abcd1234.supabase.co`)
   - **Publishable key** o **anon public key**

   Van en `1 App CORDA (version final)/dist/supabase-config.js`.

## Qué llaves sí y cuáles no

- **Project URL** y **publishable / anon key**: se pueden poner en la app. Están hechas para ir en el navegador; lo que protege los datos son las reglas de seguridad (RLS) de `01_cuentas.sql`.
- **service_role / secret key** y **contraseña de la base de datos**: **nunca** en la app, en GitHub ni en el chat. Dan acceso total.

## Antes de recibir usuarios reales

- Aviso de privacidad (Ley Federal de Protección de Datos Personales en Posesión de los Particulares).
- Consentimiento del tutor para jugadores menores de edad.
- El correo de confirmación de Supabase sirve para pruebas (envía pocos por hora). Para muchos usuarios, configurar un servicio de correo propio (SMTP).
