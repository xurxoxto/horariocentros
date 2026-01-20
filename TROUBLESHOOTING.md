# Troubleshooting Guide

Common issues and solutions when running HorarioCentros on localhost.

## Installation Issues

### Error: "Node.js is not installed" or "node command not found"

**Solution:**
1. Install Node.js 18 or higher from https://nodejs.org/
2. Verify installation: `node --version`
3. Should show v18.x.x or higher

### Error: "npm install" fails with permission errors

**Linux/macOS Solution:**
```bash
# Don't use sudo! Instead, fix npm permissions:
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

**Windows Solution:**
- Run Command Prompt as Administrator
- Or use `npm install --no-optional`

### Error: "EACCES: permission denied" during npm install

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules
rm -rf node_modules package-lock.json
rm -rf client/node_modules client/package-lock.json
rm -rf server/node_modules server/package-lock.json

# Reinstall
npm install
```

## Compilation Errors

### Error: "Property 'env' does not exist on type 'ImportMeta'"

**Solution:** This has been fixed in commit e65e463. Pull the latest changes:
```bash
git pull origin copilot/build-school-timetable-app
```

The fix adds `client/src/vite-env.d.ts` which declares Vite environment types.

### Error: "Cannot find module" or import errors

**Solution:**
```bash
# Reinstall dependencies
cd client && npm install && cd ..
cd server && npm install && cd ..
```

### Error: TypeScript compilation fails

**Solution:**
```bash
# Check for compilation errors
cd client && npx tsc --noEmit
cd server && npx tsc --noEmit

# If errors persist, check that you have the latest code
git status
git pull
```

## Runtime Errors

### Error: "Port 3000 is already in use" (Server)

**Solution 1 - Kill the process:**
```bash
# Linux/macOS
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Solution 2 - Use a different port:**
```bash
# Edit server/.env
PORT=3001
```

### Error: "Port 5173 is already in use" (Client)

**Solution 1 - Kill the process:**
```bash
# Linux/macOS
lsof -ti:5173 | xargs kill -9

# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

**Solution 2 - Use a different port:**
```bash
# Edit client/vite.config.ts
server: {
  port: 5174
}
```

### Error: "Failed to fetch" or network errors in browser

**Possible causes:**
1. Server not running
2. Wrong API URL
3. CORS issues

**Solution:**
```bash
# 1. Make sure server is running
cd server && npm run dev

# 2. Check client/.env has correct API URL
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000

# 3. Check server CORS settings in server/src/index.ts
# Should allow origin: http://localhost:5173
```

### Error: "WebSocket connection failed"

**Solution:**
```bash
# Check that:
# 1. Server is running on port 3000
# 2. client/.env has VITE_SOCKET_URL=http://localhost:3000
# 3. No firewall blocking WebSocket connections
```

## Environment Configuration

### Missing .env files

**Solution:**
```bash
# Create from templates
cp server/.env.example server/.env
cp client/.env.example client/.env
```

### Wrong environment variables

**Check server/.env:**
```env
PORT=3000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
JWT_SECRET=your-super-secret-jwt-key-change-in-production
DATABASE_URL=sqlite:./dev.db
```

**Check client/.env:**
```env
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
```

## Build Errors

### Error: "tsc: command not found"

**Solution:**
```bash
# TypeScript should be installed as a dev dependency
cd client && npm install typescript --save-dev
cd server && npm install typescript --save-dev
```

### Error: Build fails with memory errors

**Solution:**
```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"

# Then run build
npm run build
```

## Docker Issues

### Error: "docker-compose: command not found"

**Solution:**
```bash
# Install Docker Desktop (includes docker-compose)
# Visit: https://www.docker.com/products/docker-desktop
```

### Error: Docker containers won't start

**Solution:**
```bash
# Check Docker is running
docker ps

# Remove old containers and rebuild
docker-compose down
docker-compose up --build
```

### Error: "Cannot connect to Docker daemon"

**Solution:**
- Make sure Docker Desktop is running
- On Linux, add your user to docker group:
  ```bash
  sudo usermod -aG docker $USER
  newgrp docker
  ```

## Browser Issues

### Blank white screen

**Possible causes:**
1. Client not running
2. JavaScript errors
3. Wrong URL

**Solution:**
```bash
# 1. Check client is running
cd client && npm run dev

# 2. Open browser console (F12) and check for errors

# 3. Make sure you're accessing http://localhost:5173
```

### Dark mode not working

**Solution:**
- Click the theme toggle button (sun/moon icon) in the navigation bar
- Check browser console for errors
- Clear localStorage: In console, run `localStorage.clear()` and refresh

### Features not working / buttons not responding

**Solution:**
1. Clear browser cache (Ctrl+Shift+Del)
2. Hard refresh (Ctrl+F5)
3. Check browser console for JavaScript errors
4. Ensure server is running

## Database Issues

### Error: "Database connection failed"

**Solution:**
The MVP uses in-memory storage, so this shouldn't happen. If it does:
```bash
# Check server/.env
DATABASE_URL=sqlite:./dev.db

# If using SQLite, ensure write permissions
chmod 755 server/
```

## Still Having Issues?

### Get More Information

**Check server logs:**
```bash
cd server && npm run dev
# Watch for error messages
```

**Check client logs:**
```bash
cd client && npm run dev
# Watch for compilation errors
```

**Check browser console:**
1. Open browser (Chrome/Firefox/Edge)
2. Press F12
3. Go to Console tab
4. Look for red error messages

### Create an Issue

If the problem persists:

1. **Gather information:**
   - Node.js version: `node --version`
   - npm version: `npm --version`
   - Operating system
   - Error message (full text)
   - Console logs
   - Steps to reproduce

2. **Create GitHub issue:**
   - Go to https://github.com/xurxoxto/horariocentros/issues
   - Click "New Issue"
   - Provide all gathered information

3. **Get help:**
   - Check existing issues for similar problems
   - Ask in GitHub Discussions

## Quick Checklist

Before asking for help, verify:

- [ ] Node.js 18+ installed (`node --version`)
- [ ] Dependencies installed (`npm install` completed)
- [ ] .env files created (copied from .env.example)
- [ ] No port conflicts (3000 and 5173 available)
- [ ] Server running (`cd server && npm run dev`)
- [ ] Client running (`cd client && npm run dev`)
- [ ] Accessing correct URL (http://localhost:5173)
- [ ] Browser console checked for errors (F12)
- [ ] Latest code pulled (`git pull`)

## Common Commands Reference

```bash
# Fresh start
npm run clean  # If this command exists
rm -rf node_modules client/node_modules server/node_modules
npm install

# Start development
npm run dev

# Start separately
npm run server:dev  # Terminal 1
npm run client:dev  # Terminal 2

# Build for production
npm run build

# Run tests
npm test

# Check for errors
cd client && npx tsc --noEmit
cd server && npx tsc --noEmit
```

## Success Indicators

You know everything is working when:

✅ Server console shows: "🚀 Server running on http://localhost:3000"
✅ Client console shows: "➜  Local:   http://localhost:5173/"
✅ Browser opens http://localhost:5173 and shows the app
✅ No red errors in browser console (F12)
✅ Can navigate between pages
✅ Can register/login

---

**Need more help?** See [LOCALHOST_SETUP.md](LOCALHOST_SETUP.md) for detailed setup instructions.
