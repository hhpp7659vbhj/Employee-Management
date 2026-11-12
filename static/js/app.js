/**
 * ZOOGLE ENTERPRISE EMS - CORE CLIENT JAVASCRIPT
 * Indian Enterprise Edition with QR Code Attendance & Cinematic Video Hero
 */

const App = (() => {
  // Global State
  const state = {
    currentUser: null,
    currentRole: null, // "ADMIN" or "EMPLOYEE"
    activeSection: 'overview',
    stats: {},
    employees: [],
    departments: [],
    attendance: [],
    leaves: [],
    payroll: [],
    tasks: [],
    notices: [],
    reviews: [],
    searchQuery: '',
    selectedDeptFilter: 'All',
    clockTimerInterval: null,
    videoHeroDismissed: false,
    qrScanInterval: null,
    cameraStream: null
  };

  // Sound effect using Web Audio API for QR scan beep
  
  // Universal Employee Name Resolvers
  function getEmpFullName(emp) {
    if (!emp) return 'Zoogle Member';
    if (typeof emp === 'string') return emp.trim();
    if (emp.fullName && emp.fullName !== 'undefined' && emp.fullName.trim()) return emp.fullName.trim();
    if (emp.empName && emp.empName !== 'undefined' && emp.empName.trim()) return emp.empName.trim();
    const first = (emp.firstName && emp.firstName !== 'undefined') ? emp.firstName.trim() : '';
    const last = (emp.lastName && emp.lastName !== 'undefined') ? emp.lastName.trim() : '';
    if (first || last) return `${first} ${last}`.trim();
    if (emp.name && emp.name !== 'undefined' && emp.name.trim()) return emp.name.trim();
    if (emp.username && emp.username !== 'undefined' && emp.username.trim()) return emp.username.trim();
    return 'Zoogle Member';
  }

  function getEmpNameById(id) {
    if (!id) return 'Zoogle Member';
    const list = (state.employees && state.employees.length) ? state.employees : [];
    const found = list.find(e => e.id === id || e.empCode === id);
    if (found) return getEmpFullName(found);
    if (state.currentUser && (state.currentUser.employeeId === id || state.currentUser.id === id)) {
      return getEmpFullName(state.currentUser);
    }
    return id;
  }

  function playScanBeep() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
      osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.15); // Octave jump
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch (e) {
      // AudioContext autoplay restrictions
    }
  }

  // API helper
  async function api(endpoint, method = 'GET', body = null) {
    const opts = {
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (body) opts.body = JSON.stringify(body);
    try {
      const res = await fetch('/api' + endpoint, opts);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || 'Server error');
      return data;
    } catch (err) {
      console.error('[Zoogle API Error]', endpoint, err);
      showToast(err.message, 'error');
      throw err;
    }
  }

  // Toast Notification
  function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) return;
    const toast = document.createElement('div');
    const isError = type === 'error';
    toast.className = `flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl border transition-all duration-300 transform translate-y-4 opacity-0 ${
      isError 
        ? 'bg-[#3D1E16] text-[#FDF9F8] border-[#BD3449]' 
        : 'bg-[#52121D] text-[#FDF9F8] border-[#D4AF37]'
    }`;
    toast.innerHTML = `
      <span class="${isError ? 'text-red-400' : 'text-amber-400'} text-lg">
        ${isError ? '⚠️' : '✨'}
      </span>
      <div class="text-sm font-medium">${message}</div>
    `;
    toastContainer.appendChild(toast);
    requestAnimationFrame(() => {
      toast.classList.remove('translate-y-4', 'opacity-0');
    });
    setTimeout(() => {
      toast.classList.add('opacity-0', '-translate-y-2');
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  // ================= 1. CINEMATIC VIDEO HERO SECTION =================
  function initHeroIntro() {
    const heroSection = document.getElementById('cinematic-hero-intro');
    const navCta = document.getElementById('hero-nav-cta-btn');
    const mainCta = document.getElementById('hero-main-cta-btn');
    const skipBtn = document.getElementById('skip-hero-btn');

    const enterPortal = () => {
      if (heroSection) {
        heroSection.classList.add('hero-hidden');
        state.videoHeroDismissed = true;
        setTimeout(() => {
          heroSection.style.display = 'none';
          renderApp();
        }, 800);
      }
    };

    if (navCta) navCta.addEventListener('click', enterPortal);
    if (mainCta) mainCta.addEventListener('click', enterPortal);
    if (skipBtn) skipBtn.addEventListener('click', enterPortal);

    // If user already logged in earlier, don't auto-dismiss video hero on first visit so they can see it,
    // but allow clicking Begin Journey to access right away.
    document.getElementById('replay-hero-btn')?.addEventListener('click', replayIntro);
  }

  function replayIntro() {
  const heroSection = document.getElementById('cinematic-hero-intro');
  if (!heroSection) return;

  state.videoHeroDismissed = false;
  heroSection.style.display = 'flex';

  requestAnimationFrame(() => {
    heroSection.classList.remove('hero-hidden');
  });
}

  // ================= 2. LOGIN DUAL INTERFACE =================
  function initLogin() {
    const tabs = document.querySelectorAll('.portal-tab');
    const loginSubtitle = document.getElementById('login-subtitle');
    const loginRoleBadge = document.getElementById('login-role-badge');
    const loginSubmitBtn = document.getElementById('login-submit-btn');
    const quickDemoContainer = document.getElementById('quick-demo-container');
    const roleInput = document.getElementById('login-role');
    const usernameInput = document.getElementById('login-username');
    const passwordInput = document.getElementById('login-password');

    let currentMode = 'admin';
    if (roleInput) {
  roleInput.value = 'ADMIN';
}

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active-tab'));
        tab.classList.add('active-tab');
        currentMode = tab.dataset.mode;
        if (roleInput) roleInput.value = currentMode.toUpperCase();

        if (currentMode === 'admin') {
          if (loginSubtitle) loginSubtitle.textContent = 'Zoogle Enterprise India • Master Governance';
          if (loginRoleBadge) {
            loginRoleBadge.textContent = 'ADMINISTRATION ACCESS';
            loginRoleBadge.className = 'text-xs px-3 py-1 rounded-full font-bold tracking-wider bg-[#52121D] text-[#E6C280] border border-[#D4AF37]/40';
          }
          if (loginSubmitBtn) {
            loginSubmitBtn.className = 'w-full btn-primary-maroon text-base py-3.5';
            loginSubmitBtn.innerHTML = `<span>Sign In as Administrator</span> <span>→</span>`;
          }
          if (quickDemoContainer) {
            quickDemoContainer.innerHTML = `
              <div class="flex items-center justify-between text-xs text-[#CBBAB7]">
                <span>Demo Admin (Rajeshwar Verma):</span>
                <button type="button" class="text-[#E6C280] hover:underline font-semibold" id="fill-admin-demo">
                  Fill: admin / admin123
                </button>
              </div>
            `;
            document.getElementById('fill-admin-demo')?.addEventListener('click', () => {
              if (usernameInput) usernameInput.value = 'admin';
              if (passwordInput) passwordInput.value = 'admin123';
            });
          }
        } else {
          if (loginSubtitle) loginSubtitle.textContent = 'Zoogle Employee Self-Service & Workspace Portal';
          if (loginRoleBadge) {
            loginRoleBadge.textContent = 'EMPLOYEE WORKSPACE';
            loginRoleBadge.className = 'text-xs px-3 py-1 rounded-full font-bold tracking-wider bg-[#3D1E16] text-[#E6C280] border border-[#D4AF37]/40';
          }
          if (loginSubmitBtn) {
            loginSubmitBtn.className = 'w-full btn-primary-brown text-base py-3.5';
            loginSubmitBtn.innerHTML = `<span>Sign In to My Workspace</span> <span>→</span>`;
          }
          if (quickDemoContainer) {
            quickDemoContainer.innerHTML = `
              <div class="space-y-1.5">
                <div class="text-xs text-[#CBBAB7] flex justify-between">
                  <span>Indian Employee Quick Switch (Pass: zoogle123):</span>
                </div>
                <div class="flex flex-wrap gap-1.5">
                  <button type="button" class="text-xs px-2.5 py-1 rounded-lg bg-[#2B150F] text-[#E6C280] hover:bg-[#4F271C] border border-[#663324]" data-emp="dheeraj.raj">Dheeraj Raj (Eng)</button>
                  <button type="button" class="text-xs px-2.5 py-1 rounded-lg bg-[#2B150F] text-[#E6C280] hover:bg-[#4F271C] border border-[#663324]" data-emp="pooja.sharma">Pooja Sharma (Design)</button>
                  <button type="button" class="text-xs px-2.5 py-1 rounded-lg bg-[#2B150F] text-[#E6C280] hover:bg-[#4F271C] border border-[#663324]" data-emp="rahul.roy">Rahul Roy (Marketing)</button>
                  <button type="button" class="text-xs px-2.5 py-1 rounded-lg bg-[#2B150F] text-[#E6C280] hover:bg-[#4F271C] border border-[#663324]" data-emp="ananya.iyer">Ananya Iyer (VP)</button>
                </div>
              </div>
            `;
            quickDemoContainer.querySelectorAll('button[data-emp]').forEach(btn => {
              btn.addEventListener('click', () => {
                if (usernameInput) usernameInput.value = btn.dataset.emp;
                if (passwordInput) passwordInput.value = 'zoogle123';
              });
            });
          }
        }
      });
    });

    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = usernameInput.value.trim();
        const password = passwordInput.value;
        const role = roleInput ? roleInput.value : 'ADMIN';

        if (!username || !password) {
          showToast('Please enter username and password.', 'error');
          return;
        }

        try {
          const res = await api('/auth/login', 'POST', { username, password, role });
          if (res.success) {
            state.currentUser = res.user;
            state.currentRole = res.user.role;
            localStorage.setItem('zoogle_user', JSON.stringify(res.user));
            showToast(`Namaste, ${res.user.fullName}! Welcome to Zoogle.`, 'success');
            renderApp();
          }
        } catch (err) {}
      });
    }

    document.getElementById('fill-admin-demo')?.addEventListener('click', () => {
      if (usernameInput) usernameInput.value = 'admin';
      if (passwordInput) passwordInput.value = 'admin123';
    });
  }

  // ================= 3. APP RENDERER =================
  
async function renderApp() {
  const heroIntro = document.getElementById('cinematic-hero-intro');
  const authWrapper = document.getElementById('auth-view');
  const adminWrapper = document.getElementById('admin-dashboard-view');
  const employeeWrapper = document.getElementById('employee-dashboard-view');

  if (
    !state.videoHeroDismissed &&
    heroIntro &&
    heroIntro.style.display !== 'none'
  ) {
    return;
  }

  if (!state.currentUser) {
    if (authWrapper) {
      authWrapper.classList.remove('login-entering');
      authWrapper.style.display = 'flex';

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          authWrapper.classList.add('login-entering');
        });
      });
    }

    if (adminWrapper) adminWrapper.style.display = 'none';
    if (employeeWrapper) employeeWrapper.style.display = 'none';
    return;
  }

  // Hide login and prepare the correct dashboard.
  if (authWrapper) authWrapper.style.display = 'none';

  const isAdmin = state.currentRole === 'ADMIN';
  const dashboard = isAdmin ? adminWrapper : employeeWrapper;
  const otherDashboard = isAdmin ? employeeWrapper : adminWrapper;

  if (otherDashboard) otherDashboard.style.display = 'none';

  if (dashboard) {
    dashboard.classList.remove('dashboard-entering');
    dashboard.style.display = 'flex';
  }

  // Load data and build the dashboard before animating it.
  if (isAdmin) {
    await loadAdminData();
    renderAdminSidebar();
    renderAdminSection(state.activeSection || 'overview');
  } else {
    await loadEmployeeData();
    renderEmployeeSidebar();
    renderEmployeeSection(state.activeSection || 'desk');
    startLiveClocks();
  }

  // Trigger the entrance animation after the dashboard is ready.
  if (dashboard) {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        dashboard.classList.add('dashboard-entering');
      });
    });
  }
}


  // ================= 4. QR ATTENDANCE SCANNER MODULE =================
  const OFFICIAL_GATE_A_PAYLOAD = 'ZOOGLE-OFFICE-GATE-A:BLR-HUB-2026';

  function openQrScannerModal() {
    // Check Working Hours: 08:00 AM to 08:00 PM
    const now = new Date();
    const currentHour = now.getHours();
    const isWorkingHours = currentHour >= 8 && currentHour < 20;
    let detectedQrCode = null;

    openModal(`
      <div class="qr-scanner-card text-center relative overflow-hidden">
        <div class="flex items-center justify-between pb-3 border-b border-[#D4AF37]/30 mb-4">
          <div class="text-left">
            <span class="text-xs uppercase font-bold tracking-widest text-[#E6C280]">Zoogle Smart Attendance</span>
            <h3 class="text-xl font-black text-white">Office Entrance QR Scanner</h3>
          </div>
          <span id="scanner-live-badge" class="text-xs px-2.5 py-1 rounded-full font-bold ${
            isWorkingHours ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
          }">
            ${isWorkingHours ? '🟢 Working Hours Window Active' : '🔴 Outside Shift Hours'}
          </span>
        </div>

        <p class="text-xs text-[#E6D2CA] max-w-sm mx-auto mb-4">
          Position your mobile/webcam over the Zoogle Entrance QR Code installed at the office turnstiles.
        </p>

        <!-- Viewfinder with Laser Scanner Line (Scanning Only - No QR Photo/Image) -->
        <div class="qr-scanner-viewfinder" id="qr-viewfinder-frame">
          <div class="scanner-corner top-left"></div>
          <div class="scanner-corner top-right"></div>
          <div class="scanner-corner bottom-left"></div>
          <div class="scanner-corner bottom-right"></div>
          <div class="scanner-laser-beam"></div>

          <video id="qr-camera-stream" class="scanner-video-feed" autoplay playsinline muted></video>

          <!-- Camera Loading / Sensor Standby Overlay (No QR image) -->
          <div id="camera-loading-overlay" class="absolute inset-0 bg-[#150608] flex flex-col items-center justify-center p-4">
            <div class="w-14 h-14 rounded-2xl bg-[#52121D] border-2 border-[#D4AF37] flex items-center justify-center text-2xl shadow-lg mb-2 animate-pulse">
              📷
            </div>
            <p class="text-xs text-[#E6C280] font-mono font-bold">Live Camera Viewfinder Active</p>
            <p class="text-[11px] text-gray-400 mt-1">Point lens at the office gate QR code to scan</p>
          </div>
        </div>

        <div class="mt-5 space-y-2">
          <button id="trigger-qr-scan-btn" class="w-full btn-primary-maroon text-sm py-3 font-bold flex items-center justify-center gap-2 shadow-xl cursor-pointer">
            <span>⚡ Scan Office Gate QR Code Now</span>
          </button>
          
          <div class="flex items-center justify-between text-xs text-[#CBBAB7] pt-2">
            <span>Location: Whitefield Tech Bay</span>
            <span>Gate Code: #ZOO-BLR-01</span>
          </div>
        </div>
      </div>
    `);

    // Try starting webcam video feed
    const videoElem = document.getElementById('qr-camera-stream');
    const cameraOverlay = document.getElementById('camera-loading-overlay');

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia && videoElem) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(stream => {
          state.cameraStream = stream;
          videoElem.srcObject = stream;
          if (cameraOverlay) cameraOverlay.style.display = 'none';

          // Real-time camera scanning via BarcodeDetector API
          if ('BarcodeDetector' in window) {
            try {
              const detector = new BarcodeDetector({ formats: ['qr_code'] });
              state.qrScanInterval = setInterval(async () => {
                if (videoElem && videoElem.readyState >= 2 && !detectedQrCode) {
                  try {
                    const barcodes = await detector.detect(videoElem);
                    if (barcodes && barcodes.length > 0) {
                      detectedQrCode = barcodes[0].rawValue;
                      const badge = document.getElementById('scanner-live-badge');
                      if (badge) {
                        badge.textContent = '✅ Gate QR Detected!';
                        badge.className = 'text-xs px-2.5 py-1 rounded-full font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40';
                      }
                      const frame = document.getElementById('qr-viewfinder-frame');
                      if (frame) {
                        frame.style.borderColor = '#10B981';
                        frame.style.boxShadow = '0 0 25px rgba(16, 185, 129, 0.5)';
                      }
                    }
                  } catch (e) {}
                }
              }, 250);
            } catch (e) {}
          }
        })
        .catch(() => {
          if (cameraOverlay) cameraOverlay.style.display = 'flex';
        });
    }

    // Action button with STRICT VERIFICATION
    document.getElementById('trigger-qr-scan-btn')?.addEventListener('click', async () => {
      // Check if a QR code was detected in the camera
      if (!detectedQrCode) {
        const frame = document.getElementById('qr-viewfinder-frame');
        if (frame) {
          frame.style.borderColor = '#EF4444';
          frame.style.boxShadow = '0 0 25px rgba(239, 68, 68, 0.6)';
          setTimeout(() => {
            frame.style.borderColor = '';
            frame.style.boxShadow = '';
          }, 1000);
        }
        alert('⚠️ No QR Code Detected!\n\nNo official Zoogle Office Entrance QR code was detected in the camera view.\n\nPlease point your camera steadily at the official Zoogle QR code installed at the office turnstile to scan.');
        showToast('⚠️ No QR code detected to scan! Please point camera at office QR code.', 'error');
        return;
      }

      // Verify authentic Zoogle Gate QR code
      const isOfficialGate = detectedQrCode.trim() === OFFICIAL_GATE_A_PAYLOAD ||
                             detectedQrCode.includes('ZOOGLE-OFFICE') ||
                             detectedQrCode.includes('BLR-HUB');

      if (!isOfficialGate) {
        alert('❌ Invalid QR Code!\n\nThis QR code does not belong to the Zoogle Office entrance turnstile.');
        showToast('Invalid QR code! Gate authorization failed.', 'error');
        return;
      }

      playScanBeep();
      stopCameraStream();

      // Check if employee already clocked in
      const today = getTodayDateStr();
      const existing = state.attendance.find(a => a.date === today && a.employeeId === state.currentUser.employeeId);
      const isAlreadyClockedIn = existing && existing.clockIn && (!existing.clockOut || existing.clockOut.length === 0);

      try {
        if (!isAlreadyClockedIn) {
          await api('/attendance/clock-in', 'POST', {
            employeeId: state.currentUser.employeeId,
            notes: 'Verified QR Scanned at Whitefield Gate A (Bangalore)'
          });
          showToast(`🎉 Attendance Marked! Check-in verified via QR Code at Gate A.`, 'success');
        } else {
          await api('/attendance/clock-out', 'POST', {
            employeeId: state.currentUser.employeeId,
            notes: 'Verified QR Scanned at Whitefield Exit Turnstile (Bangalore)'
          });
          showToast(`👋 Exit Logged! Check-out verified via QR Code. Great work today!`, 'success');
        }
        closeModal();
        await loadEmployeeData();
        renderEmployeeDesk(document.getElementById('employee-section-content'));
      } catch (err) {
        showToast('Error recording QR scan: ' + err.message, 'error');
      }
    });
  }

  function stopCameraStream() {
    if (state.qrScanInterval) {
      clearInterval(state.qrScanInterval);
      state.qrScanInterval = null;
    }
    if (state.cameraStream) {
      state.cameraStream.getTracks().forEach(track => track.stop());
      state.cameraStream = null;
    }
  }

  // Modal: Display Office Entrance QR Code (For Admins / Screen Projections)
  function openOfficeQrDisplayModal() {
    openModal(`
      <div class="office-qr-board">
        <span class="text-xs font-mono font-bold uppercase tracking-wider text-[#851C2C] bg-[#FAF2F3] px-3 py-1 rounded-md border border-[#F7EAEB]">
          OFFICE ENTRANCE ATTENDANCE BEACON
        </span>
        <h3 class="text-2xl font-black text-[#52121D] mt-3">ZOOGLE INDIA • GATE A</h3>
        <p class="text-xs text-gray-500 mt-1">Scan using Employee Workspace camera to mark your daily attendance</p>

        <!-- High Resolution SVG QR Code Matrix -->
        <div class="w-64 h-64 mx-auto my-5 p-4 bg-white rounded-2xl border-2 border-[#52121D] shadow-xl flex items-center justify-center">
          <svg viewBox="0 0 200 200" width="100%" height="100%">
            <!-- Position Marks (Top-Left) -->
            <rect x="10" y="10" width="50" height="50" fill="#52121D" rx="8" />
            <rect x="20" y="20" width="30" height="30" fill="#FFFFFF" rx="4" />
            <rect x="27" y="27" width="16" height="16" fill="#D4AF37" rx="3" />
            <!-- Position Marks (Top-Right) -->
            <rect x="140" y="10" width="50" height="50" fill="#52121D" rx="8" />
            <rect x="150" y="20" width="30" height="30" fill="#FFFFFF" rx="4" />
            <rect x="157" y="27" width="16" height="16" fill="#D4AF37" rx="3" />
            <!-- Position Marks (Bottom-Left) -->
            <rect x="10" y="140" width="50" height="50" fill="#52121D" rx="8" />
            <rect x="20" y="150" width="30" height="30" fill="#FFFFFF" rx="4" />
            <rect x="27" y="157" width="16" height="16" fill="#D4AF37" rx="3" />
            <!-- Data Grid Matrix in Maroon & Gold -->
            <rect x="70" y="15" width="12" height="12" fill="#52121D" />
            <rect x="90" y="25" width="12" height="12" fill="#D4AF37" />
            <rect x="115" y="15" width="12" height="12" fill="#52121D" />
            <rect x="75" y="45" width="12" height="12" fill="#52121D" />
            <rect x="95" y="55" width="12" height="12" fill="#D4AF37" />
            <rect x="115" y="45" width="12" height="12" fill="#52121D" />
            
            <rect x="15" y="75" width="12" height="12" fill="#52121D" />
            <rect x="35" y="95" width="12" height="12" fill="#D4AF37" />
            <rect x="55" y="75" width="12" height="12" fill="#52121D" />
            <rect x="15" y="115" width="12" height="12" fill="#52121D" />
            <rect x="35" y="115" width="12" height="12" fill="#D4AF37" />

            <!-- Center Zoogle Emblem -->
            <rect x="75" y="75" width="50" height="50" fill="#3D1E16" rx="10" />
            <text x="100" y="108" font-family="Inter, sans-serif" font-weight="900" font-size="28" fill="#D4AF37" text-anchor="middle">Z</text>

            <rect x="145" y="75" width="12" height="12" fill="#52121D" />
            <rect x="165" y="95" width="12" height="12" fill="#D4AF37" />
            <rect x="145" y="115" width="12" height="12" fill="#52121D" />
            <rect x="70" y="145" width="12" height="12" fill="#D4AF37" />
            <rect x="95" y="155" width="12" height="12" fill="#52121D" />
            <rect x="120" y="145" width="12" height="12" fill="#D4AF37" />
            <rect x="145" y="155" width="12" height="12" fill="#52121D" />
            <rect x="165" y="170" width="12" height="12" fill="#D4AF37" />
          </svg>
        </div>

        <div class="text-xs text-gray-500 font-mono">
          Gate UUID: ZOO-GATE-BLR-88902 • Dynamic Refresh: Every 60s
        </div>

        <div class="mt-5 flex justify-center gap-3">
          <button onclick="window.print()" class="btn-gold-outline text-xs">Print QR Poster 🖨️</button>
          <button onclick="App.closeModal()" class="btn-primary-maroon text-xs py-2 px-5">Done</button>
        </div>
      </div>
    `);
  }

  // ================= 5. ADMIN PORTAL LOGIC =================
  async function loadAdminData() {
    try {
      const [stats, employees, departments, attendance, leaves, payroll, notices, reviews, tasks] = await Promise.all([
        api('/stats'),
        api('/employees'),
        api('/departments'),
        api('/attendance'),
        api('/leaves'),
        api('/payroll'),
        api('/notices'),
        api('/performance'),
        api('/tasks')
      ]);
      state.stats = stats;
      state.employees = employees;
      state.departments = departments;
      state.attendance = attendance;
      state.leaves = leaves;
      state.payroll = payroll;
      state.notices = notices;
      state.reviews = reviews;
      state.tasks = tasks;
    } catch (e) {
      console.error('Failed loading admin data', e);
    }
  }

  function renderAdminSidebar() {
    const links = document.querySelectorAll('#admin-dashboard-view .nav-link');
    links.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        links.forEach(l => l.classList.remove('active-nav'));
        link.classList.add('active-nav');
        const target = link.dataset.target;
        state.activeSection = target;
        renderAdminSection(target);
      });
    });

    const adminNameEl = document.getElementById('admin-header-name');
    const adminAvatarEl = document.getElementById('admin-header-avatar');
    if (adminNameEl && state.currentUser) adminNameEl.textContent = state.currentUser.fullName;
    if (adminAvatarEl && state.currentUser && state.currentUser.avatar) adminAvatarEl.src = state.currentUser.avatar;

    document.getElementById('admin-logout-btn')?.addEventListener('click', (e) => {
  e.preventDefault();
  logout();
});
    document.getElementById('admin-show-qr-btn')?.addEventListener('click', openOfficeQrDisplayModal);
  }

  function renderAdminSection(section) {
    const content = document.getElementById('admin-section-content');
    if (!content) return;

    switch (section) {
      case 'overview':
        renderAdminOverview(content);
        break;
      case 'employees':
        renderAdminEmployees(content);
        break;
      case 'departments':
        renderAdminDepartments(content);
        break;
      case 'attendance':
        renderAdminAttendance(content);
        break;
      case 'leaves':
        renderAdminLeaves(content);
        break;
      case 'payroll':
        renderAdminPayroll(content);
        break;
      case 'performance':
        renderAdminPerformance(content);
        break;
      case 'notices':
        renderAdminNotices(content);
        break;
      case 'settings':
        renderAdminSettings(content);
        break;
      default:
        renderAdminOverview(content);
    }
  }

  // Admin: Overview
  function renderAdminOverview(container) {
    const s = state.stats;
    container.innerHTML = `
      <div class="space-y-6">
        <!-- Banner -->
        <div class="bg-navy-gradient rounded-2xl p-7 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div class="relative z-10">
            <span class="text-xs uppercase tracking-widest px-3 py-1 rounded-full bg-[#D4AF37]/20 text-[#E6C280] border border-[#D4AF37]/40 font-bold">
              Executive Console • India Hub
            </span>
            <h1 class="text-2xl md:text-3xl font-extrabold mt-2 text-white">Zoogle Technologies India</h1>
            <p class="text-[#E6D2CA] text-sm mt-1 max-w-xl">
              Live operations telemetry across Bangalore, Mumbai, Hyderabad, and Gurugram technology bays.
            </p>
          </div>
          <div class="relative z-10 flex items-center gap-3">
            <button id="quick-add-emp-btn" class="btn-gold-outline text-sm">
              <span>+ Add Employee</span>
            </button>
            <button id="quick-gen-payroll-btn" class="bg-[#FFFFFF]/10 hover:bg-[#FFFFFF]/20 text-white border border-white/20 px-4 py-2 rounded-xl text-sm font-semibold transition">
              <span>Process Payroll</span>
            </button>
          </div>
        </div>

        <!-- 4 KPI Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div class="stat-card">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs font-bold text-[#6B5558] uppercase tracking-wider">Total Staff</p>
                <h3 class="text-2xl font-black text-[#52121D] mt-1">${s.totalEmployees || 0}</h3>
                <p class="text-xs text-emerald-600 mt-1 font-semibold">Active in 6 Units</p>
              </div>
              <div class="stat-icon-maroon text-xl">👥</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs font-bold text-[#6B5558] uppercase tracking-wider">Present via QR</p>
                <h3 class="text-2xl font-black text-[#663324] mt-1">${s.presentToday || 0}</h3>
                <p class="text-xs text-[#B8860B] mt-1 font-semibold">${s.attendanceRate || 0}% On Premises</p>
              </div>
              <div class="stat-icon-brown text-xl">🏢</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs font-bold text-[#6B5558] uppercase tracking-wider">Pending Leaves</p>
                <h3 class="text-2xl font-black text-amber-700 mt-1">${s.pendingLeaves || 0}</h3>
                <p class="text-xs text-amber-600 mt-1 font-semibold">Requires Review</p>
              </div>
              <div class="stat-icon-gold text-xl">⏳</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs font-bold text-[#6B5558] uppercase tracking-wider">Monthly Payroll</p>
                <h3 class="text-2xl font-black text-[#52121D] mt-1">₹${(s.totalMonthlyPayroll || 0).toLocaleString('en-IN')}</h3>
                <p class="text-xs text-emerald-600 mt-1 font-semibold">October 2026</p>
              </div>
              <div class="stat-icon-maroon text-xl">💼</div>
            </div>
          </div>
        </div>

        <!-- Charts -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2 bg-white p-6 rounded-2xl border border-[#E8D9D5] shadow-sm">
            <div class="flex items-center justify-between mb-4">
              <div>
                <h3 class="font-bold text-lg text-[#52121D]">Weekly Office Attendance Pulse</h3>
                <p class="text-xs text-gray-500">QR-verified physical presence</p>
              </div>
              <span class="text-xs px-3 py-1 rounded-full bg-[#FAF2F3] text-[#851C2C] font-semibold border border-[#F7EAEB]">
                Live Trend
              </span>
            </div>
            <div class="h-64 flex items-center justify-center">
              <canvas id="attendancePulseChart" width="600" height="240" class="w-full h-full"></canvas>
            </div>
          </div>

          <div class="bg-white p-6 rounded-2xl border border-[#E8D9D5] shadow-sm flex flex-col">
            <div class="flex items-center justify-between mb-4">
              <div>
                <h3 class="font-bold text-lg text-[#3D1E16]">Workforce Distribution</h3>
                <p class="text-xs text-gray-500">Headcount by Division</p>
              </div>
              <span class="text-xs font-semibold text-[#B8860B]">6 Depts</span>
            </div>
            <div class="h-64 flex items-center justify-center">
              <canvas id="deptDonutChart" width="280" height="240"></canvas>
            </div>
          </div>
        </div>
      </div>
    `;

    setTimeout(() => {
      drawAttendancePulseChart();
      drawDeptDonutChart();
    }, 50);

    document.getElementById('quick-add-emp-btn')?.addEventListener('click', openAddEmployeeModal);
    document.getElementById('quick-gen-payroll-btn')?.addEventListener('click', generatePayrollAction);
  }

  function drawAttendancePulseChart() {
    const canvas = document.getElementById('attendancePulseChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    const presentData = [7, 8, 8, 7, 8];
    const total = 8;
    const padding = 40;
    const chartHeight = height - padding * 2;
    const barWidth = 45;
    const spacing = (width - padding * 2) / days.length;

    ctx.strokeStyle = '#E8D9D5';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();

    days.forEach((day, i) => {
      const x = padding + i * spacing + (spacing - barWidth) / 2;
      const count = presentData[i];
      const barH = (count / total) * chartHeight;
      const y = height - padding - barH;

      const grad = ctx.createLinearGradient(0, y, 0, height - padding);
      grad.addColorStop(0, '#BD3449');
      grad.addColorStop(1, '#6B1724');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barH, [8, 8, 0, 0]);
      ctx.fill();

      ctx.fillStyle = '#52121D';
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${count}/${total}`, x + barWidth / 2, y - 6);

      ctx.fillStyle = '#6B5558';
      ctx.font = '500 12px Inter, sans-serif';
      ctx.fillText(day, x + barWidth / 2, height - padding + 18);
    });
  }

  function drawDeptDonutChart() {
    const canvas = document.getElementById('deptDonutChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const counts = state.stats.departmentDistribution || { 'Engineering & Tech': 3, 'People & Culture': 1, 'Finance & Strategy': 1, 'Product & Design': 1, 'Marketing & Growth': 1, 'Global Operations': 1 };
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    const colors = ['#6B1724', '#851C2C', '#3D1E16', '#663324', '#D4AF37', '#9C553F'];

    const centerX = width / 2;
    const centerY = height / 2 - 10;
    const radius = Math.min(centerX, centerY) - 20;
    const innerRadius = radius * 0.6;

    let startAngle = -Math.PI / 2;
    let idx = 0;

    for (const [dept, count] of Object.entries(counts)) {
      const sliceAngle = (count / total) * (Math.PI * 2);
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
      ctx.arc(centerX, centerY, innerRadius, startAngle + sliceAngle, startAngle, true);
      ctx.closePath();
      ctx.fillStyle = colors[idx % colors.length];
      ctx.fill();
      startAngle += sliceAngle;
      idx++;
    }

    ctx.fillStyle = '#52121D';
    ctx.font = 'bold 22px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${total}`, centerX, centerY - 6);
    ctx.font = '500 11px Inter, sans-serif';
    ctx.fillStyle = '#6B5558';
    ctx.fillText('STAFF', centerX, centerY + 14);
  }

  // Admin: Employees CRUD
  function renderAdminEmployees(container) {
    const deptOptions = ['All', ...state.departments.map(d => d.name)];
    container.innerHTML = `
      <div class="space-y-6">
        <div class="bg-white p-5 rounded-2xl border border-[#E8D9D5] shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div class="flex items-center gap-3 w-full md:w-auto">
            <div class="relative flex-1 md:w-72">
              <input type="text" id="employee-search-input" placeholder="Search by name, code or title..." 
                value="${state.searchQuery}"
                class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E8D9D5] text-sm focus:outline-none focus:border-[#851C2C]">
              <span class="absolute left-3.5 top-3 text-gray-400">🔍</span>
            </div>
            <select id="employee-dept-filter" class="py-2.5 px-3.5 rounded-xl border border-[#E8D9D5] text-sm font-medium focus:outline-none focus:border-[#851C2C]">
              ${deptOptions.map(d => `<option value="${d}" ${state.selectedDeptFilter === d ? 'selected' : ''}>${d}</option>`).join('')}
            </select>
          </div>
          <button id="add-employee-btn" class="btn-primary-maroon text-sm py-2.5 px-5 w-full md:w-auto">
            <span>+ Add New Employee</span>
          </button>
        </div>

        <div class="bg-white rounded-2xl border border-[#E8D9D5] shadow-sm overflow-hidden">
          <div class="overflow-x-auto">
            <table class="zoogle-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>ID / Code</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Annual CTC</th>
                  <th>Joining Date</th>
                  <th>Status</th>
                  <th class="text-right">Actions</th>
                </tr>
              </thead>
              <tbody id="employees-table-body">
                ${renderEmployeeTableRows()}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    document.getElementById('employee-search-input')?.addEventListener('input', (e) => {
      state.searchQuery = e.target.value.toLowerCase();
      document.getElementById('employees-table-body').innerHTML = renderEmployeeTableRows();
      bindEmployeeActionEvents();
    });

    document.getElementById('employee-dept-filter')?.addEventListener('change', (e) => {
      state.selectedDeptFilter = e.target.value;
      document.getElementById('employees-table-body').innerHTML = renderEmployeeTableRows();
      bindEmployeeActionEvents();
    });

    document.getElementById('add-employee-btn')?.addEventListener('click', openAddEmployeeModal);
    bindEmployeeActionEvents();
  }

  function renderEmployeeTableRows() {
    const list = state.employees.filter(emp => {
      const matchDept = state.selectedDeptFilter === 'All' || emp.department === state.selectedDeptFilter;
      const q = state.searchQuery;
      const matchQuery = !q || 
        emp.fullName.toLowerCase().includes(q) ||
        (emp.empCode && emp.empCode.toLowerCase().includes(q)) ||
        (emp.designation && emp.designation.toLowerCase().includes(q));
      return matchDept && matchQuery;
    });

    if (list.length === 0) {
      return `<tr><td colspan="8" class="text-center py-8 text-gray-400">No employees match criteria.</td></tr>`;
    }

    return list.map(emp => `
      <tr>
        <td>
          <div class="flex items-center gap-3">
            <img src="${emp.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}" class="w-10 h-10 rounded-xl object-cover border border-[#E8D9D5]">
            <div>
              <p class="font-bold text-sm text-[#241417]">${getEmpFullName(emp)}</p>
              <p class="text-xs text-gray-500">${emp.email}</p>
            </div>
          </div>
        </td>
        <td><span class="font-mono text-xs font-bold text-[#851C2C] bg-[#FAF2F3] px-2 py-1 rounded-md">${emp.empCode}</span></td>
        <td><span class="text-xs font-semibold text-[#663324]">${emp.department}</span></td>
        <td><span class="text-xs font-medium text-gray-700">${emp.designation}</span></td>
        <td><span class="text-xs font-bold text-[#52121D]">₹${Number(emp.salary).toLocaleString('en-IN')}</span></td>
        <td><span class="text-xs text-gray-500">${emp.joiningDate}</span></td>
        <td>
          <span class="badge ${emp.status === 'Active' ? 'badge-present' : (emp.status === 'On Leave' ? 'badge-late' : 'badge-absent')}">
            ${emp.status}
          </span>
        </td>
        <td class="text-right">
          <div class="flex items-center justify-end gap-1.5">
            <button class="p-2 rounded-lg hover:bg-[#FAF2F3] text-[#851C2C] text-xs font-bold view-emp-btn" data-id="${emp.id}" title="View Dossier">👁️</button>
            <button class="p-2 rounded-lg hover:bg-[#FAF6F4] text-[#663324] text-xs font-bold edit-emp-btn" data-id="${emp.id}" title="Edit Profile">✏️</button>
            <button class="p-2 rounded-lg hover:bg-red-50 text-red-600 text-xs font-bold delete-emp-btn" data-id="${emp.id}" title="Delete Record">🗑️</button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  function bindEmployeeActionEvents() {
    document.querySelectorAll('.view-emp-btn').forEach(b => {
      b.addEventListener('click', () => openViewEmployeeModal(b.dataset.id));
    });
    document.querySelectorAll('.edit-emp-btn').forEach(b => {
      b.addEventListener('click', () => openEditEmployeeModal(b.dataset.id));
    });
    document.querySelectorAll('.delete-emp-btn').forEach(b => {
      b.addEventListener('click', () => confirmDeleteEmployee(b.dataset.id));
    });
  }

  // Admin: Attendance & QR Logs
  function renderAdminAttendance(container) {
    container.innerHTML = `
      <div class="space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 class="text-2xl font-black text-[#52121D]">Attendance & QR Scanner Logs</h2>
            <p class="text-xs text-gray-500">Real-time check-in logs from Bangalore, Mumbai, and Hyderabad hubs</p>
          </div>
          <button id="admin-gate-qr-btn" class="btn-primary-maroon text-sm py-2 px-4 flex items-center gap-2">
            <span>📷 Open Gate QR Beacon</span>
          </button>
        </div>

        <div class="bg-white rounded-2xl border border-[#E8D9D5] shadow-sm overflow-hidden">
          <div class="overflow-x-auto">
            <table class="zoogle-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Date</th>
                  <th>Clock In</th>
                  <th>Clock Out</th>
                  <th>Hours</th>
                  <th>Status</th>
                  <th>Scan Beacon / Notes</th>
                </tr>
              </thead>
              <tbody>
                ${state.attendance.map(a => `
                  <tr>
                    <td><span class="font-bold text-sm text-[#241417]">${a.empName || getEmpNameById(a.employeeId)}</span></td>
                    <td><span class="text-xs text-gray-600">${a.date}</span></td>
                    <td><span class="text-xs font-semibold text-emerald-700">${a.clockIn || '-'}</span></td>
                    <td><span class="text-xs font-semibold text-amber-800">${a.clockOut || 'Active Shift'}</span></td>
                    <td><span class="text-xs font-bold text-[#52121D]">${a.workHours > 0 ? a.workHours + ' hrs' : '-'}</span></td>
                    <td>
                      <span class="badge ${a.status === 'Present' ? 'badge-present' : (a.status === 'Late' ? 'badge-late' : 'badge-absent')}">
                        ${a.status}
                      </span>
                    </td>
                    <td><span class="text-xs text-gray-600 font-medium">${a.notes || 'Office QR Scanned'}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    document.getElementById('admin-gate-qr-btn')?.addEventListener('click', openOfficeQrDisplayModal);
  }

  // Admin: Departments
  function renderAdminDepartments(container) {
    container.innerHTML = `
      <div class="space-y-6">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-2xl font-black text-[#52121D]">Organizational Divisions</h2>
            <p class="text-xs text-gray-500">Annual budget allocation, leadership and regional tech bay locations</p>
          </div>
          <button id="add-dept-btn" class="btn-primary-maroon text-sm py-2.5 px-5">
            <span>+ Add Department</span>
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${state.departments.map(d => `
            <div class="bg-white rounded-2xl border border-[#E8D9D5] p-6 shadow-sm hover:shadow-md transition">
              <div class="flex items-start justify-between">
                <div>
                  <span class="text-xs font-bold px-2.5 py-1 rounded-md bg-[#FAF2F3] text-[#851C2C] border border-[#F7EAEB]">${d.code}</span>
                  <h3 class="text-lg font-bold text-[#241417] mt-2">${d.name}</h3>
                </div>
                <div class="w-10 h-10 rounded-xl bg-[#FAF6F4] text-[#663324] flex items-center justify-center font-bold text-sm">
                  ${d.employeeCount} 👤
                </div>
              </div>
              <p class="text-xs text-gray-600 mt-2 line-clamp-2">${d.description || 'Core division of Zoogle India.'}</p>
              
              <div class="mt-4 pt-4 border-t border-[#F0E6E2] space-y-2 text-xs">
                <div class="flex justify-between">
                  <span class="text-gray-500">Head of Department:</span>
                  <span class="font-bold text-[#52121D]">${d.headOfDept}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-500">Annual Budget:</span>
                  <span class="font-bold text-[#663324]">₹${Number(d.budget).toLocaleString('en-IN')}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-500">Facility Location:</span>
                  <span class="font-medium text-gray-700">${d.roomNumber}</span>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    document.getElementById('add-dept-btn')?.addEventListener('click', openAddDeptModal);
  }

  // Admin: Leaves
  function renderAdminLeaves(container) {
    container.innerHTML = `
      <div class="space-y-6">
        <div>
          <h2 class="text-2xl font-black text-[#52121D]">Leave Applications Management</h2>
          <p class="text-xs text-gray-500">Approve or reject time-off requests</p>
        </div>

        <div class="bg-white rounded-2xl border border-[#E8D9D5] shadow-sm overflow-hidden">
          <div class="overflow-x-auto">
            <table class="zoogle-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Type</th>
                  <th>Dates</th>
                  <th>Days</th>
                  <th>Reason</th>
                  <th>Applied On</th>
                  <th>Status</th>
                  <th class="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                ${state.leaves.map(l => `
                  <tr>
                    <td><span class="font-bold text-sm text-[#241417]">${l.empName || getEmpNameById(l.employeeId)}</span></td>
                    <td><span class="badge badge-maroon">${l.leaveType}</span></td>
                    <td><span class="text-xs text-gray-700">${l.startDate} to ${l.endDate}</span></td>
                    <td><span class="text-xs font-bold text-[#52121D]">${l.days} Days</span></td>
                    <td><span class="text-xs text-gray-600 italic max-w-xs block truncate" title="${l.reason}">${l.reason}</span></td>
                    <td><span class="text-xs text-gray-500">${l.appliedAt}</span></td>
                    <td>
                      <span class="badge ${l.status === 'APPROVED' ? 'badge-approved' : (l.status === 'PENDING' ? 'badge-pending' : 'badge-rejected')}">
                        ${l.status}
                      </span>
                    </td>
                    <td class="text-right">
                      ${l.status === 'PENDING' ? `
                        <div class="flex items-center justify-end gap-1.5">
                          <button class="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold admin-approve-leave" data-id="${l.id}">
                            Approve
                          </button>
                          <button class="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold admin-reject-leave" data-id="${l.id}">
                            Reject
                          </button>
                        </div>
                      ` : `
                        <span class="text-xs text-gray-400 italic">Reviewed</span>
                      `}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    container.querySelectorAll('.admin-approve-leave').forEach(b => {
      b.addEventListener('click', () => updateLeave(b.dataset.id, 'APPROVED'));
    });
    container.querySelectorAll('.admin-reject-leave').forEach(b => {
      b.addEventListener('click', () => updateLeave(b.dataset.id, 'REJECTED'));
    });
  }

  async function updateLeave(id, status) {
    const comment = prompt(`Enter review remarks for ${status.toLowerCase()} leave:`, status === 'APPROVED' ? 'Approved as per Zoogle India policy.' : 'Denied due to sprint delivery commitments.');
    if (comment === null) return;
    try {
      await api(`/leaves/${id}/status`, 'PUT', {
        status,
        reviewedBy: state.currentUser.fullName,
        reviewComment: comment
      });
      showToast(`Leave request ${status.toLowerCase()}!`);
      await loadAdminData();
      renderAdminSection(state.activeSection);
    } catch (e) {}
  }

  // Admin: Payroll
  function renderAdminPayroll(container) {
    container.innerHTML = `
      <div class="space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 class="text-2xl font-black text-[#52121D]">Payroll & Salary Statements (₹ INR)</h2>
            <p class="text-xs text-gray-500">TDS deductions, HRA allowances, EPF and net take-home salary</p>
          </div>
          <button id="batch-generate-payroll-btn" class="btn-primary-maroon text-sm py-2.5 px-5">
            <span>⚙️ Process October 2026 Payroll</span>
          </button>
        </div>

        <div class="bg-white rounded-2xl border border-[#E8D9D5] shadow-sm overflow-hidden">
          <div class="overflow-x-auto">
            <table class="zoogle-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Month</th>
                  <th>Basic Pay</th>
                  <th>Allowances (HRA)</th>
                  <th>TDS & Deductions</th>
                  <th>Net Take-Home</th>
                  <th>Status</th>
                  <th class="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${state.payroll.map(p => `
                  <tr>
                    <td><span class="font-bold text-sm text-[#241417]">${p.empName || getEmpNameById(p.employeeId)}</span></td>
                    <td><span class="text-xs text-gray-600 font-medium">${p.monthYear}</span></td>
                    <td><span class="text-xs font-semibold text-gray-800">₹${Number(p.basicSalary).toLocaleString('en-IN')}</span></td>
                    <td><span class="text-xs font-semibold text-emerald-700">+₹${Number(p.allowances).toLocaleString('en-IN')}</span></td>
                    <td><span class="text-xs font-semibold text-rose-700">-₹${(Number(p.deductions) + Number(p.tax)).toLocaleString('en-IN')}</span></td>
                    <td><span class="text-sm font-black text-[#52121D]">₹${Number(p.netSalary).toLocaleString('en-IN')}</span></td>
                    <td>
                      <span class="badge ${p.status === 'PAID' ? 'badge-approved' : 'badge-pending'}">
                        ${p.status}
                      </span>
                    </td>
                    <td class="text-right">
                      <div class="flex items-center justify-end gap-2">
                        ${p.status === 'PENDING' ? `
                          <button class="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold mark-paid-btn" data-id="${p.id}">
                            Mark Paid
                          </button>
                        ` : ''}
                        <button class="px-2.5 py-1 rounded-lg bg-[#FAF2F3] hover:bg-[#F7EAEB] text-[#851C2C] text-xs font-bold border border-[#BD3449]/30 view-payslip-btn" data-id="${p.id}">
                          Payslip 📄
                        </button>
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    document.getElementById('batch-generate-payroll-btn')?.addEventListener('click', generatePayrollAction);
    container.querySelectorAll('.mark-paid-btn').forEach(b => {
      b.addEventListener('click', async () => {
        try {
          await api(`/payroll/${b.dataset.id}/pay`, 'PUT');
          showToast('Salary marked as PAID!');
          await loadAdminData();
          renderAdminPayroll(container);
        } catch (e) {}
      });
    });
    container.querySelectorAll('.view-payslip-btn').forEach(b => {
      b.addEventListener('click', () => openPayslipModal(b.dataset.id));
    });
  }

  async function generatePayrollAction() {
    try {
      await api('/payroll/generate', 'POST', { monthYear: 'October 2026' });
      showToast('Payroll processed for October 2026!');
      await loadAdminData();
      renderAdminSection(state.activeSection);
    } catch (e) {}
  }

  // Admin: Performance
  function renderAdminPerformance(container) {
    container.innerHTML = `
      <div class="space-y-6">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-2xl font-black text-[#52121D]">Performance Reviews & Appraisals</h2>
            <p class="text-xs text-gray-500">Employee ratings, key milestones and manager reviews</p>
          </div>
          <button id="add-review-btn" class="btn-primary-maroon text-sm py-2.5 px-5">
            <span>+ Add Appraisal</span>
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${state.reviews.map(r => `
            <div class="bg-white rounded-2xl border border-[#E8D9D5] p-6 shadow-sm">
              <div class="flex items-start justify-between">
                <div>
                  <h3 class="font-bold text-base text-[#241417]">${r.empName || getEmpNameById(r.employeeId)}</h3>
                  <span class="text-xs text-gray-500">${r.reviewPeriod} • ${r.date}</span>
                </div>
                <div class="flex text-amber-500 text-sm">
                  ${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}
                </div>
              </div>
              <div class="mt-4 space-y-2 text-xs">
                <div>
                  <span class="font-semibold text-gray-500">Key Milestones:</span>
                  <p class="text-gray-800 mt-0.5">${r.goalsMet || 'Met all KPI targets.'}</p>
                </div>
                <div>
                  <span class="font-semibold text-gray-500">Appraisal Remarks:</span>
                  <p class="text-gray-700 italic mt-0.5">"${r.feedback}"</p>
                </div>
                <div class="pt-2 text-right text-gray-400">
                  By ${r.reviewer}
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    document.getElementById('add-review-btn')?.addEventListener('click', openAddReviewModal);
  }

  // Admin: Notices
  function renderAdminNotices(container) {
    container.innerHTML = `
      <div class="space-y-6">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-2xl font-black text-[#52121D]">Company Notice Board</h2>
            <p class="text-xs text-gray-500">Publish notices, festive updates, and hackathon schedules</p>
          </div>
          <button id="add-notice-btn" class="btn-primary-maroon text-sm py-2.5 px-5">
            <span>+ Publish Notice</span>
          </button>
        </div>

        <div class="space-y-4">
          ${state.notices.map(n => `
            <div class="bg-white rounded-2xl border ${n.pinned ? 'border-[#BD3449]/50 shadow-md' : 'border-[#E8D9D5]'} p-6 shadow-sm flex flex-col md:flex-row items-start justify-between gap-4">
              <div class="flex-1">
                <div class="flex items-center gap-2">
                  <span class="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                    n.pinned ? 'bg-[#52121D] text-[#E6C280]' : 'bg-[#FAF6F4] text-[#663324]'
                  }">
                    ${n.category} ${n.pinned ? '★ Pinned' : ''}
                  </span>
                  <span class="text-xs text-gray-400">${n.createdAt} • By ${n.author}</span>
                </div>
                <h3 class="text-lg font-bold text-[#241417] mt-2">${n.title}</h3>
                <p class="text-sm text-gray-600 mt-2 leading-relaxed">${n.content}</p>
              </div>
              <button class="text-red-500 hover:text-red-700 text-xs font-bold p-2 delete-notice-btn" data-id="${n.id}">
                Delete 🗑️
              </button>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    document.getElementById('add-notice-btn')?.addEventListener('click', openAddNoticeModal);
    container.querySelectorAll('.delete-notice-btn').forEach(b => {
      b.addEventListener('click', async () => {
        if (!confirm('Are you sure you want to delete this notice?')) return;
        try {
          await api(`/notices/${b.dataset.id}`, 'DELETE');
          showToast('Notice deleted.');
          await loadAdminData();
          renderAdminNotices(container);
        } catch (e) {}
      });
    });
  }

  // Admin: Settings
  function renderAdminSettings(container) {
    container.innerHTML = `
      <div class="space-y-6 max-w-4xl">
        <div>
          <h2 class="text-2xl font-black text-[#52121D]">System & QR Beacon Settings</h2>
          <p class="text-xs text-gray-500">Atomic database management, sample resets and office QR beacon projection</p>
        </div>

        <div class="bg-white rounded-2xl border border-[#E8D9D5] p-6 shadow-sm space-y-6">
          <div class="flex items-start justify-between pb-6 border-b border-[#F0E6E2]">
            <div>
              <h3 class="font-bold text-base text-[#241417]">Office Entrance QR Attendance Beacon</h3>
              <p class="text-xs text-gray-500 mt-1">Open and print the dynamic QR Code beacon for office entrance turnstiles.</p>
            </div>
            <button id="settings-open-qr-btn" class="btn-primary-maroon text-xs py-2 px-4">
              Open QR Beacon 📷
            </button>
          </div>

          <div class="flex items-start justify-between pb-6 border-b border-[#F0E6E2]">
            <div>
              <h3 class="font-bold text-base text-[#241417]">Reset Database to Default Samples</h3>
              <p class="text-xs text-gray-500 mt-1">Re-seeds all Indian employees (Pooja Sharma, Dheeraj Raj, Rahul Roy, etc.), attendance, leaves, and payroll.</p>
            </div>
            <button id="reset-db-btn" class="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-bold transition">
              Reset Database
            </button>
          </div>

          <div class="flex items-start justify-between">
            <div>
              <h3 class="font-bold text-base text-[#241417]">Replay Cinematic Video Hero</h3>
              <p class="text-xs text-gray-500 mt-1">Show off the full-screen looping video background hero section.</p>
            </div>
            <button id="replay-hero-from-settings" class="btn-gold-outline text-xs">
              Replay Video Hero ✨
            </button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('settings-open-qr-btn')?.addEventListener('click', openOfficeQrDisplayModal);
    document.getElementById('reset-db-btn')?.addEventListener('click', async () => {
      if (!confirm('Re-seed entire database to initial Indian employee records?')) return;
      try {
        await api('/reset', 'POST');
        showToast('Database reset to defaults!');
        await loadAdminData();
        renderAdminOverview(document.getElementById('admin-section-content'));
      } catch (e) {}
    });
    document.getElementById('replay-hero-from-settings')?.addEventListener('click', replayIntro);
  }

  // ================= 6. EMPLOYEE PORTAL LOGIC =================
  async function loadEmployeeData() {
    if (!state.currentUser || !state.currentUser.employeeId) return;
    const empId = state.currentUser.employeeId;
    try {
      const [emp, attendance, leaves, payroll, tasks, notices] = await Promise.all([
        api(`/employees/${empId}`),
        api(`/attendance?employeeId=${empId}`),
        api(`/leaves?employeeId=${empId}`),
        api(`/payroll?employeeId=${empId}`),
        api(`/tasks?employeeId=${empId}`),
        api('/notices')
      ]);
      state.currentEmployee = emp;
      state.attendance = attendance;
      state.leaves = leaves;
      state.payroll = payroll;
      state.tasks = tasks;
      state.notices = notices;
    } catch (e) {
      console.error('Failed loading employee data', e);
    }
  }

  function renderEmployeeSidebar() {
    const links = document.querySelectorAll('#employee-dashboard-view .nav-link');
    links.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        links.forEach(l => l.classList.remove('active-nav'));
        link.classList.add('active-nav');
        const target = link.dataset.target;
        state.activeSection = target;
        renderEmployeeSection(target);
      });
    });

    const empNameEl = document.getElementById('emp-header-name');
    const empAvatarEl = document.getElementById('emp-header-avatar');
    const empDeptEl = document.getElementById('emp-header-dept');
    if (empNameEl && state.currentEmployee) empNameEl.textContent = getEmpFullName(state.currentEmployee);
    if (empAvatarEl && state.currentEmployee && state.currentEmployee.avatar) empAvatarEl.src = state.currentEmployee.avatar;
    if (empDeptEl && state.currentEmployee) empDeptEl.textContent = state.currentEmployee.designation;

    document.getElementById('emp-logout-btn')?.addEventListener('click', logout);
    document.getElementById('header-scan-qr-btn')?.addEventListener('click', openQrScannerModal);
  }

  function renderEmployeeSection(section) {
    const content = document.getElementById('employee-section-content');
    if (!content) return;

    switch (section) {
      case 'desk':
        renderEmployeeDesk(content);
        break;
      case 'my-attendance':
        renderEmployeeAttendance(content);
        break;
      case 'my-leaves':
        renderEmployeeLeaves(content);
        break;
      case 'my-payslips':
        renderEmployeePayslips(content);
        break;
      case 'my-tasks':
        renderEmployeeTasks(content);
        break;
      case 'notices':
        renderEmployeeNotices(content);
        break;
      case 'my-profile':
        renderEmployeeProfile(content);
        break;
      default:
        renderEmployeeDesk(content);
    }
  }

  // Employee: My Desk
  function renderEmployeeDesk(container) {
    const emp = state.currentEmployee || {};
    const todayAttendance = state.attendance.find(a => a.date === getTodayDateStr());
    const isClockedIn = todayAttendance && todayAttendance.clockIn && (!todayAttendance.clockOut || todayAttendance.clockOut.length === 0);

    // Working hours 8am to 8pm
    const currentHour = new Date().getHours();
    const isWorkingHours = currentHour >= 8 && currentHour < 20;

    container.innerHTML = `
      <div class="space-y-6">
        <!-- QR Attendance Prompt Card -->
        <div class="bg-gradient-to-r from-[#102A40] via-[#183B55] to-[#071727] rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
          <div class="relative z-10">
            <div class="flex items-center gap-2">
              <span class="text-xs uppercase tracking-widest px-3 py-1 rounded-full bg-[#D4AF37]/20 text-[#E6C280] border border-[#D4AF37]/40 font-bold">
                Smart QR Check-In
              </span>
              <span class="text-xs px-2.5 py-0.5 rounded-full ${
                isWorkingHours ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
              } font-mono">
                Working Hours: 08:00 AM – 08:00 PM IST
              </span>
            </div>
            
            <h2 class="text-2xl md:text-3xl font-black mt-2 text-white">
              ${isClockedIn ? `Checked In: ${todayAttendance.clockIn}` : 'Mark Today\'s Attendance via QR'}
            </h2>
            <p class="text-xs text-[#E6D2CA] mt-1">
              ${isClockedIn ? 'Your shift is active. Click to scan exit QR code when leaving.' : 'Point your camera at the office turnstile QR code to record entry time.'}
            </p>
          </div>

          <div class="relative z-10 flex items-center gap-3 w-full md:w-auto">
            <button id="desk-open-qr-scanner-btn" class="w-full md:w-auto px-6 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-[#D4AF37] to-[#F59E0B] text-[#241417] shadow-xl hover:scale-105 transition flex items-center justify-center gap-2 cursor-pointer">
              <span class="text-lg">📷</span>
              <span>${isClockedIn ? 'Scan Exit QR Code' : 'Scan Office QR to Punch'}</span>
            </button>
          </div>
        </div>

        <!-- 3 Quick Stat Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div class="stat-card">
            <p class="text-xs font-bold text-gray-500 uppercase">Leave Balance</p>
            <h3 class="text-2xl font-black text-[#52121D] mt-1">15 Days</h3>
            <p class="text-xs text-emerald-600 mt-1 font-semibold">Casual: 7 • Sick: 8</p>
          </div>
          <div class="stat-card">
            <p class="text-xs font-bold text-gray-500 uppercase">Active Tasks</p>
            <h3 class="text-2xl font-black text-[#663324] mt-1">${state.tasks.filter(t => t.status !== 'COMPLETED').length} Active</h3>
            <p class="text-xs text-amber-600 mt-1 font-semibold">${state.tasks.filter(t => t.priority === 'HIGH').length} High Priority</p>
          </div>
          <div class="stat-card">
            <p class="text-xs font-bold text-gray-500 uppercase">Latest Net Salary</p>
            <h3 class="text-2xl font-black text-[#52121D] mt-1">₹${state.payroll.length > 0 ? Number(state.payroll[0].netSalary).toLocaleString('en-IN') : '0'}</h3>
            <p class="text-xs text-emerald-600 mt-1 font-semibold">Status: ${state.payroll.length > 0 ? state.payroll[0].status : 'Pending'}</p>
          </div>
        </div>

        <!-- Tasks and Announcements -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="bg-white p-6 rounded-2xl border border-[#E8D9D5] shadow-sm">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-bold text-lg text-[#52121D]">My Deliverables & Tasks</h3>
              <button id="add-self-task-btn" class="text-xs font-semibold text-[#851C2C] hover:underline">+ New Task</button>
            </div>
            <div class="space-y-3">
              ${state.tasks.slice(0, 4).map(t => `
                <div class="p-3.5 rounded-xl border border-[#E8D9D5] bg-[#FAF6F4] flex items-center justify-between gap-3">
                  <div>
                    <span class="text-xs font-bold px-2 py-0.5 rounded-md ${
                      t.priority === 'HIGH' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'
                    }">${t.priority}</span>
                    <h4 class="font-bold text-sm text-[#241417] mt-1">${t.title}</h4>
                    <p class="text-xs text-gray-500 mt-0.5">Due: ${t.dueDate}</p>
                  </div>
                  <select class="text-xs font-bold py-1.5 px-2.5 rounded-lg border border-[#E8D9D5] bg-white task-status-select" data-id="${t.id}">
                    <option value="TO_DO" ${t.status === 'TO_DO' ? 'selected' : ''}>To Do</option>
                    <option value="IN_PROGRESS" ${t.status === 'IN_PROGRESS' ? 'selected' : ''}>In Progress</option>
                    <option value="COMPLETED" ${t.status === 'COMPLETED' ? 'selected' : ''}>Completed</option>
                  </select>
                </div>
              `).join('') || '<p class="text-sm text-gray-400 py-4 text-center">No tasks assigned.</p>'}
            </div>
          </div>

          <div class="bg-white p-6 rounded-2xl border border-[#E8D9D5] shadow-sm">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-bold text-lg text-[#3D1E16]">Zoogle India Announcements</h3>
              <span class="text-xs text-gray-400">Internal Feed</span>
            </div>
            <div class="space-y-3">
              ${state.notices.slice(0, 3).map(n => `
                <div class="p-3.5 rounded-xl border ${n.pinned ? 'bg-[#FAF2F3] border-[#BD3449]/40' : 'bg-[#FAF6F4] border-[#E8D9D5]'}">
                  <span class="text-xs font-bold uppercase tracking-wider ${n.pinned ? 'text-[#851C2C]' : 'text-gray-600'}">
                    ${n.category} ${n.pinned ? '📌' : ''}
                  </span>
                  <h4 class="font-bold text-sm text-[#241417] mt-1">${n.title}</h4>
                  <p class="text-xs text-gray-600 mt-1 line-clamp-2">${n.content}</p>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('desk-open-qr-scanner-btn')?.addEventListener('click', openQrScannerModal);
    document.getElementById('add-self-task-btn')?.addEventListener('click', openAddTaskModal);

    container.querySelectorAll('.task-status-select').forEach(sel => {
      sel.addEventListener('change', async (e) => {
        try {
          await api(`/tasks/${sel.dataset.id}`, 'PUT', { status: e.target.value });
          showToast('Task updated!');
          await loadEmployeeData();
        } catch (err) {}
      });
    });
  }

  function startLiveClocks() {
    clearInterval(state.clockTimerInterval);
    state.clockTimerInterval = setInterval(() => {
      // Periodic refresh of status if needed
    }, 5000);
  }

  // Employee: Attendance History
  function renderEmployeeAttendance(container) {
    container.innerHTML = `
      <div class="space-y-6">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-2xl font-black text-[#52121D]">My QR Attendance History</h2>
            <p class="text-xs text-gray-500">Record of entrance gate scans, check-ins, and shift hours</p>
          </div>
          <button id="att-open-scanner-btn" class="btn-primary-maroon text-sm py-2 px-4 flex items-center gap-2">
            <span>📷 Scan Office QR</span>
          </button>
        </div>

        <div class="bg-white rounded-2xl border border-[#E8D9D5] shadow-sm overflow-hidden">
          <div class="overflow-x-auto">
            <table class="zoogle-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Clock In</th>
                  <th>Clock Out</th>
                  <th>Hours</th>
                  <th>Status</th>
                  <th>Scan Verification</th>
                </tr>
              </thead>
              <tbody>
                ${state.attendance.map(a => `
                  <tr>
                    <td><span class="font-bold text-sm text-[#241417]">${a.date}</span></td>
                    <td><span class="text-xs font-semibold text-emerald-700">${a.clockIn || '-'}</span></td>
                    <td><span class="text-xs font-semibold text-amber-800">${a.clockOut || '-'}</span></td>
                    <td><span class="text-xs font-bold text-[#52121D]">${a.workHours > 0 ? a.workHours + ' hrs' : '-'}</span></td>
                    <td>
                      <span class="badge ${a.status === 'Present' ? 'badge-present' : (a.status === 'Late' ? 'badge-late' : 'badge-absent')}">
                        ${a.status}
                      </span>
                    </td>
                    <td><span class="text-xs text-gray-600">${a.notes || 'Office QR Verified'}</span></td>
                  </tr>
                `).join('') || '<tr><td colspan="6" class="text-center py-8 text-gray-400">No punch records found.</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    document.getElementById('att-open-scanner-btn')?.addEventListener('click', openQrScannerModal);
  }

  // Employee: Leaves
  function renderEmployeeLeaves(container) {
    container.innerHTML = `
      <div class="space-y-6">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-2xl font-black text-[#52121D]">My Leave Requests</h2>
            <p class="text-xs text-gray-500">Apply for time-off and track approval status</p>
          </div>
          <button id="apply-leave-btn" class="btn-primary-brown text-sm py-2.5 px-5">
            <span>+ Apply for Leave</span>
          </button>
        </div>

        <div class="bg-white rounded-2xl border border-[#E8D9D5] shadow-sm overflow-hidden">
          <div class="overflow-x-auto">
            <table class="zoogle-table">
              <thead>
                <tr>
                  <th>Leave Type</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Days</th>
                  <th>Reason</th>
                  <th>Applied On</th>
                  <th>Status</th>
                  <th>Reviewer Feedback</th>
                </tr>
              </thead>
              <tbody>
                ${state.leaves.map(l => `
                  <tr>
                    <td><span class="badge badge-maroon">${l.leaveType}</span></td>
                    <td><span class="text-xs text-gray-700 font-medium">${l.startDate}</span></td>
                    <td><span class="text-xs text-gray-700 font-medium">${l.endDate}</span></td>
                    <td><span class="text-xs font-bold text-[#52121D]">${l.days} Days</span></td>
                    <td><span class="text-xs text-gray-600 italic">${l.reason}</span></td>
                    <td><span class="text-xs text-gray-400">${l.appliedAt}</span></td>
                    <td>
                      <span class="badge ${l.status === 'APPROVED' ? 'badge-approved' : (l.status === 'PENDING' ? 'badge-pending' : 'badge-rejected')}">
                        ${l.status}
                      </span>
                    </td>
                    <td><span class="text-xs text-gray-600 font-semibold">${l.reviewComment || '-'}</span></td>
                  </tr>
                `).join('') || '<tr><td colspan="8" class="text-center py-8 text-gray-400">No leave applications found.</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    document.getElementById('apply-leave-btn')?.addEventListener('click', openApplyLeaveModal);
  }

  // Employee: Payslips
  function renderEmployeePayslips(container) {
    container.innerHTML = `
      <div class="space-y-6">
        <div>
          <h2 class="text-2xl font-black text-[#52121D]">My Monthly Payslips (₹ INR)</h2>
          <p class="text-xs text-gray-500">Salary slips with Indian tax deductions (TDS & EPF)</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${state.payroll.map(p => `
            <div class="bg-white rounded-2xl border border-[#E8D9D5] p-6 shadow-sm hover:shadow-md transition">
              <div class="flex items-start justify-between">
                <div>
                  <span class="text-xs font-bold px-2 py-0.5 rounded-md bg-[#FAF2F3] text-[#851C2C]">${p.slipNumber}</span>
                  <h3 class="text-lg font-bold text-[#241417] mt-2">${p.monthYear}</h3>
                </div>
                <span class="badge ${p.status === 'PAID' ? 'badge-approved' : 'badge-pending'}">${p.status}</span>
              </div>
              <div class="mt-4 pt-4 border-t border-[#F0E6E2] space-y-2 text-xs">
                <div class="flex justify-between">
                  <span class="text-gray-500">Basic Pay:</span>
                  <span class="font-bold text-gray-800">₹${Number(p.basicSalary).toLocaleString('en-IN')}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-500">HRA & Allowances:</span>
                  <span class="font-bold text-emerald-700">+₹${Number(p.allowances).toLocaleString('en-IN')}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-500">TDS & EPF:</span>
                  <span class="font-bold text-rose-700">-₹${(Number(p.deductions) + Number(p.tax)).toLocaleString('en-IN')}</span>
                </div>
                <div class="flex justify-between pt-2 border-t border-gray-100 text-sm">
                  <span class="font-bold text-[#52121D]">Net Disbursed:</span>
                  <span class="font-black text-[#52121D]">₹${Number(p.netSalary).toLocaleString('en-IN')}</span>
                </div>
              </div>
              <button class="mt-5 w-full btn-gold-outline text-xs justify-center view-payslip-btn" data-id="${p.id}">
                <span>View / Print Payslip 📄</span>
              </button>
            </div>
          `).join('') || '<p class="text-sm text-gray-400 py-8 text-center col-span-3">No payslip generated yet.</p>'}
        </div>
      </div>
    `;

    container.querySelectorAll('.view-payslip-btn').forEach(b => {
      b.addEventListener('click', () => openPayslipModal(b.dataset.id));
    });
  }

  // Employee: Tasks
  function renderEmployeeTasks(container) {
    container.innerHTML = `
      <div class="space-y-6">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-2xl font-black text-[#52121D]">My Deliverables & Tasks</h2>
            <p class="text-xs text-gray-500">Manage sprint tasks, deliverables, and update progress</p>
          </div>
          <button id="add-task-btn" class="btn-primary-brown text-sm py-2.5 px-5">
            <span>+ Create Task</span>
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-gray-100/60 p-4 rounded-2xl border border-gray-200 flex flex-col">
            <h3 class="font-bold text-sm text-gray-700 uppercase tracking-wider mb-3">To Do (${state.tasks.filter(t => t.status === 'TO_DO').length})</h3>
            <div class="space-y-3 flex-1">
              ${renderTaskListByStatus('TO_DO')}
            </div>
          </div>

          <div class="bg-amber-50/60 p-4 rounded-2xl border border-amber-200/60 flex flex-col">
            <h3 class="font-bold text-sm text-amber-800 uppercase tracking-wider mb-3">In Progress (${state.tasks.filter(t => t.status === 'IN_PROGRESS').length})</h3>
            <div class="space-y-3 flex-1">
              ${renderTaskListByStatus('IN_PROGRESS')}
            </div>
          </div>

          <div class="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200/60 flex flex-col">
            <h3 class="font-bold text-sm text-emerald-800 uppercase tracking-wider mb-3">Completed (${state.tasks.filter(t => t.status === 'COMPLETED').length})</h3>
            <div class="space-y-3 flex-1">
              ${renderTaskListByStatus('COMPLETED')}
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('add-task-btn')?.addEventListener('click', openAddTaskModal);
    container.querySelectorAll('.task-status-btn').forEach(b => {
      b.addEventListener('click', async () => {
        try {
          await api(`/tasks/${b.dataset.id}`, 'PUT', { status: b.dataset.status });
          showToast(`Task moved to ${b.dataset.status.replace('_', ' ')}!`);
          await loadEmployeeData();
          renderEmployeeTasks(container);
        } catch (e) {}
      });
    });
  }

  function renderTaskListByStatus(status) {
    const list = state.tasks.filter(t => t.status === status);
    if (list.length === 0) return '<div class="text-xs text-gray-400 py-6 text-center">Empty column</div>';
    return list.map(t => `
      <div class="bg-white p-4 rounded-xl border border-[#E8D9D5] shadow-sm">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold px-2 py-0.5 rounded ${
            t.priority === 'HIGH' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'
          }">${t.priority}</span>
          <span class="text-xs text-gray-400">Due ${t.dueDate}</span>
        </div>
        <h4 class="font-bold text-sm text-[#241417] mt-2">${t.title}</h4>
        <p class="text-xs text-gray-600 mt-1 line-clamp-2">${t.description || ''}</p>
        <div class="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
          ${status !== 'IN_PROGRESS' ? `
            <button class="text-amber-700 font-semibold hover:underline task-status-btn" data-id="${t.id}" data-status="IN_PROGRESS">→ In Progress</button>
          ` : ''}
          ${status !== 'COMPLETED' ? `
            <button class="text-emerald-700 font-semibold hover:underline task-status-btn" data-id="${t.id}" data-status="COMPLETED">✓ Complete</button>
          ` : ''}
        </div>
      </div>
    `).join('');
  }

  // Employee: Notices
  function renderEmployeeNotices(container) {
    container.innerHTML = `
      <div class="space-y-6">
        <div>
          <h2 class="text-2xl font-black text-[#52121D]">Company Notice Board</h2>
          <p class="text-xs text-gray-500">Official memos, festival announcements and events from Zoogle India leadership</p>
        </div>

        <div class="space-y-4">
          ${state.notices.map(n => `
            <div class="bg-white rounded-2xl border ${n.pinned ? 'border-[#BD3449]/50 shadow-md' : 'border-[#E8D9D5]'} p-6 shadow-sm">
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                  n.pinned ? 'bg-[#52121D] text-[#E6C280]' : 'bg-[#FAF6F4] text-[#663324]'
                }">
                  ${n.category} ${n.pinned ? '★ Pinned Announcement' : ''}
                </span>
                <span class="text-xs text-gray-400">${n.createdAt} • By ${n.author}</span>
              </div>
              <h3 class="text-lg font-bold text-[#241417] mt-2">${n.title}</h3>
              <p class="text-sm text-gray-600 mt-2 leading-relaxed">${n.content}</p>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // Employee: Profile
  function renderEmployeeProfile(container) {
    const emp = state.currentEmployee || {};
    container.innerHTML = `
      <div class="space-y-6 max-w-3xl">
        <div>
          <h2 class="text-2xl font-black text-[#52121D]">My Professional Profile</h2>
          <p class="text-xs text-gray-500">Personal information, technical skills and contact details</p>
        </div>

        <form id="employee-profile-form" class="bg-white rounded-2xl border border-[#E8D9D5] p-6 shadow-sm space-y-5">
          <div class="flex items-center gap-4 pb-4 border-b border-[#F0E6E2]">
            <img src="${emp.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}" class="w-16 h-16 rounded-2xl object-cover border border-[#E8D9D5]">
            <div>
              <h3 class="font-bold text-lg text-[#241417]">${getEmpFullName(emp)}</h3>
              <p class="text-xs text-gray-500">${emp.designation} • ${emp.department}</p>
              <span class="text-xs font-mono text-[#851C2C] font-bold">${emp.empCode}</span>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1">Email (Official)</label>
              <input type="email" value="${emp.email}" disabled class="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50 text-xs text-gray-500">
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1">Phone Number</label>
              <input type="text" id="prof-phone" value="${emp.phone || ''}" class="w-full p-2.5 rounded-xl border border-[#E8D9D5] text-xs focus:outline-none focus:border-[#851C2C]">
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-700 mb-1">Residential Address</label>
            <input type="text" id="prof-address" value="${emp.address || ''}" class="w-full p-2.5 rounded-xl border border-[#E8D9D5] text-xs focus:outline-none focus:border-[#851C2C]">
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-700 mb-1">Emergency Contact Information</label>
            <input type="text" id="prof-emergency" value="${emp.emergencyContact || ''}" class="w-full p-2.5 rounded-xl border border-[#E8D9D5] text-xs focus:outline-none focus:border-[#851C2C]">
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-700 mb-1">Professional Bio</label>
            <textarea id="prof-bio" rows="2" class="w-full p-2.5 rounded-xl border border-[#E8D9D5] text-xs focus:outline-none focus:border-[#851C2C]">${emp.bio || ''}</textarea>
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-700 mb-1">Skills & Technical Competencies</label>
            <input type="text" id="prof-skills" value="${emp.skills || ''}" class="w-full p-2.5 rounded-xl border border-[#E8D9D5] text-xs focus:outline-none focus:border-[#851C2C]" placeholder="e.g. Java, Spring, React, SQL, Cloud">
          </div>

          <div class="pt-3">
            <button type="submit" class="btn-primary-brown text-sm py-2.5 px-6">
              Save Profile Changes
            </button>
          </div>
        </form>
      </div>
    `;

    document.getElementById('employee-profile-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        const updated = {
          ...emp,
          phone: document.getElementById('prof-phone').value,
          address: document.getElementById('prof-address').value,
          emergencyContact: document.getElementById('prof-emergency').value,
          bio: document.getElementById('prof-bio').value,
          skills: document.getElementById('prof-skills').value
        };
        await api(`/employees/${emp.id}`, 'PUT', updated);
        showToast('Your profile has been updated!');
        await loadEmployeeData();
      } catch (err) {}
    });
  }

  // ================= 7. MODALS LOGIC =================
  function openModal(htmlContent) {
    let modal = document.getElementById('app-modal-container');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'app-modal-container';
      modal.className = 'zoogle-modal';
      document.body.appendChild(modal);
    }
    modal.innerHTML = `
      <div class="zoogle-modal-content relative p-6">
        <button id="modal-close-btn" class="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-lg font-bold">✕</button>
        ${htmlContent}
      </div>
    `;
    modal.classList.add('active-modal');
    document.getElementById('modal-close-btn')?.addEventListener('click', closeModal);
    modal.onclick = (e) => {
      if (e.target === modal) closeModal();
    };
  }

  function closeModal() {
    stopCameraStream();
    const modal = document.getElementById('app-modal-container');
    if (modal) modal.classList.remove('active-modal');
  }

  // Modal: Add Employee
  function openAddEmployeeModal() {
    const depts = state.departments;
    openModal(`
      <h3 class="text-xl font-bold text-[#52121D] mb-4">Add New Employee</h3>
      <form id="add-employee-form" class="space-y-4 text-xs">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold mb-1">First Name</label>
            <input type="text" id="new-emp-first" required placeholder="e.g. Pooja" class="w-full p-2.5 rounded-lg border border-gray-300">
          </div>
          <div>
            <label class="block font-bold mb-1">Last Name</label>
            <input type="text" id="new-emp-last" required placeholder="e.g. Sharma" class="w-full p-2.5 rounded-lg border border-gray-300">
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold mb-1">Email Address</label>
            <input type="email" id="new-emp-email" required placeholder="pooja.sharma@zoogle.in" class="w-full p-2.5 rounded-lg border border-gray-300">
          </div>
          <div>
            <label class="block font-bold mb-1">Phone (+91)</label>
            <input type="text" id="new-emp-phone" required placeholder="+91 98201 55443" class="w-full p-2.5 rounded-lg border border-gray-300">
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold mb-1">Department</label>
            <select id="new-emp-dept" class="w-full p-2.5 rounded-lg border border-gray-300">
              ${depts.map(d => `<option value="${d.name}">${d.name}</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="block font-bold mb-1">Designation</label>
            <input type="text" id="new-emp-title" required placeholder="UI/UX Architect" class="w-full p-2.5 rounded-lg border border-gray-300">
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold mb-1">Annual CTC (₹)</label>
            <input type="number" id="new-emp-salary" required value="1600000" class="w-full p-2.5 rounded-lg border border-gray-300">
          </div>
          <div>
            <label class="block font-bold mb-1">Joining Date</label>
            <input type="date" id="new-emp-date" required value="${getTodayDateStr()}" class="w-full p-2.5 rounded-lg border border-gray-300">
          </div>
        </div>

        <div>
          <label class="block font-bold mb-1">Residential Address</label>
          <input type="text" id="new-emp-addr" placeholder="Bangalore, Karnataka" class="w-full p-2.5 rounded-lg border border-gray-300">
        </div>

        <div class="pt-3 flex justify-end gap-2">
          <button type="button" onclick="App.closeModal()" class="px-4 py-2 border rounded-lg">Cancel</button>
          <button type="submit" class="btn-primary-maroon px-5 py-2">Create Record</button>
        </div>
      </form>
    `);

    document.getElementById('add-employee-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        const emp = {
          firstName: document.getElementById('new-emp-first').value,
          lastName: document.getElementById('new-emp-last').value,
          email: document.getElementById('new-emp-email').value,
          phone: document.getElementById('new-emp-phone').value,
          department: document.getElementById('new-emp-dept').value,
          designation: document.getElementById('new-emp-title').value,
          salary: parseFloat(document.getElementById('new-emp-salary').value),
          joiningDate: document.getElementById('new-emp-date').value,
          address: document.getElementById('new-emp-addr').value,
          status: 'Active',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
        };
        await api('/employees', 'POST', emp);
        showToast('New employee added successfully!');
        closeModal();
        await loadAdminData();
        renderAdminSection('employees');
      } catch (err) {}
    });
  }

  // Modal: Edit Employee
  function openEditEmployeeModal(id) {
    const emp = state.employees.find(e => e.id === id);
    if (!emp) return;
    const depts = state.departments;

    openModal(`
      <h3 class="text-xl font-bold text-[#52121D] mb-4">Edit Employee: ${getEmpFullName(emp)}</h3>
      <form id="edit-employee-form" class="space-y-4 text-xs">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold mb-1">First Name</label>
            <input type="text" id="edit-emp-first" value="${emp.firstName}" required class="w-full p-2.5 rounded-lg border border-gray-300">
          </div>
          <div>
            <label class="block font-bold mb-1">Last Name</label>
            <input type="text" id="edit-emp-last" value="${emp.lastName}" required class="w-full p-2.5 rounded-lg border border-gray-300">
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold mb-1">Email</label>
            <input type="email" id="edit-emp-email" value="${emp.email}" required class="w-full p-2.5 rounded-lg border border-gray-300">
          </div>
          <div>
            <label class="block font-bold mb-1">Phone</label>
            <input type="text" id="edit-emp-phone" value="${emp.phone}" required class="w-full p-2.5 rounded-lg border border-gray-300">
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold mb-1">Department</label>
            <select id="edit-emp-dept" class="w-full p-2.5 rounded-lg border border-gray-300">
              ${depts.map(d => `<option value="${d.name}" ${d.name === emp.department ? 'selected' : ''}>${d.name}</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="block font-bold mb-1">Designation</label>
            <input type="text" id="edit-emp-title" value="${emp.designation}" required class="w-full p-2.5 rounded-lg border border-gray-300">
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold mb-1">Annual CTC (₹)</label>
            <input type="number" id="edit-emp-salary" value="${emp.salary}" required class="w-full p-2.5 rounded-lg border border-gray-300">
          </div>
          <div>
            <label class="block font-bold mb-1">Status</label>
            <select id="edit-emp-status" class="w-full p-2.5 rounded-lg border border-gray-300">
              <option value="Active" ${emp.status === 'Active' ? 'selected' : ''}>Active</option>
              <option value="On Leave" ${emp.status === 'On Leave' ? 'selected' : ''}>On Leave</option>
              <option value="Terminated" ${emp.status === 'Terminated' ? 'selected' : ''}>Terminated</option>
            </select>
          </div>
        </div>

        <div class="pt-3 flex justify-end gap-2">
          <button type="button" onclick="App.closeModal()" class="px-4 py-2 border rounded-lg">Cancel</button>
          <button type="submit" class="btn-primary-maroon px-5 py-2">Save Changes</button>
        </div>
      </form>
    `);

    document.getElementById('edit-employee-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        const updated = {
          ...emp,
          firstName: document.getElementById('edit-emp-first').value,
          lastName: document.getElementById('edit-emp-last').value,
          email: document.getElementById('edit-emp-email').value,
          phone: document.getElementById('edit-emp-phone').value,
          department: document.getElementById('edit-emp-dept').value,
          designation: document.getElementById('edit-emp-title').value,
          salary: parseFloat(document.getElementById('edit-emp-salary').value),
          status: document.getElementById('edit-emp-status').value
        };
        await api(`/employees/${emp.id}`, 'PUT', updated);
        showToast('Employee updated!');
        closeModal();
        await loadAdminData();
        renderAdminSection('employees');
      } catch (err) {}
    });
  }

  // Modal: View Dossier
  function openViewEmployeeModal(id) {
    const emp = state.employees.find(e => e.id === id);
    if (!emp) return;
    openModal(`
      <div class="space-y-4">
        <div class="flex items-center gap-4 pb-4 border-b border-[#F0E6E2]">
          <img src="${emp.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}" class="w-16 h-16 rounded-2xl object-cover border border-[#E8D9D5]">
          <div>
            <span class="text-xs font-mono font-bold text-[#851C2C] bg-[#FAF2F3] px-2 py-0.5 rounded">${emp.empCode}</span>
            <h3 class="text-xl font-bold text-[#241417] mt-1">${getEmpFullName(emp)}</h3>
            <p class="text-xs text-gray-500">${emp.designation} • ${emp.department}</p>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4 text-xs">
          <div><span class="font-bold text-gray-500">Email:</span> <p class="text-gray-800 font-medium">${emp.email}</p></div>
          <div><span class="font-bold text-gray-500">Phone:</span> <p class="text-gray-800 font-medium">${emp.phone}</p></div>
          <div><span class="font-bold text-gray-500">Joining Date:</span> <p class="text-gray-800 font-medium">${emp.joiningDate}</p></div>
          <div><span class="font-bold text-gray-500">Annual CTC:</span> <p class="text-[#52121D] font-bold text-sm">₹${Number(emp.salary).toLocaleString('en-IN')}</p></div>
        </div>

        <div class="text-xs pt-2 border-t border-gray-100">
          <span class="font-bold text-gray-500">Residential Address:</span>
          <p class="text-gray-800">${emp.address || 'Not on file'}</p>
        </div>

        <div class="text-xs">
          <span class="font-bold text-gray-500">Skills:</span>
          <p class="text-[#663324] font-medium mt-0.5">${emp.skills || 'General Engineering Competencies'}</p>
        </div>

        <div class="pt-4 text-right">
          <button onclick="App.closeModal()" class="btn-primary-maroon text-xs py-2 px-5">Close</button>
        </div>
      </div>
    `);
  }

  async function confirmDeleteEmployee(id) {
    const emp = state.employees.find(e => e.id === id);
    if (!emp) return;
    if (!confirm(`Delete employee record: ${getEmpFullName(emp)} (${emp.empCode})?`)) return;
    try {
      await api(`/employees/${id}`, 'DELETE');
      showToast('Employee deleted.');
      await loadAdminData();
      renderAdminSection('employees');
    } catch (e) {}
  }

  // Modal: Add Department
  function openAddDeptModal() {
    openModal(`
      <h3 class="text-xl font-bold text-[#52121D] mb-4">Add Department</h3>
      <form id="add-dept-form" class="space-y-4 text-xs">
        <div>
          <label class="block font-bold mb-1">Department Name</label>
          <input type="text" id="dept-name" required placeholder="e.g. Legal & Compliance" class="w-full p-2.5 rounded-lg border border-gray-300">
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold mb-1">Code</label>
            <input type="text" id="dept-code" required placeholder="LEG" class="w-full p-2.5 rounded-lg border border-gray-300">
          </div>
          <div>
            <label class="block font-bold mb-1">Head of Dept</label>
            <input type="text" id="dept-head" required placeholder="e.g. Vikramaditya" class="w-full p-2.5 rounded-lg border border-gray-300">
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold mb-1">Annual Budget (₹)</label>
            <input type="number" id="dept-budget" required value="3500000" class="w-full p-2.5 rounded-lg border border-gray-300">
          </div>
          <div>
            <label class="block font-bold mb-1">Location Room</label>
            <input type="text" id="dept-room" placeholder="Floor 3 - Suite 308 (Bangalore)" class="w-full p-2.5 rounded-lg border border-gray-300">
          </div>
        </div>
        <div class="pt-3 flex justify-end gap-2">
          <button type="button" onclick="App.closeModal()" class="px-4 py-2 border rounded-lg">Cancel</button>
          <button type="submit" class="btn-primary-maroon px-5 py-2">Create Department</button>
        </div>
      </form>
    `);

    document.getElementById('add-dept-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        await api('/departments', 'POST', {
          name: document.getElementById('dept-name').value,
          code: document.getElementById('dept-code').value,
          headOfDept: document.getElementById('dept-head').value,
          budget: parseFloat(document.getElementById('dept-budget').value),
          roomNumber: document.getElementById('dept-room').value
        });
        showToast('Department created!');
        closeModal();
        await loadAdminData();
        renderAdminSection('departments');
      } catch (err) {}
    });
  }

  // Modal: View / Print Payslip
  function openPayslipModal(id) {
    const p = state.payroll.find(x => x.id === id);
    if (!p) return;
    openModal(`
      <div class="payslip-sheet">
        <div class="flex items-start justify-between pb-4 border-b-2 border-[#52121D]">
          <div>
            <h2 class="text-2xl font-black text-[#52121D] tracking-tight">ZOOGLE INDIA PVT. LTD.</h2>
            <p class="text-xs text-gray-600">Enterprise Technology Headquarters</p>
            <p class="text-xs text-gray-500">Tech Bay 4, Whitefield, Bangalore, Karnataka</p>
          </div>
          <div class="text-right">
            <span class="text-xs font-mono font-bold bg-[#FAF2F3] text-[#851C2C] px-3 py-1 rounded-md border border-[#BD3449]/30">${p.slipNumber}</span>
            <p class="text-xs font-bold text-gray-800 mt-2">PAYSLIP: ${p.monthYear.toUpperCase()}</p>
            <p class="text-xs text-gray-500">Disbursement: <span class="font-bold text-emerald-700">${p.status}</span></p>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4 py-4 text-xs border-b border-gray-200">
          <div><span class="font-bold text-gray-500">Employee Name:</span> <p class="font-bold text-sm text-[#241417]">${p.empName || getEmpNameById(p.employeeId)}</p></div>
          <div><span class="font-bold text-gray-500">Employee ID:</span> <p class="font-bold text-sm text-[#851C2C]">${p.employeeId}</p></div>
          <div><span class="font-bold text-gray-500">Date:</span> <p class="text-gray-800">${p.paymentDate || 'Pending Cycle'}</p></div>
          <div><span class="font-bold text-gray-500">Bank Transfer:</span> <p class="text-gray-800">NEFT / RTGS Corporate Salary Account</p></div>
        </div>

        <div class="py-4 text-xs space-y-2 border-b-2 border-gray-200">
          <div class="flex justify-between py-1">
            <span class="font-medium text-gray-700">Monthly Basic Salary:</span>
            <span class="font-bold text-gray-900">₹${Number(p.basicSalary).toLocaleString('en-IN')}</span>
          </div>
          <div class="flex justify-between py-1">
            <span class="font-medium text-emerald-700">HRA & Special Allowances:</span>
            <span class="font-bold text-emerald-700">+₹${Number(p.allowances).toLocaleString('en-IN')}</span>
          </div>
          <div class="flex justify-between py-1">
            <span class="font-medium text-rose-700">TDS (Income Tax Withholding):</span>
            <span class="font-bold text-rose-700">-₹${Number(p.tax).toLocaleString('en-IN')}</span>
          </div>
          <div class="flex justify-between py-1">
            <span class="font-medium text-rose-700">EPF (Employee Provident Fund):</span>
            <span class="font-bold text-rose-700">-₹${Number(p.deductions).toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div class="flex items-center justify-between pt-4 pb-2">
          <div>
            <p class="text-xs font-bold text-gray-500 uppercase">Total Net Take-Home</p>
            <p class="text-xs text-gray-400">Credited to primary employee bank account</p>
          </div>
          <h3 class="text-2xl font-black text-[#52121D]">₹${Number(p.netSalary).toLocaleString('en-IN')}</h3>
        </div>

        <div class="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
          <span class="text-xs text-gray-400 italic">Digitally signed payroll certificate.</span>
          <div class="flex gap-2">
            <button onclick="window.print()" class="btn-gold-outline text-xs">Print Statement 🖨️</button>
            <button onclick="App.closeModal()" class="btn-primary-maroon text-xs py-2 px-4">Done</button>
          </div>
        </div>
      </div>
    `);
  }

  // Modal: Apply Leave
  function openApplyLeaveModal() {
    openModal(`
      <h3 class="text-xl font-bold text-[#52121D] mb-4">Submit Leave Application</h3>
      <form id="apply-leave-form" class="space-y-4 text-xs">
        <div>
          <label class="block font-bold mb-1">Leave Category</label>
          <select id="leave-type-input" class="w-full p-2.5 rounded-lg border border-gray-300">
            <option value="Casual">Casual Leave (Balance: 7 Days)</option>
            <option value="Sick">Sick Leave (Balance: 8 Days)</option>
            <option value="Annual">Annual Paid Vacation</option>
            <option value="Maternity">Maternity / Paternity Leave</option>
          </select>
        </div>

        <div class="grid grid-cols-3 gap-3">
          <div>
            <label class="block font-bold mb-1">From Date</label>
            <input type="date" id="leave-from-date" required class="w-full p-2.5 rounded-lg border border-gray-300">
          </div>
          <div>
            <label class="block font-bold mb-1">To Date</label>
            <input type="date" id="leave-to-date" required class="w-full p-2.5 rounded-lg border border-gray-300">
          </div>
          <div>
            <label class="block font-bold mb-1">Total Days</label>
            <input type="number" id="leave-days-count" min="1" max="30" value="2" required class="w-full p-2.5 rounded-lg border border-gray-300">
          </div>
        </div>

        <div>
          <label class="block font-bold mb-1">Reason for Leave</label>
          <textarea id="leave-reason-text" rows="3" required placeholder="Purpose of leave..." class="w-full p-2.5 rounded-lg border border-gray-300"></textarea>
        </div>

        <div class="pt-3 flex justify-end gap-2">
          <button type="button" onclick="App.closeModal()" class="px-4 py-2 border rounded-lg">Cancel</button>
          <button type="submit" class="btn-primary-brown px-5 py-2">Submit</button>
        </div>
      </form>
    `);

    document.getElementById('apply-leave-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        await api('/leaves', 'POST', {
          employeeId: state.currentUser.employeeId,
          leaveType: document.getElementById('leave-type-input').value,
          startDate: document.getElementById('leave-from-date').value,
          endDate: document.getElementById('leave-to-date').value,
          days: parseInt(document.getElementById('leave-days-count').value),
          reason: document.getElementById('leave-reason-text').value
        });
        showToast('Leave request submitted to administration!');
        closeModal();
        await loadEmployeeData();
        renderEmployeeSection('my-leaves');
      } catch (err) {}
    });
  }

  // Modal: Add Task
  function openAddTaskModal() {
    openModal(`
      <h3 class="text-xl font-bold text-[#52121D] mb-4">Create New Task</h3>
      <form id="create-task-form" class="space-y-4 text-xs">
        <div>
          <label class="block font-bold mb-1">Task Title</label>
          <input type="text" id="task-title-input" required placeholder="e.g. UPI Reconciliation Engine" class="w-full p-2.5 rounded-lg border border-gray-300">
        </div>
        <div>
          <label class="block font-bold mb-1">Description</label>
          <textarea id="task-desc-input" rows="2" placeholder="Acceptance criteria..." class="w-full p-2.5 rounded-lg border border-gray-300"></textarea>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold mb-1">Priority</label>
            <select id="task-priority-input" class="w-full p-2.5 rounded-lg border border-gray-300">
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM" selected>Medium Priority</option>
              <option value="LOW">Low Priority</option>
            </select>
          </div>
          <div>
            <label class="block font-bold mb-1">Due Date</label>
            <input type="date" id="task-due-input" required value="${getTodayDateStr()}" class="w-full p-2.5 rounded-lg border border-gray-300">
          </div>
        </div>
        <div class="pt-3 flex justify-end gap-2">
          <button type="button" onclick="App.closeModal()" class="px-4 py-2 border rounded-lg">Cancel</button>
          <button type="submit" class="btn-primary-brown px-5 py-2">Create Task</button>
        </div>
      </form>
    `);

    document.getElementById('create-task-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        await api('/tasks', 'POST', {
          employeeId: state.currentUser.employeeId,
          title: document.getElementById('task-title-input').value,
          description: document.getElementById('task-desc-input').value,
          priority: document.getElementById('task-priority-input').value,
          dueDate: document.getElementById('task-due-input').value
        });
        showToast('Task created!');
        closeModal();
        await loadEmployeeData();
        renderEmployeeDesk(document.getElementById('employee-section-content'));
      } catch (err) {}
    });
  }

  // Modal: Add Notice
  function openAddNoticeModal() {
    openModal(`
      <h3 class="text-xl font-bold text-[#52121D] mb-4">Publish Corporate Notice</h3>
      <form id="create-notice-form" class="space-y-4 text-xs">
        <div>
          <label class="block font-bold mb-1">Notice Title</label>
          <input type="text" id="notice-title-input" required placeholder="Announcement title..." class="w-full p-2.5 rounded-lg border border-gray-300">
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold mb-1">Category</label>
            <select id="notice-cat-input" class="w-full p-2.5 rounded-lg border border-gray-300">
              <option value="General">General</option>
              <option value="Urgent">Urgent Alert</option>
              <option value="Policy">Policy Update</option>
              <option value="Event">Festive / Event</option>
            </select>
          </div>
          <div class="flex items-center gap-2 pt-5">
            <input type="checkbox" id="notice-pinned-input" class="w-4 h-4">
            <label for="notice-pinned-input" class="font-bold">Pin to Top 📌</label>
          </div>
        </div>
        <div>
          <label class="block font-bold mb-1">Content</label>
          <textarea id="notice-content-input" rows="4" required placeholder="Announcement details..." class="w-full p-2.5 rounded-lg border border-gray-300"></textarea>
        </div>
        <div class="pt-3 flex justify-end gap-2">
          <button type="button" onclick="App.closeModal()" class="px-4 py-2 border rounded-lg">Cancel</button>
          <button type="submit" class="btn-primary-maroon px-5 py-2">Publish</button>
        </div>
      </form>
    `);

    document.getElementById('create-notice-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        await api('/notices', 'POST', {
          title: document.getElementById('notice-title-input').value,
          category: document.getElementById('notice-cat-input').value,
          content: document.getElementById('notice-content-input').value,
          author: state.currentUser.fullName,
          pinned: document.getElementById('notice-pinned-input').checked
        });
        showToast('Notice published!');
        closeModal();
        await loadAdminData();
        renderAdminSection('notices');
      } catch (err) {}
    });
  }

  // Modal: Add Performance Review
  function openAddReviewModal() {
    const emps = state.employees;
    openModal(`
      <h3 class="text-xl font-bold text-[#52121D] mb-4">Add Appraisal</h3>
      <form id="create-review-form" class="space-y-4 text-xs">
        <div>
          <label class="block font-bold mb-1">Employee</label>
          <select id="review-emp-select" class="w-full p-2.5 rounded-lg border border-gray-300">
            ${emps.map(e => `<option value="${e.id}">${e.fullName} (${e.empCode} - ${e.department})</option>`).join('')}
          </select>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold mb-1">Period</label>
            <input type="text" id="review-period-input" value="Q3 2026" required class="w-full p-2.5 rounded-lg border border-gray-300">
          </div>
          <div>
            <label class="block font-bold mb-1">Rating</label>
            <select id="review-rating-select" class="w-full p-2.5 rounded-lg border border-gray-300">
              <option value="5">★★★★★ (5 Stars - Exceptional)</option>
              <option value="4" selected>★★★★☆ (4 Stars - Exceeds Expectations)</option>
              <option value="3">★★★☆☆ (3 Stars - Meets Standards)</option>
              <option value="2">★★☆☆☆ (2 Stars - Needs Improvement)</option>
              <option value="1">★☆☆☆☆ (1 Star - Unsatisfactory)</option>
            </select>
          </div>
        </div>
        <div>
          <label class="block font-bold mb-1">Milestones Accomplished</label>
          <textarea id="review-goals-input" rows="2" class="w-full p-2.5 rounded-lg border border-gray-300" placeholder="Specific project deliveries..."></textarea>
        </div>
        <div>
          <label class="block font-bold mb-1">Feedback</label>
          <textarea id="review-feedback-input" rows="3" required class="w-full p-2.5 rounded-lg border border-gray-300" placeholder="Manager comments..."></textarea>
        </div>
        <div class="pt-3 flex justify-end gap-2">
          <button type="button" onclick="App.closeModal()" class="px-4 py-2 border rounded-lg">Cancel</button>
          <button type="submit" class="btn-primary-maroon px-5 py-2">Save Review</button>
        </div>
      </form>
    `);

    document.getElementById('create-review-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        await api('/performance', 'POST', {
          employeeId: document.getElementById('review-emp-select').value,
          reviewPeriod: document.getElementById('review-period-input').value,
          rating: parseInt(document.getElementById('review-rating-select').value),
          goalsMet: document.getElementById('review-goals-input').value,
          feedback: document.getElementById('review-feedback-input').value,
          reviewer: state.currentUser.fullName
        });
        showToast('Appraisal saved!');
        closeModal();
        await loadAdminData();
        renderAdminSection('performance');
      } catch (err) {}
    });
  }

  function getTodayDateStr() {
    return new Date().toISOString().split('T')[0];
  }

  function init() {
    const saved = localStorage.getItem('zoogle_user');
    if (saved) {
      try {
        state.currentUser = JSON.parse(saved);
        state.currentRole = state.currentUser.role;
      } catch (e) {
        localStorage.removeItem('zoogle_user');
      }
    }

    initHeroIntro();
    initLogin();
    renderApp();
  }
  
function logout() {
  clearInterval(state.clockTimerInterval);
  state.clockTimerInterval = null;

  state.currentUser = null;
  state.currentRole = null;

  localStorage.removeItem('zoogle_user');

  const adminDashboard = document.getElementById('admin-dashboard-view');
  const employeeDashboard = document.getElementById('employee-dashboard-view');
  const authWrapper = document.getElementById('auth-view');

  if (adminDashboard) {
    adminDashboard.classList.remove('dashboard-entering');
    adminDashboard.style.display = 'none';
  }

  if (employeeDashboard) {
    employeeDashboard.classList.remove('dashboard-entering');
    employeeDashboard.style.display = 'none';
  }

  if (authWrapper) {
    authWrapper.style.display = 'flex';
    authWrapper.classList.remove('login-entering');

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        authWrapper.classList.add('login-entering');
      });
    });
  }

  showToast('Signed out safely.', 'success');
}


  return {
    init,
    closeModal,
    replayIntro,
    openQrScannerModal,
    openOfficeQrDisplayModal
  };
})();

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
