# HPS-Import Dashboard

Dashboard integral de rentabilidad para importadora HPS.

## Stack

- **Backend:** Node.js + Express + PostgreSQL (Knex ORM)
- **Frontend:** React + Vite + TailwindCSS + Chart.js
- **Auth:** JWT + bcrypt (roles: admin / invitado)
- **Deploy:** Render (Web Service + PostgreSQL)

## Deploy en Render

### Opción 1: Automático (recomendado)

1. Fork o sube este repo a GitHub
2. En Render, crea un **Blueprint** apuntando a tu repo
3. Render lee `render.yaml` y crea automáticamente:
   - Web Service `hps-dashboard`
   - PostgreSQL `hps-db`

### Opción 2: Manual

1. Crea un **PostgreSQL** en Render
2. Crea un **Web Service** con:
   - **Build Command:**
     ```
     cd backend && npm install && cd ../frontend && npm install && npm run build && mkdir -p ../backend/public && cp -r dist/* ../backend/public/
     ```
   - **Start Command:**
     ```
     cd backend && npm run migrate && npm run seed && npm start
     ```
   - **Health Check Path:** `/api/health`
3. Agrega variable de entorno `DATABASE_URL` con la URL de tu PostgreSQL

### Variables de Entorno

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Clave secreta para JWT |
| `JWT_EXPIRES_IN` | Tiempo de expiración (default: 24h) |
| `NODE_ENV` | `production` en Render |
| `PORT` | Puerto (Render asigna 10000) |

## Desarrollo Local

```bash
# Backend
cd backend
cp .env.example .env   # editar credenciales
npm install
npm run migrate
npm run seed
npm run dev

# Frontend (otra terminal)
cd frontend
npm install
npm run dev
```

## API Endpoints

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/auth/login` | No | Login |
| GET | `/api/auth/me` | Sí | Obtener usuario actual |
| GET | `/api/meses` | Sí | Lista de meses |
| GET | `/api/meses/:anio/:mes` | Sí | Datos completos del mes |
| PUT | `/api/meses/:anio/:mes` | Admin | Guardar datos del mes |
| GET | `/api/transacciones` | Sí | Transacciones (con filtros) |
| POST | `/api/transacciones` | Admin | Crear transacción |
| GET | `/api/resumen/:anio` | Sí | Resumen anual completo |

## Credenciales Demo

- **Admin:** admin / admin123
- **Invitado:** invitado / invitado