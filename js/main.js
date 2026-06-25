// ========== MAIN ENTRY POINT ==========

document.addEventListener('DOMContentLoaded', function() {
  
  // Login Button
  document.getElementById('loginBtn').addEventListener('click', function(e) {
    e.preventDefault();
    const email = document.getElementById('emailInput').value.trim() || 'alex.employee@gmail.com';
    showDashboard(email);
  });

  // Enter key on password field
  document.getElementById('passwordInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('loginBtn').click();
  });

  // Sign Out
  document.getElementById('signOutSidebar').addEventListener('click', logout);

  // Hamburger Menu
  document.getElementById('hamburgerBtn').addEventListener('click', function(e) {
    e.stopPropagation();
    document.getElementById('sidebar').classList.toggle('open');
  });

  // Close sidebar on outside click
  document.addEventListener('click', function(e) {
    if (window.innerWidth <= 820) {
      const s = document.getElementById('sidebar');
      const h = document.getElementById('hamburgerBtn');
      if (!s.contains(e.target) && !h.contains(e.target)) s.classList.remove('open');
    }
  });

  // Profile icon click
  document.getElementById('profileIcon').addEventListener('click', () => switchSection('profile'));

  // Login action links (demo)
  document.querySelectorAll('.login-actions a').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      alert('📧 Demo: ' + (e.target.textContent.trim() || 'link clicked'));
    });
  });

  console.log('HR Connect · Clean dashboard · Frontend Only');
});