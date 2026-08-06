// ============================================================
// ===== SECTION RENDERERS =====
// ============================================================

function renderDashboard(userEmail, role, employees, leaves, stats, chartData) {
    const isHR = role === 'hr';
    const totalEmps = employees.length;
    const present = employees.filter(e => e.attendance_status === 'present' || e.attendance === 'present').length;
    const onLeave = employees.filter(e => e.attendance_status === 'leave' || e.attendance === 'leave').length;
    const pendingLeaves = leaves.filter(l => l.status === 'pending').length;

    if (isHR) {
        return `
            <h2>HR Dashboard</h2>
            <div class="subhead">Complete overview of all employees</div>
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-label">Total Employees</div>
                    <div class="stat-value">${totalEmps}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Present Today</div>
                    <div class="stat-value">${present}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">On Leave</div>
                    <div class="stat-value">${onLeave}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Pending Requests</div>
                    <div class="stat-value">${pendingLeaves}</div>
                </div>
            </div>
            <div class="chart-grid">
                <div class="chart-box">
                    <h4><i class="fas fa-building" style="color:var(--primary);"></i> Department Distribution</h4>
                    <canvas id="barChart"></canvas>
                </div>
                <div class="chart-box">
                    <h4><i class="fas fa-user-check" style="color:var(--primary);"></i> Attendance Status</h4>
                    <canvas id="pieChart"></canvas>
                </div>
            </div>
            <div class="card-grid" style="margin-top:1.5rem;">
                <div class="card" onclick="window.switchSection('employees')">
                    <div class="icon"><i class="fas fa-users"></i></div>
                    <h4>Employees</h4>
                    <p>${totalEmps} employees</p>
                </div>
                <div class="card" onclick="window.switchSection('leaves')">
                    <div class="icon"><i class="fas fa-umbrella-beach"></i></div>
                    <h4>Leave Requests</h4>
                    <p>${pendingLeaves} pending</p>
                </div>
                <div class="card" onclick="window.switchSection('messages')">
                    <div class="icon"><i class="fas fa-envelope"></i></div>
                    <h4>Messages</h4>
                    <p>View messages</p>
                </div>
                <div class="card" onclick="window.switchSection('profile')">
                    <div class="icon"><i class="fas fa-id-badge"></i></div>
                    <h4>Profile</h4>
                    <p>Your details</p>
                </div>
            </div>
        `;
    } else {
        const currentEmployee = employees.find(e => e.email && e.email.toLowerCase() === userEmail.toLowerCase()) || null;
        const userAttendance = currentEmployee?.attendance_status || currentEmployee?.attendance || 'present';
        
        return `
            <h2>Employee Dashboard</h2>
            <div class="subhead">Your personal workspace</div>
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-label">Your Status</div>
                    <div class="stat-value" style="font-size:1.5rem;">
                        <span class="emp-status ${userAttendance}">${userAttendance.toUpperCase()}</span>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Your Role</div>
                    <div class="stat-value" style="font-size:1.5rem;">${currentEmployee?.role || 'Employee'}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Department</div>
                    <div class="stat-value" style="font-size:1.5rem;">${currentEmployee?.department || 'N/A'}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Employee ID</div>
                    <div class="stat-value" style="font-size:1.2rem;">${currentEmployee?.id || 'N/A'}</div>
                </div>
            </div>
            <div class="card-grid" style="margin-top:1.5rem;">
                <div class="card" onclick="window.switchSection('messages')">
                    <div class="icon"><i class="fas fa-envelope"></i></div>
                    <h4>Messages</h4>
                    <p>View messages</p>
                </div>
                <div class="card" onclick="window.switchSection('profile')">
                    <div class="icon"><i class="fas fa-id-badge"></i></div>
                    <h4>My Profile</h4>
                    <p>Your details</p>
                </div>
            </div>
        `;
    }
}

function renderEmployees(userEmail, role, employees) {
    if (role !== 'hr') return `
        <div class="detail-list">
            <h2>Employees</h2>
            <div class="subhead">Access restricted to HR administrators</div>
            <p style="color:var(--text-secondary);margin-top:1rem;">
                <i class="fas fa-lock" style="color:var(--danger);"></i> 
                You don't have permission to view this page.
            </p>
        </div>
    `;

    const empList = employees || [];

    let html = `
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem;margin-bottom:1rem;">
            <div>
                <h2 style="margin:0;">Employee Directory</h2>
                <div class="subhead" style="margin:0;">${empList.length} employees from database</div>
            </div>
            <button class="btn-success" onclick="window.showAddEmployeeModal()" style="padding:0.6rem 1.5rem;border-radius:var(--radius-sm);border:none;color:white;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:0.5rem;">
                <i class="fas fa-plus"></i> Add Employee
            </button>
        </div>
        <div style="margin-bottom:1rem;display:flex;gap:0.8rem;flex-wrap:wrap;">
            <input type="text" id="employeeSearchInput" placeholder="Search employees by name, email, or department..." style="flex:1;min-width:200px;padding:0.6rem 1rem;border:2px solid var(--border);border-radius:var(--radius-sm);background:var(--bg);color:var(--text-primary);">
            <button class="btn-primary btn-sm" onclick="window.searchEmployees()"><i class="fas fa-search"></i> Search</button>
            <button class="btn-primary btn-sm" onclick="window.clearSearch()"><i class="fas fa-times"></i> Clear</button>
        </div>
        <div class="employee-grid" id="employeeGrid">`;

    if (empList.length === 0) {
        html += `
            <div style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--text-light);">
                <i class="fas fa-users" style="font-size:3rem;display:block;margin-bottom:1rem;"></i>
                <p>No employees found. Click "Add Employee" to get started.</p>
            </div>
        `;
    } else {
        empList.forEach(emp => {
            const displayName = emp.name || 'N/A';
            const displayEmail = emp.email || 'N/A';
            const displayRole = emp.role || 'N/A';
            const displayDepartment = emp.department || 'N/A';
            const displayId = emp.id || 'N/A';
            const displaySalary = emp.monthly_salary || 0;
            const displayJoiningDate = emp.joining_date || 'N/A';
            
            html += `
                <div class="employee-card" 
                     data-id="${displayId}" 
                     data-name="${displayName.toLowerCase()}" 
                     data-email="${displayEmail.toLowerCase()}" 
                     data-department="${displayDepartment.toLowerCase()}">
                    <div class="emp-id">#${displayId}</div>
                    <div style="font-weight:600;color:var(--text-primary);font-size:1.1rem;">${displayName}</div>
                    <div class="emp-detail">${displayRole} · ${displayDepartment}</div>
                    <div class="emp-detail" style="font-size:0.8rem;color:var(--text-secondary);">${displayEmail}</div>
                    <div class="emp-detail" style="font-size:0.75rem;color:var(--text-light);">
                        💰 $${displaySalary} · 📅 ${displayJoiningDate}
                    </div>
                    <div style="margin-top:0.5rem;display:flex;gap:0.3rem;justify-content:center;">
                        <button class="btn-primary btn-sm" onclick="window.editEmployee('${displayId}')"><i class="fas fa-edit"></i></button>
                        <button class="btn-danger btn-sm" onclick="window.deleteEmployee('${displayId}')"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            `;
        });
    }

    html += `</div>`;

    // Add/Edit Employee Modal
    html += `
        <div id="addEmployeeModal" style="display:none;position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:1000;justify-content:center;align-items:center;">
            <div style="background:var(--card-bg);border-radius:var(--radius);padding:2rem;max-width:500px;width:90%;max-height:90vh;overflow-y:auto;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem;">
                    <h3 style="margin:0;" id="employeeModalTitle">Add New Employee</h3>
                    <button onclick="document.getElementById('addEmployeeModal').style.display='none'" style="background:none;border:none;font-size:1.5rem;cursor:pointer;color:var(--text-light);">&times;</button>
                </div>
                <form id="employeeForm" onsubmit="window.saveEmployee(event)">
                    <input type="hidden" id="editEmployeeId">
                    <div class="input-group">
                        <label>Full Name *</label>
                        <input type="text" id="empName" required placeholder="Enter full name">
                    </div>
                    <div class="input-group">
                        <label>Email *</label>
                        <input type="email" id="empEmail" required placeholder="Enter email address">
                    </div>
                    <div class="input-group">
                        <label>Role *</label>
                        <input type="text" id="empRole" required placeholder="e.g., employee, hr, admin">
                    </div>
                    <div class="input-group">
                        <label>Department *</label>
                        <select id="empDepartment" required style="width:100%;padding:0.85rem 1rem;border:2px solid var(--border);border-radius:var(--radius-sm);font-size:1rem;background:var(--bg);color:var(--text-primary);">
                            <option value="">Select Department</option>
                            <option value="HR">HR</option>
                            <option value="IT">IT</option>
                            <option value="Finance">Finance</option>
                            <option value="DS">Data Science</option>
                            <option value="Engineering">Engineering</option>
                            <option value="Product">Product</option>
                            <option value="Design">Design</option>
                            <option value="Marketing">Marketing</option>
                            <option value="Operations">Operations</option>
                        </select>
                    </div>
                    <div class="input-group">
                        <label>Monthly Salary</label>
                        <input type="number" id="empSalary" placeholder="Enter monthly salary">
                    </div>
                    <div class="input-group">
                        <label>Joining Date</label>
                        <input type="date" id="empJoiningDate">
                    </div>
                    <div id="passwordField" class="input-group">
                        <label>Password *</label>
                        <input type="password" id="empPassword" placeholder="Enter password (min 6 characters)" required>
                    </div>
                    <div style="display:flex;gap:0.8rem;margin-top:1.5rem;">
                        <button type="submit" class="btn-primary" style="flex:1;"><i class="fas fa-save"></i> <span id="submitBtnText">Add Employee</span></button>
                        <button type="button" class="btn-danger" onclick="document.getElementById('addEmployeeModal').style.display='none'" style="flex:0.5;">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    return html;
}

function renderLeaveRequests(userEmail, role, employees, leaves) {
    if (role !== 'hr') return `
        <div class="detail-list">
            <h2>Leave Requests</h2>
            <div class="subhead">Access restricted to HR administrators</div>
            <p style="color:var(--text-secondary);margin-top:1rem;">
                <i class="fas fa-lock" style="color:var(--danger);"></i> 
                You don't have permission to view this page.
            </p>
        </div>
    `;

    let html = `<h2>Leave Requests</h2><div class="subhead">${leaves.length} requests from database</div>
        <div class="detail-list"><ul style="list-style:none;">`;

    if (leaves.length === 0) {
        html += `<li style="justify-content:center;color:var(--text-light);">No leave requests found.</li>`;
    } else {
        leaves.forEach(req => {
            const color = req.status === 'approved' ? '#22a65e' : req.status === 'pending' ? '#f0ad4e' : '#dc3545';
            html += `
                <li>
                    <span class="label"><strong>${req.employee}</strong> · ${req.reason || 'N/A'}</span>
                    <span class="value">
                        ${req.from} → ${req.to}
                        <span style="color:${color};font-weight:600;margin-left:0.8rem;">${req.status.toUpperCase()}</span>
                        ${req.status === 'pending' ? `
                            <button class="btn-primary btn-sm" style="margin-left:0.5rem;" onclick="window.handleApproveLeave(${req.id})">Approve</button>
                            <button class="btn-danger btn-sm" style="margin-left:0.3rem;" onclick="window.handleRejectLeave(${req.id})">Reject</button>
                        ` : ''}
                    </span>
                </li>
            `;
        });
    }

    html += `</ul></div>`;
    return html;
}

function renderMessages(userEmail, role) {
    const isHR = role === 'hr';
    const msgs = isHR ? MOCK_DATA.messages : MOCK_DATA.messages.filter(m => m.to === userEmail || m.from === userEmail);

    let html = `<h2>Messages</h2><div class="subhead">${isHR ? 'All employee messages' : 'Chat with HR'}</div>`;

    if (!isHR) {
        html += `
            <div class="message-area">
                <div style="display:flex;gap:0.8rem;flex-wrap:wrap;align-items:center;">
                    <input type="text" id="msgSubject" placeholder="Subject" style="flex:1;min-width:150px;padding:0.5rem 1rem;border:2px solid var(--border);border-radius:var(--radius-sm);background:var(--bg);color:var(--text-primary);">
                    <textarea id="msgContent" placeholder="Type your message..." style="flex:1;min-width:200px;padding:0.5rem 1rem;border:2px solid var(--border);border-radius:var(--radius-sm);background:var(--bg);color:var(--text-primary);"></textarea>
                    <button class="btn-primary" onclick="window.handleSendMessage()"><i class="fas fa-paper-plane"></i> Send</button>
                </div>
            </div>
        `;
    }

    html += `<div class="detail-list"><div class="message-list"><ul style="list-style:none;">`;

    if (msgs.length === 0) html += `<li style="justify-content:center;color:var(--text-light);">No messages yet.</li>`;
    else {
        msgs.slice().reverse().forEach(msg => {
            html += `
                <li>
                    <div style="flex:1;">
                        <div><span style="font-weight:600;">${msg.from}</span> → ${msg.to}</div>
                        <div style="margin:0.2rem 0;">${msg.text}</div>
                        <div style="font-size:0.75rem;color:var(--text-light);">${new Date(msg.timestamp).toLocaleString()}</div>
                    </div>
                </li>
            `;
        });
    }

    html += `</ul></div></div>`;
    return html;
}

function renderProfile(userEmail, role) {
    const employeeName = getNameFromEmail(userEmail);
    
    return `
        <h2>${role === 'hr' ? 'HR Profile' : 'Employee Profile'}</h2>
        <div class="subhead">Your personal details</div>
        <div class="detail-list">
            <ul style="list-style:none;">
                <li><span class="label">Full name</span> <span class="value">${employeeName}</span></li>
                <li><span class="label">Role</span> <span class="value">${role === 'hr' ? 'HR Administrator' : 'Employee'}</span></li>
                <li><span class="label">Email</span> <span class="value">${userEmail}</span></li>
                <li><span class="label">Status</span> <span class="value" style="color:var(--success);">● Active</span></li>
            </ul>
        </div>
    `;
}

function renderAttendance(userEmail, role) {
    return `
        <div class="detail-list" style="text-align:center;padding:3rem 2rem;">
            <div style="font-size:4rem;color:var(--text-light);margin-bottom:1rem;">
                <i class="fas fa-clock"></i>
            </div>
            <h2 style="color:var(--text-primary);margin-bottom:0.5rem;">Attendance Module</h2>
            <div class="subhead" style="margin-bottom:1rem;">Coming Soon in Sprint 4</div>
            <p style="color:var(--text-secondary);max-width:400px;margin:0 auto;">
                Attendance tracking is currently under development.
            </p>
            <div style="margin-top:1.5rem;">
                <button class="btn-primary" onclick="window.switchSection('dashboard')">
                    <i class="fas fa-th-large"></i> Go to Dashboard
                </button>
            </div>
        </div>
    `;
}

function renderPayroll(userEmail, role) {
    return `
        <div class="detail-list" style="text-align:center;padding:3rem 2rem;">
            <div style="font-size:4rem;color:var(--text-light);margin-bottom:1rem;">
                <i class="fas fa-wallet"></i>
            </div>
            <h2 style="color:var(--text-primary);margin-bottom:0.5rem;">Payroll Module</h2>
            <div class="subhead" style="margin-bottom:1rem;">Coming Soon in Sprint 5</div>
            <p style="color:var(--text-secondary);max-width:400px;margin:0 auto;">
                Payroll management is currently under development.
            </p>
            <div style="margin-top:1.5rem;">
                <button class="btn-primary" onclick="window.switchSection('dashboard')">
                    <i class="fas fa-th-large"></i> Go to Dashboard
                </button>
            </div>
        </div>
    `;
}

// ============================================================
// ===== EMPLOYEE CRUD FUNCTIONS =====
// ============================================================

function showAddEmployeeModal() {
    document.getElementById('addEmployeeModal').style.display = 'flex';
    document.getElementById('employeeModalTitle').textContent = 'Add New Employee';
    document.getElementById('submitBtnText').textContent = 'Add Employee';
    document.getElementById('editEmployeeId').value = '';
    document.getElementById('empPassword').required = true;
    document.getElementById('passwordField').style.display = 'block';
    document.getElementById('employeeForm').reset();
}

function editEmployee(id) {
    console.log('📝 Editing employee ID:', id);
    
    const employees = document.querySelectorAll('.employee-card');
    let employeeData = null;
    
    employees.forEach(card => {
        if (card.dataset.id == id) {
            const details = card.querySelectorAll('.emp-detail');
            const nameDiv = card.querySelector('div:nth-child(2)');
            
            employeeData = {
                id: card.dataset.id,
                name: nameDiv?.textContent || '',
                email: details[1]?.textContent || '',
                role: details[0]?.textContent?.split('·')[0]?.trim() || '',
                department: details[0]?.textContent?.split('·')[1]?.trim() || '',
            };
        }
    });

    if (employeeData) {
        document.getElementById('addEmployeeModal').style.display = 'flex';
        document.getElementById('employeeModalTitle').textContent = 'Edit Employee';
        document.getElementById('submitBtnText').textContent = 'Update Employee';
        document.getElementById('editEmployeeId').value = id;
        document.getElementById('empName').value = employeeData.name;
        document.getElementById('empEmail').value = employeeData.email;
        document.getElementById('empRole').value = employeeData.role;
        document.getElementById('empDepartment').value = employeeData.department;
        document.getElementById('empPassword').required = false;
        document.getElementById('passwordField').style.display = 'none';
    } else {
        window.showToast('Error', 'Employee not found', 'error');
    }
}

async function saveEmployee(event) {
    event.preventDefault();
    
    const id = document.getElementById('editEmployeeId').value;
    const name = document.getElementById('empName').value.trim();
    const email = document.getElementById('empEmail').value.trim();
    const role = document.getElementById('empRole').value.trim().toLowerCase();
    const department = document.getElementById('empDepartment').value;
    const salary = document.getElementById('empSalary').value;
    const joiningDate = document.getElementById('empJoiningDate').value;
    const password = document.getElementById('empPassword').value;

    if (!name || !email || !role || !department) {
        window.showToast('Error', 'Please fill in all required fields.', 'error');
        return;
    }

    if (!id && password.length < 6) {
        window.showToast('Error', 'Password must be at least 6 characters.', 'error');
        return;
    }

    const employeeData = {
        name: name,
        email: email,
        role: role,
        department: department
    };

    if (salary) employeeData.monthly_salary = parseFloat(salary);
    if (joiningDate) employeeData.joining_date = joiningDate;
    if (password) employeeData.password = password;

    try {
        if (id) {
            await window.api.updateEmployee(id, employeeData);
            window.showToast('Success', 'Employee updated successfully!', 'success');
        } else {
            await window.api.addEmployee(employeeData);
            window.showToast('Success', 'Employee added successfully!', 'success');
        }

        document.getElementById('addEmployeeModal').style.display = 'none';
        
        const userEmail = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).email : null;
        if (userEmail) {
            const employees = await window.fetchEmployees();
            const leaves = await window.fetchLeaves();
            const stats = await window.fetchDashboardStats();
            const chartData = await window.fetchChartData();
            
            const section = document.getElementById('section-employees');
            if (section) {
                const role = window.getRole(userEmail);
                section.innerHTML = window.renderEmployees(userEmail, role, employees);
            }
            
            const dashboardSection = document.getElementById('section-dashboard');
            if (dashboardSection) {
                const role = window.getRole(userEmail);
                dashboardSection.innerHTML = window.renderDashboard(userEmail, role, employees, leaves, stats, chartData);
                setTimeout(() => window.initCharts(chartData), 300);
            }
        }
    } catch (error) {
        window.showToast('Error', error.message || 'Failed to save employee', 'error');
    }
}

async function deleteEmployee(id) {
    if (!confirm('Are you sure you want to delete this employee?')) {
        return;
    }

    try {
        const numericId = parseInt(id);
        await window.api.deleteEmployee(numericId);
        window.showToast('Success', 'Employee deleted successfully!', 'success');
        
        const userEmail = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).email : null;
        if (userEmail) {
            const employees = await window.fetchEmployees();
            const section = document.getElementById('section-employees');
            if (section) {
                const role = window.getRole(userEmail);
                section.innerHTML = window.renderEmployees(userEmail, role, employees);
            }
        }
    } catch (error) {
        window.showToast('Error', error.message || 'Failed to delete employee', 'error');
    }
}

function searchEmployees() {
    const searchTerm = document.getElementById('employeeSearchInput').value.toLowerCase().trim();
    const cards = document.querySelectorAll('.employee-card');
    let found = 0;
    
    cards.forEach(card => {
        const name = card.dataset.name || '';
        const email = card.dataset.email || '';
        const department = card.dataset.department || '';
        
        if (!searchTerm || name.includes(searchTerm) || email.includes(searchTerm) || department.includes(searchTerm)) {
            card.style.display = '';
            found++;
        } else {
            card.style.display = 'none';
        }
    });
}

function clearSearch() {
    document.getElementById('employeeSearchInput').value = '';
    const cards = document.querySelectorAll('.employee-card');
    cards.forEach(card => {
        card.style.display = '';
    });
}

function handleSendMessage() {
    const content = document.getElementById('msgContent')?.value;
    if (!content || content.trim() === '') {
        window.showToast('Error', 'Please write a message.', 'error');
        return;
    }

    const subject = document.getElementById('msgSubject')?.value || '';
    MOCK_DATA.messages.push({
        from: currentUser?.name || 'User',
        to: 'hr.hr@gmail.com',
        text: `${subject ? `[${subject}] ` : ''}${content}`,
        timestamp: Date.now(),
        read: false
    });

    document.getElementById('msgContent').value = '';
    document.getElementById('msgSubject').value = '';
    window.showToast('Success', 'Message sent to HR!', 'success');
    window.switchSection('messages');
}

// Make functions globally available
window.renderDashboard = renderDashboard;
window.renderEmployees = renderEmployees;
window.renderLeaveRequests = renderLeaveRequests;
window.renderMessages = renderMessages;
window.renderProfile = renderProfile;
window.renderAttendance = renderAttendance;
window.renderPayroll = renderPayroll;

window.showAddEmployeeModal = showAddEmployeeModal;
window.editEmployee = editEmployee;
window.saveEmployee = saveEmployee;
window.deleteEmployee = deleteEmployee;
window.searchEmployees = searchEmployees;
window.clearSearch = clearSearch;
window.handleSendMessage = handleSendMessage;

console.log('✅ All renderers loaded successfully');