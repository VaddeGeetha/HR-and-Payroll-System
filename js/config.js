// ============================================================
// ===== CONFIGURATION =====
// ============================================================
const CONFIG = {
    API_URL: 'https://despite-trodden-cyclist.ngrok-free.dev/api',
};

// ============================================================
// ===== MOCK DATA (Fallback when backend is not available) ====
// ============================================================
const MOCK_DATA = {
    employees: [
        {
            id: 4,
            name: 'Employee Updated',
            email: 'employee5@gmail.com',
            department: 'HR',
            role: 'employee',
            monthly_salary: 70000,
            joining_date: '2026-08-04',
            attendance_status: 'present'
        },
        {
            id: 6,
            name: 'Arjun Kumar',
            email: 'arjun@gmail.com',
            department: 'finance',
            role: 'employee',
            monthly_salary: 60000,
            joining_date: '2026-08-04',
            attendance_status: 'present'
        },
        {
            id: 7,
            name: 'Rahul',
            email: 'rahul12345@gmail.com',
            department: 'IT',
            role: 'employee',
            monthly_salary: 50000,
            joining_date: '2026-08-06',
            attendance_status: 'leave'
        },
        {
            id: 5,
            name: 'Sujana',
            email: 'sujiii@gmail.com',
            department: 'DS',
            role: 'employee',
            monthly_salary: 80000,
            joining_date: '2025-09-15',
            attendance_status: 'present'
        }
    ],
    leaveRequests: [
        { id: 1, employee: 'Rahul', from: '2026-04-10', to: '2026-04-12', status: 'pending', reason: 'Vacation' },
        { id: 2, employee: 'Arjun Kumar', from: '2026-04-15', to: '2026-04-16', status: 'approved', reason: 'Medical' },
    ],
    messages: [],
    dashboardStats: {
        totalEmployees: 5,
        presentToday: 2,
        onLeave: 1,
        pendingLeaves: 2
    },
    chartData: {
        departments: ['HR', 'finance', 'IT', 'DS'],
        departmentCounts: [1, 1, 1, 1],
        attendance: { present: 2, leave: 1, wfh: 0, absent: 0 }
    }
};

// Make available globally
window.CONFIG = CONFIG;
window.MOCK_DATA = MOCK_DATA;