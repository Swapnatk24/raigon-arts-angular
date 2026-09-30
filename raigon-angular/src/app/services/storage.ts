import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly TOKEN_KEY = 'raigon_token';
  private readonly USER_KEY = 'raigon_user';
  private readonly LOGGED_IN_KEY = 'raigon_logged_in';

  getToken(): string | null {
    if (typeof localStorage !== 'undefined') {
      const token = localStorage.getItem(this.TOKEN_KEY);
      if (token) return token;
    }
    if (typeof sessionStorage !== 'undefined') {
      return sessionStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  setToken(token: string): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.TOKEN_KEY, token);
    }
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(this.TOKEN_KEY, token);
    }
  }

  getUser(): any {
    let user: string | null = null;
    if (typeof localStorage !== 'undefined') {
      user = localStorage.getItem(this.USER_KEY);
    }
    if (!user && typeof sessionStorage !== 'undefined') {
      user = sessionStorage.getItem(this.USER_KEY);
    }
    if (!user) return null;
    try {
      return JSON.parse(user);
    } catch {
      return user;
    }
  }

  setUser(user: any): void {
    const userStr = typeof user === 'string' ? user : JSON.stringify(user);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.USER_KEY, userStr);
    }
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(this.USER_KEY, userStr);
    }
  }

  isLoggedIn(): boolean {
    if (typeof localStorage !== 'undefined') {
      if (localStorage.getItem(this.LOGGED_IN_KEY) === 'true' || !!localStorage.getItem(this.TOKEN_KEY)) {
        return true;
      }
    }
    if (typeof sessionStorage !== 'undefined') {
      if (sessionStorage.getItem(this.LOGGED_IN_KEY) === 'true' || !!sessionStorage.getItem(this.TOKEN_KEY)) {
        return true;
      }
    }
    return false;
  }

  setLoggedIn(status: boolean): void {
    const val = status ? 'true' : 'false';
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.LOGGED_IN_KEY, val);
    }
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(this.LOGGED_IN_KEY, val);
    }
  }

  clearAuth(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
      localStorage.removeItem(this.LOGGED_IN_KEY);
      localStorage.removeItem('isLoggedIn');
    }
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(this.TOKEN_KEY);
      sessionStorage.removeItem(this.USER_KEY);
      sessionStorage.removeItem(this.LOGGED_IN_KEY);
    }
  }
}

// Backward compatibility alias if needed
export { StorageService as Storage };
