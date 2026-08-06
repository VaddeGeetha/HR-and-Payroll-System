// ============================================================
// ===== GLOBAL API INSTANCE =====
// ============================================================

const api = new ApiService();
window.api = api;

// ============================================================
// ===== APPLICATION STATE =====
// ============================================================

let currentUser = null;
let currentSection = 'dashboard';
let chartInstances = {};

// ============================================================
// ===== TOAST SYSTEM =====
// ============================================================

function showToast(title, message, type = 'info') {
    const container = document.getElementById('toastContainer');
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
// ===== RENDER ENGINE =====
// ============================================================

async function renderApp(userEmail) {
    console.log('🔄 Rendering app for:', userEmail);
    
    const role = getRole(userEmail);
    const name = getNameFromEmail(userEmail);
    currentUser = { email: userEmail, role, name };

    const employees = await fetchEmployees();
    const leaves = await fetchLeaves();
    const stats = await fetchDashboardStats();
    const chartData = await fetchChartData();

    document.getElementById('employeeNameDisplay').textContent = name;

    const badge = document.getElementById('roleBadge');
    badge.textContent = role === 'hr' ? 'HR Administrator' : 'Employee';
    badge.className = 'role-badge';

    const sidebarNav = document.getElementById('sidebarNav');
    const menuItems = role === 'hr' ? [
        { id: 'dashboard', icon: 'fa-th-large', label: 'Dashboard' },
        { id: 'employees', icon: 'fa-users', label: 'Employees' },
        { id: 'leaves', icon: 'fa-umbrella-beach', label: 'Leave Requests' },
        { id: 'messages', icon: 'fa-envelope', label: 'Messages' },
        { id: 'profile', icon: 'fa-id-badge', label: 'Profile' },
    ] : [
        { id: 'dashboard', icon: 'fa-th-large', label: 'Dashboard' },
        { id: 'messages', icon: 'fa-envelope', label: 'Messages' },
        { id: 'profile', icon: 'fa-id-badge', label: 'Profile' },
    ];

    sidebarNav.innerHTML = '';
    menuItems.forEach(item => {
        const li = document.createElement('li');
        li.dataset.target = item.id;
        li.innerHTML = `<i class="fas ${item.icon}"></i> ${item.label}`;
        if (item.id === currentSection) li.classList.add('active');
        li.addEventListener('click', () => switchSection(item.id));
        sidebarNav.appendChild(li);
    });

    const container = document.getElementById('contentSections');
    container.innerHTML = '';

    const renderers = {
        dashboard: renderDashboard,
        employees: renderEmployees,
        leaves: renderLeaveRequests,
        messages: renderMessages,
        profile: renderProfile,
        attendance: renderAttendance,
        payroll: renderPayroll,
    };

    Object.keys(renderers).forEach(key => {
        const div = document.createElement('div');
        div.id = `section-${key}`;
        div.className = `section${key === currentSection ? ' active' : ''}`;
        div.innerHTML = renderers[key](userEmail, role, employees, leaves, stats, chartData);
        container.appendChild(div);
    });

    setTimeout(() => initCharts(chartData), 300);
    console.log('✅ App rendered successfully');
}

// ============================================================
// ===== CHARTS =====
// ============================================================

function initCharts(chartData) {
    Object.keys(chartInstances).forEach(key => {
        if (chartInstances[key]) chartInstances[key].destroy();
    });
    chartInstances = {};

    const barCtx = document.getElementById('barChart');
    const pieCtx = document.getElementById('pieChart');

    if (barCtx) {
        const deptData = chartData.departments || ['Engineering', 'Product', 'Design', 'HR'];
        const counts = chartData.departmentCounts || [12, 8, 6, 4];

        chartInstances.bar = new Chart(barCtx, {
            type: 'bar',
            data: {
                labels: deptData,
                datasets: [{
                    label: 'Employees by Department',
                    data: counts,
                    backgroundColor: ['#1a6dff', '#22a65e', '#f0ad4e', '#dc3545', '#6f42c1'],
                    borderRadius: 6,
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } } }
            }
        });
    }

    if (pieCtx) {
        const attData = chartData.attendance || { present: 18, leave: 5, wfh: 3, absent: 2 };

        chartInstances.pie = new Chart(pieCtx, {
            type: 'doughnut',
            data: {
                labels: ['Present', 'Leave', 'WFH', 'Absent'],
                datasets: [{
                    data: [attData.present, attData.leave, attData.wfh, attData.absent],
                    backgroundColor: ['#22a65e', '#f0ad4e', '#1a6dff', '#dc3545'],
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { position: 'bottom' } }
            }
        });
    }
}

// ============================================================
// ===== NAVIGATION =====
// ============================================================

function switchSection(id) {
    currentSection = id;
    document.querySelectorAll('.sidebar-nav li').forEach(li =>
        li.classList.toggle('active', li.dataset.target === id)
    );
    document.querySelectorAll('.section').forEach(s =>
        s.classList.toggle('active', s.id === `section-${id}`)
    );
    document.getElementById('sidebar').classList.remove('open');
}

// ============================================================
// ===== LOGIN LOGIC =====
// ============================================================

async function handleLogin() {
    const email = document.getElementById('emailInput').value.trim();
    const password = document.getElementById('passwordInput').value;
    const btn = document.getElementById('loginBtn');

    if (!email || !email.includes('@')) {
        showToast('Error', 'Please enter a valid email.', 'error');
        return;
    }

    if (password.length < 4) {
        showToast('Error', 'Password must be at least 4 characters.', 'error');
        return;
    }

    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Logging in...';

    try {
        if (useMockData) {
            const mockToken = 'mock_jwt_token_' + Date.now();
            localStorage.setItem('token', mockToken);
            localStorage.setItem('user', JSON.stringify({ 
                email, 
                role: getRole(email), 
                name: getNameFromEmail(email) 
            }));
            showDashboard(email);
            showToast('Success', 'Welcome back!', 'success');
            return;
        }

        const result = await api.login(email, password);
        showToast('Success', 'Welcome back!', 'success');
        showDashboard(email);
    } catch (error) {
        showToast('Error', error.message || 'Login failed', 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-arrow-right-to-bracket"></i> Sign In';
    }
}

function showDashboard(email) {
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('forgotPage').style.display = 'none';
    document.getElementById('dashboardContainer').style.display = 'block';
    renderApp(email);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function logout() {
    api.logout();
    document.getElementById('dashboardContainer').style.display = 'none';
    document.getElementById('loginPage').style.display = 'block';
    document.getElementById('sidebar').classList.remove('open');
    showToast('Info', 'You have been signed out.', 'info');
}

// ============================================================
// ===== FORGOT PASSWORD =====
// ============================================================

let otpGenerated = null;

function showForgotPage() {
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('forgotPage').style.display = 'block';
}

function showLoginPage() {
    document.getElementById('loginPage').style.display = 'block';
    document.getElementById('forgotPage').style.display = 'none';
    document.getElementById('otpSection').style.display = 'none';
    document.getElementById('resetPasswordSection').style.display = 'none';
    document.getElementById('sendOtpBtn').style.display = 'block';
    document.getElementById('sendOtpBtn').innerHTML = '<i class="fas fa-paper-plane"></i> Send OTP';
    otpGenerated = null;
}

// ============================================================
// ===== EXPOSE FUNCTIONS GLOBALLY =====
// ============================================================

window.renderApp = renderApp;
window.initCharts = initCharts;
window.switchSection = switchSection;
window.handleLogin = handleLogin;
window.showDashboard = showDashboard;
window.logout = logout;
window.showForgotPage = showForgotPage;
window.showLoginPage = showLoginPage;
window.showToast = showToast;

console.log('✅ Dashboard module loaded');