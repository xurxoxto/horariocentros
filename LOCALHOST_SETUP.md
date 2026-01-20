# 🚀 Localhost Setup Guide

Complete guide to run HorarioCentros on your local machine.

## Prerequisites

Before you begin, ensure you have:

- **Node.js 18+** installed ([Download here](https://nodejs.org/))
- **npm** (comes with Node.js) or **yarn**
- **Git** (to clone the repository)
- A modern web browser (Chrome, Firefox, Safari, or Edge)

## Quick Setup (Automated)

### Linux/macOS:
```bash
# Make the setup script executable
chmod +x setup.sh

# Run the setup script
./setup.sh
```

### Windows:
```bash
# Run the setup script
setup.bat
```

The automated script will:
1. ✅ Check Node.js version
2. ✅ Install all dependencies
3. ✅ Create .env files from templates
4. ✅ Set up both client and server

## Manual Setup (Step by Step)

If you prefer to set up manually or the automated script fails:

### Step 1: Clone the Repository
```bash
git clone https://github.com/xurxoxto/horariocentros.git
cd horariocentros
```

### Step 2: Install Root Dependencies
```bash
npm install
```

### Step 3: Setup Server

```bash
cd server

# Create .env file
cp .env.example .env

# Install server dependencies
npm install

cd ..
```

**Edit `server/.env` if needed:**
```env
PORT=3000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
JWT_SECRET=your-super-secret-jwt-key-change-in-production
DATABASE_URL=sqlite:./dev.db
```

### Step 4: Setup Client

```bash
cd client

# Create .env file
cp .env.example .env

# Install client dependencies
npm install

cd ..
```

**Edit `client/.env` if needed:**
```env
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
```

## Running the Application

### Option 1: Run Both (Recommended)
```bash
npm run dev
```
This runs both the client and server concurrently.

### Option 2: Run Separately

**Terminal 1 - Server:**
```bash
npm run server:dev
```

**Terminal 2 - Client:**
```bash
npm run client:dev
```

## Access the Application

Once running, open your browser:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **API Health Check**: http://localhost:3000/api/health

## First Time Usage

### 1. Register an Account
- Navigate to http://localhost:5173
- Click "Register" or go to http://localhost:5173/register
- Create your account (first user gets admin role automatically)

### 2. Explore the App
- **Home**: Welcome page with app overview
- **Dashboard**: View your role-based dashboard
- **Timetable**: Create and edit timetables with drag-and-drop

## Troubleshooting

### Port Already in Use

**If port 3000 is busy:**
```bash
# Edit server/.env
PORT=3001
```

**If port 5173 is busy:**
```bash
# Edit client/vite.config.ts and add:
server: {
  port: 5174
}
```

### Dependencies Issues

**Clear npm cache and reinstall:**
```bash
# In root directory
npm run clean  # If this command exists
rm -rf node_modules package-lock.json
rm -rf server/node_modules server/package-lock.json
rm -rf client/node_modules client/package-lock.json

# Reinstall
npm install
```

### TypeScript Errors

**Rebuild TypeScript:**
```bash
# Server
cd server && npm run build

# Client
cd client && npm run build
```

### Module Not Found Errors

**Ensure all dependencies are installed:**
```bash
npm run postinstall
```

### WebSocket Connection Issues

**Check CORS settings in `server/src/index.ts`:**
```typescript
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
};
```

## Development Commands

### Root Directory
- `npm run dev` - Run both client and server
- `npm run build` - Build both for production
- `npm test` - Run all tests
- `npm run server:dev` - Run only server
- `npm run client:dev` - Run only client

### Server (`/server`)
- `npm run dev` - Run in development mode with auto-reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Run production build
- `npm test` - Run server tests
- `npm run lint` - Lint TypeScript code

### Client (`/client`)
- `npm run dev` - Run Vite dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run client tests
- `npm run lint` - Lint TypeScript code

## Project Structure

```
horariocentros/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── features/      # Page components
│   │   ├── services/      # API and Socket services
│   │   ├── store/         # Zustand state management
│   │   └── styles/        # Global styles
│   ├── .env               # Client environment variables
│   └── package.json       # Client dependencies
├── server/                # Node.js backend
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   ├── middleware/    # Express middleware
│   │   ├── models/        # TypeScript types
│   │   └── utils/         # Helper functions
│   ├── .env               # Server environment variables
│   └── package.json       # Server dependencies
├── setup.sh               # Linux/macOS setup script
├── setup.bat              # Windows setup script
└── package.json           # Root package.json
```

## Environment Variables Reference

### Server (`.env`)
| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment | `development` |
| `CLIENT_URL` | Frontend URL for CORS | `http://localhost:5173` |
| `JWT_SECRET` | Secret for JWT tokens | Change in production! |
| `DATABASE_URL` | Database connection | `sqlite:./dev.db` |

### Client (`.env`)
| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:3000/api` |
| `VITE_SOCKET_URL` | WebSocket URL | `http://localhost:3000` |

## Features to Try

### 1. Drag and Drop Timetabling
- Navigate to the Timetable page
- Use the resource panel (left sidebar) to drag teachers, classes, rooms
- Drop them on the timetable grid
- See instant conflict validation with color-coded borders

### 2. Real-time Collaboration
- Open the app in multiple browser tabs
- Make changes in one tab
- See updates appear in other tabs automatically

### 3. Quick Edit
- Double-click any timetable slot
- Edit teacher, room, or subject
- Press Cmd+Enter (Mac) or Ctrl+Enter (Windows) to save

### 4. Undo/Redo
- Make changes to the timetable
- Press Cmd+Z (Mac) or Ctrl+Z (Windows) to undo
- Press Cmd+Shift+Z (Mac) or Ctrl+Shift+Z (Windows) to redo

### 5. Multiple Views
- Switch between Overview, By Teacher, By Class, By Room
- Use view switcher buttons at the top
- Filter what you see for focused editing

### 6. Export
- Click "PDF" to download a printable timetable
- Click "Export" to get iCal format for calendar apps

## Next Steps

- Read [QUICKSTART.md](QUICKSTART.md) for feature overview
- Check [FEATURES.md](FEATURES.md) for detailed documentation
- See [ARCHITECTURE.md](ARCHITECTURE.md) for system design
- Review [CONTRIBUTING.md](CONTRIBUTING.md) to contribute

## Need Help?

- **Documentation**: Check the `/docs` folder or `.md` files in root
- **Issues**: Report bugs on [GitHub Issues](https://github.com/xurxoxto/horariocentros/issues)
- **Questions**: Open a [Discussion](https://github.com/xurxoxto/horariocentros/discussions)

## Production Deployment

For production deployment, see [DEPLOYMENT.md](DEPLOYMENT.md)

---

**Happy Scheduling! 📅✨**
