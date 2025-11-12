const ADMIN_API = {
    baseUrl: 'http://127.0.0.1:5000',

    // Helper: Get auth headers
    getHeaders() {
        const headers = { 'Content-Type': 'application/json' };
        const token = localStorage.getItem('authToken');
        if (token) headers['Authorization'] = `Bearer ${token}`;
        return headers;
    },

    // Helper: Handle responses
    async handleResponse(response) {
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || `HTTP ${response.status}`);
        }
        return data;
    },

    // === EVENTS ===
    async getEvents() {
        const response = await fetch(`${this.baseUrl}/events`, { headers: this.getHeaders() });
        return this.handleResponse(response);
    },

    async updateEventStatus(eventId, status) {
        const response = await fetch(`${this.baseUrl}/events/${eventId}`, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify({ status })
        });
        return this.handleResponse(response);
    },

    async updateEvent(eventId, eventData) {
        const response = await fetch(`${this.baseUrl}/events/${eventId}`, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify(eventData)
        });
        return this.handleResponse(response);
    },

    async deleteEvent(eventId) {
        const response = await fetch(`${this.baseUrl}/events/${eventId}`, {
            method: 'DELETE',
            headers: this.getHeaders()
        });
        return this.handleResponse(response);
    },

    // === STUDENTS ===
    async getStudents(search = '', filter = '') {
        const query = new URLSearchParams({ search, filter });
        const response = await fetch(`${this.baseUrl}/users?role=student&${query}`, {
            headers: this.getHeaders()
        });
        return this.handleResponse(response);
    },

    async deleteStudent(userId) {
        const response = await fetch(`${this.baseUrl}/users/${userId}`, {
            method: 'DELETE',
            headers: this.getHeaders()
        });
        return this.handleResponse(response);
    },

    // === ORGANIZERS ===
    async getOrganizers(search = '', filter = '') {
        const query = new URLSearchParams({ search, filter });
        const response = await fetch(`${this.baseUrl}/users?role=organizer&${query}`, {
            headers: this.getHeaders()
        });
        return this.handleResponse(response);
    },

    async deleteOrganizer(userId) {
        const response = await fetch(`${this.baseUrl}/users/${userId}`, {
            method: 'DELETE',
            headers: this.getHeaders()
        });
        return this.handleResponse(response);
    },

    // === USERS ===
    async getUserById(userId) {
        const response = await fetch(`${this.baseUrl}/users/${userId}`, {
            headers: this.getHeaders()
        });
        return this.handleResponse(response);
    },

    // === EVENT ATTENDANCE ===
    async getEventAttendance(eventId) {
        const response = await fetch(`${this.baseUrl}/events/${eventId}/attendance`, {
            headers: this.getHeaders()
        });
        return this.handleResponse(response);
    },

    // === ORGANIZATIONS ===
    async getOrganizations() {
        const response = await fetch(`${this.baseUrl}/organizations`, {
            headers: this.getHeaders()
        });
        return this.handleResponse(response);
    },

    async getOrganizationMembers() {
        const response = await fetch(`${this.baseUrl}/organization_members`, {
            headers: this.getHeaders()
        });
        return this.handleResponse(response);
    },

    async updateOrganizationStatus(orgId, status) {
        const response = await fetch(`${this.baseUrl}/organizations/${orgId}`, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify({ status })
        });
        return this.handleResponse(response);
    },

    async createOrganization(orgData) {
        const response = await fetch(`${this.baseUrl}/organizations`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(orgData)
        });
        return this.handleResponse(response);
    },

    async updateOrganization(orgId, orgData) {
        const response = await fetch(`${this.baseUrl}/organizations/${orgId}`, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify(orgData)
        });
        return this.handleResponse(response);
    }
};

// === Shared UI: Hamburger Menu Toggle & Auth Status ===
document.addEventListener('DOMContentLoaded', () => {
    const dot = document.getElementById('dot');
    const menu = document.getElementById('menu');
    if (dot && menu) {
        dot.onclick = () => {
            const isOpen = menu.classList.toggle('open');
            dot.innerHTML = isOpen ? '&#8211;' : '&#8801;';
        };
    }
    
    // Update menu based on auth status
    const loginLink = document.querySelector('a[href="admin-login.html"]');
    const userData = localStorage.getItem('userData');
    
    if (loginLink && userData) {
        // User is logged in, change to LOGOUT
        loginLink.textContent = 'LOGOUT';
        loginLink.href = '#';
        loginLink.onclick = (e) => {
            e.preventDefault();
            localStorage.removeItem('userData');
            localStorage.removeItem('authToken');
            localStorage.removeItem('lastWelcomeTime');
            window.location.href = 'admin-login.html';
        };
    }
});