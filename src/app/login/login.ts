import { ChangeDetectorRef, Component, EventEmitter, OnDestroy, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastService } from '../services/toast.service';
import { ToastComponent } from '../components/toast/toast';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ToastComponent],
  templateUrl: './login.html'
})
export class Login implements OnInit, OnDestroy {
  private router = inject(Router);
  private toastService = inject(ToastService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  @Output() loginSuccess = new EventEmitter<void>();

  username = '';
  password = '';
  showPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  registeredPhone = '+91 7012160065';
  forgotPassword = false;
  forgotStep = 1;

  currentOtp = '';
  enteredOtp = '';

  newPassword = '';
  confirmPassword = '';

  timerSeconds = 0;
  isSendingOtp = false;
  private otpTimerInterval: any = null;

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      (window as any).RaigonApp = this;
      (window as any).toggleLoginPasswordVisibility = () => this.togglePassword();
      (window as any).toggleResetNewPasswordVisibility = (field: string) => {
        if (field === 'resetNewPassword') {
          this.showNewPassword = !this.showNewPassword;
        } else {
          this.showConfirmPassword = !this.showConfirmPassword;
        }
        this.cdr.detectChanges();
      };
    }
  }

  ngOnDestroy(): void {
    this.stopOTPTimer();
  }

  get timerDisplay(): string {
    const mins = String(Math.floor(this.timerSeconds / 60)).padStart(2, '0');
    const secs = String(this.timerSeconds % 60).padStart(2, '0');
    return `${mins}:${secs}`;
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
    this.cdr.detectChanges();
  }

  fillDemoCredentials(): void {
    this.username = '';
    this.password = '';
    this.cdr.detectChanges();
  }

  toggleTheme(theme: string, showToast: boolean = true): void {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.body.classList.add('dark-mode');
    } else {
      document.documentElement.removeAttribute('data-theme');
      document.body.classList.remove('dark-mode');
    }
    localStorage.setItem('raigon_theme', theme);
    if (showToast) {
      this.toastService.info(`Theme switched to ${theme === 'dark' ? 'Dark Mode' : 'Light Mode'}`);
    }
    this.updateThemeIcon();
  }

  toggleThemeMode(): void {
    const currentTheme = localStorage.getItem('raigon_theme') || 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    this.toggleTheme(newTheme, true);
  }

  updateThemeIcon(): void {
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

  setLayoutDensity(density: string, showToast: boolean = true): void {
    if (density === 'compact') {
      document.documentElement.classList.add('compact-layout');
    } else {
      document.documentElement.classList.remove('compact-layout');
    }
    localStorage.setItem('raigon_layout_density', density);
    if (showToast) {
      this.toastService.info(`Layout set to ${density === 'compact' ? 'Compact' : 'Comfortable'} mode`);
    }
  }

  checkAuth(): boolean {
    const auth = this.authService.isAuthenticated();
    const loginView = document.getElementById('loginView');
    const appContainer = document.getElementById('appContainer');

    if (auth) {
      if (loginView) loginView.style.display = 'none';
      if (appContainer) appContainer.style.display = 'flex';
    } else {
      if (loginView) loginView.style.display = 'flex';
      if (appContainer) appContainer.style.display = 'none';
    }
    return auth;
  }

  // =========================================
  // FORGOT PASSWORD MULTI-STEP FLOW METHODS
  // =========================================

  showForgotPasswordForm(): void {
    this.forgotPassword = true;
    this.goToStep1Phone();
    this.cdr.detectChanges();
  }

  showForgotPassword(): void {
    this.showForgotPasswordForm();
  }

  showLoginForm(): void {
    this.stopOTPTimer();
    this.forgotPassword = false;
    this.forgotStep = 1;
    this.isSendingOtp = false;
    this.cdr.detectChanges();
  }

  showLogin(): void {
    this.showLoginForm();
  }

  goToStep1Phone(): void {
    this.stopOTPTimer();
    this.forgotStep = 1;
    this.isSendingOtp = false;
    this.cdr.detectChanges();
  }

  private generateOtp(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  sendForgotPasswordOTP(e?: Event): void {
    if (e) e.preventDefault();
    const phone = (this.registeredPhone || '').trim();

    if (!phone || phone.length < 7) {
      this.toastService.error('Please enter a valid registered phone number.');
      return;
    }

    this.isSendingOtp = true;
    this.cdr.detectChanges();

    setTimeout(() => {
      this.isSendingOtp = false;
      this.currentOtp = this.generateOtp();
      this.enteredOtp = this.currentOtp;

      this.toastService.success(
        `WhatsApp OTP sent to ${phone}! Verification Code: ${this.currentOtp}`
      );

      this.forgotStep = 2;
      this.startOTPTimer();
      this.cdr.detectChanges();
    }, 600);
  }

  sendOtp(e?: Event): void {
    this.sendForgotPasswordOTP(e);
  }

  startOTPTimer(): void {
    this.stopOTPTimer();
    this.timerSeconds = 80;
    this.cdr.detectChanges();

    this.otpTimerInterval = setInterval(() => {
      this.timerSeconds--;
      if (this.timerSeconds <= 0) {
        this.stopOTPTimer();
      }
      this.cdr.detectChanges();
    }, 1000);
  }

  stopOTPTimer(): void {
    if (this.otpTimerInterval) {
      clearInterval(this.otpTimerInterval);
      this.otpTimerInterval = null;
    }
  }

  resendOTP(): void {
    if (this.timerSeconds > 0) return;
    this.currentOtp = this.generateOtp();
    this.enteredOtp = this.currentOtp;

    this.toastService.success(
      `New WhatsApp OTP sent to ${this.registeredPhone || 'your phone'}! Code: ${this.currentOtp}`
    );
    this.startOTPTimer();
    this.cdr.detectChanges();
  }

  verifyForgotPasswordOTP(e?: Event): void {
    if (e) e.preventDefault();
    const userOtp = (this.enteredOtp || '').trim();

    if (!userOtp) {
      this.toastService.error('Please enter the 4-digit verification code.');
      return;
    }

    if (userOtp !== this.currentOtp) {
      this.toastService.error(
        `Incorrect OTP code. Please check your WhatsApp message. (Hint: ${this.currentOtp})`
      );
      return;
    }

    this.stopOTPTimer();
    this.toastService.success('OTP Verified Successfully! Please create your new password.');
    this.forgotStep = 3;
    this.cdr.detectChanges();
  }

  submitNewPassword(e?: Event): void {
    if (e) e.preventDefault();
    const pass1 = (this.newPassword || '').trim();
    const pass2 = (this.confirmPassword || '').trim();

    if (!pass1 || !pass2) {
      this.toastService.error('Please enter your new password in both fields.');
      return;
    }

    if (pass1.length < 6) {
      this.toastService.error('Password must be at least 6 characters long.');
      return;
    }

    if (pass1 !== pass2) {
      this.toastService.error('Passwords do not match! Please re-enter the same password.');
      return;
    }

    this.password = pass1;

    this.toastService.success('Password updated successfully! You can now sign in.');
    this.showLoginForm();
    this.cdr.detectChanges();
  }

  // =========================================
  // AUTHENTICATION (LOGIN & LOGOUT)
  // =========================================

  login(e?: Event): void {
    if (e) e.preventDefault();
    const email = (this.username || '').trim();
    const pass = (this.password || '').trim();

    if (!email || !pass) {
      this.toastService.error('Please enter phone number/username and password.');
      return;
    }

    this.authService.login({ username: email, password: pass }).subscribe({
      next: () => {
        this.toastService.success('Welcome to Raigon Arts Management System!');
        this.loginSuccess.emit();
        this.checkAuth();
        this.navigateTo('dashboard');
        this.cdr.detectChanges();
      },
      error: (err) => {
        const errorMsg =
          err?.error?.message ||
          err?.error?.title ||
          (err?.status === 0
            ? 'Cannot connect to API server. Please check if the .NET backend is running.'
            : 'Invalid username or password. Please try again.');
        this.toastService.error(errorMsg);
        this.cdr.detectChanges();
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.toastService.info('Logged out successfully.');
    this.checkAuth();
    this.navigateTo('login');
    this.cdr.detectChanges();
  }

  navigateTo(view: string): void {
    this.router.navigate([`/${view}`], { replaceUrl: true });
  }
}
