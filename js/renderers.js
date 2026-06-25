// ========== SECTION RENDERERS ==========

function renderDashboard(userEmail, role) {
  const isHR = role === 'hr';
  return `
    <h2>Dashboard</h2>
    <div class="subhead">Welcome</div>
    <div class="card-grid">
      ${isHR ? `
        <div class="card" onclick="switchSection('employees')">
          <div class="icon"><i class="fas fa-users"></i></div>
          <h4>Employees</h4>
          <p>Manage your team</p>
          <span class="badge">View all</span>
        </div>
        <div class="card" onclick="switchSection('leaves')">
          <div class="icon"><i class="fas fa-umbrella-beach"></i></div>
          <h4>Leave Requests</h4>
          <p>Review pending requests</p>
          <span class="badge">Review</span>
        </div>
      ` : `
        <div class="card" onclick="switchSection('attendance')">
          <div class="icon"><i class="fas fa-clipboard-check"></i></div>
          <h4>Attendance</h4>
          <p>View your records</p>
          <span class="badge">View details</span>
        </div>
        <div class="card" onclick="switchSection('payroll')">
          <div class="icon"><i class="fas fa-wallet"></i></div>
          <h4>Payroll</h4>
          <p>View your payslips</p>
          <span class="badge">View details</span>
        </div>
        <div class="card" onclick="switchSection('wfh')">
          <div class="icon"><i class="fas fa-house-user"></i></div>
          <h4>Work From Home</h4>
          <p>Sign in with your code</p>
          <span class="badge">Start session</span>
        </div>
      `}
      <div class="card" onclick="switchSection('messages')">
        <div class="icon"><i class="fas fa-envelope"></i></div>
        <h4>Messages</h4>
        <p>${isHR ? STORE.messages.filter(m => !m.read).length : STORE.messages.filter(m => m.to === userEmail && !m.read).length} unread</p>
        <span class="badge">View</span>
      </div>
      <div class="card" onclick="switchSection('profile')">
        <div class="icon"><i class="fas fa-id-badge"></i></div>
        <h4>Profile</h4>
        <p>Your personal details</p>
        <span class="badge">View</span>
      </div>
    </div>
  `;
}

function renderEmployees(userEmail, role) {
  if (role !== 'hr') return `<div class="detail-list"><p>Access restricted to HR administrators.</p></div>`;
  let html = `<h2>Employee Directory</h2><div class="subhead">View all employees</div><div class="employee-grid">`;
  STORE.employees.forEach(emp => {
    const statusClass = emp.attendance;
    html += `
      <div class="employee-card">
        <div class="emp-id">${emp.id}</div>
        <div class="emp-detail">${emp.role} · ${emp.department}</div>
        <span class="emp-status ${statusClass}">${statusClass.toUpperCase()}</span>
      </div>
    `;
  });
  html += `</div>`;
  return html;
}

function renderLeaveRequests(userEmail, role) {
  if (role !== 'hr') return `<div class="detail-list"><p>Access restricted to HR administrators.</p></div>`;
  let html = `<h2>Leave Requests</h2><div class="subhead">Review and manage employee leave requests</div><div class="detail-list"><ul style="list-style:none;">`;
  STORE.leaveRequests.forEach(req => {
    const color = req.status === 'approved' ? '#22a65e' : req.status === 'pending' ? '#f0ad4e' : '#dc3545';
    html += `
      <li>
        <span class="label"><strong>${req.employee}</strong> · ${req.reason}</span>
        <span class="value">
          ${req.from} → ${req.to}
          <span style="color:${color};font-weight:600;margin-left:0.8rem;">${req.status.toUpperCase()}</span>
          ${req.status === 'pending' ? `
            <button class="btn-outline" style="margin-left:0.5rem;padding:0.2rem 0.8rem;font-size:0.75rem;" onclick="approveLeave(${req.id})">Approve</button>
            <button class="btn-danger" style="margin-left:0.3rem;padding:0.2rem 0.8rem;font-size:0.75rem;" onclick="rejectLeave(${req.id})">Reject</button>
          ` : ''}
        </span>
      </li>
    `;
  });
  html += `</ul></div>`;
  return html;
}

function renderMessages(userEmail, role) {
  const isHR = role === 'hr';
  const msgs = isHR ? STORE.messages : STORE.messages.filter(m => m.to === userEmail || m.from === userEmail);
  let html = `<h2>Messages</h2><div class="subhead">${isHR ? 'All employee messages' : 'Chat with HR'}</div>`;
  if (!isHR) {
    html += `
      <div class="message-area">
        <div style="display:flex;gap:0.8rem;flex-wrap:wrap;align-items:center;">
          <input type="text" id="msgSubject" placeholder="Subject (optional)" style="flex:1;min-width:150px;padding:0.5rem;border:1px solid #dce3ec;border-radius:1rem;">
          <textarea id="msgContent" placeholder="Type your message to HR..." style="flex:1;min-width:200px;"></textarea>
          <button class="btn-primary" onclick="sendMessage()"><i class="fas fa-paper-plane"></i> Send</button>
        </div>
      </div>
    `;
  }
  html += `<div class="detail-list"><div class="message-list"><ul style="list-style:none;">`;
  if (msgs.length === 0) html += `<li style="justify-content:center;color:#6c757d;">No messages yet.</li>`;
  else {
    msgs.slice().reverse().forEach(msg => {
      const unread = !msg.read && (isHR || msg.to === userEmail);
      html += `
        <li style="${unread ? 'background:#f0f7ff;border-radius:0.8rem;padding:0.5rem 0.8rem;' : ''}">
          <div style="flex:1;">
            <div><span class="msg-sender">${msg.from}</span> → ${msg.to}</div>
            <div class="msg-text">${msg.text}</div>
            <div class="msg-time">${new Date(msg.timestamp).toLocaleString()}</div>
          </div>
          ${unread ? '<span style="color:#1a6dff;font-size:0.7rem;">● New</span>' : ''}
        </li>
      `;
    });
  }
  html += `</ul></div></div>`;
  return html;
}

function renderProfile(userEmail, role) {
  const emp = getEmployeeByEmail(userEmail);
  const name = emp ? emp.name : getNameFromEmail(userEmail);
  const roleTitle = emp ? emp.role : (role === 'hr' ? 'HR Administrator' : 'Employee');
  const dept = emp ? emp.department : (role === 'hr' ? 'Human Resources' : 'Product');
  const empId = emp ? emp.id : (role === 'hr' ? 'HR-0001' : 'EMP-XXXX');
  return `
    <h2>${role === 'hr' ? 'HR Profile' : 'Employee Profile'}</h2>
    <div class="subhead">Your personal details</div>
    <div class="detail-list">
      <ul style="list-style:none;">
        <li><span class="label">Full name</span> <span class="value">${name}</span></li>
        <li><span class="label">Job role</span> <span class="value">${roleTitle}</span></li>
        <li><span class="label">Department</span> <span class="value">${dept}</span></li>
        <li><span class="label">Email</span> <span class="value">${userEmail}</span></li>
        <li><span class="label">Employee ID</span> <span class="value">${empId}</span></li>
      </ul>
    </div>
  `;
}

function renderAttendance(userEmail, role) {
  if (role === 'hr') {
    return `<div class="detail-list"><p>HR view: Attendance overview available in Employees section.</p></div>`;
  }
  const emp = getEmployeeByEmail(userEmail);
  const status = emp ? emp.attendance : 'present';
  return `
    <h2>Attendance</h2>
    <div class="subhead">Your attendance records</div>
    <div class="detail-list">
      <ul style="list-style:none;">
        <li><span class="label">Today's Status</span> <span class="value"><span class="status-badge ${status}">${status.toUpperCase()}</span></span></li>
        <li><span class="label">Check-in</span> <span class="value dash">— — : — —</span></li>
        <li><span class="label">Check-out</span> <span class="value dash">— — : — —</span></li>
        <li><span class="label">Attendance This Month</span> <span class="value dash">— / — days</span></li>
        <li><span class="label">Last 7 Days</span> <span class="value dash">— — — — — — —</span></li>
      </ul>
      <div style="margin-top:1rem;"><button class="btn-outline"><i class="fas fa-history"></i> View full history</button></div>
    </div>
  `;
}

function renderPayroll(userEmail, role) {
  if (role === 'hr') {
    return `<div class="detail-list"><p>HR view: Payroll overview available in Employees section.</p></div>`;
  }
  return `
    <h2>Payroll & Payslips</h2>
    <div class="subhead">Your salary details</div>
    <div class="detail-list">
      <ul style="list-style:none;">
        <li><span class="label">Current Month</span> <span class="value dash">— — — — —</span></li>
        <li><span class="label">Net Salary</span> <span class="value dash">$ — , — — — . — —</span></li>
        <li><span class="label">Bonus / Allowances</span> <span class="value dash">$ — — — . — —</span></li>
        <li><span class="label">Next Pay Date</span> <span class="value dash">— — / — — / — — — —</span></li>
      </ul>
      <div class="flex-between mt-3">
        <button class="btn-primary"><i class="fas fa-download"></i> Download payslip (PDF)</button>
        <button class="btn-outline"><i class="fas fa-arrow-right"></i> View all</button>
      </div>
    </div>
  `;
}

function renderWFH(userEmail, role) {
  if (role === 'hr') {
    return `
      <h2>Work From Home Overview</h2>
      <div class="subhead">Remote work summary</div>
      <div class="detail-list">
        <ul style="list-style:none;">
          <li><span class="label">Employees with active WFH sessions</span> <span class="value">${STORE.employees.filter(e => e.attendance === 'wfh').length}</span></li>
          <li><span class="label">Today's WFH status</span> <span class="value">${STORE.employees.filter(e => e.attendance === 'wfh').length > 0 ? 'Active' : 'None'}</span></li>
        </ul>
        <div style="margin-top:1rem;padding:0.8rem;background:#f0f7ff;border-radius:1rem;font-size:0.85rem;color:#385172;">
          <i class="fas fa-info-circle"></i> Employees sign in with their unique WFH code to start their session.
        </div>
      </div>
    `;
  }

  const isActive = isWFHActive();
  const code = getWFHCode();
  const startTime = getWFHStartTime();

  return `
    <h2>Work From Home</h2>
    <div class="subhead">Sign in with your unique WFH code</div>

    <div class="wfh-code-container">
      <div class="wfh-icon"><i class="fas fa-house-user"></i></div>
      <h3>${isActive ? '✅ Session Active' : 'WFH Sign In'}</h3>
      <div class="wfh-sub">${isActive ? 'You are currently working from home' : 'Enter your unique WFH code to start your session'}</div>

      ${!isActive ? `
        <div class="code-input-group">
          <input type="text" id="wfhCodeInput" placeholder="Enter WFH Code (e.g., WFH-1234)" maxlength="12" />
          <button id="wfhStartBtn"><i class="fas fa-sign-in-alt"></i> Start Session</button>
        </div>
        <div class="code-hint">
          <i class="fas fa-info-circle"></i> Your WFH code is provided by HR. Example: <strong>WFH-1234</strong>
        </div>
      ` : `
        <div class="wfh-status-box">
          <div class="status-label">Session Status</div>
          <div class="status-value active">
            <i class="fas fa-circle" style="color:#22a65e;font-size:0.6rem;"></i> Active
            <span style="font-size:0.8rem;color:#5e6f8d;display:block;margin-top:0.2rem;">
              Code: <span class="code-display">${code}</span>
            </span>
            <span style="font-size:0.7rem;color:#6c757d;display:block;margin-top:0.2rem;">
              Started: ${new Date(startTime).toLocaleString()}
            </span>
          </div>
        </div>
        <button class="wfh-stop-btn" id="wfhStopBtn"><i class="fas fa-stop-circle"></i> End Session</button>
        <div class="code-hint">
          <i class="fas fa-info-circle"></i> Click "End Session" when you finish your WFH work.
        </div>
      `}
    </div>
  `;
}