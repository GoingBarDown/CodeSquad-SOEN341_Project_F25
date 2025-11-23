const API = {
    baseUrl: 'http://127.0.0.1:5000',

    // Helper method to get auth headers
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };
        const token = localStorage.getItem('authToken');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return headers;
    },

    // Helper method to handle responses
    async handleResponse(response) {
        try {
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || data.message || `HTTP ${response.status}: An error occurred`);
            }
            return data;
        } catch (error) {
            if (error instanceof SyntaxError) {
                throw new Error(`Server error: Invalid response format (HTTP ${response.status})`);
            }
            throw error;
        }
    },

    // Logout function - clears localStorage and redirects
    logout(options = {}) {
        const { showMessage = true, customItems = [] } = options;
        localStorage.removeItem('userData');
        localStorage.removeItem('authToken');
        // Remove any custom items passed in
        customItems.forEach(item => localStorage.removeItem(item));
        
        if (showMessage) {
            alert('✅ You have been logged out successfully.');
        }
        window.location.href = 'organizer-login.html';
    },

    // Auth endpoints
    async login(loginData) {
        try {
            // Convert email/username format to backend expected format
            const authData = {
                username: loginData.username || loginData.email,
                password: loginData.password
            };
            
            const response = await fetch(`${this.baseUrl}/users/auth`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(authData)
            });
            return this.handleResponse(response);
        } catch (error) {
            console.error('Login request failed:', error);
            throw error;
        }
    },

    async signup(userData) {
        try {
            console.log('Sending signup request to /users with data:', userData);
            const response = await fetch(`${this.baseUrl}/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
            console.log('Signup response status:', response.status);
            return this.handleResponse(response);
        } catch (error) {
            console.error('Signup request failed:', error);
            throw error;
        }
    },

    async getUser(id) {
        try {
            const response = await fetch(`${this.baseUrl}/users/${id}`, {
                headers: this.getHeaders()
            });
            return this.handleResponse(response);
        } catch (error) {
            console.error('Get user request failed:', error);
            throw error;
        }
    },

    async forgotPassword(data) {
        try {
            const response = await fetch(`${this.baseUrl}/users/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return this.handleResponse(response);
        } catch (error) {
            console.error('Password reset request failed:', error);
            throw error;
        }
    },

    // Profile endpoints
    // async getProfile() {
    //     try {
    //         const response = await fetch(`${this.baseUrl}/api/organizer/profile`, {
    //             headers: this.getHeaders()
    //         });
    //         return this.handleResponse(response);
    //     } catch (error) {
    //         console.error('Get profile request failed:', error);
    //         throw error;
    //     }
    // },

    // async updateProfile(profileData) {
    //     try {
    //         const response = await fetch(`${this.baseUrl}/api/organizer/profile`, {
    //             method: 'PUT',
    //             headers: this.getHeaders(),
    //             body: JSON.stringify(profileData)
    //         });
    //         return this.handleResponse(response);
    //     } catch (error) {
    //         console.error('Update profile request failed:', error);
    //         throw error;
    //     }
    // },

    // async uploadProfilePicture(formData) {
    //     try {
    //         const response = await fetch(`${this.baseUrl}/api/organizer/profile/picture`, {
    //             method: 'POST',
    //             headers: this.getHeaders(),
    //             body: formData
    //         });
    //         return this.handleResponse(response);
    //     } catch (error) {
    //         console.error('Upload profile picture failed:', error);
    //         throw error;
    //     }
    // },

    // async getOrganizations() {
    //     try {
    //         const response = await fetch(`${this.baseUrl}/api/organizations`, {
    //             headers: this.getHeaders()
    //         });
    //         return this.handleResponse(response);
    //     } catch (error) {
    //         console.error('Get organizations failed:', error);
    //         throw error;
    //     }
    // },

    // async createOrganization(orgData) {
    //     try {
    //         const response = await fetch(`${this.baseUrl}/api/organizations`, {
    //             method: 'POST',
    //             headers: this.getHeaders(),
    //             body: JSON.stringify(orgData)
    //         });
    //         return this.handleResponse(response);
    //     } catch (error) {
    //         console.error('Create organization failed:', error);
    //         throw error;
    //     }
    // },

    // Events endpoints
    async getEvents() {
        try {
            const response = await fetch(`${this.baseUrl}/events`, {
                headers: this.getHeaders()
            });
            return this.handleResponse(response);
        } catch (error) {
            console.error('Get events request failed:', error);
            throw error;
        }
    },

    async getEvent(id) {
        try {
            const response = await fetch(`${this.baseUrl}/events/${id}`, {
                headers: this.getHeaders()
            });
            return this.handleResponse(response);
        } catch (error) {
            console.error('Get event request failed:', error);
            throw error;
        }
    },

    async createEvent(eventData) {
        try {
            const response = await fetch(`${this.baseUrl}/events`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(eventData)
            });
            return this.handleResponse(response);
        } catch (error) {
            console.error('Create event request failed:', error);
            throw error;
        }
    },

    async updateEvent(id, eventData) {
        try {
            const response = await fetch(`${this.baseUrl}/events/${id}`, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify(eventData)
            });
            return this.handleResponse(response);
        } catch (error) {
            console.error('Update event request failed:', error);
            throw error;
        }
    },

    async deleteEvent(id) {
        try {
            const response = await fetch(`${this.baseUrl}/events/${id}`, {
                method: 'DELETE',
                headers: this.getHeaders()
            });
            return this.handleResponse(response);
        } catch (error) {
            console.error('Delete event request failed:', error);
            throw error;
        }
    },

    // Ticket endpoints
    async getAllTickets() {
        try {
            const response = await fetch(`${this.baseUrl}/tickets`, {
                headers: this.getHeaders()
            });
            return this.handleResponse(response);
        } catch (error) {
            console.error('Get all tickets request failed:', error);
            throw error;
        }
    },

    async getTicket(id) {
        try {
            const response = await fetch(`${this.baseUrl}/tickets/${id}`, {
                headers: this.getHeaders()
            });
            return this.handleResponse(response);
        } catch (error) {
            console.error('Get ticket request failed:', error);
            throw error;
        }
    },

    async validateTicket(ticketId) {
        try {
            const response = await fetch(`${this.baseUrl}/tickets/validate`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({ ticketId })
            });
            return this.handleResponse(response);
        } catch (error) {
            console.error('Validate ticket request failed:', error);
            throw error;
        }
    },

    // Organization endpoints
    async getOrganizations() {
        try {
            const response = await fetch(`${this.baseUrl}/organizations`, {
                headers: this.getHeaders()
            });
            return this.handleResponse(response);
        } catch (error) {
            console.error('Get organizations request failed:', error);
            throw error;
        }
    },

    async getOrganizationMembers() {
        try {
            const response = await fetch(`${this.baseUrl}/organization_members`, {
                headers: this.getHeaders()
            });
            return this.handleResponse(response);
        } catch (error) {
            console.error('Get organization members request failed:', error);
            throw error;
        }
    }
};

// Shared function to check if organizer is denied and lock page if needed
async function checkAndEnforceDeniedStatus(user) {
    try {
        // Get all organization members
        const membersResponse = await fetch('http://127.0.0.1:5000/organization_members', {
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (!membersResponse.ok) {
            console.error('Failed to fetch organization members');
            return false;
        }
        
        const members = await membersResponse.json();
        const userOrgMember = members.find(m => m.user_id === user.id);
        
        if (!userOrgMember) {
            console.error('User not found in organization members');
            return false;
        }
        
        // Get the organization details
        const orgResponse = await fetch(`http://127.0.0.1:5000/organizations/${userOrgMember.organization_id}`, {
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (!orgResponse.ok) {
            console.error('Failed to fetch organization');
            return false;
        }
        
        const org = await orgResponse.json();
        
        // If organization is denied, show dialog and lock page
        if (org.status === 'denied') {
            showDeniedAccessDialog(org);
            return true; // User is denied
        }
        
        return false; // User is not denied
    } catch (err) {
        console.error('Error checking denied status:', err);
        return false;
    }
}

// Show denied access dialog with no dismissal option
function showDeniedAccessDialog(org) {
    const modal = document.createElement('div');
    modal.classList.add('approval-modal-overlay');
    modal.style.zIndex = '10000';
    
    modal.innerHTML = `
        <div class="approval-modal-content">
            <div class="approval-modal-icon">❌</div>
            <h2>Account Denied</h2>
            <p class="approval-message">
                Your account was denied. Contact customer support for assistance.
            </p>
            <button class="approval-btn-ok" onclick="logoutDeniedUser()">OK</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Disable all page content
    const pageContent = document.querySelector('main') || document.querySelector('.dashboard-container') || document.querySelector('.container');
    if (pageContent) {
        pageContent.style.display = 'none';
    }
}

// Automatically setup logout link on all pages
document.addEventListener('DOMContentLoaded', () => {
    const logoutLink = document.getElementById('loginLogoutLink');
    if (logoutLink) {
        logoutLink.href = '#';
        logoutLink.onclick = (e) => {
            e.preventDefault();
            API.logout();
        };
    }
});