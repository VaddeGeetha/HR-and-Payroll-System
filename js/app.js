// ========== APPLICATION LOGIC ==========

function renderApp(userEmail) {
  const role = getRole(userEmail);
  const name = getNameFromEmail(userEmail);
  const emp = getEmployeeByEmail(userEmail);
  STORE.currentUser = { email: userEmail, role, name };

  initWFH(userEmail);

  document.getElementById('employeeNameDisplay').textContent = name;
  const badge = document.getElementById('roleBadge');
  badge.textContent = role === 'hr' ? 'HR Administrator' : 'Employee';
  badge.className = 'role-badge' + (role === 'hr' ? ' hr-badge' : '');

  const sidebarNav = document.getElementById('sidebarNav');
  const menuItems = role === 'hr' ? [
    { id: 'dashboard', icon: 'fa-th-large', label: 'Dashboard' },
    { id: 'employees', icon: 'fa-users', label: 'Employees' },
    { id: 'leaves', icon: 'fa-umbrella-beach', label: 'Leave Requests' },
    { id: 'messages', icon: 'fa-envelope', label: 'Messages', badge: STORE.messages.filter(m => !m.read).length },
    { id: 'profile', icon: 'fa-id-badge', label: 'Profile' },
  ] : [
    { id: 'dashboard', icon: 'fa-th-large', label: 'Dashboard' },
    { id: 'attendance', icon: 'fa-clipboard-check', label: 'Attendance' },
    { id: 'payroll', icon: 'fa-wallet', label: 'Payroll' },
    { id: 'wfh', icon: 'fa-house-user', label: 'Work From Home' },
    { id: 'messages', icon: 'fa-envelope', label: 'Messages', badge: STORE.messages.filter(m => m.to === userEmail && !m.read).length },
    { id: 'profile', icon: 'fa-id-badge', label: 'Profile' },
  ];

  sidebarNav.innerHTML = '';
  menuItems.forEach(item => {
    const li = document.createElement('li');
    li.dataset.target = item.id;
    li.innerHTML = `<i class="fas ${item.icon}"></i> ${item.label}${item.badge ? ` <span class="msg-badge">${item.badge}</span>` : ''}`;
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
    wfh: renderWFH,
  };

  Object.keys(renderers).forEach(key => {
    const div = document.createElement('div');
    div.id = `section-${key}`;
    div.className = `section${key === currentSection ? ' active' : ''}`;
    div.innerHTML = renderers[key](userEmail, role);
    container.appendChild(div);
  });

  updateBadgeCounts(userEmail);
}

function showDashboard(email) {
  document.getElementById('loginPage').classList.add('hidden');
  document.getElementById('dashboardContainer').style.display = 'block';
  renderApp(email);
  setTimeout(() => {
    const startBtn = document.getElementById('wfhStartBtn');
    const stopBtn = document.getElementById('wfhStopBtn');
    if (startBtn) startBtn.addEventListener('click', handleWFHStart);
    if (stopBtn) stopBtn.addEventListener('click', handleWFHStop);
    const codeInput = document.getElementById('wfhCodeInput');
    if (codeInput) {
      codeInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleWFHStart();
      });
    }
  }, 100);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function logout() {
  document.getElementById('dashboardContainer').style.display = 'none';
  document.getElementById('loginPage').classList.remove('hidden');
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('passwordInput').value = 'password123';
  document.querySelector('.password-toggle').innerHTML = '<i class="fas fa-eye"></i>';
  document.getElementById('passwordInput').type = 'password';
}

// Global Functions
function sendMessage() {
  const subject = document.getElementById('msgSubject')?.value || '';
  const content = document.getElementById('msgContent')?.value;
  if (!content || content.trim() === '') { alert('Please write a message.'); return; }
  const email = STORE.currentUser?.email;
  if (!email) return;
  const name = getNameFromEmail(email);
  STORE.messages.push({
    from: name,
    to: 'hr.hr@gmail.com',
    text: `${subject ? `[${subject}] ` : ''}${content}`,
    timestamp: Date.now(),
    read: false
  });
  document.getElementById('msgContent').value = '';
  document.getElementById('msgSubject').value = '';
  alert('✅ Message sent to HR successfully!');
  switchSection('messages');
  updateBadgeCounts(email);
}

function approveLeave(id) {
  const req = STORE.leaveRequests.find(r => r.id === id);
  if (req) {
    req.status = 'approved';
    const empEmail = 'employee' + req.employee.replace(/\s/g, '') + '@company.com';
    STORE.messages.push({
      from: 'HR System',
      to: empEmail,
      text: `Your leave request (${req.reason}) from ${req.from} to ${req.to} has been APPROVED.`,
      timestamp: Date.now(),
      read: false
    });
    alert(`✅ Leave request for ${req.employee} approved.`);
    switchSection('leaves');
  }
}

function rejectLeave(id) {
  const req = STORE.leaveRequests.find(r => r.id === id);
  if (req) {
    req.status = 'rejected';
    const empEmail = 'employee' + req.employee.replace(/\s/g, '') + '@company.com';
    STORE.messages.push({
      from: 'HR System',
      to: empEmail,
      text: `Your leave request (${req.reason}) from ${req.from} to ${req.to} has been REJECTED. Please contact HR.`,
      timestamp: Date.now(),
      read: false
    });
    alert(`❌ Leave request for ${req.employee} rejected.`);
    switchSection('leaves');
  }
}