# ROK Commander Calculator

A full-stack web application for calculating and ranking Rise of Kingdoms Rally & Garrison commanders.

## Quick Start

### 1. Start MongoDB
```bash
brew services start mongodb-community
```

### 2. Start Backend
```bash
cd backend
npm run seed    # First time only - seeds database with Excel data
npm run dev     # Starts backend on port 5000
```

### 3. Start Frontend
```bash
cd frontend
npm start       # Starts frontend on port 3000
```

### 4. Open Browser
Navigate to `http://localhost:3000`

## Features

- **3-Layer Scoring System**: Accurately calculates commander effectiveness based on player stats, equipment, and formations
- **10 Commander Roles**: Cavalry, Archer, Infantry, and Leadership roles with specific damage focuses
- **47 Equipment Items**: Complete equipment library with Iconic levels I, II, IV, and V
- **92 Inscriptions**: Common, Rare, Special, and Formation inscriptions
- **Leaderboard**: Rank your builds against friends
- **Build History**: Save and track multiple builds per player

## Tech Stack

- **Frontend**: React
- **Backend**: Node.js + Express
- **Database**: MongoDB
- **Data Source**: Excel spreadsheets from Davor's calculator

## Project Structure

```
rok-commander-calculator/
├── backend/             # Node.js API
│   ├── models/         # Database schemas
│   ├── controllers/    # Business logic
│   ├── routes/         # API endpoints
│   ├── utils/          # Scoring engine
│   └── data/           # Extracted JSON data
├── frontend/           # React app
│   └── src/
│       ├── components/ # React components
│       └── services/   # API calls
└── SETUP_GUIDE.md      # Detailed setup instructions
```

## Data Extracted

- 10 Commander Roles with scoring scales
- 47 Equipment items with 4 iconic levels each
- 92 Inscriptions (Common, Rare, Special, Formation)
- 10 VIP levels
- 8 Civilisations
- 4 Spending tiers
- 30 City skins
- 4 Equipment set bonuses

## API Documentation

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for complete API documentation.

## Deployment

### Backend (Railway)

1. Create a new project on [Railway](https://railway.app)
2. Add a MongoDB database from Railway's marketplace
3. Deploy from GitHub (select the `backend` folder)
4. Set environment variables:
   - `MONGODB_URI`: Your MongoDB connection string from Railway
   - `FRONTEND_URL`: Your Vercel frontend URL (e.g., `https://your-app.vercel.app`)
   - `NODE_ENV`: `production`
5. After deployment, run the seed script:
   ```bash
   railway run npm run seed
   ```

### Frontend (Vercel)

1. Create a new project on [Vercel](https://vercel.com)
2. Import from GitHub
3. Set root directory to `frontend`
4. Set environment variable:
   - `REACT_APP_API_URL`: Your Railway backend URL + `/api` (e.g., `https://your-backend.railway.app/api`)
5. Deploy!

### Environment Variables Summary

**Backend (Railway):**
| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `FRONTEND_URL` | Vercel frontend URL for CORS |
| `NODE_ENV` | Set to `production` |
| `PORT` | Auto-set by Railway |

**Frontend (Vercel):**
| Variable | Description |
|----------|-------------|
| `REACT_APP_API_URL` | Railway backend API URL |

## Credits

Based on **[TKC] Rally/Garrison Leaders Calculator** by **Davor** (Discord #Davor5647)

## License

Educational purposes only. All game data belongs to the original creators.
