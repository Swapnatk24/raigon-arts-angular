import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../services/toast.service';
import { CustomerService } from '../services/customer.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './settings.html'
})
export class Settings implements OnInit {
  private toastService = inject(ToastService);
  private customerService = inject(CustomerService);
  private cdr = inject(ChangeDetectorRef);

  currentLogo = 'assets/images/img2.png';
  businessName = 'Raigon Arts';
  businessPhone = '+91 8921348433';
  businessEmail = 'orders@raigonarts.com';
  workshopAddress = 'Main Workshop, MG Road, Overbridge Junction, Trivandrum, Kerala - 695001';

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      (window as any).RaigonSettingsView = this;
    }
    this.currentLogo = this.customerService.getCustomLogo();
    this.loadSavedSettings();
  }

  loadSavedSettings(): void {
    if (typeof localStorage === 'undefined') return;
    const saved = localStorage.getItem('raigon_arts_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.businessName) this.businessName = parsed.businessName;
        if (parsed.businessPhone) this.businessPhone = parsed.businessPhone;
        if (parsed.businessEmail) this.businessEmail = parsed.businessEmail;
        if (parsed.workshopAddress) this.workshopAddress = parsed.workshopAddress;
      } catch (e) {}
    }
  }

  saveSettings(): void {
    if (typeof localStorage !== 'undefined') {
      const settings = {
        businessName: this.businessName,
        businessPhone: this.businessPhone,
        businessEmail: this.businessEmail,
        workshopAddress: this.workshopAddress
      };
      localStorage.setItem('raigon_arts_settings', JSON.stringify(settings));
    }
    this.toastService.success('Shop settings saved successfully!');
  }

  handleLogoUpload(e: Event): void {
    const input = e.target as HTMLInputElement;
    const file = input.files && input.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.toastService.error('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event: ProgressEvent<FileReader>) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        this.currentLogo = dataUrl;
        this.customerService.setCustomLogo(dataUrl);

        if ((window as any).RaigonApp && (window as any).RaigonApp.applyCustomLogo) {
          (window as any).RaigonApp.applyCustomLogo();
        }

        const previewEl = document.getElementById('shopLogoPreview') as HTMLImageElement;
        if (previewEl) previewEl.src = dataUrl;

        this.toastService.success('Workshop brand logo updated successfully!');
        this.cdr.detectChanges();
      }
    };
    reader.readAsDataURL(file);
  }

  resetLogo(): void {
    this.currentLogo = 'assets/images/img2.png';
    this.customerService.removeCustomLogo();

    if ((window as any).RaigonApp && (window as any).RaigonApp.applyCustomLogo) {
      (window as any).RaigonApp.applyCustomLogo();
    }

    const previewEl = document.getElementById('shopLogoPreview') as HTMLImageElement;
    if (previewEl) previewEl.src = 'assets/images/img2.png';

    this.toastService.info('Brand logo reset to default.');
    this.cdr.detectChanges();
  }
}


