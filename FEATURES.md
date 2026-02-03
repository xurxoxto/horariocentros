# Features Documentation

Complete guide to all HorarioCentros features.

## Table of Contents
1. [User Interface](#user-interface)
2. [Timetable Management](#timetable-management)
3. [Collaboration](#collaboration)
4. [AI & Automation](#ai--automation)
5. [Constraints System](#constraints-system)
6. [Export & Integration](#export--integration)
7. [User Management](#user-management)
8. [Mobile & Accessibility](#mobile--accessibility)

---

## User Interface

### Dark Mode
- **Automatic detection**: Respects system preferences
- **Manual toggle**: Switch between light and dark themes
- **Persistent**: Remembers your choice across sessions
- **All pages supported**: Consistent theming throughout

### Responsive Design
- **Mobile-first**: Optimized for phones (320px+)
- **Tablet-ready**: Perfect layout for tablets
- **Desktop-enhanced**: Full features on large screens
- **Touch-friendly**: Large tap targets for mobile users

### Navigation
- **Clear menu structure**: Easy access to all features
- **Breadcrumbs**: Always know where you are
- **Quick actions**: Common tasks one click away
- **Search**: Find timetables, teachers, classes quickly

---

## Timetable Management

### Visual Grid Interface
- **Weekly view**: See Monday-Friday at a glance
- **Period rows**: Customizable time slots
- **Color-coded subjects**: Visual distinction
- **Empty slot indicators**: Easily spot gaps

### Drag-and-Drop Scheduling
- **Intuitive dragging**: Move classes with mouse/touch
- **Visual feedback**: See where you're dropping
- **Auto-conflict detection**: Warns about overlaps
- **Undo/Redo**: Planned for future release

### Multiple Timetables
- **Per academic year**: Fall, Spring semesters
- **Multiple schools**: Manage different locations
- **Templates**: Create from existing timetables
- **Archive**: Keep historical data

### Class Configuration
- **Add subjects**: Define courses
- **Assign teachers**: Link educators to subjects
- **Set rooms**: Specify locations
- **Hours per week**: Configure frequency

---

## Collaboration

### Real-time Updates
- **WebSocket sync**: Instant updates across users
- **Active user indicator**: See who's online
- **Live cursors**: See what others are editing (planned)
- **Change notifications**: Alert on modifications

### User Presence
- **Who's viewing**: Know who's looking at the timetable
- **Activity status**: See recent actions
- **Collaboration stats**: Track team engagement

### Conflict Prevention
- **Lock slots**: Prevent simultaneous edits
- **Auto-merge**: Resolve simple conflicts
- **Manual resolution**: Handle complex cases

---

## AI & Automation

### Smart Scheduling
- **Optimal placement**: AI suggests best time slots
- **Score-based ranking**: See quality of suggestions
- **Reason explanations**: Understand why AI suggests slots
- **Multiple options**: Choose from top 5 suggestions

### Conflict Detection
- **Teacher conflicts**: Same teacher, different classes
- **Room conflicts**: Double-booked rooms
- **Class conflicts**: Students in two places
- **Constraint violations**: Rule breaking alerts

### Automatic Optimization
- **Gap minimization**: Reduce free periods
- **Load balancing**: Even distribution across days
- **Preference matching**: Honor teacher requests
- **Constraint satisfaction**: Meet all requirements

---

## Constraints System

### Constraint Types

#### Time Constraints
- **Max hours per day**: Limit teaching hours
- **Preferred times**: Morning/afternoon preferences
- **Avoid times**: Block specific slots
- **Consecutive periods**: Group related classes
- **Break requirements**: Ensure rest periods

#### Teacher Constraints
- **Availability**: Mark unavailable times
- **Workload limits**: Maximum classes
- **Subject expertise**: Qualified subjects only
- **Room preferences**: Preferred locations

#### Class Constraints
- **Room requirements**: Lab, gym, regular classroom
- **Group divisions**: Split large classes
- **Subject sequences**: Order matters (theory before lab)
- **Balanced schedule**: Even daily distribution

#### Space Constraints
- **Room capacity**: Match class size
- **Equipment needs**: Special facilities
- **Location preferences**: Building/floor constraints

### Constraint Priority Levels
- **Required** (Hard): Must be satisfied
- **Preferred** (Soft): Should be satisfied
- **Avoid**: Try to prevent

### Xade-like Features
- **Complex expressions**: Boolean logic
- **Custom constraints**: User-defined rules
- **Weighted priorities**: Fine-grained control
- **Validation engine**: Pre-check feasibility

---

## Export & Integration

### PDF Export
- **Multiple formats**: Landscape, portrait
- **Customizable layouts**: Choose what to show
- **Print-ready**: High-quality output
- **Bulk export**: All classes at once

### Calendar Integration
- **iCal format**: Import to any calendar app
- **Google Calendar**: Direct sync (planned)
- **Outlook**: Compatible format
- **Recurring events**: Automatic repetition

### Data Export
- **CSV format**: Spreadsheet compatible
- **JSON**: For developers
- **XML**: FET format (planned)
- **Backup/restore**: Full data export

### API Access
- **RESTful API**: Programmatic access
- **Authentication**: JWT tokens
- **Rate limiting**: Fair usage
- **Documentation**: OpenAPI/Swagger (planned)

---

## User Management

### Role-Based Access Control

#### Admin Role
- Create/edit all timetables
- Manage users and permissions
- Configure school settings
- View analytics and reports
- Export all data

#### Teacher Role
- View own schedule
- Request preferred times
- Mark availability
- View class timetables
- Export own calendar

#### Student Role
- View personal schedule
- See class timetables
- Export to calendar
- Subscribe to updates

### Authentication
- **JWT tokens**: Secure sessions
- **Password hashing**: bcrypt encryption
- **Token expiration**: Auto logout
- **2FA support**: Planned feature

### Permissions
- **Granular control**: Per-feature permissions
- **Role inheritance**: Hierarchical roles
- **Custom roles**: Define your own (planned)

---

## Mobile & Accessibility

### Mobile Features
- **Touch gestures**: Swipe, tap, pinch
- **Offline mode**: Work without internet (planned)
- **Push notifications**: Schedule updates
- **Mobile apps**: Native iOS/Android (planned)

### Accessibility
- **Keyboard navigation**: Full keyboard support
- **Screen readers**: ARIA labels
- **High contrast**: Enhanced visibility
- **Font scaling**: Adjustable text size
- **Color blind modes**: Alternative color schemes (planned)

### Internationalization
- **Multi-language**: Spanish, English, Galician (planned)
- **Date formats**: Locale-specific
- **Time zones**: Automatic conversion
- **Right-to-left**: RTL languages support (planned)

---

## Performance Features

### Optimization
- **Lazy loading**: Load data as needed
- **Caching**: Reduce server requests
- **Compression**: Faster data transfer
- **CDN ready**: Static asset optimization

### Scalability
- **Horizontal scaling**: Multiple servers
- **Database indexing**: Fast queries
- **Connection pooling**: Efficient DB access
- **Load balancing**: Distribute traffic

---

## Security Features

### Data Protection
- **Encryption**: HTTPS required
- **Data sanitization**: XSS prevention
- **SQL injection protection**: Parameterized queries
- **CSRF tokens**: Cross-site protection

### Audit & Compliance
- **Change logs**: Track all modifications
- **Access logs**: Monitor usage
- **GDPR compliance**: Data privacy
- **Data retention**: Configurable policies

---

## Upcoming Features

### Phase 2 (Q2 2024)
- [ ] Advanced AI optimization engine
- [ ] Mobile native apps
- [ ] Enhanced analytics dashboard
- [ ] Multi-school management
- [ ] Custom report builder

### Phase 3 (Q3 2024)
- [ ] Student information system integration
- [ ] Parent portal
- [ ] Attendance tracking
- [ ] Grade integration
- [ ] Resource booking

### Phase 4 (Q4 2024)
- [ ] Machine learning predictions
- [ ] Automated scheduling
- [ ] Curriculum planning
- [ ] Teacher workload analysis
- [ ] Performance metrics

---

## Feature Requests

Have an idea? We'd love to hear it!

1. Check [existing requests](https://github.com/xurxoxto/horariocentros/issues)
2. Open a [new issue](https://github.com/xurxoxto/horariocentros/issues/new)
3. Vote on features you want
4. Contribute code!

---

For detailed API documentation, see `/api/docs` when running the server.
