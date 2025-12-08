<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Trip Calendar</title>

<!-- FullCalendar CSS -->
<link href="https://cdn.jsdelivr.net/npm/fullcalendar@6.1.8/index.global.min.css" rel="stylesheet">

<style>
  body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
  header { margin-bottom: 10px; }
  button { padding:6px 12px; margin:2px; cursor:pointer; }
  #calendar, #listView { max-width: 900px; margin: 0 auto; }
  #listView { display:none; padding:10px; }
  .list-event { border:1px solid #ccc; padding:8px; margin-bottom:5px; cursor:pointer; }
  /* Modal */
  #eventModal { display:none; position:fixed; top:10%; left:50%; transform:translateX(-50%); 
    background:#fff; padding:20px; border:1px solid #000; width:400px; z-index:9999; max-height:80%; overflow:auto; }
  #eventModal input, #eventModal textarea { width:100%; margin-bottom:10px; padding:5px; }
  #photoPreview img { max-width:80px; margin:5px; }
  #travelNext a { margin-right:5px; display:inline-block; }
  #closeModal { float:right; cursor:pointer; color:red; font-weight:bold; }
</style>
</head>
<body>

<header>
  <button id="monthViewBtn">Month</button>
  <button id="weekViewBtn">Week</button>
  <button id="dayViewBtn">Day</button>
  <button id="toggleViewBtn">Toggle Calendar/List</button>
  <button id="addEventBtn">Add Event</button>
</header>

<div id="calendar"></div>
<div id="listView"></div>

<!-- Event Modal -->
<div id="eventModal">
  <span id="closeModal">✖</span>
  <h2>Edit Event</h2>
  <input type="text" id="eventTitle" placeholder="Title">
  <input type="text" id="eventStart" placeholder="Start Time (MM-DD-YYYY HH:MM AM/PM)">
  <input type="text" id="eventEnd" placeholder="End Time (MM-DD-YYYY HH:MM AM/PM)">
  <input type="text" id="eventAddress" placeholder="Address">
  <h3>Notes</h3>
  <input type="text" id="noteReservation" placeholder="Reservation">
  <input type="text" id="noteCost" placeholder="Cost">
  <input type="text" id="noteDirections" placeholder="Directions">
  <input type="text" id="noteBring" placeholder="To Bring">
  <input type="text" id="noteLinks" placeholder="Links, comma separated">
  <input type="file" id="notePhotos" multiple>
  <div id="photoPreview"></div>
  <div id="travelNext"></div>
  <button id="saveEvent">Save Event</button>
  <button id="deleteEvent" style="background:red;color:white;">Delete Event</button>
</div>

<!-- FullCalendar JS -->
<script src="https://cdn.jsdelivr.net/npm/fullcalendar@6.1.8/index.global.min.js"></script>

<script>
document.addEventListener('DOMContentLoaded', function() {
  const calendarEl = document.getElementById('calendar');
  const listEl = document.getElementById('listView');
  let calendar, currentEventIndex = null;
  let isCalendarView = true;

  // Load stored events or empty
  let stored = JSON.parse(localStorage.getItem('events')) || [];

  function formatEventDate(date){
    const d = new Date(date);
    let mm = String(d.getMonth()+1).padStart(2,'0');
    let dd = String(d.getDate()).padStart(2,'0');
    let yyyy = d.getFullYear();
    let hours = d.getHours();
    let minutes = String(d.getMinutes()).padStart(2,'0');
    let ampm = hours >=12 ? 'PM':'AM';
    hours = hours%12; hours = hours?hours:12;
    return `${mm}-${dd}-${yyyy} ${hours}:${minutes} ${ampm}`;
  }

  function parseDateInput(input){
    if(!input) return null;
    let [datePart,timePart,ampm]=input.split(' ');
    if(!ampm) ampm='AM';
    let [month,day,year]=datePart.split('-').map(Number);
    let [hours12,minutes]=timePart.split(':').map(Number);
    let hours = hours12;
    if(ampm==='PM' && hours<12) hours+=12;
    if(ampm==='AM' && hours===12) hours=0;
    return new Date(year,month-1,day,hours,minutes).toISOString();
  }

  function renderCalendar(){
    calendarEl.innerHTML='';
    calendar = new FullCalendar.Calendar(calendarEl,{
      initialView:'dayGridMonth',
      nowIndicator:true,
      slotMinTime:"06:00:00",
      slotMaxTime:"22:00:00",
      allDaySlot:false,
      eventDisplay:'block',
      events: stored,
      eventClick: info=>openEventModal(info.event),
    });
    calendar.render();
  }

  renderCalendar();

  function renderList(){
    listEl.innerHTML='';
    stored.sort((a,b)=>new Date(a.start)-new Date(b.start))
      .forEach((evt,i)=>{
        const div = document.createElement('div');
        div.className='list-event';
        div.textContent = `${formatEventDate(evt.start)} - ${evt.title}`;
        div.onclick=()=>{ currentEventIndex=i; openEventModalFromList(i); };
        listEl.appendChild(div);
      });
  }

  function openEventModalFromList(i){
    const evt = stored[i];
    currentEventIndex=i;

    document.getElementById('eventTitle').value = evt.title;
    document.getElementById('eventStart').value = formatEventDate(evt.start);
    document.getElementById('eventEnd').value = evt.end ? formatEventDate(evt.end) : '';
    document.getElementById('eventAddress').value = evt.address || '';
    const notes = evt.notes||{};
    document.getElementById('noteReservation').value=notes.reservation||'';
    document.getElementById('noteCost').value=notes.cost||'';
    document.getElementById('noteDirections').value=notes.directions||'';
    document.getElementById('noteBring').value=notes.toBring||'';
    document.getElementById('noteLinks').value=notes.links?notes.links.join(','):'';

    const preview = document.getElementById('photoPreview');
    preview.innerHTML='';
    if(notes.photos){
      notes.photos.forEach(src=>{ const img=document.createElement('img'); img.src=src; preview.appendChild(img); });
    }

    // Next event travel links
    let nextHTML='';
    if(currentEventIndex<stored.length-1){
      const nextEvt = stored[currentEventIndex+1];
      const origin=encodeURIComponent(evt.address||'');
      const dest=encodeURIComponent(nextEvt.address||'');
      nextHTML=`
        <h3>Next Event: ${nextEvt.title}</h3>
        <a target="_blank" href="https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&travelmode=driving">🚗 Drive</a>
        <a target="_blank" href="https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&travelmode=walking">🚶 Walk</a>
        <a target="_blank" href="https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&travelmode=transit">🚇 Transit</a>
      `;
    }
    document.getElementById('travelNext').innerHTML = nextHTML;
    document.getElementById('eventModal').style.display='block';
  }

  function openEventModal(eventObj){
    currentEventIndex=stored.findIndex(e=>e.title===eventObj.title && e.start===eventObj.start);
    openEventModalFromList(currentEventIndex);
  }

  // View buttons
  document.getElementById('monthViewBtn').onclick=()=>calendar.changeView('dayGridMonth');
  document.getElementById('weekViewBtn').onclick=()=>calendar.changeView('timeGridWeek');
  document.getElementById('dayViewBtn').onclick=()=>calendar.changeView('timeGridDay');

  document.getElementById('toggleViewBtn').onclick=()=>{
    isCalendarView=!isCalendarView;
    calendarEl.style.display=isCalendarView?'block':'none';
    listEl.style.display=isCalendarView?'none':'block';
    if(!isCalendarView) renderList();
  };

  document.getElementById('addEventBtn').onclick=()=>{
    currentEventIndex=null;
    document.querySelectorAll('#eventModal input, #eventModal textarea').forEach(el=>el.value='');
    document.getElementById('photoPreview').innerHTML='';
    document.getElementById('travelNext').innerHTML='';
    document.getElementById('eventModal').style.display='block';
  };

  document.getElementById('closeModal').onclick=()=>{ document.getElementById('eventModal').style.display='none'; };

  document.getElementById('notePhotos').onchange = e=>{
    const preview=document.getElementById('photoPreview');
    for(const file of e.target.files){
      const reader=new FileReader();
      reader.onload=ev=>{
        const img=document.createElement('img'); img.src=ev.target.result; preview.appendChild(img);
      };
      reader.readAsDataURL(file);
    }
  };

  document.getElementById('saveEvent').onclick=()=>{
    const evt={
      title: document.getElementById('eventTitle').value,
      start: parseDateInput(document.getElementById('eventStart').value),
      end: parseDateInput(document.getElementById('eventEnd').value),
      address: document.getElementById('eventAddress').value,
      notes:{
        reservation: document.getElementById('noteReservation').value,
        cost: document.getElementById('noteCost').value,
        directions: document.getElementById('noteDirections').value,
        toBring: document.getElementById('noteBring').value,
        links: document.getElementById('noteLinks').value.split(',').map(s=>s.trim()).filter(Boolean),
        photos: Array.from(document.querySelectorAll('#photoPreview img')).map(img=>img.src)
      }
    };
    if(currentEventIndex!==null) stored[currentEventIndex]=evt; else stored.push(evt);
    localStorage.setItem('events',JSON.stringify(stored));
    calendar.removeAllEvents();
    calendar.addEventSource(stored);
    if(!isCalendarView) renderList();
    document.getElementById('eventModal').style.display='none';
  };

  document.getElementById('deleteEvent').onclick=()=>{
    if(currentEventIndex!==null){
      if(confirm('Delete this event?')){
        stored.splice(currentEventIndex,1);
        localStorage.setItem('events',JSON.stringify(stored));
        calendar.removeAllEvents();
        calendar.addEventSource(stored);
        if(!isCalendarView) renderList();
        document.getElementById('eventModal').style.display='none';
      }
    }
  };
});
</script>

</body>
</html>
