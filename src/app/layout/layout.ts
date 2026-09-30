import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, Subscription } from 'rxjs';

import { Dashboard } from '../dashboard/dashboard';
import { Customers } from '../customers/customers';
import { Orders } from '../orders/orders';
import { Photos } from '../photos/photos';
import { Frames } from '../frames/frames';
import { Reports } from '../reports/reports';
import { Settings } from '../settings/settings';

import { CustomerService } from '../services/customer.service';
import { ToastService } from '../services/toast.service';
import { ToastComponent } from '../components/toast/toast';
import { ModalComponent } from '../components/modal/modal';
import { NotificationComponent } from '../components/notification/notification';
import { Select2Service } from '../components/select2/select2';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    Dashboard,
    Customers,
    Orders,
    Photos,
    Frames,
    Reports,
    Settings,
    ToastComponent,
    ModalComponent,
    NotificationComponent
  ],
  templateUrl: './layout.html'
})
export class Layout implements OnInit, AfterViewInit, OnDestroy {

  @Output() logoutEvent = new EventEmitter<void>();

  currentView = 'dashboard';
  sidebarCollapsed = false;
  currentTheme: 'light' | 'dark' = 'light';

  currentLogo = 'assets/images/img2.png';

  private subscription = new Subscription();

  constructor(
    private customerService: CustomerService,
    private toastService: ToastService,
    private router: Router,
    private select2Service: Select2Service,
    private cdr: ChangeDetectorRef,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login'], { replaceUrl: true });
      return;
    }

    (window as any).RaigonApp = this;
    this.initSettings();
    this.applyCustomLogo();

    this.subscription.add(
      this.customerService.customLogo$.subscribe(logo => {
        this.currentLogo = logo;
        this.cdr.detectChanges();
      })
    );

    const initialSegment = this.router.url.split('?')[0].split('#')[0].replace(/^\//, '');
    if (initialSegment && ['dashboard', 'customers', 'orders', 'photos', 'frames', 'reports', 'settings'].includes(initialSegment)) {
      this.currentView = initialSegment;
    }

    this.subscription.add(
      this.router.events.pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd)
      ).subscribe((event: NavigationEnd) => {
        const url = event.urlAfterRedirects || event.url;
        const segment = url.split('?')[0].split('#')[0].replace(/^\//, '');
        if (segment && ['dashboard', 'customers', 'orders', 'photos', 'frames', 'reports', 'settings'].includes(segment)) {
          this.currentView = segment;
          this.cdr.detectChanges();
        }
      })
    );
  }

  applyCustomLogo(): void {
    this.currentLogo = this.customerService.getCustomLogo();
    if (typeof document !== 'undefined') {
      document.querySelectorAll('.brand-icon img, .glow-icon img, #shopLogoPreview').forEach((img: any) => {
        img.src = this.currentLogo;
      });
    }
    this.cdr.detectChanges();
  }

  initSettings(): void {
    const savedTheme = (localStorage.getItem('raigon_theme') as 'light' | 'dark') || 'light';
    const savedLayout = localStorage.getItem('raigon_layout_density') || 'comfortable';
    this.toggleTheme(savedTheme, false);
    this.setLayoutDensity(savedLayout, false);
    this.updateThemeIcon();
  }

  setLayoutDensity(density: string, showToast: boolean = true): void {
    if (typeof document !== 'undefined') {
      if (density === 'compact') {
        document.documentElement.classList.add('compact-layout');
      } else {
        document.documentElement.classList.remove('compact-layout');
      }
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('raigon_layout_density', density);
    }
    if (showToast) {
      this.toastService.info(`Layout set to ${density === 'compact' ? 'Compact' : 'Comfortable'} mode`);
    }
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

  ngAfterViewInit(): void {
    const globalSearch = document.getElementById('globalSearchInput');
    if (globalSearch) {
      globalSearch.addEventListener('input', (e: Event) => {
        const val = ((e.target as HTMLInputElement).value || '').trim();
        if (val) {
          this.navigateTo('customers');
          if ((window as any).RaigonCustomersView) {
            (window as any).RaigonCustomersView.handleSearch(val);
          }
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  // =========================================
  // THEME SWITCHER
  // =========================================

  toggleTheme(theme: 'light' | 'dark', showToast: boolean = true): void {
    this.currentTheme = theme;
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
  }

  toggleThemeMode(): void {
    const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.toggleTheme(newTheme, true);
  }

  // =========================================
  // SIDEBAR NAVIGATION
  // =========================================

  navigate(view: string): void {
    if (view === 'new-order') {
      this.currentView = 'customers';
      this.router.navigate(['/customers'], { replaceUrl: true });
      this.customerService.openAddCustomerModal();
      this.cdr.detectChanges();
      return;
    }
    this.currentView = view;
    this.router.navigate([`/${view}`], { replaceUrl: true });
    this.cdr.detectChanges();
  }

  navigateTo(view: string): void {
    this.navigate(view);
  }

  // =========================================
  // GLOBAL SEARCH
  // =========================================

  onGlobalSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    const val = input ? input.value.trim() : '';
    if (val) {
      this.navigateTo('customers');
    }
    this.customerService.setGlobalSearch(val);
    if ((window as any).RaigonCustomersView) {
      (window as any).RaigonCustomersView.handleSearch(val);
    }
    this.cdr.detectChanges();
  }

  // =========================================
  // ADD NEW CUSTOMER
  // =========================================

  openAddCustomer(): void {
    this.customerService.openAddCustomerModal();
  }

  // =========================================
  // SIDEBAR COLLAPSE
  // =========================================

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  // =========================================
  // NOTIFICATIONS
  // =========================================

  toggleNotifications(event: Event): void {
    event.stopPropagation();
  }

  // =========================================
  // USER / SETTINGS
  // =========================================

  goToSettings(): void {
    this.currentView = 'settings';
  }

  // =========================================
  // LOGOUT
  // =========================================

  logout(): void {
    this.authService.logout();
    this.toastService.info('Logged out successfully.');
    this.logoutEvent.emit();
    this.router.navigate(['/login'], { replaceUrl: true });
  }
}
