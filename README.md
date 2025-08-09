# WorldWise Starter (Backend + Auth + Cities)

## Setup
1) `cd server`
2) `npm i`
3) copy `.env.example` to `.env` and fill values
4) `npm run dev`

## Endpoints
- POST /api/auth/register { name, email, password }
- POST /api/auth/login { email, password } -> { token, user }
- GET /api/cities (Bearer token)
- GET /api/cities/:id (Bearer token)
- POST /api/cities (Bearer token) body: { cityName, country, emoji, date, notes, position:{lat,lng} }
- DELETE /api/cities/:id (Bearer token)

## Deploy on Azure
- Create MongoDB (Atlas on Azure, or Cosmos DB Mongo API). Put conn string in `MONGODB_URI`.
- Create Azure App Service (Node 18). Set env vars:
  - `MONGODB_URI`, `JWT_SECRET`, `CORS_ORIGIN`
- Deploy; backend served at `https://<app>.azurewebsites.net/api`

## Frontend
Set `VITE_API=https://<app>.azurewebsites.net/api` and send `Authorization: Bearer <token>`.
