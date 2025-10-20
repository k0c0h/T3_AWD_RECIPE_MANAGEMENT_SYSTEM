// Initial events data
const initialEvents = [
    {
        id: 1,
        title: "Wedding Catering - Johnson",
        type: "quotation",
        date: "2025-10-15",
        time: "14:00",
        description: "Wedding catering for 150 guests. Menu: appetizers, main course, desserts",
        client: "Sarah Johnson",
        priority: "high",
        notification: true,
        reminderTime: 1440
    },
    {
        id: 2,
        title: "Cake Delivery - Downtown",
        type: "delivery",
        date: "2025-10-03",
        time: "10:00",
        description: "3-tier wedding cake delivery to downtown venue",
        client: "Mike & Emma",
        priority: "high",
        notification: true,
        reminderTime: 60
    },
    {
        id: 3,
        title: "Client Meeting - Corporate Event",
        type: "meeting",
        date: "2025-12-05",
        time: "15:30",
        description: "Discuss corporate event catering for 200 people",
        client: "ABC Corporation",
        priority: "medium",
        notification: true,
        reminderTime: 30
    },
];

// Application state
let events = [...initialEvents];
let currentEvent = null;
let currentDate = new Date();
let selectedDate = null;

// DOM Elements
const calendarDays = document.getElementById('calendarDays');
const currentMonthDisplay = document.getElementById('currentMonth');
const upcomingEventsList = document.getElementById('upcomingEventsList');
const eventModal = document.getElementById('eventModal');
const detailModal = document.getElementById('detailModal');
const eventForm = document.getElementById('eventForm');

// Event Listeners
document.getElementById('btnNewEvent').addEventListener('click', () => openEventModal());
document.getElementById('btnToday').addEventListener('click', goToToday);
document.getElementById('btnPrevMonth').addEventListener('click', () => changeMonth(-1));
document.getElementById('btnNextMonth').addEventListener('click', () => changeMonth(1));
document.getElementById('btnCloseModal').addEventListener('click', closeEventModal);
document.getElementById('btnCloseDetail').addEventListener('click', closeDetailModal);
document.getElementById('btnCancel').addEventListener('click', closeEventModal);
document.getElementById('eventNotification').addEventListener('change', toggleReminderGroup);
document.getElementById('btnEditFromDetail').addEventListener('click', editFromDetail);
document.getElementById('btnDeleteFromDetail').addEventListener('click', deleteFromDetail);
eventForm.addEventListener('submit', saveEvent);

// Main functions
function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Update month display
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
    currentMonthDisplay.textContent = `${monthNames[month]} ${year}`;
    
    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    
    calendarDays.innerHTML = '';
    
    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
        const dayCell = createDayCell(daysInPrevMonth - i, true);
        calendarDays.appendChild(dayCell);
    }
    
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
        const dayCell = createDayCell(day, false);
        calendarDays.appendChild(dayCell);
    }
    
    // Next month days
    const remainingCells = 42 - (firstDay + daysInMonth);
    for (let day = 1; day <= remainingCells; day++) {
        const dayCell = createDayCell(day, true);
        calendarDays.appendChild(dayCell);
    }
    
    lucide.createIcons();
}

function createDayCell(day, isOtherMonth) {
    const cell = document.createElement('div');
    cell.className = 'day-cell';
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const cellDate = new Date(year, month, day);
    
    if (isOtherMonth) {
        cell.classList.add('other-month');
    }
    
    // Check if today
    const today = new Date();
    if (!isOtherMonth && 
        day === today.getDate() && 
        month === today.getMonth() && 
        year === today.getFullYear()) {
        cell.classList.add('today');
    }
    
    // Get events for this day
    const dateString = formatDate(cellDate);
    const dayEvents = events.filter(e => e.date === dateString);
    
    if (dayEvents.length > 0) {
        cell.classList.add('has-events');
    }
    
    const dayNumber = document.createElement('div');
    dayNumber.className = 'day-number';
    dayNumber.textContent = day;
    cell.appendChild(dayNumber);
    
    const eventsContainer = document.createElement('div');
    eventsContainer.className = 'day-events';
    
    dayEvents.forEach(event => {
        const eventDot = document.createElement('div');
        eventDot.className = `event-dot ${event.type}`;
        eventDot.title = event.title;
        eventDot.addEventListener('click', (e) => {
            e.stopPropagation();
            viewEvent(event.id);
        });
        eventsContainer.appendChild(eventDot);
    });
    
    cell.appendChild(eventsContainer);
    
    cell.addEventListener('click', () => {
        selectedDate = dateString;
        openEventModal();
    });
    
    return cell;
}

function renderUpcomingEvents() {
    const today = new Date();
    const upcoming = events
        .filter(e => new Date(e.date) >= today)
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 10);
    
    if (upcoming.length === 0) {
        upcomingEventsList.innerHTML = '<p style="color: #666; text-align: center; padding: 20px;">No upcoming events</p>';
        return;
    }
    
    upcomingEventsList.innerHTML = upcoming.map(event => {
        const eventDate = new Date(event.date);
        const daysUntil = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));
        
        return `
            <div class="event-card ${event.type}" onclick="viewEvent(${event.id})">
                <div class="event-card-header">
                    <div class="event-card-title">${event.title}</div>
                    ${event.priority ? `<span class="priority-badge ${event.priority}">${event.priority}</span>` : ''}
                </div>
                <div class="event-card-date">${formatDateDisplay(event.date)} ${daysUntil === 0 ? '(Today)' : daysUntil === 1 ? '(Tomorrow)' : `(in ${daysUntil} days)`}</div>
                ${event.time ? `<div class="event-card-time"><i data-lucide="clock"></i> ${event.time}</div>` : ''}
                ${event.client ? `<div class="event-card-time"><i data-lucide="user"></i> ${event.client}</div>` : ''}
                <span class="event-card-type ${event.type}">${event.type}</span>
            </div>
        `;
    }).join('');
    
    lucide.createIcons();
}

function openEventModal(event = null) {
    currentEvent = event;
    const modalTitle = document.getElementById('modalTitle');
    
    if (event) {
        modalTitle.textContent = 'Edit Event';
        document.getElementById('eventTitle').value = event.title;
        document.getElementById('eventType').value = event.type;
        document.getElementById('eventDate').value = event.date;
        document.getElementById('eventTime').value = event.time || '';
        document.getElementById('eventPriority').value = event.priority;
        document.getElementById('eventDescription').value = event.description || '';
        document.getElementById('eventClient').value = event.client || '';
        document.getElementById('eventNotification').checked = event.notification;
        document.getElementById('reminderTime').value = event.reminderTime || 30;
        toggleReminderGroup();
    } else {
        modalTitle.textContent = 'New Event';
        eventForm.reset();
        if (selectedDate) {
            document.getElementById('eventDate').value = selectedDate;
        }
        document.getElementById('reminderGroup').style.display = 'none';
    }
    
    eventModal.classList.add('active');
    lucide.createIcons();
}

function closeEventModal() {
    eventModal.classList.remove('active');
    currentEvent = null;
    selectedDate = null;
}

function toggleReminderGroup() {
    const checked = document.getElementById('eventNotification').checked;
    document.getElementById('reminderGroup').style.display = checked ? 'block' : 'none';
}

function saveEvent(e) {
    e.preventDefault();
    
    const eventData = {
        id: currentEvent?.id || Date.now(),
        title: document.getElementById('eventTitle').value,
        type: document.getElementById('eventType').value,
        date: document.getElementById('eventDate').value,
        time: document.getElementById('eventTime').value,
        priority: document.getElementById('eventPriority').value,
        description: document.getElementById('eventDescription').value,
        client: document.getElementById('eventClient').value,
        notification: document.getElementById('eventNotification').checked,
        reminderTime: parseInt(document.getElementById('reminderTime').value)
    };
    
    if (currentEvent) {
        const index = events.findIndex(e => e.id === currentEvent.id);
        events[index] = eventData;
    } else {
        events.push(eventData);
    }
    
    closeEventModal();
    renderCalendar();
    renderUpcomingEvents();
}

function viewEvent(id) {
    const event = events.find(e => e.id === id);
    if (!event) return;
    
    document.getElementById('detailEventTitle').textContent = event.title;
    document.getElementById('eventDetail').innerHTML = `
        <div class="detail-row">
            <div class="detail-label">Type</div>
            <div class="detail-value">
                <span class="event-card-type ${event.type}">${event.type}</span>
            </div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Date & Time</div>
            <div class="detail-value">${formatDateDisplay(event.date)} ${event.time ? `at ${event.time}` : ''}</div>
        </div>
        ${event.client ? `
            <div class="detail-row">
                <div class="detail-label">Client/Contact</div>
                <div class="detail-value">${event.client}</div>
            </div>
        ` : ''}
        <div class="detail-row">
            <div class="detail-label">Priority</div>
            <div class="detail-value">
                <span class="priority-badge ${event.priority}">${event.priority}</span>
            </div>
        </div>
        ${event.description ? `
            <div class="detail-row">
                <div class="detail-label">Description</div>
                <div class="detail-value">${event.description}</div>
            </div>
        ` : ''}
        <div class="detail-row">
            <div class="detail-label">Notification</div>
            <div class="detail-value">${event.notification ? `Enabled - ${event.reminderTime} minutes before` : 'Disabled'}</div>
        </div>
    `;
    
    currentEvent = event;
    detailModal.classList.add('active');
    lucide.createIcons();
}

function closeDetailModal() {
    detailModal.classList.remove('active');
    currentEvent = null;
}

function editFromDetail() {
    closeDetailModal();
    openEventModal(currentEvent);
}

function deleteFromDetail() {
    if (confirm('Are you sure you want to delete this event?')) {
        events = events.filter(e => e.id !== currentEvent.id);
        closeDetailModal();
        renderCalendar();
        renderUpcomingEvents();
    }
}

function changeMonth(direction) {
    currentDate.setMonth(currentDate.getMonth() + direction);
    renderCalendar();
}

function goToToday() {
    currentDate = new Date();
    renderCalendar();
}

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function formatDateDisplay(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Initialize
renderCalendar();
renderUpcomingEvents();
lucide.createIcons();
