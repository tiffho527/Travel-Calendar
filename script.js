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
    console.log('🔥 Attempting to load from Firebase...');
    return new Promise((resolve) => {
      const eventsRef = database.ref('events');
      eventsRef.once('value', (snapshot) => {
        const data = snapshot.val();
        console.log('🔥 Firebase data received:', data ? (Array.isArray(data) ? `Array with ${data.length} items` : 'Object') : 'null/empty');

        if (data && Array.isArray(data)) {
          stored = data;
          console.log(`📦 Loaded ${stored.length} events from Firebase (array)`);
        } else if (data) {
          // Convert object to array if needed
          stored = Object.values(data);
          console.log(`📦 Loaded ${stored.length} events from Firebase (converted from object)`);
        } else {
          // No data in Firebase, load from local JSON
          console.log('🔥 Firebase empty, loading default events...');
          loadDefaultEvents().then(events => {
            stored = events;
            console.log(`📦 Loaded ${stored.length} events from loadDefaultEvents`);
            if (stored.length > 0) {
              console.log('🔥 Pushing to Firebase...');
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
    console.log('📍 Checking localStorage:', localStorageEvents ? `Found ${JSON.parse(localStorageEvents).length} events` : 'Empty');

    if (localStorageEvents) {
      stored = JSON.parse(localStorageEvents);
      console.log(`📦 Loaded ${stored.length} events from localStorage`);
    } else {
      console.log('📍 localStorage empty, loading default events...');
      stored = await loadDefaultEvents();
      console.log(`📦 After loadDefaultEvents: ${stored.length} events`);
      if (stored.length > 0) {
        saveToLocalStorage();
        console.log(`💾 Saved ${stored.length} events to localStorage`);
      }
    }

    stored.forEach(e => {
      if(!e.id) e.id = generateId();
      if(!e.end) e.end = toDateTimeLocalString(new Date(new Date(e.start).getTime() + 60*60*1000));
    });

    console.log(`✅ Final stored array has ${stored.length} events`);
  }

  // Load default events from JSON file
  async function loadDefaultEvents() {
    try {
      const response = await fetch('events.json', { cache: 'force-cache' });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const events = await response.json();
      console.log(`✅ Loaded ${events.length} events from events.json`);
      return events;
    } catch (error) {
      console.error('Error loading events.json, using embedded fallback:', error);
      // Fallback: Return embedded events if JSON fetch fails
      return getEmbeddedEvents();
    }
  }

  // Embedded fallback events (in case events.json doesn't load) - ALL 31 EVENTS
  function getEmbeddedEvents() {
    console.log('📦 Using embedded fallback with all 31 events');
    return [
      {title:"Arrival in Tokyo",start:"2026-01-26T15:20:00",end:"2026-01-26T17:15:00",address:"Narita Airport, Tokyo",notes:{reservation:"Flight lands at 3:20 PM",cost:"",directions:"Exit terminal, customs ~4:45-5:00 PM",links:["https://www.narita-airport.jp/en"],photos:[]}},
      {title:"Narita Express to Shinjuku",start:"2026-01-26T17:15:00",end:"2026-01-26T18:50:00",address:"Narita Express train",notes:{reservation:"",cost:"~3000 JPY",directions:"80 min ride to Shinjuku",links:[],photos:[]}},
      {title:"Check-in Hilton Tokyo",start:"2026-01-26T18:50:00",address:"Hilton Tokyo, Shinjuku",notes:{reservation:"Check-in",cost:"",directions:"5 min walk from Shinjuku Station",links:["https://www.hilton.com/en/hotels/tyohitw-hilton-tokyo/"],photos:[]}},
      {title:"Evening: Ginza Shopping",start:"2026-01-26T20:00:00",address:"Ginza, Tokyo",notes:{reservation:"",cost:"",directions:"Explore department stores or casual dining",links:[],photos:[]}},
      {title:"Drop off custom embroidery @ Uniqlo Asakusa",start:"2026-01-27T10:00:00",end:"2026-01-27T12:00:00",address:"Uniqlo Asakusa, Tokyo",notes:{reservation:"",cost:"",directions:"",links:["https://www.uniqlo.com/jp/store/asakusa"],photos:[]}},
      {title:"Lunch @ Waunn.Tokyo",start:"2026-01-27T12:00:00",end:"2026-01-27T14:00:00",address:"Waunn.Tokyo",notes:{reservation:"Confirmed",cost:"",directions:"",links:[],photos:[]}},
      {title:"Harry Café – Various Animals",start:"2026-01-27T14:00:00",end:"2026-01-27T15:30:00",address:"〒111-0032 Tokyo, Taito City, Asakusa, 1-chōme-1-17 増田ビル 5F",notes:{reservation:"Check availability Dec 27",cost:"",directions:"5 min walk from Waunn",links:["https://harinezumi-cafe.com/en/store/asakusa/"],photos:[]}},
      {title:"Kiwa Seisakujo Asakusabashi (craft supplies)",start:"2026-01-27T15:30:00",end:"2026-01-27T16:30:00",address:"〒111-0053 Tokyo, Taito City, Asakusabashi, 2-chōme−1−2",notes:{reservation:"",cost:"",directions:"15 min train from Asakusa",links:[],photos:[]}},
      {title:"Dinner @ Zauo Shinjuku",start:"2026-01-27T19:30:00",address:"3-2-9 Nishishinjuku, Shinjuku City, Tokyo 160-0023",notes:{reservation:"Confirmed",cost:"",directions:"10 min walk from Hilton Tokyo",links:["https://www.zauo.co.jp/en/shop/shinjuku/","https://www.tablecheck.com/en/shops/zauo-shinjuku/reserve"],photos:[]}},
      {title:"Breakfast @ Shinpachi Shokudo",start:"2026-01-28T08:30:00",end:"2026-01-28T09:30:00",address:"Shinjuku, Tokyo",notes:{reservation:"",cost:"",directions:"5-7 min walk from Hilton Tokyo",links:[],photos:[]}},
      {title:"Tokyo Metropolitan Government Building Observatory",start:"2026-01-28T09:30:00",end:"2026-01-28T12:00:00",address:"Shinjuku, Tokyo",notes:{reservation:"Free entry",cost:"",directions:"15 min walk",links:[],photos:[]}},
      {title:"CAPPINESS Capybara Café",start:"2026-01-28T12:00:00",end:"2026-01-28T17:00:00",address:"Harajuku, Tokyo",notes:{reservation:"Available 14 days in advance",cost:"",directions:"30 min via JR Yamanote Line from Shinjuku",links:["https://www.tablecheck.com/en/shops/cappiness/reserve"],photos:[]}},
      {title:"Hotel Change to ANA InterContinental Tokyo",start:"2026-01-28T17:00:00",end:"2026-01-28T18:00:00",address:"Roppongi, Tokyo",notes:{reservation:"Late checkout Hilton",cost:"",directions:"25 min taxi / 35 min train",links:["https://www.anaintercontinental-tokyo.com/"],photos:[]}},
      {title:"Kinokurashi Ginza Chopstick Making Class",start:"2026-01-28T18:00:00",address:"Kinokurashi Ginza",notes:{reservation:"Confirmed",cost:"",directions:"15–25 min from hotel",links:[],photos:[]}},
      {title:"Depart Hotel → Snoopy Museum",start:"2026-01-29T08:20:00",end:"2026-01-29T10:00:00",address:"ANA InterContinental Tokyo",notes:{reservation:"",cost:"",directions:"Train to Snoopy Museum ~1h 20min",links:["https://snoopymuseum.tokyo/s/smt/?ima=0000"],photos:[]}},
      {title:"Peanuts Café / Snoopy Museum",start:"2026-01-29T10:00:00",end:"2026-01-29T12:45:00",address:"Snoopy Museum Tokyo",notes:{reservation:"",cost:"",directions:"Museum hours 10:00–18:00, last entry 17:30",links:[],photos:[]}},
      {title:"Shin-Yokohama Ramen Museum",start:"2026-01-29T12:45:00",address:"Shin-Yokohama",notes:{reservation:"Meet with MC",cost:"450 yen admission",directions:"~40 min travel from museum",links:["https://www.raumen.co.jp/","https://www.raumen.co.jp/makingnoodle_en.html","https://www.asoview.com/channel/activities/ja/takigami-raumen/offices/2268/courses?language_type=en"],photos:[]}},
      {title:"Dinner @ Ginza Happo",start:"2026-01-30T19:00:00",address:"Ginza, Tokyo",notes:{reservation:"Confirmed",cost:"",directions:"",links:["https://ginzahappo.owst.jp"],photos:[]}},
      {title:"Lunch @ Gyukatsu Motomura Shinjuku Minamiguchi",start:"2026-01-31T11:00:00",end:"2026-01-31T13:00:00",address:"3-32-6 Shinjuku, Tokyo",notes:{reservation:"Book after Dec 29",cost:"",directions:"",links:["https://www.tablecheck.com/en/shops/gyukatsu-motomura-shinjuku-minamiguchi/reserve"],photos:[]}},
      {title:"Kuu Head Spa",start:"2026-01-31T13:00:00",end:"2026-01-31T16:00:00",address:"Omotesandō, Tokyo",notes:{reservation:"TBD",cost:"",directions:"JR Yamanote to Shibuya + Ginza Line to Omotesando",links:[],photos:[]}},
      {title:"Raymond Lam Concert",start:"2026-02-01T15:00:00",address:"Tokyo Garden Theater, Ariake",notes:{reservation:"Confirmed tickets received",cost:"",directions:"Arrive 1h early for photos, merch, snacks",links:[],photos:[]}},
      {title:"Fly Tokyo → Sapporo",start:"2026-02-02T12:50:00",end:"2026-02-02T15:30:00",address:"HND → CTS",notes:{reservation:"Flight",cost:"",directions:"Depart ANA InterContinental Tokyo 10:40 AM",links:[],photos:[]}},
      {title:"Arrive Sapporo / Check-in Fairfield Marriott",start:"2026-02-02T15:30:00",address:"Fairfield Marriott Sapporo",notes:{reservation:"",cost:"",directions:"Rapid Airport Express to Sapporo Station, walk/taxi 5–10 min",links:["https://www.marriott.com/en-us/hotels/cepfs-fairfield-marriott-sapporo/overview/"],photos:[]}},
      {title:"Explore Sapporo",start:"2026-02-03T09:00:00",address:"Sapporo",notes:{reservation:"",cost:"",directions:"",links:[],photos:[]}},
      {title:"Explore Sapporo / Meet with MC",start:"2026-02-04T14:00:00",address:"Sapporo",notes:{reservation:"",cost:"",directions:"",links:[],photos:[]}},
      {title:"Royce' Chocolate World",start:"2026-02-05T10:00:00",address:"2-2-2 Kita 7 Jonishi, Chitose, Hokkaido 066-0061",notes:{reservation:"DIY chocolate tickets",cost:"",directions:"Train 1h10 from Sapporo, taxi/walk from station",links:["https://www.e-tix.jp/royce-cct/en/"],photos:[]}},
      {title:"Explore Sapporo / Bentley returns",start:"2026-02-06T09:00:00",address:"Sapporo",notes:{reservation:"",cost:"",directions:"MC flight 2pm",links:[],photos:[]}},
      {title:"Explore Sapporo",start:"2026-02-07T09:00:00",address:"Sapporo",notes:{reservation:"",cost:"",directions:"",links:[],photos:[]}},
      {title:"Explore Sapporo",start:"2026-02-08T09:00:00",address:"Sapporo",notes:{reservation:"",cost:"",directions:"",links:[],photos:[]}},
      {title:"Fly Sapporo → Tokyo",start:"2026-02-09T10:00:00",address:"CTS → HND",notes:{reservation:"Flight",cost:"",directions:"Leave Sapporo hotel early",links:[],photos:[]}},
      {title:"Fly Home",start:"2026-02-10T10:00:00",address:"HND",notes:{reservation:"Flight",cost:"",directions:"",links:[],photos:[]}}
    ];
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

    // Reset to all 31 events
    document.getElementById('resetEventsBtn').onclick = function() {
      if(confirm('Reset to all 31 default events? This will replace current events for ALL collaborators!')){
        console.log('🔄 Resetting to all 31 embedded events...');
        stored = getEmbeddedEvents();
        stored.forEach(e => {
          if(!e.id) e.id = generateId();
          if(!e.end) e.end = toDateTimeLocalString(new Date(new Date(e.start).getTime() + 60*60*1000));
        });
        console.log(`✅ Reset to ${stored.length} events`);
        saveToFirebase();
        calendar.removeAllEvents();
        calendar.addEventSource(stored);
        if(!isCalendarView) renderList();
        alert(`Successfully reset to ${stored.length} events!`);
      }
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

