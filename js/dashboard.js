// ========== DASHBOARD NAVIGATION ==========

let currentSection = 'dashboard';

function switchSection(id) {
  currentSection = id;
  document.querySelectorAll('.sidebar-nav li').forEach(li =>
    li.classList.toggle('active', li.dataset.target === id));
  document.querySelectorAll('.section').forEach(s =>
    s.classList.toggle('active', s.id === `section-${id}`));
  document.getElementById('sidebar').classList.remove('open');
  
  if (id === 'messages') {
    const email = STORE.currentUser?.email;
    if (email) {
      const role = getRole(email);
      if (role === 'hr') STORE.messages.forEach(m => m.read = true);
      else STORE.messages.filter(m => m.to === email).forEach(m => m.read = true);
      updateBadgeCounts(email);
    }
  }
}

function updateBadgeCounts(userEmail) {
  const role = getRole(userEmail);
  const count = role === 'hr' ?
    STORE.messages.filter(m => !m.read).length :
    STORE.messages.filter(m => m.to === userEmail && !m.read).length;
  document.querySelectorAll('.sidebar-nav li').forEach(li => {
    if (li.dataset.target === 'messages') {
      const existing = li.querySelector('.msg-badge');
      if (count > 0) {
        if (existing) existing.textContent = count;
        else li.innerHTML += ` <span class="msg-badge">${count}</span>`;
      } else if (existing) existing.remove();
    }
  });
}