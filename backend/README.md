# Backend - Food Ordering API

Required env vars (create a `.env` file at project root `backend/.env`):

- MONGO_URI - MongoDB connection string (Mongo Atlas)
- JWT_SECRET - secret for signing JWT tokens
- PORT - optional server port (default 5000)

Quick start:

1. Install deps:

   npm install

2. Seed sample data (creates products and a test user test@example.com / password123):

   npm run seed

3. Start server:

   npm run start

API endpoints (summary):

- POST /api/auth/register  { email, password }
- POST /api/auth/login     { email, password }
- GET  /api/products?category=All
- POST /api/products/seed  (dev)
- GET  /api/cart           (auth)
- POST /api/cart          { productId, qty } (auth)
- PUT  /api/cart          { productId, qty } (auth)
- DELETE /api/cart/:productId (auth)
- POST /api/orders/checkout (auth)
- GET  /api/orders         (auth)

Notes:
- Checkout verifies stock and deducts inventory atomically using MongoDB transactions.
- Cart is persisted on the user record so it is available across devices.
