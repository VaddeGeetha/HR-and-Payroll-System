// ========== DATA STORE ==========
const STORE = {
  currentUser: null,
  messages: [],
  leaveRequests: [
    { id: 1, employee: 'Employee 1', from: '2026-04-10', to: '2026-04-12', status: 'pending', reason: 'Vacation' },
    { id: 2, employee: 'Employee 2', from: '2026-04-15', to: '2026-04-16', status: 'approved', reason: 'Medical' },
    { id: 3, employee: 'Employee 3', from: '2026-04-20', to: '2026-04-21', status: 'pending', reason: 'Personal' },
  ],
  employees: [
    { id: 'EMP-001', name: 'Employee 1', role: 'Senior Developer', department: 'Engineering', attendance: 'present', email: 'emp1@company.com' },
    { id: 'EMP-002', name: 'Employee 2', role: 'Product Manager', department: 'Product', attendance: 'leave', email: 'emp2@company.com' },
    { id: 'EMP-003', name: 'Employee 3', role: 'UX Designer', department: 'Design', attendance: 'wfh', email: 'emp3@company.com' },
    { id: 'EMP-004', name: 'Employee 4', role: 'DevOps Engineer', department: 'Engineering', attendance: 'present', email: 'emp4@company.com' },
    { id: 'EMP-005', name: 'Employee 5', role: 'HR Associate', department: 'HR', attendance: 'absent', email: 'emp5@company.com' },
  ],
};

// WFH Codes mapping
const WFH_CODES = {
  'alex.employee@gmail.com': 'WFH-1234',
  'sarah.employee@gmail.com': 'WFH-5678',
  'mike.employee@gmail.com': 'WFH-9012',
  'chris.employee@gmail.com': 'WFH-3456',
};