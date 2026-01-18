# HorarioCentros vs FET: Feature Comparison

This document provides a detailed comparison between HorarioCentros and FET (Free Timetabling Software).

## Executive Summary

HorarioCentros is designed as a modern, web-based alternative to FET with focus on user experience, collaboration, and accessibility. While FET is a powerful desktop application, HorarioCentros brings timetable management to the cloud era.

## Detailed Feature Comparison

### User Interface & Experience

| Feature | HorarioCentros | FET |
|---------|---------------|-----|
| Interface Type | Modern web UI with React | Desktop Qt interface |
| Drag-and-Drop | ✅ Intuitive drag-and-drop | ⚠️ Limited drag-and-drop |
| Dark Mode | ✅ Built-in with system detection | ⚠️ Limited theme support |
| Mobile Support | ✅ Fully responsive (phone/tablet) | ❌ Desktop only |
| Learning Curve | 🟢 Easy - Intuitive UI | 🟡 Moderate - Complex menus |
| Visual Design | 🟢 Modern, clean | 🟡 Functional but dated |

### Collaboration & Access

| Feature | HorarioCentros | FET |
|---------|---------------|-----|
| Multi-user Editing | ✅ Real-time collaboration | ❌ Single user only |
| Role-based Access | ✅ Admin/Teacher/Student roles | ❌ No role system |
| Remote Access | ✅ Access from anywhere | ❌ Desktop installation required |
| Live Updates | ✅ WebSocket real-time sync | ❌ Manual file sharing |
| Concurrent Users | ✅ Multiple simultaneous users | ❌ One user at a time |
| Cloud Storage | ✅ Centralized database | ⚠️ Local XML files |

### Scheduling & Constraints

| Feature | HorarioCentros | FET |
|---------|---------------|-----|
| Constraint System | ✅ Xade-like advanced constraints | ✅ Comprehensive constraints |
| AI Suggestions | ✅ Smart scheduling recommendations | ❌ Manual only |
| Conflict Detection | ✅ Real-time detection | ✅ Pre-generation validation |
| Auto-solving | ✅ AI-powered (planned) | ✅ Powerful solver |
| Manual Editing | ✅ Easy drag-and-drop | ⚠️ Dialog-based editing |
| Constraint Priority | ✅ Required/Preferred/Avoid | ✅ Weighted constraints |

### Integration & Export

| Feature | HorarioCentros | FET |
|---------|---------------|-----|
| PDF Export | ✅ Professional layouts | ✅ Multiple PDF formats |
| Calendar Integration | ✅ Google Calendar, iCal, Outlook | ⚠️ iCal export only |
| CSV Import/Export | ✅ Planned | ✅ Supported |
| API Access | ✅ RESTful API | ❌ No API |
| Webhook Support | ✅ Planned | ❌ No webhooks |
| Third-party Integration | ✅ Easy integration | ⚠️ Limited |

### Technical Aspects

| Feature | HorarioCentros | FET |
|---------|---------------|-----|
| Technology Stack | React, Node.js, TypeScript | C++, Qt |
| Deployment | ✅ Cloud/Self-hosted options | ❌ Desktop installation |
| Updates | ✅ Automatic (cloud) | ⚠️ Manual download |
| Backup | ✅ Automatic cloud backup | ⚠️ Manual file backup |
| Cross-platform | ✅ Any browser | ⚠️ Windows, Linux, macOS apps |
| System Requirements | 🟢 Any device with browser | 🟡 Desktop OS required |

### Performance

| Feature | HorarioCentros | FET |
|---------|---------------|-----|
| Large Timetables | ⚠️ Good (web limitations) | ✅ Excellent (native app) |
| Generation Speed | 🟡 Moderate | ✅ Very fast |
| UI Responsiveness | ✅ Smooth | ✅ Smooth |
| Memory Usage | 🟢 Low (browser-based) | 🟡 Moderate (desktop app) |

### Usability Features

| Feature | HorarioCentros | FET |
|---------|---------------|-----|
| Undo/Redo | ✅ Planned | ✅ Supported |
| Templates | ✅ Planned | ✅ Supported |
| Duplicate Timetables | ✅ Easy cloning | ✅ Copy/paste |
| Search/Filter | ✅ Advanced search | ⚠️ Basic search |
| Keyboard Shortcuts | ✅ Planned | ✅ Extensive |
| Tooltips/Help | ✅ Contextual help | ✅ Comprehensive docs |

### Advanced Features

| Feature | HorarioCentros | FET |
|---------|---------------|-----|
| Room Management | ✅ Integrated | ✅ Comprehensive |
| Teacher Preferences | ✅ Easy to set | ✅ Supported |
| Class Division | ✅ Planned | ✅ Complex divisions |
| Activity Tags | ✅ Planned | ✅ Extensive tagging |
| Time Constraints | ✅ Xade-like system | ✅ Very comprehensive |
| Space Constraints | ✅ Basic | ✅ Very detailed |

### Security & Privacy

| Feature | HorarioCentros | FET |
|---------|---------------|-----|
| Authentication | ✅ JWT-based | ❌ No auth (desktop) |
| Authorization | ✅ Role-based (RBAC) | ❌ N/A |
| Data Encryption | ✅ HTTPS, encrypted DB | ⚠️ Local file security |
| Audit Logs | ✅ All changes tracked | ❌ No logging |
| GDPR Compliance | ✅ Privacy controls | ⚠️ User responsibility |

### Support & Community

| Feature | HorarioCentros | FET |
|---------|---------------|-----|
| Documentation | ✅ Modern, web-based | ✅ Comprehensive HTML |
| Community | 🆕 Growing | 🟢 Established |
| Updates Frequency | 🟢 Regular | 🟢 Regular |
| Issue Tracking | ✅ GitHub Issues | ✅ Forum |
| Commercial Support | ✅ Available | ⚠️ Community-based |

## Use Case Recommendations

### Choose HorarioCentros if you need:
- Web-based access from multiple devices
- Real-time collaboration among staff
- Modern, intuitive interface
- Cloud storage and automatic backups
- Mobile access for teachers/students
- Easy deployment without IT expertise
- Role-based access control
- Calendar integrations

### Choose FET if you need:
- Maximum performance for very large schools
- Offline operation is critical
- Extremely complex constraint scenarios
- Desktop application preference
- No internet connectivity required
- Mature, battle-tested solution
- Free and open source (GPL)

## Pricing Comparison

| Aspect | HorarioCentros | FET |
|--------|---------------|-----|
| Base Software | Open source (AGPLv3) | Open source (GPL) |
| Cloud Hosting | Varies by provider | N/A (self-hosted) |
| Commercial License | Available for purchase | N/A |
| Enterprise Support | Available | Community |

## Migration Path

Moving from FET to HorarioCentros:
1. Export your FET data to CSV/XML
2. Use HorarioCentros import tool (planned)
3. Verify constraints and settings
4. Test timetable generation
5. Train staff on new interface

## Roadmap

### HorarioCentros Future Features
- Enhanced AI scheduling optimization
- Advanced constraint solver comparable to FET
- Mobile native apps (iOS/Android)
- Offline mode with sync
- Advanced analytics dashboard
- Multi-language support
- Integration marketplace

## Conclusion

Both tools have their strengths:
- **FET** is ideal for power users who need maximum control and performance
- **HorarioCentros** excels at collaboration, accessibility, and modern UX

The choice depends on your school's specific needs, technical capabilities, and workflow preferences.

---

For questions about specific features or migration planning, contact: xurxoxto@github.com
