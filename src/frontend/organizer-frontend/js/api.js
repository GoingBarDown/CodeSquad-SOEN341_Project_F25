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
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'An error occurred');
        }
        return data;
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
            const response = await fetch(`${this.baseUrl}/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
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
    }
};