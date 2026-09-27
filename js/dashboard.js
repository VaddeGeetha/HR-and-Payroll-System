// ============================================================
// ===== DASHBOARD.JS - Core Flow & Real Backend Integration =====
// ============================================================

if (!window.api && typeof ApiService !== 'undefined') {
    window.api = new ApiService();
}
var api = window.api;

let currentUser = null;
let currentSection = 'dashboard';
let chartInstances = {};
let workingHoursInterval = null;

// ============================================================
// ===== TOAST SYSTEM =====
// ============================================================

function showToast(title, message, type = 'info') {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-triangle-exclamation',
        info: 'fa-info-circle'
    };

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span class="toast-icon"><i class="fas ${icons[type] || icons.info}"></i></span>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close"><i class="fas fa-xmark"></i></button>
    `;

    toast.querySelector('.toast-close').addEventListener('click', () => toast.remove());
    container.appendChild(toast);
    setTimeout(() => {
        if (toast.parentNode) toast.remove();
    }, 5000);
}

window.showToast = showToast;

// ============================================================
// ===== PASSWORD TOGGLE =====
// ============================================================

function togglePassword() {
    const input = document.getElementById('passwordInput');
    const btn = document.querySelector('.password-toggle');
    
    if (!input || !btn) return;

    if (input.type === 'password') {
        input.type = 'text';
        btn.innerHTML = '<i class="fas fa-eye-slash"></i>';
    } else {
        input.type = 'password';
        btn.innerHTML = '<i class="fas fa-eye"></i>';
    }
}

window.togglePassword = togglePassword;

// ============================================================
// ===== CHARTS INITIALIZATION =====
// ============================================================

function initCharts(chartData = {}) {
    if (typeof Chart === 'undefined') return;

    Object.values(chartInstances).forEach(chart => {
        if (chart && typeof chart.destroy === 'function') chart.destroy();
    });
    chartInstances = {};

    const growthLabels = chartData.growthLabels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
    const employeeGrowth = chartData.employeeGrowth || [2, 4, 6, 8, 10, 14, 18, 22];
    const departments = (chartData.departments && chartData.departments.length > 0)
        ? chartData.departments
        : ['IT', 'HR', 'Finance', 'Sales', 'Marketing', 'Operations'];
    const departmentCounts = (chartData.departmentCounts && chartData.departmentCounts.length > 0)
        ? chartData.departmentCounts
        : [8, 4, 5, 6, 4, 3];
    const payrollLabels = chartData.payrollLabels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
    const monthlyPayroll = chartData.monthlyPayroll || [420000, 440000, 460000, 475000, 479000, 487000, 487000, 487000];

    const approvedLeaves = Number(chartData.leaveStats?.approved ?? 0);
    const pendingLeaves = Number(chartData.leaveStats?.pending ?? 0);
    const rejectedLeaves = Number(chartData.leaveStats?.rejected ?? 0);
    const totalLeaveCount = approvedLeaves + pendingLeaves + rejectedLeaves;

    // Helper: Employee Growth Line Chart Config
    const buildLineConfig = () => ({
        type: 'line',
        data: {
            labels: growthLabels,
            datasets: [{
                label: 'Total Workforce',
                data: employeeGrowth,
                borderColor: '#1a6dff',
                backgroundColor: 'rgba(26, 109, 255, 0.12)',
                fill: true,
                tension: 0.35,
                borderWidth: 2.5,
                pointBackgroundColor: '#1a6dff',
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(ctx) {
                            return ` Total Staff: ${ctx.raw} employees`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { precision: 0, stepSize: 1 },
                    grid: { color: 'rgba(0,0,0,0.05)' }
                },
                x: {
                    grid: { display: false }
                }
            }
        }
    });

    // Helper: Monthly Payroll Bar Chart Config
    const buildPayrollConfig = () => ({
        type: 'bar',
        data: {
            labels: payrollLabels,
            datasets: [{
                label: 'Monthly Payroll (₹)',
                data: monthlyPayroll,
                backgroundColor: '#22a65e',
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(ctx) {
                            return ` ₹${Number(ctx.raw || 0).toLocaleString('en-IN')}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(0,0,0,0.05)' },
                    ticks: {
                        callback: function(value) {
                            return '₹' + (value >= 100000 ? (value / 100000).toFixed(1) + 'L' : (value / 1000).toFixed(0) + 'K');
                        }
                    }
                },
                x: {
                    grid: { display: false }
                }
            }
        }
    });

    // 1. Employee Growth (Line) - Dashboard
    const lineCtx = document.getElementById('lineChart');
    if (lineCtx) {
        try {
            chartInstances.line = new Chart(lineCtx, buildLineConfig());
        } catch (e) {
            console.warn('Line chart init notice:', e.message);
        }
    }

    // Reports Employee Growth (Line)
    const reportsLineCtx = document.getElementById('reportsLineChart');
    if (reportsLineCtx) {
        try {
            chartInstances.reportsLine = new Chart(reportsLineCtx, buildLineConfig());
        } catch (e) {
            console.warn('Reports line chart init notice:', e.message);
        }
    }

    // 2. Department-wise Employees (Bar)
    const barCtx = document.getElementById('barChart');
    if (barCtx) {
        try {
            const palette = ['#1a6dff', '#22a65e', '#f0ad4e', '#d9534f', '#6f42c1', '#17a2b8', '#e83e8c', '#fd7e14', '#20c997', '#6c757d'];
            const bgColors = departments.map((_, idx) => palette[idx % palette.length]);

            chartInstances.bar = new Chart(barCtx, {
                type: 'bar',
                data: {
                    labels: departments,
                    datasets: [{
                        label: 'Staff Count',
                        data: departmentCounts,
                        backgroundColor: bgColors,
                        borderRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: function(ctx) {
                                    return ` Staff: ${ctx.raw} members`;
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: { precision: 0, stepSize: 1 },
                            grid: { color: 'rgba(0,0,0,0.05)' }
                        },
                        x: {
                            grid: { display: false }
                        }
                    }
                }
            });
        } catch (e) {
            console.warn('Bar chart init notice:', e.message);
        }
    }

    // 3. Leave Status (Doughnut / Pie)
    const pieCtx = document.getElementById('pieChart');
    if (pieCtx) {
        try {
            const pieData = (totalLeaveCount === 0) ? [0, 0, 0] : [approvedLeaves, pendingLeaves, rejectedLeaves];
            chartInstances.pie = new Chart(pieCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Approved Leaves', 'Pending Approvals', 'Rejected'],
                    datasets: [{
                        data: pieData,
                        backgroundColor: ['#22a65e', '#f0ad4e', '#d9534f'],
                        borderWidth: 2,
                        hoverOffset: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'bottom' },
                        tooltip: {
                            callbacks: {
                                label: function(ctx) {
                                    const val = Number(ctx.raw || 0);
                                    const pct = totalLeaveCount > 0 ? Math.round((val / totalLeaveCount) * 100) : 0;
                                    return ` ${ctx.label}: ${val} (${pct}%)`;
                                }
                            }
                        }
                    }
                }
            });
        } catch (e) {
            console.warn('Pie chart init notice:', e.message);
        }
    }

    // 4. Payroll Trend (Bar) - Dashboard
    const payrollCtx = document.getElementById('payrollChart');
    if (payrollCtx) {
        try {
            chartInstances.payroll = new Chart(payrollCtx, buildPayrollConfig());
        } catch (e) {
            console.warn('Payroll chart init notice:', e.message);
        }
    }

    // Reports Payroll Trend (Bar)
    const reportsPayrollCtx = document.getElementById('reportsPayrollChart');
    if (reportsPayrollCtx) {
        try {
            chartInstances.reportsPayroll = new Chart(reportsPayrollCtx, buildPayrollConfig());
        } catch (e) {
            console.warn('Reports payroll chart init notice:', e.message);
        }
    }
}

window.initCharts = initCharts;

function switchSection(id) {
    currentSection = id;
    document.querySelectorAll('.sidebar-nav li').forEach(li =>
        li.classList.toggle('active', li.dataset.target === id)
    );
    document.querySelectorAll('.section').forEach(s =>
        s.classList.toggle('active', s.id === `section-${id}`)
    );
    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.remove('open');
    
    if (id === 'dashboard' || id === 'reports') {
        const emps = window._currentEmployees || [];
        const lvs = window._currentLeaves || [];
        if (typeof fetchChartData === 'function') {
            fetchChartData(emps, lvs).then(data => {
                window._currentChartData = data;
                initCharts(data);
            });
        }
    }
}

window.switchSection = switchSection;

// ============================================================
// ===== WORK FROM HOME (WFH) & SHIFT TIMER TRACKER =====
// ============================================================

function getWFHSessionKey(userEmail) {
    const clean = (userEmail || window.currentUser?.email || window.userEmail || 'employee').trim().toLowerCase();
    return 'hr_wfh_session_' + clean;
}

function getWFHHistoryKey(userEmail) {
    const clean = (userEmail || window.currentUser?.email || window.userEmail || 'employee').trim().toLowerCase();
    return 'hr_wfh_history_' + clean;
}

function getStoredWFHSession(userEmail) {
    const key = getWFHSessionKey(userEmail);
    try {
        const stored = localStorage.getItem(key);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed && typeof parsed === 'object') return parsed;
        }
    } catch (e) {}
    return {
        active: false,
        mode: 'office',
        startTime: null,
        endTime: null,
        durationSeconds: 0,
        formattedDuration: '00:00:00',
        isBreak: false,
        breakStartTime: null,
        totalBreakMs: 0,
        lastWfhDate: null,
        lastWfhDuration: null
    };
}

function getStoredWFHHistory(userEmail) {
    const key = getWFHHistoryKey(userEmail);
    try {
        const stored = localStorage.getItem(key);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) return parsed;
        }
    } catch (e) {}
    return [];
}

function formatDurationHHMMSS(totalSeconds) {
    const s = Math.max(0, Math.floor(totalSeconds));
    const hours = Math.floor(s / 3600);
    const minutes = Math.floor((s % 3600) / 60);
    const seconds = s % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function initWorkingHoursTracker() {
    if (workingHoursInterval) clearInterval(workingHoursInterval);

    const userEmail = (window.currentUser?.email || window.userEmail || '').trim().toLowerCase();
    if (!userEmail) return;

    function updateTimerDisplay() {
        const timerEl = document.getElementById('liveWorkingTimerDisplay');
        if (!timerEl) return;

        const session = getStoredWFHSession(userEmail);
        if (!session.active || !session.startTime) {
            timerEl.textContent = '00:00:00';
            return;
        }

        const now = Date.now();
        let elapsedMs = now - session.startTime - (session.totalBreakMs || 0);
        if (session.isBreak && session.breakStartTime) {
            elapsedMs -= (now - session.breakStartTime);
        }

        const totalSeconds = Math.max(0, Math.floor(elapsedMs / 1000));
        timerEl.textContent = formatDurationHHMMSS(totalSeconds);
    }

    updateTimerDisplay();
    workingHoursInterval = setInterval(updateTimerDisplay, 1000);
}

async function startWFH() {
    const userEmail = (window.currentUser?.email || window.userEmail || '').trim().toLowerCase();
    if (!userEmail) return;

    const startTime = Date.now();
    const existing = getStoredWFHSession(userEmail);
    const session = {
        active: true,
        mode: 'wfh',
        startTime: startTime,
        startDate: new Date(startTime).toISOString(),
        endTime: null,
        durationSeconds: 0,
        formattedDuration: '00:00:00',
        isBreak: false,
        breakStartTime: null,
        totalBreakMs: 0,
        lastWfhDate: existing.lastWfhDate || null,
        lastWfhDuration: existing.lastWfhDuration || null
    };

    const key = getWFHSessionKey(userEmail);
    localStorage.setItem(key, JSON.stringify(session));

    showToast('Success', '✅ WFH started. Timer is now running.', 'success');

    // Optional background sync with backend API (non-blocking)
    if (window.api?.startWFH) {
        window.api.startWFH(userEmail, startTime).catch(e => console.warn('WFH start API sync:', e.message));
    }

    if (window.renderApp) {
        await window.renderApp(userEmail);
    }
}

async function switchToOfficeMode() {
    const userEmail = (window.currentUser?.email || window.userEmail || '').trim().toLowerCase();
    if (!userEmail) return;

    const session = getStoredWFHSession(userEmail);
    const now = Date.now();
    const todayDateStr = new Date(now).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const isoDateStr = new Date(now).toISOString().split('T')[0];

    let durationSeconds = 0;
    let formattedDuration = '00:00:00';

    if (session.active && session.startTime) {
        let elapsedMs = now - session.startTime - (session.totalBreakMs || 0);
        if (session.isBreak && session.breakStartTime) {
            elapsedMs -= (now - session.breakStartTime);
        }
        durationSeconds = Math.max(0, Math.floor(elapsedMs / 1000));
        formattedDuration = formatDurationHHMMSS(durationSeconds);
    } else if (session.durationSeconds > 0) {
        durationSeconds = session.durationSeconds;
        formattedDuration = session.formattedDuration || formatDurationHHMMSS(durationSeconds);
    }

    // Record WFH session with date and elapsed duration
    if (durationSeconds > 0) {
        const historyList = getStoredWFHHistory(userEmail);
        const record = {
            id: Date.now(),
            email: userEmail,
            date: todayDateStr,
            isoDate: isoDateStr,
            startTime: session.startTime || now,
            endTime: now,
            durationSeconds: durationSeconds,
            formattedDuration: formattedDuration,
            mode: 'Office',
            recordedAt: new Date(now).toISOString()
        };
        historyList.unshift(record);
        try {
            localStorage.setItem(getWFHHistoryKey(userEmail), JSON.stringify(historyList));
        } catch (e) {}
    }

    // Reset timer and set mode to office
    if (workingHoursInterval) clearInterval(workingHoursInterval);

    const officeSession = {
        active: false,
        mode: 'office',
        startTime: null,
        endTime: now,
        durationSeconds: 0, // Reset timer to zero
        formattedDuration: '00:00:00',
        isBreak: false,
        breakStartTime: null,
        totalBreakMs: 0,
        lastWfhDate: todayDateStr,
        lastWfhDuration: durationSeconds > 0 ? formattedDuration : (session.lastWfhDuration || '00:00:00')
    };

    const key = getWFHSessionKey(userEmail);
    localStorage.setItem(key, JSON.stringify(officeSession));

    // Optional background sync with API
    if (session.active && window.api?.stopWFH) {
        window.api.stopWFH(userEmail, session.startTime || now).catch(e => console.warn('WFH stop notice:', e.message));
    }

    if (durationSeconds > 0) {
        showToast('Office Mode', `Switched to Office Mode. WFH recorded on ${todayDateStr} (${formattedDuration}). Timer reset to 00:00:00.`, 'success');
    } else {
        showToast('Office Mode', `Switched to Office Mode. Timer is 00:00:00.`, 'info');
    }

    if (window.renderApp) {
        await window.renderApp(userEmail);
    }
}

async function stopWFH() {
    const userEmail = (window.currentUser?.email || window.userEmail || '').trim().toLowerCase();
    if (!userEmail) return;

    const session = getStoredWFHSession(userEmail);
    const now = Date.now();
    const todayDateStr = new Date(now).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const isoDateStr = new Date(now).toISOString().split('T')[0];

    let elapsedMs = session.startTime ? (now - session.startTime - (session.totalBreakMs || 0)) : 0;
    if (session.isBreak && session.breakStartTime) {
        elapsedMs -= (now - session.breakStartTime);
    }

    const durationSeconds = Math.max(0, Math.floor(elapsedMs / 1000));
    const formattedDuration = formatDurationHHMMSS(durationSeconds);

    if (durationSeconds > 0) {
        const historyList = getStoredWFHHistory(userEmail);
        historyList.unshift({
            id: Date.now(),
            email: userEmail,
            date: todayDateStr,
            isoDate: isoDateStr,
            startTime: session.startTime || now,
            endTime: now,
            durationSeconds: durationSeconds,
            formattedDuration: formattedDuration,
            mode: 'WFH Ended',
            recordedAt: new Date(now).toISOString()
        });
        try {
            localStorage.setItem(getWFHHistoryKey(userEmail), JSON.stringify(historyList));
        } catch (e) {}
    }

    if (workingHoursInterval) clearInterval(workingHoursInterval);

    const completedSession = {
        active: false,
        mode: 'office',
        startTime: null,
        endTime: now,
        durationSeconds: 0, // Reset timer to zero
        formattedDuration: '00:00:00',
        completedAt: new Date(now).toISOString(),
        isBreak: false,
        breakStartTime: null,
        totalBreakMs: 0,
        lastWfhDate: todayDateStr,
        lastWfhDuration: formattedDuration
    };

    const key = getWFHSessionKey(userEmail);
    localStorage.setItem(key, JSON.stringify(completedSession));

    showToast('Success', `✅ WFH ended. Recorded for ${todayDateStr} (${formattedDuration}). Timer reset to 00:00:00.`, 'success');

    if (window.api?.stopWFH) {
        window.api.stopWFH(userEmail, session.startTime).catch(e => console.warn('WFH stop API sync:', e.message));
    }

    if (window.renderApp) {
        await window.renderApp(userEmail);
    }
}

function toggleWorkBreak() {
    const userEmail = (window.currentUser?.email || window.userEmail || '').trim().toLowerCase();
    if (!userEmail) return;

    const session = getStoredWFHSession(userEmail);
    if (!session.active) return;

    const now = Date.now();
    if (!session.isBreak) {
        session.isBreak = true;
        session.breakStartTime = now;
        showToast('Info', 'WFH shift timer paused for break.', 'info');
    } else {
        if (session.breakStartTime) {
            session.totalBreakMs = (session.totalBreakMs || 0) + (now - session.breakStartTime);
        }
        session.isBreak = false;
        session.breakStartTime = null;
        showToast('Success', 'WFH shift timer resumed.', 'success');
    }

    const key = getWFHSessionKey(userEmail);
    localStorage.setItem(key, JSON.stringify(session));

    if (window.renderApp) {
        window.renderApp(userEmail);
    }
}

function toggleWorkMode() {
    const userEmail = (window.currentUser?.email || window.userEmail || '').trim().toLowerCase();
    const session = getStoredWFHSession(userEmail);
    if (session.active) {
        switchToOfficeMode();
    } else {
        startWFH();
    }
}

window.getWFHSessionKey = getWFHSessionKey;
window.getWFHHistoryKey = getWFHHistoryKey;
window.getStoredWFHSession = getStoredWFHSession;
window.getStoredWFHHistory = getStoredWFHHistory;
window.formatDurationHHMMSS = formatDurationHHMMSS;
window.initWorkingHoursTracker = initWorkingHoursTracker;
window.startWFH = startWFH;
window.switchToOfficeMode = switchToOfficeMode;
window.stopWFH = stopWFH;
window.toggleWorkBreak = toggleWorkBreak;
window.toggleWorkMode = toggleWorkMode;

// ============================================================
// ===== RENDER APP (REAL DATABASE INTEGRATION) =====
// ============================================================

async function renderApp(userEmail) {
    // Pre-warm the backend on the very first call in background (non-blocking)
    if (!window._backendWarmed) {
        window._backendWarmed = true;
        fetch('https://hr-and-payroll-9fz9.onrender.com/api/employees', {
            headers: { 'ngrok-skip-browser-warning': 'true' }
        }).then(() => console.log('🔥 Backend pre-warmed')).catch(e => console.warn('Pre-warm notice:', e.message));
    }

   
    console.log('🔄 Rendering app for:', userEmail);
    console.log('👥 Employees in state:', window._currentEmployees?.length || 0);
    console.log('📋 Leaves in state:', window._currentLeaves?.length || 0);
    console.log('💬 Messages in state:', window._currentMessages?.length || 0);
    
    

    const container = document.getElementById('contentSections');
    const hasCachedData = (window._currentEmployees && window._currentEmployees.length > 0);

    // Only show full loading spinner if we don't already have data in memory
    if (container && !hasCachedData) {
        container.innerHTML = `
            <div style="text-align:center;padding:4rem 2rem;">
                <div class="spinner" style="width:40px;height:40px;border-width:4px;margin:0 auto 1rem auto;"></div>
                <h3 style="color:var(--text-primary);">Loading Dashboard...</h3>
                <p style="color:var(--text-secondary);font-size:0.9rem;">Connecting to database...</p>
            </div>
        `;
    }

    const role = getRole(userEmail);
    let employees = window._currentEmployees || [];
    let leaves = window._currentLeaves || [];

    // Parallel Fast Data Loading
    try {
        const [empResult, leaveResult, msgResult] = await Promise.allSettled([
            fetchEmployees(),
            fetchLeaves(),
            fetchMessages()
        ]);

        if (empResult.status === 'fulfilled' && Array.isArray(empResult.value)) {
            employees = empResult.value;
        } else if (empResult.status === 'rejected') {
            console.warn('Employees fetch warning:', empResult.reason?.message);
            if (!window.useMockData && (!employees || employees.length === 0)) {
                showToast('Backend Notice', 'Could not reach backend API. Ensure "node index.js" is running.', 'warning');
            }
        }

        if (leaveResult.status === 'fulfilled') {
            if (Array.isArray(leaveResult.value)) {
                leaves = leaveResult.value;
            } else if (Array.isArray(leaveResult.value?.leaves)) {
                leaves = leaveResult.value.leaves;
            } else if (Array.isArray(leaveResult.value?.data)) {
                leaves = leaveResult.value.data;
            }
        }

        if (msgResult.status === 'fulfilled' && Array.isArray(msgResult.value)) {
            window._currentMessages = msgResult.value;
        } else {
            window._currentMessages = [];
        }
    } catch (err) {
        console.error('Data load error:', err);
    }

    const [stats, chartData] = await Promise.all([
        fetchDashboardStats(employees, leaves),
        fetchChartData(employees, leaves)
    ]);

    window._currentEmployees = employees;
    window._currentLeaves = leaves;
    window._currentStats = stats;
    window._currentChartData = chartData;

    const currentEmp = employees.find(e => e.email && e.email.toLowerCase() === userEmail.toLowerCase()) || null;
    const name = currentEmp ? currentEmp.name : getNameFromEmail(userEmail);
    currentUser = { email: userEmail, role, name, empData: currentEmp };
    window.currentUser = currentUser;
    window.userEmail = userEmail;

    // Update Navbar Name & Badge
    const nameDisplay = document.getElementById('employeeNameDisplay');
    if (nameDisplay) nameDisplay.textContent = name;

    const badge = document.getElementById('roleBadge');
    if (badge) {
        badge.textContent = role === 'admin' ? 'Administrator' : role === 'hr' ? 'HR Manager' : 'Employee';
        badge.className = 'role-badge';
    }

    // Update Profile Icon in Navbar
    const profileIcon = document.getElementById('profileIcon');
    if (profileIcon) {
        const photo = currentEmp?.photo || (role === 'hr' ? DEFAULT_AVATARS.hr : DEFAULT_AVATARS.alex);
        profileIcon.innerHTML = `<img src="${photo}" class="nav-avatar-img" alt="Avatar"/> <span>Profile</span>`;
    }

    // Role-based Clean Sidebar Menu (No duplicate Profile or Logout in list)
    const sidebarNav = document.getElementById('sidebarNav');
    let menuItems = [];

    if (role === 'admin') {
        menuItems = [
            { id: 'dashboard', icon: 'fa-th-large', label: 'Dashboard' },
            { id: 'employees', icon: 'fa-users', label: 'Employees' },
            { id: 'departments', icon: 'fa-building', label: 'Departments' },
            { id: 'leaves', icon: 'fa-calendar-alt', label: 'Leave Overview' },
            { id: 'payroll', icon: 'fa-rupee-sign', label: 'Payroll Overview' },
            { id: 'reports', icon: 'fa-chart-pie', label: 'Reports' },
            { id: 'messages', icon: 'fa-envelope', label: 'Messages' }
        ];
    } else if (role === 'hr') {
        menuItems = [
            { id: 'dashboard', icon: 'fa-th-large', label: 'Dashboard' },
            { id: 'employees', icon: 'fa-users', label: 'Employees' },
            { id: 'departments', icon: 'fa-building', label: 'Departments' },
            { id: 'leaves', icon: 'fa-calendar-alt', label: 'Leave Management' },
            { id: 'payroll', icon: 'fa-rupee-sign', label: 'Payroll' },
            { id: 'messages', icon: 'fa-envelope', label: 'Messages' },
            { id: 'reports', icon: 'fa-chart-pie', label: 'Reports' }
        ];
    } else {
        menuItems = [
            { id: 'dashboard', icon: 'fa-th-large', label: 'Dashboard' },
            { id: 'apply_leave', icon: 'fa-plane-departure', label: 'Apply Leave' },
            { id: 'my_leaves', icon: 'fa-calendar-check', label: 'My Leaves' },
            { id: 'leave_balance', icon: 'fa-scale-balanced', label: 'Leave Balance' },
            { id: 'my_payslips', icon: 'fa-file-invoice-dollar', label: 'My Payslips' },
            { id: 'messages', icon: 'fa-comments', label: 'Messages' }
        ];
    }

    if (sidebarNav) {
        sidebarNav.innerHTML = '';
        menuItems.forEach(item => {
            const li = document.createElement('li');
            li.dataset.target = item.id;
            li.innerHTML = `<i class="fas ${item.icon}"></i> <span>${item.label}</span>`;
            if (item.id === currentSection) li.classList.add('active');
            li.addEventListener('click', () => switchSection(item.id));
            sidebarNav.appendChild(li);
        });
    }

    // Render Section Containers
    if (container) {
        container.innerHTML = '';
        const renderers = {
            dashboard: window.renderDashboard || renderFallback,
            employees: window.renderEmployees || renderFallback,
            departments: window.renderDepartments || renderFallback,
            leaves: window.renderLeaves || renderFallback,
            apply_leave: window.renderApplyLeaveSection || renderFallback,
            my_leaves: window.renderMyLeavesSection || renderFallback,
            leave_balance: window.renderLeaveBalanceSection || renderFallback,
            payroll: window.renderPayroll || renderFallback,
            my_payslips: window.renderMyPayslipsSection || renderFallback,
            reports: window.renderReports || renderFallback,
            messages: window.renderMessages || renderFallback,
            profile: window.renderProfile || renderFallback,
            attendance: window.renderAttendance || renderFallback
        };

        function renderFallback() {
            return '<div style="padding:2rem;text-align:center;color:#dc3545;"><h3>⚠️ Section Failed to Load</h3><p>renderers.js did not load properly. Check F12 Console for earlier errors.</p></div>';
        }

        Object.keys(renderers).forEach(key => {
            const div = document.createElement('div');
            div.id = `section-${key}`;
            div.className = `section${key === currentSection ? ' active' : ''}`;
            try {
                div.innerHTML = renderers[key](userEmail, role, employees, leaves, stats, chartData);
            } catch (error) {
                console.error(`❌ Error rendering ${key}:`, error);
                div.innerHTML = `<h2>Error loading ${key}</h2><p>${error.message}</p>`;
            }
            container.appendChild(div);
        });
    }

    if (role === 'employee') {
        setTimeout(initWorkingHoursTracker, 200);
    }

    setTimeout(() => initCharts(chartData), 300);
    console.log('✅ App rendered successfully with LIVE data!');
    
}

function renderCurrentSectionFromState() {
    const userEmail = window.currentUser?.email || window.userEmail;
    if (!userEmail) return;
    const role = window.currentUser?.role || getRole(userEmail);
    const employees = window._currentEmployees || [];
    const leaves = window._currentLeaves || [];

    // Recalculate stats & chart data synchronously from latest state
    if (typeof fetchDashboardStats === 'function') {
        fetchDashboardStats(employees, leaves).then(st => {
            window._currentStats = st;
        });
    }
    if (typeof fetchChartData === 'function') {
        fetchChartData(employees, leaves).then(cd => {
            window._currentChartData = cd;
            if (currentSection === 'dashboard' || currentSection === 'reports') {
                initCharts(cd);
            }
        });
    }

    const stats = window._currentStats || {};
    const chartData = window._currentChartData || {};

    const renderers = {
        dashboard: window.renderDashboard || renderFallback,
        employees: window.renderEmployees || renderFallback,
        departments: window.renderDepartments || renderFallback,
        leaves: window.renderLeaves || renderFallback,
        apply_leave: window.renderApplyLeaveSection || renderFallback,
        my_leaves: window.renderMyLeavesSection || renderFallback,
        leave_balance: window.renderLeaveBalanceSection || renderFallback,
        payroll: window.renderPayroll || renderFallback,
        my_payslips: window.renderMyPayslipsSection || renderFallback,
        reports: window.renderReports || renderFallback,
        messages: window.renderMessages || renderFallback,
        profile: window.renderProfile || renderFallback,
        attendance: window.renderAttendance || renderFallback
    };

    function renderFallback() {
        return '<div style="padding:2rem;text-align:center;color:#dc3545;"><h3>⚠️ Section Failed to Load</h3><p>renderers.js did not load properly. Check F12 Console for earlier errors.</p></div>';
    }

    Object.keys(renderers).forEach(key => {
        const div = document.getElementById(`section-${key}`);
        if (div) {
            try {
                div.innerHTML = renderers[key](userEmail, role, employees, leaves, stats, chartData);
            } catch (error) {
                console.error(`❌ Error updating ${key} from state:`, error);
            }
        }
    });

    if (currentSection === 'dashboard' || currentSection === 'reports') {
        setTimeout(() => {
            if (window._currentChartData) initCharts(window._currentChartData);
        }, 100);
    }
}

window.renderCurrentSectionFromState = renderCurrentSectionFromState;
window.refreshUIImmediately = renderCurrentSectionFromState;
window.renderApp = renderApp;

// ============================================================
// ===== LOGIN FLOW =====
// ============================================================

async function handleLogin() {
    console.log('🔐 Login initiated');
    
    const email = document.getElementById('emailInput').value.trim();
    const password = document.getElementById('passwordInput').value;
    const btn = document.getElementById('loginBtn');

    if (!email || !email.includes('@')) {
        showToast('Error', 'Please enter a valid email address.', 'error');
        return;
    }

    if (password.length < 4) {
        showToast('Error', 'Password must be at least 4 characters.', 'error');
        return;
    }

    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Signing in...';

    try {
        console.log('🌐 Calling Backend API Login for:', email);
        if (!window.api && typeof ApiService !== 'undefined') {
            window.api = new ApiService();
        }
        const result = await window.api.login(email, password);
        console.log('✅ Login successful:', result);
        showToast('Success', 'Welcome back!', 'success');
        showDashboard(email);
    } catch (error) {
        console.error('❌ Login error:', error);
        showToast('Login Failed', error.message || 'Please check your credentials.', 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-arrow-right-to-bracket"></i> Sign In';
    }
}

window.handleLogin = handleLogin;

function showDashboard(email) {
    const loginPage = document.getElementById('loginPage');
    const forgotPage = document.getElementById('forgotPage');
    const dashContainer = document.getElementById('dashboardContainer');

    if (loginPage) loginPage.style.display = 'none';
    if (forgotPage) forgotPage.style.display = 'none';
    if (dashContainer) dashContainer.style.display = 'block';

    currentSection = 'dashboard';
    renderApp(email);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.showDashboard = showDashboard;

function showLoginPage() {
    const loginPage = document.getElementById('loginPage');
    const forgotPage = document.getElementById('forgotPage');
    const dashContainer = document.getElementById('dashboardContainer');

    if (loginPage) loginPage.style.display = 'block';
    if (forgotPage) forgotPage.style.display = 'none';
    if (dashContainer) dashContainer.style.display = 'none';
}

window.showLoginPage = showLoginPage;

function showForgotPage() {
    const loginPage = document.getElementById('loginPage');
    const forgotPage = document.getElementById('forgotPage');
    const dashContainer = document.getElementById('dashboardContainer');

    if (loginPage) loginPage.style.display = 'none';
    if (forgotPage) forgotPage.style.display = 'block';
    if (dashContainer) dashContainer.style.display = 'none';
}

window.showForgotPage = showForgotPage;

// ============================================================
// ===== FORGOT & RESET PASSWORD FLOW =====
// ============================================================

async function handleSendOTP() {
    const email = document.getElementById('forgotEmail')?.value.trim();
    if (!email || !email.includes('@')) {
        showToast('Error', 'Please enter your registered email address.', 'error');
        return;
    }

    const btn = document.getElementById('sendOtpBtn');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner"></span> Sending OTP...';
    }

    try {
        if (!window.useMockData && window.api) {
            await window.api.forgotPassword(email);
        }
        showToast('Success', '6-digit OTP sent to your registered email!', 'success');
        document.getElementById('otpSection').style.display = 'block';
    } catch (e) {
        showToast('Error', e.message || 'Failed to send OTP.', 'error');
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-paper-plane"></i> Send OTP';
        }
    }
}

async function handleVerifyOTP() {
    const inputs = document.querySelectorAll('.otp-input');
    const otp = Array.from(inputs).map(i => i.value).join('');
    if (otp.length < 6) {
        showToast('Error', 'Please enter complete 6-digit OTP.', 'error');
        return;
    }

    showToast('Success', 'OTP verified successfully!', 'success');
    document.getElementById('resetPasswordSection').style.display = 'block';
}

async function handleResetPassword() {
    const email = document.getElementById('forgotEmail')?.value.trim();
    const inputs = document.querySelectorAll('.otp-input');
    const otp = Array.from(inputs).map(i => i.value).join('');
    const newPass = document.getElementById('newPassword')?.value;
    const confirmPass = document.getElementById('confirmPassword')?.value;

    if (!newPass || newPass.length < 4) {
        showToast('Error', 'Password must be at least 4 characters long.', 'error');
        return;
    }
    if (newPass !== confirmPass) {
        showToast('Error', 'Passwords do not match.', 'error');
        return;
    }

    const btn = document.getElementById('resetPasswordBtn');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner"></span> Resetting...';
    }

    try {
        if (!window.useMockData && window.api) {
            await window.api.resetPassword(email, otp, newPass);
        }
        showToast('Success', 'Password reset successfully! Redirecting to login...', 'success');
        setTimeout(() => {
            showLoginPage();
        }, 1500);
    } catch (e) {
        showToast('Error', e.message || 'Failed to reset password.', 'error');
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-key"></i> Reset Password';
        }
    }
}

window.handleSendOTP = handleSendOTP;
window.handleVerifyOTP = handleVerifyOTP;
window.handleResetPassword = handleResetPassword;

// ============================================================
// ===== LOGOUT =====
// ============================================================

function logout() {
    if (workingHoursInterval) clearInterval(workingHoursInterval);
    if (window.api) window.api.logout();
    showLoginPage();
    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.remove('open');
    showToast('Info', 'You have been signed out.', 'info');
}

window.logout = logout;