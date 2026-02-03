# Quick Start Guide

Get HorarioCentros running in under 5 minutes!

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- A modern web browser

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/xurxoxto/horariocentros.git
cd horariocentros
```

### 2. Install Dependencies

```bash
npm install
```

This will install dependencies for both the server and client.

### 3. Set Up Environment Variables

```bash
# Copy example environment files
cp .env.example .env
cp server/.env.example server/.env
cp client/.env.example client/.env
```

The default values work for local development, but you can customize them:

**server/.env:**
```env
PORT=3000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

**client/.env:**
```env
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
```

### 4. Start the Development Server

```bash
npm run dev
```

This starts both the backend (port 3000) and frontend (port 5173) in development mode.

## Access the Application

Open your browser and navigate to:

**Frontend:** http://localhost:5173
**API:** http://localhost:3000/api
**API Docs:** http://localhost:3000/api/docs

## Create Your First Account

1. Click "Sign Up" on the homepage
2. Fill in your details:
   - Name: Your name
   - Email: your@email.com
   - Password: At least 6 characters
   - Role: Choose Admin to access all features
3. Click "Sign Up"

You'll be automatically logged in and redirected to the dashboard!

## Test the Features

### 1. Dashboard
After logging in, you'll see the dashboard with:
- Quick action cards
- Recent timetables
- Statistics (for admins)

### 2. Create a Timetable
1. Click "View Timetables" or go to `/timetables`
2. You'll see a demo timetable with a grid layout
3. Try dragging and dropping slots (drag-and-drop enabled!)

### 3. Real-time Collaboration
1. Open the app in two browser windows
2. Sign in with different accounts (or the same one)
3. Make changes in one window and see them appear in the other instantly!

### 4. Dark Mode
Click the moon/sun icon in the navigation bar to toggle dark mode.

### 5. Export
Click the "PDF" or "Export" buttons to download timetables.

## Demo Users

For quick testing, you can use these demo credentials:

**Admin:**
- Email: admin@school.edu
- Password: demo123

**Teacher:**
- Email: juan@school.edu
- Password: demo123

**Student:**
- Email: student@school.edu
- Password: demo123

*Note: These users need to be created through the registration form first, or you can modify the auth routes to seed them.*

## Development Tips

### Run Backend Only
```bash
npm run server:dev
```

### Run Frontend Only
```bash
npm run client:dev
```

### Build for Production
```bash
npm run build
```

### Run Tests
```bash
npm test
```

### Lint Code
```bash
npm run lint
```

## Project Structure

```
horariocentros/
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── features/    # Page components
│   │   ├── services/    # API and socket services
│   │   ├── store/       # State management
│   │   └── styles/      # Global styles
│   └── package.json
├── server/              # Node.js backend
│   ├── src/
│   │   ├── controllers/ # (Future)
│   │   ├── middleware/  # Auth, error handling
│   │   ├── models/      # TypeScript types
│   │   ├── routes/      # API endpoints
│   │   ├── services/    # Business logic
│   │   └── utils/       # Helper functions
│   └── package.json
└── package.json         # Root package
```

## Key Features to Try

✅ **Drag-and-Drop**: Move timetable slots by dragging
✅ **Real-time Collaboration**: See changes from other users instantly  
✅ **Dark Mode**: Toggle between light and dark themes
✅ **Responsive Design**: Try on mobile, tablet, and desktop
✅ **Role-based Access**: Different views for admin/teacher/student
✅ **PDF Export**: Download professional timetable PDFs
✅ **Calendar Export**: Export to iCal format
✅ **AI Suggestions**: See smart scheduling recommendations

## Troubleshooting

### Port Already in Use
If port 3000 or 5173 is already in use:

```bash
# Change ports in .env files
# server/.env
PORT=3001

# client/.env
VITE_API_URL=http://localhost:3001/api
```

### Dependencies Installation Fails
Try:
```bash
rm -rf node_modules
rm -rf client/node_modules
rm -rf server/node_modules
npm install
```

### TypeScript Errors
```bash
# Rebuild TypeScript
npm run build
```

### Can't Connect to Backend
1. Make sure the server is running (`npm run server:dev`)
2. Check if port 3000 is accessible
3. Verify CORS settings in `server/src/index.ts`

## Next Steps

- Read the [full documentation](README.md)
- Check out [deployment guide](DEPLOYMENT.md)
- Learn about [contributing](CONTRIBUTING.md)
- Review [security policies](SECURITY.md)
- Compare with [FET features](COMPARISON.md)

## Need Help?

- 📧 Email: xurxoxto@github.com
- 🐛 Issues: [GitHub Issues](https://github.com/xurxoxto/horariocentros/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/xurxoxto/horariocentros/discussions)

Happy scheduling! 🎓📅
