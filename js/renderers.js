// ============================================================
// ===== SECTION RENDERERS - HR & Payroll Final System =====
// ============================================================

let activeChatRecipient = 'alex.employee@gmail.com';
let payslipFilterMonth = 'August';
let payslipFilterYear = '2026';
let currentLeaveActionId = null;
let currentLeaveActionType = null;

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
            <div class="stat-card">
                <div class="stat-label"><i class="fas fa-users" style="color:var(--primary);"></i> Total Employees</div>
                <div class="stat-value">${totalEmps}</div>
                <span class="stat-change"><i class="fas fa-arrow-up"></i> +8.5% Growth</span>
            </div>
            <div class="stat-card">
                <div class="stat-label"><i class="fas fa-building" style="color:#6f42c1;"></i> Total Departments</div>
                <div class="stat-value">${depts}</div>
                <span class="stat-change">Active Operating Units</span>
            </div>
            <div class="stat-card">
                <div class="stat-label"><i class="fas fa-calendar-alt" style="color:#f0ad4e;"></i> Leaves This Month</div>
                <div class="stat-value">${leavesThisMonth}</div>
                <span class="stat-change down">${pendingLeaves} Pending Review</span>
            </div>
            <div class="stat-card">
                <div class="stat-label"><i class="fas fa-rupee-sign" style="color:var(--success);"></i> Monthly Payroll</div>
                <div class="stat-value" style="color:var(--success);">₹${(totalPayroll/1000).toFixed(0)}K</div>
                <span class="stat-change"><i class="fas fa-check-circle"></i> August Processed</span>
            </div>
        </div>

        <div class="chart-grid" style="display:grid;grid-template-columns:repeat(auto-fit, minmax(320px, 1fr));gap:1.5rem;">
            <div class="chart-box">
                <h4><i class="fas fa-chart-line" style="color:var(--primary);"></i> Employee Growth</h4>
                <canvas id="lineChart"></canvas>
            </div>
            <div class="chart-box">
                <h4><i class="fas fa-building" style="color:#6f42c1;"></i> Department-wise Employees</h4>
                <canvas id="barChart"></canvas>
            </div>
            <div class="chart-box">
                <h4><i class="fas fa-calendar-check" style="color:#f0ad4e;"></i> Leave Status</h4>
                <canvas id="pieChart"></canvas>
            </div>
            <div class="chart-box">
                <h4><i class="fas fa-rupee-sign" style="color:var(--success);"></i> Payroll Overview</h4>
                <canvas id="payrollChart"></canvas>
            </div>
        </div>

        <div class="card-grid" style="margin-top:1.5rem;">
            <div class="card" onclick="window.switchSection('employees')">
                <div class="icon"><i class="fas fa-users-cog"></i></div>
                <h4>Employees Directory</h4>
                <p>Manage staff, profiles & compensation in LPA</p>
                <span class="badge">Manage</span>
            </div>
            <div class="card" onclick="window.switchSection('departments')">
                <div class="icon"><i class="fas fa-sitemap"></i></div>
                <h4>Departments</h4>
                <p>Structure, managers & team allocation</p>
                <span class="badge">View</span>
            </div>
            <div class="card" onclick="window.switchSection('leaves')">
                <div class="icon"><i class="fas fa-calendar-check"></i></div>
                <h4>Leave Overview</h4>
                <p>Organization leave trends and approvals</p>
                <span class="badge">Review</span>
            </div>
            <div class="card" onclick="window.switchSection('payroll')">
                <div class="icon"><i class="fas fa-file-invoice-dollar"></i></div>
                <h4>Payroll Overview</h4>
                <p>Salary disbursements & statutory compliance</p>
                <span class="badge">Inspect</span>
            </div>
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
            <div class="stat-card">
                <div class="stat-label"><i class="fas fa-users" style="color:var(--primary);"></i> Total Employees</div>
                <div class="stat-value">${totalEmps}</div>
                <span class="stat-change">Verified Workforce</span>
            </div>
            <div class="stat-card">
                <div class="stat-label"><i class="fas fa-user-plus" style="color:var(--success);"></i> New Employees</div>
                <div class="stat-value">${newEmps}</div>
                <span class="stat-change">Recent Onboardings</span>
            </div>
            <div class="stat-card">
                <div class="stat-label"><i class="fas fa-clock" style="color:#dc3545;"></i> Pending Leave Requests</div>
                <div class="stat-value" style="color:#dc3545;">${pendingLeaves}</div>
                <span class="stat-change down">Action Required</span>
            </div>
            <div class="stat-card">
                <div class="stat-label"><i class="fas fa-rupee-sign" style="color:var(--primary);"></i> Current Month Payroll</div>
                <div class="stat-value" style="color:var(--primary);">₹${(totalPayroll/1000).toFixed(0)}K</div>
                <span class="stat-change">August 2026</span>
            </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;margin-top:1.5rem;" class="responsive-two-col">
            
            <div class="stat-card" style="padding:1.4rem;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
                    <h4 style="margin:0;"><i class="fas fa-calendar-alt" style="color:var(--primary);"></i> Leave Overview</h4>
                    <span class="badge" style="background:var(--primary-light);color:var(--primary);">Real-time</span>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.8rem;">
                    <div class="mini-calc-box">
                        <div class="mini-label">Casual Leaves Taken</div>
                        <div class="mini-value" style="color:var(--primary);">4 Days</div>
                    </div>
                    <div class="mini-calc-box">
                        <div class="mini-label">Sick Leaves Taken</div>
                        <div class="mini-value" style="color:#f0ad4e;">2 Days</div>
                    </div>
                    <div class="mini-calc-box">
                        <div class="mini-label">Earned Leaves Rollover</div>
                        <div class="mini-value" style="color:var(--success);">12 Days</div>
                    </div>
                    <div class="mini-calc-box">
                        <div class="mini-label">Pending Reviews</div>
                        <div class="mini-value" style="color:var(--danger);">${pendingLeaves} Requests</div>
                    </div>
                </div>
                <div style="margin-top:1rem;text-align:right;">
                    <button class="btn-primary btn-sm" onclick="window.switchSection('leaves')"><i class="fas fa-arrow-right"></i> Review Leave Desk</button>
                </div>
            </div>

            <div class="stat-card" style="padding:1.4rem;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
                    <h4 style="margin:0;"><i class="fas fa-wallet" style="color:var(--success);"></i> Payroll Overview</h4>
                    <span class="badge" style="background:#d4edda;color:#155724;">Processed</span>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.8rem;">
                    <div class="mini-calc-box">
                        <div class="mini-label">Current Payroll</div>
                        <div class="mini-value">₹4.87 L</div>
                    </div>
                    <div class="mini-calc-box">
                        <div class="mini-label">Processed Staff</div>
                        <div class="mini-value" style="color:var(--success);">6 / 6</div>
                    </div>
                    <div class="mini-calc-box">
                        <div class="mini-label">Pending Payroll</div>
                        <div class="mini-value" style="color:var(--primary);">₹0</div>
                    </div>
                    <div class="mini-calc-box">
                        <div class="mini-label">Tax Compliance (TDS)</div>
                        <div class="mini-value" style="color:var(--text-primary);">₹21,000</div>
                    </div>
                </div>
                <div style="margin-top:1rem;text-align:right;">
                    <button class="btn-success btn-sm" onclick="window.switchSection('payroll')"><i class="fas fa-file-invoice"></i> Manage Payroll</button>
                </div>
            </div>

        </div>

        <div class="detail-list" style="margin-top:1.5rem;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
                <h3 style="margin:0;"><i class="fas fa-user-clock" style="color:var(--primary);margin-right:8px;"></i> Recently Joined Employees</h3>
                <button class="btn-secondary-custom btn-sm" onclick="window.switchSection('employees')">View Directory</button>
            </div>
            <div class="custom-table-responsive">
                <table class="styled-table">
                    <thead>
                        <tr>
                            <th>Employee</th>
                            <th>Department</th>
                            <th>Designation</th>
                            <th>Date of Joining</th>
                            <th>Annual CTC (LPA)</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${employees.slice(0, 4).map(e => `
                            <tr>
                                <td>
                                    <div style="display:flex;align-items:center;gap:0.6rem;">
                                        <img src="${e.photo || DEFAULT_AVATARS.male}" style="width:34px;height:34px;border-radius:50%;object-fit:cover;"/>
                                        <div>
                                            <strong>${e.name}</strong>
                                            <div style="font-size:0.75rem;color:var(--text-light);">${e.email}</div>
                                        </div>
                                    </div>
                                </td>
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
    const currentEmp = employees.find(e => e.email && e.email.toLowerCase() === userEmail.toLowerCase()) || currentUser?.empData || { name: getNameFromEmail(userEmail), email: userEmail, id: 1, department: 'IT', designation: 'Employee', monthly_salary: 75000 };
    const leaveBalances = currentEmp?.leave_balances || {
        casual: { available: 4, used: 1, remaining: 3 },
        sick: { available: 3, used: 0, remaining: 3 },
        earned: { allocated: 15, used: 5, remaining: 10, carry_forward: 10 },
        monthly: { available_this_month: 4, used_this_month: 1, remaining_this_month: 3, max_allowed_per_month: 3 }
    };
    const totalRemainingLeaves = (leaveBalances.casual?.remaining || 0) + (leaveBalances.sick?.remaining || 0) + (leaveBalances.earned?.remaining || 0);
    const empLeaves = leaves.filter(l => l.employee_id === currentEmp?.id || l.employee === currentEmp?.name || l.email === userEmail);
    const pendingReqs = empLeaves.filter(l => l.status === 'pending');
    const payslips = window._currentPayslips || [];
    const latestPayslip = payslips.find(p => p.employee_id === currentEmp?.id || p.employee_name === currentEmp?.name) || { month: 'August', year: 2026, id: `PS-2026-08-${currentEmp?.id || 1}`, status: 'paid' };
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

        <!-- WORK FROM HOME & LIVE WORKING HOURS CLOCK WIDGET -->
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
                            <i class="fas fa-clock" style="color:var(--primary);"></i> Working hours started upon login · Real-time attendance active
                        </div>
                    </div>
                </div>

                <!-- Live Clock Timer Counter Display -->
                <div style="display:flex;align-items:center;gap:1.5rem;flex-wrap:wrap;">
                    <div>
                        <div style="font-size:0.75rem;color:var(--text-secondary);text-transform:uppercase;font-weight:700;letter-spacing:0.5px;">Today's Working Hours</div>
                        <div id="liveWorkingTimerDisplay" style="font-size:1.8rem;font-weight:800;color:#0b2b4a;font-family:monospace;letter-spacing:1px;margin-top:0.1rem;">
                            04h : 22m : 15s
                        </div>
                    </div>

                    <!-- Controls -->
                    <div style="display:flex;gap:0.5rem;">
                        <button class="btn-secondary-custom btn-sm" id="toggleWorkModeBtn" onclick="window.toggleWorkMode()">
                            <i class="fas fa-building"></i> Switch to Office
                        </button>
                        <button class="btn-warning btn-sm" id="toggleBreakBtn" onclick="window.toggleWorkBreak()" style="background:#fff3cd;color:#856404;border:1px solid #ffeeba;font-weight:600;">
                            <i class="fas fa-coffee"></i> Take Break
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-label"><i class="fas fa-calendar-check" style="color:var(--primary);"></i> Leave Balance</div>
                <div class="stat-value" style="color:var(--primary);">${totalRemainingLeaves} <span style="font-size:0.9rem;color:var(--text-secondary);">Days Left</span></div>
                <div style="font-size:0.8rem;color:var(--text-secondary);margin-top:0.4rem;">
                    CL: <strong>${leaveBalances.casual?.remaining || 3}d</strong> | 
                    SL: <strong>${leaveBalances.sick?.remaining || 3}d</strong> | 
                    EL: <strong>${leaveBalances.earned?.remaining || 10}d</strong>
                </div>
                <span class="stat-change" style="margin-top:0.4rem;display:inline-block;"><i class="fas fa-arrow-right"></i> Carry forward active</span>
            </div>

            <div class="stat-card">
                <div class="stat-label"><i class="fas fa-hourglass-half" style="color:#f0ad4e;"></i> Pending Requests</div>
                <div class="stat-value" style="color:#f0ad4e;">${pendingReqs.length} <span style="font-size:0.9rem;color:var(--text-secondary);">Application(s)</span></div>
                <div style="font-size:0.8rem;color:var(--text-secondary);margin-top:0.4rem;">
                    ${pendingReqs.length > 0 ? `Latest: ${pendingReqs[0].type} (${pendingReqs[0].days}d)` : 'No pending applications'}
                </div>
                <span class="stat-change"><i class="fas fa-shield-alt"></i> HR Review Queue</span>
            </div>

            <div class="stat-card">
                <div class="stat-label"><i class="fas fa-file-invoice-dollar" style="color:var(--success);"></i> Latest Payslip</div>
                <div class="stat-value" style="color:var(--success);font-size:1.4rem;">${latestPayslip.month} ${latestPayslip.year}</div>
                <div style="font-size:0.8rem;color:var(--text-secondary);margin-top:0.3rem;">
                    Status: <strong style="color:var(--success);"><i class="fas fa-check-circle"></i> ${(latestPayslip.status||'PAID').toUpperCase()}</strong>
                </div>
                <div style="margin-top:0.6rem;display:flex;gap:0.4rem;">
                    <button class="btn-primary btn-sm" onclick="window.viewPayslipModal('${latestPayslip.id}')" style="flex:1;"><i class="fas fa-eye"></i> View</button>
                    <button class="btn-success btn-sm" onclick="window.downloadPayslipPDF('${latestPayslip.id}')" style="flex:1;"><i class="fas fa-download"></i> PDF</button>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-label"><i class="fas fa-bell" style="color:var(--primary);"></i> Notifications</div>
                <div class="stat-value" style="font-size:1.4rem;">${notifications.length} <span style="font-size:0.85rem;color:var(--text-secondary);">Alerts</span></div>
                <div style="font-size:0.8rem;color:var(--text-secondary);margin-top:0.4rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
                    ${notifications[0]?.title || 'All caught up!'}
                </div>
                <span class="stat-change" onclick="window.switchSection('notifications')" style="cursor:pointer;color:var(--primary);"><i class="fas fa-list"></i> Open Notifications</span>
            </div>
        </div>

        <div class="card-grid" style="margin-top:1.5rem;">
            <div class="card" onclick="window.switchSection('apply_leave')">
                <div class="icon"><i class="fas fa-plane-departure"></i></div>
                <h4>Apply for Leave</h4>
                <p>Submit CL, SL, EL with auto-days calculation</p>
                <span class="badge">Apply</span>
            </div>
            <div class="card" onclick="window.switchSection('my_leaves')">
                <div class="icon"><i class="fas fa-calendar-check"></i></div>
                <h4>My Leave Requests</h4>
                <p>Track statuses & HR approval comments</p>
                <span class="badge">History</span>
            </div>
            <div class="card" onclick="window.switchSection('leave_balance')">
                <div class="icon"><i class="fas fa-scale-balanced"></i></div>
                <h4>Leave Balance</h4>
                <p>Monthly carry forward & EL rollover rules</p>
                <span class="badge">Balances</span>
            </div>
            <div class="card" onclick="window.switchSection('my_payslips')">
                <div class="icon"><i class="fas fa-file-invoice-dollar"></i></div>
                <h4>My Payslips</h4>
                <p>Download monthly PDF payslips</p>
                <span class="badge">Payroll</span>
            </div>
        </div>

        <div class="detail-list" style="margin-top:1.8rem;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
                <h3 style="margin:0;"><i class="fas fa-bell" style="color:var(--primary);margin-right:8px;"></i> Recent Announcements & Updates</h3>
                <span class="badge" style="background:var(--primary-light);color:var(--primary);">Live Feed</span>
            </div>
            <ul style="list-style:none;">
                ${notifications.map(n => `
                    <li style="display:flex;align-items:flex-start;gap:1rem;padding:0.8rem 0;border-bottom:1px solid var(--border);">
                        <div style="background:var(--primary-light);width:2.4rem;height:2.4rem;border-radius:50%;display:flex;align-items:center;justify-content:center;color:var(--primary);flex-shrink:0;">
                            <i class="fas ${n.icon}"></i>
                        </div>
                        <div style="flex:1;">
                            <div style="font-weight:600;color:var(--text-primary);font-size:0.95rem;">${n.title}</div>
                            <div style="color:var(--text-secondary);font-size:0.85rem;margin-top:0.2rem;">${n.text}</div>
                        </div>
                        <div style="font-size:0.75rem;color:var(--text-light);">${n.time}</div>
                    </li>
                `).join('')}
            </ul>
        </div>
    `;
}

// ============================================================
// ===== 2. EMPLOYEE DIRECTORY & ADD/EDIT EMPLOYEE =====
// ============================================================

function renderEmployees(userEmail, role, employees) {
    const isHRorAdmin = role === 'hr' || role === 'admin';
    const empList = employees || [];

    return `
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem;margin-bottom:1.5rem;">
            <div>
                <h2>Employee Directory</h2>
                <div class="subhead">${empList.length} verified company members · Displaying Annual CTC in LPA</div>
            </div>
            ${isHRorAdmin ? `
                <button class="btn-success" onclick="window.showAddEmployeeModal()" style="display:flex;align-items:center;gap:0.5rem;padding:0.65rem 1.4rem;">
                    <i class="fas fa-user-plus"></i> Add Employee
                </button>
            ` : ''}
        </div>

        <div style="margin-bottom:1.2rem;display:flex;gap:0.8rem;flex-wrap:wrap;">
            <input type="text" id="employeeSearchInput" placeholder="Search by name, department, designation, or PAN..." 
                   oninput="window.searchEmployees()"
                   style="flex:1;min-width:240px;padding:0.65rem 1rem;border:2px solid var(--border);border-radius:var(--radius-sm);background:var(--bg);color:var(--text-primary);"/>
            <button class="btn-primary btn-sm" onclick="window.searchEmployees()"><i class="fas fa-search"></i> Search</button>
            <button class="btn-secondary-custom btn-sm" onclick="window.clearSearch()"><i class="fas fa-times"></i> Clear</button>
        </div>

        <div class="employee-grid" id="employeeGrid">
            ${empList.length === 0 ? `
                <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 2rem; background: var(--card-bg); border-radius: var(--radius); border: 2px dashed var(--border);">
                    <i class="fas fa-users-slash" style="font-size: 3rem; color: var(--text-light); margin-bottom: 1rem; display: block;"></i>
                    <h3 style="margin: 0 0 0.5rem 0; color: var(--text-primary);">No Employees Found</h3>
                    <p style="margin: 0 0 1.5rem 0; color: var(--text-secondary); font-size: 0.9rem;">
                        ${!window.useMockData ? 'If your Supabase database has employee records, ensure your backend server (<code>node index.js</code>) is running on port 5000 with your <code>.env</code> Supabase credentials.' : 'The local employee store is empty.'}
                    </p>
                    ${isHRorAdmin ? `
                        <button class="btn-success" onclick="window.showAddEmployeeModal()" style="padding: 0.65rem 1.4rem;">
                            <i class="fas fa-user-plus"></i> Add First Employee
                        </button>
                    ` : ''}
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

                        <div class="emp-detail" style="font-size:0.75rem;margin-top:0.4rem;">
                            PAN: <strong>${emp.pan || 'N/A'}</strong> · DOJ: ${emp.joining_date || 'N/A'}
                        </div>

                        <span class="emp-status ${emp.status || 'active'}" style="margin-top:0.5rem;">${(emp.status || 'ACTIVE').toUpperCase()}</span>

                        ${isHRorAdmin ? `
                            <div style="margin-top:0.8rem;display:flex;gap:0.4rem;justify-content:center;">
                                <button class="btn-primary btn-sm" onclick="window.editEmployee('${emp.id}')" title="Edit details"><i class="fas fa-edit"></i> Edit</button>
                                <button class="btn-danger btn-sm" onclick="window.deleteEmployee('${emp.id}')" title="Delete employee"><i class="fas fa-trash"></i></button>
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
                            <img src="${DEFAULT_AVATARS.male}" id="modalEmpPhotoPreview" class="profile-avatar-large" alt="Employee Photo"/>
                            <div class="photo-upload-overlay" onclick="document.getElementById('modalPhotoUpload').click()">
                                <i class="fas fa-camera"></i>
                            </div>
                        </div>
                        <input type="file" id="modalPhotoUpload" accept="image/*" style="display:none;" onchange="window.handleModalPhotoUpload(event)"/>
                        <div style="font-size:0.75rem;color:var(--danger);font-weight:600;margin-top:0.3rem;">
                            * Employee Photo is Mandatory
                        </div>
                        <div style="display:flex;gap:0.4rem;justify-content:center;margin-top:0.4rem;">
                            <img src="${DEFAULT_AVATARS.alex}" class="sample-avatar-thumb" title="Sample 1" onclick="window.setModalPhoto('${DEFAULT_AVATARS.alex}')"/>
                            <img src="${DEFAULT_AVATARS.female}" class="sample-avatar-thumb" title="Sample 2" onclick="window.setModalPhoto('${DEFAULT_AVATARS.female}')"/>
                            <img src="${DEFAULT_AVATARS.male}" class="sample-avatar-thumb" title="Sample 3" onclick="window.setModalPhoto('${DEFAULT_AVATARS.male}')"/>
                            <img src="${DEFAULT_AVATARS.hr}" class="sample-avatar-thumb" title="Sample 4" onclick="window.setModalPhoto('${DEFAULT_AVATARS.hr}')"/>
                        </div>
                    </div>

                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
                        <div class="input-group" style="margin:0;">
                            <label>Full Name *</label>
                            <input type="text" id="empName" required placeholder="Legal full name" oninput="window.validateNameInput(this)">
                            <div id="empNameError" class="field-error-msg"></div>
                        </div>
                        <div class="input-group" style="margin:0;">
                            <label>Email (Permanent) *</label>
                            <input type="email" id="empEmail" required placeholder="employee@company.com" 
                                   style="background:var(--bg);" oninput="window.validateEmailInput(this)"/>
                            <div id="empEmailError" class="field-error-msg"></div>
                            <div style="font-size:0.75rem;color:var(--text-light);margin-top:0.2rem;">
                                <i class="fas fa-info-circle"></i> Email will be used for login
                            </div>
                        </div>
                        <div class="input-group" style="margin:0;">
                            <label>Phone Number (10-Digit Indian Mobile) *</label>
                            <div style="display:flex;align-items:center;position:relative;">
                                <span style="position:absolute;left:12px;font-weight:700;color:var(--text-secondary);font-size:0.9rem;pointer-events:none;">+91</span>
                                <input type="tel" id="empPhone" maxlength="10" required placeholder="9876543210" 
                                       style="padding-left:45px;letter-spacing:1px;font-weight:600;" 
                                       oninput="window.validatePhoneInput(this)">
                            </div>
                            <div id="empPhoneError" class="field-error-msg"></div>
                            <div style="font-size:0.75rem;color:var(--text-light);margin-top:0.2rem;">
                                * Only 10 digits starting with 6, 7, 8, or 9
                            </div>
                        </div>
                        <div class="input-group" style="margin:0;">
                            <label>Gender *</label>
                            <select id="empGender" required style="width:100%;padding:0.65rem 1rem;border:2px solid var(--border);border-radius:var(--radius-sm);background:var(--bg);">
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div class="input-group" style="margin:0;">
                            <label>Date of Birth (DOB) *</label>
                            <input type="date" id="empDob" required>
                        </div>
                        <div class="input-group" style="margin:0;">
                            <label>Date of Joining (DOJ) *</label>
                            <input type="date" id="empJoiningDate" required>
                        </div>

                        <div class="input-group" style="margin:0;">
                            <label>Department *</label>
                            <select id="empDepartment" required onchange="window.handleDeptChange(this.value)" style="width:100%;padding:0.65rem 1rem;border:2px solid var(--border);border-radius:var(--radius-sm);background:var(--bg);font-weight:600;">
                                <option value="IT">IT (Software & Technology)</option>
                                <option value="HR">HR (Human Resources)</option>
                                <option value="Finance">Finance</option>
                                <option value="Sales">Sales</option>
                                <option value="Marketing">Marketing</option>
                                <option value="Operations">Operations</option>
                            </select>
                        </div>

                        <div class="input-group" style="margin:0;">
                            <label>Designation * <span style="font-size:0.75rem;color:var(--primary);">(Department Specific)</span></label>
                            <select id="empDesignation" required style="width:100%;padding:0.65rem 1rem;border:2px solid var(--border);border-radius:var(--radius-sm);background:var(--bg);font-weight:600;">
                            </select>
                        </div>

                        <div class="input-group" style="margin:0;">
                            <label>Employment Type *</label>
                            <select id="empEmploymentType" required style="width:100%;padding:0.65rem 1rem;border:2px solid var(--border);border-radius:var(--radius-sm);background:var(--bg);">
                                <option value="Full-Time">Full-Time</option>
                                <option value="Part-Time">Part-Time</option>
                                <option value="Contract">Contract</option>
                                <option value="Probation">Probation</option>
                            </select>
                        </div>

                        <div class="input-group" style="margin:0;">
                            <label>Annual CTC (in LPA) *</label>
                            <input type="text" id="empAnnualCtc" required placeholder="e.g., 9.00 LPA or 12.50">
                        </div>

                        <div class="input-group" style="margin:0;">
                            <label>Monthly Salary (₹) *</label>
                            <input type="number" id="empSalary" required placeholder="75000" 
                                    oninput="window.calculatePayrollPreview(this.value)"
                                    onchange="window.calculatePayrollPreview(this.value)"/>
                            <div id="payrollPreview" style="margin-top:0.5rem;padding:0.5rem;background:#f8fafc;border-radius:var(--radius-sm);font-size:0.8rem;display:none;border:1px solid var(--border);">
                                <div style="font-weight:600;color:var(--text-primary);margin-bottom:0.3rem;">📊 Payroll Breakdown Preview</div>
                                <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.3rem;">
                                    <span>Basic (50%): <strong id="previewBasic">₹0</strong></span>
                                    <span>HRA (40% of Basic): <strong id="previewHRA">₹0</strong></span>
                                    <span>Conveyance: <strong>₹1,600</strong></span>
                                    <span>Medical: <strong>₹1,250</strong></span>
                                    <span>Special Allowance: <strong id="previewSpecial">₹0</strong></span>
                                    <span style="font-weight:600;color:var(--primary);">Gross: <strong id="previewGross">₹0</strong></span>
                                    <span>PF (12% of Basic): <strong id="previewPF">₹0</strong></span>
                                    <span style="font-weight:600;color:var(--success);">Net Salary: <strong id="previewNet">₹0</strong></span>
                                </div>
                            </div>
                        </div>

                        <div class="input-group" style="margin:0;">
                            <label>PAN Number (Mandatory) *</label>
                            <input type="text" id="empPan" maxlength="10" required placeholder="ABCDE1234F" style="text-transform:uppercase;" oninput="window.validatePanInput(this)">
                            <div id="empPanError" class="field-error-msg"></div>
                        </div>

                        <div class="input-group" style="margin:0;">
                            <label>Aadhaar Number (12-digit) *</label>
                            <input type="text" id="empAadhaar" required placeholder="XXXX XXXX XXXX" oninput="window.validateAadhaarInput(this)">
                            <div id="empAadhaarError" class="field-error-msg"></div>
                        </div>

                        <div class="input-group" style="margin:0;grid-column:1/-1;">
                            <label>Passport Number / Passport ID <span style="font-size:0.75rem;color:var(--text-light);">(Optional)</span></label>
                            <input type="text" id="empPassport" placeholder="e.g., L8924012" style="text-transform:uppercase;">
                        </div>

                        <div class="input-group" style="margin:0;grid-column:1/-1;">
                            <label>Residential Address</label>
                            <input type="text" id="empAddress" placeholder="Flat / House No, Street, City, State, PIN">
                        </div>

                        <div class="input-group" style="margin:0;">
                            <label>Bank Name</label>
                            <input type="text" id="empBankName" placeholder="e.g., HDFC Bank">
                        </div>

                        <div class="input-group" style="margin:0;">
                            <label>Bank Account Number</label>
                            <input type="text" id="empBankAccount" placeholder="Account Number">
                        </div>
                    </div>

                    <div style="display:flex;gap:0.8rem;margin-top:1.5rem;">
                        <button type="submit" class="btn-success" style="flex:1;"><i class="fas fa-save"></i> <span id="submitBtnText">Save Employee</span></button>
                        <button type="button" class="btn-secondary-custom" onclick="document.getElementById('addEmployeeModal').style.display='none'" style="flex:0.4;">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    `;
}
// ============================================================
// ===== CALCULATE PAYROLL PREVIEW =====
// ============================================================

function calculatePayrollPreview(salary) {
    const previewDiv = document.getElementById('payrollPreview');
    if (!previewDiv) return;

    const numSalary = parseInt(salary) || 0;

    if (numSalary <= 0) {
        previewDiv.style.display = 'none';
        return;
    }

    // ✅ Backend calculation rules
    const basic = Math.round(numSalary * 0.5);
    const hra = Math.round(basic * 0.4);
    const conveyance = 1600;
    const medical = 1250;
    const specialAllowance = Math.max(0, numSalary - basic - hra - conveyance - medical);
    const gross = basic + hra + specialAllowance + conveyance + medical;
    const pf = Math.round(basic * 0.12);
    const profTax = 200;
    const tds = 0;
    const healthInsurance = 0;
    const totalDeductions = pf + profTax + tds + healthInsurance;
    const net = gross - totalDeductions;

    // Update preview fields
    document.getElementById('previewBasic').textContent = '₹' + basic.toLocaleString('en-IN');
    document.getElementById('previewHRA').textContent = '₹' + hra.toLocaleString('en-IN');
    document.getElementById('previewSpecial').textContent = '₹' + specialAllowance.toLocaleString('en-IN');
    document.getElementById('previewGross').textContent = '₹' + gross.toLocaleString('en-IN');
    document.getElementById('previewPF').textContent = '₹' + pf.toLocaleString('en-IN');
    document.getElementById('previewNet').textContent = '₹' + net.toLocaleString('en-IN');

    previewDiv.style.display = 'block';
}

window.calculatePayrollPreview = calculatePayrollPreview;

function handleDeptChange(deptName, targetDesignation = '') {
    const desigSelect = document.getElementById('empDesignation');
    if (!desigSelect) return;

    const options = DEPARTMENT_DESIGNATIONS[deptName] || DEPARTMENT_DESIGNATIONS['IT'] || [];
    desigSelect.innerHTML = options.map(d => `<option value="${d}" ${d === targetDesignation ? 'selected' : ''}>${d}</option>`).join('');
}

function setModalPhoto(url) {
    const preview = document.getElementById('modalEmpPhotoPreview');
    if (preview) preview.src = url;
}

function handleModalPhotoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => setModalPhoto(event.target.result);
    reader.readAsDataURL(file);
}

function formatIndianPhoneInput(input) {
    validatePhoneInput(input);
}

function validatePanInput(input) {
    if (!input) return false;
    input.value = input.value.toUpperCase();
    const val = input.value.trim();
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    const errorEl = document.getElementById(input.id + 'Error');

    if (!val) {
        input.classList.add('is-invalid');
        input.classList.remove('is-valid');
        if (errorEl) {
            errorEl.style.display = 'flex';
            errorEl.innerHTML = '<i class="fas fa-circle-exclamation"></i> PAN Number is mandatory (e.g. ABCDE1234F)';
        }
        return false;
    }

    if (!panRegex.test(val)) {
        input.classList.add('is-invalid');
        input.classList.remove('is-valid');
        if (errorEl) {
            errorEl.style.display = 'flex';
            errorEl.innerHTML = '<i class="fas fa-circle-exclamation"></i> Invalid PAN Number. Format must be 5 letters, 4 numbers, 1 letter (e.g. ABCDE1234F)';
        }
        return false;
    } else {
        input.classList.remove('is-invalid');
        input.classList.add('is-valid');
        if (errorEl) {
            errorEl.style.display = 'none';
        }
        return true;
    }
}

function validateAadhaarInput(input) {
    if (!input) return false;
    let raw = input.value.replace(/\D/g, '').substring(0, 12);
    input.value = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    const errorEl = document.getElementById(input.id + 'Error');

    if (!raw) {
        input.classList.remove('is-invalid', 'is-valid');
        if (errorEl) { errorEl.style.display = 'none'; }
        return true;
    }

    if (raw.length !== 12) {
        input.classList.add('is-invalid');
        input.classList.remove('is-valid');
        if (errorEl) {
            errorEl.style.display = 'flex';
            errorEl.innerHTML = `<i class="fas fa-circle-exclamation"></i> Invalid Aadhaar Number. Exactly 12 digits required (${raw.length}/12 entered)`;
        }
        return false;
    } else {
        input.classList.remove('is-invalid');
        input.classList.add('is-valid');
        if (errorEl) {
            errorEl.style.display = 'none';
        }
        return true;
    }
}

function validatePhoneInput(input) {
    if (!input) return false;
    let raw = input.value.replace(/\D/g, '').substring(0, 10);
    input.value = raw;
    const indianPhoneRegex = /^[6-9]\d{9}$/;
    const errorEl = document.getElementById(input.id + 'Error');

    if (!raw) {
        input.classList.add('is-invalid');
        input.classList.remove('is-valid');
        if (errorEl) {
            errorEl.style.display = 'flex';
            errorEl.innerHTML = '<i class="fas fa-circle-exclamation"></i> Mobile number is mandatory';
        }
        return false;
    }

    if (!indianPhoneRegex.test(raw)) {
        input.classList.add('is-invalid');
        input.classList.remove('is-valid');
        if (errorEl) {
            errorEl.style.display = 'flex';
            if (!/^[6-9]/.test(raw)) {
                errorEl.innerHTML = '<i class="fas fa-circle-exclamation"></i> Indian mobile must start with 6, 7, 8, or 9';
            } else {
                errorEl.innerHTML = `<i class="fas fa-circle-exclamation"></i> Must be exactly 10 digits (${raw.length}/10 entered)`;
            }
        }
        return false;
    } else {
        input.classList.remove('is-invalid');
        input.classList.add('is-valid');
        if (errorEl) {
            errorEl.style.display = 'none';
        }
        return true;
    }
}

function validateEmailInput(input) {
    if (!input) return false;
    const val = input.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const errorEl = document.getElementById(input.id + 'Error');

    if (!val) {
        input.classList.add('is-invalid');
        input.classList.remove('is-valid');
        if (errorEl) {
            errorEl.style.display = 'flex';
            errorEl.innerHTML = '<i class="fas fa-circle-exclamation"></i> Email address is mandatory';
        }
        return false;
    }

    if (!emailRegex.test(val)) {
        input.classList.add('is-invalid');
        input.classList.remove('is-valid');
        if (errorEl) {
            errorEl.style.display = 'flex';
            errorEl.innerHTML = '<i class="fas fa-circle-exclamation"></i> Invalid email format (e.g. employee@company.com)';
        }
        return false;
    } else {
        input.classList.remove('is-invalid');
        input.classList.add('is-valid');
        if (errorEl) {
            errorEl.style.display = 'none';
        }
        return true;
    }
}

function validateNameInput(input) {
    if (!input) return false;
    const val = input.value.trim();
    const errorEl = document.getElementById(input.id + 'Error');

    if (!val || val.length < 2) {
        input.classList.add('is-invalid');
        input.classList.remove('is-valid');
        if (errorEl) {
            errorEl.style.display = 'flex';
            errorEl.innerHTML = '<i class="fas fa-circle-exclamation"></i> Full name must be at least 2 characters';
        }
        return false;
    } else {
        input.classList.remove('is-invalid');
        input.classList.add('is-valid');
        if (errorEl) {
            errorEl.style.display = 'none';
        }
        return true;
    }
}

function clearValidationStates(formId) {
    const form = document.getElementById(formId);
    if (!form) return;
    form.querySelectorAll('input, select').forEach(el => {
        el.classList.remove('is-invalid', 'is-valid');
    });
    form.querySelectorAll('.field-error-msg').forEach(el => {
        el.style.display = 'none';
        el.innerHTML = '';
    });
}

window.formatIndianPhoneInput = formatIndianPhoneInput;
window.validatePanInput = validatePanInput;
window.validateAadhaarInput = validateAadhaarInput;
window.validatePhoneInput = validatePhoneInput;
window.validateEmailInput = validateEmailInput;
window.validateNameInput = validateNameInput;
window.clearValidationStates = clearValidationStates;

function showAddEmployeeModal() {
    const modal = document.getElementById('addEmployeeModal');
    if (!modal) return;
    modal.style.display = 'flex';
    document.getElementById('employeeModalTitle').innerHTML = '<i class="fas fa-user-plus" style="color:var(--primary);margin-right:8px;"></i> Add New Employee';
    document.getElementById('submitBtnText').textContent = 'Add Employee';
    document.getElementById('editEmployeeId').value = '';
    document.getElementById('employeeForm').reset();
    clearValidationStates('employeeForm');
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
    document.getElementById('employeeModalTitle').innerHTML = '<i class="fas fa-edit" style="color:var(--primary);margin-right:8px;"></i> Edit Employee Details';
    document.getElementById('submitBtnText').textContent = 'Update Employee';
    document.getElementById('editEmployeeId').value = emp.id;
    clearValidationStates('employeeForm');
    document.getElementById('empName').value = emp.name || '';
    document.getElementById('empEmail').value = emp.email || '';
    const cleanPhone = (emp.phone || '').replace('+91', '').replace(/\D/g, '');
    document.getElementById('empPhone').value = cleanPhone.slice(-10);
    document.getElementById('empGender').value = emp.gender || 'Male';
    document.getElementById('empDob').value = emp.dob || '1995-01-01';
    document.getElementById('empJoiningDate').value = emp.joining_date || '2024-01-01';
    document.getElementById('empDepartment').value = emp.department || 'IT';
    handleDeptChange(emp.department || 'IT', emp.designation);
    document.getElementById('empEmploymentType').value = emp.employment_type || 'Full-Time';
    document.getElementById('empAnnualCtc').value = emp.annual_ctc || (emp.monthly_salary ? `${((Number(emp.monthly_salary)*12)/100000).toFixed(2)} LPA` : '9.00 LPA');
    document.getElementById('empSalary').value = emp.monthly_salary || 50000;
    window.calculatePayrollPreview(emp.monthly_salary || 50000);
    document.getElementById('empPan').value = emp.pan || '';
    document.getElementById('empAadhaar').value = emp.aadhaar || '';
    document.getElementById('empPassport').value = emp.passport || '';
    document.getElementById('empAddress').value = emp.address || '';
    document.getElementById('empBankName').value = emp.bank_details?.bank_name || emp.bank_name || '';
    document.getElementById('empBankAccount').value = emp.bank_details?.account_number || emp.account_number || '';
    setModalPhoto(emp.photo || DEFAULT_AVATARS.male);
}

async function saveEmployee(event) {
    event.preventDefault();
    const id = document.getElementById('editEmployeeId').value;
    const name = document.getElementById('empName').value.trim();
    const email = document.getElementById('empEmail').value.trim();
    const rawPhone = document.getElementById('empPhone').value.replace(/\D/g, '');
    const gender = document.getElementById('empGender').value;
    const dob = document.getElementById('empDob').value;
    const doj = document.getElementById('empJoiningDate').value;
    const dept = document.getElementById('empDepartment').value;
    const desig = document.getElementById('empDesignation').value;
    const empType = document.getElementById('empEmploymentType').value;
    let annualCtc = document.getElementById('empAnnualCtc').value.trim();
    if (!annualCtc.toLowerCase().includes('lpa')) annualCtc += ' LPA';
    const pan = document.getElementById('empPan').value.trim().toUpperCase();
    const aadhaar = document.getElementById('empAadhaar').value.trim();
    const passport = document.getElementById('empPassport').value.trim();
    const address = document.getElementById('empAddress').value.trim();
    const bankName = document.getElementById('empBankName').value.trim();
    const bankAccount = document.getElementById('empBankAccount').value.trim();
    const photo = document.getElementById('modalEmpPhotoPreview').src;

    // Inline Real-Time Field Validations
    const isNameValid = validateNameInput(document.getElementById('empName'));
    const isEmailValid = validateEmailInput(document.getElementById('empEmail'));
    const isPhoneValid = validatePhoneInput(document.getElementById('empPhone'));
    const isPanValid = validatePanInput(document.getElementById('empPan'));
    const isAadhaarValid = validateAadhaarInput(document.getElementById('empAadhaar'));

    if (!isNameValid || !isEmailValid || !isPhoneValid || !isPanValid || !isAadhaarValid) {
        window.showToast('Validation Error', 'Please correct the highlighted fields with red marks.', 'error');
        const firstInvalid = document.querySelector('#employeeForm .is-invalid');
        if (firstInvalid) firstInvalid.focus();
        return;
    }

    const phone = '+91 ' + rawPhone;
    const ctcNumber = parseFloat(annualCtc.replace(/[^\d.]/g, '') || '9');
    const monthlySalary = parseInt(document.getElementById('empSalary')?.value) || Math.round((ctcNumber * 100000) / 12);

    if (isNaN(monthlySalary) || monthlySalary <= 0) {
        window.showToast('Validation Error', 'Please enter a valid monthly salary.', 'error');
        document.getElementById('empSalary')?.focus();
        return;
    }

    const payload = {
        name,
        email,
        phone,
        gender,
        dob,
        joining_date: doj,
        department: dept,
        designation: desig,
        role: 'employee',
        employment_type: empType,
        annual_ctc: annualCtc,
        monthly_salary: monthlySalary,
        pan,
        aadhaar,
        passport,
        address,
        photo,
        bank_details: { bank_name: bankName, account_number: bankAccount }
    };

    // 1. Real Backend API Integration
    if (!window.useMockData && window.api) {
        try {
            window.showToast('Info', id ? 'Updating employee in database...' : 'Creating employee in database...', 'info');
            if (id) {
                await window.api.updateEmployee(id, payload);
                window.showToast('Success', 'Employee record updated in database!', 'success');
            } else {
                await window.api.addEmployee(payload);
                window.showToast('Success', `Employee ${name} added to database!`, 'success');
            }
            document.getElementById('addEmployeeModal').style.display = 'none';
            if (currentUser?.email) {
                await renderApp(currentUser.email);
            }
            return;
        } catch (error) {
            console.error('❌ Failed to save employee via API:', error);
            window.showToast('Error', error.message || 'Failed to save employee to database.', 'error');
            return;
        }
    }

    // 2. Offline / Local Fallback
    const employees = window._currentEmployees || [];
    if (id) {
        const emp = employees.find(e => String(e.id) === String(id));
        if (emp) {
            Object.assign(emp, payload);
            window.showToast('Success', 'Employee profile updated successfully!', 'success');
        }
    } else {
        const newEmp = {
            id: (employees.length > 0 ? Math.max(...employees.map(e => Number(e.id) || 0)) : 0) + 1,
            ...payload,
            status: 'active',
            leave_balance: 14,
            leaves_taken: 0
        };
        employees.push(newEmp);
        window.showToast('Success', `New employee ${name} added!`, 'success');
    }

    window.saveEmployeesData(employees);
    document.getElementById('addEmployeeModal').style.display = 'none';
    refreshCurrentSection();
}

async function deleteEmployee(id) {
    if (!confirm('Are you sure you want to deactivate and remove this employee?')) return;

    if (!window.useMockData && window.api) {
        try {
            window.showToast('Info', 'Deleting employee from database...', 'info');
            await window.api.deleteEmployee(id);
            window.showToast('Success', 'Employee removed from database.', 'success');
            if (currentUser?.email) {
                await renderApp(currentUser.email);
            }
            return;
        } catch (error) {
            console.error('❌ Failed to delete employee via API:', error);
            window.showToast('Error', error.message || 'Failed to delete employee.', 'error');
            return;
        }
    }

    const employees = (window._currentEmployees || []).filter(e => String(e.id) !== String(id));
    window.saveEmployeesData(employees);
    window.showToast('Success', 'Employee record removed.', 'success');
    refreshCurrentSection();
}

function searchEmployees() {
    const term = document.getElementById('employeeSearchInput')?.value.toLowerCase().trim() || '';
    const cards = document.querySelectorAll('.employee-card');
    cards.forEach(c => {
        const text = c.textContent.toLowerCase();
        c.style.display = text.includes(term) ? '' : 'none';
    });
}

function clearSearch() {
    const input = document.getElementById('employeeSearchInput');
    if (input) input.value = '';
    searchEmployees();
}

// ============================================================
// ===== 3. DEPARTMENTS DIRECTORY =====
// ============================================================

function renderDepartments(userEmail, role) {
    const employees = window._currentEmployees || [];
    const deptList = ['IT', 'HR', 'Finance', 'Sales', 'Marketing', 'Operations'];
    const depts = deptList.map(name => {
        const count = employees.filter(e => (e.department || '').toLowerCase() === name.toLowerCase()).length;
        return {
            name,
            code: name.toUpperCase().slice(0, 3),
            head: `${name} Department Lead`,
            employees_count: count,
            description: `Core operational and strategic initiatives for the ${name} division.`
        };
    });
    return `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem;flex-wrap:wrap;gap:1rem;">
            <div>
                <h2>Company Departments</h2>
                <div class="subhead">Operational structure, departmental heads & active team allocations</div>
            </div>
            <span class="badge" style="background:var(--primary-light);color:var(--primary);padding:0.4rem 1rem;">${depts.length} Operating Divisions</span>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:1.5rem;">
            ${depts.map(d => `
                <div class="stat-card" style="padding:1.5rem;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.8rem;">
                        <h3 style="margin:0;color:var(--primary);"><i class="fas fa-building" style="margin-right:8px;"></i> ${d.name}</h3>
                        <span class="badge" style="background:#f1f5f9;color:var(--text-primary);font-weight:700;">${d.code}</span>
                    </div>
                    <div style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:1rem;line-height:1.4;">
                        ${d.description || 'Departmental operations and team workflows.'}
                    </div>
                    <div style="border-top:1px solid var(--border);padding-top:0.8rem;display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;font-size:0.85rem;">
                        <div>Head: <strong>${d.head}</strong></div>
                        <div style="text-align:right;">Staff: <strong>${d.employees_count} Members</strong></div>
                        <div>Annual Budget:</div>
                        <div style="text-align:right;color:var(--success);font-weight:700;">${d.budget}</div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// ============================================================
// ===== 4. LEAVE MANAGEMENT (EMPLOYEE & HR VIEWS) =====
// ============================================================

function renderLeaves(userEmail, role, employees, leaves) {
    if (role === 'hr' || role === 'admin') {
        return renderHRLeaveDesk(userEmail, employees, leaves);
    }
    return renderMyLeavesSection(userEmail, role, employees, leaves);
}

function renderHRLeaveDesk(userEmail, employees, leaves) {
    const pending = leaves.filter(l => l.status === 'pending');
    const processed = leaves.filter(l => l.status !== 'pending');

    return `
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem;margin-bottom:1.5rem;">
            <div>
                <h2>HR Leave Management Desk</h2>
                <div class="subhead">Review, approve, or reject employee leave requests with audit comments</div>
            </div>
            <span class="badge" style="background:#fde8e8;color:#dc3545;font-weight:700;padding:0.4rem 1rem;">
                ${pending.length} Pending Approval
            </span>
        </div>

        <div class="detail-list" style="margin-bottom:1.5rem;">
            <h3 style="margin-top:0;margin-bottom:1rem;color:var(--text-primary);"><i class="fas fa-clock" style="color:#f0ad4e;margin-right:8px;"></i> Awaiting HR Action</h3>
            <div class="custom-table-responsive">
                <table class="styled-table">
                    <thead>
                        <tr>
                            <th>Employee</th>
                            <th>Leave Type</th>
                            <th>Period</th>
                            <th>Days</th>
                            <th>Reason</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${pending.length === 0 ? `<tr><td colspan="6" style="text-align:center;padding:2rem;color:var(--text-light);">No pending leave requests! All applications are processed.</td></tr>` : ''}
                        ${pending.map(req => `
                            <tr>
                                <td><strong>${req.employee}</strong></td>
                                <td><span class="tag-pill available">${req.type}</span></td>
                                <td>${req.from} to ${req.to}</td>
                                <td><strong>${req.days} Day(s)</strong></td>
                                <td>${req.reason}</td>
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
            <h3 style="margin-top:0;margin-bottom:1rem;color:var(--text-primary);"><i class="fas fa-history" style="color:var(--primary);margin-right:8px;"></i> Processed Leave History</h3>
            <div class="custom-table-responsive">
                <table class="styled-table">
                    <thead>
                        <tr>
                            <th>Employee</th>
                            <th>Leave Type</th>
                            <th>Period</th>
                            <th>Days</th>
                            <th>Status</th>
                            <th>Comments / Remarks</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${processed.map(req => `
                            <tr>
                                <td><strong>${req.employee}</strong></td>
                                <td>${req.type}</td>
                                <td>${req.from} to ${req.to}</td>
                                <td>${req.days} Days</td>
                                <td>
                                    <span class="badge" style="background:${req.status==='approved'?'#d4edda':'#fde8e8'};color:${req.status==='approved'?'#155724':'#dc3545'};">
                                        <i class="fas ${req.status==='approved'?'fa-check-circle':'fa-times-circle'}"></i> ${req.status.toUpperCase()}
                                    </span>
                                </td>
                                <td style="font-size:0.85rem;color:var(--text-secondary);">${req.comments?.join('; ') || 'No remarks'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>

        <div id="leaveCommentModal" class="modal-backdrop" style="display:none;">
            <div style="background:var(--card-bg);border-radius:var(--radius);padding:1.8rem;max-width:440px;width:90%;">
                <h3 style="margin-top:0;" id="leaveActionModalTitle">Approve Leave Application</h3>
                <p style="font-size:0.85rem;color:var(--text-secondary);">Add an optional remark for the employee's official records.</p>
                <div class="input-group">
                    <label>HR Comment / Reason</label>
                    <textarea id="leaveActionComment" rows="3" style="width:100%;padding:0.6rem;border:2px solid var(--border);border-radius:var(--radius-sm);background:var(--bg);" placeholder="e.g., Approved as per team availability..."></textarea>
                </div>
                <div style="display:flex;gap:0.8rem;margin-top:1.2rem;">
                    <button class="btn-primary" onclick="window.confirmLeaveAction()"><i class="fas fa-paper-plane"></i> Submit Decision</button>
                    <button class="btn-secondary-custom" onclick="document.getElementById('leaveCommentModal').style.display='none'">Cancel</button>
                </div>
            </div>
        </div>
    `;
}

function promptApproveLeave(id) {
    currentLeaveActionId = id;
    currentLeaveActionType = 'approved';
    document.getElementById('leaveActionModalTitle').textContent = 'Approve Leave Request';
    document.getElementById('leaveActionComment').value = 'Approved by HR Management';
    document.getElementById('leaveCommentModal').style.display = 'flex';
}

function promptRejectLeave(id) {
    currentLeaveActionId = id;
    currentLeaveActionType = 'rejected';
    document.getElementById('leaveActionModalTitle').textContent = 'Reject Leave Request';
    document.getElementById('leaveActionComment').value = 'Rejected due to project deadlines and critical deliverables';
    document.getElementById('leaveCommentModal').style.display = 'flex';
}

async function confirmLeaveAction() {
    const comment = document.getElementById('leaveActionComment').value.trim();

    if (!window.useMockData && window.api) {
        try {
            window.showToast('Info', 'Updating leave status in database...', 'info');
            if (currentLeaveActionType === 'approved') {
                await window.api.approveLeave(currentLeaveActionId);
            } else {
                await window.api.rejectLeave(currentLeaveActionId);
            }
            window.showToast('Success', `Leave request has been marked as ${currentLeaveActionType}.`, 'success');
            document.getElementById('leaveCommentModal').style.display = 'none';
            if (currentUser?.email) await renderApp(currentUser.email);
            return;
        } catch (e) {
            console.error('Leave action error:', e);
            window.showToast('Error', e.message || 'Failed to update leave in database.', 'error');
            return;
        }
    }

    const leaves = window._currentLeaves || [];
    const req = leaves.find(r => String(r.id) === String(currentLeaveActionId));
    if (req) {
        req.status = currentLeaveActionType;
        if (comment) req.comments = [comment];
        window.saveLeavesData(leaves);
        window.showToast('Success', `Leave request has been marked as ${currentLeaveActionType}.`, 'success');
    }
    document.getElementById('leaveCommentModal').style.display = 'none';
    refreshCurrentSection();
}

function renderApplyLeaveSection(userEmail, role, employees) {
    const currentEmp = employees.find(e => e.email && e.email.toLowerCase() === userEmail.toLowerCase()) || employees[0];
    const balances = currentEmp?.leave_balances || {};

    return `
        <div style="margin-bottom:1.5rem;">
            <h2>Apply for Leave</h2>
            <div class="subhead">Submit casual, sick, or earned leave applications with automatic duration calculation</div>
        </div>

        <div class="detail-list" style="max-width:720px;margin:0 auto;">
            <form id="applyLeaveForm" onsubmit="window.submitApplyLeave(event)">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.2rem;">
                    
                    <div class="input-group" style="margin:0;grid-column:1/-1;">
                        <label>Leave Type *</label>
                        <select id="leaveTypeSelect" required style="width:100%;padding:0.7rem 1rem;border:2px solid var(--border);border-radius:var(--radius-sm);background:var(--bg);font-weight:600;">
                            <option value="Casual Leave">Casual Leave (CL) — ${balances.casual?.remaining || 3} days available</option>
                            <option value="Sick Leave">Sick Leave (SL) — ${balances.sick?.remaining || 3} days available</option>
                            <option value="Earned Leave">Earned Leave (EL) — ${balances.earned?.remaining || 10} days available</option>
                        </select>
                    </div>

                    <div class="input-group" style="margin:0;">
                        <label>From Date *</label>
                        <input type="date" id="leaveFromDate" required onchange="window.calcLeaveDaysAuto()">
                    </div>

                    <div class="input-group" style="margin:0;">
                        <label>To Date *</label>
                        <input type="date" id="leaveToDate" required onchange="window.calcLeaveDaysAuto()">
                    </div>

                    <div class="input-group" style="margin:0;grid-column:1/-1;">
                        <label>Calculated Number of Days <span style="color:var(--primary);font-size:0.8rem;">(Auto-computed)</span></label>
                        <input type="number" id="leaveCalculatedDays" readonly required value="1" 
                               style="background:var(--border);font-weight:700;font-size:1.1rem;color:var(--primary);cursor:not-allowed;">
                    </div>

                    <div class="input-group" style="margin:0;grid-column:1/-1;">
                        <label>Reason for Leave *</label>
                        <textarea id="leaveReasonText" required rows="3" placeholder="Provide reason for leave..." style="width:100%;padding:0.7rem 1rem;border:2px solid var(--border);border-radius:var(--radius-sm);background:var(--bg);"></textarea>
                    </div>

                    <div class="input-group" style="margin:0;grid-column:1/-1;">
                        <label>Attachment <span style="font-size:0.75rem;color:var(--text-light);">(Optional / Medical prescription or travel document)</span></label>
                        <input type="file" id="leaveAttachmentFile" style="padding:0.4rem;">
                    </div>
                </div>

                <div style="margin-top:1.5rem;display:flex;gap:0.8rem;">
                    <button type="submit" class="btn-primary" style="padding:0.75rem 2rem;"><i class="fas fa-paper-plane"></i> Submit Application</button>
                    <button type="button" class="btn-secondary-custom" onclick="window.switchSection('my_leaves')">View My Leaves</button>
                </div>
            </form>
        </div>
    `;
}

function calcLeaveDaysAuto() {
    const from = document.getElementById('leaveFromDate')?.value;
    const to = document.getElementById('leaveToDate')?.value;
    const daysInput = document.getElementById('leaveCalculatedDays');
    if (!daysInput) return;

    if (from && to) {
        const d1 = new Date(from);
        const d2 = new Date(to);
        if (d2 >= d1) {
            const diffTime = Math.abs(d2 - d1);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            daysInput.value = diffDays;
        } else {
            daysInput.value = 1;
            window.showToast('Warning', 'To Date cannot be earlier than From Date.', 'warning');
        }
    }
}

async function submitApplyLeave(event) {
    event.preventDefault();
    const type = document.getElementById('leaveTypeSelect').value;
    const from = document.getElementById('leaveFromDate').value;
    const to = document.getElementById('leaveToDate').value;
    const days = parseInt(document.getElementById('leaveCalculatedDays').value) || 1;
    const reason = document.getElementById('leaveReasonText').value.trim();

    const userEmail = currentUser?.email || 'alex.employee@gmail.com';
    const currentEmp = currentUser?.empData || (window._currentEmployees || []).find(e => e.email === userEmail) || { id: 1, name: currentUser?.name || 'Employee' };

    const newReq = {
        employee_id: currentEmp.id,
        employee_name: currentEmp.name,
        type: type,
        from_date: from,
        to_date: to,
        days: days,
        reason: reason,
        status: 'pending'
    };

    if (!window.useMockData && window.api) {
        try {
            window.showToast('Info', 'Submitting leave application to database...', 'info');
            await window.api.applyLeave(newReq);
            window.showToast('Success', 'Leave application submitted successfully in database!', 'success');
            if (currentUser?.email) await renderApp(currentUser.email);
            window.switchSection('my_leaves');
            return;
        } catch (e) {
            console.error('Leave submission error:', e);
            window.showToast('Error', e.message || 'Failed to submit leave.', 'error');
            return;
        }
    }

    const leaves = window._currentLeaves || [];
    leaves.unshift({
        id: Date.now(),
        employee: currentEmp.name,
        employee_id: currentEmp.id,
        type, from, to, days, reason,
        status: 'pending',
        comments: []
    });
    window.saveLeavesData(leaves);
    window.showToast('Success', 'Leave application submitted successfully for HR approval!', 'success');
    window.switchSection('my_leaves');
}

function renderMyLeavesSection(userEmail, role, employees, leaves) {
    const currentEmp = employees.find(e => e.email && e.email.toLowerCase() === userEmail.toLowerCase()) || employees[0];
    const myLeavesList = leaves.filter(l => l.employee_id === currentEmp?.id || l.employee === currentEmp?.name);

    return `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem;flex-wrap:wrap;gap:1rem;">
            <div>
                <h2>My Leave Requests</h2>
                <div class="subhead">Track all your submitted leave applications, statuses & HR responses</div>
            </div>
            <button class="btn-primary" onclick="window.switchSection('apply_leave')">
                <i class="fas fa-plus"></i> Apply for Leave
            </button>
        </div>

        <div class="detail-list">
            <div class="custom-table-responsive">
                <table class="styled-table">
                    <thead>
                        <tr>
                            <th>Leave Type</th>
                            <th>Duration (From - To)</th>
                            <th>Days</th>
                            <th>Reason</th>
                            <th>Status</th>
                            <th>HR Comments</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${myLeavesList.length === 0 ? `<tr><td colspan="6" style="text-align:center;padding:2rem;color:var(--text-light);">No leaves requested yet.</td></tr>` : ''}
                        ${myLeavesList.map(l => `
                            <tr>
                                <td><strong>${l.type}</strong></td>
                                <td>${l.from} to ${l.to}</td>
                                <td><span class="tag-pill available">${l.days} Day(s)</span></td>
                                <td>${l.reason}</td>
                                <td>
                                    <span class="badge" style="background:${l.status==='approved'?'#d4edda':l.status==='rejected'?'#fde8e8':'#fff3cd'};color:${l.status==='approved'?'#155724':l.status==='rejected'?'#dc3545':'#856404'};">
                                        <i class="fas ${l.status==='approved'?'fa-check-circle':l.status==='rejected'?'fa-times-circle':'fa-hourglass-half'}"></i> ${(l.status||'pending').toUpperCase()}
                                    </span>
                                </td>
                                <td style="font-size:0.85rem;color:var(--text-secondary);">${l.comments?.join('; ') || 'Under review'}</td>
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
        earned: { allocated: 15, used: 5, remaining: 10, carry_forward: 10 },
        monthly: { available_this_month: 4, used_this_month: 1, remaining_this_month: 3, max_allowed_per_month: 3, carry_forward_calc: { previous_month_remaining: 2, current_month_allocation: 2, total_available: 4 } },
        earned_leave_rules: { allocated_yearly: 15, used: 5, remaining: 10, carry_forward_next_year: 10, max_accumulation_limit: 30 }
    };

    return `
        <div style="margin-bottom:1.5rem;">
            <h2>Leave Balances & Rollover Rules</h2>
            <div class="subhead">Itemized monthly calculations, carry forward formulas and annual Earned Leave rules</div>
        </div>

        <div class="detail-list" style="margin-bottom:1.5rem;">
            <h3 style="margin-top:0;margin-bottom:1rem;"><i class="fas fa-table" style="color:var(--primary);margin-right:8px;"></i> Category-Wise Allocation & Remaining Balance</h3>
            <div class="custom-table-responsive">
                <table class="styled-table">
                    <thead>
                        <tr>
                            <th>Leave Type</th>
                            <th>Total Allocated</th>
                            <th>Previous Carry Forward</th>
                            <th>Current Month Allocation</th>
                            <th>Used</th>
                            <th>Remaining Balance</th>
                            <th>Eligible Rollover</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><strong>Casual Leave (CL)</strong></td>
                            <td>4 Days</td>
                            <td>2 Days</td>
                            <td>2 Days</td>
                            <td><span style="color:var(--danger);">${b.casual?.used || 1} Day</span></td>
                            <td><strong style="color:var(--success);font-size:1.05rem;">${b.casual?.remaining || 3} Days</strong></td>
                            <td><span style="color:var(--success);"><i class="fas fa-check"></i> Monthly Carry-Forward</span></td>
                        </tr>
                        <tr>
                            <td><strong>Sick Leave (SL)</strong></td>
                            <td>3 Days</td>
                            <td>0 Days</td>
                            <td>3 Days</td>
                            <td><span style="color:var(--danger);">${b.sick?.used || 0} Days</span></td>
                            <td><strong style="color:var(--success);font-size:1.05rem;">${b.sick?.remaining || 3} Days</strong></td>
                            <td><span style="color:var(--text-light);"><i class="fas fa-minus"></i> Cumulative</span></td>
                        </tr>
                        <tr>
                            <td><strong>Earned Leave (EL)</strong></td>
                            <td>15 Days</td>
                            <td>0 Days</td>
                            <td>15 Days (Annual)</td>
                            <td><span style="color:var(--danger);">${b.earned?.used || 5} Days</span></td>
                            <td><strong style="color:var(--success);font-size:1.05rem;">${b.earned?.remaining || 10} Days</strong></td>
                            <td><span style="color:var(--primary);font-weight:700;"><i class="fas fa-check-double"></i> Yearly Rollover</span></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;margin-bottom:1.5rem;" class="responsive-two-col">
            
            <div class="stat-card" style="padding:1.4rem;">
                <h4 style="margin:0 0 0.8rem 0;color:var(--text-primary);"><i class="fas fa-calculator" style="color:var(--primary);"></i> Carry Forward Formula Breakdown</h4>
                <div class="carry-forward-formula-box">
                    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:0.5rem;font-size:0.95rem;">
                        <span>Previous Remaining: <strong>${b.monthly?.carry_forward_calc?.previous_month_remaining || 2}</strong></span>
                        <span>+</span>
                        <span>Current Allocation: <strong>${b.monthly?.carry_forward_calc?.current_month_allocation || 2}</strong></span>
                        <span>=</span>
                        <span style="color:var(--success);font-weight:800;font-size:1.15rem;">Total Available: ${b.monthly?.carry_forward_calc?.total_available || 4} Days</span>
                    </div>
                </div>
                <div style="font-size:0.8rem;color:var(--text-secondary);margin-top:0.6rem;">
                    * Unused eligible leaves from previous month automatically carry forward into current month balance.
                </div>
            </div>

            <div class="stat-card" style="padding:1.4rem;">
                <h4 style="margin:0 0 0.8rem 0;color:var(--text-primary);"><i class="fas fa-award" style="color:#6f42c1;"></i> Earned Leave (EL) Annual Rollover</h4>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.6rem;">
                    <div class="mini-calc-box"><div class="mini-label">Annual Allocation</div><div class="mini-value">${b.earned_leave_rules?.allocated_yearly || 15}d</div></div>
                    <div class="mini-calc-box"><div class="mini-label">Next Year Carry Forward</div><div class="mini-value" style="color:var(--primary);">${b.earned_leave_rules?.carry_forward_next_year || 10}d</div></div>
                </div>
                <div style="font-size:0.8rem;color:var(--text-secondary);margin-top:0.6rem;">
                    * Maximum accumulated limit is <strong>${b.earned_leave_rules?.max_accumulation_limit || 30} days</strong> as per company leave policy.
                </div>
            </div>

        </div>
    `;
}

// ============================================================
// ===== 5. PAYROLL & PAYSLIPS (WITH PDF GENERATION) =====
// ============================================================

function renderPayroll(userEmail, role, employees) {
    if (role === 'hr' || role === 'admin') {
        return renderHRPayrollDesk(employees);
    }
    return renderMyPayslipsSection(userEmail, role, employees);
}

function renderHRPayrollDesk(employees) {
    const totalPayroll = employees.reduce((sum, e) => sum + (Number(e.monthly_salary) || 0), 0) || 487000;
    const history = window._currentPayrollHistory && window._currentPayrollHistory.length > 0 
        ? window._currentPayrollHistory 
        : [
            { month: 'August', year: 2026, employees: employees.length, amount: totalPayroll, status: 'Processed' },
            { month: 'July', year: 2026, employees: employees.length, amount: totalPayroll, status: 'Processed' },
            { month: 'June', year: 2026, employees: employees.length, amount: totalPayroll, status: 'Processed' }
        ];

    return `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem;flex-wrap:wrap;gap:1rem;">
            <div>
                <h2>HR Corporate Payroll Desk</h2>
                <div class="subhead">Process monthly organization salaries, view registers & audit tax compliance</div>
            </div>
            <button class="btn-success" onclick="window.openRunPayrollModal()" style="display:flex;align-items:center;gap:0.5rem;padding:0.65rem 1.4rem;">
                <i class="fas fa-calculator"></i> Run Payroll (Month & Year)
            </button>
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-label">Total Active Employees</div>
                <div class="stat-value">${employees.length}</div>
                <span class="stat-change">100% Verified</span>
            </div>
            <div class="stat-card">
                <div class="stat-label">Processed Payroll</div>
                <div class="stat-value" style="color:var(--success);">${employees.length}</div>
                <span class="stat-change"><i class="fas fa-check"></i> August 2026</span>
            </div>
            <div class="stat-card">
                <div class="stat-label">Pending Payroll</div>
                <div class="stat-value" style="color:var(--primary);">0</div>
                <span class="stat-change">All cleared</span>
            </div>
            <div class="stat-card">
                <div class="stat-label">Total Monthly Payroll</div>
                <div class="stat-value" style="color:var(--primary);">₹${(totalPayroll/1000).toFixed(0)}K</div>
                <span class="stat-change">Direct Bank Transfer</span>
            </div>
        </div>

        <div class="detail-list" style="margin-top:1.5rem;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
                <h3 style="margin:0;"><i class="fas fa-history" style="color:var(--primary);margin-right:8px;"></i> Corporate Payroll History</h3>
                <span class="badge" style="background:var(--primary-light);color:var(--primary);">Audit Log</span>
            </div>

            <div class="custom-table-responsive">
                <table class="styled-table">
                    <thead>
                        <tr>
                            <th>Pay Period (Month & Year)</th>
                            <th>Number of Employees</th>
                            <th>Total Payroll (₹)</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${history.map(h => `
                            <tr>
                                <td><strong>${h.month} ${h.year}</strong></td>
                                <td>${h.employees} Employees</td>
                                <td><strong style="color:var(--success);">₹${h.amount.toLocaleString('en-IN')}</strong></td>
                                <td><span class="badge" style="background:#d4edda;color:#155724;"><i class="fas fa-check-circle"></i> ${h.status.toUpperCase()}</span></td>
                                <td>
                                    <button class="btn-primary btn-sm" onclick="window.viewPayrollSummary('${h.month}', '${h.year}')"><i class="fas fa-eye"></i> View Register</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>

        <div id="runPayrollModal" class="modal-backdrop" style="display:none;">
            <div style="background:var(--card-bg);border-radius:var(--radius);padding:1.8rem;max-width:480px;width:90%;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;border-bottom:1px solid var(--border);padding-bottom:0.6rem;">
                    <h3 style="margin:0;"><i class="fas fa-calculator" style="color:var(--primary);margin-right:8px;"></i> Run Corporate Payroll</h3>
                    <button class="modal-close-btn" onclick="document.getElementById('runPayrollModal').style.display='none'">&times;</button>
                </div>
                <form onsubmit="window.handleRunPayrollSubmit(event)">
                    <div class="input-group">
                        <label>Select Payroll Month *</label>
                        <select id="payrollRunMonth" required style="width:100%;padding:0.7rem 1rem;border:2px solid var(--border);border-radius:var(--radius-sm);background:var(--bg);">
                            <option value="September">September</option>
                            <option value="August" selected>August</option>
                            <option value="July">July</option>
                        </select>
                    </div>
                    <div class="input-group">
                        <label>Select Payroll Year *</label>
                        <select id="payrollRunYear" required style="width:100%;padding:0.7rem 1rem;border:2px solid var(--border);border-radius:var(--radius-sm);background:var(--bg);">
                            <option value="2026" selected>2026</option>
                            <option value="2025">2025</option>
                        </select>
                    </div>
                    <div style="background:#f8fafc;padding:0.8rem;border-radius:var(--radius-sm);font-size:0.85rem;margin-bottom:1.2rem;border:1px solid var(--border);">
                        Total Eligible Employees: <strong>${employees.length}</strong><br/>
                        Estimated Gross Disbursement: <strong>₹${totalPayroll.toLocaleString('en-IN')}</strong>
                    </div>
                    <div style="display:flex;gap:0.8rem;">
                        <button type="submit" class="btn-success" style="flex:1;"><i class="fas fa-check-double"></i> Process & Disburse</button>
                        <button type="button" class="btn-secondary-custom" onclick="document.getElementById('runPayrollModal').style.display='none'">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

function openRunPayrollModal() {
    document.getElementById('runPayrollModal').style.display = 'flex';
}

function handleRunPayrollSubmit(e) {
    e.preventDefault();
    const month = document.getElementById('payrollRunMonth').value;
    const year = document.getElementById('payrollRunYear').value;
    const employees = window._currentEmployees || [];
    const totalPayroll = employees.reduce((sum, emp) => sum + (Number(emp.monthly_salary) || 0), 0) || 487000;

    const hist = window._currentPayrollHistory || [];
    hist.unshift({ month, year, employees: employees.length, amount: totalPayroll, status: 'Processed' });
    window._currentPayrollHistory = hist;

    window.addNotification('Payroll Processed', `Company payroll for ${month} ${year} has been processed and payslips generated.`, 'success', 'fa-file-invoice-dollar');
    window.showToast('Success', `Payroll for ${month} ${year} processed successfully!`, 'success');
    document.getElementById('runPayrollModal').style.display = 'none';
    refreshCurrentSection();
}

function viewPayrollSummary(month, year) {
    window.showToast('Info', `Displaying verified salary register for ${month} ${year}.`, 'info');
}

function renderMyPayslipsSection(userEmail, role, employees) {
    const isHR = role === 'hr' || role === 'admin';
    const currentEmp = employees.find(e => e.email && e.email.toLowerCase() === userEmail.toLowerCase()) || currentUser?.empData || employees[0];
    
    // Dynamically build payslips list from real employees and their salaries
    const activeStaff = isHR ? employees : (currentEmp ? [currentEmp] : []);
    const months = ['August', 'July', 'June'];
    const allPayslips = [];

    months.forEach((m, idx) => {
        activeStaff.forEach(emp => {
            const gross = Number(emp.monthly_salary) || 75000;
            const basic = Math.round(gross * 0.5);
            const hra = Math.round(gross * 0.25);
            const special = gross - basic - hra;
            const pf = 1800;
            const pt = 200;
            const totalDeductions = pf + pt;
            const net = gross - totalDeductions;
            allPayslips.push({
                id: `PS-2026-${String(8 - idx).padStart(2, '0')}-${emp.id || 1}`,
                month: m,
                year: 2026,
                pay_period: `01 ${m} 2026 - 31 ${m} 2026`,
                employee_id: emp.id,
                employee_name: emp.name,
                gross_earnings: gross,
                basic_salary: basic,
                hra: hra,
                special_allowance: special,
                pf: pf,
                professional_tax: pt,
                total_deductions: totalDeductions,
                net_salary: net,
                status: 'paid',
                bank_name: emp.bank_details?.bank_name || 'HDFC Bank',
                bank_account: emp.bank_details?.account_number || 'XXXXXXXX4892'
            });
        });
    });

    let displayed = allPayslips;
    if (payslipFilterMonth) displayed = displayed.filter(p => p.month.toLowerCase() === payslipFilterMonth.toLowerCase());
    if (payslipFilterYear) displayed = displayed.filter(p => String(p.year) === String(payslipFilterYear));

    const latest = displayed[0] || allPayslips[0];

    return `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem;flex-wrap:wrap;gap:1rem;">
            <div>
                <h2>My Payslips & Salary Certificates</h2>
                <div class="subhead">Detailed monthly salary statements with comprehensive allowance and deduction criteria</div>
            </div>
            ${latest ? `
                <button class="btn-success" onclick="window.downloadPayslipPDF('${latest.id}')" style="display:flex;align-items:center;gap:0.5rem;padding:0.65rem 1.4rem;">
                    <i class="fas fa-file-pdf"></i> Download PDF (${latest.month} ${latest.year})
                </button>
            ` : ''}
        </div>

        <div class="detail-list" style="margin-bottom:1.5rem;padding:1rem 1.4rem;">
            <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem;">
                <div style="display:flex;align-items:center;gap:0.8rem;flex-wrap:wrap;">
                    <label style="font-weight:600;color:var(--text-primary);"><i class="fas fa-filter" style="color:var(--primary);"></i> Select Pay Period:</label>
                    <select id="filterMonthSelect" onchange="window.handlePayslipFilterChange()" style="padding:0.5rem 1rem;border:2px solid var(--border);border-radius:var(--radius-sm);background:var(--bg);font-weight:600;">
                        <option value="August" ${payslipFilterMonth === 'August' ? 'selected' : ''}>August</option>
                        <option value="July" ${payslipFilterMonth === 'July' ? 'selected' : ''}>July</option>
                        <option value="June" ${payslipFilterMonth === 'June' ? 'selected' : ''}>June</option>
                    </select>

                    <select id="filterYearSelect" onchange="window.handlePayslipFilterChange()" style="padding:0.5rem 1rem;border:2px solid var(--border);border-radius:var(--radius-sm);background:var(--bg);font-weight:600;">
                        <option value="2026" ${payslipFilterYear === '2026' ? 'selected' : ''}>2026</option>
                        <option value="2025" ${payslipFilterYear === '2025' ? 'selected' : ''}>2025</option>
                    </select>
                </div>
                <div style="font-size:0.85rem;color:var(--text-secondary);">
                    Found <strong>${displayed.length}</strong> payslip record(s)
                </div>
            </div>
        </div>

        <div class="detail-list">
            <div class="custom-table-responsive">
                <table class="styled-table">
                    <thead>
                        <tr>
                            <th>Pay Period</th>
                            <th>Gross Earnings</th>
                            <th>Deductions</th>
                            <th>Net Payable Salary</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${displayed.length === 0 ? `<tr><td colspan="6" style="text-align:center;padding:2rem;color:var(--text-light);">No payslips found for selected period.</td></tr>` : ''}
                        ${displayed.map(ps => `
                            <tr>
                                <td><strong>${ps.month} ${ps.year}</strong><div style="font-size:0.75rem;color:var(--text-light);">${ps.pay_period}</div></td>
                                <td>₹${ps.gross_earnings.toLocaleString('en-IN')}</td>
                                <td style="color:var(--danger);">₹${ps.total_deductions.toLocaleString('en-IN')}</td>
                                <td><strong style="color:var(--success);font-size:1.05rem;">₹${ps.net_salary.toLocaleString('en-IN')}</strong></td>
                                <td><span class="badge" style="background:#d4edda;color:#155724;"><i class="fas fa-check-circle"></i> ${(ps.status||'PAID').toUpperCase()}</span></td>
                                <td>
                                    <div style="display:flex;gap:0.4rem;">
                                        <button class="btn-primary btn-sm" onclick="window.viewPayslipModal('${ps.id}')"><i class="fas fa-eye"></i> View</button>
                                        <button class="btn-success btn-sm" onclick="window.downloadPayslipPDF('${ps.id}')"><i class="fas fa-file-pdf"></i> Download PDF</button>
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
                    <h3 style="margin:0;"><i class="fas fa-receipt" style="color:var(--primary);margin-right:8px;"></i> Official Employee Payslip</h3>
                    <div style="display:flex;gap:0.5rem;align-items:center;">
                        <button class="btn-success btn-sm" id="modalDownloadPdfBtn"><i class="fas fa-file-pdf"></i> Download PDF</button>
                        <button class="modal-close-btn" onclick="window.closePayslipModal()">&times;</button>
                    </div>
                </div>
                <div id="printablePayslipDocument"></div>
            </div>
        </div>
    `;
}

function buildPayslipHTML(payslipId) {
    const employees = window._currentEmployees || [];
    let emp = employees.find(e => `PS-2026-08-${e.id}` === payslipId || `PS-2026-07-${e.id}` === payslipId || `PS-2026-06-${e.id}` === payslipId || String(e.id) === String(payslipId)) || currentUser?.empData || employees[0] || { name: 'Employee', email: 'employee@company.com', id: 1, department: 'IT', designation: 'Employee', monthly_salary: 75000 };

    const gross = Number(emp.monthly_salary) || 75000;
    const basic = Math.round(gross * 0.5);
    const hra = Math.round(gross * 0.25);
    const special = gross - basic - hra;
    const pf = 1800;
    const pt = 200;
    const totalDeductions = pf + pt;
    const net = gross - totalDeductions;
    const month = payslipFilterMonth || 'August';
    const year = payslipFilterYear || '2026';

    const ps = {
        id: payslipId,
        month,
        year,
        employee_id: emp.id,
        employee_name: emp.name,
        bank_name: emp.bank_details?.bank_name || 'HDFC Bank',
        bank_account: emp.bank_details?.account_number || 'XXXXXXXX4892',
        gross_earnings: gross,
        total_deductions: totalDeductions,
        net_salary: net,
        allowances: [
            { name: 'Basic Salary', amount: basic, criteria: '50% of Total CTC' },
            { name: 'House Rent Allowance (HRA)', amount: hra, criteria: '50% of Basic as per Metro HRA Rules' },
            { name: 'Special Allowance', amount: special, criteria: 'Flexible benefit taxable component' }
        ],
        deductions: [
            { name: 'Provident Fund (PF)', amount: pf, criteria: 'Employee contribution under EPFO rules' },
            { name: 'Professional Tax (PT)', amount: pt, criteria: 'State statutory professional tax rate' }
        ]
    };

    return `
        <div class="payslip-paper">
            <div class="payslip-header-grid">
                <div>
                    <div style="font-size:1.4rem;font-weight:800;color:#0b2b4a;display:flex;align-items:center;gap:0.5rem;">
                        <i class="fas fa-building" style="color:#1a6dff;"></i> HR Connect Technologies Ltd.
                    </div>
                    <div style="font-size:0.78rem;color:#5e6f8d;margin-top:0.2rem;">
                        Cyber City, Hyderabad, TG, 500081 · CIN: U72200TG2020PTC148920
                    </div>
                </div>
                <div style="text-align:right;">
                    <div style="font-size:1.2rem;font-weight:800;color:#0b2b4a;">SALARY PAYSLIP</div>
                    <div style="font-size:0.9rem;font-weight:700;color:#1a6dff;">${ps.month.toUpperCase()} ${ps.year}</div>
                </div>
            </div>

            <div class="payslip-emp-details-grid">
                <div>
                    <table class="payslip-meta-table">
                        <tr><td><strong>Employee Name:</strong></td><td>${emp.name}</td></tr>
                        <tr><td><strong>Employee ID:</strong></td><td>#EMP-00${emp.id}</td></tr>
                        <tr><td><strong>Designation:</strong></td><td>${emp.designation}</td></tr>
                        <tr><td><strong>Department:</strong></td><td>${emp.department}</td></tr>
                    </table>
                </div>
                <div>
                    <table class="payslip-meta-table">
                        <tr><td><strong>Permanent Email:</strong></td><td>${emp.email}</td></tr>
                        <tr><td><strong>PAN Number:</strong></td><td><strong>${emp.pan || 'ABCDE1234F'}</strong></td></tr>
                        <tr><td><strong>Aadhaar Number:</strong></td><td>${emp.aadhaar || '7482 9104 3829'}</td></tr>
                        <tr><td><strong>Bank Account:</strong></td><td>${ps.bank_name} (${ps.bank_account})</td></tr>
                    </table>
                </div>
            </div>

            <div class="payslip-tables-split">
                <div class="payslip-component-card">
                    <div class="payslip-component-header" style="background:#e8f0fe;color:#0f5ae0;">
                        <span><i class="fas fa-plus-circle"></i> ALLOWANCES & EARNINGS</span>
                        <span>AMOUNT (₹)</span>
                    </div>
                    <table class="payslip-inner-table">
                        <thead>
                            <tr>
                                <th>Component</th>
                                <th style="text-align:right;">Amount (₹)</th>
                                <th>Criteria / Explanation</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${ps.allowances.map(a => `
                                <tr>
                                    <td><strong>${a.name}</strong></td>
                                    <td style="text-align:right;font-weight:600;">₹${a.amount.toLocaleString('en-IN')}</td>
                                    <td class="criteria-cell">${a.criteria}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                        <tfoot>
                            <tr class="tfoot-row">
                                <td><strong>Gross Earnings</strong></td>
                                <td style="text-align:right;font-weight:800;color:#1a6dff;">₹${ps.gross_earnings.toLocaleString('en-IN')}</td>
                                <td style="font-size:0.72rem;color:#5e6f8d;">Total gross taxable pay</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                <div class="payslip-component-card">
                    <div class="payslip-component-header" style="background:#fde8e8;color:#dc3545;">
                        <span><i class="fas fa-minus-circle"></i> STATUTORY DEDUCTIONS</span>
                        <span>AMOUNT (₹)</span>
                    </div>
                    <table class="payslip-inner-table">
                        <thead>
                            <tr>
                                <th>Component</th>
                                <th style="text-align:right;">Amount (₹)</th>
                                <th>Criteria / Explanation</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${ps.deductions.map(d => `
                                <tr>
                                    <td><strong>${d.name}</strong></td>
                                    <td style="text-align:right;font-weight:600;color:#dc3545;">₹${d.amount.toLocaleString('en-IN')}</td>
                                    <td class="criteria-cell">${d.criteria}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                        <tfoot>
                            <tr class="tfoot-row">
                                <td><strong>Total Deductions</strong></td>
                                <td style="text-align:right;font-weight:800;color:#dc3545;">₹${ps.total_deductions.toLocaleString('en-IN')}</td>
                                <td style="font-size:0.72rem;color:#5e6f8d;">Statutory compliance deductions</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            <div class="payslip-net-summary-box">
                <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem;">
                    <div>
                        <div style="font-size:0.8rem;text-transform:uppercase;color:#5e6f8d;font-weight:700;">Net Payable Take-Home Salary</div>
                        <div style="font-size:0.85rem;color:#0b2b4a;margin-top:0.2rem;"><strong>Amount in words:</strong> ${ps.net_salary_words}</div>
                    </div>
                    <div style="font-size:1.8rem;font-weight:800;color:#22a65e;">
                        ₹${ps.net_salary.toLocaleString('en-IN')}
                    </div>
                </div>
            </div>

            <div class="payslip-policy-notes">
                <i class="fas fa-info-circle" style="color:#1a6dff;"></i> Computer-generated document certified under IT Act & EPF Act 1952. Requires no physical signature.
            </div>
        </div>
    `;
}

function viewPayslipModal(payslipId) {
    const container = document.getElementById('payslipModalContainer');
    const docContainer = document.getElementById('printablePayslipDocument');
    const downloadBtn = document.getElementById('modalDownloadPdfBtn');
    if (container && docContainer) {
        docContainer.innerHTML = buildPayslipHTML(payslipId);
        container.style.display = 'flex';
        if (downloadBtn) downloadBtn.onclick = () => window.downloadPayslipPDF(payslipId);
    }
}

function closePayslipModal() {
    const container = document.getElementById('payslipModalContainer');
    if (container) container.style.display = 'none';
}

async function downloadPayslipPDF(payslipId) {
    const employees = window._currentEmployees || [];
    const emp = employees.find(e => `PS-2026-08-${e.id}` === payslipId || `PS-2026-07-${e.id}` === payslipId || `PS-2026-06-${e.id}` === payslipId || String(e.id) === String(payslipId)) || currentUser?.empData || { name: 'Employee' };
    const month = payslipFilterMonth || 'August';
    const year = payslipFilterYear || '2026';
    const fileName = `Payslip_${(emp.name || 'Employee').replace(/\s+/g, '_')}_${month}_${year}.pdf`;

    window.showToast('Info', `Generating PDF for ${month} ${year}...`, 'info');

    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.width = '800px';
    tempDiv.style.background = '#ffffff';
    tempDiv.innerHTML = buildPayslipHTML(payslipId);
    document.body.appendChild(tempDiv);

    const opt = {
        margin: [8, 8, 8, 8],
        filename: fileName,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    try {
        if (window.html2pdf) {
            await html2pdf().set(opt).from(tempDiv).save();
            window.showToast('Success', `Payslip downloaded: ${fileName}`, 'success');
        } else {
            window.print();
        }
    } catch (e) {
        console.error('PDF error:', e);
        window.showToast('Error', 'PDF download failed, opening print dialog.', 'warning');
        window.print();
    } finally {
        document.body.removeChild(tempDiv);
    }
}

function handlePayslipFilterChange() {
    payslipFilterMonth = document.getElementById('filterMonthSelect')?.value || 'August';
    payslipFilterYear = document.getElementById('filterYearSelect')?.value || '2026';
    refreshCurrentSection();
}

// ============================================================
// ===== 6. TWO-WAY MESSAGING (REAL-TIME CHAT) =====
// ============================================================

function renderMessages(userEmail, role) {
    const isHR = role === 'hr' || role === 'admin';
    const stored = localStorage.getItem('hr_messages');
    let allMessages = [];
    if (stored) {
        try { allMessages = JSON.parse(stored); } catch (e) { allMessages = []; }
    } else {
        allMessages = [];
    }

    const employees = window._currentEmployees || [];
    const regularEmployees = employees.filter(e => e.role === 'employee');

    // In HR view, sort employees by most recent message
    if (isHR && regularEmployees.length > 0) {
        if (!activeChatRecipient) {
            const sorted = [...regularEmployees].sort((a, b) => {
                const aMsgs = allMessages.filter(m => m.fromEmail === a.email || m.toEmail === a.email);
                const bMsgs = allMessages.filter(m => m.fromEmail === b.email || m.toEmail === b.email);
                const aTime = aMsgs.length > 0 ? aMsgs[aMsgs.length - 1].timestamp : 0;
                const bTime = bMsgs.length > 0 ? bMsgs[bMsgs.length - 1].timestamp : 0;
                return bTime - aTime;
            });
            activeChatRecipient = sorted[0]?.email || regularEmployees[0].email;
        }
    }

    let activeRecipientEmail = isHR ? activeChatRecipient : 'hr.hr@gmail.com';
    let activeRecipientName = isHR 
        ? (employees.find(e => e.email === activeRecipientEmail)?.name || 'Employee')
        : 'Sarah Williams (HR)';
    let activeRecipientPhoto = isHR
        ? (employees.find(e => e.email === activeRecipientEmail)?.photo || DEFAULT_AVATARS.male)
        : DEFAULT_AVATARS.hr;

    const currentThread = isHR 
        ? allMessages.filter(m => (m.fromEmail?.toLowerCase() === activeRecipientEmail?.toLowerCase()) || (m.toEmail?.toLowerCase() === activeRecipientEmail?.toLowerCase()))
        : allMessages.filter(m => (m.fromEmail?.toLowerCase() === userEmail?.toLowerCase()) || (m.toEmail?.toLowerCase() === userEmail?.toLowerCase()));

    return `
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem;margin-bottom:1rem;">
            <div>
                <h2>${isHR ? 'HR Communications & Employee Support Desk' : 'Direct Messaging with HR Support'}</h2>
                <div class="subhead">${isHR ? 'Two-way official communication stream with employees' : 'Send inquiries, placement queries, leave questions or salary doubts directly to HR'}</div>
            </div>
            <span class="badge" style="background:#e8f0fe;color:var(--primary);padding:0.4rem 1rem;font-weight:600;">
                <i class="fas fa-circle" style="color:#22a65e;font-size:0.6rem;"></i> Connected · Official HR Desk
            </span>
        </div>

        <div class="chat-system-layout ${!isHR ? 'employee-chat-layout' : ''}">
            ${isHR ? `
                <div class="chat-threads-sidebar">
                    <div class="chat-threads-header">
                        <strong><i class="fas fa-comments" style="color:var(--primary);"></i> Employee Threads (${regularEmployees.length})</strong>
                    </div>
                    <div class="chat-threads-list">
                        ${regularEmployees.map(emp => {
                            const empMsgs = allMessages.filter(m => m.fromEmail?.toLowerCase() === emp.email?.toLowerCase() || m.toEmail?.toLowerCase() === emp.email?.toLowerCase());
                            const lastMsg = empMsgs[empMsgs.length - 1];
                            const isActive = emp.email?.toLowerCase() === activeRecipientEmail?.toLowerCase();
                            const lastTime = lastMsg ? new Date(lastMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
                            return `
                                <div class="chat-thread-item ${isActive ? 'active' : ''}" onclick="window.selectChatRecipient('${emp.email}')">
                                    <img src="${emp.photo || DEFAULT_AVATARS.male}" class="chat-thread-avatar" alt="${emp.name}"/>
                                    <div style="flex:1;min-width:0;">
                                        <div style="display:flex;justify-content:space-between;align-items:center;">
                                            <strong style="font-size:0.9rem;color:var(--text-primary);">${emp.name}</strong>
                                            <span style="font-size:0.7rem;color:var(--text-light);">${lastTime}</span>
                                        </div>
                                        <div style="font-size:0.75rem;color:var(--text-secondary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-top:0.15rem;">
                                            ${lastMsg ? (lastMsg.fromEmail === 'hr.hr@gmail.com' ? `You: ${lastMsg.text}` : lastMsg.text) : 'No messages yet...'}
                                        </div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            ` : ''}

            <div class="chat-main-window">
                <div class="chat-header-bar" style="background:#f8fafc;">
                    <div style="display:flex;align-items:center;gap:0.8rem;">
                        <img src="${activeRecipientPhoto}" style="width:40px;height:40px;border-radius:50%;object-fit:cover;border:1px solid #d1d7db;" alt="${activeRecipientName}"/>
                        <div>
                            <div style="font-weight:700;color:var(--text-primary);font-size:0.98rem;">${activeRecipientName}</div>
                            <div style="font-size:0.75rem;color:#22a65e;display:flex;align-items:center;gap:4px;">
                                <span style="width:7px;height:7px;border-radius:50%;background:#22a65e;display:inline-block;"></span> Active & Connected
                            </div>
                        </div>
                    </div>
                    <div style="display:flex;align-items:center;gap:1rem;color:var(--text-secondary);font-size:1.1rem;">
                        <span class="badge" style="background:#f1f5f9;color:var(--text-secondary);font-size:0.78rem;">
                            <i class="fas fa-shield-alt" style="color:var(--primary);"></i> Verified HR Channel
                        </span>
                    </div>
                </div>

                <div class="chat-messages-stream" id="chatMessagesStream">
                    <div style="text-align:center;margin:0.5rem 0;">
                        <span style="background:#ffffff;padding:0.25rem 0.8rem;border-radius:6px;font-size:0.72rem;color:var(--text-secondary);box-shadow:0 1px 1px rgba(0,0,0,0.08);font-weight:600;text-transform:uppercase;">
                            Conversation Thread
                        </span>
                    </div>

                    ${currentThread.length === 0 ? `
                        <div style="text-align:center;color:var(--text-secondary);padding:4rem 2rem;">
                            <div style="width:60px;height:60px;border-radius:50%;background:#ffffff;display:inline-flex;align-items:center;justify-content:center;margin-bottom:0.8rem;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
                                <i class="fas fa-comment-dots" style="font-size:2rem;color:var(--primary);"></i>
                            </div>
                            <h4 style="margin:0 0 0.4rem 0;color:var(--text-primary);">No messages yet</h4>
                            <p style="margin:0;font-size:0.85rem;">Type your message below or pick a suggestion chip to message ${activeRecipientName}.</p>
                        </div>
                    ` : currentThread.map(msg => {
                        const isMe = msg.fromEmail?.toLowerCase() === userEmail?.toLowerCase() || (isHR && msg.senderRole === 'hr') || (!isHR && msg.senderRole === 'employee' && msg.fromEmail?.toLowerCase() === userEmail?.toLowerCase());
                        const timeStr = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        return `
                            <div class="chat-bubble-row ${isMe ? 'me' : 'other'}">
                                <div class="chat-bubble ${isMe ? 'bubble-me' : 'bubble-other'}">
                                    ${!isMe && isHR ? `<div class="chat-bubble-sender">${msg.fromName}</div>` : ''}
                                    <div class="chat-bubble-text">${msg.text}</div>
                                    <div class="chat-bubble-time">
                                        <span>${timeStr}</span>
                                        ${isMe ? `<i class="fas fa-check-double"></i>` : ''}
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>

                ${!isHR ? `
                    <div class="chat-quick-chips">
                        <span class="chip-label"><i class="fas fa-lightbulb" style="color:#f0ad4e;"></i> Suggested:</span>
                        <button type="button" class="quick-chip" onclick="window.selectSuggestedChip('Hello')">Hello</button>
                        <button type="button" class="quick-chip" onclick="window.selectSuggestedChip('About placement')">About placement</button>
                        <button type="button" class="quick-chip" onclick="window.selectSuggestedChip('Leave status')">Leave status</button>
                        <button type="button" class="quick-chip" onclick="window.selectSuggestedChip('Salary details')">Salary details</button>
                    </div>
                ` : ''}

                <div class="chat-input-area">
                    <input type="text" id="chatInputBox" placeholder="Type a message to ${activeRecipientName}..." 
                           style="flex:1;padding:0.75rem 1.1rem;border:1px solid #d1d7db;border-radius:20px;outline:none;background:#ffffff;font-size:0.9rem;"
                           onkeydown="if(event.key==='Enter') window.handleSendChatMessage()"/>
                    <button class="btn-primary" onclick="window.handleSendChatMessage()" style="border-radius:50%;width:42px;height:42px;padding:0;display:flex;align-items:center;justify-content:center;background:var(--primary);border:none;flex-shrink:0;">
                        <i class="fas fa-paper-plane" style="color:white;font-size:1rem;margin-left:-2px;"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

function selectChatRecipient(email) {
    activeChatRecipient = email;
    refreshCurrentSection();
    scrollChatToBottom();
}

function selectSuggestedChip(text) {
    const input = document.getElementById('chatInputBox');
    if (input) {
        input.value = text;
        input.focus();
    }
}

window.selectSuggestedChip = selectSuggestedChip;

function handleSendChatMessage() {
    const input = document.getElementById('chatInputBox');
    const text = input ? input.value.trim() : '';
    if (!text) return;

    const userEmail = currentUser?.email || 'alex.employee@gmail.com';
    const role = window.getRole(userEmail);
    const isHR = role === 'hr' || role === 'admin';
    const employees = window._currentEmployees || [];
    const userEmp = employees.find(e => e.email?.toLowerCase() === userEmail?.toLowerCase());
    const fromName = userEmp ? userEmp.name : (isHR ? 'Sarah Williams (HR)' : (currentUser?.name || 'Employee'));

    const toEmail = isHR ? activeChatRecipient : 'hr.hr@gmail.com';
    const toName = isHR ? (employees.find(e => e.email?.toLowerCase() === activeChatRecipient?.toLowerCase())?.name || 'Employee') : 'Sarah Williams (HR)';

    let currentStoredMsgs = [];
    try {
        const raw = localStorage.getItem('hr_messages');
        currentStoredMsgs = raw ? JSON.parse(raw) : [];
    } catch (e) {
        currentStoredMsgs = [];
    }

    const newMsg = {
        id: Date.now(),
        fromEmail: userEmail,
        fromName: fromName,
        toEmail: toEmail,
        toName: toName,
        senderRole: role,
        text: text,
        timestamp: Date.now(),
        read: false
    };

    currentStoredMsgs.push(newMsg);
    window.saveMessagesData(currentStoredMsgs);
    input.value = '';
    
    refreshCurrentSection();
    scrollChatToBottom();

    if (!isHR) {
        window.showToast('Message Sent', 'Your message has been sent to HR Support.', 'success');
    } else {
        window.showToast('Reply Sent', `Your message was sent to ${toName}.`, 'success');
    }
}

function scrollChatToBottom() {
    setTimeout(() => {
        const stream = document.getElementById('chatMessagesStream');
        if (stream) stream.scrollTop = stream.scrollHeight;
    }, 50);
}

// ============================================================
// ===== 7. NOTIFICATIONS, REPORTS & SETTINGS =====
// ============================================================

function renderNotificationsSection() {
    const notifs = window._currentNotifications || [];
    return `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem;flex-wrap:wrap;gap:1rem;">
            <div>
                <h2>System Notifications & Alerts</h2>
                <div class="subhead">Official announcements, leave statuses, payroll alerts & messages</div>
            </div>
            <button class="btn-secondary-custom btn-sm" onclick="window.markAllNotificationsRead()"><i class="fas fa-check-double"></i> Mark All as Read</button>
        </div>

        <div class="detail-list">
            <ul style="list-style:none;">
                ${notifs.length === 0 ? `<li style="text-align:center;padding:2rem;color:var(--text-light);">No notifications at this time.</li>` : ''}
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

function markAllNotificationsRead() {
    const notifs = window._currentNotifications || [];
    notifs.forEach(n => n.read = true);
    window.saveNotificationsData(notifs);
    window.showToast('Success', 'All notifications marked as read.', 'success');
    refreshCurrentSection();
}

function renderReports() {
    const employees = window._currentEmployees || [];
    const totalEmps = employees.length;
    const totalPayroll = employees.reduce((sum, e) => sum + (Number(e.monthly_salary) || 0), 0) || 487000;

    return `
        <h2>Reports & Analytics</h2>
        <div class="subhead">Executive summaries, workforce demographics, and compensation metrics</div>
        
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-label">Total Workforce</div>
                <div class="stat-value">${totalEmps}</div>
                <span class="stat-change"><i class="fas fa-arrow-up"></i> +12% YoY</span>
            </div>
            <div class="stat-card">
                <div class="stat-label">Leave Utilization</div>
                <div class="stat-value">18.4%</div>
                <span class="stat-change">Optimal Range</span>
            </div>
            <div class="stat-card">
                <div class="stat-label">Monthly Payroll</div>
                <div class="stat-value">₹${Math.round(totalPayroll / 1000)}K</div>
                <span class="stat-change"><i class="fas fa-arrow-up"></i> Standard</span>
            </div>
            <div class="stat-card">
                <div class="stat-label">Attendance Compliance</div>
                <div class="stat-value">92.4%</div>
                <span class="stat-change"><i class="fas fa-arrow-up"></i> +3%</span>
            </div>
        </div>

        <div class="chart-grid">
            <div class="chart-box">
                <h4><i class="fas fa-chart-line" style="color:var(--primary);"></i> Employee Growth Trend</h4>
                <canvas id="lineChart"></canvas>
            </div>
            <div class="chart-box">
                <h4><i class="fas fa-chart-bar" style="color:var(--primary);"></i> Monthly Payroll Trend</h4>
                <canvas id="payrollChart"></canvas>
            </div>
        </div>
    `;
}

function renderSettings(userEmail, role) {
    const isAdmin = role === 'admin';
    return `
        <h2>System Settings & Preferences</h2>
        <div class="subhead">Manage account security, notifications, and organization policies</div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;margin-top:1.5rem;" class="responsive-two-col">
            <div class="detail-list">
                <h3 style="margin-top:0;"><i class="fas fa-key" style="color:var(--primary);margin-right:8px;"></i> Change Password</h3>
                <form onsubmit="event.preventDefault(); window.showToast('Success', 'Password updated successfully!', 'success');">
                    <div class="input-group">
                        <label>Current Password</label>
                        <input type="password" required placeholder="••••••••">
                    </div>
                    <div class="input-group">
                        <label>New Password</label>
                        <input type="password" required placeholder="New password">
                    </div>
                    <div class="input-group">
                        <label>Confirm New Password</label>
                        <input type="password" required placeholder="Confirm new password">
                    </div>
                    <button type="submit" class="btn-primary"><i class="fas fa-save"></i> Update Password</button>
                </form>
            </div>

            <div class="detail-list">
                <h3 style="margin-top:0;"><i class="fas fa-bell" style="color:var(--primary);margin-right:8px;"></i> Notification Preferences</h3>
                <div style="display:flex;flex-direction:column;gap:1rem;">
                    <label style="display:flex;align-items:center;gap:0.8rem;cursor:pointer;">
                        <input type="checkbox" checked style="width:18px;height:18px;">
                        <span>Email alert when monthly payslip is generated</span>
                    </label>
                    <label style="display:flex;align-items:center;gap:0.8rem;cursor:pointer;">
                        <input type="checkbox" checked style="width:18px;height:18px;">
                        <span>Notification when leave application is approved/rejected</span>
                    </label>
                    <label style="display:flex;align-items:center;gap:0.8rem;cursor:pointer;">
                        <input type="checkbox" checked style="width:18px;height:18px;">
                        <span>Instant notification for new HR messages</span>
                    </label>
                </div>

                ${isAdmin ? `
                    <div style="margin-top:1.5rem;border-top:1px solid var(--border);padding-top:1rem;">
                        <h4 style="margin:0 0 0.5rem 0;color:var(--primary);"><i class="fas fa-sliders-h"></i> Admin Leave Policies</h4>
                        <div style="font-size:0.85rem;color:var(--text-secondary);">
                            EL Yearly Rollover: <strong>Active (Max 30 Days)</strong><br/>
                            CL Monthly Carry Forward: <strong>Active</strong>
                        </div>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

// ============================================================
// ===== 8. EMPLOYEE PROFILE =====
// ============================================================

function renderProfile(userEmail, role) {
    const employees = window._currentEmployees || [];
    const emp = employees.find(e => e.email && e.email.toLowerCase() === userEmail.toLowerCase()) || currentUser?.empData || { name: getNameFromEmail(userEmail), email: userEmail, id: 1, department: 'IT', designation: 'Employee', phone: '+91 9876543210' };

    return `
        <div class="profile-header-title">
            <div>
                <h2>Employee Profile</h2>
                <div class="subhead">Manage official identification, contact details, statutory documents & compensation</div>
            </div>
            <span class="badge" style="background:#d4edda;color:#155724;font-size:0.85rem;padding:0.4rem 1rem;">
                <i class="fas fa-check-circle"></i> Profile Verified
            </span>
        </div>

        <div class="alert-box-info" style="margin-bottom:1.5rem;">
            <i class="fas fa-camera" style="font-size:1.3rem;"></i>
            <div>
                <strong>Mandatory Profile Photo:</strong> Every employee is required to maintain an official profile image for identity verification and security badging.
            </div>
        </div>

        <form id="profileForm" onsubmit="window.saveProfileData(event)">
            <div class="profile-layout-grid">
                
                <div class="profile-card-left">
                    <div style="text-align:center;">
                        <div class="profile-photo-wrapper">
                            <img src="${emp.photo || DEFAULT_AVATARS.alex}" id="profileImagePreview" alt="${emp.name}" class="profile-avatar-large"/>
                            <div class="photo-upload-overlay" onclick="document.getElementById('profilePhotoInput').click()">
                                <i class="fas fa-camera"></i> Change
                            </div>
                        </div>
                        <input type="file" id="profilePhotoInput" accept="image/*" style="display:none;" onchange="window.handleProfilePhotoUpload(event)"/>
                        
                        <div style="margin-top:1rem;">
                            <h3 style="margin:0;color:var(--text-primary);font-size:1.2rem;">${emp.name}</h3>
                            <div style="color:var(--text-secondary);font-size:0.85rem;margin-top:0.2rem;">${emp.designation} · ${emp.department}</div>
                            <span class="emp-status present" style="margin-top:0.4rem;">OFFICIAL EMPLOYEE</span>
                        </div>

                        <div style="margin-top:1rem;background:#f8fafc;padding:0.6rem;border-radius:var(--radius-sm);border:1px solid var(--border);">
                            <div style="font-size:0.75rem;color:var(--text-secondary);text-transform:uppercase;font-weight:600;">Annual Compensation</div>
                            <div style="font-size:1.15rem;font-weight:800;color:var(--success);margin-top:0.2rem;">
                                ${emp.annual_ctc || '9.00 LPA'}
                            </div>
                        </div>

                        <div style="margin-top:1.2rem;border-top:1px solid var(--border);padding-top:1rem;">
                            <button type="button" class="btn-primary btn-sm" onclick="document.getElementById('profilePhotoInput').click()" style="width:100%;">
                                <i class="fas fa-upload"></i> Upload Image (Mandatory)
                            </button>
                            <div style="font-size:0.75rem;color:var(--text-light);margin-top:0.6rem;text-align:center;">
                                Or pick a sample identification photo:
                            </div>
                            <div style="display:flex;gap:0.4rem;justify-content:center;margin-top:0.4rem;">
                                <img src="${DEFAULT_AVATARS.alex}" class="sample-avatar-thumb" title="Sample 1" onclick="window.selectSampleAvatar('${DEFAULT_AVATARS.alex}')"/>
                                <img src="${DEFAULT_AVATARS.female}" class="sample-avatar-thumb" title="Sample 2" onclick="window.selectSampleAvatar('${DEFAULT_AVATARS.female}')"/>
                                <img src="${DEFAULT_AVATARS.male}" class="sample-avatar-thumb" title="Sample 3" onclick="window.selectSampleAvatar('${DEFAULT_AVATARS.male}')"/>
                                <img src="${DEFAULT_AVATARS.hr}" class="sample-avatar-thumb" title="Sample 4" onclick="window.selectSampleAvatar('${DEFAULT_AVATARS.hr}')"/>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="profile-card-right">
                    
                    <div style="margin-bottom:1.5rem;">
                        <h3 style="color:var(--text-primary);margin-bottom:1rem;font-size:1.1rem;border-bottom:2px solid var(--primary-light);padding-bottom:0.5rem;">
                            <i class="fas fa-user" style="color:var(--primary);"></i> Personal Information
                        </h3>
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
                            <div class="input-group" style="margin:0;">
                                <label>Full Name *</label>
                                <input type="text" id="profFullName" value="${emp.name}" required oninput="window.validateNameInput(this)">
                                <div id="profFullNameError" class="field-error-msg"></div>
                            </div>

                            <div class="input-group" style="margin:0;">
                                <label style="display:flex;justify-content:space-between;">
                                    <span>Permanent Email ID *</span>
                                    <span style="font-size:0.75rem;color:var(--danger);font-weight:600;"><i class="fas fa-lock"></i> Locked</span>
                                </label>
                                <input type="email" id="profPermanentEmail" value="${emp.email}" disabled 
                                       style="background:var(--border);cursor:not-allowed;color:var(--text-secondary);font-weight:600;" 
                                       title="Permanent Email ID cannot be changed by the employee."/>
                            </div>

                            <div class="input-group" style="margin:0;">
                                <label>Phone Number (10-Digit Indian Mobile) *</label>
                                <div style="display:flex;align-items:center;position:relative;">
                                    <span style="position:absolute;left:12px;font-weight:700;color:var(--text-secondary);font-size:0.9rem;pointer-events:none;">+91</span>
                                    <input type="tel" id="profPhone" value="${(emp.phone || '').replace('+91', '').replace(/\D/g, '').slice(-10)}" maxlength="10" required placeholder="9876543210" 
                                           style="padding-left:45px;letter-spacing:1px;font-weight:600;" 
                                           oninput="window.validatePhoneInput(this)">
                                </div>
                                <div id="profPhoneError" class="field-error-msg"></div>
                                <div style="font-size:0.75rem;color:var(--text-light);margin-top:0.2rem;">
                                    * Only 10 digits starting with 6, 7, 8, or 9
                                </div>
                            </div>

                            <div class="input-group" style="margin:0;">
                                <label>Gender</label>
                                <input type="text" id="profGender" value="${emp.gender || 'Male'}" disabled style="background:var(--border);">
                            </div>

                            <div class="input-group" style="margin:0;">
                                <label>Date of Birth (DOB) *</label>
                                <input type="date" id="profDob" value="${emp.dob || '1995-06-20'}" required>
                            </div>

                            <div class="input-group" style="margin:0;">
                                <label>Date of Joining (DOJ) *</label>
                                <input type="date" id="profDoj" value="${emp.joining_date || '2024-01-15'}" required>
                            </div>

                            <div class="input-group" style="margin:0;">
                                <label>Department</label>
                                <input type="text" value="${emp.department}" disabled style="background:var(--border);">
                            </div>

                            <div class="input-group" style="margin:0;">
                                <label>Designation</label>
                                <input type="text" value="${emp.designation}" disabled style="background:var(--border);">
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 style="color:var(--text-primary);margin-bottom:1rem;font-size:1.1rem;border-bottom:2px solid var(--primary-light);padding-bottom:0.5rem;">
                            <i class="fas fa-id-card" style="color:var(--primary);"></i> Statutory Identity Documents
                        </h3>
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
                            <div class="input-group" style="margin:0;">
                                <label>Aadhaar Number * (12 Digits)</label>
                                <input type="text" id="profAadhaar" value="${emp.aadhaar || '7482 9104 3829'}" maxlength="14" required oninput="window.validateAadhaarInput(this)">
                                <div id="profAadhaarError" class="field-error-msg"></div>
                            </div>

                            <div class="input-group" style="margin:0;">
                                <label>PAN Number * <span style="color:var(--danger);font-size:0.75rem;">(Mandatory for Indian Employees)</span></label>
                                <input type="text" id="profPan" value="${emp.pan || 'ABCDE1234F'}" maxlength="10" required style="text-transform:uppercase;" oninput="window.validatePanInput(this)">
                                <div id="profPanError" class="field-error-msg"></div>
                            </div>

                            <div class="input-group" style="margin:0;grid-column:1/-1;">
                                <label>Passport Number / Passport ID <span style="font-size:0.75rem;color:var(--text-light);">(Optional)</span></label>
                                <input type="text" id="profPassport" value="${emp.passport || 'L8924012'}" style="text-transform:uppercase;">
                            </div>
                        </div>
                    </div>

                    <div style="margin-top:1.8rem;display:flex;gap:1rem;">
                        <button type="submit" class="btn-success" style="padding:0.75rem 2rem;"><i class="fas fa-save"></i> Save Profile Details</button>
                        <button type="button" class="btn-secondary-custom" onclick="window.switchSection('dashboard')">Cancel</button>
                    </div>

                </div>
            </div>
        </form>
    `;
}

function handleProfilePhotoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(evt) {
        const base64 = evt.target.result;
        const preview = document.getElementById('profileImagePreview');
        if (preview) preview.src = base64;
        updateUserPhoto(base64);
        window.showToast('Success', 'Profile photo updated successfully!', 'success');
    };
    reader.readAsDataURL(file);
}

function selectSampleAvatar(url) {
    const preview = document.getElementById('profileImagePreview');
    if (preview) preview.src = url;
    updateUserPhoto(url);
    window.showToast('Success', 'Profile avatar selected!', 'success');
}

async function updateUserPhoto(photoUrl) {
    const userEmail = currentUser?.email || 'alex.employee@gmail.com';
    const emp = (window._currentEmployees || []).find(e => e.email && e.email.toLowerCase() === userEmail.toLowerCase()) || currentUser?.empData;
    if (emp) {
        emp.photo = photoUrl;
        if (!window.useMockData && window.api && (emp.id || emp.user_id)) {
            try {
                await window.api.updateEmployee(emp.id || emp.user_id, { photo: photoUrl });
            } catch (e) {
                console.warn('Photo API sync notice:', e.message);
            }
        }
        const profileIcon = document.getElementById('profileIcon');
        if (profileIcon) {
            profileIcon.innerHTML = `<img src="${photoUrl}" class="nav-avatar-img" alt="Avatar"/> <span>Profile</span>`;
        }
    }
}

function formatAadhaarInput(input) {
    let val = input.value.replace(/\D/g, '').substring(0, 12);
    input.value = val.replace(/(\d{4})(?=\d)/g, '$1 ');
}

async function saveProfileData(event) {
    event.preventDefault();
    const isNameValid = validateNameInput(document.getElementById('profFullName'));
    const isPhoneValid = validatePhoneInput(document.getElementById('profPhone'));
    const isPanValid = validatePanInput(document.getElementById('profPan'));
    const isAadhaarValid = validateAadhaarInput(document.getElementById('profAadhaar'));

    if (!isNameValid || !isPhoneValid || !isPanValid || !isAadhaarValid) {
        window.showToast('Validation Error', 'Please correct the highlighted profile fields with red marks.', 'error');
        const firstInvalid = document.querySelector('#profileForm .is-invalid');
        if (firstInvalid) firstInvalid.focus();
        return;
    }

    const name = document.getElementById('profFullName')?.value.trim();
    const rawPhone = document.getElementById('profPhone')?.value.replace(/\D/g, '') || '';
    const dob = document.getElementById('profDob')?.value;
    const doj = document.getElementById('profDoj')?.value;
    const aadhaar = document.getElementById('profAadhaar')?.value.trim();
    const pan = document.getElementById('profPan')?.value.trim().toUpperCase();
    const passport = document.getElementById('profPassport')?.value.trim();
    const photo = document.getElementById('profileImagePreview')?.src;
    const phone = '+91 ' + rawPhone;

    const userEmail = currentUser?.email || 'alex.employee@gmail.com';
    const profilePayload = { name, phone, dob, joining_date: doj, aadhaar, pan, passport, photo };

    if (!window.useMockData && window.api) {
        try {
            window.showToast('Info', 'Updating profile in database...', 'info');
            const empId = currentUser?.empData?.id || currentUser?.empData?.user_id;
            if (empId) {
                await window.api.updateEmployee(empId, profilePayload);
            }
            if (currentUser) {
                currentUser.name = name;
                if (currentUser.empData) Object.assign(currentUser.empData, profilePayload);
            }
            document.getElementById('employeeNameDisplay').textContent = name;
            window.showToast('Success', 'Profile updated securely in database!', 'success');
            return;
        } catch (error) {
            console.error('❌ Profile update error:', error);
            window.showToast('Error', error.message || 'Failed to update profile in database.', 'error');
            return;
        }
    }

    const employees = window._currentEmployees || [];
    const emp = employees.find(e => e.email && e.email.toLowerCase() === userEmail.toLowerCase()) || currentUser?.empData;
    if (emp) {
        Object.assign(emp, profilePayload);
        window.saveEmployeesData(employees);
        document.getElementById('employeeNameDisplay').textContent = name;
        window.showToast('Success', 'Profile updated securely!', 'success');
    }
}

function renderAttendance(userEmail) {
    return `
        <div class="detail-list" style="text-align:center;padding:3rem 2rem;">
            <div style="font-size:3.5rem;color:var(--primary);margin-bottom:1rem;"><i class="fas fa-clock"></i></div>
            <h2>Attendance Tracker</h2>
            <div class="subhead">Daily Attendance Compliance: 95.4% Present</div>
            <p style="color:var(--text-secondary);max-width:450px;margin:0 auto;line-height:1.5;">
                Logged in today as <strong>Present (On-Time)</strong> for the current pay cycle.
            </p>
            <div style="margin-top:1.5rem;">
                <button class="btn-primary" onclick="window.switchSection('dashboard')"><i class="fas fa-th-large"></i> Return to Dashboard</button>
            </div>
        </div>
    `;
}

function refreshCurrentSection() {
    const userEmail = currentUser?.email || 'alex.employee@gmail.com';
    if (window.renderApp) window.renderApp(userEmail);
}

// ============================================================
// ===== EXPOSE ALL FUNCTIONS GLOBALLY =====
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

window.handleProfilePhotoUpload = handleProfilePhotoUpload;
window.selectSampleAvatar = selectSampleAvatar;
window.formatAadhaarInput = formatAadhaarInput;
window.saveProfileData = saveProfileData;
window.showAddEmployeeModal = showAddEmployeeModal;
window.editEmployee = editEmployee;
window.saveEmployee = saveEmployee;
window.deleteEmployee = deleteEmployee;
window.searchEmployees = searchEmployees;
window.clearSearch = clearSearch;
window.handleDeptChange = handleDeptChange;
window.setModalPhoto = setModalPhoto;
window.handleModalPhotoUpload = handleModalPhotoUpload;

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

window.selectChatRecipient = selectChatRecipient;
window.handleSendChatMessage = handleSendChatMessage;
window.sendQuickMessage = sendQuickMessage;
window.markAllNotificationsRead = markAllNotificationsRead;
window.refreshCurrentSection = refreshCurrentSection;

console.log('✅ HR Connect updated consolidated renderers loaded successfully');