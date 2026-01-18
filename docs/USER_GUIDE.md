# User Guide

## Getting Started

### First Time Setup

1. **Access the Application**
   - Open your web browser
   - Navigate to `http://localhost:3000` (or your deployed URL)

2. **Create an Account**
   - Click "Sign Up" or use Google/Microsoft SSO
   - Choose your role: Admin, Teacher, Student, Parent, or Department Head
   - Complete your profile

3. **Login**
   - Enter your email and password
   - Or use SSO for quick access

## Dashboard

The dashboard provides an overview of:
- Active timetables
- Student groups
- Rooms and resources
- Teachers
- Today's classes
- Room utilization statistics

### Quick Actions
- Create Timetable
- Manage Groups
- Add Room
- View Reports

## Managing Timetables

### Creating a Timetable

1. Navigate to **Timetable** from the sidebar
2. Click **"Create Timetable"**
3. Fill in the details:
   - Academic year
   - Term
   - Start and end dates
4. Click **"Save"**

### Adding Classes to Timetable

1. Open the timetable view
2. Click on a time slot
3. Fill in class details:
   - Subject
   - Teacher
   - Room
   - Student group
4. Click **"Add Class"**

### Drag and Drop

- Click and hold on a class
- Drag it to a new time slot
- Release to drop
- The system will check for conflicts automatically

### Conflict Detection

The system automatically detects:
- **Teacher conflicts**: Same teacher scheduled twice at same time
- **Room conflicts**: Same room double-booked
- **Student conflicts**: Student group double-booked
- **Resource conflicts**: Equipment unavailable

When conflicts are detected:
- Red warning badge appears
- Click for details
- System suggests alternatives

## Room Management

### Adding a Room

1. Go to **Rooms** section
2. Click **"Add Room"**
3. Enter details:
   - Room name
   - Building
   - Floor
   - Capacity
   - Type (Classroom, Lab, Auditorium, etc.)
   - Equipment available
4. Click **"Save"**

### Editing Room Details

1. Find the room in the list
2. Click the edit icon
3. Update information
4. Click **"Save Changes"**

## Subject Management

### Creating a Subject

1. Navigate to **Subjects**
2. Click **"Add Subject"**
3. Fill in:
   - Subject name
   - Subject code
   - Department
   - Credits
   - Lab requirement
   - Color for calendar display
4. Save

## Teacher Management

### Adding a Teacher

1. Go to **Teachers**
2. Click **"Add Teacher"**
3. Enter:
   - Name and email
   - Subjects they teach
   - Availability (days and times)
4. Set preferences:
   - Maximum consecutive classes
   - Preferred time slots
   - Times to avoid

### Setting Availability

1. Select teacher
2. Click **"Edit Availability"**
3. Mark available time slots on calendar
4. Save changes

## Student Group Management

### Creating Student Groups

1. Navigate to **Student Groups**
2. Click **"Create Group"**
3. Enter:
   - Group name (e.g., "Grade 10 A")
   - Grade level
   - Stream/Track
   - Number of students
4. Add students to group

## Theme and Preferences

### Changing Theme

1. Click the theme icon in top bar
2. Choose:
   - **Light**: Bright mode
   - **Dark**: Dark mode
   - **System**: Matches your OS setting

### Notification Settings

1. Go to **Settings**
2. Configure notifications:
   - Email notifications
   - Push notifications
   - SMS alerts

## Calendar Integration

### Syncing with Google Calendar

1. Go to **Settings** → **Integrations**
2. Click **"Connect Google Calendar"**
3. Authorize the app
4. Choose which calendars to sync

### Syncing with Outlook

1. Go to **Settings** → **Integrations**
2. Click **"Connect Outlook"**
3. Sign in with Microsoft account
4. Select calendars

## Mobile Usage

### Installing as PWA

**On iOS:**
1. Open in Safari
2. Tap Share button
3. Select "Add to Home Screen"

**On Android:**
1. Open in Chrome
2. Tap menu (⋮)
3. Select "Install App"

### Offline Mode

- The app works offline
- Changes sync when you're back online
- Yellow indicator shows offline status

## Reports and Analytics

### Viewing Reports

1. Go to **Reports** section
2. Choose report type:
   - Teacher utilization
   - Room utilization
   - Class distribution
   - Conflict analysis

### Exporting Data

1. Open any report
2. Click **"Export"**
3. Choose format:
   - PDF
   - Excel
   - CSV

## Tips and Best Practices

### For Administrators
- Set up all resources (rooms, subjects) before creating timetables
- Define clear availability for teachers
- Use the auto-schedule feature for initial setup
- Review and manually adjust as needed

### For Teachers
- Keep your availability up to date
- Set preferences for optimal scheduling
- Check timetable regularly for updates
- Report conflicts immediately

### For Students/Parents
- Check timetable daily for changes
- Enable push notifications
- Sync with personal calendar
- Contact admin for timetable issues

## Troubleshooting

### Can't Login
- Check email and password
- Try password reset
- Clear browser cache
- Contact administrator

### Timetable Not Loading
- Check internet connection
- Refresh the page
- Clear browser cache
- Try different browser

### Sync Issues
- Check internet connection
- Force sync in settings
- Check for conflicts
- Contact support

## Keyboard Shortcuts

- `Ctrl/Cmd + K` - Quick search
- `Ctrl/Cmd + N` - New timetable entry
- `Esc` - Close modal
- `Arrow keys` - Navigate calendar
- `Delete` - Delete selected entry

## Getting Help

- Click **Help** icon for in-app help
- Check documentation
- Contact administrator
- Report bugs on GitHub
