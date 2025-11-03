// --- Client-Side Event Data Utility Module ---
// This module contains functions for complex data manipulation (filtering, sorting)
// to keep the main frontend JavaScript files clean.

// MOCK DATA is included here for testing the logic until the API is connected.
const mockEvents = [
    {
        id: 'evt-401',
        title: 'Student Welcome Mixer',
        date: '2025-11-20T18:00:00', // ISO format for easy sorting
        category: 'Social',
        organizer: 'Student Life',
        status: 'current',
        price: 'Free',
        isUpcoming: true,
    },
    {
        id: 'evt-402',
        title: 'Mid-Term Study Skills Session',
        date: '2025-11-05T14:00:00',
        category: 'Academic',
        organizer: 'Academic Advising',
        status: 'current',
        price: 'Free',
        isUpcoming: true,
    },
    {
        id: 'evt-403',
        title: 'Campus Photography Workshop',
        date: '2025-12-10T10:00:00',
        category: 'Arts',
        organizer: 'Arts Society',
        status: 'current',
        price: '$15.00',
        isUpcoming: true,
    },
    {
        id: 'evt-404',
        title: 'Career Fair 2024',
        date: '2024-09-15T09:00:00',
        category: 'Career',
        organizer: 'Career Services',
        status: 'past', // Should be excluded from trending
        price: 'Free',
        isUpcoming: false,
    },
    {
        id: 'evt-405',
        title: 'Game Night: Board Games & Pizza',
        date: '2025-11-01T19:00:00',
        category: 'Social',
        organizer: 'Gaming Club',
        status: 'current',
        price: '$5.00',
        isUpcoming: true,
    },
];


/**
 * Sorts events chronologically by date, showing the nearest upcoming event first.
 * @param {Array<Object>} events - Array of event objects.
 * @returns {Array<Object>} Sorted array of events.
 */
export function sortEventsByDate(events) {
    // Note: We use the ISO format (YYYY-MM-DDTHH:MM:SS) in the mock data
    // so Date parsing is reliable across browsers.
    return [...events].sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA - dateB;
    });
}


/**
 * Filters the list of events based on user-provided criteria.
 * @param {Array<Object>} events - Array of event objects.
 * @param {Object} criteria - Object containing search/filter terms.
 * @param {string} criteria.search - Text search term (title, organizer, category).
 * @param {string} criteria.category - Category filter.
 * @param {string} criteria.date - Date filter (e.g., specific day or range).
 * @returns {Array<Object>} Filtered array of events.
 */
export function filterEvents(events, criteria) {
    const { search = '', category = '', date = '' } = criteria;
    const now = new Date();

    return events.filter(event => {
        const eventDate = new Date(event.date);

        // 1. Status Filter: Only show events marked 'current' and not yet passed
        if (event.status !== 'current' || eventDate < now) {
            return false;
        }

        // 2. Text Search (title, organizer, category)
        const searchTerm = search.toLowerCase();
        const matchesSearch = !searchTerm || 
            event.title.toLowerCase().includes(searchTerm) ||
            event.organizer.toLowerCase().includes(searchTerm) ||
            event.category.toLowerCase().includes(searchTerm);
        
        if (!matchesSearch) {
            return false;
        }

        // 3. Category Filter
        const matchesCategory = !category || 
            event.category.toLowerCase() === category.toLowerCase();
        
        if (!matchesCategory) {
            return false;
        }

        // (Date filtering logic can be added here if needed)

        return true;
    });
}


/**
 * Calculates metrics (Total, Current, Past) for the admin dashboard.
 * @param {Array<Object>} events - Array of event objects.
 * @returns {Object} Metrics object.
 */
export function calculateMetrics(events) {
    const now = new Date();
    
    // We use the 'status' property here since that is what the Admin sets.
    const total = events.length;
    const current = events.filter(e => e.status === 'current' && new Date(e.date) > now).length;
    const past = events.filter(e => e.status === 'past' || new Date(e.date) < now).length;
    const pending = events.filter(e => e.status === 'pending').length;

    return { total, current, past, pending };
}

/**
 * Retrieves mock event data for initial frontend rendering.
 * In a production app, this function would call the fetchEvents API.
 * @returns {Array<Object>} Array of mock events.
 */
export function getMockEvents() {
    // For reliable local testing, we return a fresh copy of the data
    return JSON.parse(JSON.stringify(mockEvents)); 
}
