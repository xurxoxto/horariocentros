# ⚡ Quick Start - Get Running in 2 Minutes

**Simple step-by-step guide to run HorarioCentros on your computer.**

## Before You Start

**You need:**
- Computer (Windows, Mac, or Linux)
- Node.js 18+ installed ([Download](https://nodejs.org/))
- Internet connection (for downloading packages)

**Check Node.js:**
```bash
node --version
```
Should show `v18.x.x` or higher. If not, install from [nodejs.org](https://nodejs.org/).

---

## Option 1: One-Command Setup (Recommended)

### Linux / macOS

```bash
# 1. Download the code
git clone https://github.com/xurxoxto/horariocentros.git
cd horariocentros

# 2. Run setup script
chmod +x setup.sh
./setup.sh

# 3. Start the app
npm run dev
```

### Windows

```bash
# 1. Download the code
git clone https://github.com/xurxoxto/horariocentros.git
cd horariocentros

# 2. Run setup script
setup.bat

# 3. Start the app
npm run dev
```

**Done! 🎉**
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

---

## Option 2: Docker (No Setup Required)

**If you have Docker installed:**

```bash
# 1. Download the code
git clone https://github.com/xurxoxto/horariocentros.git
cd horariocentros

# 2. Start with Docker
docker-compose up
```

**Done! 🎉**
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

**To stop:** Press `Ctrl+C`

---

## Option 3: Manual Setup (Step by Step)

### Step 1: Download

```bash
git clone https://github.com/xurxoxto/horariocentros.git
cd horariocentros
```

### Step 2: Install

```bash
npm install
```

**Wait 2-3 minutes** for packages to download.

### Step 3: Setup Environment

**Linux/macOS:**
```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

**Windows:**
```bash
copy server\.env.example server\.env
copy client\.env.example client\.env
```

### Step 4: Start

```bash
npm run dev
```

**Done! 🎉**
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

---

## What You Should See

### Terminal Output

**Server:**
```
🚀 Server running on http://localhost:3000
📚 API docs available at http://localhost:3000/api/docs
🔌 WebSocket server ready
```

**Client:**
```
VITE v5.4.21  ready in 179 ms
➜  Local:   http://localhost:5173/
```

### Browser

1. Open http://localhost:5173
2. You should see the **HorarioCentros home page**
3. Click **"Register"** to create an account
4. Start scheduling!

---

## Having Problems?

### Problem: "npm: command not found"

**Solution:** Install Node.js from https://nodejs.org/

### Problem: "Port already in use"

**Solution:** Another app is using the port. Try:
```bash
# Kill process on port 3000 (Linux/macOS)
lsof -ti:3000 | xargs kill -9

# Kill process on port 3000 (Windows)
netstat -ano | findstr :3000
# Then: taskkill /PID <number> /F
```

### Problem: Blank white screen

**Solution:**
1. Check if server is running (should see messages in terminal)
2. Check if client is running (should see Vite messages)
3. Open browser console (F12) and look for errors

### Problem: "TypeError" or JavaScript errors

**Solution:** You may have old code. Pull latest:
```bash
git pull origin copilot/build-school-timetable-app
npm install
npm run dev
```

### Other Problems?

See **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** for complete troubleshooting guide.

---

## Using the App

### First Time

1. **Register an account**
   - Go to http://localhost:5173/register
   - Enter email, name, password
   - Choose role (Admin, Teacher, Student)
   - Click "Register"

2. **Login**
   - Go to http://localhost:5173/login
   - Enter your email and password
   - Click "Login"

3. **Explore**
   - Home: Welcome page
   - Dashboard: Your personalized dashboard
   - Timetable: Create and edit schedules

### Key Features to Try

**Drag and Drop:**
- Go to Timetable page
- Drag resources from left panel
- Drop onto timetable grid
- See instant validation

**Dark Mode:**
- Click sun/moon icon in navigation
- Theme switches and persists

**Quick Edit:**
- Double-click any timetable slot
- Edit details in modal
- Press Cmd+Enter (or Ctrl+Enter) to save

**Undo/Redo:**
- Make changes
- Press Cmd+Z (or Ctrl+Z) to undo
- Press Cmd+Shift+Z (or Ctrl+Shift+Z) to redo

**Export:**
- Click "Export" for PDF
- Get iCal for calendar apps

---

## Next Steps

**Learn more:**
- [FEATURES.md](FEATURES.md) - Complete feature list
- [LOCALHOST_SETUP.md](LOCALHOST_SETUP.md) - Detailed setup guide
- [ARCHITECTURE.md](ARCHITECTURE.md) - How it works
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deploy to production

**Contribute:**
- [CONTRIBUTING.md](CONTRIBUTING.md) - How to contribute
- [GitHub Issues](https://github.com/xurxoxto/horariocentros/issues) - Report bugs

---

## Stopping the App

**If using `npm run dev`:**
- Press `Ctrl+C` in terminal

**If using Docker:**
```bash
docker-compose down
```

---

## Useful Commands

```bash
# Start development (both client and server)
npm run dev

# Start only server
npm run server:dev

# Start only client
npm run client:dev

# Build for production
npm run build

# Run tests
npm test

# Check for TypeScript errors
cd client && npx tsc --noEmit
cd server && npx tsc --noEmit
```

---

**Need help?** 
- Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- Open an [Issue](https://github.com/xurxoxto/horariocentros/issues)
- Read [LOCALHOST_SETUP.md](LOCALHOST_SETUP.md)

**Happy scheduling! 📅✨**
