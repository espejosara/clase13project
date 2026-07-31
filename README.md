# clase13project

Frontend de e-commerce en React + Vite conectado a un backend real con API REST.

## Objetivo de esta feature

- Consumir datos reales desde backend con Axios.
- Encapsular peticiones en capa API y custom hooks.
- Manejar estados de carga y error.
- Implementar formularios controlados de login y register.

## Stack

- React + Vite
- React Router
- Axios

## Estructura relevante

```text
src/
	api/
		axios.js
		products.js
		reviews.js
		auth.js
	hooks/
		useProducts.js
		useProduct.js
		useReviews.js
	pages/
		HomePage/
		ProductsPage/
		ProductDetailPage/
		LoginPage/
		RegisterPage/
```

## Requisitos previos

- Node.js 18+
- npm
- Backend corriendo en http://localhost:3000

## Configuracion del frontend

1. Crear archivo .env en la raiz del proyecto con:

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

## Como ejecutar backend + frontend

### 1) Backend (proyecto separado)

En el repositorio del backend:

```bash
npm install
npm run dev
```

Debe quedar activo en http://localhost:3000

### 2) Frontend (este proyecto)

En este repositorio:

```bash
npm install
npm run dev
```

Debe quedar activo en http://localhost:5173

## Endpoints esperados del backend

- GET /products
- GET /products/:id
- GET /products/:id/reviews
- POST /auth/login
- POST /auth/register

## Rutas del frontend

- /
- /products
- /products/:productId
- /login
- /register
- * (404)

## Verificacion rapida

1. Abrir http://localhost:5173/products y comprobar que se cargan productos.
2. Abrir http://localhost:5173/products/1 y comprobar detalle + reviews.
3. Probar login en http://localhost:5173/login.
4. Probar register en http://localhost:5173/register.

## Scripts disponibles

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

## Notas

- Si cambias .env, reinicia Vite.
- Si hay errores de red, revisar que backend este encendido y CORS permita http://localhost:5173.
