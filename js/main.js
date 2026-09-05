// ============================================================
// ===== MAIN.JS - Event Listeners =====
// ============================================================

console.log('🚀 HR Connect - Starting...');

document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM loaded, setting up event listeners...');

    // ===== LOGIN =====
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', function() {
            handleLogin();
        });
    }

    // ===== PASSWORD ENTER KEY =====
    const passwordInput = document.getElementById('passwordInput');
    if (passwordInput) {
        passwordInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                handleLogin();
            }
        });
    }

    // ===== SIGN OUT =====
    const signOutBtn = document.getElementById('signOutSidebar');
    if (signOutBtn) {
        signOutBtn.addEventListener('click', function() {
            logout();
        });
    }

    // ===== PROFILE ICON =====
    const profileIcon = document.getElementById('profileIcon');
    if (profileIcon) {
        profileIcon.addEventListener('click', function() {
            switchSection('profile');
        });
    }

    // ===== HAMBURGER MENU =====
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            const sidebar = document.getElementById('sidebar');
            if (sidebar) {
                sidebar.classList.toggle('open');
            }
        });
    }

    // ===== CLOSE SIDEBAR ON OUTSIDE CLICK =====
    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 820) {
            const sidebar = document.getElementById('sidebar');
            const hamburger = document.getElementById('hamburgerBtn');
            if (sidebar && hamburger && 
                !sidebar.contains(e.target) && 
                !hamburger.contains(e.target)) {
                sidebar.classList.remove('open');
            }
        }
    });

    // ===== FORGOT PASSWORD LINK =====
    const forgotLink = document.getElementById('forgotPasswordLink');
    if (forgotLink) {
        forgotLink.addEventListener('click', function(e) {
            e.preventDefault();
            showForgotPage();
        });
    }

    // ===== BACK TO LOGIN =====
    const backToLogin = document.getElementById('backToLogin');
    if (backToLogin) {
        backToLogin.addEventListener('click', function() {
            showLoginPage();
        });
    }

    // ===== SEND OTP =====
    const sendOtpBtn = document.getElementById('sendOtpBtn');
    if (sendOtpBtn) {
        sendOtpBtn.addEventListener('click', function() {
            handleSendOTP();
        });
    }

    // ===== VERIFY OTP =====
    const verifyOtpBtn = document.getElementById('verifyOtpBtn');
    if (verifyOtpBtn) {
        verifyOtpBtn.addEventListener('click', function() {
            handleVerifyOTP();
        });
    }

    // ===== RESET PASSWORD =====
    const resetPwBtn = document.getElementById('resetPasswordBtn');
    if (resetPwBtn) {
        resetPwBtn.addEventListener('click', function() {
            handleResetPassword();
        });
    }

    // ===== OTP AUTO-ADVANCE =====
    const otpInputs = document.querySelectorAll('.otp-input');
    if (otpInputs.length > 0) {
        otpInputs.forEach((input, index, arr) => {
            input.addEventListener('input', function() {
                if (this.value.length === 1 && index < arr.length - 1) {
                    arr[index + 1].focus();
                }
            });

            input.addEventListener('keydown', function(e) {
                if (e.key === 'Backspace' && this.value.length === 0 && index > 0) {
                    arr[index - 1].focus();
                }
                if (e.key === 'Enter') {
                    const verifyBtn = document.getElementById('verifyOtpBtn');
                    if (verifyBtn) {
                        verifyBtn.click();
                    }
                }
            });
        });
    }

    // ===== FORGOT EMAIL ENTER KEY =====
    const forgotEmail = document.getElementById('forgotEmail');
    if (forgotEmail) {
        forgotEmail.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                const sendBtn = document.getElementById('sendOtpBtn');
                if (sendBtn) {
                    sendBtn.click();
                }
            }
        });
    }

    console.log('✅ All event listeners attached successfully!');
    console.log('📡 API URL:', CONFIG.API_URL);
    console.log('📝 Mock Mode:', window.useMockData ? 'ON' : 'OFF');
});

window.addEventListener('error', function(e) {
    console.error('❌ Uncaught error:', e.message);
});

console.log('🚀 HR Connect initialization complete!');