// ============================================================
// ===== API SERVICE - Clean Client Layer =====
// ============================================================

class ApiService {
    constructor() {
        try {
            this.updateBaseURL();
            this.token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
        } catch (e) {
            this.baseURL = 'http://localhost:5000/api';
            this.token = null;
        }
    }

    updateBaseURL() {
        let base = 'http://localhost:5000/api';
        try {
            if (window.CONFIG?.API_URL) {
                base = window.CONFIG.API_URL.trim().replace(/\/+$/, '');
            } else if (typeof localStorage !== 'undefined' && localStorage.getItem('hr_custom_api_url')) {
                base = localStorage.getItem('hr_custom_api_url').trim().replace(/\/+$/, '');
            }
        } catch (e) {}

        if (!base.endsWith('/api') && !base.includes('/api/')) {
            base += '/api';
        }
        this.baseURL = base;
    }

    getToken() {
        try {
            if (!this.token && typeof localStorage !== 'undefined') {
                this.token = localStorage.getItem('token');
            }
        } catch (e) {}
        return this.token;
    }

    async request(endpoint, options = {}) {
        this.updateBaseURL();
        const token = this.getToken();
        
        const headers = {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true',
            ...(this.token && { 'Authorization': `Bearer ${this.token}` })
        };

        const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
        const url = `${this.baseURL}${cleanEndpoint}`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), options.timeout || 6000);

        try {
            const response = await fetch(url, {
                ...options,
                headers,
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            const text = await response.text();
            let data;
            try {
                data = text ? JSON.parse(text) : {};
            } catch (e) {
                console.error(`❌ Server returned non-JSON response (Status ${response.status}) from ${url}:`, text);
                if (response.status === 404) {
                    throw new Error(`Endpoint not found (404) at ${url}. Ensure backend is running ("node index.js") on port 5000.`);
                }
                throw new Error(`Server returned status ${response.status} with non-JSON response.`);
            }

            if (!response.ok) {
                const errMsg = data.message || data.error || `API request failed with status: ${response.status}`;
                throw new Error(errMsg);
            }
            return data;
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                console.warn(`[ApiService Timeout] Request to ${url} timed out.`);
                throw new Error(`Connection timed out reaching ${url}. Check your backend server.`);
            }
            console.error(`[ApiService Error] ${endpoint}:`, error.message);
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
            if (response.user) {
                localStorage.setItem('user', JSON.stringify(response.user));
            }
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
    async getEmployees(search = '') {
        const endpoint = search ? `/employees?search=${encodeURIComponent(search)}` : '/employees';
        const response = await this.request(endpoint);
        if (response && response.success && response.employees) return response.employees;
        if (Array.isArray(response)) return response;
        return response?.employees || [];
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
            : id;
        return this.request(`/employees/${numericId}`, {
            method: 'PUT',
            body: JSON.stringify(employeeData)
        });
    }

    async deleteEmployee(id) {
        const numericId = typeof id === 'string' && id.includes('EMP-') 
            ? parseInt(id.replace('EMP-', '')) 
            : id;
        return this.request(`/employees/${numericId}`, {
            method: 'DELETE'
        });
    }

    // ===== LEAVE ENDPOINTS =====
    async getLeaves() {
        const response = await this.request('/leaves');
        return response?.leaves || (Array.isArray(response) ? response : []);
    }

    async getMyLeaves() {
        const response = await this.request('/leaves/my-leaves');
        return response?.leaves || (Array.isArray(response) ? response : []);
    }

    async applyLeave(leaveData) {
        return this.request('/leaves', {
            method: 'POST',
            body: JSON.stringify(leaveData)
        });
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

    // ===== PAYROLL ENDPOINTS =====
    async getPayroll() {
        return this.request('/payroll');
    }

    async getMyPayslips() {
        const response = await this.request('/payroll/my-payslips');
        return response?.payslips || (Array.isArray(response) ? response : []);
    }

    // ===== DEPARTMENTS =====
    async getDepartments() {
        const response = await this.request('/departments');
        return response?.departments || (Array.isArray(response) ? response : []);
    }

    // ===== MESSAGES =====
    async getMessages() {
        const response = await this.request('/messages');
        return response?.messages || (Array.isArray(response) ? response : []);
    }

    async sendMessage(messageData) {
        return this.request('/messages', {
            method: 'POST',
            body: JSON.stringify(messageData)
        });
    }

    // ===== DASHBOARD & STATS =====
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

window.ApiService = ApiService;
window.api = new ApiService();