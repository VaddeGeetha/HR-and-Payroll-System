// ========== WFH SESSION MANAGEMENT ==========

function getWFHKey(email) {
  return 'wfh_session_' + email.toLowerCase().replace(/[^a-z0-9]/g, '_');
}

function loadWFHSession(email) {
  const key = getWFHKey(email);
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      const data = JSON.parse(saved);
      if (data.startTime && (Date.now() - data.startTime > 24 * 60 * 60 * 1000)) {
        localStorage.removeItem(key);
        return null;
      }
      return data;
    }
  } catch (e) {}
  return null;
}

function saveWFHSession(email, data) {
  const key = getWFHKey(email);
  localStorage.setItem(key, JSON.stringify(data));
}

function clearWFHSession(email) {
  const key = getWFHKey(email);
  localStorage.removeItem(key);
}

let wfhSession = null;
let wfhEmail = null;

function initWFH(email) {
  wfhEmail = email;
  wfhSession = loadWFHSession(email);
}

function isWFHActive() {
  return wfhSession && wfhSession.active === true;
}

function getWFHCode() {
  return wfhSession ? wfhSession.code : null;
}

function getWFHStartTime() {
  return wfhSession ? wfhSession.startTime : null;
}

function handleWFHStart() {
  if (!wfhEmail) return;
  const input = document.getElementById('wfhCodeInput');
  if (!input) return;
  const enteredCode = input.value.trim().toUpperCase();
  if (!enteredCode) {
    alert('Please enter your WFH code.');
    return;
  }

  const expectedCode = WFH_CODES[wfhEmail];
  if (!expectedCode) {
    alert('No WFH code assigned to your account. Please contact HR.');
    return;
  }

  if (enteredCode !== expectedCode) {
    alert('❌ Invalid WFH code. Please check with HR for your correct code.');
    return;
  }

  wfhSession = {
    code: enteredCode,
    startTime: Date.now(),
    active: true
  };
  saveWFHSession(wfhEmail, wfhSession);
  alert('✅ WFH session started successfully!');
  switchSection('wfh');
}

function handleWFHStop() {
  if (!wfhEmail) return;
  if (!isWFHActive()) return;

  if (confirm('Are you sure you want to end your WFH session?')) {
    clearWFHSession(wfhEmail);
    wfhSession = null;
    alert('✅ WFH session ended successfully.');
    switchSection('wfh');
  }
}