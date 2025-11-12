const dot=document.getElementById('dot');
const menu=document.getElementById('menu');
dot.onclick=()=>{
  const isOpen=menu.classList.toggle('open');
  dot.innerHTML=isOpen?'&#8211;':'&#8801;';}
  //minus and menu symbols

function formatIcsDate(date) {
    if (!date) return '';
    // Adjust for local timezone offset before formatting to UTC.
    const d = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
    
    // YYYYMMDDTHHMMSSZ format
    return d.toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z';
}

// Function to generate the ICS file content for a single event
function generateIcsContent(event) {
    const startDate = formatIcsDate(event.start);
    // Ensure end date exists, otherwise use start date
    const endDate = formatIcsDate(event.end || event.start); 
    const location = event.extendedProps.location || "Campus Location";
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

// Helper to trigger the file download
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

//Modal Function 
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
    
    // Set default user ID for testing
    const studentId = localStorage.getItem('userId') || '1'; 
    const authToken = localStorage.getItem('authToken'); 

    if (!studentId) {
        console.error("User ID not found. Cannot load personalized calendar.");
        // MODIFICATION: Use CSS class for styling
        document.getElementById('calendar').innerHTML = '<p class="calendar-message info">Please log in to view your personalized calendar.</p>';
        return;
    }

    var calendar = new FullCalendar.Calendar(calendarEl, {
        // CALENDAR CONFIGURATION 
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
            const apiPath = `/student/${studentId}/events`;
            
            $.ajax({
                url: apiPath, 
                method: 'GET',
                xhrFields: { withCredentials: true },
                
                
                success: function(response) {
                    console.log("Events successfully fetched:", response);
                    successCallback(response); 
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    console.error("Error fetching events:", textStatus, errorThrown, jqXHR.responseText);
                    // MODIFICATION: Use CSS class for styling
                    document.getElementById('calendar').innerHTML = '<p class="calendar-message error">Failed to load events. Check console for API errors.</p>';
                    failureCallback(errorThrown);
                }
            });
        },
        //INTERACTIVITY
        eventClick: function(info) {
            // This is the primary modification: call the modal containing the export button
            showEventDetailsModal(info); 
            info.jsEvent.preventDefault(); 
        },
        
        
        eventDidMount: function(info) {

            if (info.event.extendedProps.claimStatus === 'claimed') {
                info.el.style.backgroundColor = '#871a1a'; // App red for claimed
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