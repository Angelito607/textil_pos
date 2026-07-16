# Textil POS

Sistema de punto de venta para talleres textiles con gestión de ventas, inventario, clientes y tickets.

## Requisitos
- Node.js 18+
- MySQL 8+

## Backend
```bash
cd backend
npm install
npm run dev
```

## Frontend
```bash
cd frontend
npm install
npm run dev
```

## Base de datos
Ejecuta el script en [database/schema.sql](database/schema.sql) en phpMyAdmin o MySQL CLI.

## Variables de entorno
- Backend: [backend/.env](backend/.env)
- Frontend: [frontend/.env.production](frontend/.env.production)

## Despliegue sugerido
- Frontend: Vercel
- Backend: Render
- Base de datos: InfinityFree o MySQL gestionado
