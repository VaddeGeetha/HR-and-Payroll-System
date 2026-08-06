// ============================================================
// ===== API SERVICE =====
// ============================================================
class ApiService {
    constructor() {
        this.baseURL = CONFIG.API_URL;
        this.token = localStorage.getItem('token');
    }

    async request(endpoint, options = {}) {
        const headers = {
            'Content-Type': 'application/json',
            ...(this.token && { 'Authorization': `Bearer ${this.token}` })
        };

        try {
            console.log(`📡 API Request: ${options.method || 'GET'} ${this.baseURL}${endpoint}`);
            
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                ...options,
                headers
            });
            
            const text = await response.text();
            console.log(`📡 Response from ${endpoint}:`, text.substring(0, 200));
            
            let data;
            try {
                data = JSON.parse(text);
            } catch (e) {
                console.error('❌ Failed to parse JSON. Raw response:', text);
                throw new Error(`Invalid JSON response from server. Status: ${response.status}`);
            }

            if (!response.ok) {
                throw new Error(data.message || data.error || `API request failed: ${response.status}`);
            }
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // ===== AUTH ENDPOINTS =====
    async login(email, password) {
        const response = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        if (response.token) {
            this.token = response.token;
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
        }
        return response;
    }

    async forgotPassword(email) {
        return this.request('/auth/forgot-password', {
            method: 'POST',
            body: JSON.stringify({ email })
        });
    }

    async resetPassword(email, otp, newPassword) {
        return this.request('/auth/reset-password', {
            method: 'POST',
            body: JSON.stringify({ email, otp, newPassword })
        });
    }

    // ===== EMPLOYEE ENDPOINTS =====
    async getEmployees() {
        const response = await this.request('/employees');
        if (response.success && response.employees) {
            return response.employees;
        }
        return response;
    }

    async addEmployee(employeeData) {
        return this.request('/employees', {
            method: 'POST',
            body: JSON.stringify(employeeData)
        });
    }

    async updateEmployee(id, employeeData) {
        const numericId = typeof id === 'string' && id.includes('EMP-') 
            ? parseInt(id.replace('EMP-', '')) 
            : parseInt(id);
        
        console.log(`🔄 Updating employee: ${id} → ${numericId}`);
        return this.request(`/employees/${numericId}`, {
            method: 'PUT',
            body: JSON.stringify(employeeData)
        });
    }

    async deleteEmployee(id) {
        const numericId = typeof id === 'string' && id.includes('EMP-') 
            ? parseInt(id.replace('EMP-', '')) 
            : parseInt(id);
        
        console.log(`🗑️ Deleting employee: ${id} → ${numericId}`);
        return this.request(`/employees/${numericId}`, {
            method: 'DELETE'
        });
    }

    // ===== LEAVE ENDPOINTS =====
    async getLeaves() {
        return this.request('/leaves');
    }

    async approveLeave(id) {
        return this.request(`/leaves/${id}/approve`, {
            method: 'PUT'
        });
    }

    async rejectLeave(id) {
        return this.request(`/leaves/${id}/reject`, {
            method: 'PUT'
        });
    }

    // ===== DASHBOARD ENDPOINTS =====
    async getDashboardStats() {
        return this.request('/dashboard/stats');
    }

    async getChartData() {
        return this.request('/dashboard/charts');
    }

    // ===== LOGOUT =====
    logout() {
        this.token = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }
}

// Make available globally
window.ApiService = ApiService;