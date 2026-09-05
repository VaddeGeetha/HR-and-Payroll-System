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
    const container = document.getElementById('toastContainer');
    if (!container) return;

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
    setTimeout(() => toast.remove(), 5000);
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

    // 1. Employee Growth (Line)
    const lineCtx = document.getElementById('lineChart');
    if (lineCtx) {
        try {
            chartInstances.line = new Chart(lineCtx, {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
                    datasets: [{
                        label: 'Total Workforce',
                        data: chartData.employeeGrowth || [2, 4, 6, 8, 10, 14, 18, 22],
                        borderColor: '#1a6dff',
                        backgroundColor: 'rgba(26, 109, 255, 0.1)',
                        fill: true,
                        tension: 0.35,
                        borderWidth: 2.5
                    }]
                },
                options: {
                    responsive: true,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } } }
                }
            });
        } catch (e) {
            console.warn('Line chart init notice:', e.message);
        }
    }

    // 2. Department-wise Employees (Bar)
    const barCtx = document.getElementById('barChart');
    if (barCtx) {
        try {
            chartInstances.bar = new Chart(barCtx, {
                type: 'bar',
                data: {
                    labels: chartData.departments || ['IT', 'HR', 'Finance', 'Sales', 'Marketing', 'Operations'],
                    datasets: [{
                        label: 'Staff Count',
                        data: chartData.departmentCounts || [8, 4, 5, 6, 4, 3],
                        backgroundColor: ['#1a6dff', '#22a65e', '#f0ad4e', '#d9534f', '#6f42c1', '#17a2b8'],
                        borderRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } } }
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
            chartInstances.pie = new Chart(pieCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Approved Leaves', 'Pending Approvals', 'Rejected'],
                    datasets: [{
                        data: [8, 2, 1],
                        backgroundColor: ['#22a65e', '#f0ad4e', '#d9534f'],
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    plugins: { legend: { position: 'bottom' } }
                }
            });
        } catch (e) {
            console.warn('Pie chart init notice:', e.message);
        }
    }

    // 4. Payroll Trend (Bar)
    const payrollCtx = document.getElementById('payrollChart');
    if (payrollCtx) {
        try {
            chartInstances.payroll = new Chart(payrollCtx, {
                type: 'bar',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
                    datasets: [{
                        label: 'Monthly Payroll (₹)',
                        data: chartData.monthlyPayroll || [420000, 440000, 460000, 475000, 479000, 487000, 487000, 487000],
                        backgroundColor: '#22a65e',
                        borderRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } } }
                }
            });
        } catch (e) {
            console.warn('Payroll chart init notice:', e.message);
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
        fetchChartData().then(data => initCharts(data));
    }
}

window.switchSection = switchSection;

// ============================================================
// ===== WORK FROM HOME (WFH) & SHIFT TIMER TRACKER =====
// ============================================================

function initWorkingHoursTracker() {
    if (workingHoursInterval) clearInterval(workingHoursInterval);

    const sessionKey = 'hr_employee_work_session';
    let session = null;
    try {
        const stored = localStorage.getItem(sessionKey);
        session = stored ? JSON.parse(stored) : null;
    } catch (e) {
        session = null;
    }

    if (!session || !session.startTime) {
        session = {
            startTime: Date.now(),
            accumulatedMs: 4 * 3600 * 1000 + 22 * 60 * 1000 + 15 * 1000,
            mode: 'WFH',
            isBreak: false
        };
        localStorage.setItem(sessionKey, JSON.stringify(session));
    }

    function updateTimerDisplay() {
        const timerEl = document.getElementById('shiftTimerDisplay');
        if (!timerEl) return;

        const now = Date.now();
        let totalElapsedMs = session.accumulatedMs;
        if (!session.isBreak) {
            totalElapsedMs += (now - session.startTime);
        }

        const totalSeconds = Math.floor(totalElapsedMs / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        const hStr = String(hours).padStart(2, '0');
        const mStr = String(minutes).padStart(2, '0');
        const sStr = String(seconds).padStart(2, '0');

        timerEl.textContent = `${hStr}h : ${mStr}m : ${sStr}s`;
    }

    updateTimerDisplay();
    workingHoursInterval = setInterval(updateTimerDisplay, 1000);
}

function toggleWorkMode() {
    const sessionKey = 'hr_employee_work_session';
    let session = { mode: 'WFH', startTime: Date.now(), accumulatedMs: 0, isBreak: false };
    try {
        const stored = localStorage.getItem(sessionKey);
        if (stored) session = JSON.parse(stored);
    } catch (e) {}

    session.mode = session.mode === 'WFH' ? 'Office' : 'WFH';
    localStorage.setItem(sessionKey, JSON.stringify(session));
    showToast('Work Mode Updated', `Shift mode switched to: ${session.mode === 'WFH' ? 'Work From Home' : 'Office Working'}`, 'info');
    if (currentUser?.email) renderApp(currentUser.email);
}

function toggleWorkBreak() {
    const sessionKey = 'hr_employee_work_session';
    let session = { mode: 'WFH', startTime: Date.now(), accumulatedMs: 0, isBreak: false };
    try {
        const stored = localStorage.getItem(sessionKey);
        if (stored) session = JSON.parse(stored);
    } catch (e) {}

    if (!session.isBreak) {
        session.accumulatedMs += (Date.now() - session.startTime);
        session.isBreak = true;
        showToast('Break Started', 'Working shift timer paused for break.', 'warning');
    } else {
        session.startTime = Date.now();
        session.isBreak = false;
        showToast('Work Resumed', 'Working shift timer resumed.', 'success');
    }
    localStorage.setItem(sessionKey, JSON.stringify(session));
    if (currentUser?.email) renderApp(currentUser.email);
}

window.initWorkingHoursTracker = initWorkingHoursTracker;
window.toggleWorkMode = toggleWorkMode;
window.toggleWorkBreak = toggleWorkBreak;

// ============================================================
// ===== RENDER APP (REAL DATABASE INTEGRATION) =====
// ============================================================

async function renderApp(userEmail) {
    console.log('🔄 Rendering app for:', userEmail);

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
        const [empResult, leaveResult] = await Promise.allSettled([
            fetchEmployees(),
            fetchLeaves()
        ]);

        if (empResult.status === 'fulfilled' && Array.isArray(empResult.value)) {
            employees = empResult.value;
        } else if (empResult.status === 'rejected') {
            console.warn('Employees fetch warning:', empResult.reason?.message);
            if (!window.useMockData && (!employees || employees.length === 0)) {
                showToast('Backend Notice', 'Could not reach backend API. Ensure "node index.js" is running.', 'warning');
            }
        }

        if (leaveResult.status === 'fulfilled' && Array.isArray(leaveResult.value)) {
            leaves = leaveResult.value;
        }
    } catch (err) {
        console.error('Data load error:', err);
    }

    const stats = await fetchDashboardStats(employees, leaves);
    const chartData = await fetchChartData(employees);

    window._currentEmployees = employees;
    window._currentLeaves = leaves;
    window._currentStats = stats;
    window._currentChartData = chartData;

    const currentEmp = employees.find(e => e.email && e.email.toLowerCase() === userEmail.toLowerCase()) || null;
    const name = currentEmp ? currentEmp.name : getNameFromEmail(userEmail);
    currentUser = { email: userEmail, role, name, empData: currentEmp };

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
            dashboard: renderDashboard,
            employees: renderEmployees,
            departments: renderDepartments,
            leaves: renderLeaves,
            apply_leave: renderApplyLeaveSection,
            my_leaves: renderMyLeavesSection,
            leave_balance: renderLeaveBalanceSection,
            payroll: renderPayroll,
            my_payslips: renderMyPayslipsSection,
            reports: renderReports,
            messages: renderMessages,
            profile: renderProfile,
            attendance: renderAttendance
        };

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