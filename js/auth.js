// ============================================================
// ===== AUTH FUNCTIONS =====
// ============================================================

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

function getEmployeeByEmail(email, employees) {
    return employees.find(e => e.email && e.email.toLowerCase() === email.toLowerCase()) || null;
}

// Make available globally
window.getRole = getRole;
window.getNameFromEmail = getNameFromEmail;
window.getEmployeeByEmail = getEmployeeByEmail;