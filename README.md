
## Features
- Log visited cities and planned trips
- Interactive map with markers and travel lines
- User login/signup with JWT
- Mobile friendly

## Live Demo
- **Frontend:** [https://witty-dune-0cb8be810.2.azurestaticapps.net](https://witty-dune-0cb8be810.2.azurestaticapps.net)
- **Frontend GitHub:** [https://github.com/raycacuts/TravelTrack/tree/main]
- **Backend GitHub:** [https://github.com/raycacuts/TravelTrackBackend]

## Tech
**Frontend**
- React + Vite
- Leaflet
- React Router
- CSS Modules

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- JWT Auth
- Multer uploads
- Helmet, CORS, Rate Limit

## Setup

### Backend
```bash
cd server
npm install
# make a .env file
PORT=8080
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_secret
CORS_ORIGINS=http://localhost:5173
UPLOAD_DIR=uploads
npm run dev
