import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { StorageService } from './storage';

export interface LoginRequest {
  username?: string;
  email?: string;
  password?: string;
}

export interface LoginResponse {
  token?: string;
  accessToken?: string;
  jwt?: string;
  user?: any;
  data?: {
    token?: string;
    accessToken?: string;
    user?: any;
    [key: string]: any;
  };
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private storageService = inject(StorageService);

  private readonly loginUrl = `${environment.apiUrl}/api/v1/auth/login`;

  login(credentials: { username: string; password: string }): Observable<LoginResponse> {
    const payload = {
      username: credentials.username,
      email: credentials.username,
      password: credentials.password
    };

    return this.http.post<LoginResponse>(this.loginUrl, payload).pipe(
      tap(res => {
        const token =
          res?.token ||
          res?.accessToken ||
          res?.jwt ||
          res?.data?.token ||
          res?.data?.accessToken ||
          '';

        if (token) {
          this.storageService.setToken(token);
        }

        const user = res?.user || res?.data?.user || credentials.username;
        this.storageService.setUser(user);
        this.storageService.setLoggedIn(true);
      })
    );
  }

  logout(): void {
    this.storageService.clearAuth();
  }

  isAuthenticated(): boolean {
    return this.storageService.isLoggedIn();
  }

  getToken(): string | null {
    return this.storageService.getToken();
  }
}
