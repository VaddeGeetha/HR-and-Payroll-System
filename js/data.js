// ============================================================
// ===== DATA LOADERS & BACKEND INTEGRATION LAYER =====
// ============================================================

let useMockData = (window.CONFIG?.USE_MOCK_DATA === true);

function initLocalStorageData() {
    if (!useMockData) {
        localStorage.removeItem('hr_employees');
        localStorage.removeItem('hr_leaves');
        localStorage.removeItem('hr_payslips');
        localStorage.removeItem('hr_departments');
        localStorage.removeItem('hr_notifications');
    }
}
initLocalStorageData();

// ============================================================
// ===== NORMALIZERS (must come BEFORE any usage) =====
// ============================================================

function normalizeEmployee(e) {
    if (!e) return null;
    let ctcDisplay = 'N/A';
    if (typeof e.annual_ctc === 'number' && e.annual_ctc > 0) {
        ctcDisplay = (e.annual_ctc / 100000).toFixed(2) + ' LPA';
    } else if (typeof e.annual_ctc === 'string' && e.annual_ctc.trim()) {
        ctcDisplay = e.annual_ctc;
    } else if (e.monthly_salary) {
        ctcDisplay = ((Number(e.monthly_salary) * 12) / 100000).toFixed(2) + ' LPA';
    }
    return {
        id: e.id,
        user_id: e.user_id,
        name: e.name || 'Unknown',
        email: (e.email || '').toLowerCase(),
        phone: e.phone || '',
        gender: e.gender || 'Male',
        dob: e.dob || '',
        joining_date: e.joining_date || '',
        department: e.department || 'General',
        designation: e.designation || 'Employee',
        role: (e.role || 'employee').toLowerCase(),
        employment_type: e.employment_type || 'Full-Time',
        status: e.status || 'active',
        annual_ctc: ctcDisplay,
        annual_ctc_numeric: e.annual_ctc,
        monthly_salary: Number(e.monthly_salary) || 0,
        photo: e.photo || window.DEFAULT_AVATARS?.male || '',
        aadhaar: e.aadhaar || '',
        pan: e.pan || '',
        passport: e.passport || '',
        address: e.address || '',
        bank_details: {
            bank_name: e.bank_name || e.bank_details?.bank_name || '',
            account_number: e.account_number || e.bank_details?.account_number || ''
        },
        leave_balances: e.leave_balances || null,
        created_at: e.created_at || ''
    };
}

function normalizeLeave(l) {
    if (!l) return null;
    const nestedEmp = l.employees || l.employee_data || l.user || null;
    const empId = l.employee_id || l.user_id || nestedEmp?.id;
    const empName = nestedEmp?.name || l.employee_name || l.user_name || l.employee || l.name || 'Unknown Employee';
    const empEmail = (nestedEmp?.email || l.employee_email || l.email || '').toLowerCase();
    const empDept = nestedEmp?.department || l.department || '';
    const empPhoto = nestedEmp?.photo || l.photo || '';

    const fromDate = l.start_date || l.from_date || l.from || l.startDate || l.date_from || '';
    const toDate = l.end_date || l.to_date || l.to || l.endDate || l.date_to || '';

    let days = l.days || l.total_days || l.day_count || l.number_of_days || l.leave_days;
    if (!days && fromDate && toDate) {
        const d1 = new Date(fromDate), d2 = new Date(toDate);
        if (!isNaN(d1) && !isNaN(d2) && d2 >= d1) {
            let working = 0;
            for (let d = new Date(d1); d <= d2; d.setDate(d.getDate() + 1)) {
                const day = d.getDay();
                if (day !== 0 && day !== 6) working++;
            }
            days = working;
        }
    }

    let comments = [];
    if (Array.isArray(l.comments)) comments = l.comments.slice();
    else if (typeof l.comments === 'string' && l.comments.trim()) comments.push(l.comments);
    if (typeof l.hr_comment === 'string' && l.hr_comment.trim()) comments.push(l.hr_comment);
    if (typeof l.hr_comments === 'string' && l.hr_comments.trim()) comments.push(l.hr_comments);

    return {
        id: l.id || l.leave_id,
        employee_id: empId,
        employee: empName,
        email: empEmail,
        department: empDept,
        photo: empPhoto,
        type: l.leave_type || l.type || l.leaveType || l.category || 'Leave',
        from: fromDate || '—',
        to: toDate || '—',
        days: days || 0,
        reason: l.reason || l.leave_reason || l.description || '—',
        status: (l.status || 'pending').toLowerCase().trim(),
        comments: comments,
        applied_at: l.created_at || l.applied_at || ''
    };
}

function normalizeMessage(m) {
    if (!m) return null;
    const from = (m.from_email || m.fromEmail || m.from || '').toLowerCase();
    const to = (m.to_email || m.toEmail || m.to || '').toLowerCase();
    const ts = Number(m.timestamp) || (m.created_at ? new Date(m.created_at).getTime() : Date.now());
    return {
        ...m,
        id: m.id || Date.now(),
        from_email: from,
        fromEmail: from,
        fromName: m.fromName || m.from_name || '',
        to_email: to,
        toEmail: to,
        toName: m.toName || m.to_name || '',
        senderRole: m.senderRole || m.sender_role || '',
        category: m.category || 'General Inquiry',
        text: m.text || m.message || '',
        timestamp: ts,
        created_at: m.created_at || new Date(ts).toISOString()
    };
}

function normalizePayslip(p) {
    if (!p) return null;
    return {
        id: p.id || p.payslip_id,
        employee_id: p.employee_id || p.user_id,
        employee_name: p.employee_name || p.user_name || p.name || '',
        month: p.month || p.pay_month || '',
        year: p.year || p.pay_year || '',
        gross_earnings: Number(p.gross_earnings || p.gross) || 0,
        total_deductions: Number(p.total_deductions || p.deductions) || 0,
        net_salary: Number(p.net_salary || p.net_pay || p.net) || 0,
        status: (p.status || 'paid').toLowerCase(),
        bank_name: p.bank_name || '',
        bank_account: p.account_number || p.bank_account || ''
    };
}

window.normalizeEmployee = normalizeEmployee;
window.normalizeLeave = normalizeLeave;
window.normalizeMessage = normalizeMessage;
window.normalizePayslip = normalizePayslip;

// ============================================================
// ===== EMPLOYEES =====
// ============================================================

async function fetchEmployees(search = '') {
    if (!useMockData && window.api) {
        try {
            const raw = await window.api.getEmployees(search);
            let list = [];
            if (Array.isArray(raw)) list = raw;
            else if (Array.isArray(raw?.employees)) list = raw.employees;
            else if (Array.isArray(raw?.data)) list = raw.data;
            
            const employees = list.map(normalizeEmployee).filter(Boolean);
            console.log('✅ Loaded', employees.length, 'employees');
            return employees;
        } catch (error) {
            console.error('❌ Failed to fetch employees:', error.message);
            throw error;
        }
    }
    return (MOCK_DATA.employees || []).map(normalizeEmployee).filter(Boolean);
}

function saveEmployeesData(employees) {
    if (useMockData) {
        MOCK_DATA.employees = employees;
        localStorage.setItem('hr_employees', JSON.stringify(employees));
    }
    window.dispatchEvent(new CustomEvent('hr_data_updated', { detail: { type: 'employees' } }));
}

// ============================================================
// ===== LEAVES =====
// ============================================================

async function fetchLeaves() {
    if (!useMockData && window.api) {
        try {
            const raw = await window.api.getLeaves();
            let list = [];
            if (Array.isArray(raw)) list = raw;
            else if (Array.isArray(raw?.leaves)) list = raw.leaves;
            else if (Array.isArray(raw?.data)) list = raw.data;
            
            const normalized = list.map(normalizeLeave).filter(Boolean);
            console.log('✅ Loaded', normalized.length, 'leaves');
            return normalized;
        } catch (error) {
            console.warn('⚠️ Leaves API notice:', error.message);
        }
        return [];
    }
    return (MOCK_DATA.leaveRequests || []).map(normalizeLeave).filter(Boolean);
}

function saveLeavesData(leaves) {
    if (useMockData) {
        MOCK_DATA.leaveRequests = leaves;
        localStorage.setItem('hr_leaves', JSON.stringify(leaves));
    }
    window.dispatchEvent(new CustomEvent('hr_data_updated', { detail: { type: 'leaves' } }));
}

// ============================================================
// ===== MESSAGES =====
// ============================================================

const DEFAULT_SEED_MESSAGES = [
    { id: 101, from_email: 'alex.employee@gmail.com', fromEmail: 'alex.employee@gmail.com', fromName: 'Alex Johnson', to_email: 'hr.hr@gmail.com', toEmail: 'hr.hr@gmail.com', toName: 'Sarah Williams (HR)', senderRole: 'employee', category: 'Leave & Attendance', text: 'Hello Sarah, I wanted to confirm if my recent leave request for next Friday was received by HR.', timestamp: Date.now() - 1000 * 60 * 60 * 3, created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString() },
    { id: 102, from_email: 'hr.hr@gmail.com', fromEmail: 'hr.hr@gmail.com', fromName: 'Sarah Williams', to_email: 'alex.employee@gmail.com', toEmail: 'alex.employee@gmail.com', toName: 'Alex Johnson', senderRole: 'hr', category: 'Leave & Attendance', text: 'Hello Alex! Yes, your Casual Leave request has been received and approved by HR.', timestamp: Date.now() - 1000 * 60 * 60 * 2.5, created_at: new Date(Date.now() - 1000 * 60 * 60 * 2.5).toISOString() },
    { id: 103, from_email: 'alex.employee@gmail.com', fromEmail: 'alex.employee@gmail.com', fromName: 'Alex Johnson', to_email: 'hr.hr@gmail.com', toEmail: 'hr.hr@gmail.com', toName: 'Sarah Williams (HR)', senderRole: 'employee', category: 'Payroll & Compensation', text: 'Thank you for the quick confirmation! Also, could you please let me know where I can review the statutory deductions?', timestamp: Date.now() - 1000 * 60 * 60 * 1, created_at: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString() },
    { id: 104, from_email: 'hr.hr@gmail.com', fromEmail: 'hr.hr@gmail.com', fromName: 'Sarah Williams', to_email: 'alex.employee@gmail.com', toEmail: 'alex.employee@gmail.com', toName: 'Alex Johnson', senderRole: 'hr', category: 'Payroll & Compensation', text: 'You can navigate to "My Payslips" on the sidebar for a complete breakdown.', timestamp: Date.now() - 1000 * 60 * 30, created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString() }
];
window.DEFAULT_SEED_MESSAGES = DEFAULT_SEED_MESSAGES;

function getStoredMessages() {
    try {
        const stored = localStorage.getItem('hr_connect_messages');
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed.map(normalizeMessage).filter(Boolean);
            }
        }
    } catch (e) {}
    localStorage.setItem('hr_connect_messages', JSON.stringify(DEFAULT_SEED_MESSAGES));
    return DEFAULT_SEED_MESSAGES.map(normalizeMessage).filter(Boolean);
}
window.getStoredMessages = getStoredMessages;

async function fetchMessages() {
    const list = getStoredMessages();
    window._currentMessages = list;
    return list;
}

function saveMessagesData(messages) {
    const normalized = (messages || []).map(normalizeMessage).filter(Boolean);
    try {
        localStorage.setItem('hr_connect_messages', JSON.stringify(normalized));
    } catch (e) {}
    window._currentMessages = normalized;
    window.dispatchEvent(new CustomEvent('hr_messages_updated', { detail: { messages: normalized } }));
}

if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
    window.addEventListener('storage', (e) => {
        if (e.key === 'hr_connect_messages') {
            try {
                const updated = JSON.parse(e.newValue || '[]').map(normalizeMessage).filter(Boolean);
                window._currentMessages = updated;
                if (typeof window.refreshMessagesStream === 'function') window.refreshMessagesStream();
            } catch (err) {}
        }
    });
}

// ============================================================
// ===== PAYSLIPS =====
// ============================================================

async function fetchPayslips() {
    if (!useMockData && window.api?.getMyPayslips) {
        try {
            const raw = await window.api.getMyPayslips();
            let list = Array.isArray(raw) ? raw : (raw?.payslips || raw?.data || []);
            return list.map(normalizePayslip).filter(Boolean);
        } catch (e) {}
        return [];
    }
    return (MOCK_DATA.payroll?.payslips || []).map(normalizePayslip).filter(Boolean);
}

function savePayslipsData(payslips) {
    if (useMockData && MOCK_DATA.payroll) {
        MOCK_DATA.payroll.payslips = payslips;
        localStorage.setItem('hr_payslips', JSON.stringify(payslips));
    }
    window.dispatchEvent(new CustomEvent('hr_data_updated', { detail: { type: 'payslips' } }));
}

// ============================================================
// ===== DEPARTMENTS =====
// ============================================================

async function fetchDepartments() {
    if (!useMockData && window.api?.getDepartments) {
        try {
            const depts = await window.api.getDepartments();
            if (Array.isArray(depts) && depts.length > 0) return depts;
        } catch (e) {}
    }
    const emps = window._currentEmployees || [];
    const uniqueDepts = Array.from(new Set(emps.map(e => e.department).filter(Boolean)));
    if (uniqueDepts.length > 0) {
        return uniqueDepts.map((name, idx) => ({
            id: idx + 1,
            name,
            head: name + ' Lead',
            employees_count: emps.filter(e => e.department === name).length,
            budget: (emps.filter(e => e.department === name).reduce((s, e) => s + (Number(e.monthly_salary) || 0), 0) * 12) || 0
        }));
    }
    return MOCK_DATA.departments || [];
}

function saveDepartmentsData(departments) {
    MOCK_DATA.departments = departments;
    localStorage.setItem('hr_departments', JSON.stringify(departments));
    window.dispatchEvent(new CustomEvent('hr_data_updated', { detail: { type: 'departments' } }));
}

// ============================================================
// ===== NOTIFICATIONS =====
// ============================================================

async function fetchNotifications() {
    const stored = localStorage.getItem('hr_notifications');
    if (stored) {
        try {
            const notifs = JSON.parse(stored);
            MOCK_DATA.notifications = notifs;
            return notifs;
        } catch (e) {}
    }
    return MOCK_DATA.notifications || [];
}

function saveNotificationsData(notifications) {
    MOCK_DATA.notifications = notifications;
    localStorage.setItem('hr_notifications', JSON.stringify(notifications));
    window.dispatchEvent(new CustomEvent('hr_data_updated', { detail: { type: 'notifications' } }));
}

function addNotification(title, text, type = 'info', icon = 'fa-bell') {
    const notifs = MOCK_DATA.notifications || [];
    notifs.unshift({ id: Date.now(), title, text, time: 'Just now', icon, type, read: false });
    saveNotificationsData(notifs);
}

// ============================================================
// ===== STATS & CHARTS =====
// ============================================================

async function fetchDashboardStats(employees = [], leaves = []) {
    if (!useMockData && window.api?.getDashboardStats) {
        try {
            const stats = await window.api.getDashboardStats();
            if (stats && typeof stats === 'object' && !stats.error) return stats;
        } catch (e) {}
    }
    const totalEmps = employees.length;
    const pendingLeaves = leaves.filter(l => l.status === 'pending').length;
    return {
        totalEmployees: totalEmps,
        totalDepartments: new Set(employees.map(e => e.department).filter(Boolean)).size,
        newEmployees: employees.filter(e => e.joining_date && String(e.joining_date).includes('2024')).length,
        presentToday: Math.max(0, totalEmps - pendingLeaves),
        onLeave: pendingLeaves,
        pendingLeaves: pendingLeaves,
        totalPayroll: employees.reduce((sum, e) => sum + (Number(e.monthly_salary) || 0), 0),
        monthlyGrowth: 8.5,
        avgAttendance: 95.0
    };
}

async function fetchChartData(employees = []) {
    if (!useMockData && window.api?.getChartData) {
        try {
            const charts = await window.api.getChartData();
            if (charts && typeof charts === 'object' && !charts.error) return charts;
        } catch (e) {}
    }
    const deptCounts = { IT: 0, HR: 0, Finance: 0, Sales: 0, Marketing: 0, Operations: 0 };
    employees.forEach(e => {
        if (e.department && deptCounts[e.department] !== undefined) deptCounts[e.department]++;
    });
    return {
        departments: Object.keys(deptCounts),
        departmentCounts: Object.values(deptCounts),
        attendance: { present: Math.max(1, employees.length - 1), leave: 1, wfh: 2, absent: 0 },
        employeeGrowth: [2, 4, 6, 8, 10, 14, 18, Math.max(employees.length, 6)],
        monthlyPayroll: [420000, 440000, 460000, 475000, 479000, 487000, 487000, 487000],
        leaveStats: { pending: 2, approved: 8, rejected: 1, total: 11 }
    };
}

async function fetchPayrollData() {
    if (!useMockData && window.api?.getPayroll) {
        try {
            const data = await window.api.getPayroll();
            if (data && typeof data === 'object') return data;
        } catch (e) {}
    }
    return MOCK_DATA.payroll || {};
}

// ============================================================
// ===== EXPORTS =====
// ============================================================

window.useMockData = useMockData;
window.fetchEmployees = fetchEmployees;
window.saveEmployeesData = saveEmployeesData;
window.fetchLeaves = fetchLeaves;
window.saveLeavesData = saveLeavesData;
window.fetchMessages = fetchMessages;
window.saveMessagesData = saveMessagesData;
window.fetchPayslips = fetchPayslips;
window.savePayslipsData = savePayslipsData;
window.fetchDepartments = fetchDepartments;
window.saveDepartmentsData = saveDepartmentsData;
window.fetchNotifications = fetchNotifications;
window.saveNotificationsData = saveNotificationsData;
window.addNotification = addNotification;
window.fetchDashboardStats = fetchDashboardStats;
window.fetchChartData = fetchChartData;
window.fetchPayrollData = fetchPayrollData;

console.log('✅ data.js loaded with all normalizers');