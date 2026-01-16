# ROK Commander Calculator - Setup Guide

## Project Overview

This is a full-stack web application for calculating and ranking Rise of Kingdoms Rally & Garrison commanders. The application implements the sophisticated 3-layer scoring system from Davor's Excel calculator.

## Architecture

- **Backend**: Node.js + Express + MongoDB
- **Frontend**: React
- **Database**: MongoDB (local or Atlas)
- **Data Source**: Excel files with commander stats

## Directory Structure

```
rok-commander-calculator/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # API request handlers
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API routes
│   ├── scripts/         # Data extraction & seeding scripts
│   ├── utils/           # Scoring calculation engine
│   ├── data/            # Extracted JSON data
│   ├── server.js        # Main server file
│   ├── package.json
│   └── .env
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── services/    # API service layer
│   │   ├── styles/      # CSS files
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
└── data/                # Original Excel files

```

## Setup Instructions

### Prerequisites

1. **Node.js** (v16 or higher)
2. **MongoDB** (v5 or higher)
   - Install locally: https://www.mongodb.com/docs/manual/installation/
   - OR use MongoDB Atlas (free tier): https://www.mongodb.com/cloud/atlas

### Step 1: Install MongoDB (if using local)

**macOS (using Homebrew):**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Verify MongoDB is running:**
```bash
mongosh
```

### Step 2: Backend Setup

```bash
# Navigate to backend directory
cd /Users/punlochan/Desktop/Acc3584/rok-commander-calculator/backend

# Dependencies are already installed, but if needed:
npm install

# Extract data from Excel files
node scripts/extractExcelData.js

# Seed the database
npm run seed

# Start the backend server
npm run dev
```

The backend API should now be running on `http://localhost:5000`

### Step 3: Frontend Setup

```bash
# Navigate to frontend directory
cd /Users/punlochan/Desktop/Acc3584/rok-commander-calculator/frontend

# Dependencies are already installed, but if needed:
npm install

# Start the React development server
npm start
```

The frontend should now be running on `http://localhost:3000`

## API Endpoints

### Data Endpoints
- `GET /api/data/roles` - Get all commander roles
- `GET /api/data/equipment?type=WEAPON` - Get equipment (optional filter)
- `GET /api/data/inscriptions?rarity=SPECIAL` - Get inscriptions (optional filter)
- `GET /api/data/vip` - Get VIP bonuses
- `GET /api/data/civilisations` - Get all civilisations
- `GET /api/data/spending` - Get spending tiers
- `GET /api/data/cityskins` - Get city skins
- `GET /api/data/setbonuses` - Get set bonuses

### Calculator Endpoints
- `POST /api/calculator/calculate` - Calculate build score
- `GET /api/calculator/leaderboard/:role` - Get leaderboard for a role
- `GET /api/calculator/player/:player_name` - Get all builds for a player
- `GET /api/calculator/build/:id` - Get specific build
- `DELETE /api/calculator/build/:id` - Delete a build

## Data Extracted

The extraction script successfully extracted:

- **10 Commander Roles** with scoring scales
- **47 Equipment Items** with iconic levels and stats
- **92 Inscriptions** with stats and multipliers
- **10 VIP Levels** with bonuses
- **8 Civilisations** with role-specific bonuses
- **4 Spending Tiers** with bonuses
- **30 City Skins** with role-specific bonuses
- **4 Set Bonuses** (Hellish Wasteland, Dragon Breath, Eternal Empire, Garb of Glorious Goddess)

## Features Implemented

### Core Calculator (Backend)
- ✅ 3-layer scoring system
- ✅ Layer 1: Player base stats (VIP, Civ, Spending, City Skin)
- ✅ Layer 2: Equipment with set bonuses
- ✅ Layer 3: Formations and inscriptions
- ✅ Multiplier calculations
- ✅ Tier assignment (S+, S, A, B, C)
- ✅ Percentage of max score

### API (Backend)
- ✅ RESTful API with Express
- ✅ MongoDB integration with Mongoose
- ✅ Data extraction from Excel files
- ✅ Database seeding
- ✅ Calculate build endpoint
- ✅ Leaderboard endpoints
- ✅ Player builds tracking

### Frontend (React)
- 🔄 Calculator form (ready to implement)
- 🔄 Real-time score display (ready to implement)
- 🔄 Leaderboard view (ready to implement)
- 🔄 Player build history (ready to implement)

## Next Steps

To complete the frontend, you need to create these React components:

1. **Header.js** - Navigation between Calculator and Leaderboard
2. **Calculator.js** - Main calculator form with:
   - Player name input
   - Role selection
   - Layer 1 inputs (VIP, Civ, Spending, City Skin)
   - Layer 2 inputs (8 equipment slots)
   - Layer 3 inputs (Formation, Inscriptions, Armaments)
   - Real-time score display
   - Save button
3. **Leaderboard.js** - Display rankings by role
4. **api.js** - Axios service for API calls
5. **App.css** - Styling

## Troubleshooting

### MongoDB Connection Issues

If you get "MongooseServerSelectionError":
```bash
# Check if MongoDB is running
brew services list

# Restart MongoDB
brew services restart mongodb-community
```

### Port Already in Use

If port 5000 or 3000 is already in use:
```bash
# Find and kill the process
lsof -ti:5000 | xargs kill -9
lsof -ti:3000 | xargs kill -9
```

### Data Extraction Issues

If the extraction script fails:
1. Verify the Excel file path is correct
2. Ensure the Excel file hasn't been modified
3. Check the script output for specific errors

## Testing the API

You can test the API using curl:

```bash
# Health check
curl http://localhost:5000/health

# Get all roles
curl http://localhost:5000/api/data/roles

# Get all equipment
curl http://localhost:5000/api/data/equipment
```

## Database Management

View your data in MongoDB:

```bash
# Connect to MongoDB
mongosh

# Switch to the database
use rok-commander-calculator

# View collections
show collections

# Query data
db.commanderroles.find()
db.equipment.find().limit(5)
db.inscriptions.find().limit(5)
```

## Credits

- **Original Calculator**: Davor (Discord #Davor5647)
- **Data Source**: [TKC] NEW TECH - RALLY_GARRISON Leaders Calculator
- **Equipment Data**: ROK EQUIPMENT COOKER by Bilegt & Davor
- **Stat Weighting**: ROK STATS WEIGHTING TOOL by Davor

## License

This project is for educational purposes. All game data and calculations belong to the original creators.
