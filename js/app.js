// ============================================
// MAIN APPLICATION - Entry Point
// ============================================

// Initialize app
function initApp() {
    // Check if user is already logged in
    if (checkAuth()) {
        return;
    }

    // Login button
    document.getElementById('loginBtn').addEventListener('click', handleLogin);
    
    // Enter key on password
    document.getElementById('passwordInput').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleLogin();
    });

    // Toggle password visibility
    document.getElementById('togglePasswordBtn').addEventListener('click', togglePassword);

    // Forgot password link
    document.getElementById('forgotPasswordLink').addEventListener('click', (e) => {
        e.preventDefault();
        showForgotPage();
    });

    // Back to login
    document.getElementById('backToLogin').addEventListener('click', showLoginPage);

    // Send OTP
    document.getElementById('sendOtpBtn').addEventListener('click', handleSendOTP);

    // Verify OTP
    document.getElementById('verifyOtpBtn').addEventListener('click', handleVerifyOTP);

    // Reset password
    document.getElementById('resetPasswordBtn').addEventListener('click', handleResetPassword);

    // Enter key on forgot email
    document.getElementById('forgotEmail').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleSendOTP();
    });

    // Setup OTP inputs
    setupOTPInputs();

    // Logout
    document.getElementById('signOutBtn').addEventListener('click', handleLogout);

    // Hamburger menu
    document.getElementById('hamburgerBtn').addEventListener('click', function(e) {
        e.stopPropagation();
        document.getElementById('sidebar').classList.toggle('open');
    });

    // Close sidebar on click outside (mobile)
    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 820) {
            const sidebar = document.getElementById('sidebar');
            const hamburger = document.getElementById('hamburgerBtn');
            if (!sidebar.contains(e.target) && !hamburger.contains(e.target)) {
                sidebar.classList.remove('open');
            }
        }
    });

    // Profile icon click
    document.getElementById('profileIcon').addEventListener('click', () => {
        switchSection('profile');
    });

    console.log('🚀 HR Connect App initialized');
    console.log('📡 Backend URL:', CONFIG.API_URL);
    console.log('ℹ️  To connect to backend:');
    console.log('   1. Start backend server');
    console.log('   2. Update CONFIG.API_URL if needed');
    console.log('   3. Login with real credentials');
}

// Start app when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);