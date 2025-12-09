# Trip Calendar

A beautiful, interactive calendar application for managing travel itineraries with FullCalendar.

## 📁 Project Structure

```
Travel-Calendar/
├── index.html          # Main HTML structure
├── styles.css          # All styling (buttons, calendar, modal, etc.)
├── script.js           # Application logic and event handlers
├── events.json         # Default event data (Tokyo & Sapporo trip)
├── favicon.ico         # Site icon
└── fullcalendar/       # FullCalendar library (optional local copy)
```

## 🎯 Features

- **Multiple Views**: Month, Week, and Day views
- **Event Management**: Add, edit, and delete events with detailed information
- **Event Details**:
  - Title, start/end times, address
  - Reservation info, cost, directions
  - Multiple links
  - Photo uploads
- **Smart Navigation**: "Next Event" feature with Google Maps integration
- **List View**: Toggle between calendar and chronological list view
- **Import/Export**: 
  - Export all events to JSON
  - Import events from JSON files
- **Data Persistence**: Events saved to localStorage
- **Default Data**: Loads from `events.json` on first use

## 🚀 Getting Started

1. Open `index.html` in a web browser
2. The calendar will load default events from `events.json`
3. Events are automatically saved to localStorage as you make changes

## 📝 Managing Event Data

### Editing Default Events
Edit `events.json` to modify the default event data. The file structure:

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

### Export/Import
- **Export**: Click "Export Events" to download current events as JSON
- **Import**: Click "Import Events" to load events from a JSON file
  - Note: Import replaces all current events

## 🔄 Data Flow

1. **First Load**: Loads from `events.json` → Saves to localStorage
2. **Subsequent Loads**: Loads from localStorage
3. **Reset to Defaults**: Clear localStorage to reload from `events.json`

## 🛠️ Technologies

- **FullCalendar** v6.1.8 - Calendar UI
- **Google Fonts** - Montserrat & Roboto
- **Vanilla JavaScript** - No framework dependencies
- **localStorage API** - Data persistence
- **FileReader API** - Photo & import functionality

## 📱 Browser Compatibility

Works in all modern browsers that support:
- ES6+ JavaScript
- localStorage
- FileReader API
- async/await

---

Created with ❤️ for travel planning

