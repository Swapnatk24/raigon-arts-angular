import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly TOKEN_KEY = 'raigon_token';
  private readonly USER_KEY = 'raigon_user';
  private readonly LOGGED_IN_KEY = 'raigon_logged_in';

  getToken(): string | null {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  setToken(token: string): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getUser(): any {
    if (typeof localStorage === 'undefined') return null;
    const user = localStorage.getItem(this.USER_KEY);
    if (!user) return null;
    try {
      return JSON.parse(user);
    } catch {
      return user;
    }
  }

  setUser(user: any): void {
    if (typeof localStorage === 'undefined') return;
    if (typeof user === 'string') {
      localStorage.setItem(this.USER_KEY, user);
    } else {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }
  }

  isLoggedIn(): boolean {
    if (typeof localStorage === 'undefined') return false;
    return localStorage.getItem(this.LOGGED_IN_KEY) === 'true';
  }

  setLoggedIn(status: boolean): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(this.LOGGED_IN_KEY, status ? 'true' : 'false');
  }

  clearAuth(): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.LOGGED_IN_KEY);
  }
}

// Backward compatibility alias if needed
export { StorageService as Storage };
