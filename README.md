# clase13project

Frontend de e-commerce en React + Vite conectado a un backend real con autenticación JWT, Redux Toolkit y estado global para carrito y wishlist.

## Objetivo de esta feature

- Centralizar el estado global con Redux Toolkit.
- Gestionar autenticación real con token JWT.
- Proteger rutas privadas.
- Sincronizar carrito y wishlist con el backend.
- Mantener sesión tras recargar mediante persistencia local.
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
		PrivateRoute/
		Spinner/
		WishlistButton/
		ReviewForm/
	pages/
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

### Privadas

- GET /cart
- POST /cart/items
- DELETE /cart/items/:itemId
- POST /cart/checkout
- GET /wishlist
- POST /wishlist/:productId
- POST /products/:id/reviews

Header requerido en privadas:

```http
Authorization: Bearer <token>
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
- /checkout
- /checkout/success
- * (404)

## Funcionalidades implementadas

- Login y registro con Redux Toolkit.
- Persistencia local de token y usuario.
- Interceptor Axios para adjuntar token automáticamente.
- Manejo global de `401` con redirección a login y aviso de sesión expirada.
- Rutas privadas con `PrivateRoute`.
- Carrito global con fetch, add, remove y checkout.
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
4. Confirma compra en `/checkout`.
5. Recibe confirmacion en `/checkout/success`.

### UX de estados

- Loading visible con Spinner en vistas principales.
- Mensajes de error consistentes con accion `Reintentar` en catalogo, wishlist y carrito.
- Estado separado de checkout (`isCheckingOut`) para evitar doble envio y mostrar feedback claro.

## Verificación rápida

1. Abrir http://localhost:5173/login y comprobar que puedes iniciar sesión.
2. Recargar la página y comprobar que la sesión persiste.
3. Abrir rutas privadas como /cart, /wishlist o /profile.
4. Añadir un producto al carrito desde /products.
5. Añadir o quitar un producto de favoritos.
6. Ir a /cart y completar checkout.
7. Comprobar la redirección a /checkout/success.
8. Abrir un detalle de producto y crear una reseña autenticada.

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
- Si el token expira, el frontend limpiará la sesión y pedirá iniciar sesión de nuevo.
