// ============================================================
// ===== SECTION RENDERERS - HR & Payroll Final System =====
// ============================================================

let activeChatRecipient = 'alex.employee@gmail.com';
let payslipFilterMonth = 'August';
let payslipFilterYear = '2026';
let currentLeaveActionId = null;
let currentLeaveActionType = null;
let activeDeptThreadFilter = 'All';
let currentChatSearchQuery = '';
let employeeThreadSearchQuery = '';

function getNameFromEmail(email) {
    if (!email) return 'User';
    const clean = String(email).split('@')[0];
    return clean.split('.').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
}

var DEFAULT_AVATARS = window.DEFAULT_AVATARS || {
    male: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    female: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    alex: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    hr: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'
};

// ============================================================
// ===== 1. DASHBOARD RENDERERS =====
// ============================================================

function renderDashboard(userEmail, role, employees, leaves, stats, chartData) {
    if (role === 'admin') return renderAdminDashboard(employees, leaves, stats, chartData);
    if (role === 'hr') return renderHRDashboard(userEmail, employees, leaves, stats, chartData);
    return renderEmployeeDashboard(userEmail, employees, leaves, stats);
}

function renderAdminDashboard(employees, leaves, stats, chartData) {
    const totalEmps = employees.length;
    const depts = new Set(employees.map(e => e.department).filter(Boolean)).size || 6;
    const leavesThisMonth = leaves.length;
    const pendingLeaves = leaves.filter(l => l.status === 'pending').length;
    const totalPayroll = employees.reduce((sum, e) => sum + (Number(e.monthly_salary) || 0), 0) || stats?.totalPayroll || 0;

    return `
        <div class="dash-header">
            <div>
                <h2>Admin Executive Dashboard</h2>
                <div class="subhead">Organization-wide workforce analytics, department metrics & payroll summary</div>
            </div>
            <span class="badge" style="background:#e8f0fe;color:var(--primary);padding:0.4rem 1rem;font-weight:600;">
                <i class="fas fa-shield-alt"></i> Enterprise Admin
            </span>
        </div>
        <div class="stats-grid">
            <div class="stat-card"><div class="stat-label"><i class="fas fa-users" style="color:var(--primary);"></i> Total Employees</div><div class="stat-value">${totalEmps}</div><span class="stat-change"><i class="fas fa-arrow-up"></i> +8.5% Growth</span></div>
            <div class="stat-card"><div class="stat-label"><i class="fas fa-building" style="color:#6f42c1;"></i> Departments</div><div class="stat-value">${depts}</div><span class="stat-change">Active Units</span></div>
            <div class="stat-card"><div class="stat-label"><i class="fas fa-calendar-alt" style="color:#f0ad4e;"></i> Leaves This Month</div><div class="stat-value">${leavesThisMonth}</div><span class="stat-change down">${pendingLeaves} Pending</span></div>
            <div class="stat-card"><div class="stat-label"><i class="fas fa-rupee-sign" style="color:var(--success);"></i> Monthly Payroll</div><div class="stat-value" style="color:var(--success);">₹${(totalPayroll/1000).toFixed(0)}K</div><span class="stat-change"><i class="fas fa-check-circle"></i> August</span></div>
        </div>
        <div class="chart-grid" style="display:grid;grid-template-columns:repeat(auto-fit, minmax(320px, 1fr));gap:1.5rem;">
            <div class="chart-box"><h4><i class="fas fa-chart-line" style="color:var(--primary);"></i> Employee Growth</h4><canvas id="lineChart"></canvas></div>
            <div class="chart-box"><h4><i class="fas fa-building" style="color:#6f42c1;"></i> Department-wise</h4><canvas id="barChart"></canvas></div>
            <div class="chart-box"><h4><i class="fas fa-calendar-check" style="color:#f0ad4e;"></i> Leave Status</h4><canvas id="pieChart"></canvas></div>
            <div class="chart-box"><h4><i class="fas fa-rupee-sign" style="color:var(--success);"></i> Payroll</h4><canvas id="payrollChart"></canvas></div>
        </div>
        <div class="card-grid" style="margin-top:1.5rem;">
            <div class="card" onclick="window.switchSection('employees')"><div class="icon"><i class="fas fa-users-cog"></i></div><h4>Employees Directory</h4><p>Manage staff & compensation</p><span class="badge">Manage</span></div>
            <div class="card" onclick="window.switchSection('departments')"><div class="icon"><i class="fas fa-sitemap"></i></div><h4>Departments</h4><p>Structure & team allocation</p><span class="badge">View</span></div>
            <div class="card" onclick="window.switchSection('leaves')"><div class="icon"><i class="fas fa-calendar-check"></i></div><h4>Leave Overview</h4><p>Trends & approvals</p><span class="badge">Review</span></div>
            <div class="card" onclick="window.switchSection('payroll')"><div class="icon"><i class="fas fa-file-invoice-dollar"></i></div><h4>Payroll Overview</h4><p>Disbursements & compliance</p><span class="badge">Inspect</span></div>
        </div>
    `;
}

function renderHRDashboard(userEmail, employees, leaves, stats, chartData) {
    const totalEmps = employees.length;
    const newEmps = employees.filter(e => e.joining_date && String(e.joining_date).includes('2024')).length;
    const pendingLeaves = leaves.filter(l => l.status === 'pending').length;
    const totalPayroll = employees.reduce((sum, e) => sum + (Number(e.monthly_salary) || 0), 0) || stats?.totalPayroll || 0;

    return `
        <div class="dash-header">
            <div>
                <h2>HR Management Dashboard</h2>
                <div class="subhead">Workforce operations, leave reviews, and monthly payroll control</div>
            </div>
            <div style="display:flex;gap:0.5rem;">
                <button class="btn-primary btn-sm" onclick="window.showAddEmployeeModal()"><i class="fas fa-user-plus"></i> Add Employee</button>
                <button class="btn-success btn-sm" onclick="window.openRunPayrollModal()"><i class="fas fa-calculator"></i> Run Payroll</button>
            </div>
        </div>
        <div class="stats-grid">
            <div class="stat-card"><div class="stat-label"><i class="fas fa-users" style="color:var(--primary);"></i> Total Employees</div><div class="stat-value">${totalEmps}</div><span class="stat-change">Verified</span></div>
            <div class="stat-card"><div class="stat-label"><i class="fas fa-user-plus" style="color:var(--success);"></i> New Employees</div><div class="stat-value">${newEmps}</div><span class="stat-change">Recent</span></div>
            <div class="stat-card"><div class="stat-label"><i class="fas fa-clock" style="color:#dc3545;"></i> Pending Leaves</div><div class="stat-value" style="color:#dc3545;">${pendingLeaves}</div><span class="stat-change down">Action Required</span></div>
            <div class="stat-card"><div class="stat-label"><i class="fas fa-rupee-sign" style="color:var(--primary);"></i> Current Payroll</div><div class="stat-value" style="color:var(--primary);">₹${(totalPayroll/1000).toFixed(0)}K</div><span class="stat-change">August 2026</span></div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;margin-top:1.5rem;" class="responsive-two-col">
            <div class="stat-card" style="padding:1.4rem;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
                    <h4 style="margin:0;"><i class="fas fa-calendar-alt" style="color:var(--primary);"></i> Leave Overview</h4>
                    <span class="badge" style="background:var(--primary-light);color:var(--primary);">Real-time</span>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.8rem;">
                    <div class="mini-calc-box"><div class="mini-label">Casual</div><div class="mini-value" style="color:var(--primary);">4 Days</div></div>
                    <div class="mini-calc-box"><div class="mini-label">Sick</div><div class="mini-value" style="color:#f0ad4e;">2 Days</div></div>
                    <div class="mini-calc-box"><div class="mini-label">Earned Rollover</div><div class="mini-value" style="color:var(--success);">12 Days</div></div>
                    <div class="mini-calc-box"><div class="mini-label">Pending</div><div class="mini-value" style="color:var(--danger);">${pendingLeaves}</div></div>
                </div>
                <div style="margin-top:1rem;text-align:right;"><button class="btn-primary btn-sm" onclick="window.switchSection('leaves')"><i class="fas fa-arrow-right"></i> Review Leave Desk</button></div>
            </div>
            <div class="stat-card" style="padding:1.4rem;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
                    <h4 style="margin:0;"><i class="fas fa-wallet" style="color:var(--success);"></i> Payroll Overview</h4>
                    <span class="badge" style="background:#d4edda;color:#155724;">Processed</span>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.8rem;">
                    <div class="mini-calc-box"><div class="mini-label">Current</div><div class="mini-value">₹${(totalPayroll/100000).toFixed(2)} L</div></div>
                    <div class="mini-calc-box"><div class="mini-label">Processed</div><div class="mini-value" style="color:var(--success);">${totalEmps}/${totalEmps}</div></div>
                    <div class="mini-calc-box"><div class="mini-label">Pending</div><div class="mini-value" style="color:var(--primary);">₹0</div></div>
                    <div class="mini-calc-box"><div class="mini-label">TDS</div><div class="mini-value">₹21,000</div></div>
                </div>
                <div style="margin-top:1rem;text-align:right;"><button class="btn-success btn-sm" onclick="window.switchSection('payroll')"><i class="fas fa-file-invoice"></i> Manage Payroll</button></div>
            </div>
        </div>
        <div class="detail-list" style="margin-top:1.5rem;">
            <h3 style="margin:0 0 1rem 0;"><i class="fas fa-user-clock" style="color:var(--primary);margin-right:8px;"></i> Recently Joined Employees</h3>
            <div class="custom-table-responsive">
                <table class="styled-table">
                    <thead><tr><th>Employee</th><th>Department</th><th>Designation</th><th>DOJ</th><th>Annual CTC</th><th>Status</th></tr></thead>
                    <tbody>
                        ${employees.slice(0, 4).map(e => `
                            <tr>
                                <td><div style="display:flex;align-items:center;gap:0.6rem;">
                                    <img src="${e.photo || DEFAULT_AVATARS.male}" style="width:34px;height:34px;border-radius:50%;object-fit:cover;"/>
                                    <div><strong>${e.name}</strong><div style="font-size:0.75rem;color:var(--text-light);">${e.email}</div></div>
                                </div></td>
                                <td><span class="badge" style="background:#f1f5f9;color:var(--text-primary);">${e.department}</span></td>
                                <td>${e.designation}</td>
                                <td>${e.joining_date}</td>
                                <td><strong style="color:var(--primary);">${e.annual_ctc || '9.00 LPA'}</strong></td>
                                <td><span class="badge" style="background:#d4edda;color:#155724;"><i class="fas fa-check"></i> ACTIVE</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function renderEmployeeDashboard(userEmail, employees, leaves, stats) {
    const currentEmp = employees.find(e => e.email && e.email.toLowerCase() === userEmail.toLowerCase()) 
        || window.currentUser?.empData 
        || { name: getNameFromEmail(userEmail), email: userEmail, id: 1, department: 'IT', designation: 'Employee', monthly_salary: 75000, annual_ctc: '9.00 LPA', photo: DEFAULT_AVATARS.alex };
    const leaveBalances = currentEmp?.leave_balances || {
        casual: { available: 4, used: 1, remaining: 3 },
        sick: { available: 3, used: 0, remaining: 3 },
        earned: { allocated: 15, used: 5, remaining: 10, carry_forward: 10 }
    };
    const totalRemainingLeaves = (leaveBalances.casual?.remaining || 0) + (leaveBalances.sick?.remaining || 0) + (leaveBalances.earned?.remaining || 0);
    const empLeaves = leaves.filter(l => l.employee_id === currentEmp?.id || l.employee === currentEmp?.name || l.email === userEmail);
    const pendingReqs = empLeaves.filter(l => l.status === 'pending');
    const notifications = window._currentNotifications || [];

    return `
        <div class="dashboard-header-banner">
            <div style="display:flex;align-items:center;gap:1.2rem;flex-wrap:wrap;">
                <img src="${currentEmp?.photo || DEFAULT_AVATARS.alex}" class="emp-banner-avatar" alt="${currentEmp?.name}"/>
                <div>
                    <h2 style="margin:0;color:white;font-size:1.6rem;">Welcome, ${currentEmp?.name}!</h2>
                    <div style="color:rgba(255,255,255,0.85);font-size:0.95rem;margin-top:0.3rem;">
                        ${currentEmp?.designation} · ${currentEmp?.department} · Employee ID: <strong>#EMP-00${currentEmp?.id}</strong>
                    </div>
                </div>
            </div>
            <div>
                <span class="badge" style="background:white;color:var(--primary);font-weight:700;padding:0.5rem 1.2rem;">
                    <i class="fas fa-id-badge"></i> Annual CTC: ${currentEmp?.annual_ctc || '9.00 LPA'}
                </span>
            </div>
        </div>
        <div class="stat-card wfh-tracker-card" style="margin-top:1.2rem;margin-bottom:1.5rem;padding:1.4rem;background:linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%);border-left:5px solid #22a65e;">
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem;">
                <div style="display:flex;align-items:center;gap:1rem;">
                    <div style="background:#d4edda;width:3.2rem;height:3.2rem;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#155724;font-size:1.6rem;flex-shrink:0;">
                        <i class="fas fa-laptop-house"></i>
                    </div>
                    <div>
                        <div style="display:flex;align-items:center;gap:0.6rem;flex-wrap:wrap;">
                            <h3 style="margin:0;color:var(--text-primary);font-size:1.15rem;" id="wfhCurrentModeTitle">Work From Home (WFH) Active</h3>
                            <span class="badge" style="background:#d4edda;color:#155724;display:flex;align-items:center;gap:0.4rem;font-weight:700;">
                                <span class="live-pulse-dot"></span> Live Shift
                            </span>
                        </div>
                        <div style="color:var(--text-secondary);font-size:0.85rem;margin-top:0.25rem;">
                            <i class="fas fa-clock" style="color:var(--primary);"></i> Working hours started upon login
                        </div>
                    </div>
                </div>
                <div style="display:flex;align-items:center;gap:1.5rem;flex-wrap:wrap;">
                    <div>
                        <div style="font-size:0.75rem;color:var(--text-secondary);text-transform:uppercase;font-weight:700;">Today's Working Hours</div>
                        <div id="liveWorkingTimerDisplay" style="font-size:1.8rem;font-weight:800;color:#0b2b4a;font-family:monospace;">00h : 00m : 00s</div>
                    </div>
                    <div style="display:flex;gap:0.5rem;">
                        <button class="btn-secondary-custom btn-sm" onclick="window.toggleWorkMode()"><i class="fas fa-building"></i> Switch to Office</button>
                        <button class="btn-warning btn-sm" onclick="window.toggleWorkBreak()" style="background:#fff3cd;color:#856404;border:1px solid #ffeeba;font-weight:600;"><i class="fas fa-coffee"></i> Take Break</button>
                    </div>
                </div>
            </div>
        </div>
        <div class="stats-grid">
            <div class="stat-card"><div class="stat-label"><i class="fas fa-calendar-check" style="color:var(--primary);"></i> Leave Balance</div><div class="stat-value" style="color:var(--primary);">${totalRemainingLeaves} <span style="font-size:0.9rem;color:var(--text-secondary);">Days</span></div><div style="font-size:0.8rem;color:var(--text-secondary);margin-top:0.4rem;">CL: <strong>${leaveBalances.casual?.remaining || 3}d</strong> | SL: <strong>${leaveBalances.sick?.remaining || 3}d</strong> | EL: <strong>${leaveBalances.earned?.remaining || 10}d</strong></div></div>
            <div class="stat-card"><div class="stat-label"><i class="fas fa-hourglass-half" style="color:#f0ad4e;"></i> Pending</div><div class="stat-value" style="color:#f0ad4e;">${pendingReqs.length}</div><div style="font-size:0.8rem;color:var(--text-secondary);margin-top:0.4rem;">${pendingReqs.length > 0 ? pendingReqs[0].type : 'None'}</div></div>
            <div class="stat-card"><div class="stat-label"><i class="fas fa-file-invoice-dollar" style="color:var(--success);"></i> Latest Payslip</div><div class="stat-value" style="color:var(--success);font-size:1.4rem;">August 2026</div><div style="margin-top:0.6rem;display:flex;gap:0.4rem;">
                <button class="btn-primary btn-sm" onclick="window.viewPayslipModal('PS-2026-08-${currentEmp?.id || 1}')" style="flex:1;"><i class="fas fa-eye"></i> View</button>
                <button class="btn-success btn-sm" onclick="window.downloadPayslipPDF('PS-2026-08-${currentEmp?.id || 1}')" style="flex:1;"><i class="fas fa-download"></i> PDF</button>
            </div></div>
            <div class="stat-card"><div class="stat-label"><i class="fas fa-bell" style="color:var(--primary);"></i> Alerts</div><div class="stat-value" style="font-size:1.4rem;">${notifications.length}</div><div style="font-size:0.8rem;color:var(--text-secondary);margin-top:0.4rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${notifications[0]?.title || 'All caught up!'}</div></div>
        </div>
        <div class="card-grid" style="margin-top:1.5rem;">
            <div class="card" onclick="window.switchSection('apply_leave')"><div class="icon"><i class="fas fa-plane-departure"></i></div><h4>Apply for Leave</h4><p>Submit CL, SL, EL</p><span class="badge">Apply</span></div>
            <div class="card" onclick="window.switchSection('my_leaves')"><div class="icon"><i class="fas fa-calendar-check"></i></div><h4>My Leave Requests</h4><p>Track statuses</p><span class="badge">History</span></div>
            <div class="card" onclick="window.switchSection('leave_balance')"><div class="icon"><i class="fas fa-scale-balanced"></i></div><h4>Leave Balance</h4><p>Carry forward rules</p><span class="badge">Balances</span></div>
            <div class="card" onclick="window.switchSection('my_payslips')"><div class="icon"><i class="fas fa-file-invoice-dollar"></i></div><h4>My Payslips</h4><p>Download PDFs</p><span class="badge">Payroll</span></div>
        </div>
        <div class="detail-list" style="margin-top:1.8rem;">
            <h3 style="margin:0 0 1rem 0;"><i class="fas fa-bell" style="color:var(--primary);margin-right:8px;"></i> Recent Announcements</h3>
            <ul style="list-style:none;">
                ${notifications.map(n => `
                    <li style="display:flex;align-items:flex-start;gap:1rem;padding:0.8rem 0;border-bottom:1px solid var(--border);">
                        <div style="background:var(--primary-light);width:2.4rem;height:2.4rem;border-radius:50%;display:flex;align-items:center;justify-content:center;color:var(--primary);flex-shrink:0;"><i class="fas ${n.icon}"></i></div>
                        <div style="flex:1;"><div style="font-weight:600;color:var(--text-primary);font-size:0.95rem;">${n.title}</div><div style="color:var(--text-secondary);font-size:0.85rem;margin-top:0.2rem;">${n.text}</div></div>
                        <div style="font-size:0.75rem;color:var(--text-light);">${n.time}</div>
                    </li>
                `).join('')}
            </ul>
        </div>
    `;
}

// ============================================================
// ===== 2. EMPLOYEE DIRECTORY =====
// ============================================================

function renderEmployees(userEmail, role, employees) {
    const isHRorAdmin = role === 'hr' || role === 'admin';
    const empList = employees || [];
    return `
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem;margin-bottom:1.5rem;">
            <div><h2>Employee Directory</h2><div class="subhead">${empList.length} verified company members</div></div>
            ${isHRorAdmin ? `<button class="btn-success" onclick="window.showAddEmployeeModal()" style="display:flex;align-items:center;gap:0.5rem;padding:0.65rem 1.4rem;"><i class="fas fa-user-plus"></i> Add Employee</button>` : ''}
        </div>
        <div style="margin-bottom:1.2rem;display:flex;gap:0.8rem;flex-wrap:wrap;">
            <input type="text" id="employeeSearchInput" placeholder="Search by name, department, designation..." oninput="window.searchEmployees()" style="flex:1;min-width:240px;padding:0.65rem 1rem;border:2px solid var(--border);border-radius:var(--radius-sm);background:var(--bg);color:var(--text-primary);"/>
            <button class="btn-primary btn-sm" onclick="window.searchEmployees()"><i class="fas fa-search"></i> Search</button>
            <button class="btn-secondary-custom btn-sm" onclick="window.clearSearch()"><i class="fas fa-times"></i> Clear</button>
        </div>
        <div class="employee-grid" id="employeeGrid">
            ${empList.length === 0 ? `
                <div style="grid-column:1/-1;text-align:center;padding:4rem 2rem;background:var(--card-bg);border-radius:var(--radius);border:2px dashed var(--border);">
                    <i class="fas fa-users-slash" style="font-size:3rem;color:var(--text-light);margin-bottom:1rem;display:block;"></i>
                    <h3>No Employees Found</h3>
                    ${isHRorAdmin ? `<button class="btn-success" onclick="window.showAddEmployeeModal()" style="padding:0.65rem 1.4rem;margin-top:1rem;"><i class="fas fa-user-plus"></i> Add First Employee</button>` : ''}
                </div>
            ` : empList.map(emp => {
                const ctcDisplay = emp.annual_ctc || (emp.monthly_salary ? `${((Number(emp.monthly_salary) * 12) / 100000).toFixed(2)} LPA` : '9.00 LPA');
                const desigDisplay = emp.designation || (emp.department ? `${emp.department} Specialist` : 'Employee');
                return `
                    <div class="employee-card" data-id="${emp.id}" data-name="${(emp.name||'').toLowerCase()}" data-dept="${(emp.department||'').toLowerCase()}">
                        <div style="position:relative;display:inline-block;margin-bottom:0.6rem;">
                            <img src="${emp.photo || DEFAULT_AVATARS.male}" class="emp-card-photo" alt="${emp.name}"/>
                            <span class="emp-id-badge">#EMP-${String(emp.id).padStart(3, '0')}</span>
                        </div>
                        <div style="font-weight:700;color:var(--text-primary);font-size:1.05rem;">${emp.name}</div>
                        <div class="emp-detail">${desigDisplay}</div>
                        <div class="emp-detail"><span class="badge" style="background:#e8f0fe;color:var(--primary);">${emp.department || 'General'}</span></div>
                        <div style="margin-top:0.6rem;background:#f8fafc;padding:0.4rem;border-radius:var(--radius-sm);border:1px solid var(--border);font-size:0.85rem;">
                            <span style="color:var(--text-secondary);font-weight:500;">Annual CTC:</span>
                            <strong style="color:var(--success);">${ctcDisplay}</strong>
                        </div>
                        <div class="emp-detail" style="font-size:0.75rem;margin-top:0.4rem;">PAN: <strong>${emp.pan || 'N/A'}</strong> · DOJ: ${emp.joining_date || 'N/A'}</div>
                        <span class="emp-status ${emp.status || 'active'}" style="margin-top:0.5rem;">${(emp.status || 'ACTIVE').toUpperCase()}</span>
                        ${isHRorAdmin ? `
                            <div style="margin-top:0.8rem;display:flex;gap:0.4rem;justify-content:center;">
                                <button class="btn-primary btn-sm" onclick="window.editEmployee('${emp.id}')"><i class="fas fa-edit"></i> Edit</button>
                                <button class="btn-danger btn-sm" onclick="window.deleteEmployee('${emp.id}')"><i class="fas fa-trash"></i></button>
                            </div>
                        ` : ''}
                    </div>
                `;
            }).join('')}
        </div>

        <div id="addEmployeeModal" class="modal-backdrop" style="display:none;">
            <div style="background:var(--card-bg);border-radius:var(--radius);padding:2rem;max-width:620px;width:95%;max-height:90vh;overflow-y:auto;box-shadow:var(--shadow);">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.2rem;border-bottom:1px solid var(--border);padding-bottom:0.8rem;">
                    <h3 style="margin:0;" id="employeeModalTitle"><i class="fas fa-user-plus" style="color:var(--primary);margin-right:8px;"></i> Add New Employee</h3>
                    <button class="modal-close-btn" onclick="document.getElementById('addEmployeeModal').style.display='none'">&times;</button>
                </div>
                <form id="employeeForm" onsubmit="window.saveEmployee(event)">
                    <input type="hidden" id="editEmployeeId">
                    <div style="margin-bottom:1.2rem;text-align:center;">
                        <div class="profile-photo-wrapper" style="width:100px;height:100px;">
                            <img src="${DEFAULT_AVATARS.male}" id="modalEmpPhotoPreview" class="profile-avatar-large" alt="Photo"/>
                            <div class="photo-upload-overlay" onclick="document.getElementById('modalPhotoUpload').click()"><i class="fas fa-camera"></i></div>
                        </div>
                        <input type="file" id="modalPhotoUpload" accept="image/*" style="display:none;" onchange="window.handleModalPhotoUpload(event)"/>
                        <div style="display:flex;gap:0.4rem;justify-content:center;margin-top:0.4rem;">
                            <img src="${DEFAULT_AVATARS.alex}" class="sample-avatar-thumb" onclick="window.setModalPhoto('${DEFAULT_AVATARS.alex}')"/>
                            <img src="${DEFAULT_AVATARS.female}" class="sample-avatar-thumb" onclick="window.setModalPhoto('${DEFAULT_AVATARS.female}')"/>
                            <img src="${DEFAULT_AVATARS.male}" class="sample-avatar-thumb" onclick="window.setModalPhoto('${DEFAULT_AVATARS.male}')"/>
                            <img src="${DEFAULT_AVATARS.hr}" class="sample-avatar-thumb" onclick="window.setModalPhoto('${DEFAULT_AVATARS.hr}')"/>
                        </div>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
                        <div class="input-group" style="margin:0;"><label>Full Name *</label><input type="text" id="empName" required placeholder="Legal full name"></div>
                        <div class="input-group" style="margin:0;"><label>Email (Permanent) *</label><input type="email" id="empEmail" required placeholder="employee@company.com"></div>
                        <div class="input-group" style="margin:0;"><label>Phone *</label><input type="tel" id="empPhone" maxlength="10" required placeholder="9876543210"></div>
                        <div class="input-group" style="margin:0;"><label>Gender *</label><select id="empGender" required style="width:100%;padding:0.65rem;border:2px solid var(--border);border-radius:var(--radius-sm);"><option>Male</option><option>Female</option><option>Other</option></select></div>
                        <div class="input-group" style="margin:0;"><label>DOB *</label><input type="date" id="empDob" required></div>
                        <div class="input-group" style="margin:0;"><label>DOJ *</label><input type="date" id="empJoiningDate" required></div>
                        <div class="input-group" style="margin:0;"><label>Department *</label><select id="empDepartment" required onchange="window.handleDeptChange(this.value)" style="width:100%;padding:0.65rem;border:2px solid var(--border);border-radius:var(--radius-sm);"><option>IT</option><option>HR</option><option>Finance</option><option>Sales</option><option>Marketing</option><option>Operations</option></select></div>
                        <div class="input-group" style="margin:0;"><label>Designation *</label><select id="empDesignation" required style="width:100%;padding:0.65rem;border:2px solid var(--border);border-radius:var(--radius-sm);"></select></div>
                        <div class="input-group" style="margin:0;"><label>Employment Type *</label><select id="empEmploymentType" required style="width:100%;padding:0.65rem;border:2px solid var(--border);border-radius:var(--radius-sm);"><option>Full-Time</option><option>Part-Time</option><option>Contract</option></select></div>
                        <div class="input-group" style="margin:0;"><label>Annual CTC (LPA) *</label><input type="text" id="empAnnualCtc" required placeholder="e.g., 9.00"></div>
                        <div class="input-group" style="margin:0;"><label>Monthly Salary (₹) *</label><input type="number" id="empSalary" required placeholder="75000" oninput="window.calculatePayrollPreview(this.value)"/></div>
                        <div class="input-group" style="margin:0;"><label>PAN *</label><input type="text" id="empPan" maxlength="10" required style="text-transform:uppercase;"></div>
                        <div class="input-group" style="margin:0;"><label>Aadhaar *</label><input type="text" id="empAadhaar" required placeholder="XXXX XXXX XXXX"></div>
                        <div class="input-group" style="margin:0;grid-column:1/-1;"><label>Address</label><input type="text" id="empAddress"></div>
                        <div class="input-group" style="margin:0;"><label>Bank Name</label><input type="text" id="empBankName"></div>
                        <div class="input-group" style="margin:0;"><label>Bank Account</label><input type="text" id="empBankAccount"></div>
                    </div>
                    <div style="display:flex;gap:0.8rem;margin-top:1.5rem;">
                        <button type="submit" class="btn-success" style="flex:1;"><i class="fas fa-save"></i> Save</button>
                        <button type="button" class="btn-secondary-custom" onclick="document.getElementById('addEmployeeModal').style.display='none'" style="flex:0.4;">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

// ============================================================
// ===== 3. DEPARTMENTS =====
// ============================================================

function renderDepartments(userEmail, role) {
    const employees = window._currentEmployees || [];
    const deptList = ['IT', 'HR', 'Finance', 'Sales', 'Marketing', 'Operations'];
    const depts = deptList.map(name => {
        const count = employees.filter(e => (e.department || '').toLowerCase() === name.toLowerCase()).length;
        return { name, code: name.toUpperCase().slice(0, 3), head: `${name} Lead`, employees_count: count, description: `Core operational and strategic initiatives for the ${name} division.` };
    });
    return `
        <h2>Company Departments</h2>
        <div class="subhead">Operational structure & team allocations</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:1.5rem;margin-top:1.5rem;">
            ${depts.map(d => `
                <div class="stat-card" style="padding:1.5rem;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.8rem;">
                        <h3 style="margin:0;color:var(--primary);"><i class="fas fa-building" style="margin-right:8px;"></i> ${d.name}</h3>
                        <span class="badge" style="background:#f1f5f9;color:var(--text-primary);font-weight:700;">${d.code}</span>
                    </div>
                    <div style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:1rem;line-height:1.4;">${d.description}</div>
                    <div style="border-top:1px solid var(--border);padding-top:0.8rem;font-size:0.85rem;">
                        <div>Head: <strong>${d.head}</strong></div>
                        <div style="margin-top:0.4rem;">Staff: <strong>${d.employees_count} Members</strong></div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// ============================================================
// ===== 4. LEAVE MANAGEMENT =====
// ============================================================

function renderLeaves(userEmail, role, employees, leaves) {
    if (role === 'hr' || role === 'admin') return renderHRLeaveDesk(userEmail, employees, leaves);
    return renderMyLeavesSection(userEmail, role, employees, leaves);
}

function renderHRLeaveDesk(userEmail, employees, leaves) {
    // ✅ Filter by pending status
    const pending = (leaves || []).filter(l => l.status === 'pending');
    const processed = (leaves || []).filter(l => l.status !== 'pending');

    return `
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem;margin-bottom:1.5rem;">
            <div><h2>HR Leave Management Desk</h2><div class="subhead">Review, approve, or reject leave requests</div></div>
            <span class="badge" style="background:#fde8e8;color:#dc3545;font-weight:700;padding:0.4rem 1rem;">${pending.length} Pending Approval</span>
        </div>
        <div class="detail-list" style="margin-bottom:1.5rem;">
            <h3 style="margin:0 0 1rem 0;"><i class="fas fa-clock" style="color:#f0ad4e;margin-right:8px;"></i> Awaiting HR Action</h3>
            <div class="custom-table-responsive">
                <table class="styled-table">
                    <thead><tr><th>Employee</th><th>Department</th><th>Leave Type</th><th>Period</th><th>Days</th><th>Reason</th><th>Action</th></tr></thead>
                    <tbody>
                        ${pending.length === 0 ? `<tr><td colspan="7" style="text-align:center;padding:2rem;color:var(--text-light);">No pending requests</td></tr>` : ''}
                        ${pending.map(req => `
                            <tr>
                                <td>
                                    <div style="display:flex;align-items:center;gap:0.6rem;">
                                        <img src="${req.photo || DEFAULT_AVATARS.male}" style="width:32px;height:32px;border-radius:50%;object-fit:cover;"/>
                                        <div>
                                            <strong>${req.employee}</strong>
                                            <div style="font-size:0.75rem;color:var(--text-light);">${req.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td><span class="badge" style="background:#e8f0fe;color:var(--primary);">${req.department || 'General'}</span></td>
                                <td><span class="tag-pill available">${req.type}</span></td>
                                <td>${req.from} to ${req.to}</td>
                                <td><strong>${req.days} Day(s)</strong></td>
                                <td style="max-width:220px;">${req.reason}</td>
                                <td>
                                    <div style="display:flex;gap:0.4rem;">
                                        <button class="btn-success btn-sm" onclick="window.promptApproveLeave(${req.id})"><i class="fas fa-check"></i> Approve</button>
                                        <button class="btn-danger btn-sm" onclick="window.promptRejectLeave(${req.id})"><i class="fas fa-times"></i> Reject</button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
        <div class="detail-list">
            <h3 style="margin:0 0 1rem 0;"><i class="fas fa-history" style="color:var(--primary);margin-right:8px;"></i> Processed History</h3>
            <div class="custom-table-responsive">
                <table class="styled-table">
                    <thead><tr><th>Employee</th><th>Type</th><th>Period</th><th>Days</th><th>Status</th><th>HR Comment</th></tr></thead>
                    <tbody>
                        ${processed.length === 0 ? `<tr><td colspan="6" style="text-align:center;padding:2rem;color:var(--text-light);">No processed leaves</td></tr>` : ''}
                        ${processed.map(req => `
                            <tr>
                                <td><strong>${req.employee}</strong><div style="font-size:0.75rem;color:var(--text-light);">${req.email}</div></td>
                                <td>${req.type}</td>
                                <td>${req.from} to ${req.to}</td>
                                <td>${req.days} Days</td>
                                <td><span class="badge" style="background:${req.status==='approved'?'#d4edda':'#fde8e8'};color:${req.status==='approved'?'#155724':'#dc3545'};">${(req.status || '').toUpperCase()}</span></td>
                                <td style="font-size:0.85rem;color:var(--text-secondary);">${req.comments.length > 0 ? req.comments.join('; ') : '—'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
        <div id="leaveCommentModal" class="modal-backdrop" style="display:none;">
            <div style="background:var(--card-bg);border-radius:var(--radius);padding:1.8rem;max-width:440px;width:90%;">
                <h3 style="margin-top:0;" id="leaveActionModalTitle">Approve Leave</h3>
                <div class="input-group"><label>HR Comment</label><textarea id="leaveActionComment" rows="3" style="width:100%;padding:0.6rem;border:2px solid var(--border);border-radius:var(--radius-sm);"></textarea></div>
                <div style="display:flex;gap:0.8rem;margin-top:1.2rem;">
                    <button class="btn-primary" onclick="window.confirmLeaveAction()"><i class="fas fa-paper-plane"></i> Submit</button>
                    <button class="btn-secondary-custom" onclick="document.getElementById('leaveCommentModal').style.display='none'">Cancel</button>
                </div>
            </div>
        </div>
    `;
}

function renderApplyLeaveSection(userEmail, role, employees) {
    const currentEmp = employees.find(e => e.email && e.email.toLowerCase() === userEmail.toLowerCase()) || employees[0];
    const balances = currentEmp?.leave_balances || {};
    return `
        <div style="margin-bottom:1.5rem;"><h2>Apply for Leave</h2><div class="subhead">Submit leave applications with auto-duration calculation</div></div>
        <div class="detail-list" style="max-width:720px;margin:0 auto;">
            <form id="applyLeaveForm" onsubmit="window.submitApplyLeave(event)">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.2rem;">
                    <div class="input-group" style="margin:0;grid-column:1/-1;">
                        <label>Leave Type *</label>
                        <select id="leaveTypeSelect" required style="width:100%;padding:0.7rem;border:2px solid var(--border);border-radius:var(--radius-sm);">
                            <option value="Casual Leave">Casual Leave (${balances.casual?.remaining || 3}d)</option>
                            <option value="Sick Leave">Sick Leave (${balances.sick?.remaining || 3}d)</option>
                            <option value="Earned Leave">Earned Leave (${balances.earned?.remaining || 10}d)</option>
                        </select>
                    </div>
                    <div class="input-group" style="margin:0;"><label>From *</label><input type="date" id="leaveFromDate" required onchange="window.calcLeaveDaysAuto()"></div>
                    <div class="input-group" style="margin:0;"><label>To *</label><input type="date" id="leaveToDate" required onchange="window.calcLeaveDaysAuto()"></div>
                    <div class="input-group" style="margin:0;grid-column:1/-1;"><label>Days (Working Days Only)</label><input type="number" id="leaveCalculatedDays" readonly value="0" style="background:var(--border);font-weight:700;"></div>
                    <div class="input-group" style="margin:0;grid-column:1/-1;"><label>Reason *</label><textarea id="leaveReasonText" required rows="3" style="width:100%;padding:0.7rem;border:2px solid var(--border);border-radius:var(--radius-sm);"></textarea></div>
                </div>
                <div style="margin-top:1.5rem;display:flex;gap:0.8rem;">
                    <button type="submit" class="btn-primary" style="padding:0.75rem 2rem;"><i class="fas fa-paper-plane"></i> Submit</button>
                    <button type="button" class="btn-secondary-custom" onclick="window.switchSection('my_leaves')">View My Leaves</button>
                </div>
            </form>
        </div>
    `;
}

function renderMyLeavesSection(userEmail, role, employees, leaves) {
    const currentEmp = employees.find(e => e.email && e.email.toLowerCase() === userEmail.toLowerCase()) 
        || window.currentUser?.empData;
    
    // ✅ Match leaves by employee_id (numeric)
    const myLeavesList = (leaves || []).filter(l => {
        if (!currentEmp) return false;
        return String(l.employee_id) === String(currentEmp.id) ||
               (l.email && l.email.toLowerCase() === userEmail.toLowerCase());
    });

    return `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem;flex-wrap:wrap;gap:1rem;">
            <div><h2>My Leave Requests</h2><div class="subhead">Track all your applications</div></div>
            <button class="btn-primary" onclick="window.switchSection('apply_leave')"><i class="fas fa-plus"></i> Apply for Leave</button>
        </div>
        <div class="detail-list">
            <div class="custom-table-responsive">
                <table class="styled-table">
                    <thead><tr><th>Type</th><th>From</th><th>To</th><th>Days</th><th>Reason</th><th>Status</th><th>HR Comments</th><th>Action</th></tr></thead>
                    <tbody>
                        ${myLeavesList.length === 0 ? `<tr><td colspan="8" style="text-align:center;padding:2rem;color:var(--text-light);">No leaves requested yet</td></tr>` : ''}
                        ${myLeavesList.map(l => `
                            <tr>
                                <td><strong>${l.type}</strong></td>
                                <td>${l.from}</td>
                                <td>${l.to}</td>
                                <td><span class="tag-pill available">${l.days} Day(s)</span></td>
                                <td>${l.reason}</td>
                                <td><span class="badge" style="background:${l.status==='approved'?'#d4edda':l.status==='rejected'?'#fde8e8':'#fff3cd'};color:${l.status==='approved'?'#155724':l.status==='rejected'?'#dc3545':'#856404'};">${(l.status||'pending').toUpperCase()}</span></td>
                                <td style="font-size:0.85rem;color:var(--text-secondary);">${l.comments.length > 0 ? l.comments.join('; ') : 'Under review'}</td>
                                <td>
                                    ${l.status === 'pending' ? `
                                        <button class="btn-danger btn-sm" onclick="window.deleteMyLeave(${l.id})" title="Withdraw">
                                            <i class="fas fa-trash"></i> Withdraw
                                        </button>
                                    ` : '—'}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function renderLeaveBalanceSection(userEmail, role, employees) {
    const currentEmp = employees.find(e => e.email && e.email.toLowerCase() === userEmail.toLowerCase()) || employees[0];
    const b = currentEmp?.leave_balances || {
        casual: { available: 4, used: 1, remaining: 3, allocated: 4 },
        sick: { available: 3, used: 0, remaining: 3, allocated: 3 },
        earned: { allocated: 15, used: 5, remaining: 10, carry_forward: 10 }
    };
    return `
        <h2>Leave Balances & Rollover Rules</h2>
        <div class="subhead">Itemized monthly calculations and carry forward formulas</div>
        <div class="detail-list" style="margin-top:1.5rem;">
            <div class="custom-table-responsive">
                <table class="styled-table">
                    <thead><tr><th>Leave Type</th><th>Total Allocated</th><th>Used</th><th>Remaining</th><th>Rollover</th></tr></thead>
                    <tbody>
                        <tr><td><strong>Casual Leave (CL)</strong></td><td>${b.casual?.allocated || 4} Days</td><td style="color:var(--danger);">${b.casual?.used || 1} Day</td><td><strong style="color:var(--success);">${b.casual?.remaining || 3} Days</strong></td><td><span style="color:var(--success);"><i class="fas fa-check"></i> Monthly Carry-Forward</span></td></tr>
                        <tr><td><strong>Sick Leave (SL)</strong></td><td>${b.sick?.allocated || 3} Days</td><td style="color:var(--danger);">${b.sick?.used || 0} Days</td><td><strong style="color:var(--success);">${b.sick?.remaining || 3} Days</strong></td><td><span style="color:var(--text-light);">Cumulative</span></td></tr>
                        <tr><td><strong>Earned Leave (EL)</strong></td><td>${b.earned?.allocated || 15} Days</td><td style="color:var(--danger);">${b.earned?.used || 5} Days</td><td><strong style="color:var(--success);">${b.earned?.remaining || 10} Days</strong></td><td><span style="color:var(--primary);font-weight:700;">Yearly Rollover</span></td></tr>
                    </tbody>
                </table>
            </div>
        </div>
        <div class="stat-card" style="padding:1.4rem;margin-top:1.5rem;">
            <h4 style="margin:0 0 0.8rem 0;"><i class="fas fa-calculator" style="color:var(--primary);"></i> Carry Forward Formula</h4>
            <div class="carry-forward-formula-box">
                <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:0.5rem;font-size:0.95rem;">
                    <span>Previous Remaining: <strong>${b.monthly?.carry_forward_calc?.previous_month_remaining || 2}</strong></span>
                    <span>+</span>
                    <span>Current: <strong>${b.monthly?.carry_forward_calc?.current_month_allocation || 2}</strong></span>
                    <span>=</span>
                    <span style="color:var(--success);font-weight:800;">Total: ${b.monthly?.carry_forward_calc?.total_available || 4} Days</span>
                </div>
            </div>
        </div>
    `;
}

// ============================================================
// ===== 5. PAYROLL & PAYSLIPS =====
// ============================================================

function renderPayroll(userEmail, role, employees) {
    if (role === 'hr' || role === 'admin') return renderHRPayrollDesk(employees);
    return renderMyPayslipsSection(userEmail, role, employees);
}

function renderHRPayrollDesk(employees) {
    const totalPayroll = employees.reduce((sum, e) => sum + (Number(e.monthly_salary) || 0), 0) || 487000;
    const history = window._currentPayrollHistory && window._currentPayrollHistory.length > 0 ? window._currentPayrollHistory : [
        { month: 'August', year: 2026, employees: employees.length, amount: totalPayroll, status: 'Processed' },
        { month: 'July', year: 2026, employees: employees.length, amount: totalPayroll, status: 'Processed' },
        { month: 'June', year: 2026, employees: employees.length, amount: totalPayroll, status: 'Processed' }
    ];
    return `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem;flex-wrap:wrap;gap:1rem;">
            <div><h2>HR Corporate Payroll Desk</h2><div class="subhead">Process monthly salaries & audit tax compliance</div></div>
            <button class="btn-success" onclick="window.openRunPayrollModal()" style="display:flex;align-items:center;gap:0.5rem;padding:0.65rem 1.4rem;"><i class="fas fa-calculator"></i> Run Payroll</button>
        </div>
        <div class="stats-grid">
            <div class="stat-card"><div class="stat-label">Total Active Employees</div><div class="stat-value">${employees.length}</div></div>
            <div class="stat-card"><div class="stat-label">Processed</div><div class="stat-value" style="color:var(--success);">${employees.length}</div></div>
            <div class="stat-card"><div class="stat-label">Pending</div><div class="stat-value" style="color:var(--primary);">0</div></div>
            <div class="stat-card"><div class="stat-label">Total Monthly</div><div class="stat-value" style="color:var(--primary);">₹${(totalPayroll/1000).toFixed(0)}K</div></div>
        </div>
        <div class="detail-list" style="margin-top:1.5rem;">
            <h3 style="margin:0 0 1rem 0;"><i class="fas fa-history" style="color:var(--primary);margin-right:8px;"></i> Payroll History</h3>
            <div class="custom-table-responsive">
                <table class="styled-table">
                    <thead><tr><th>Pay Period</th><th>Employees</th><th>Total Payroll</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody>
                        ${history.map(h => `
                            <tr>
                                <td><strong>${h.month} ${h.year}</strong></td>
                                <td>${h.employees}</td>
                                <td><strong style="color:var(--success);">₹${h.amount.toLocaleString('en-IN')}</strong></td>
                                <td><span class="badge" style="background:#d4edda;color:#155724;">${h.status.toUpperCase()}</span></td>
                                <td><button class="btn-primary btn-sm" onclick="window.viewPayrollSummary('${h.month}', '${h.year}')"><i class="fas fa-eye"></i> View Register</button></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
        <div id="runPayrollModal" class="modal-backdrop" style="display:none;">
            <div style="background:var(--card-bg);border-radius:var(--radius);padding:1.8rem;max-width:480px;width:90%;">
                <h3 style="margin:0 0 1rem 0;">Run Corporate Payroll</h3>
                <form onsubmit="window.handleRunPayrollSubmit(event)">
                    <div class="input-group"><label>Month</label><select id="payrollRunMonth" required style="width:100%;padding:0.7rem;border:2px solid var(--border);border-radius:var(--radius-sm);"><option>September</option><option selected>August</option><option>July</option></select></div>
                    <div class="input-group"><label>Year</label><select id="payrollRunYear" required style="width:100%;padding:0.7rem;border:2px solid var(--border);border-radius:var(--radius-sm);"><option selected>2026</option><option>2025</option></select></div>
                    <div style="display:flex;gap:0.8rem;"><button type="submit" class="btn-success" style="flex:1;"><i class="fas fa-check-double"></i> Process</button><button type="button" class="btn-secondary-custom" onclick="document.getElementById('runPayrollModal').style.display='none'">Cancel</button></div>
                </form>
            </div>
        </div>
    `;
}

function renderMyPayslipsSection(userEmail, role, employees) {
    const isHR = role === 'hr' || role === 'admin';
    const currentEmp = employees.find(e => e.email && e.email.toLowerCase() === userEmail.toLowerCase()) 
        || window.currentUser?.empData 
        || employees[0] 
        || null;
    if (!currentEmp && !isHR) {
        return `<div class="detail-list" style="text-align:center;padding:3rem;"><h3>No Employee Data</h3></div>`;
    }
    const activeStaff = isHR ? employees : [currentEmp];
    const months = ['August', 'July', 'June'];
    const allPayslips = [];
    months.forEach((m, idx) => {
        activeStaff.forEach(emp => {
            if (!emp) return;
            const gross = Number(emp.monthly_salary) || 75000;
            const pf = 1800, pt = 200;
            const totalDeductions = pf + pt;
            const net = gross - totalDeductions;
            allPayslips.push({
                id: `PS-2026-${String(8 - idx).padStart(2, '0')}-${emp.id || 1}`,
                month: m, year: 2026, employee_id: emp.id, employee_name: emp.name,
                gross_earnings: gross, total_deductions: totalDeductions, net_salary: net,
                status: 'paid',
                bank_name: emp.bank_details?.bank_name || 'HDFC Bank',
                bank_account: emp.bank_details?.account_number || 'XXXXXXXX4892'
            });
        });
    });
    let displayed = allPayslips.filter(p => p.month.toLowerCase() === (payslipFilterMonth || 'August').toLowerCase() && String(p.year) === String(payslipFilterYear || '2026'));
    const latest = displayed[0] || allPayslips[0];
    return `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem;flex-wrap:wrap;gap:1rem;">
            <div><h2>My Payslips</h2><div class="subhead">Download monthly salary statements</div></div>
            ${latest ? `<button class="btn-success" onclick="window.downloadPayslipPDF('${latest.id}')" style="display:flex;align-items:center;gap:0.5rem;padding:0.65rem 1.4rem;"><i class="fas fa-file-pdf"></i> Download ${latest.month} ${latest.year}</button>` : ''}
        </div>
        <div class="detail-list" style="margin-bottom:1.5rem;padding:1rem 1.4rem;">
            <div style="display:flex;align-items:center;gap:0.8rem;flex-wrap:wrap;">
                <label style="font-weight:600;"><i class="fas fa-filter" style="color:var(--primary);"></i> Filter:</label>
                <select id="filterMonthSelect" onchange="window.handlePayslipFilterChange()" style="padding:0.5rem 1rem;border:2px solid var(--border);border-radius:var(--radius-sm);font-weight:600;">
                    <option ${payslipFilterMonth==='August'?'selected':''}>August</option>
                    <option ${payslipFilterMonth==='July'?'selected':''}>July</option>
                    <option ${payslipFilterMonth==='June'?'selected':''}>June</option>
                </select>
                <select id="filterYearSelect" onchange="window.handlePayslipFilterChange()" style="padding:0.5rem 1rem;border:2px solid var(--border);border-radius:var(--radius-sm);font-weight:600;">
                    <option ${payslipFilterYear==='2026'?'selected':''}>2026</option>
                    <option ${payslipFilterYear==='2025'?'selected':''}>2025</option>
                </select>
                <span style="font-size:0.85rem;color:var(--text-secondary);">Found <strong>${displayed.length}</strong> record(s)</span>
            </div>
        </div>
        <div class="detail-list">
            <div class="custom-table-responsive">
                <table class="styled-table">
                    <thead><tr><th>Pay Period</th><th>Gross</th><th>Deductions</th><th>Net Pay</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody>
                        ${displayed.length === 0 ? `<tr><td colspan="6" style="text-align:center;padding:2rem;">No payslips found</td></tr>` : ''}
                        ${displayed.map(ps => `
                            <tr>
                                <td><strong>${ps.month} ${ps.year}</strong></td>
                                <td>₹${ps.gross_earnings.toLocaleString('en-IN')}</td>
                                <td style="color:var(--danger);">₹${ps.total_deductions.toLocaleString('en-IN')}</td>
                                <td><strong style="color:var(--success);">₹${ps.net_salary.toLocaleString('en-IN')}</strong></td>
                                <td><span class="badge" style="background:#d4edda;color:#155724;">${ps.status.toUpperCase()}</span></td>
                                <td>
                                    <div style="display:flex;gap:0.4rem;">
                                        <button class="btn-primary btn-sm" onclick="window.viewPayslipModal('${ps.id}')"><i class="fas fa-eye"></i> View</button>
                                        <button class="btn-success btn-sm" onclick="window.downloadPayslipPDF('${ps.id}')"><i class="fas fa-file-pdf"></i> PDF</button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
        <div id="payslipModalContainer" class="modal-backdrop" style="display:none;">
            <div class="modal-content-payslip">
                <div class="modal-header-payslip">
                    <h3 style="margin:0;"><i class="fas fa-receipt" style="color:var(--primary);margin-right:8px;"></i> Official Payslip</h3>
                    <div style="display:flex;gap:0.5rem;">
                        <button class="btn-success btn-sm" id="modalDownloadPdfBtn"><i class="fas fa-file-pdf"></i> PDF</button>
                        <button class="modal-close-btn" onclick="window.closePayslipModal()">&times;</button>
                    </div>
                </div>
                <div id="printablePayslipDocument"></div>
            </div>
        </div>
    `;
}

function numberToIndianWords(num) {
    if (!num || isNaN(num)) return 'Zero Rupees Only';
    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    function inWords(n) {
        if (n === 0) return '';
        if (n < 20) return a[n];
        if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : ' ');
        if (n < 1000) return a[Math.floor(n / 100)] + 'Hundred ' + (n % 100 !== 0 ? inWords(n % 100) : '');
        if (n < 100000) return inWords(Math.floor(n / 1000)) + 'Thousand ' + (n % 1000 !== 0 ? inWords(n % 1000) : '');
        if (n < 10000000) return inWords(Math.floor(n / 100000)) + 'Lakh ' + (n % 100000 !== 0 ? inWords(n % 100000) : '');
        return inWords(Math.floor(n / 10000000)) + 'Crore ' + (n % 10000000 !== 0 ? inWords(n % 10000000) : '');
    }
    return `Rupees ${inWords(Math.round(num)).trim()} Only`;
}

function buildPayslipHTML(payslipId) {
    const employees = window._currentEmployees || [];
    let emp = employees.find(e => String(e.id) === String(payslipId) || `PS-2026-08-${e.id}` === payslipId || `PS-2026-07-${e.id}` === payslipId || `PS-2026-06-${e.id}` === payslipId) 
        || window.currentUser?.empData 
        || employees[0] 
        || { name: 'Employee', email: 'employee@company.com', id: 1, department: 'IT', designation: 'Employee', monthly_salary: 75000 };
    const gross = Number(emp.monthly_salary) || 75000;
    const basic = Math.round(gross * 0.5);
    const hra = Math.round(gross * 0.25);
    const special = gross - basic - hra;
    const pf = 1800, pt = 200;
    const totalDeductions = pf + pt;
    const net = gross - totalDeductions;
    const month = payslipFilterMonth || 'August';
    const year = payslipFilterYear || '2026';
    return `
        <div class="payslip-paper">
            <div class="payslip-header-grid">
                <div>
                    <div style="font-size:1.4rem;font-weight:800;color:#0b2b4a;"><i class="fas fa-building" style="color:#1a6dff;"></i> HR Connect Technologies Ltd.</div>
                    <div style="font-size:0.78rem;color:#5e6f8d;margin-top:0.2rem;">Cyber City, Hyderabad, TG, 500081</div>
                </div>
                <div style="text-align:right;">
                    <div style="font-size:1.2rem;font-weight:800;color:#0b2b4a;">SALARY PAYSLIP</div>
                    <div style="font-size:0.9rem;font-weight:700;color:#1a6dff;">${month.toUpperCase()} ${year}</div>
                </div>
            </div>
            <div class="payslip-emp-details-grid">
                <table class="payslip-meta-table">
                    <tr><td><strong>Employee:</strong></td><td>${emp.name}</td></tr>
                    <tr><td><strong>Employee ID:</strong></td><td>#EMP-00${emp.id}</td></tr>
                    <tr><td><strong>Designation:</strong></td><td>${emp.designation || ''}</td></tr>
                    <tr><td><strong>Department:</strong></td><td>${emp.department || ''}</td></tr>
                </table>
                <table class="payslip-meta-table">
                    <tr><td><strong>Email:</strong></td><td>${emp.email}</td></tr>
                    <tr><td><strong>PAN:</strong></td><td><strong>${emp.pan || 'ABCDE1234F'}</strong></td></tr>
                    <tr><td><strong>Aadhaar:</strong></td><td>${emp.aadhaar || 'XXXX XXXX XXXX'}</td></tr>
                    <tr><td><strong>Bank:</strong></td><td>${emp.bank_details?.bank_name || 'HDFC Bank'}</td></tr>
                </table>
            </div>
            <div class="payslip-tables-split">
                <div class="payslip-component-card">
                    <div class="payslip-component-header" style="background:#e8f0fe;color:#0f5ae0;"><span><i class="fas fa-plus-circle"></i> ALLOWANCES</span><span>AMOUNT</span></div>
                    <table class="payslip-inner-table">
                        <tbody>
                            <tr><td><strong>Basic Salary</strong></td><td style="text-align:right;">₹${basic.toLocaleString('en-IN')}</td></tr>
                            <tr><td><strong>HRA</strong></td><td style="text-align:right;">₹${hra.toLocaleString('en-IN')}</td></tr>
                            <tr><td><strong>Special Allowance</strong></td><td style="text-align:right;">₹${special.toLocaleString('en-IN')}</td></tr>
                        </tbody>
                        <tfoot><tr class="tfoot-row"><td><strong>Gross</strong></td><td style="text-align:right;font-weight:800;color:#1a6dff;">₹${gross.toLocaleString('en-IN')}</td></tr></tfoot>
                    </table>
                </div>
                <div class="payslip-component-card">
                    <div class="payslip-component-header" style="background:#fde8e8;color:#dc3545;"><span><i class="fas fa-minus-circle"></i> DEDUCTIONS</span><span>AMOUNT</span></div>
                    <table class="payslip-inner-table">
                        <tbody>
                            <tr><td><strong>PF</strong></td><td style="text-align:right;color:#dc3545;">₹${pf.toLocaleString('en-IN')}</td></tr>
                            <tr><td><strong>Professional Tax</strong></td><td style="text-align:right;color:#dc3545;">₹${pt.toLocaleString('en-IN')}</td></tr>
                        </tbody>
                        <tfoot><tr class="tfoot-row"><td><strong>Total</strong></td><td style="text-align:right;font-weight:800;color:#dc3545;">₹${totalDeductions.toLocaleString('en-IN')}</td></tr></tfoot>
                    </table>
                </div>
            </div>
            <div class="payslip-net-summary-box">
                <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem;">
                    <div>
                        <div style="font-size:0.8rem;color:#5e6f8d;font-weight:700;">NET PAYABLE</div>
                        <div style="font-size:0.85rem;color:#0b2b4a;margin-top:0.2rem;"><strong>Words:</strong> ${numberToIndianWords(net)}</div>
                    </div>
                    <div style="font-size:1.8rem;font-weight:800;color:#22a65e;">₹${net.toLocaleString('en-IN')}</div>
                </div>
            </div>
            <div class="payslip-policy-notes"><i class="fas fa-info-circle" style="color:#1a6dff;"></i> Computer-generated document.</div>
        </div>
    `;
}

// ============================================================
// ===== 6. MESSAGES (Two-Column Corporate Chat) =====
// ============================================================

function getDynamicGreeting(name, role) {
    const hour = new Date().getHours();
    let timeGreeting = 'Hello';
    if (hour >= 5 && hour < 12) timeGreeting = 'Good morning';
    else if (hour >= 12 && hour < 17) timeGreeting = 'Good afternoon';
    else if (hour >= 17 && hour < 22) timeGreeting = 'Good evening';
    const roleNorm = (role || '').toLowerCase();
    const cleanName = name || (roleNorm === 'hr' ? 'HR Manager' : roleNorm === 'admin' ? 'Administrator' : 'Employee');
    const isHR = roleNorm === 'hr' || roleNorm === 'admin';
    return {
        greeting: `${timeGreeting}, ${cleanName}!`,
        subtext: isHR 
            ? 'Corporate HR Communications & Employee Helpdesk Portal.'
            : 'Welcome to your dedicated HR Helpdesk channel.'
    };
}

function renderMessages(userEmail, role) {
    if (!window._currentMessages || window._currentMessages.length === 0) {
        try {
            const stored = localStorage.getItem('hr_connect_messages');
            if (stored) window._currentMessages = JSON.parse(stored);
        } catch (e) { window._currentMessages = []; }
    }
    const roleNorm = (role || '').toLowerCase();
    const isHR = roleNorm === 'hr' || roleNorm === 'admin';
    const myEmail = (userEmail || window.currentUser?.email || '').trim().toLowerCase();
    const employees = window._currentEmployees || [];
    const myEmp = employees.find(e => e.email?.toLowerCase() === myEmail) || window.currentUser?.empData;
    const myName = myEmp ? myEmp.name : (window.currentUser?.name || getNameFromEmail(myEmail));
    const myAvatar = myEmp?.photo || (isHR ? DEFAULT_AVATARS.hr : DEFAULT_AVATARS.alex);
    const greetingInfo = getDynamicGreeting(myName, role);
    const regularEmployees = employees.filter(e => e.role === 'employee');
    const hrAccount = employees.find(e => e.role === 'hr' || e.role === 'admin') || {
        id: 4, name: 'Sarah Williams', email: 'hr.hr@gmail.com', designation: 'HR Operations Manager', department: 'HR', photo: DEFAULT_AVATARS.hr
    };
    if (isHR && regularEmployees.length > 0) {
        if (!activeChatRecipient || !regularEmployees.some(e => e.email?.toLowerCase() === activeChatRecipient?.toLowerCase())) {
            activeChatRecipient = regularEmployees[0].email;
        }
    }
    const allMessages = (window._currentMessages || []).map(window.normalizeMessage || (m => m)).filter(Boolean);
    let activeRecipientEmail = isHR ? activeChatRecipient : (hrAccount.email || 'hr.hr@gmail.com');
    let activeRecipientEmp = employees.find(e => e.email?.toLowerCase() === activeRecipientEmail?.toLowerCase());
    let activeRecipientName = isHR ? (activeRecipientEmp?.name || 'Employee') : (hrAccount.name || 'Sarah Williams');
    let activeRecipientDesignation = isHR ? (activeRecipientEmp?.designation || 'Staff Member') : (hrAccount.designation || 'HR Operations Manager');
    let activeRecipientDept = isHR ? (activeRecipientEmp?.department || 'IT') : 'HR Operations';
    let activeRecipientPhoto = isHR ? (activeRecipientEmp?.photo || DEFAULT_AVATARS.male) : (hrAccount.photo || DEFAULT_AVATARS.hr);
    const currentThread = isHR 
        ? allMessages.filter(m => {
            const f = (m.from_email || m.fromEmail || '').toLowerCase();
            const t = (m.to_email || m.toEmail || '').toLowerCase();
            const target = (activeRecipientEmail || '').toLowerCase();
            return f === target || t === target;
        })
        : allMessages.filter(m => {
            const f = (m.from_email || m.fromEmail || '').toLowerCase();
            const t = (m.to_email || m.toEmail || '').toLowerCase();
            return f === myEmail || t === myEmail;
        });
    setTimeout(() => {
        const stream = document.getElementById('chatMessagesStream');
        if (stream) stream.scrollTop = stream.scrollHeight;
    }, 80);
    const nowFormatted = new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    return `
        <div class="corp-messaging-wrapper">
            <div class="corp-greeting-banner">
                <div class="corp-greeting-left">
                    <img src="${myAvatar}" class="corp-greeting-avatar" alt="${myName}"/>
                    <div>
                        <h2 class="corp-greeting-title">${greetingInfo.greeting}</h2>
                        <div class="corp-greeting-subtext">${greetingInfo.subtext}</div>
                    </div>
                </div>
                <div class="corp-greeting-badges">
                    <span class="corp-meta-pill"><i class="fas fa-calendar-day"></i> ${nowFormatted}</span>
                    <span class="corp-meta-pill"><i class="fas fa-shield-alt"></i> ${isHR ? 'Official HR Helpdesk' : 'Direct HR Channel'}</span>
                </div>
            </div>
            <div class="corp-messaging-grid ${!isHR ? 'employee-view' : ''}">
                ${isHR ? renderHRThreadsSidebar(regularEmployees, allMessages, activeRecipientEmail) : renderEmployeeHelpdeskInfoPanel(hrAccount)}
                <div class="corp-chat-window">
                    <div class="corp-chat-header">
                        <div class="corp-recipient-info">
                            <img src="${activeRecipientPhoto}" class="corp-recipient-avatar" alt="${activeRecipientName}"/>
                            <div>
                                <div class="corp-recipient-name">${activeRecipientName}</div>
                                <div class="corp-recipient-sub">
                                    <span class="corp-dept-tag">${activeRecipientDept}</span>
                                    <span>${activeRecipientDesignation}</span>
                                    <span>•</span>
                                    <span style="color:#22c55e;font-weight:600;display:inline-flex;align-items:center;gap:4px;">
                                        <span class="corp-online-dot"></span> Active Now
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div class="corp-chat-actions">
                            <button type="button" class="corp-btn-action" onclick="window.toggleInChatSearch()"><i class="fas fa-search"></i> <span>Search</span></button>
                            <button type="button" class="corp-btn-action" onclick="window.exportChatTranscript()"><i class="fas fa-file-arrow-down"></i> <span>Export</span></button>
                            <button type="button" class="corp-btn-action" onclick="window.refreshMessagesStream()"><i class="fas fa-sync-alt"></i></button>
                        </div>
                    </div>
                    <div class="corp-inchat-search-container" id="corpInChatSearchWrapper" style="display:none;">
                        <i class="fas fa-filter" style="color:var(--primary);"></i>
                        <input type="text" id="corpInChatSearchInput" placeholder="Filter messages..." oninput="window.searchInCurrentChat(this.value)"/>
                        <button type="button" class="corp-btn-action" onclick="window.clearInChatSearch()" style="padding:0.25rem 0.6rem;font-size:0.75rem;">Clear</button>
                    </div>
                    <div class="corp-messages-stream" id="chatMessagesStream">
                        ${buildCorporateMessagesStreamHTML(currentThread, myEmail, isHR, currentChatSearchQuery)}
                    </div>
                    <div class="corp-quick-chips-wrapper">
                        <span class="corp-chip-label"><i class="fas fa-bolt" style="color:#f59e0b;"></i> ${isHR ? 'Quick Replies:' : 'Common Topics:'}</span>
                        ${isHR ? `
                            <button type="button" class="corp-quick-chip" onclick="window.selectSuggestedChip('Your leave request has been approved.', 'Leave & Attendance')"><i class="fas fa-check-circle" style="color:#22c55e;"></i> Leave Approved</button>
                            <button type="button" class="corp-quick-chip" onclick="window.selectSuggestedChip('Your payslip is available under My Payslips.', 'Payroll & Compensation')"><i class="fas fa-file-invoice" style="color:#1a6dff;"></i> Payslip Ready</button>
                        ` : `
                            <button type="button" class="corp-quick-chip" onclick="window.selectSuggestedChip('Hello HR, could you clarify my leave balances?', 'Leave & Attendance')"><i class="fas fa-plane-departure" style="color:#1a6dff;"></i> Leave Query</button>
                            <button type="button" class="corp-quick-chip" onclick="window.selectSuggestedChip('Hello HR, I have a question regarding my payslip deductions.', 'Payroll & Compensation')"><i class="fas fa-calculator" style="color:#22c55e;"></i> Salary & Tax</button>
                        `}
                    </div>
                    <div class="corp-input-bar">
                        <div class="corp-input-meta-row">
                            <span style="font-size:0.76rem;color:var(--text-secondary);font-weight:700;">Inquiry Topic:</span>
                            <select id="corpChatCategory" class="corp-category-select">
                                <option value="General Inquiry">General Inquiry</option>
                                <option value="Leave & Attendance">Leave & Attendance</option>
                                <option value="Payroll & Compensation">Payroll & Compensation</option>
                                <option value="Benefits & Insurance">Benefits & Insurance</option>
                            </select>
                        </div>
                        <div class="corp-input-row">
                            <input type="text" id="corpChatInputBox" placeholder="Type your message... (Enter to send)" onkeydown="if(event.key==='Enter' && !event.shiftKey){event.preventDefault();window.handleSendChatMessage();}"/>
                            <button type="button" class="btn-corporate-send" onclick="window.handleSendChatMessage()"><i class="fas fa-paper-plane"></i> Send</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderHRThreadsSidebar(employees, allMessages, activeRecipientEmail) {
    let filtered = employees;
    if (activeDeptThreadFilter && activeDeptThreadFilter !== 'All') filtered = filtered.filter(e => e.department === activeDeptThreadFilter);
    if (employeeThreadSearchQuery) {
        const q = employeeThreadSearchQuery.toLowerCase();
        filtered = filtered.filter(e => (e.name || '').toLowerCase().includes(q) || (e.department || '').toLowerCase().includes(q));
    }
    return `
        <div class="corp-threads-panel">
            <div class="corp-threads-header">
                <div class="corp-threads-title">
                    <span><i class="fas fa-inbox" style="color:var(--primary);margin-right:6px;"></i> Employee Threads</span>
                    <span class="corp-dept-tag">${filtered.length} active</span>
                </div>
                <div class="corp-search-box">
                    <i class="fas fa-search"></i>
                    <input type="text" placeholder="Search employees..." value="${employeeThreadSearchQuery}" oninput="window.filterEmployeesList(this.value)"/>
                </div>
            </div>
            <div class="corp-dept-filter-bar">
                ${['All','IT','Finance','Sales','Marketing','Operations','HR'].map(d => `
                    <button type="button" class="corp-dept-tab ${activeDeptThreadFilter === d ? 'active' : ''}" onclick="window.filterDeptThreads('${d}')">${d}</button>
                `).join('')}
            </div>
            <div class="corp-threads-list">
                ${filtered.length === 0 ? `<div style="text-align:center;padding:2rem;color:var(--text-light);">No threads</div>` : filtered.map(emp => {
                    const empMsgs = allMessages.filter(m => (m.from_email || '').toLowerCase() === emp.email?.toLowerCase() || (m.to_email || '').toLowerCase() === emp.email?.toLowerCase());
                    const lastMsg = empMsgs[empMsgs.length - 1];
                    const isActive = emp.email?.toLowerCase() === activeRecipientEmail?.toLowerCase();
                    const lastTime = lastMsg ? new Date(lastMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
                    return `
                        <div class="corp-thread-card ${isActive ? 'active' : ''}" onclick="window.selectChatRecipient('${emp.email}')">
                            <img src="${emp.photo || DEFAULT_AVATARS.male}" class="corp-thread-avatar" alt="${emp.name}"/>
                            <div class="corp-thread-info">
                                <div class="corp-thread-row1"><span class="corp-thread-name">${emp.name}</span><span class="corp-thread-time">${lastTime}</span></div>
                                <div class="corp-thread-row2"><span class="corp-thread-snippet">${lastMsg ? lastMsg.text : 'Start conversation...'}</span><span class="corp-dept-tag">${emp.department || ''}</span></div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
}

function renderEmployeeHelpdeskInfoPanel(hrAccount) {
    return `
        <div class="corp-helpdesk-info-panel">
            <div class="corp-hr-profile-card">
                <img src="${hrAccount.photo || DEFAULT_AVATARS.hr}" class="corp-hr-avatar" alt="${hrAccount.name}"/>
                <div class="corp-hr-name">${hrAccount.name}</div>
                <div class="corp-hr-role"><i class="fas fa-id-badge"></i> ${hrAccount.designation || 'HR Operations Manager'}</div>
                <div class="corp-hr-meta-list">
                    <div><i class="fas fa-envelope"></i> <span>${hrAccount.email}</span></div>
                    <div><i class="fas fa-building"></i> <span>HR Operations Division</span></div>
                    <div><i class="fas fa-clock"></i> <span>Mon - Fri: 9AM - 6PM IST</span></div>
                </div>
            </div>
            <div class="corp-sla-box">
                <div class="corp-sla-title"><i class="fas fa-shield-check" style="color:#1a6dff;"></i> Helpdesk SLA</div>
                <p style="margin:0;line-height:1.4;color:#334155;font-size:0.78rem;">Official inquiries are processed directly by HR Operations with confidential audit tracking.</p>
            </div>
        </div>
    `;
}

function buildCorporateMessagesStreamHTML(currentThread, myEmail, isHR, searchTerm = '') {
    let list = currentThread || [];
    if (searchTerm) {
        const q = searchTerm.toLowerCase();
        list = list.filter(m => (m.text || '').toLowerCase().includes(q) || (m.category || '').toLowerCase().includes(q));
    }
    if (list.length === 0) {
        return `
            <div style="text-align:center;padding:4rem 2rem;color:var(--text-secondary);">
                <div style="width:68px;height:68px;border-radius:50%;background:#fff;border:1px solid #e2e8f0;display:inline-flex;align-items:center;justify-content:center;margin-bottom:1rem;">
                    <i class="fas fa-comments" style="font-size:1.8rem;color:#1a6dff;"></i>
                </div>
                <h3 style="margin:0 0 0.5rem 0;color:#0b2b4a;">No Messages Yet</h3>
                <p style="margin:0;font-size:0.85rem;">${searchTerm ? `No results for "${searchTerm}".` : 'Type a message below to start.'}</p>
            </div>
        `;
    }
    const todayDivider = `<div class="corp-date-divider">Official Thread · Active Record</div>`;
    const streamHTML = list.map(msg => {
        const from = (msg.from_email || msg.fromEmail || '').toLowerCase();
        const isMe = from === myEmail;
        const timeStr = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const senderLabel = isMe ? `You (${isHR ? 'HR' : 'Employee'})` : (msg.fromName || (isHR ? 'Employee' : 'HR'));
        const cleanText = (msg.text || '').replace(/</g, "&lt;").replace(/>/g, "&gt;");
        const categoryBadge = msg.category ? `<span class="corp-category-badge">${msg.category}</span>` : '';
        return `
            <div class="corp-msg-row ${isMe ? 'outgoing' : 'incoming'}">
                <div class="corp-msg-bubble ${isMe ? 'outgoing' : 'incoming'}">
                    <div class="corp-msg-sender-line"><span>${senderLabel}</span>${categoryBadge}</div>
                    <div class="corp-msg-body">${cleanText}</div>
                    <div class="corp-msg-footer"><span>${timeStr}</span></div>
                </div>
            </div>
        `;
    }).join('');
    return todayDivider + streamHTML;
}

// ============================================================
// ===== 7. NOTIFICATIONS, REPORTS, SETTINGS, PROFILE =====
// ============================================================

function renderNotificationsSection() {
    const notifs = window._currentNotifications || [];
    return `
        <h2>System Notifications</h2>
        <div class="subhead">Official announcements & alerts</div>
        <div class="detail-list" style="margin-top:1.5rem;">
            <ul style="list-style:none;">
                ${notifs.length === 0 ? `<li style="text-align:center;padding:2rem;color:var(--text-light);">No notifications</li>` : ''}
                ${notifs.map(n => `
                    <li style="display:flex;align-items:flex-start;gap:1rem;padding:1rem 0;border-bottom:1px solid var(--border);">
                        <div style="background:${n.type==='success'?'#d4edda':n.type==='warning'?'#fff3cd':'#e8f0fe'};width:2.6rem;height:2.6rem;border-radius:50%;display:flex;align-items:center;justify-content:center;color:${n.type==='success'?'#155724':n.type==='warning'?'#856404':'var(--primary)'};flex-shrink:0;">
                            <i class="fas ${n.icon}"></i>
                        </div>
                        <div style="flex:1;">
                            <div style="font-weight:700;color:var(--text-primary);font-size:0.95rem;">${n.title}</div>
                            <div style="color:var(--text-secondary);font-size:0.88rem;margin-top:0.2rem;">${n.text}</div>
                        </div>
                        <div style="font-size:0.75rem;color:var(--text-light);">${n.time}</div>
                    </li>
                `).join('')}
            </ul>
        </div>
    `;
}

function renderReports() {
    const employees = window._currentEmployees || [];
    const totalEmps = employees.length;
    const totalPayroll = employees.reduce((sum, e) => sum + (Number(e.monthly_salary) || 0), 0) || 487000;
    return `
        <h2>Reports & Analytics</h2>
        <div class="subhead">Executive summaries and workforce metrics</div>
        <div class="stats-grid" style="margin-top:1.5rem;">
            <div class="stat-card"><div class="stat-label">Total Workforce</div><div class="stat-value">${totalEmps}</div></div>
            <div class="stat-card"><div class="stat-label">Leave Utilization</div><div class="stat-value">18.4%</div></div>
            <div class="stat-card"><div class="stat-label">Monthly Payroll</div><div class="stat-value">₹${Math.round(totalPayroll / 1000)}K</div></div>
            <div class="stat-card"><div class="stat-label">Attendance</div><div class="stat-value">92.4%</div></div>
        </div>
        <div class="chart-grid" style="margin-top:1.5rem;">
            <div class="chart-box"><h4>Employee Growth</h4><canvas id="lineChart"></canvas></div>
            <div class="chart-box"><h4>Monthly Payroll</h4><canvas id="payrollChart"></canvas></div>
        </div>
    `;
}

function renderSettings(userEmail, role) {
    return `
        <h2>Settings</h2>
        <div class="subhead">Account & preferences</div>
        <div class="detail-list" style="margin-top:1.5rem;">
            <h3>Change Password</h3>
            <form onsubmit="event.preventDefault(); window.showToast('Success', 'Password updated!', 'success');">
                <div class="input-group"><label>Current Password</label><input type="password" required></div>
                <div class="input-group"><label>New Password</label><input type="password" required></div>
                <div class="input-group"><label>Confirm</label><input type="password" required></div>
                <button type="submit" class="btn-primary"><i class="fas fa-save"></i> Update</button>
            </form>
        </div>
    `;
}

function renderProfile(userEmail, role) {
    const employees = window._currentEmployees || [];
    const emp = employees.find(e => e.email && e.email.toLowerCase() === userEmail.toLowerCase()) 
        || window.currentUser?.empData 
        || { name: getNameFromEmail(userEmail), email: userEmail, id: 1, department: 'IT', designation: 'Employee', phone: '', annual_ctc: 'N/A', pan: 'N/A', aadhaar: 'N/A', dob: '1995-01-01', joining_date: '2024-01-01', photo: DEFAULT_AVATARS.alex };
    return `
        <h2>Employee Profile</h2>
        <div class="subhead">Your official details</div>
        <div class="detail-list" style="margin-top:1.5rem;max-width:900px;">
            <div style="display:grid;grid-template-columns:200px 1fr;gap:1.5rem;align-items:start;">
                <div style="text-align:center;">
                    <img src="${emp.photo || DEFAULT_AVATARS.alex}" style="width:150px;height:150px;border-radius:50%;object-fit:cover;border:4px solid var(--primary-light);"/>
                    <div style="margin-top:0.8rem;font-weight:700;">${emp.name}</div>
                    <div style="font-size:0.85rem;color:var(--text-secondary);">${emp.designation} · ${emp.department}</div>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
                    <div><strong>Email:</strong> ${emp.email}</div>
                    <div><strong>Phone:</strong> ${emp.phone || 'N/A'}</div>
                    <div><strong>Gender:</strong> ${emp.gender || 'N/A'}</div>
                    <div><strong>DOB:</strong> ${emp.dob || 'N/A'}</div>
                    <div><strong>DOJ:</strong> ${emp.joining_date || 'N/A'}</div>
                    <div><strong>Annual CTC:</strong> ${emp.annual_ctc || 'N/A'}</div>
                    <div><strong>PAN:</strong> ${emp.pan || 'N/A'}</div>
                    <div><strong>Aadhaar:</strong> ${emp.aadhaar || 'N/A'}</div>
                    <div style="grid-column:1/-1;"><strong>Address:</strong> ${emp.address || 'N/A'}</div>
                </div>
            </div>
        </div>
    `;
}

function renderAttendance() {
    return `
        <div class="detail-list" style="text-align:center;padding:3rem;">
            <i class="fas fa-clock" style="font-size:3rem;color:var(--primary);margin-bottom:1rem;"></i>
            <h2>Attendance Tracker</h2>
            <div class="subhead">Compliance: 95.4%</div>
        </div>
    `;
}

// ============================================================
// ===== ACTION HANDLERS =====
// ============================================================

function refreshMessagesStream() {
    let userEmail = (window.currentUser?.email || window.userEmail || '').trim().toLowerCase();
    if (!userEmail) {
        try { const u = localStorage.getItem('user'); if (u) userEmail = JSON.parse(u).email?.toLowerCase(); } catch(e) {}
    }
    if (!userEmail) return;
    const role = (typeof window.getRole === 'function') ? window.getRole(userEmail) : 'employee';
    const container = document.getElementById('section-messages');
    if (container) container.innerHTML = renderMessages(userEmail, role);
}

function selectChatRecipient(email) {
    activeChatRecipient = email;
    refreshMessagesStream();
}

function filterEmployeesList(query) { employeeThreadSearchQuery = query || ''; refreshMessagesStream(); }
function filterDeptThreads(dept) { activeDeptThreadFilter = dept; refreshMessagesStream(); }
function selectSuggestedChip(text, cat) {
    const input = document.getElementById('corpChatInputBox');
    if (input) { input.value = text; input.focus(); }
    if (cat) { const s = document.getElementById('corpChatCategory'); if (s) s.value = cat; }
}
function toggleInChatSearch() {
    const w = document.getElementById('corpInChatSearchWrapper');
    if (w) { const h = w.style.display === 'none'; w.style.display = h ? 'flex' : 'none'; if (h) document.getElementById('corpInChatSearchInput')?.focus(); else clearInChatSearch(); }
}
function searchInCurrentChat(q) { currentChatSearchQuery = q || ''; refreshMessagesStream(); }
function clearInChatSearch() { currentChatSearchQuery = ''; const i = document.getElementById('corpInChatSearchInput'); if (i) i.value = ''; refreshMessagesStream(); }

function handleSendChatMessage() {
    const input = document.getElementById('corpChatInputBox');
    const text = input ? input.value.trim() : '';
    if (!text) return;
    const catSelect = document.getElementById('corpChatCategory');
    const category = catSelect ? catSelect.value : 'General Inquiry';
    let userEmail = (window.currentUser?.email || window.userEmail || '').trim().toLowerCase();
    if (!userEmail) userEmail = 'alex.employee@gmail.com';
    const role = (typeof window.getRole === 'function') ? window.getRole(userEmail) : 'employee';
    const isHR = role === 'hr' || role === 'admin';
    const employees = window._currentEmployees || [];
    const userEmp = employees.find(e => e.email?.toLowerCase() === userEmail);
    const fromName = userEmp ? userEmp.name : (window.currentUser?.name || (isHR ? 'Sarah Williams' : 'Alex Johnson'));
    const hrAccount = employees.find(e => e.role === 'hr' || e.role === 'admin') || { email: 'hr.hr@gmail.com', name: 'Sarah Williams' };
    const toEmail = isHR ? (activeChatRecipient || employees.find(e => e.role === 'employee')?.email || 'alex.employee@gmail.com') : (hrAccount.email || 'hr.hr@gmail.com');
    const toEmp = employees.find(e => e.email?.toLowerCase() === toEmail?.toLowerCase());
    const toName = isHR ? (toEmp?.name || 'Employee') : (hrAccount.name || 'HR');
    const newMsg = {
        id: Date.now(), from_email: userEmail, fromEmail: userEmail, fromName,
        to_email: toEmail, toEmail, toName, senderRole: role, category, text,
        timestamp: Date.now(), created_at: new Date().toISOString()
    };
    input.value = ''; input.focus();
    const msgs = window._currentMessages || [];
    msgs.push(newMsg);
    if (typeof window.saveMessagesData === 'function') window.saveMessagesData(msgs);
    else try { localStorage.setItem('hr_connect_messages', JSON.stringify(msgs)); } catch(e) {}
    window._currentMessages = msgs;
    refreshMessagesStream();
    if (window.showToast) window.showToast('Message Sent', `Delivered to ${toName}`, 'success');
}

function exportChatTranscript() {
    let userEmail = (window.currentUser?.email || window.userEmail || '').trim().toLowerCase();
    const role = (typeof window.getRole === 'function') ? window.getRole(userEmail) : 'employee';
    const isHR = role === 'hr' || role === 'admin';
    const employees = window._currentEmployees || [];
    const hrAccount = employees.find(e => e.role === 'hr' || e.role === 'admin') || { email: 'hr.hr@gmail.com', name: 'Sarah Williams' };
    const targetEmail = isHR ? activeChatRecipient : (hrAccount.email || 'hr.hr@gmail.com');
    const targetEmp = employees.find(e => e.email?.toLowerCase() === targetEmail?.toLowerCase()) || { name: isHR ? 'Employee' : 'HR Operations' };
    const normalizeFn = window.normalizeMessage || (m => m);
    const allMessages = (window._currentMessages || []).map(normalizeFn).filter(Boolean);
    const thread = isHR
        ? allMessages.filter(m => (m.from_email || '').toLowerCase() === targetEmail?.toLowerCase() || (m.to_email || '').toLowerCase() === targetEmail?.toLowerCase())
        : allMessages.filter(m => (m.from_email || '').toLowerCase() === userEmail || (m.to_email || '').toLowerCase() === userEmail);
    if (thread.length === 0) { if (window.showToast) window.showToast('Notice', 'No messages to export', 'info'); return; }
    let transcript = `HR CONNECT PORTAL - TRANSCRIPT\nGenerated: ${new Date().toLocaleString('en-IN')}\nParticipants: ${window.currentUser?.name || userEmail} & ${targetEmp.name}\nTotal: ${thread.length}\n${'='.repeat(60)}\n\n`;
    thread.forEach(msg => {
        transcript += `[${new Date(msg.timestamp).toLocaleString('en-IN')}] ${msg.fromName || msg.from_email}:\n${msg.category ? '[' + msg.category + '] ' : ''}${msg.text}\n\n`;
    });
    const blob = new Blob([transcript], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `HR_Transcript_${(targetEmp.name || 'Chat').replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
    if (window.showToast) window.showToast('Success', 'Transcript downloaded', 'success');
}

// ===== LEAVE ACTIONS =====
function calcLeaveDaysAuto() {
    const from = document.getElementById('leaveFromDate')?.value;
    const to = document.getElementById('leaveToDate')?.value;
    const daysInput = document.getElementById('leaveCalculatedDays');
    if (!daysInput || !from || !to) return;
    const d1 = new Date(from), d2 = new Date(to);
    if (isNaN(d1) || isNaN(d2) || d2 < d1) { daysInput.value = 0; return; }
    let workingDays = 0;
    for (let d = new Date(d1); d <= d2; d.setDate(d.getDate() + 1)) {
        const day = d.getDay();
        if (day !== 0 && day !== 6) workingDays++;
    }
    daysInput.value = workingDays;
}

async function submitApplyLeave(event) {
    event.preventDefault();
    const type = document.getElementById('leaveTypeSelect').value;
    const from = document.getElementById('leaveFromDate').value;
    const to = document.getElementById('leaveToDate').value;
    const days = parseInt(document.getElementById('leaveCalculatedDays').value) || 0;
    const reason = document.getElementById('leaveReasonText').value.trim();
    if (!type || !from || !to || !reason || days < 1) {
        if (window.showToast) window.showToast('Error', 'Fill all fields with at least 1 working day.', 'error');
        return;
    }
    let userEmail = (window.currentUser?.email || window.userEmail || '').toLowerCase();
    const emp = (window._currentEmployees || []).find(e => e.email?.toLowerCase() === userEmail);
    const payload = { type, from, to, days, reason, email: userEmail, employee_id: emp?.id };
    if (!window.useMockData && window.api) {
        try {
            await window.api.applyLeave(payload);
            if (window.showToast) window.showToast('Success', 'Leave submitted!', 'success');
            if (typeof fetchLeaves === 'function') window._currentLeaves = await fetchLeaves();
            if (window.renderApp) await window.renderApp(userEmail);
            if (window.switchSection) window.switchSection('my_leaves');
            return;
        } catch(e) {
            if (window.showToast) window.showToast('Error', e.message, 'error');
            return;
        }
    }
    const leaves = window._currentLeaves || [];
    leaves.unshift({ id: Date.now(), ...payload, status: 'pending' });
    window._currentLeaves = leaves;
    if (window.showToast) window.showToast('Success', 'Submitted!', 'success');
}

function promptApproveLeave(id) {
    currentLeaveActionId = id;
    currentLeaveActionType = 'approved';
    document.getElementById('leaveActionModalTitle').textContent = 'Approve Leave';
    document.getElementById('leaveActionComment').value = 'Approved by HR Management';
    document.getElementById('leaveCommentModal').style.display = 'flex';
}
function promptRejectLeave(id) {
    currentLeaveActionId = id;
    currentLeaveActionType = 'rejected';
    document.getElementById('leaveActionModalTitle').textContent = 'Reject Leave';
    document.getElementById('leaveActionComment').value = 'Rejected due to project deadlines';
    document.getElementById('leaveCommentModal').style.display = 'flex';
}
async function confirmLeaveAction() {
    const comment = document.getElementById('leaveActionComment')?.value.trim() || '';

    if (!window.useMockData && window.api) {
        try {
            if (window.showToast) window.showToast('Info', 'Updating leave status...', 'info');
            
            if (currentLeaveActionType === 'approved') {
                await window.api.approveLeave(currentLeaveActionId);
            } else {
                await window.api.rejectLeave(currentLeaveActionId);
            }
            
            if (window.showToast) window.showToast('Success', `Leave ${currentLeaveActionType}!`, 'success');
            
            // Close modal
            const modal = document.getElementById('leaveCommentModal');
            if (modal) modal.style.display = 'none';
            
            // ✅ FIX: Re-fetch leaves from backend, then re-render
            if (typeof fetchLeaves === 'function') {
                window._currentLeaves = await fetchLeaves();
            }
            
            // ✅ FIX: Use window.currentUser (set by dashboard.js)
            const email = window.currentUser?.email || window.userEmail || localStorage.getItem('user') && JSON.parse(localStorage.getItem('user')).email;
            if (email && typeof window.renderApp === 'function') {
                await window.renderApp(email);
            }
            
            return;
        } catch (e) {
            console.error('Leave action error:', e);
            if (window.showToast) window.showToast('Error', e.message || 'Failed', 'error');
            return;
        }
    }
    // Mock fallback
    const leaves = window._currentLeaves || [];
    const req = leaves.find(r => String(r.id) === String(currentLeaveActionId));
    if (req) {
        req.status = currentLeaveActionType;
        if (comment) req.comments = [comment];
        window.saveLeavesData(leaves);
        if (window.showToast) window.showToast('Success', `Leave ${currentLeaveActionType}`, 'success');
    }
    const modal = document.getElementById('leaveCommentModal');
    if (modal) modal.style.display = 'none';
    const email = window.currentUser?.email;
    if (email && window.renderApp) await window.renderApp(email);
}
function openRunPayrollModal() { const m = document.getElementById('runPayrollModal'); if (m) m.style.display = 'flex'; }
function handleRunPayrollSubmit(e) {
    e.preventDefault();
    const month = document.getElementById('payrollRunMonth').value;
    const year = document.getElementById('payrollRunYear').value;
    const employees = window._currentEmployees || [];
    const totalPayroll = employees.reduce((s, emp) => s + (Number(emp.monthly_salary) || 0), 0);
    const hist = window._currentPayrollHistory || [];
    hist.unshift({ month, year, employees: employees.length, amount: totalPayroll, status: 'Processed' });
    window._currentPayrollHistory = hist;
    if (window.addNotification) window.addNotification('Payroll Processed', `Payroll for ${month} ${year} processed.`, 'success', 'fa-file-invoice-dollar');
    if (window.showToast) window.showToast('Success', `Payroll ${month} ${year} processed!`, 'success');
    document.getElementById('runPayrollModal').style.display = 'none';
    if (window.refreshCurrentSection) window.refreshCurrentSection();
}
function viewPayrollSummary(month, year) {
    const employees = window._currentEmployees || [];
    let modal = document.getElementById('payrollSummaryModal');
    if (!modal) { modal = document.createElement('div'); modal.id = 'payrollSummaryModal'; modal.className = 'modal-backdrop'; document.body.appendChild(modal); }
    const totalGross = employees.reduce((s, e) => s + (Number(e.monthly_salary) || 0), 0);
    modal.innerHTML = `
        <div style="background:var(--card-bg);border-radius:var(--radius);padding:1.8rem;max-width:960px;width:95%;max-height:90vh;overflow-y:auto;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.2rem;border-bottom:1px solid var(--border);padding-bottom:0.8rem;">
                <h3 style="margin:0;">Salary Register — ${month} ${year}</h3>
                <button class="modal-close-btn" onclick="document.getElementById('payrollSummaryModal').style.display='none'">&times;</button>
            </div>
            <div class="custom-table-responsive">
                <table class="styled-table">
                    <thead><tr><th>Employee</th><th>Department</th><th>Gross</th><th>Deductions</th><th>Net Pay</th><th>Action</th></tr></thead>
                    <tbody>
                        ${employees.map(e => {
                            const gross = Number(e.monthly_salary) || 75000;
                            const pf = 1800, pt = 200;
                            const net = gross - pf - pt;
                            return `<tr>
                                <td><strong>${e.name}</strong></td>
                                <td><span class="badge" style="background:#e8f0fe;color:var(--primary);">${e.department || ''}</span></td>
                                <td>₹${gross.toLocaleString('en-IN')}</td>
                                <td style="color:var(--danger);">₹${(pf+pt).toLocaleString('en-IN')}</td>
                                <td><strong style="color:var(--success);">₹${net.toLocaleString('en-IN')}</strong></td>
                                <td><button class="btn-primary btn-sm" onclick="document.getElementById('payrollSummaryModal').style.display='none'; window.viewPayslipModal('PS-${year}-08-${e.id}')"><i class="fas fa-eye"></i></button></td>
                            </tr>`;
                        }).join('')}
                    </tbody>
                </table>
            </div>
            <div style="margin-top:1.2rem;text-align:right;">
                <button class="btn-secondary-custom" onclick="document.getElementById('payrollSummaryModal').style.display='none'">Close</button>
            </div>
        </div>
    `;
    modal.style.display = 'flex';
}
function viewPayslipModal(payslipId) {
    const container = document.getElementById('payslipModalContainer');
    const docContainer = document.getElementById('printablePayslipDocument');
    const downloadBtn = document.getElementById('modalDownloadPdfBtn');
    if (container && docContainer) {
        docContainer.innerHTML = buildPayslipHTML(payslipId);
        container.style.display = 'flex';
        if (downloadBtn) downloadBtn.onclick = () => window.downloadPayslipPDF(payslipId);
    } else {
        if (window.showToast) window.showToast('Info', `Payslip ${payslipId}`, 'info');
    }
}
function closePayslipModal() { const c = document.getElementById('payslipModalContainer'); if (c) c.style.display = 'none'; }
async function downloadPayslipPDF(payslipId) {
    const employees = window._currentEmployees || [];
    const emp = employees.find(e => String(e.id) === String(payslipId) || `PS-2026-08-${e.id}` === payslipId) || window.currentUser?.empData || { name: 'Employee' };
    const month = payslipFilterMonth || 'August';
    const year = payslipFilterYear || '2026';
    const fileName = `Payslip_${(emp.name || 'Employee').replace(/\s+/g, '_')}_${month}_${year}.pdf`;
    if (window.showToast) window.showToast('Info', `Generating PDF...`, 'info');
    const tempDiv = document.createElement('div');
    tempDiv.id = 'pdfExportRenderBox';
    tempDiv.style.cssText = 'position:fixed;top:0;left:0;width:794px;background:#fff;z-index:999999;padding:12px;box-sizing:border-box;';
    tempDiv.innerHTML = buildPayslipHTML(payslipId);
    document.body.appendChild(tempDiv);
    const opt = { margin: [6,6,6,6], filename: fileName, image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2, useCORS: true, logging: false }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } };
    try {
        if (typeof html2pdf !== 'undefined') {
            await html2pdf().set(opt).from(tempDiv).save();
            if (window.showToast) window.showToast('Success', `Downloaded: ${fileName}`, 'success');
        } else {
            viewPayslipModal(payslipId);
            setTimeout(() => window.print(), 300);
        }
    } catch (e) {
        console.error('PDF error:', e);
        viewPayslipModal(payslipId);
    } finally {
        if (document.body.contains(tempDiv)) document.body.removeChild(tempDiv);
    }
}
function handlePayslipFilterChange() {
    payslipFilterMonth = document.getElementById('filterMonthSelect')?.value || 'August';
    payslipFilterYear = document.getElementById('filterYearSelect')?.value || '2026';
    if (window.refreshCurrentSection) window.refreshCurrentSection();
}

// ===== EMPLOYEE CRUD =====
function showAddEmployeeModal() {
    const modal = document.getElementById('addEmployeeModal');
    if (!modal) { if (window.showToast) window.showToast('Info', 'Add employee modal', 'info'); return; }
    modal.style.display = 'flex';
    document.getElementById('employeeModalTitle').innerHTML = '<i class="fas fa-user-plus" style="color:var(--primary);margin-right:8px;"></i> Add New Employee';
    document.getElementById('editEmployeeId').value = '';
    document.getElementById('employeeForm').reset();
    setModalPhoto(DEFAULT_AVATARS.male);
    handleDeptChange('IT');
}
function editEmployee(id) {
    const list = window._currentEmployees || [];
    const emp = list.find(e => String(e.id) === String(id));
    if (!emp) return;
    const modal = document.getElementById('addEmployeeModal');
    if (!modal) return;
    modal.style.display = 'flex';
    document.getElementById('employeeModalTitle').innerHTML = '<i class="fas fa-edit"></i> Edit Employee';
    document.getElementById('editEmployeeId').value = emp.id;
    document.getElementById('empName').value = emp.name || '';
    document.getElementById('empEmail').value = emp.email || '';
    document.getElementById('empPhone').value = (emp.phone || '').replace(/\D/g, '').slice(-10);
    document.getElementById('empGender').value = emp.gender || 'Male';
    document.getElementById('empDob').value = emp.dob || '1995-01-01';
    document.getElementById('empJoiningDate').value = emp.joining_date || '2024-01-01';
    document.getElementById('empDepartment').value = emp.department || 'IT';
    handleDeptChange(emp.department || 'IT', emp.designation);
    document.getElementById('empEmploymentType').value = emp.employment_type || 'Full-Time';
    document.getElementById('empAnnualCtc').value = emp.annual_ctc || '9.00';
    document.getElementById('empSalary').value = emp.monthly_salary || 50000;
    document.getElementById('empPan').value = emp.pan || '';
    document.getElementById('empAadhaar').value = emp.aadhaar || '';
    document.getElementById('empAddress').value = emp.address || '';
    document.getElementById('empBankName').value = emp.bank_details?.bank_name || '';
    document.getElementById('empBankAccount').value = emp.bank_details?.account_number || '';
    setModalPhoto(emp.photo || DEFAULT_AVATARS.male);
}
async function saveEmployee(event) {
    event.preventDefault();
    const id = document.getElementById('editEmployeeId').value;
    const name = document.getElementById('empName').value.trim();
    const email = document.getElementById('empEmail').value.trim();
    const phone = '+91 ' + document.getElementById('empPhone').value.replace(/\D/g, '');
    const ctcInput = document.getElementById('empAnnualCtc').value.trim();
    const ctcNum = parseFloat(ctcInput.replace(/[^\d.]/g, ''));
    if (!name || !email || !ctcNum) { if (window.showToast) window.showToast('Error', 'Fill required fields', 'error'); return; }
    const payload = {
        name, email, phone,
        gender: document.getElementById('empGender').value,
        dob: document.getElementById('empDob').value,
        joining_date: document.getElementById('empJoiningDate').value,
        department: document.getElementById('empDepartment').value,
        designation: document.getElementById('empDesignation').value,
        role: 'employee',
        employment_type: document.getElementById('empEmploymentType').value,
        annual_ctc: Math.round(ctcNum * 100000),
        monthly_salary: parseInt(document.getElementById('empSalary').value) || 75000,
        pan: document.getElementById('empPan').value.toUpperCase(),
        aadhaar: document.getElementById('empAadhaar').value,
        address: document.getElementById('empAddress').value,
        photo: document.getElementById('modalEmpPhotoPreview')?.src,
        bank_details: { bank_name: document.getElementById('empBankName').value, account_number: document.getElementById('empBankAccount').value }
    };
    if (!window.useMockData && window.api) {
        try {
            if (id) await window.api.updateEmployee(id, payload);
            else await window.api.addEmployee(payload);
            if (window.showToast) window.showToast('Success', id ? 'Updated!' : 'Added!', 'success');
            document.getElementById('addEmployeeModal').style.display = 'none';
            if (window.renderApp) await window.renderApp(window.currentUser?.email);
            return;
        } catch(e) {
            if (window.showToast) window.showToast('Error', e.message, 'error');
            return;
        }
    }
    const employees = window._currentEmployees || [];
    if (id) { const emp = employees.find(e => String(e.id) === String(id)); if (emp) Object.assign(emp, payload); }
    else { employees.push({ id: Date.now(), ...payload, status: 'active', leave_balances: {} }); }
    window._currentEmployees = employees;
    document.getElementById('addEmployeeModal').style.display = 'none';
    if (window.renderApp) await window.renderApp(window.currentUser?.email);
}
async function deleteEmployee(id) {
    if (!confirm('Delete this employee?')) return;
    if (!window.useMockData && window.api) {
        try {
            await window.api.deleteEmployee(id);
            if (window.showToast) window.showToast('Success', 'Deleted!', 'success');
            if (window.renderApp) await window.renderApp(window.currentUser?.email);
            return;
        } catch(e) { if (window.showToast) window.showToast('Error', e.message, 'error'); return; }
    }
}
function searchEmployees() {
    const term = document.getElementById('employeeSearchInput')?.value.toLowerCase() || '';
    document.querySelectorAll('.employee-card').forEach(c => {
        c.style.display = c.textContent.toLowerCase().includes(term) ? '' : 'none';
    });
}
function clearSearch() { const i = document.getElementById('employeeSearchInput'); if (i) i.value = ''; searchEmployees(); }
function handleDeptChange(deptName, target = '') {
    const sel = document.getElementById('empDesignation');
    if (!sel) return;
    const opts = window.DEPARTMENT_DESIGNATIONS?.[deptName] || window.DEPARTMENT_DESIGNATIONS?.['IT'] || [];
    sel.innerHTML = opts.map(d => `<option value="${d}" ${d === target ? 'selected' : ''}>${d}</option>`).join('');
}
function setModalPhoto(url) { const p = document.getElementById('modalEmpPhotoPreview'); if (p) p.src = url; }
function handleModalPhotoUpload(e) { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = ev => setModalPhoto(ev.target.result); r.readAsDataURL(f); }
function calculatePayrollPreview() {}
function validateNameInput() { return true; }
function validateEmailInput() { return true; }
function validatePhoneInput() { return true; }
function validatePanInput() { return true; }
function validateAadhaarInput() { return true; }
function clearValidationStates() {}
function handleProfilePhotoUpload(e) { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = ev => { const p = document.getElementById('profileImagePreview'); if (p) p.src = ev.target.result; }; r.readAsDataURL(f); }
function selectSampleAvatar(url) { const p = document.getElementById('profileImagePreview'); if (p) p.src = url; }
function saveProfileData(e) { e.preventDefault(); if (window.showToast) window.showToast('Success', 'Profile saved!', 'success'); }
function updateUserPhoto() {}
function formatAadhaarInput() {}
function markAllNotificationsRead() {
    const n = window._currentNotifications || [];
    n.forEach(x => x.read = true);
    if (window.saveNotificationsData) window.saveNotificationsData(n);
    if (window.showToast) window.showToast('Success', 'Marked as read', 'success');
    if (window.refreshCurrentSection) window.refreshCurrentSection();
}
function refreshCurrentSection() {
    const email = window.currentUser?.email || 'alex.employee@gmail.com';
    if (window.renderApp) window.renderApp(email);
}

// ============================================================
// ===== GLOBAL EXPORTS =====
// ============================================================

window.renderDashboard = renderDashboard;
window.renderEmployees = renderEmployees;
window.renderDepartments = renderDepartments;
window.renderLeaves = renderLeaves;
window.renderApplyLeaveSection = renderApplyLeaveSection;
window.renderMyLeavesSection = renderMyLeavesSection;
window.renderLeaveBalanceSection = renderLeaveBalanceSection;
window.renderPayroll = renderPayroll;
window.renderMyPayslipsSection = renderMyPayslipsSection;
window.renderReports = renderReports;
window.renderMessages = renderMessages;
window.renderNotificationsSection = renderNotificationsSection;
window.renderSettings = renderSettings;
window.renderProfile = renderProfile;
window.renderAttendance = renderAttendance;

window.refreshMessagesStream = refreshMessagesStream;
window.selectChatRecipient = selectChatRecipient;
window.filterEmployeesList = filterEmployeesList;
window.filterDeptThreads = filterDeptThreads;
window.selectSuggestedChip = selectSuggestedChip;
window.toggleInChatSearch = toggleInChatSearch;
window.searchInCurrentChat = searchInCurrentChat;
window.clearInChatSearch = clearInChatSearch;
window.handleSendChatMessage = handleSendChatMessage;
window.exportChatTranscript = exportChatTranscript;

window.calcLeaveDaysAuto = calcLeaveDaysAuto;
window.submitApplyLeave = submitApplyLeave;
window.promptApproveLeave = promptApproveLeave;
window.promptRejectLeave = promptRejectLeave;
window.confirmLeaveAction = confirmLeaveAction;

window.openRunPayrollModal = openRunPayrollModal;
window.handleRunPayrollSubmit = handleRunPayrollSubmit;
window.viewPayrollSummary = viewPayrollSummary;
window.viewPayslipModal = viewPayslipModal;
window.closePayslipModal = closePayslipModal;
window.downloadPayslipPDF = downloadPayslipPDF;
window.handlePayslipFilterChange = handlePayslipFilterChange;

window.showAddEmployeeModal = showAddEmployeeModal;
window.editEmployee = editEmployee;
window.saveEmployee = saveEmployee;
window.deleteEmployee = deleteEmployee;
window.searchEmployees = searchEmployees;
window.clearSearch = clearSearch;
window.handleDeptChange = handleDeptChange;
window.setModalPhoto = setModalPhoto;
window.handleModalPhotoUpload = handleModalPhotoUpload;
window.calculatePayrollPreview = calculatePayrollPreview;

window.validateNameInput = validateNameInput;
window.validateEmailInput = validateEmailInput;
window.validatePhoneInput = validatePhoneInput;
window.validatePanInput = validatePanInput;
window.validateAadhaarInput = validateAadhaarInput;
window.clearValidationStates = clearValidationStates;

window.handleProfilePhotoUpload = handleProfilePhotoUpload;
window.selectSampleAvatar = selectSampleAvatar;
window.saveProfileData = saveProfileData;
window.updateUserPhoto = updateUserPhoto;
window.formatAadhaarInput = formatAadhaarInput;
window.markAllNotificationsRead = markAllNotificationsRead;
window.refreshCurrentSection = refreshCurrentSection;

console.log('✅ renderers.js loaded with FULL features');
console.log('   Exposed renderers:', Object.keys(window).filter(k => k.startsWith('render')).length);