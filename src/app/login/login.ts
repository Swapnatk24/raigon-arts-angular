// import { Component, EventEmitter, Output } from '@angular/core';
// import { FormsModule } from '@angular/forms';

// @Component({
//   selector: 'app-login',
//   standalone: true,
//   imports: [FormsModule],
//   templateUrl: './login.html'
// })
// export class Login {

//   @Output() loginSuccess = new EventEmitter<void>();

//   username = 'admin@raigonarts.com';
//   password = 'raigon2026';

//   showPassword = false;

//   forgotPassword = false;
//   forgotStep = 1;

//   otp = '';
//   enteredOtp = '';

//   newPassword = '';
//   confirmPassword = '';

//   otpTimer = 80;

//   login(): void {

//     if (!this.username || !this.password) {
//       alert('Please enter username and password.');
//       return;
//     }

//     const savedPassword =
//       localStorage.getItem('raigon_saved_password');

//     if (
//       savedPassword &&
//       this.password !== savedPassword &&
//       this.password !== 'raigon2026'
//     ) {
//       alert('Incorrect password.');
//       return;
//     }

//     localStorage.setItem(
//       'raigon_logged_in',
//       'true'
//     );

//     this.loginSuccess.emit();
//   }

//   showForgotPassword(): void {
//     this.forgotPassword = true;
//     this.forgotStep = 1;
//   }

//   showLogin(): void {
//     this.forgotPassword = false;
//     this.forgotStep = 1;
//   }

//   sendOtp(): void {

//     this.otp =
//       Math.floor(
//         1000 + Math.random() * 9000
//       ).toString();

//     this.enteredOtp = this.otp;

//     alert(
//       'Demo OTP: ' + this.otp
//     );

//     this.forgotStep = 2;

//     this.startTimer();
//   }

//   startTimer(): void {

//     this.otpTimer = 80;

//     const timer = setInterval(() => {

//       this.otpTimer--;

//       if (this.otpTimer <= 0) {
//         clearInterval(timer);
//       }

//     }, 1000);
//   }

//   verifyOtp(): void {

//     if (this.enteredOtp !== this.otp) {
//       alert('Incorrect OTP.');
//       return;
//     }

//     this.forgotStep = 3;
//   }

//   savePassword(): void {

//     if (this.newPassword.length < 6) {
//       alert(
//         'Password must contain at least 6 characters.'
//       );
//       return;
//     }

//     if (
//       this.newPassword !== this.confirmPassword
//     ) {
//       alert('Passwords do not match.');
//       return;
//     }

//     localStorage.setItem(
//       'raigon_saved_password',
//       this.newPassword
//     );

//     alert('Password updated successfully.');

//     this.showLogin();
//   }

//   togglePassword(): void {
//     this.showPassword =
//       !this.showPassword;
//   }
// }



import { Component, EventEmitter, Output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html'
})
export class Login {

  private router = inject(Router);

  @Output() loginSuccess = new EventEmitter<void>();

  username = 'admin@raigonarts.com';
  password = 'raigon2026';

  showPassword = false;

  forgotPassword = false;
  forgotStep = 1;

  otp = '';
  enteredOtp = '';

  newPassword = '';
  confirmPassword = '';

  otpTimer = 80;

  login(): void {

    if (!this.username || !this.password) {
      alert('Please enter username and password.');
      return;
    }

    const savedPassword =
      localStorage.getItem('raigon_saved_password');

    if (
      savedPassword &&
      this.password !== savedPassword &&
      this.password !== 'raigon2026'
    ) {
      alert('Incorrect password.');
      return;
    }

    localStorage.setItem(
      'raigon_logged_in',
      'true'
    );

    this.loginSuccess.emit();

    this.router.navigate(['/dashboard']);
  }

  showForgotPassword(): void {
    this.forgotPassword = true;
    this.forgotStep = 1;
  }

  showLogin(): void {
    this.forgotPassword = false;
    this.forgotStep = 1;
  }

  sendOtp(): void {

    this.otp =
      Math.floor(
        1000 + Math.random() * 9000
      ).toString();

    this.enteredOtp = this.otp;

    alert(
      'Demo OTP: ' + this.otp
    );

    this.forgotStep = 2;

    this.startTimer();
  }

  startTimer(): void {

    this.otpTimer = 80;

    const timer = setInterval(() => {

      this.otpTimer--;

      if (this.otpTimer <= 0) {
        clearInterval(timer);
      }

    }, 1000);
  }

  verifyOtp(): void {

    if (this.enteredOtp !== this.otp) {
      alert('Incorrect OTP.');
      return;
    }

    this.forgotStep = 3;
  }

  savePassword(): void {

    if (this.newPassword.length < 6) {
      alert(
        'Password must contain at least 6 characters.'
      );
      return;
    }

    if (
      this.newPassword !== this.confirmPassword
    ) {
      alert('Passwords do not match.');
      return;
    }

    localStorage.setItem(
      'raigon_saved_password',
      this.newPassword
    );

    alert('Password updated successfully.');

    this.showLogin();
  }

  togglePassword(): void {
    this.showPassword =
      !this.showPassword;
  }
}