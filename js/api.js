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
    const token = this.getToken();  // ✅ Get token first
    
    const headers = {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',  // ✅ ADD THIS BACK
        ...(token && { 'Authorization': `Bearer ${token}` })  // ✅ Use `token` variable
    };

    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${this.baseURL}${cleanEndpoint}`;

    // ✅ DEBUG LOGS — Remove after fixing
    console.log('═══════════════════════════════════');
    console.log(`🌐 ${options.method || 'GET'} ${url}`);
    console.log('🔑 Token:', token ? token.substring(0, 30) + '...' : '❌ NO TOKEN');
    console.log('📋 Auth Header:', headers.Authorization ? '✅ Present' : '❌ Missing');
    console.log('═══════════════════════════════════');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options.timeout || 15000);  // ✅ 15s not 6s

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
            console.error(`❌ Non-JSON response (Status ${response.status}):`, text.substring(0, 200));
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
            throw new Error(`Request timed out. Backend may be sleeping (Render free tier).`);
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
        if (Array.isArray(response)) return response;
        if (Array.isArray(response?.leaves)) return response.leaves;
        if (Array.isArray(response?.data)) return response.data;
        return [];
    }

    async getMyLeaves() {
        const response = await this.request('/leaves/my-leaves');
        if (Array.isArray(response)) return response;
        if (Array.isArray(response?.leaves)) return response.leaves;
        if (Array.isArray(response?.data?.leaves)) return response.data.leaves;
        if (Array.isArray(response?.data)) return response.data;
        return [];
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
        if (Array.isArray(response)) return response;
        if (Array.isArray(response?.payslips)) return response.payslips;
        if (Array.isArray(response?.data)) return response.data;
        return [];
    }

    // ===== DEPARTMENTS =====
    async getDepartments() {
        const response = await this.request('/departments');
        if (Array.isArray(response)) return response;
        if (Array.isArray(response?.departments)) return response.departments;
        if (Array.isArray(response?.data)) return response.data;
        return [];
    }

    // ===== MESSAGES =====
    async getMessages() {
        const response = await this.request('/messages');
        if (Array.isArray(response)) return response;
        if (Array.isArray(response?.messages)) return response.messages;
        if (Array.isArray(response?.data)) return response.data;
        return [];
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
