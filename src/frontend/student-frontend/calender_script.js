/**
 * calender_script.js
 * Manages the Student Calendar view using the FullCalendar library.
 * * ARCHITECTURE DECISION:
 * We selected FullCalendar because it handles complex date mathematics, 
 * recurring events, and responsive view switching (Month/Week/Day) natively.
 * This allows us to focus on data integration rather than building a calendar UI from scratch.
 */

const dot=document.getElementById('dot');
const menu=document.getElementById('menu');
dot.onclick=()=>{
  const isOpen=menu.classList.toggle('open');
  dot.innerHTML=isOpen?'&#8211;':'&#8801;';}
  //minus and menu symbols

// Helper function to read cookies (same as in profilePage.js)
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

// Cache for calendar events to avoid excessive API calls
const eventCache = {
  data: null,
  timestamp: null,
  TTL: 5 * 60 * 1000 // 5 minutes cache duration
};

function isCacheValid() {
  return eventCache.data !== null && 
         eventCache.timestamp !== null && 
         (Date.now() - eventCache.timestamp) < eventCache.TTL;
}

function getCachedEvents() {
  if (isCacheValid()) {
    console.debug('Using cached events');
    return eventCache.data;
  }
  return null;
}

function setCachedEvents(data) {
  eventCache.data = data;
  eventCache.timestamp = Date.now();
  console.debug('Events cached, TTL:', eventCache.TTL);
}

/**
 * Formats a date object into the specific string format required by iCalendar files.
 * * Why: RFC 5545 Compliance.
 * The iCalendar standard requires dates in UTC 'YYYYMMDDTHHMMSSZ' format.
 * JavaScript's default date.toISOString() is close but includes hyphens and colons 
 * which must be stripped to be compatible with Outlook, Apple Calendar, and Google Calendar.
 */
function formatIcsDate(date) {
    if (!date) return '';
    // Adjust for local timezone offset before formatting to UTC.
    const d = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
    
    // YYYYMMDDTHHMMSSZ format
    return d.toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z';
}

/**
 * Generates the raw text content for an .ics calendar file.
 * for what: Client-Side Generation.
 * We generate this text on the client side rather than the server to reduce backend load.
 * Since the browser already possesses all the necessary event details (title, date, location),
 * constructing the file string in JavaScript is instant, offline-capable, and saves an API call.
 */
function generateIcsContent(event) {
    const startDate = formatIcsDate(event.start);
    // Ensure end date exists, otherwise use start date
    const endDate = formatIcsDate(event.end || event.start); 
    const location = event.extendedProps.location || "Campus Location";
    // Using the event title for the description
    const description = event.title; 

    // Generate a unique ID for the event
    const uid = Date.now().toString(36) + Math.random().toString(36).substr(2, 5) + '@campusevents.ca';

    let content = `BEGIN:VCALENDAR\n`;
    content += `VERSION:2.0\n`;
    content += `PRODID:-//Campus Events App//NONSGML v1.0//EN\n`;
    content += `BEGIN:VEVENT\n`;
    content += `UID:${uid}\n`;
    content += `DTSTAMP:${formatIcsDate(new Date())}\n`;
    content += `DTSTART:${startDate}\n`;
    content += `DTEND:${endDate}\n`;
    content += `SUMMARY:${event.title}\n`;
    content += `LOCATION:${location}\n`;
    content += `DESCRIPTION:${description}\n`;
    content += `END:VEVENT\n`;
    content += `END:VCALENDAR`;

    return content;
}

/**
 * Triggers the browser to download the generated .ics file.
 * For what: In-Memory Blob.
 * We use a Blob object to create a virtual file in the browser's memory.
 * This allows us to trigger a native download prompt without creating a temporary
 * file on the server or navigating the user away from the page.
 */
function downloadIcs(event) {
    const icsContent = generateIcsContent(event);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    
    link.href = URL.createObjectURL(blob);
    // Clean up filename by replacing spaces
    link.download = event.title.replace(/\s/g, '_') + '.ics'; 
    
    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

//Modal Simulation: This replaces the simple alert() and holds the Export button
function showEventDetailsModal(info) {
    // Check if a modal is already open and remove it, just in case
    const existingModal = document.getElementById('event-modal');
    if (existingModal) {
        existingModal.remove();
    }

    const eventData = info.event.extendedProps;

    // Create the HTML for the popup modal
    const modalHtml = `
        <div id="event-modal" class="modal">
            <div class="modal-content">
                <button id="close-modal">&times;</button>
                <h2>${info.event.title}</h2>
                <p><strong>Date:</strong> ${info.event.start.toLocaleDateString()}</p>
                <p><strong>Time:</strong> ${info.event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                    ${info.event.end ? info.event.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</p>
                <p><strong>Location:</strong> ${eventData.location || 'See event page'}</p>
                <p><strong>Ticket ID:</strong> ${eventData.ticketId || 'N/A'}</p>
                <p><strong>Status:</strong> ${eventData.claimStatus || 'Claimed'}</p>
                <button id="export-ics-btn" class="details-btn">Add to Calendar (.ics)</button>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    const modal = document.getElementById('event-modal');
    const closeModal = () => modal.remove();

    document.getElementById('close-modal').addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { 
        if (e.target === modal) closeModal(); 
    }); 
    
    // Attach the export action to the button
    document.getElementById('export-ics-btn').addEventListener('click', () => {
        downloadIcs(info.event);
        closeModal();    
    });
}

// Function to initialize and render the calendar (This is the only definition now)
function initializeCalendar() {
    var calendarEl = document.getElementById('calendar');
    
    // Get user ID from cookies (set by login page)
    const studentId = getCookie('userId');

    if (!studentId) {
        console.error("User ID not found. Cannot load personalized calendar.");
        document.getElementById('calendar').innerHTML = '<p style="color:white; text-align:center;">Please log in to view your personalized calendar.</p>';
        return;
    }

    loadCalendarForStudent(calendarEl, studentId);
}

function loadCalendarForStudent(calendarEl, studentId) {
    var calendar = new FullCalendar.Calendar(calendarEl, {
        //CALENDAR CONFIGURATION
        initialView: 'dayGridMonth', 
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        editable: false, 
        selectable: true,
        
        //DATA FEED CONFIGURATION
        events: function(fetchInfo, successCallback, failureCallback) {
            // Check if we have cached events first
            const cachedEvents = getCachedEvents();
            if (cachedEvents) {
                successCallback(cachedEvents);
                return;
            }

            // ARCHITECTURE DECISION: Absolute URL.
            // FOr what: to bridge the Cross-Origin gap between the frontend (Port 3002) 
            // and the Flask backend (Port 5000) during local development.
            const apiPath = `http://127.0.0.1:5000/student/${studentId}/events`;
            $.ajax({
                url: apiPath, 
                method: 'GET',
                dataType: 'json',
                
                success: function(response) {
                    // Cache the events
                    setCachedEvents(response);
                    // Show all events that the student has tickets for
                    successCallback(response); 
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    console.error("Error fetching events - Status:", jqXHR.status);
                    console.error("Error text:", textStatus);
                    console.error("Error thrown:", errorThrown);
                    console.error("Response text:", jqXHR.responseText);
                    let errorMsg = 'Failed to load events.';
                    try {
                        const errorData = JSON.parse(jqXHR.responseText);
                        errorMsg = errorData.error || errorData.message || errorMsg;
                    } catch(e) {
                        // Could not parse error response
                    }
                    document.getElementById('calendar').innerHTML = '<p style="color:red; text-align:center;">' + errorMsg + '</p>';
                    failureCallback(errorThrown);
                }
            });
        },
        // INTERACTIVITY
        eventClick: function(info) {
            // This is the primary modification: call the modal containing the export button
            showEventDetailsModal(info); 
            info.jsEvent.preventDefault(); 
        },
        
        /* Customize event rendering
         Why : Visual Feedback (User Experience).
         We inspect the 'claimStatus' property attached to the event object to dynamically
         color-code the event on the calendar. This allows users to instantly distinguish 
         between events they have tickets for (Red) vs events they just saved (Yellow).*/
        eventDidMount: function(info) {
            // Match status strings from backend
            if (info.event.extendedProps.claimStatus === 'claimed') {
                info.el.style.backgroundColor = '#871a1a'; //red for claimed
                info.el.style.borderColor = '#510c0c';
            } else if (info.event.extendedProps.claimStatus === 'saved') {
                info.el.style.backgroundColor = '#ffc107'; // Yellow for saved
            }
        }
    });

    calendar.render();
}

// Ensure the code runs only after the entire HTML document is loaded
document.addEventListener('DOMContentLoaded', initializeCalendar);
