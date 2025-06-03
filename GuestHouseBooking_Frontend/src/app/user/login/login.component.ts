import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  username = '';
  password = '';
  loginType: 'user' | 'admin' = 'user';

  constructor(private router: Router) { }

  onLogin() {
    console.log('Username:', this.username);
    console.log('Password:', this.password);
    console.log('Login Type:', this.loginType);

    if (this.username && this.password) {
      if (this.loginType === 'user') {
        this.router.navigate(['/user/hotels']);
      } else if (this.loginType === 'admin') {
        this.router.navigate(['/admin/dashboard']);
      }
    } else {
      alert('Please enter your username and password.');
    }
  }

  onRegister() {
    this.router.navigate(['/user/registration']);
  }
}