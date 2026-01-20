# 🎓 HorarioCentros - Modern School Timetable Manager

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)

A modern, intuitive web application for creating and managing school timetables. Built with React and Node.js, designed to surpass FET (Free Timetabling Software) with superior UX and advanced features.

## ✨ Key Features

### 🎯 Superior UX
- **Drag-and-Drop Interface**: Intuitive timetable creation and editing
- **Dark Mode**: Eye-friendly theme switching
- **Mobile-Responsive**: Works seamlessly on phones, tablets, and desktops
- **Real-time Collaboration**: Multiple users can work on schedules simultaneously

### 🤖 Smart Scheduling
- **AI Scheduling Suggestions**: Intelligent recommendations for optimal timetables
- **Advanced Constraints**: Xade-like constraint system for complex scheduling rules
- **Conflict Detection**: Automatic detection and resolution suggestions
- **Optimization Engine**: Minimize gaps and maximize efficiency

### 👥 Role-Based Access
- **Admin Dashboard**: Full control over schools, teachers, and timetables
- **Teacher Portal**: View schedules, manage preferences, and availability
- **Student View**: Access personal timetables and class schedules

### 🔄 Integrations
- **Calendar Export**: Google Calendar, iCal, Outlook integration
- **PDF Export**: Professional timetable printing and sharing
- **Import/Export**: Compatible with common timetable formats

### 🔒 Security & Collaboration
- **Real-time Sync**: WebSocket-based live updates
- **Role-based Permissions**: Granular access control
- **Audit Logs**: Track all changes and modifications

## 🚀 Quick Start for Localhost

### Prerequisites
- Node.js 18+ 
- npm or yarn
- PostgreSQL (optional, SQLite for dev)

### Automated Setup (Recommended)

**Linux/macOS:**
```bash
# Clone the repository
git clone https://github.com/xurxoxto/horariocentros.git
cd horariocentros

# Run automated setup
chmod +x setup.sh
./setup.sh

# Start the application
npm run dev
```

**Windows:**
```bash
# Clone the repository
git clone https://github.com/xurxoxto/horariocentros.git
cd horariocentros

# Run automated setup
setup.bat

# Start the application
npm run dev
```

### Using Docker (Alternative)

```bash
# Start with Docker Compose
docker-compose up

# Access the app
# Frontend: http://localhost:5173
# Backend: http://localhost:3000
```

### Manual Setup

```bash
# Clone the repository
git clone https://github.com/xurxoxto/horariocentros.git
cd horariocentros

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run development server
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

📖 **For detailed setup guides:**
- **[GETTING_STARTED.md](GETTING_STARTED.md)** - Quick 2-minute guide
- **[LOCALHOST_SETUP.md](LOCALHOST_SETUP.md)** - Comprehensive setup
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Fix common issues

### Production Build

```bash
# Build both client and server
npm run build

# Start production server
npm start
```

## 🏗️ Architecture

```
horariocentros/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── features/       # Feature-based modules
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API services
│   │   ├── store/          # State management
│   │   ├── styles/         # Global styles
│   │   └── utils/          # Utility functions
│   └── package.json
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── models/         # Data models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── middleware/     # Express middleware
│   │   └── utils/          # Utility functions
│   └── package.json
└── package.json            # Root package.json
```

## 🛠️ Technology Stack

### Frontend
- **React 18**: Modern UI library
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool
- **React Router**: Client-side routing
- **Zustand**: Lightweight state management
- **React DnD**: Drag-and-drop functionality
- **Tailwind CSS**: Utility-first CSS framework
- **Socket.io Client**: Real-time communication

### Backend
- **Node.js & Express**: RESTful API server
- **TypeScript**: Type-safe backend
- **Socket.io**: WebSocket server
- **Prisma**: Database ORM
- **JWT**: Authentication
- **PDFKit**: PDF generation
- **Node-cron**: Scheduled tasks

## 📚 API Documentation

API documentation is available at `/api/docs` when running the server.

## 🧪 Testing

```bash
# Run all tests
npm test

# Run server tests
npm run server:test

# Run client tests
npm run client:test
```

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) first.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is dual-licensed:

- **AGPLv3**: Free for open-source projects. See [LICENSE](LICENSE) file.
- **Commercial License**: For proprietary/commercial use without AGPLv3 restrictions.

Contact xurxoxto@github.com for commercial licensing options.

## 🌟 Why HorarioCentros vs FET?

| Feature | HorarioCentros | FET |
|---------|---------------|-----|
| User Interface | Modern drag-and-drop web UI | Desktop Qt interface |
| Mobile Support | ✅ Full responsive design | ❌ Desktop only |
| Real-time Collaboration | ✅ Multiple users simultaneously | ❌ Single user |
| Dark Mode | ✅ Built-in theme switching | ⚠️ Limited |
| AI Suggestions | ✅ Smart scheduling recommendations | ❌ Manual only |
| Calendar Integration | ✅ Google, iCal, Outlook | ⚠️ Limited export |
| Cloud Deployment | ✅ Easy cloud hosting | ❌ Desktop only |
| Modern Tech Stack | ✅ React, Node.js, TypeScript | ⚠️ C++, Qt |

## 🗺️ Roadmap

- [x] Core timetable CRUD operations
- [x] Drag-and-drop interface
- [x] Real-time collaboration
- [x] Role-based dashboards
- [x] Dark mode support
- [x] Mobile-responsive design
- [x] PDF export
- [x] Calendar integrations
- [ ] AI scheduling optimization (Phase 2)
- [ ] Advanced constraint solver (Phase 2)
- [ ] Mobile apps (iOS/Android)
- [ ] Multi-language support
- [ ] Analytics dashboard

## 💬 Support

- 📧 Email: xurxoxto@github.com
- 🐛 Issues: [GitHub Issues](https://github.com/xurxoxto/horariocentros/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/xurxoxto/horariocentros/discussions)

## 🙏 Acknowledgments

- FET (Free Timetabling Software) for inspiration
- Xade constraint system concepts
- Open-source community

---

Made with ❤️ by xurxoxto
