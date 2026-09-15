/* ==========================================================================
   Raigon Arts Management System - Master Application Core Script
   ========================================================================== */

class AppManager {
  constructor() {
    this.currentView = 'dashboard';
    this.sidebarCollapsed = false;
  }

  init() {
    this.initSettings();
    this.checkAuth();
    this.bindGlobalEvents();
    this.renderCurrentView();
    this.applyCustomLogo();
  }

  applyCustomLogo() {
    const logoUrl = window.RaigonStorage ? window.RaigonStorage.getCustomLogo() : 'assets/images/img2.png';
    document.querySelectorAll('.brand-icon img, .glow-icon img, #shopLogoPreview').forEach(img => {
      img.src = logoUrl;
    });
  }

  initSettings() {
    const savedTheme = localStorage.getItem('raigon_theme') || 'light';
    const savedLayout = localStorage.getItem('raigon_layout_density') || 'comfortable';
    this.toggleTheme(savedTheme, false);
    this.setLayoutDensity(savedLayout, false);
    this.updateThemeIcon();
  }

  fillDemoCredentials() {
    const email = document.getElementById('loginEmail');
    const pass = document.getElementById('loginPassword');
    if (email && pass) {
      email.value = 'admin';
      pass.value = 'raigon2026';
      if (window.RaigonToast) window.RaigonToast.show('Demo credentials loaded!', 'info');
    }
  }

  toggleTheme(theme, showToast = true) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    localStorage.setItem('raigon_theme', theme);
    if (showToast && window.RaigonToast) {
      window.RaigonToast.show(`Theme switched to ${theme === 'dark' ? 'Dark Mode' : 'Light Mode'}`, 'info');
    }
    this.updateThemeIcon();
  }

  toggleThemeMode() {
    const currentTheme = localStorage.getItem('raigon_theme') || 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    this.toggleTheme(newTheme, true);
  }

  updateThemeIcon() {
    const currentTheme = localStorage.getItem('raigon_theme') || 'light';
    const themeBtn = document.getElementById('themeToggleBtn');
    if (themeBtn) {
      const icon = themeBtn.querySelector('i');
      if (icon) {
        if (currentTheme === 'dark') {
          icon.className = 'fa-solid fa-sun';
          themeBtn.title = 'Switch to Light Mode';
        } else {
          icon.className = 'fa-solid fa-moon';
          themeBtn.title = 'Switch to Dark Mode';
        }
      }
    }
  }

  setLayoutDensity(density, showToast = true) {
    if (density === 'compact') {
      document.documentElement.classList.add('compact-layout');
    } else {
      document.documentElement.classList.remove('compact-layout');
    }
    localStorage.setItem('raigon_layout_density', density);
    if (showToast && window.RaigonToast) {
      window.RaigonToast.show(`Layout set to ${density === 'compact' ? 'Compact' : 'Comfortable'} mode`, 'info');
    }
  }

  checkAuth() {
    const auth = window.RaigonStorage.getAuth();
    const loginView = document.getElementById('loginView');
    const appContainer = document.getElementById('appContainer');

    if (auth && auth.isLoggedIn) {
      if (loginView) loginView.style.display = 'none';
      if (appContainer) appContainer.style.display = 'flex';
    } else {
      if (loginView) loginView.style.display = 'flex';
      if (appContainer) appContainer.style.display = 'none';
    }
  }

  // FORGOT PASSWORD MULTI-STEP FLOW METHODS
  showForgotPasswordForm() {
    const loginForm = document.getElementById('loginFormContent');
    const forgotForm = document.getElementById('forgotPasswordContent');
    if (loginForm && forgotForm) {
      loginForm.style.display = 'none';
      forgotForm.style.display = 'flex';
      this.goToStep1Phone();
    }
  }

  showLoginForm() {
    this.stopOTPTimer();
    const loginForm = document.getElementById('loginFormContent');
    const forgotForm = document.getElementById('forgotPasswordContent');
    if (loginForm && forgotForm) {
      forgotForm.style.display = 'none';
      loginForm.style.display = 'flex';
    }
  }

  goToStep1Phone() {
    this.stopOTPTimer();
    const s1 = document.getElementById('forgotStep1');
    const s2 = document.getElementById('forgotStep2');
    const s3 = document.getElementById('forgotStep3');
    if (s1) s1.style.display = 'block';
    if (s2) s2.style.display = 'none';
    if (s3) s3.style.display = 'none';
  }

  sendForgotPasswordOTP(e) {
    if (e) e.preventDefault();
    const phoneInput = document.getElementById('forgotPhone');
    const phone = phoneInput ? phoneInput.value.trim() : '';

    if (!phone || phone.length < 7) {
      window.RaigonToast.show('Please enter a valid registered phone number.', 'error');
      return;
    }

    const customers = window.RaigonStorage ? window.RaigonStorage.getCustomers() : [];
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const foundInCustomers = customers.some(c => c.phone && c.phone.replace(/[^0-9]/g, '').includes(cleanPhone));
    const isDefaultAdminPhone = cleanPhone.includes('8921348433') || cleanPhone.includes('9876543210') || cleanPhone.length >= 7 || phone.toLowerCase().includes('admin');

    if (!foundInCustomers && !isDefaultAdminPhone) {
      window.RaigonToast.show(`Phone number "${phone}" is not registered in database.`, 'error');
      return;
    }

    const btnSend = document.getElementById('btnSendOtp');
    if (btnSend) {
      btnSend.disabled = true;
      btnSend.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> <span>Sending OTP via WhatsApp...</span>`;
    }

    setTimeout(() => {
      if (btnSend) {
        btnSend.disabled = false;
        btnSend.innerHTML = `<i class="fa-brands fa-whatsapp"></i> <span>Send OTP via WhatsApp</span>`;
      }

      this.currentOtp = Math.floor(1000 + Math.random() * 9000).toString();
      this.registeredPhone = phone;

      window.RaigonToast.show(`💬 WhatsApp OTP sent to ${phone}! Verification Code: ${this.currentOtp}`, 'success');

      const s1 = document.getElementById('forgotStep1');
      const s2 = document.getElementById('forgotStep2');
      const displayPhone = document.getElementById('displayPhoneFormatted');
      const otpInput = document.getElementById('forgotOtpCode');

      if (s1) s1.style.display = 'none';
      if (s2) s2.style.display = 'block';
      if (displayPhone) displayPhone.innerText = phone;
      if (otpInput) {
        otpInput.value = this.currentOtp;
        otpInput.focus();
      }

      this.startOTPTimer();
    }, 600);
  }

  startOTPTimer() {
    this.stopOTPTimer();
    this.timerSeconds = 80;
    const timerDisplay = document.getElementById('otpCountdownTimer');
    const timerText = document.getElementById('otpTimerText');
    const resendBtn = document.getElementById('btnResendOtp');

    if (resendBtn) {
      resendBtn.disabled = true;
      resendBtn.style.color = '#A5A2B0';
      resendBtn.style.cursor = 'not-allowed';
    }

    const updateUI = () => {
      const mins = Math.floor(this.timerSeconds / 60).toString().padStart(2, '0');
      const secs = (this.timerSeconds % 60).toString().padStart(2, '0');
      if (timerDisplay) timerDisplay.innerText = `${mins}:${secs}`;
      if (timerText) timerText.innerHTML = `Resend code in <strong style="color: #D4BF8A;">${mins}:${secs}</strong>`;
    };

    updateUI();

    this.otpTimerInterval = setInterval(() => {
      this.timerSeconds--;
      if (this.timerSeconds <= 0) {
        this.stopOTPTimer();
        if (timerDisplay) timerDisplay.innerText = '00:00';
        if (timerText) timerText.innerText = "Didn't receive code?";
        if (resendBtn) {
          resendBtn.disabled = false;
          resendBtn.style.color = '#D4BF8A';
          resendBtn.style.cursor = 'pointer';
        }
      } else {
        updateUI();
      }
    }, 1000);
  }

  stopOTPTimer() {
    if (this.otpTimerInterval) {
      clearInterval(this.otpTimerInterval);
      this.otpTimerInterval = null;
    }
  }

  resendOTP() {
    if (this.timerSeconds > 0) return;
    this.currentOtp = Math.floor(1000 + Math.random() * 9000).toString();
    const otpInput = document.getElementById('forgotOtpCode');
    if (otpInput) otpInput.value = this.currentOtp;

    window.RaigonToast.show(`💬 New WhatsApp OTP sent to ${this.registeredPhone || 'your phone'}! Code: ${this.currentOtp}`, 'success');
    this.startOTPTimer();
  }

  verifyForgotPasswordOTP(e) {
    if (e) e.preventDefault();
    const otpInput = document.getElementById('forgotOtpCode');
    const userOtp = otpInput ? otpInput.value.trim() : '';

    if (!userOtp) {
      window.RaigonToast.show('Please enter the 4-digit verification code.', 'error');
      return;
    }

    if (userOtp !== this.currentOtp) {
      window.RaigonToast.show(`Incorrect OTP code. Please check your WhatsApp message. (Hint: ${this.currentOtp})`, 'error');
      return;
    }

    this.stopOTPTimer();
    window.RaigonToast.show('OTP Verified Successfully! Please create your new password.', 'success');

    const s2 = document.getElementById('forgotStep2');
    const s3 = document.getElementById('forgotStep3');
    if (s2) s2.style.display = 'none';
    if (s3) s3.style.display = 'block';

    const p1 = document.getElementById('resetNewPassword');
    if (p1) p1.focus();
  }

  submitNewPassword(e) {
    if (e) e.preventDefault();
    const pass1 = document.getElementById('resetNewPassword') ? document.getElementById('resetNewPassword').value.trim() : '';
    const pass2 = document.getElementById('resetConfirmPassword') ? document.getElementById('resetConfirmPassword').value.trim() : '';

    if (!pass1 || !pass2) {
      window.RaigonToast.show('Please enter your new password in both fields.', 'error');
      return;
    }

    if (pass1.length < 6) {
      window.RaigonToast.show('Password must be at least 6 characters long.', 'error');
      return;
    }

    if (pass1 !== pass2) {
      window.RaigonToast.show('Passwords do not match! Please re-enter the same password.', 'error');
      return;
    }

    localStorage.setItem('raigon_saved_password', pass1);

    const loginPassField = document.getElementById('loginPassword');
    if (loginPassField) loginPassField.value = pass1;

    window.RaigonToast.show('Password updated successfully! You can now sign in.', 'success');
    this.showLoginForm();
  }

  login(e) {
    if (e) e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const pass = document.getElementById('loginPassword').value.trim();

    if (!email || !pass) {
      window.RaigonToast.show('Please enter phone number/username and password.', 'error');
      return;
    }

    const savedPass = localStorage.getItem('raigon_saved_password');
    if (savedPass && pass !== savedPass && pass !== 'raigon2026') {
      window.RaigonToast.show('Incorrect password. Please try again.', 'error');
      return;
    }

    window.RaigonStorage.setAuth(true, email || 'Admin');
    window.RaigonToast.show('Welcome to Raigon Arts Management System!', 'success');
    this.checkAuth();
    this.navigateTo('dashboard');
  }

  logout() {
    window.RaigonStorage.setAuth(false);
    window.RaigonToast.show('Logged out successfully.', 'info');
    this.checkAuth();
  }

  navigateTo(viewId) {
    if (viewId === 'new-order') {
      // Special action: navigate to customers and open new customer order modal directly!
      this.navigateTo('customers');
      window.RaigonCustomersView.openCustomerModal();
      return;
    }

    this.currentView = viewId;

    // Update active nav items
    document.querySelectorAll('.nav-item').forEach(item => {
      if (item.getAttribute('data-view') === viewId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Hide all views
    document.querySelectorAll('.view-section').forEach(sec => {
      sec.classList.remove('active');
    });

    // Show target view
    const targetSection = document.getElementById(`${viewId}View`);
    if (targetSection) {
      targetSection.classList.add('active');
    }

    this.renderCurrentView();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  renderCurrentView() {
    switch (this.currentView) {
      case 'dashboard':
        if (window.RaigonDashboardView) window.RaigonDashboardView.render();
        break;
      case 'customers':
        if (window.RaigonCustomersView) window.RaigonCustomersView.render();
        break;
      case 'orders':
        if (window.RaigonOrdersView) window.RaigonOrdersView.render();
        break;
      case 'photos':
        if (window.RaigonPhotosView) window.RaigonPhotosView.render();
        break;
      case 'frames':
        if (window.RaigonFramesView) window.RaigonFramesView.render();
        break;
      case 'reports':
        if (window.RaigonReportsView) window.RaigonReportsView.render();
        break;
      case 'settings':
        if (window.RaigonSettingsView) window.RaigonSettingsView.render();
        break;
    }

    // Auto-enhance all select elements with Vuexy Select2 Floating UI
    if (window.RaigonSelect2) {
      setTimeout(() => window.RaigonSelect2.enhanceAll(), 10);
    }
  }

  toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;
    this.sidebarCollapsed = !this.sidebarCollapsed;
    if (this.sidebarCollapsed) {
      sidebar.classList.add('collapsed');
    } else {
      sidebar.classList.remove('collapsed');
    }
  }



  bindGlobalEvents() {
    // Navigation items click
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const view = item.getAttribute('data-view');
        if (view) this.navigateTo(view);
      });
    });

    // Global Top Search Bar
    const globalSearch = document.getElementById('globalSearchInput');
    if (globalSearch) {
      globalSearch.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        if (val) {
          this.navigateTo('customers');
          window.RaigonCustomersView.handleSearch(val);
        }
      });
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.RaigonApp = new AppManager();
  window.RaigonApp.init();
});

window.toggleLoginPasswordVisibility = function () {
  const pwdInput = document.getElementById('loginPassword');
  const eyeIcon = document.getElementById('togglePasswordIcon');
  if (!pwdInput || !eyeIcon) return;
  if (pwdInput.type === 'password') {
    pwdInput.type = 'text';
    eyeIcon.classList.remove('fa-eye');
    eyeIcon.classList.add('fa-eye-slash');
  } else {
    pwdInput.type = 'password';
    eyeIcon.classList.remove('fa-eye-slash');
    eyeIcon.classList.add('fa-eye');
  }
};

window.quickFillLogin = function (email, pass) {
  const emailInput = document.getElementById('loginEmail');
  const passInput = document.getElementById('loginPassword');
  if (emailInput) emailInput.value = email;
  if (passInput) passInput.value = pass;
  window.RaigonApp.login();
};

window.toggleResetNewPasswordVisibility = function (inputId, iconId) {
  const pwdInput = document.getElementById(inputId);
  const eyeIcon = document.getElementById(iconId);
  if (!pwdInput || !eyeIcon) return;
  if (pwdInput.type === 'password') {
    pwdInput.type = 'text';
    eyeIcon.classList.remove('fa-eye');
    eyeIcon.classList.add('fa-eye-slash');
  } else {
    pwdInput.type = 'password';
    eyeIcon.classList.remove('fa-eye-slash');
    eyeIcon.classList.add('fa-eye');
  }
};
