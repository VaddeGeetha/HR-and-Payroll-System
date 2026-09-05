// ============================================================
// ===== CONFIGURATION - All Mock Data & System Constants =====
// ============================================================

const CONFIG = {
    API_URL: (typeof localStorage !== 'undefined' && localStorage.getItem('hr_custom_api_url')) || 'https://despite-trodden-cyclist.ngrok-free.dev/', // Backend Express REST API
    USE_MOCK_DATA: false,                 // Disabled: Connect directly to Backend API & Database
};
window.CONFIG = CONFIG;
window.useMockData = false;

// Default avatar placeholder images for identification
const DEFAULT_AVATARS = {
    male: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    female: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    alex: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    hr: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
};

// ============================================================
// ===== DEPARTMENT-BASED DESIGNATIONS MAPPING =====
// ============================================================
const DEPARTMENT_DESIGNATIONS = {
    'IT': [
        'Software Developer',
        'Frontend Developer',
        'Backend Developer',
        'Full Stack Developer',
        'QA Engineer',
        'DevOps Engineer',
        'Systems Architect',
        'UI/UX Designer'
    ],
    'HR': [
        'HR Executive',
        'HR Manager',
        'HR Business Partner',
        'Talent Acquisition Specialist',
        'HR Operations Specialist'
    ],
    'Finance': [
        'Accountant',
        'Financial Analyst',
        'Finance Executive',
        'Finance Manager',
        'Payroll Specialist',
        'Tax Consultant'
    ],
    'Sales': [
        'Sales Executive',
        'Sales Manager',
        'Business Development Executive',
        'Sales Representative',
        'Account Executive'
    ],
    'Marketing': [
        'Marketing Specialist',
        'Content Strategist',
        'Digital Marketing Manager',
        'SEO Analyst'
    ],
    'Operations': [
        'Operations Manager',
        'Logistics Coordinator',
        'Facility Officer'
    ]
};

// ============================================================
// ===== COMPLETE MOCK DATA =====
// ============================================================

const MOCK_DATA = {
    // ----- EMPLOYEES -----
    employees: [
        {
            id: 1,
            name: 'Alex Johnson',
            email: 'alex.employee@gmail.com', // Permanent Email ID (cannot be changed)
            phone: '+91 98765 43210',
            gender: 'Male',
            address: 'Flat 402, Cyber Heights, Madhapur, Hyderabad, Telangana 500081',
            department: 'IT',
            designation: 'Senior Developer',
            role: 'employee',
            employment_type: 'Full-Time',
            status: 'active',
            annual_ctc: '9.00 LPA',
            monthly_salary: 75000,
            joining_date: '2024-01-15',
            dob: '1995-06-20',
            photo: DEFAULT_AVATARS.alex,
            aadhaar: '7482 9104 3829',
            pan: 'ABCDE1234F',
            passport: 'L8924012',
            bank_details: {
                bank_name: 'HDFC Bank',
                account_number: '50100482910482',
                ifsc: 'HDFC0001234'
            },
            attendance_status: 'present',
            leave_balances: {
                casual: { available: 4, used: 1, remaining: 3, allocated: 4 },
                sick: { available: 3, used: 0, remaining: 3, allocated: 3 },
                earned: { allocated: 12, used: 5, remaining: 7, carry_forward: 7 },
                monthly: {
                    month: 'August 2026',
                    available_this_month: 4,
                    used_this_month: 1,
                    remaining_this_month: 3,
                    max_allowed_per_month: 3,
                    carry_forward_calc: {
                        previous_month_remaining: 2,
                        current_month_allocation: 2,
                        total_available: 4,
                        explanation: '2 unused eligible leaves from July carried forward into August.'
                    }
                },
                earned_leave_rules: {
                    allocated_yearly: 15,
                    used: 5,
                    remaining: 10,
                    carry_forward_next_year: 10,
                    max_accumulation_limit: 30,
                    policy_note: 'Unused earned leaves automatically carry forward to next calendar year up to a maximum limit of 30 days.'
                }
            },
            leave_balance: 13,
            leaves_taken: 6
        },
        {
            id: 2,
            name: 'Maria Smith',
            email: 'maria.smith@gmail.com',
            phone: '+91 98765 43211',
            gender: 'Female',
            address: 'Villa 12, Green Meadows, Gachibowli, Hyderabad, Telangana 500032',
            department: 'IT',
            designation: 'Frontend Developer',
            role: 'employee',
            employment_type: 'Full-Time',
            status: 'active',
            annual_ctc: '9.84 LPA',
            monthly_salary: 82000,
            joining_date: '2024-03-01',
            dob: '1993-11-12',
            photo: DEFAULT_AVATARS.female,
            aadhaar: '8392 0184 7291',
            pan: 'MSMTH5678G',
            passport: 'P4810294',
            bank_details: {
                bank_name: 'ICICI Bank',
                account_number: '129401829104',
                ifsc: 'ICIC0000492'
            },
            attendance_status: 'leave',
            leave_balances: {
                casual: { available: 4, used: 2, remaining: 2, allocated: 4 },
                sick: { available: 3, used: 1, remaining: 2, allocated: 3 },
                earned: { allocated: 12, used: 3, remaining: 9, carry_forward: 9 },
                monthly: {
                    month: 'August 2026',
                    available_this_month: 3,
                    used_this_month: 2,
                    remaining_this_month: 1,
                    max_allowed_per_month: 3,
                    carry_forward_calc: {
                        previous_month_remaining: 1,
                        current_month_allocation: 2,
                        total_available: 3,
                        explanation: '1 unused eligible leave carried forward.'
                    }
                },
                earned_leave_rules: {
                    allocated_yearly: 15,
                    used: 3,
                    remaining: 12,
                    carry_forward_next_year: 12,
                    max_accumulation_limit: 30,
                    policy_note: 'Unused earned leaves automatically carry forward.'
                }
            },
            leave_balance: 13,
            leaves_taken: 6
        },
        {
            id: 3,
            name: 'David Brown',
            email: 'david.brown@gmail.com',
            phone: '+91 98765 43212',
            gender: 'Male',
            address: 'Plot 88, Financial District, Nanakramguda, Hyderabad, Telangana 500032',
            department: 'Finance',
            designation: 'Finance Manager',
            role: 'employee',
            employment_type: 'Full-Time',
            status: 'active',
            annual_ctc: '11.40 LPA',
            monthly_salary: 95000,
            joining_date: '2023-11-10',
            dob: '1989-04-18',
            photo: DEFAULT_AVATARS.male,
            aadhaar: '4829 1048 2910',
            pan: 'DBRWN9012K',
            passport: 'K9102840',
            bank_details: {
                bank_name: 'State Bank of India',
                account_number: '30910482910',
                ifsc: 'SBIN0008492'
            },
            attendance_status: 'present',
            leave_balances: {
                casual: { available: 4, used: 0, remaining: 4, allocated: 4 },
                sick: { available: 3, used: 0, remaining: 3, allocated: 3 },
                earned: { allocated: 15, used: 2, remaining: 13, carry_forward: 13 },
                monthly: {
                    month: 'August 2026',
                    available_this_month: 4,
                    used_this_month: 0,
                    remaining_this_month: 4,
                    max_allowed_per_month: 3,
                    carry_forward_calc: {
                        previous_month_remaining: 2,
                        current_month_allocation: 2,
                        total_available: 4,
                        explanation: '2 leaves carried forward.'
                    }
                },
                earned_leave_rules: {
                    allocated_yearly: 15,
                    used: 2,
                    remaining: 13,
                    carry_forward_next_year: 13,
                    max_accumulation_limit: 30,
                    policy_note: 'Unused earned leaves automatically carry forward.'
                }
            },
            leave_balance: 20,
            leaves_taken: 2
        },
        {
            id: 4,
            name: 'Sarah Williams',
            email: 'hr.hr@gmail.com', // HR Manager Email
            phone: '+91 98765 43213',
            gender: 'Female',
            address: 'Tower B, Silicon Valley Apts, Kondapur, Hyderabad, Telangana 500084',
            department: 'HR',
            designation: 'HR Manager',
            role: 'hr',
            employment_type: 'Full-Time',
            status: 'active',
            annual_ctc: '10.56 LPA',
            monthly_salary: 88000,
            joining_date: '2023-08-01',
            dob: '1991-09-25',
            photo: DEFAULT_AVATARS.hr,
            aadhaar: '6291 0482 9104',
            pan: 'SWLLM3456P',
            passport: 'M1048291',
            bank_details: {
                bank_name: 'Axis Bank',
                account_number: '910028491028',
                ifsc: 'UTIB0001092'
            },
            attendance_status: 'present',
            leave_balances: {
                casual: { available: 4, used: 1, remaining: 3, allocated: 4 },
                sick: { available: 3, used: 0, remaining: 3, allocated: 3 },
                earned: { allocated: 15, used: 4, remaining: 11, carry_forward: 11 },
                monthly: {
                    month: 'August 2026',
                    available_this_month: 4,
                    used_this_month: 1,
                    remaining_this_month: 3,
                    max_allowed_per_month: 3,
                    carry_forward_calc: {
                        previous_month_remaining: 2,
                        current_month_allocation: 2,
                        total_available: 4,
                        explanation: '2 leaves carried forward.'
                    }
                },
                earned_leave_rules: {
                    allocated_yearly: 15,
                    used: 4,
                    remaining: 11,
                    carry_forward_next_year: 11,
                    max_accumulation_limit: 30,
                    policy_note: 'Unused earned leaves automatically carry forward.'
                }
            },
            leave_balance: 17,
            leaves_taken: 5
        },
        {
            id: 5,
            name: 'Michael Chang',
            email: 'michael.sales@gmail.com',
            phone: '+91 98765 43214',
            gender: 'Male',
            address: 'Apt 501, Lakeview Residency, Kukatpally, Hyderabad, Telangana 500072',
            department: 'Sales',
            designation: 'Sales Manager',
            role: 'employee',
            employment_type: 'Full-Time',
            status: 'active',
            annual_ctc: '8.40 LPA',
            monthly_salary: 70000,
            joining_date: '2024-05-15',
            dob: '1994-02-14',
            photo: DEFAULT_AVATARS.male,
            aadhaar: '5192 0481 9204',
            pan: 'MCHNG7890L',
            passport: 'T4920194',
            bank_details: {
                bank_name: 'Kotak Mahindra Bank',
                account_number: '782910482910',
                ifsc: 'KKBK0000281'
            },
            attendance_status: 'present',
            leave_balances: {
                casual: { available: 4, used: 2, remaining: 2, allocated: 4 },
                sick: { available: 3, used: 0, remaining: 3, allocated: 3 },
                earned: { allocated: 12, used: 1, remaining: 11, carry_forward: 11 },
                monthly: {
                    month: 'August 2026',
                    available_this_month: 4,
                    used_this_month: 2,
                    remaining_this_month: 2,
                    max_allowed_per_month: 3,
                    carry_forward_calc: {
                        previous_month_remaining: 2,
                        current_month_allocation: 2,
                        total_available: 4,
                        explanation: '2 leaves carried forward.'
                    }
                },
                earned_leave_rules: {
                    allocated_yearly: 15,
                    used: 1,
                    remaining: 14,
                    carry_forward_next_year: 14,
                    max_accumulation_limit: 30,
                    policy_note: 'Unused earned leaves automatically carry forward.'
                }
            },
            leave_balance: 16,
            leaves_taken: 3
        },
        {
            id: 6,
            name: 'Emily Davis',
            email: 'admin.admin@gmail.com', // Admin Email
            phone: '+91 98765 43215',
            gender: 'Female',
            address: 'Penthouse 14, Sky City, Jubilee Hills, Hyderabad, Telangana 500033',
            department: 'Marketing',
            designation: 'Digital Marketing Manager',
            role: 'admin',
            employment_type: 'Full-Time',
            status: 'active',
            annual_ctc: '12.00 LPA',
            monthly_salary: 100000,
            joining_date: '2023-01-10',
            dob: '1988-12-05',
            photo: DEFAULT_AVATARS.female,
            aadhaar: '9104 8291 0482',
            pan: 'EDAVS1234M',
            passport: 'R9104820',
            bank_details: {
                bank_name: 'HDFC Bank',
                account_number: '50100928104928',
                ifsc: 'HDFC0001234'
            },
            attendance_status: 'present',
            leave_balances: {
                casual: { available: 4, used: 0, remaining: 4, allocated: 4 },
                sick: { available: 3, used: 0, remaining: 3, allocated: 3 },
                earned: { allocated: 15, used: 2, remaining: 13, carry_forward: 13 },
                monthly: {
                    month: 'August 2026',
                    available_this_month: 4,
                    used_this_month: 0,
                    remaining_this_month: 4,
                    max_allowed_per_month: 3,
                    carry_forward_calc: {
                        previous_month_remaining: 2,
                        current_month_allocation: 2,
                        total_available: 4,
                        explanation: '2 leaves carried forward.'
                    }
                },
                earned_leave_rules: {
                    allocated_yearly: 15,
                    used: 2,
                    remaining: 13,
                    carry_forward_next_year: 13,
                    max_accumulation_limit: 30,
                    policy_note: 'Unused earned leaves automatically carry forward.'
                }
            },
            leave_balance: 20,
            leaves_taken: 2
        }
    ],

    // ----- DEPARTMENTS -----
    departments: [
        { id: 1, name: 'IT', code: 'IT', head: 'Alex Johnson', employees_count: 8, budget: '₹45 LPA', description: 'Software engineering, QA, DevOps, systems architecture, and product development.' },
        { id: 2, name: 'HR', code: 'HR', head: 'Sarah Williams', employees_count: 4, budget: '₹22 LPA', description: 'Talent acquisition, employee engagement, HR compliance, and payroll management.' },
        { id: 3, name: 'Finance', code: 'FIN', head: 'David Brown', employees_count: 5, budget: '₹28 LPA', description: 'Financial accounting, audits, taxation compliance, budgeting, and statutory filings.' },
        { id: 4, name: 'Sales', code: 'SLS', head: 'Michael Chang', employees_count: 6, budget: '₹35 LPA', description: 'Direct sales, enterprise business development, and client account management.' },
        { id: 5, name: 'Marketing', code: 'MKT', head: 'Emily Davis', employees_count: 4, budget: '₹20 LPA', description: 'Digital marketing, content strategy, brand communications, and SEO.' },
        { id: 6, name: 'Operations', code: 'OPS', head: 'Robert Taylor', employees_count: 3, budget: '₹18 LPA', description: 'Daily corporate operations, logistics, facility maintenance, and vendor management.' }
    ],

    // ----- LEAVE REQUESTS -----
    leaveRequests: [
        {
            id: 1,
            employee: 'Alex Johnson',
            employee_id: 1,
            type: 'Casual Leave',
            from: '2026-08-10',
            to: '2026-08-12',
            days: 3,
            reason: 'Attending family function out of town',
            status: 'pending',
            comments: []
        },
        {
            id: 2,
            employee: 'Maria Smith',
            employee_id: 2,
            type: 'Sick Leave',
            from: '2026-08-05',
            to: '2026-08-06',
            days: 2,
            reason: 'Viral fever and medical consultation',
            status: 'approved',
            comments: ['Approved by HR Manager Sarah Williams on 2026-08-04']
        },
        {
            id: 3,
            employee: 'David Brown',
            employee_id: 3,
            type: 'Earned Leave',
            from: '2026-08-20',
            to: '2026-08-24',
            days: 5,
            reason: 'Annual personal vacation',
            status: 'pending',
            comments: []
        },
        {
            id: 4,
            employee: 'Michael Chang',
            employee_id: 5,
            type: 'Casual Leave',
            from: '2026-07-15',
            to: '2026-07-16',
            days: 2,
            reason: 'Urgent personal bank work',
            status: 'approved',
            comments: ['Approved by HR']
        }
    ],

    // ----- PAYROLL & PAYSLIPS (WITH CRITERIA & DOWNLOAD DATA) -----
    payroll: {
        total: 487000,
        currency: 'INR',
        processed_count: 6,
        pending_count: 0,
        payslips: [
            {
                id: 'PS-2026-08-1',
                employee_id: 1,
                employee_name: 'Alex Johnson',
                month: 'August',
                year: '2026',
                pay_period: '01 Aug 2026 - 31 Aug 2026',
                working_days: 22,
                status: 'paid',
                bank_name: 'HDFC Bank',
                bank_account: '•••• 10482',
                pan: 'ABCDE1234F',
                aadhaar: '7482 9104 3829',
                allowances: [
                    { name: 'Basic Salary', amount: 40000, criteria: 'Core basic taxable base component as per employment contract.' },
                    { name: 'House Rent Allowance (HRA)', amount: 16000, criteria: '40% of Basic Pay allocated for housing accommodation support (Sec 10(13A)).' },
                    { name: 'Special Allowance', amount: 10000, criteria: 'Performance and operational incentive allowance.' },
                    { name: 'Conveyance Allowance', amount: 4000, criteria: 'Transport reimbursement for official city travel and commute.' },
                    { name: 'Medical Allowance', amount: 5000, criteria: 'Routine health & wellness assistance reimbursement.' }
                ],
                deductions: [
                    { name: 'Provident Fund (PF)', amount: 4800, criteria: '12% statutory employee contribution mandated under EPF Act 1952.' },
                    { name: 'Professional Tax (PT)', amount: 200, criteria: 'State Government statutory employment tax remittance.' },
                    { name: 'Income Tax (TDS)', amount: 3500, criteria: 'Tax Deducted at Source calculated as per applicable annual income tax slab.' },
                    { name: 'Mediclaim / Health Insurance', amount: 0, criteria: '100% employer-sponsored corporate group medical coverage.' }
                ],
                gross_earnings: 75000,
                total_deductions: 8500,
                net_salary: 66500,
                net_salary_words: 'Rupees Sixty-Six Thousand Five Hundred Only'
            },
            {
                id: 'PS-2026-07-1',
                employee_id: 1,
                employee_name: 'Alex Johnson',
                month: 'July',
                year: '2026',
                pay_period: '01 Jul 2026 - 31 Jul 2026',
                working_days: 23,
                status: 'paid',
                bank_name: 'HDFC Bank',
                bank_account: '•••• 10482',
                pan: 'ABCDE1234F',
                aadhaar: '7482 9104 3829',
                allowances: [
                    { name: 'Basic Salary', amount: 40000, criteria: 'Base compensation.' },
                    { name: 'House Rent Allowance (HRA)', amount: 16000, criteria: '40% of Basic Pay.' },
                    { name: 'Special Allowance', amount: 10000, criteria: 'Performance allowance.' },
                    { name: 'Conveyance Allowance', amount: 4000, criteria: 'Travel assistance.' },
                    { name: 'Medical Allowance', amount: 5000, criteria: 'Medical support.' }
                ],
                deductions: [
                    { name: 'Provident Fund (PF)', amount: 4800, criteria: '12% EPF statutory deduction.' },
                    { name: 'Professional Tax (PT)', amount: 200, criteria: 'State employment tax.' },
                    { name: 'Income Tax (TDS)', amount: 3500, criteria: 'Standard income tax withholding.' }
                ],
                gross_earnings: 75000,
                total_deductions: 8500,
                net_salary: 66500,
                net_salary_words: 'Rupees Sixty-Six Thousand Five Hundred Only'
            },
            {
                id: 'PS-2026-06-1',
                employee_id: 1,
                employee_name: 'Alex Johnson',
                month: 'June',
                year: '2026',
                pay_period: '01 Jun 2026 - 30 Jun 2026',
                working_days: 22,
                status: 'paid',
                bank_name: 'HDFC Bank',
                bank_account: '•••• 10482',
                pan: 'ABCDE1234F',
                aadhaar: '7482 9104 3829',
                allowances: [
                    { name: 'Basic Salary', amount: 40000, criteria: 'Base compensation.' },
                    { name: 'House Rent Allowance (HRA)', amount: 16000, criteria: '40% of Basic Pay.' },
                    { name: 'Special Allowance', amount: 10000, criteria: 'Performance allowance.' },
                    { name: 'Conveyance Allowance', amount: 4000, criteria: 'Travel assistance.' },
                    { name: 'Medical Allowance', amount: 5000, criteria: 'Medical support.' }
                ],
                deductions: [
                    { name: 'Provident Fund (PF)', amount: 4800, criteria: '12% EPF statutory deduction.' },
                    { name: 'Professional Tax (PT)', amount: 200, criteria: 'State employment tax.' },
                    { name: 'Income Tax (TDS)', amount: 3500, criteria: 'Standard income tax withholding.' }
                ],
                gross_earnings: 75000,
                total_deductions: 8500,
                net_salary: 66500,
                net_salary_words: 'Rupees Sixty-Six Thousand Five Hundred Only'
            }
        ],

        // High level overview
        current: {
            month: 'August 2026',
            basic: 40000,
            gross: 75000,
            deductions: 8500,
            net: 66500,
            status: 'paid'
        },
        history: [
            { month: 'August', year: '2026', employees: 6, amount: 487000, status: 'Processed' },
            { month: 'July', year: '2026', employees: 6, amount: 487000, status: 'Processed' },
            { month: 'June', year: '2026', employees: 6, amount: 487000, status: 'Processed' },
            { month: 'May', year: '2026', employees: 6, amount: 479000, status: 'Processed' },
            { month: 'April', year: '2026', employees: 6, amount: 475000, status: 'Processed' }
        ]
    },

    // ----- DASHBOARD STATS -----
    dashboardStats: {
        totalEmployees: 6,
        totalDepartments: 6,
        newEmployees: 2,
        presentToday: 5,
        onLeave: 1,
        pendingLeaves: 2,
        totalPayroll: 487000,
        monthlyGrowth: 8.5,
        avgAttendance: 92.4
    },

    // ----- NOTIFICATIONS -----
    notifications: [
        { id: 1, title: 'Payslip Ready for Download', text: 'August 2026 salary payslip with itemized allowance & deduction criteria is available.', time: '2 hours ago', icon: 'fa-file-invoice-dollar', type: 'info', read: false },
        { id: 2, title: 'Sick Leave Approved', text: 'Your 2-day Sick Leave request for August 5-6 was approved by HR Management.', time: 'Yesterday', icon: 'fa-check-circle', type: 'success', read: true },
        { id: 3, title: 'Earned Leave Carry-Forward Active', text: 'Eligible unused Earned Leaves (EL) have been computed for next calendar rollover.', time: '3 days ago', icon: 'fa-calendar-alt', type: 'info', read: true },
        { id: 4, title: 'Statutory Profile Verification', text: 'Your PAN and Aadhaar records have been verified by HR compliance team.', time: '5 days ago', icon: 'fa-id-card', type: 'success', read: true }
    ],

    // ----- CHART DATA -----
    chartData: {
        departments: ['IT', 'HR', 'Finance', 'Sales', 'Marketing', 'Operations'],
        departmentCounts: [8, 4, 5, 6, 4, 3],
        attendance: { present: 22, leave: 3, wfh: 4, absent: 1 },
        employeeGrowth: [6, 8, 10, 14, 18, 22, 26, 30],
        monthlyPayroll: [420000, 440000, 460000, 475000, 479000, 487000, 487000, 487000],
        leaveStats: { pending: 2, approved: 8, rejected: 1, total: 11 }
    },

    // ----- MESSAGES (REAL TIME CHAT - NO PRELOADED MESSAGES) -----
    messages: []
};

window.CONFIG = CONFIG;
window.DEFAULT_AVATARS = DEFAULT_AVATARS;
window.DEPARTMENT_DESIGNATIONS = DEPARTMENT_DESIGNATIONS;
window.MOCK_DATA = MOCK_DATA;