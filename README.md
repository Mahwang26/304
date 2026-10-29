# 304 — Tienda de tanques de agua

Sitio de venta de tanques de agua de **acero inoxidable** y **plástico** para la marca 304:
catálogo con modelos 3D interactivos, carrito, cuentas de clientes, pago con Mercado Pago y
panel de administración.

- Sitio publicado: https://hytank-next.vercel.app
- Repositorio: https://github.com/Mahwang26/304

## Qué tiene

| Tema | Dónde está |
|---|---|
| **React**: componentes, props, estado, hooks, formularios, consumo de APIs | `app/components/` (carrito, formularios de cuenta y compra, visor 3D) |
| **Next.js**: App Router, layouts, rutas dinámicas, Server Components, data fetching | `app/layout.js`, `app/acero/[linea]`, `app/plastico/[linea]`, `app/lib/catalog.js` (ISR, 60 s) |
| **Supabase**: tablas, relaciones, CRUD, Auth, RLS | `supabase/*.sql`, `app/lib/supabase*.js` |
| **Mercado Pago**: Checkout Pro, preferencias, estados de pago | `app/lib/mercadopago.js`, `app/api/mercadopago/`, `app/checkout/resultado` |
| **Autenticación y autorización**: login, registro, roles, middleware, sesiones | `app/components/AuthProvider.js`, `proxy.js`, `supabase/admin.sql` |
| **APIs y backend**: Route Handlers REST, validaciones, códigos HTTP, errores | `app/api/admin/`, `app/lib/modelInput.js` |
| **Testing y calidad**: Playwright, ESLint, testing manual | `tests/`, `playwright.config.js`, `eslint.config.mjs`, [sección de abajo](#debugging-y-testing-manual) |
| **Seguridad** | RLS en todas las tablas, `proxy.js`, encabezados en `next.config.mjs` |

### Para el cliente
- Catálogo por línea (Classic, Horizonte, Fino, Tower, Plast 3, Plast 3 XSlim, Plast 4, Plast 4 XSlim) con su tanque en 3D.
- Carrito que se guarda en el navegador, con selector de cantidad.
- Cuenta con email y contraseña; historial de pedidos con estado de entrega y de pago.
- Compra: los datos del comprador se completan con los del último pedido, y el pago se hace en Mercado Pago.

### Para el administrador (`/admin`)
- **Pedidos**: todos los pedidos, totales (por entregar, pagados, cobrado), filtro por estado y cambio de estado (Recibido → En preparación → Enviado → Entregado / Cancelado).
- **Catálogo**: editar, agregar y borrar modelos (capacidad, medidas, salida, precio).

## Tecnologías

Next.js 16 (App Router) · React 19 · three.js + React Three Fiber · Supabase (Postgres, Auth, RLS) ·
`@supabase/ssr` · Mercado Pago Checkout Pro · Playwright · ESLint · Vercel.

## Estructura

```
app/
  page.js, layout.js        pantalla de inicio y layout raíz (sesión + carrito)
  acero/ plastico/          catálogos y páginas por línea
  checkout/                 compra y regreso de Mercado Pago
  cuenta/                   ingreso, registro e historial
  admin/                    panel de administración (pedidos y catálogo)
  api/admin/                API REST del panel
  api/mercadopago/          preferencia de pago y notificaciones (webhook)
  components/               componentes (3D, carrito, header, formularios…)
  lib/                      acceso a datos, validaciones, Mercado Pago, formato
proxy.js                    middleware: protege /admin y /api/admin
supabase/                   SQL de la base (tablas, RLS, funciones)
tests/                      tests end-to-end con Playwright
```

## Puesta en marcha

Requisitos: Node.js 20 o más nuevo, una cuenta de Supabase y, para pagos, una de Mercado Pago Developers.

```bash
npm install
npm run dev        # http://localhost:3000
```

### Variables de entorno (`.env.local`, nunca se sube a git)

| Variable | Para qué |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto de Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Clave pública de Supabase (solo puede lo que permite RLS) |
| `MP_ACCESS_TOKEN` | Access Token de Mercado Pago (solo en el servidor) |
| `PAYMENTS_SECRET` | Clave que comparte el servidor con la base para registrar pagos |
| `RESEND_API_KEY` | Clave de Resend, para el mail a 304 cuando se aprueba un pago |
| `ORDER_NOTIFY_EMAIL` | A quién le llega ese mail (304tanques@gmail.com) |
| `E2E_ADMIN_EMAIL`, `E2E_ADMIN_PASSWORD` | Solo para los tests: cuenta administradora de prueba |

En Vercel se cargan las mismas variables (menos las de los tests).

### Base de datos

En Supabase → SQL Editor, correr en este orden:

1. `supabase/catalogo.sql`: líneas y modelos, con lectura pública.
2. `supabase/pedidos.sql`: pedidos y la función `create_order`, que toma los precios del catálogo y no los del navegador.
3. `supabase/cuentas.sql`: pedidos asociados a la cuenta y RLS para que cada cliente vea solo los suyos.
4. `supabase/mercadopago.sql`: estado de pago y la función `record_payment`.
5. La clave de pagos, con el mismo valor que `PAYMENTS_SECRET`:
   ```sql
   insert into private.settings (key, value) values ('payments_secret', 'EL-MISMO-VALOR-QUE-PAYMENTS_SECRET')
   on conflict (key) do update set value = excluded.value;
   ```
6. `supabase/aviso-pago.sql`: `record_payment` devuelve los datos del pedido la primera vez que se paga, para el mail a 304.
7. `supabase/admin.sql`: rol de administrador, `is_admin()` y políticas RLS de escritura.
8. `supabase/hacer-admin.sql`, con el email de la cuenta que va a administrar (la cuenta se crea antes en `/cuenta`).

Además, en Authentication → Sign In / Providers → Email, apagar **Confirm email**: el servicio de mails que
trae Supabase solo envía a los miembros del proyecto.

Los demás archivos de `supabase/` (`agregar-*`, `renombrar-tower`, `intemperie-exterior`) son cambios que se
aplicaron sobre la base ya creada. Una base nueva no los necesita: `catalogo.sql` ya los incluye.

## Seguridad

- **RLS en todas las tablas.** Con la clave pública cualquiera lee el catálogo. Cada cliente lee solo sus pedidos. Solo un administrador puede modificar el catálogo, y de un pedido solo puede cambiar el estado de entrega.
- **Las funciones de la base validan todo.** `create_order` exige sesión y toma los precios del catálogo. `record_payment` exige la clave de pagos y solo marca un pedido como pagado si se pagó el total.
- **Doble control de acceso al panel.** `proxy.js` deja pasar a `/admin` y `/api/admin` solo a administradores: sin sesión responde 401 o redirige al login, y sin rol responde 403. Las páginas del panel y la API vuelven a verificar el rol, y la base tiene la última palabra.
- **Mercado Pago es la única fuente del estado de un pago.** El webhook y la página de regreso no confían en lo que reciben: consultan el pago en la API de Mercado Pago.
- **Encabezados HTTP** (`next.config.mjs`):
  - Content-Security-Policy: solo se cargan scripts e imágenes propias, solo se conecta con Supabase y el sitio no se puede mostrar dentro de otra página.
  - `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` y HSTS.
- **Secretos.** El token de Mercado Pago y la clave de pagos están solo en el servidor (`import "server-only"`). La cuenta administradora de prueba usa un email que no puede recibir correos, así que nadie puede pedir un cambio de contraseña.

## API REST del panel

Todas requieren una sesión de administrador (cookie). Responden JSON con `{ error }` si algo falla.

| Método y ruta | Qué hace | Respuestas |
|---|---|---|
| `GET /api/admin/models?linea=classic` | Lista modelos (opcional: de una línea) | 200, 401, 403 |
| `POST /api/admin/models` | Crea un modelo | 201, 400 (datos inválidos), 409 (repetido) |
| `PATCH /api/admin/models/:id` | Cambia campos de un modelo | 200, 400, 404 |
| `DELETE /api/admin/models/:id` | Borra un modelo | 204, 404 |
| `GET /api/admin/orders?estado=enviado` | Lista pedidos con sus productos | 200, 400 |
| `PATCH /api/admin/orders/:id` | Cambia el estado de entrega `{ status }` | 200, 400, 404 |

Pagos: `POST /api/mercadopago/preference` (con la sesión del cliente) devuelve la URL de pago, y
`POST /api/mercadopago/webhook` recibe las notificaciones de Mercado Pago.

## Tests y calidad

```bash
npm run lint                                              # ESLint, sin errores
npm run test:e2e                                          # Playwright contra localhost (lo levanta solo)
PLAYWRIGHT_BASE_URL=https://hytank-next.vercel.app npm run test:e2e   # contra el sitio publicado
npx playwright show-report                                # informe HTML del último run
```

Usan el Chrome instalado (`channel: "chrome"`) y corren en dos proyectos, escritorio y celular (Pixel 7).

| Archivo | Qué prueba |
|---|---|
| `tests/catalogo.spec.js` | Inicio, páginas de línea con precios, pestañas, 404 de una línea inexistente |
| `tests/carrito.spec.js` | Elegir cantidad y agregar, persistencia al recargar, total, vaciar el carrito |
| `tests/cuentas.spec.js` | Comprar exige sesión, contraseñas que no coinciden, contraseña incorrecta |
| `tests/admin.spec.js` | Sin sesión: redirección y 401. Como administrador: panel, validación (400), crear (201), repetido (409), editar y borrar un modelo de prueba |
| `tests/seguridad.spec.js` | Encabezados de seguridad, que la CSP no bloquee nada del sitio, mismo mensaje de error con cualquier email |

Los tests de administrador modifican el catálogo real: crean un modelo con nombre único y lo borran
siempre al final (`try/finally`), aunque algún paso falle.

## Debugging y testing manual

Recorrido manual antes de publicar, con las DevTools del navegador (F12):

1. **Consola**: recorrer inicio, una línea de acero, una de plástico, `/cuenta` y `/checkout`. No tiene que haber errores rojos ni avisos de "Content Security Policy".
2. **Red (Network)**:
   - Al iniciar sesión hay un `POST .../auth/v1/token` con respuesta 200.
   - Al confirmar una compra, `POST .../rpc/create_order` y después `POST /api/mercadopago/preference`, que devuelve `{ url }`.
   - En el panel, cada cambio es un `PATCH`/`POST`/`DELETE` a `/api/admin/...` con 200, 201 o 204.
3. **Aplicación (Application)**:
   - En *Local Storage*, `304-cart` guarda el carrito.
   - En *Cookies*, `sb-…-auth-token` es la sesión. Si la borrás y recargás `/admin`, te tiene que mandar al login.
4. **Permisos**: con una cuenta de cliente, entrar a `/admin` muestra "No tenés permiso" (status 403 en Network).
5. **Celular**: con *Toggle device toolbar* (Ctrl+Shift+M) en 390 px de ancho no tiene que haber scroll horizontal.
6. **Pago de prueba** (con credenciales de un vendedor de prueba):
   - En Mercado Pago elegir **"Ingresar con mi cuenta"** con la cuenta de **comprador de prueba** (`TESTUSER…`). Pagar como invitado o con una cuenta real falla con "No pudimos procesar tu pago".
   - Usar una ventana normal: en incógnito Chrome bloquea cookies de terceros y el botón Pagar queda deshabilitado.
   - Tarjeta `4509 9535 6623 3704` (Visa) o `5031 7557 3453 0604` (Mastercard), vencimiento 11/30, código 123, titular `APRO` para que se apruebe (`OTHE` para que se rechace).
   - El pedido tiene que figurar "Pagado" en Mi cuenta y en el panel. Así se verificó el 23/10/2026: pedido N.º 3, pago 184616807653, registrado por el aviso de Mercado Pago un segundo después de pagar.

Para depurar el servidor (Route Handlers, `proxy.js`), los `console.error` aparecen en la terminal de
`npm run dev` y, en producción, en Vercel → Logs.

## Deploy

```bash
vercel --prod
```

El proyecto de Vercel no está conectado al repositorio: el deploy se hace a mano con la CLI.
