# 🌍 Trip Calendar

A beautiful, interactive calendar application for managing travel itineraries with real-time collaboration powered by Firebase and FullCalendar.

**Live Demo:** [https://tiffho527.github.io/Travel-Calendar/](https://tiffho527.github.io/Travel-Calendar/)

---

## 📁 Project Structure

```
Travel-Calendar/
├── index.html                    # Collaborative calendar (Firebase enabled)
├── index-local.html             # Local-only version (no Firebase)
├── script.js                    # Collaborative logic with Firebase sync
├── script-local.js              # Local-only logic
├── styles.css                   # All styling (buttons, calendar, modal, etc.)
├── events.json                  # Default event data (31 Tokyo & Sapporo events)
├── favicon.ico                  # Site icon
├── .gitignore                   # Git ignore rules
├── firebase-config.js           # Firebase credentials (local only, gitignored)
├── firebase-config.template.js  # Firebase config template for setup
├── .github/
│   └── workflows/
│       └── deploy.yml           # GitHub Actions deployment workflow
├── fullcalendar/                # FullCalendar library (optional local copy)
└── Documentation/
    ├── README.md                # This file
    ├── SETUP_GUIDE.md           # Firebase setup instructions
    └── GITHUB_SECRETS_DEPLOY.md # GitHub Secrets setup
```

---

## 🎯 Features

### Core Calendar Features
- **Multiple Views**: Month, Week, and Day views
- **Event Management**: Add, edit, and delete events with detailed information
- **Event Details**:
  - Title, start/end times, address
  - Reservation info, cost, directions
  - Multiple links support
  - Photo uploads with preview
- **Smart Navigation**: "Next Event" feature with Google Maps integration (drive, walk, transit)
- **List View**: Toggle between calendar and chronological list view

### Data Management
- **Import/Export**: 
  - Export all events to JSON with timestamp
  - Import events from JSON files
  - Merge or replace options
- **Reset Functionality**: Reset to all 31 default events with one click
- **Data Persistence**: 
  - Local: localStorage
  - Collaborative: Firebase Realtime Database
- **Embedded Fallback**: All 31 events embedded in code for offline use

### Collaboration Features (Firebase Version)
- **Real-Time Sync**: Changes appear instantly across all devices
- **Connection Status Indicator**: Shows live connection status
  - 🔄 Connecting...
  - ✅ Live (Collaborative Mode)
  - 📴 Offline (Local Mode)
- **Automatic Conflict Resolution**: Firebase handles concurrent edits
- **Offline Support**: Works offline, syncs when reconnected
- **Multi-User**: Unlimited users can collaborate simultaneously

---

## 🚀 Getting Started

### Option 1: Local Development (No Firebase)
```bash
# Clone the repository
git clone https://github.com/tiffho527/Travel-Calendar.git
cd Travel-Calendar

# Open in browser
open index-local.html  # Mac
start index-local.html # Windows
```

### Option 2: Collaborative Mode (With Firebase)
```bash
# Clone the repository
git clone https://github.com/tiffho527/Travel-Calendar.git
cd Travel-Calendar

# Copy Firebase config template
cp firebase-config.template.js firebase-config.js

# Edit firebase-config.js with your Firebase credentials
# (See SETUP_GUIDE.md for detailed instructions)

# Open in browser
open index.html
```

### Option 3: Use Deployed Version
Simply visit: [https://tiffho527.github.io/Travel-Calendar/](https://tiffho527.github.io/Travel-Calendar/)

---

## 🔥 Firebase Setup (Optional - For Collaboration)

To enable real-time collaboration:

1. **Create a Firebase project** at [Firebase Console](https://console.firebase.google.com)
2. **Enable Realtime Database** in your Firebase project
3. **Copy your Firebase credentials**
4. **Update `firebase-config.js`** with your credentials
5. **See `SETUP_GUIDE.md`** for detailed step-by-step instructions

**Benefits of Firebase:**
- ✅ Real-time collaboration across devices
- ✅ Automatic data sync
- ✅ Offline support with auto-reconnect
- ✅ Free tier supports 1000+ users

---

## 📝 Managing Event Data

### Default Events
The repository includes 31 pre-configured events for a Tokyo & Sapporo trip (Jan 26 - Feb 10, 2026):
- Tokyo attractions and activities
- Sapporo exploration
- Flight details
- Hotel check-ins
- Restaurant reservations
- Activity bookings

### Event Data Structure
```json
[
  {
    "title": "Event Title",
    "start": "2026-01-26T15:20:00",
    "end": "2026-01-26T17:15:00",
    "address": "Event Location",
    "notes": {
      "reservation": "Booking details",
      "cost": "Price info",
      "directions": "How to get there",
      "links": ["url1", "url2"],
      "photos": []
    }
  }
]
```

### Import/Export Features
- **Export**: Download all events as timestamped JSON file
- **Import**: Load events from JSON file
  - Replaces all current events
  - Updates all collaborators instantly (if using Firebase)
- **Reset**: Click "🔄 Reset to 31 Events" to restore default events

---

## 🔄 Data Flow

### Local Version (`index-local.html`):
1. **First Load**: `events.json` → localStorage
2. **Subsequent Loads**: localStorage
3. **Fallback**: Embedded events (31 events hardcoded)

### Collaborative Version (`index.html`):
1. **First Load**: Firebase (if configured) → `events.json` → Embedded events
2. **Subsequent Loads**: Firebase (with offline cache)
3. **Real-time Updates**: Firebase sync across all users
4. **Fallback Chain**: Firebase → localStorage → `events.json` → Embedded events

---

## 🚢 Deployment

### Automatic Deployment (GitHub Actions)
The repository includes a GitHub Actions workflow that:
- ✅ Automatically deploys to GitHub Pages on push to `main`
- ✅ Creates `firebase-config.js` from GitHub Secrets
- ✅ Deploys to `gh-pages` branch
- ✅ No manual steps required after initial setup

**Setup GitHub Secrets:**
See `GITHUB_SECRETS_DEPLOY.md` for complete instructions.

### Manual Deployment
1. Push to `main` branch
2. GitHub Actions automatically builds and deploys
3. Site live at: `https://YOUR_USERNAME.github.io/Travel-Calendar/`

---

## 🛠️ Technologies

### Frontend
- **FullCalendar** v6.1.8 - Interactive calendar UI
- **Google Fonts** - Montserrat & Roboto typography
- **Vanilla JavaScript** - ES6+ features, no framework
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with animations

### Backend/Storage
- **Firebase Realtime Database** - Real-time data sync
- **localStorage API** - Local data persistence
- **FileReader API** - File handling for photos & imports

### Deployment
- **GitHub Pages** - Static site hosting
- **GitHub Actions** - CI/CD automation
- **GitHub Secrets** - Secure credential management

### Development
- **Git** - Version control
- **GitHub** - Repository hosting

---

## 🔒 Security

- ✅ Firebase credentials stored in GitHub Secrets (not committed)
- ✅ `firebase-config.js` in `.gitignore` (local only)
- ✅ API key restrictions recommended (domain whitelist)
- ✅ Firebase Security Rules can be configured
- ✅ No sensitive data in repository

**Best Practices:**
- Keep `firebase-config.js` local only (never commit)
- Restrict API keys to your domain in Firebase Console
- Use GitHub Secrets for deployment credentials
- See `GITHUB_SECRETS_DEPLOY.md` for secure deployment setup

---

## 📱 Browser Compatibility

**Fully supported in:**
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

**Requirements:**
- ES6+ JavaScript support
- localStorage API
- FileReader API
- async/await
- Fetch API

---

## 📚 Documentation

- **`README.md`** - This file (overview and quick start)
- **`SETUP_GUIDE.md`** - Detailed Firebase setup instructions (console setup, security rules, testing)
- **`GITHUB_SECRETS_DEPLOY.md`** - GitHub Actions workflow configuration and GitHub Secrets setup

---

## 🤝 Contributing

This is a personal travel calendar project, but feel free to fork and customize for your own trips!

### To Customize:
1. Fork the repository
2. Update `events.json` with your trip events
3. Modify styling in `styles.css`
4. Deploy to your own GitHub Pages

---

## 📄 License

This project is open source and available for personal use.

---

## 🎉 Features Roadmap

- [x] Real-time collaboration with Firebase
- [x] Import/Export functionality
- [x] Photo uploads
- [x] Google Maps integration
- [x] Offline support
- [x] Embedded fallback events
- [x] Automated deployment
- [ ] User authentication (optional)
- [ ] Event categories/tags
- [ ] Calendar sharing links
- [ ] Mobile app version

---

## 💡 Use Cases

Perfect for:
- ✈️ **Travel Planning** - Organize your itinerary
- 🏖️ **Vacation Coordination** - Collaborate with travel companions
- 🎉 **Event Management** - Track reservations and bookings
- 📅 **Trip Timeline** - Visualize your journey
- 👨‍👩‍👧‍👦 **Family Trips** - Share plans with everyone
- 💼 **Business Travel** - Manage meetings and logistics

---

## 🆘 Support

For issues or questions:
1. Check the documentation in the repo
2. Review `SETUP_GUIDE.md` for Firebase setup
3. Check browser console for error messages
4. Open an issue on GitHub

---

**Created with ❤️ for travel planning**

**Live Site:** [https://tiffho527.github.io/Travel-Calendar/](https://tiffho527.github.io/Travel-Calendar/)

