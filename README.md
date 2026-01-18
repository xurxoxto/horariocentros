# School Timetable Manager (HorarioCentros)

A modern, comprehensive school timetable management application with advanced features, real-time collaboration, and cloud functionality.

## 🌟 Features

### Core Features
- **Multi-role Authentication**: Support for Admin, Teacher, Student, Parent, and Department Head roles
- **SSO Integration**: Google and Microsoft single sign-on
- **Modern UI/UX**: Responsive design with dark/light mode
- **Real-time Collaboration**: Live editing with Socket.IO
- **Drag-and-Drop Interface**: Intuitive timetable creation
- **PWA Support**: Progressive Web App capabilities
- **Accessibility**: WCAG 2.1 compliant

### Timetable Engine
- **Advanced Constraint-based Scheduling**: Multiple algorithm support
- **Real-time Conflict Detection**: Automatic conflict identification
- **Resource Optimization**: Smart room and teacher allocation
- **Multi-criteria Optimization**: Teacher preferences, room proximity
- **Auto-scheduling**: AI-powered suggestions for optimal placement

### Management Features
- **Academic Year/Term Management**: Complete academic calendar support
- **Room Management**: Floor plans, equipment tracking, capacity management
- **Subject Management**: Department organization, credit tracking
- **Teacher Management**: Availability preferences, subject assignments
- **Student Group Management**: Classes, batches, and streams

### Integration & Mobile
- **Calendar Sync**: Google Calendar, Outlook, iCal integration
- **Notification System**: Email, push, and SMS notifications
- **Offline Capability**: Work offline with automatic sync
- **QR Code Sharing**: Easy timetable distribution
- **REST API**: Third-party integration support

## 🏗️ Architecture

### Tech Stack

#### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for HTTP requests
- **Socket.IO Client** for real-time features
- **date-fns** for date manipulation
- **Heroicons** for icons

#### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **PostgreSQL** for database
- **Socket.IO** for WebSocket connections
- **JWT** for authentication
- **Passport.js** for SSO
- **bcrypt** for password hashing

### Project Structure
```
horariocentros/
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts (Auth, Theme)
│   │   ├── services/      # API services
│   │   ├── types/         # TypeScript type definitions
│   │   └── utils/         # Utility functions
│   ├── public/            # Static assets
│   └── package.json
├── backend/               # Node.js backend API
│   ├── src/
│   │   ├── routes/       # API routes
│   │   ├── controllers/  # Request handlers
│   │   ├── models/       # Data models
│   │   ├── services/     # Business logic
│   │   ├── middleware/   # Express middleware
│   │   └── config/       # Configuration files
│   └── package.json
├── docs/                 # Documentation
├── docker-compose.yml    # Docker composition
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- PostgreSQL 15+ (or use Docker)

### Local Development

#### 1. Clone the repository
```bash
git clone https://github.com/xurxoxto/horariocentros.git
cd horariocentros
```

#### 2. Setup Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

The backend will run on `http://localhost:8000`

#### 3. Setup Frontend
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

The frontend will run on `http://localhost:3000`

### Using Docker

```bash
# Build and run all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 📖 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout
- `GET /api/auth/sso/google` - Google SSO
- `GET /api/auth/sso/microsoft` - Microsoft SSO

### Timetable Endpoints
- `GET /api/timetable/entries` - Get timetable entries
- `POST /api/timetable/entries` - Create entry
- `PUT /api/timetable/entries/:id` - Update entry
- `DELETE /api/timetable/entries/:id` - Delete entry
- `GET /api/timetable/conflicts` - Detect conflicts
- `POST /api/timetable/auto-schedule` - Auto-schedule

### Resource Endpoints
- `GET /api/rooms` - Get all rooms
- `POST /api/rooms` - Create room
- `GET /api/subjects` - Get all subjects
- `POST /api/subjects` - Create subject
- `GET /api/teachers` - Get all teachers
- `POST /api/teachers` - Create teacher
- `GET /api/student-groups` - Get student groups
- `POST /api/student-groups` - Create student group

## 🎨 Features Comparison vs FET

| Feature | HorarioCentros | FET |
|---------|---------------|-----|
| Modern Web Interface | ✅ | ❌ |
| Real-time Collaboration | ✅ | ❌ |
| Mobile Responsive | ✅ | ❌ |
| Cloud Sync & Backup | ✅ | ❌ |
| SSO Authentication | ✅ | ❌ |
| Interactive Visualization | ✅ | Limited |
| REST API | ✅ | ❌ |
| Dark/Light Mode | ✅ | ❌ |
| PWA Support | ✅ | ❌ |
| Multi-language | 🔄 | ✅ |

## 🔒 Security

- JWT-based authentication
- Password hashing with bcrypt
- HTTPS support
- CORS configuration
- SQL injection protection
- XSS protection
- Rate limiting (coming soon)

## 📱 Mobile Support

The application is fully responsive and works on:
- Desktop browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Android)
- Can be installed as PWA on mobile devices

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

ISC License

## 👥 Authors

- xurxoxto

## 🙏 Acknowledgments

- Inspired by FET (Free Timetabling Software)
- Built with modern web technologies
- Designed for educational institutions worldwide

## 📞 Support

For issues, questions, or suggestions, please open an issue on GitHub.

## 🗺️ Roadmap

### Phase 1 (Current)
- ✅ Basic authentication system
- ✅ Core UI/UX implementation
- ✅ Database models
- ✅ REST API foundation
- ✅ Real-time WebSocket setup

### Phase 2 (Next)
- 🔄 Advanced scheduling algorithms
- 🔄 Conflict resolution engine
- 🔄 Database integration
- 🔄 User role permissions
- 🔄 Calendar integrations

### Phase 3 (Future)
- ⏳ AI-powered scheduling
- ⏳ Analytics dashboard
- ⏳ Mobile native apps
- ⏳ Report generation
- ⏳ Multi-language support

## 📚 Additional Resources

- [API Documentation](./docs/API.md)
- [User Guide](./docs/USER_GUIDE.md)
- [Developer Guide](./docs/DEVELOPER.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)
