# clase13project

Frontend de e-commerce en React + Vite conectado a un backend real con autenticación JWT en cookie HttpOnly, Redux Toolkit y estado global para carrito y wishlist.

## Objetivo de esta feature

- Centralizar el estado global con Redux Toolkit.
- Gestionar autenticación real con cookie JWT HttpOnly.
- Proteger rutas privadas.
- Sincronizar carrito y wishlist con el backend.
- Restaurar la sesión tras recargar consultando el backend.
- Permitir checkout y creación de reseñas autenticadas.

## Stack

- React + Vite
- React Router
- Axios
- Redux Toolkit
- React Redux

## Estructura relevante

```text
src/
	api/
		axios.js
		auth.js
		cart.js
		wishlist.js
		products.js
		reviews.js
	store/
		index.js
		slices/
			authSlice.js
			cartSlice.js
			wishlistSlice.js
	components/
		AdminRoute/
		PrivateRoute/
		Spinner/
		WishlistButton/
		ReviewForm/
	pages/
		AdminPage/
		AdminProductsPage/
		AdminProductFormPage/
		HomePage/
		ProductsPage/
		ProductDetailPage/
		LoginPage/
		RegisterPage/
		CartPage/
		WishlistPage/
		ProfilePage/
		CheckoutPage/
		CheckoutSuccessPage/
```

## Requisitos previos

- Node.js 18+
- npm
- Backend corriendo en http://localhost:3000
- Base de datos ya conectada en backend

## Configuración del frontend

1. Crear archivo `.env` en la raíz del proyecto:

```env
VITE_API_BASE_URL=http://localhost:3000
```

### Configuración de producción en Netlify

El build de producción utiliza `https://backend-lite-sprint13.onrender.com`, definido en `.env.production`.

En Netlify, revisar **Site configuration → Environment variables** y configurar:

```env
VITE_API_BASE_URL=https://backend-lite-sprint13.onrender.com
```

La variable no debe contener comillas, espacios finales ni `/products`. Después de cambiarla es necesario desplegar nuevamente el sitio para que Vite incorpore el valor al bundle.

2. Instalar dependencias:

```bash
npm install
```

3. Levantar frontend:

```bash
npm run dev
```

El frontend se abre en http://localhost:5173

## Cómo ejecutar backend + frontend

### 1) Backend

En el repositorio del backend:

```bash
npm install
npm run dev
```

Debe quedar activo en http://localhost:3000

### 2) Frontend

En este repositorio:

```bash
npm install
npm run dev
```

Debe quedar activo en http://localhost:5173

## Endpoints esperados del backend

### Públicas

- GET /products
- GET /products/:id
- GET /products/:id/reviews
- POST /auth/login
- POST /auth/register
- POST /auth/logout
- POST /payments/checkout-session

### Privadas

- GET /cart
- GET /auth/me
- POST /cart/items
- DELETE /cart/items/:itemId
- POST /cart/checkout
- GET /wishlist
- POST /wishlist/:productId
- POST /products/:id/reviews

### Administración (rol ADMIN)

- POST /products
- PUT /products/:id
- DELETE /products/:id

Las peticiones incluyen credenciales para que el navegador envíe la cookie de sesión:

```js
axios.create({ withCredentials: true })
```

## Rutas del frontend

- /
- /products
- /products/:productId
- /login
- /register
- /cart
- /wishlist
- /profile
- /admin (solo rol ADMIN)
- /admin/products (solo rol ADMIN)
- /admin/products/new (solo rol ADMIN)
- /admin/products/:id/edit (solo rol ADMIN)
- /checkout
- /checkout/success
- * (404)

## Funcionalidades implementadas

- Login y registro con Redux Toolkit.
- Cookie de sesión HttpOnly gestionada por el backend; el token no se expone a JavaScript.
- Restauración de sesión mediante `GET /auth/me` al iniciar la aplicación.
- Manejo global de `401` con redirección a login y aviso de sesión expirada.
- Rutas privadas con `PrivateRoute`.
- Panel `/admin` protegido por rol mediante `AdminRoute` y `selectIsAdmin`.
- CRUD de productos con listado, creación, edición y eliminación confirmada.
- Formulario único de alta y edición con validaciones de campos, precio, stock e imagen por URL.
- Carrito global con fetch, add, remove y redirección a Stripe Checkout.
- Wishlist global con fetch y toggle.
- Perfil con datos del usuario y logout.
- ReviewForm autenticado para crear reseñas.
- Spinner reutilizable para estados de carga visibles.

## Optimizacion de render y datos derivados

### useMemo aplicado en catalogo

- En ProductsPage, la lista visible se calcula con `useMemo` para combinar filtro + orden sin recalcular en cada render.
- El orden se aplica sobre copia del array (`slice().sort(...)`) para no mutar el estado base.
- Dependencias del memo: products, selectedCategory, searchTerm y sortBy.

### useMemo aplicado en wishlist

- En WishlistPage se usa un mapa memoizado de productos por id para evitar `find` repetidos por cada favorito.
- Los productos mostrados en favoritos se derivan con `useMemo` a partir de ids + mapa.

### Regla de datos derivados

- Estado base: products, cart.items, wishlist.ids.
- Estado derivado: visibleProducts, wishlistProducts, totales.
- Los derivados no se guardan en estado adicional; se calculan con memoizacion cuando corresponde.

## Criterio practico para usar useMemo

Usar useMemo cuando:

- Hay recorridos de arrays (filter/map/sort/reduce) que se ejecutan con frecuencia.
- El componente re-renderiza mucho y el calculo no es trivial.

No usar useMemo cuando:

- El calculo es simple (booleanos o transformaciones pequeñas).
- No hay impacto real de rendimiento o claridad.

## Contrato wishlist (toggle)

- Endpoint: `POST /wishlist/:productId`.
- Flujo frontend:
	1. Toggle optimista local en Redux.
	2. Sincronizacion con backend.
	3. Reconciliacion con respuesta final del servidor.

## Flujo de compra end-to-end

1. Usuario navega por `/products`.
2. Abre detalle en `/products/:productId`.
3. Añade al carrito y revisa en `/cart`.
4. Solicita una Checkout Session desde `/checkout` y paga en Stripe.
5. Stripe vuelve a `/checkout/success?session_id=...` si completa el flujo.
6. Si cancela, Stripe vuelve a `/checkout?canceled=true` sin vaciar el carrito.

La URL de éxito no demuestra por sí sola que el pago esté confirmado. La creación
definitiva del pedido debe depender de la confirmación segura recibida por el backend.

### UX de estados

- Loading visible con Spinner en vistas principales.
- Mensajes de error consistentes con accion `Reintentar` en catalogo, wishlist y carrito.
- Estado separado de checkout (`isCheckingOut`) para evitar doble envio y mostrar feedback claro.

## Verificación rápida

1. Abrir http://localhost:5173/login y comprobar que puedes iniciar sesión.
2. Recargar la página y comprobar que la sesión persiste.
3. Abrir rutas privadas como /cart, /wishlist o /profile.
4. Comprobar que un usuario USER no ve ni puede abrir `/admin` y que un ADMIN sí puede.
5. Añadir un producto al carrito desde /products.
6. Añadir o quitar un producto de favoritos.
7. Ir a /cart, abrir checkout y continuar al pago de Stripe.
8. Usar la tarjeta de prueba `4242 4242 4242 4242` con fecha futura y cualquier CVC.
9. Comprobar el retorno a `/checkout/success?session_id=...`.
10. Cancelar otro intento y comprobar el retorno a `/checkout?canceled=true`.
11. Abrir un detalle de producto y crear una reseña autenticada.

## Checklist de cierre de sprint

- Filtros y ordenacion de productos funcionando correctamente.
- Sin mutaciones directas de arrays de estado para ordenar/listar.
- Wishlist estable al añadir/quitar desde catalogo y pagina de favoritos.
- Carrito, checkout y confirmacion final operativos.
- Navegacion fluida en el flujo catalogo → detalle → carrito → checkout → exito.
- Estados de loading/error consistentes en pantallas clave.

## Scripts disponibles

```bash
npm run dev
npm run build
npm run preview
npm run lint
npm test
npm run test:watch
```

## Pruebas automatizadas

El frontend utiliza Vitest, jsdom y React Testing Library. La suite está aislada del backend real y no modifica datos.

Las pruebas cubren:

- Incremento y actualización de cantidades en Redux.
- Uso de `PATCH` para cambiar cantidad y `DELETE` para eliminar una línea del carrito.
- Conservación del carrito cuando una actualización falla.
- Redirección de usuarios no autenticados.
- Protección de `/admin` para roles `USER` y `ADMIN`.
- Campos obligatorios de login.
- Longitud mínima de contraseña en registro.
- Visualización de errores devueltos por el backend.

Ejecutar una sola vez:

```bash
npm test
```

Ejecutar en modo observación:

```bash
npm run test:watch
```

## Notas

- Si cambias `.env`, reinicia Vite.
- Si hay errores de red, revisa que backend esté encendido y CORS permita http://localhost:5173.
- Si la cookie de sesión expira, el frontend pedirá iniciar sesión de nuevo.
