document.addEventListener('DOMContentLoaded', function() {
  const calendarEl = document.getElementById('calendar');
  const listEl = document.getElementById('listView');
  let isCalendarView = true;
  let currentEventId = null;

  function toDateTimeLocalString(dateStr){
    const d = new Date(dateStr);
    if(isNaN(d)) return '';
    const pad = n => String(n).padStart(2,'0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  function generateId() { return 'evt-' + Math.random().toString(36).substr(2, 9); }

  let stored = [];
  let calendar;

  // Load default events from external JSON file
  async function loadDefaultEvents() {
    try {
      const response = await fetch('events.json', {
        cache: 'force-cache' // Use browser cache for faster loading
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error loading default events:', error);
      return [];
    }
  }

  function saveToStorage(){
    localStorage.setItem('events', JSON.stringify(stored));
  }

  // Initialize the calendar
  async function initCalendar() {
    // Try to load from localStorage first, otherwise load from events.json
    const localStorageEvents = localStorage.getItem('events');
    if (localStorageEvents) {
      stored = JSON.parse(localStorageEvents);
    } else {
      stored = await loadDefaultEvents();
    }

    // Ensure all events have IDs and end times
    stored.forEach(e => {
      if(!e.id) e.id = generateId();
      if(!e.end) e.end = toDateTimeLocalString(new Date(new Date(e.start).getTime() + 60*60*1000));
    });

    // Save to localStorage if we loaded from JSON
    if (!localStorageEvents && stored.length > 0) {
      saveToStorage();
    }

    calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: 'dayGridMonth',
      events: stored,
      eventClick: info => openEventModal(info.event)
    });
    calendar.render();
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

    saveToStorage();
    calendar.removeAllEvents();
    calendar.addEventSource(stored);
    if(!isCalendarView) renderList();
    document.getElementById('eventModal').style.display='none';
    document.body.style.overflow='auto';
  };

  document.getElementById('deleteEvent').onclick = function() {
    if(currentEventId){
      stored = stored.filter(e=>e.id!==currentEventId);
      saveToStorage();
      calendar.removeAllEvents();
      calendar.addEventSource(stored);
      if(!isCalendarView) renderList();
      document.getElementById('eventModal').style.display='none';
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

        if(confirm(`Import ${importedEvents.length} events? This will replace all current events.`)){
          stored = importedEvents;
          // Ensure all events have IDs
          stored.forEach(e => {
            if(!e.id) e.id = generateId();
            if(!e.end) e.end = toDateTimeLocalString(new Date(new Date(e.start).getTime() + 60*60*1000));
          });
          saveToStorage();
          calendar.removeAllEvents();
          calendar.addEventSource(stored);
          if(!isCalendarView) renderList();
          alert('Events imported successfully!');
        }
      } catch(err) {
        alert('Error parsing JSON file: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset file input
  };
  }

  // Start initialization and setup handlers after calendar is ready
  initCalendar().then(() => {
    setupEventHandlers();
  });

});
