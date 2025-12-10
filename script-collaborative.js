// Collaborative Calendar with Firebase Realtime Sync
document.addEventListener('DOMContentLoaded', function() {
  const calendarEl = document.getElementById('calendar');
  const listEl = document.getElementById('listView');
  let isCalendarView = true;
  let currentEventId = null;
  let calendar;
  let stored = [];
  let isFirebaseReady = false;

  // Connection status indicator
  const statusIndicator = document.createElement('div');
  statusIndicator.id = 'connectionStatus';
  statusIndicator.className = 'status-connecting';
  statusIndicator.innerHTML = '🔄 Connecting...';
  document.querySelector('header').appendChild(statusIndicator);

  function toDateTimeLocalString(dateStr){
    const d = new Date(dateStr);
    if(isNaN(d)) return '';
    const pad = n => String(n).padStart(2,'0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  function generateId() { return 'evt-' + Math.random().toString(36).substr(2, 9) + Date.now(); }

  // Update connection status
  function updateStatus(status, message) {
    statusIndicator.className = `status-${status}`;
    statusIndicator.innerHTML = message;
  }

  // Initialize Firebase and load events
  async function initCalendar() {
    // Try to initialize Firebase (safely)
    let firebaseInitialized = false;
    try {
      if (typeof initFirebase === 'function') {
        firebaseInitialized = initFirebase();
      }
    } catch (error) {
      console.log('Firebase not configured, using local mode:', error.message);
      firebaseInitialized = false;
    }

    if (firebaseInitialized && typeof database !== 'undefined' && database) {
      try {
        isFirebaseReady = true;
        updateStatus('connected', '✅ Live (Collaborative Mode)');
        await loadFirebaseEvents();
        setupFirebaseListeners();
      } catch (error) {
        console.log('Firebase connection failed, falling back to local mode:', error);
        isFirebaseReady = false;
        updateStatus('offline', '📴 Offline (Local Mode)');
        await loadLocalEvents();
      }
    } else {
      // Fallback to local storage
      isFirebaseReady = false;
      updateStatus('offline', '📴 Offline (Local Mode)');
      await loadLocalEvents();
    }

    // Initialize calendar (always happens)
    calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: 'dayGridMonth',
      events: stored,
      eventClick: info => openEventModal(info.event)
    });
    calendar.render();
  }

  // Load events from Firebase
  async function loadFirebaseEvents() {
    return new Promise((resolve) => {
      const eventsRef = database.ref('events');
      eventsRef.once('value', (snapshot) => {
        const data = snapshot.val();
        if (data && Array.isArray(data)) {
          stored = data;
        } else if (data) {
          // Convert object to array if needed
          stored = Object.values(data);
        } else {
          // No data in Firebase, load from local JSON
          loadDefaultEvents().then(events => {
            stored = events;
            if (stored.length > 0) {
              saveToFirebase(); // Push initial data to Firebase
            }
            resolve();
          });
          return;
        }

        // Ensure all events have IDs and end times
        stored.forEach(e => {
          if(!e.id) e.id = generateId();
          if(!e.end) e.end = toDateTimeLocalString(new Date(new Date(e.start).getTime() + 60*60*1000));
        });

        resolve();
      }, (error) => {
        console.error('Error loading from Firebase:', error);
        loadLocalEvents();
        resolve();
      });
    });
  }

  // Load events from localStorage (fallback)
  async function loadLocalEvents() {
    const localStorageEvents = localStorage.getItem('events');
    if (localStorageEvents) {
      stored = JSON.parse(localStorageEvents);
    } else {
      stored = await loadDefaultEvents();
      if (stored.length > 0) {
        saveToLocalStorage();
      }
    }

    stored.forEach(e => {
      if(!e.id) e.id = generateId();
      if(!e.end) e.end = toDateTimeLocalString(new Date(new Date(e.start).getTime() + 60*60*1000));
    });
  }

  // Load default events from JSON file
  async function loadDefaultEvents() {
    try {
      const response = await fetch('events.json', { cache: 'force-cache' });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error loading default events:', error);
      return [];
    }
  }

  // Setup Firebase real-time listeners
  function setupFirebaseListeners() {
    const eventsRef = database.ref('events');

    // Listen for changes from other users
    eventsRef.on('value', (snapshot) => {
      const data = snapshot.val();
      if (data && Array.isArray(data)) {
        stored = data;
      } else if (data) {
        stored = Object.values(data);
      }

      // Update calendar
      if (calendar) {
        calendar.removeAllEvents();
        calendar.addEventSource(stored);
        if (!isCalendarView) renderList();
      }
    });

    // Listen for connection status
    const connectedRef = database.ref('.info/connected');
    connectedRef.on('value', (snapshot) => {
      if (snapshot.val() === true) {
        updateStatus('connected', '✅ Live (Collaborative Mode)');
      } else {
        updateStatus('reconnecting', '🔄 Reconnecting...');
      }
    });
  }

  // Save to Firebase
  function saveToFirebase() {
    if (isFirebaseReady && database) {
      database.ref('events').set(stored)
        .then(() => {
          console.log('✅ Saved to Firebase');
        })
        .catch((error) => {
          console.error('❌ Firebase save error:', error);
          saveToLocalStorage(); // Fallback
        });
    } else {
      saveToLocalStorage();
    }
  }

  // Save to localStorage (fallback)
  function saveToLocalStorage(){
    localStorage.setItem('events', JSON.stringify(stored));
  }

  function renderList() {
    listEl.innerHTML = '';
    stored.sort((a,b)=>new Date(a.start)-new Date(b.start)).forEach(evt=>{
      const div = document.createElement('div');
      div.className='list-event';
      div.textContent = `${new Date(evt.start).toLocaleString()} - ${evt.title}`;
      div.onclick = ()=> openEventModalFromId(evt.id);
      listEl.appendChild(div);
    });
  }

  function openEventModalFromId(id){
    const evt = stored.find(e=>e.id===id);
    if(!evt) return;
    currentEventId = id;
    document.getElementById('eventTitle').value=evt.title;
    document.getElementById('eventStart').value=toDateTimeLocalString(evt.start);
    document.getElementById('eventEnd').value = evt.end ? toDateTimeLocalString(evt.end) : toDateTimeLocalString(new Date(new Date(evt.start).getTime() + 60*60*1000));
    document.getElementById('eventAddress').value=evt.address||'';
    const notes=evt.notes||{};
    document.getElementById('noteReservation').value=notes.reservation||'';
    document.getElementById('noteCost').value=notes.cost||'';
    document.getElementById('noteDirections').value=notes.directions||'';
    document.getElementById('noteLinks').value=notes.links?notes.links.join(','):'';
    const photoPreview = document.getElementById('photoPreview');
    photoPreview.innerHTML='';
    if(notes.photos){
      notes.photos.forEach(p=>{
        const img = document.createElement('img'); img.src=p;
        const removeBtn = document.createElement('button');
        removeBtn.textContent='×';
        removeBtn.className='remove-photo';
        removeBtn.onclick=()=>{ img.remove(); removeBtn.remove(); };
        photoPreview.appendChild(img);
        photoPreview.appendChild(removeBtn);
      });
    }
    let nextHTML='';
    const idx = stored.findIndex(e=>e.id===id);
    if(idx<stored.length-1){
      const nextEvt = stored[idx+1];
      const origin=encodeURIComponent(evt.address||'');
      const dest=encodeURIComponent(nextEvt.address||'');
      nextHTML=`<h3>Next Event: ${nextEvt.title}</h3>
      <a target="_blank" href="https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&travelmode=driving">🚗 Drive</a>
      <a target="_blank" href="https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&travelmode=walking">🚶 Walk</a>
      <a target="_blank" href="https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&travelmode=transit">🚇 Transit</a>`;
    }
    document.getElementById('travelNext').innerHTML=nextHTML;
    document.getElementById('eventModal').style.display='block';
    document.body.style.overflow='hidden';
  }

  function openEventModal(eventObj){ openEventModalFromId(eventObj.id); }

  function setupEventHandlers() {
    document.getElementById('monthViewBtn').onclick=()=>calendar.changeView('dayGridMonth');
    document.getElementById('weekViewBtn').onclick=()=>calendar.changeView('timeGridWeek');
    document.getElementById('dayViewBtn').onclick=()=>calendar.changeView('timeGridDay');

    document.getElementById('toggleViewBtn').onclick=function(){
      isCalendarView=!isCalendarView;
      calendarEl.style.display = isCalendarView ? 'block':'none';
      listEl.style.display = isCalendarView ? 'none':'block';
      if(!isCalendarView) renderList();
    };

    document.getElementById('addEventBtn').onclick=function(){
      currentEventId=null;
      document.getElementById('eventTitle').value='';
      document.getElementById('eventStart').value='';
      document.getElementById('eventEnd').value='';
      document.getElementById('eventAddress').value='';
      document.getElementById('noteReservation').value='';
      document.getElementById('noteCost').value='';
      document.getElementById('noteDirections').value='';
      document.getElementById('noteLinks').value='';
      document.getElementById('photoPreview').innerHTML='';
      document.getElementById('travelNext').innerHTML='';
      document.getElementById('eventModal').style.display='block';
      document.body.style.overflow='hidden';
    };

    document.getElementById('modalClose').onclick=function(){
      document.getElementById('eventModal').style.display='none';
      document.body.style.overflow='auto';
    };

    document.getElementById('notePhotos').onchange=function(e){
      const files=e.target.files;
      const photoPreview = document.getElementById('photoPreview');
      for(let f of files){
        const reader=new FileReader();
        reader.onload=function(ev){
          const img=document.createElement('img'); img.src=ev.target.result;
          const removeBtn = document.createElement('button');
          removeBtn.textContent='×'; removeBtn.className='remove-photo';
          removeBtn.onclick=()=>{ img.remove(); removeBtn.remove(); };
          photoPreview.appendChild(img);
          photoPreview.appendChild(removeBtn);
        };
        reader.readAsDataURL(f);
      }
    };

    document.getElementById('saveEvent').onclick=function(){
      const startDate = new Date(document.getElementById('eventStart').value);
      const endDateInput = document.getElementById('eventEnd').value;
      const endDate = endDateInput ? new Date(endDateInput) : new Date(startDate.getTime() + 60*60*1000);

      const evt={
        id: currentEventId || generateId(),
        title: document.getElementById('eventTitle').value,
        start: toDateTimeLocalString(startDate),
        end: toDateTimeLocalString(endDate),
        address: document.getElementById('eventAddress').value,
        notes:{
          reservation: document.getElementById('noteReservation').value,
          cost: document.getElementById('noteCost').value,
          directions: document.getElementById('noteDirections').value,
          links: document.getElementById('noteLinks').value.split(',').map(s=>s.trim()).filter(s=>s),
          photos: Array.from(document.getElementById('photoPreview').querySelectorAll('img')).map(img=>img.src)
        }
      };

      const idx = stored.findIndex(e=>e.id===evt.id);
      if(idx!==-1){ stored[idx]=evt; } else { stored.push(evt); }

      saveToFirebase();
      if(!isFirebaseReady) {
        // Manual update if Firebase is not active
        calendar.removeAllEvents();
        calendar.addEventSource(stored);
        if(!isCalendarView) renderList();
      }
      document.getElementById('eventModal').style.display='none';
      document.body.style.overflow='auto';
    };

    document.getElementById('deleteEvent').onclick = function() {
      if(currentEventId){
        if(confirm('Delete this event? All collaborators will see this change.')){
          stored = stored.filter(e=>e.id!==currentEventId);
          saveToFirebase();
          if(!isFirebaseReady) {
            // Manual update if Firebase is not active
            calendar.removeAllEvents();
            calendar.addEventSource(stored);
            if(!isCalendarView) renderList();
          }
          document.getElementById('eventModal').style.display='none';
        }
      }
    };

    // Export functionality
    document.getElementById('exportBtn').onclick = function() {
      const dataStr = JSON.stringify(stored, null, 2);
      const dataBlob = new Blob([dataStr], {type: 'application/json'});
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `calendar-events-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    };

    // Import functionality
    document.getElementById('importBtn').onclick = function() {
      document.getElementById('importFile').click();
    };

    document.getElementById('importFile').onchange = function(e) {
      const file = e.target.files[0];
      if(!file) return;

      const reader = new FileReader();
      reader.onload = function(ev) {
        try {
          const importedEvents = JSON.parse(ev.target.result);
          if(!Array.isArray(importedEvents)){
            alert('Invalid file format. Expected an array of events.');
            return;
          }

          if(confirm(`Import ${importedEvents.length} events? This will replace all current events for ALL collaborators!`)){
            stored = importedEvents;
            stored.forEach(e => {
              if(!e.id) e.id = generateId();
              if(!e.end) e.end = toDateTimeLocalString(new Date(new Date(e.start).getTime() + 60*60*1000));
            });
            saveToFirebase();
            if(!isFirebaseReady) {
              calendar.removeAllEvents();
              calendar.addEventSource(stored);
              if(!isCalendarView) renderList();
            }
            alert('Events imported successfully!');
          }
        } catch(err) {
          alert('Error parsing JSON file: ' + err.message);
        }
      };
      reader.readAsText(file);
      e.target.value = '';
    };
  }

  // Start initialization
  initCalendar().then(() => {
    setupEventHandlers();
  });

});

