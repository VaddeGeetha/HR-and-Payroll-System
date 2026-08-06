// ============================================================
// ===== DATA LOADERS =====
// ============================================================

let useMockData = false;

async function fetchEmployees() {
    try {
        if (!useMockData && window.api) {
            console.log('📡 Fetching employees from backend...');
            const data = await window.api.getEmployees();
            console.log('✅ Employees fetched:', data);
            
            if (data.success && data.employees) {
                return data.employees;
            }
            if (Array.isArray(data)) {
                return data;
            }
            return data;
        }
    } catch (error) {
        console.warn('⚠️ API failed, using mock data:', error.message);
        return MOCK_DATA.employees;
    }
    return MOCK_DATA.employees;
}

async function fetchLeaves() {
    try {
        if (!useMockData && window.api) {
            const data = await window.api.getLeaves();
            return data.leaves || data;
        }
    } catch (error) {
        console.warn('⚠️ API failed, using mock data:', error.message);
    }
    return MOCK_DATA.leaveRequests;
}

async function fetchDashboardStats() {
    try {
        if (!useMockData && window.api) {
            const data = await window.api.getDashboardStats();
            return data;
        }
    } catch (error) {
        console.warn('⚠️ API failed, using mock data:', error.message);
    }
    return MOCK_DATA.dashboardStats;
}

async function fetchChartData() {
    try {
        if (!useMockData && window.api) {
            const data = await window.api.getChartData();
            return data;
        }
    } catch (error) {
        console.warn('⚠️ API failed, using mock data:', error.message);
    }
    return MOCK_DATA.chartData;
}

// Make available globally
window.useMockData = useMockData;
window.fetchEmployees = fetchEmployees;
window.fetchLeaves = fetchLeaves;
window.fetchDashboardStats = fetchDashboardStats;
window.fetchChartData = fetchChartData;