// ========== AUTHENTICATION & HELPERS ==========

function getRole(email) {
  if (!email) return 'employee';
  const lower = email.toLowerCase();
  if (lower.includes('.hr@') || lower.includes('@hr.') || lower.match(/\.hr[^a-z0-9]/i)) {
    return 'hr';
  }
  return 'employee';
}

function getNameFromEmail(email) {
  if (!email) return 'User';
  const local = email.split('@')[0];
  if (!local) return 'User';
  return local.split('.').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
}

function getEmployeeByEmail(email) {
  return STORE.employees.find(e => e.email.toLowerCase() === email.toLowerCase()) || null;
}

function togglePassword() {
  const input = document.getElementById('passwordInput');
  const btn = document.querySelector('.password-toggle');
  if (!input || !btn) return;
  if (input.type === 'password') {
    input.type = 'text';
    btn.innerHTML = '<i class="fas fa-eye-slash"></i>';
  } else {
    input.type = 'password';
    btn.innerHTML = '<i class="fas fa-eye"></i>';
  }
}