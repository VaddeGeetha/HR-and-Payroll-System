// ============================================================
// ===== AUTHENTICATION HELPERS - Email Only =====
// ============================================================

/**
 * Get user role based on email
 * @param {string} email - User's email address
 * @returns {string} 'admin' | 'hr' | 'employee'
 */
function getRole(email) {
    if (!email) return 'employee';
    const lower = email.toLowerCase().trim();
    
    // Check if it's admin
    if (
        lower.includes('admin') ||
        lower.includes('@admin') ||
        lower.includes('admin@')
    ) {
        return 'admin';
    }
    
    // Check if it's HR
    if (
        lower.includes('.hr@') ||
        lower.includes('@hr.') ||
        lower.includes('hr.') ||
        lower.includes('@hr')
    ) {
        return 'hr';
    }
    
    return 'employee';
}

/**
 * Get display name from email
 * @param {string} email - User's email address
 * @returns {string} Formatted name
 */
function getNameFromEmail(email) {
    if (!email) return 'User';
    const local = email.split('@')[0];
    if (!local) return 'User';
    return local.split('.').map(part => 
        part.charAt(0).toUpperCase() + part.slice(1)
    ).join(' ');
}

/**
 * Find employee by email
 * @param {string} email - Email to search
 * @param {Array} employees - List of employees
 * @returns {object|null} Employee object or null
 */
function getEmployeeByEmail(email, employees) {
    if (!email || !employees) return null;
    return employees.find(e => 
        e.email && e.email.toLowerCase() === email.toLowerCase()
    ) || null;
}

/**
 * Get display name for role
 * @param {string} role - Role string
 * @returns {string} Display name
 */
function getRoleDisplay(role) {
    const roles = {
        'admin': 'Administrator',
        'hr': 'HR Manager',
        'employee': 'Employee'
    };
    return roles[role] || 'Employee';
}

// ============================================================
// ===== EXPOSE FUNCTIONS GLOBALLY =====
// ============================================================

window.getRole = getRole;
window.getNameFromEmail = getNameFromEmail;
window.getEmployeeByEmail = getEmployeeByEmail;
window.getRoleDisplay = getRoleDisplay;

console.log('✅ Auth helpers loaded (Email only)');