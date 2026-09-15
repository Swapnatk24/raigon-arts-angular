import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import {
  Customer,
  CustomerPhoto,
  CustomerService,
  FrameSize
} from '../../services/customer.service';
import { ToastService } from '../../services/toast.service';
import { DatePickerComponent } from '../datepicker/datepicker';

export interface PhotoConfigItem {
  name: string;
  url: string;
  size?: string;
  frameSize?: string;
  unit?: string;
  customWidth?: string;
  customHeight?: string;
  frameType?: string;
  frameMaterial?: string;
  frameColor?: string;
  orientation?: string;
  quantity?: number;
  notes?: string;
}

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DecimalPipe,
    DatePickerComponent
  ],
  templateUrl: './modal.html',
  styleUrl: './modal.css'
})
export class ModalComponent implements OnInit, OnDestroy {

  // Modals Visibility
  showAddCustomerModal = false;
  showViewCustomerModal = false;
  showFrameSizeModal = false;
  showLightboxModal = false;
  showConfirmModal = false;

  confirmTitle = 'Confirm Action';
  confirmMessage = 'Are you sure you want to proceed?';
  confirmText = 'Delete';
  confirmClass = 'btn-danger';
  private confirmCallback: (() => void) | null = null;

  lightboxImageUrl = '';
  lightboxTitle = 'Photo Preview';

  // Edit Mode State
  isEditMode = false;
  editingCustomerId: string | null = null;

  // View Customer State
  viewCustomerData: Customer | null = null;

  // Frame Config Mode ('same' | 'individual')
  frameConfigMode: 'same' | 'individual' = 'same';

  // Customer Information
  customerName = '';
  customerPhone = '';
  alternativePhone = '';
  customerCity = '';
  customerAddress = '';
  customerPincode = '';

  // Validation State Flags
  nameTouched = false;
  phoneTouched = false;
  isSubmitted = false;

  get nameError(): string {
    if (this.nameTouched || this.isSubmitted) {
      if (!this.customerName || !this.customerName.trim()) {
        return 'Customer name is required';
      }
      if (!/^[a-zA-Z\s]+$/.test(this.customerName.trim())) {
        return 'Customer name can contain letters and spaces only';
      }
    }
    return '';
  }

  get phoneError(): string {
    if (this.phoneTouched || this.isSubmitted) {
      if (!this.customerPhone || !this.customerPhone.trim()) {
        return 'Phone number is required';
      }
      if (this.customerPhone.trim().length < 10) {
        return 'Phone number must be 10 digits';
      }
    }
    return '';
  }

  // Restrict Customer Name: letters and spaces only
  onNameInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const sanitized = input.value.replace(/[^a-zA-Z\s]/g, '');
    this.customerName = sanitized;
    input.value = sanitized;
  }

  allowLettersOnly(event: KeyboardEvent): void {
    if (event.ctrlKey || event.altKey || event.metaKey) return;
    const key = event.key;
    if (key.length === 1 && !/^[a-zA-Z\s]$/.test(key)) {
      event.preventDefault();
    }
  }

  onNamePaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pastedText = event.clipboardData?.getData('text') || '';
    const sanitized = pastedText.replace(/[^a-zA-Z\s]/g, '');
    const input = event.target as HTMLInputElement;
    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;
    const currentVal = this.customerName || '';
    const newVal = currentVal.substring(0, start) + sanitized + currentVal.substring(end);
    this.customerName = newVal;
    input.value = newVal;
  }

  // Restrict Phone Number: digits only, max 10 digits
  onPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const sanitized = input.value.replace(/\D/g, '').slice(0, 10);
    this.customerPhone = sanitized;
    input.value = sanitized;
  }

  onAltPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const sanitized = input.value.replace(/\D/g, '').slice(0, 10);
    this.alternativePhone = sanitized;
    input.value = sanitized;
  }

  allowNumbersOnly(event: KeyboardEvent): void {
    if (event.ctrlKey || event.altKey || event.metaKey) return;
    const key = event.key;
    if (key.length === 1 && !/^\d$/.test(key)) {
      event.preventDefault();
    }
  }

  onPhonePaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pastedText = event.clipboardData?.getData('text') || '';
    const sanitized = pastedText.replace(/\D/g, '');
    const input = event.target as HTMLInputElement;
    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;
    const currentVal = input.value || '';
    const newVal = (currentVal.substring(0, start) + sanitized + currentVal.substring(end)).slice(0, 10);
    if (input.id === 'formCustAltPhone') {
      this.alternativePhone = newVal;
    } else {
      this.customerPhone = newVal;
    }
    input.value = newVal;
  }

  // Mode A: Common Frame Information
  frameSize = '';
  unit = '';
  customWidth = '';
  customHeight = '';
  frameType = '';
  frameMaterial = '';
  frameColor = '';
  orientation = '';
  quantity: number | null = null;
  notes = '';

  // Photos List (Used in both Same and Individual modes)
  selectedPhotos: PhotoConfigItem[] = [];

  // Order & Payment Details
  orderDate = this.getToday();
  deliveryDate = '';
  totalAmount: number | null = null;
  advancePaid: number | null = null;
  paymentStatus = '';
  orderStatus = '';

  // Frame Size Form
  formSizeId = '';
  formSizeName = '';
  formSizeWidth: number | null = null;
  formSizeHeight: number | null = null;
  formSizeUnit = '';
  formSizeCategory = '';

  private subscription = new Subscription();

  constructor(
    private customerService: CustomerService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      (window as any).RaigonModal = this;
    }

    this.subscription.add(
      this.customerService.openCustomerModal$.subscribe(customerToEdit => {
        if (customerToEdit) {
          this.openEditCustomerModal(customerToEdit);
        } else {
          this.openAddCustomerModal();
        }
      })
    );

    this.subscription.add(
      this.customerService.openViewModal$.subscribe(customerToView => {
        this.openViewCustomerModal(customerToView);
      })
    );

    this.subscription.add(
      this.customerService.openFrameSizeModal$.subscribe(frameSize => {
        this.openFrameSizeModal(frameSize);
      })
    );

    this.subscription.add(
      this.customerService.openLightbox$.subscribe(data => {
        this.openLightbox(data.url, data.title);
      })
    );

    this.subscription.add(
      this.customerService.openConfirmModal$.subscribe(options => {
        this.confirm(options);
      })
    );
  }

  // =========================================
  // CONFIG MODE TOGGLE
  // =========================================
  setFrameConfigMode(mode: 'same' | 'individual'): void {
    this.frameConfigMode = mode;
    if (mode === 'individual') {
      this.selectedPhotos = this.selectedPhotos.map(p => ({
        ...p,
        frameSize: this.normalizeFrameSize(p.frameSize || this.frameSize, p.customWidth, p.customHeight),
        unit: this.normalizeUnit(p.unit || this.unit),
        frameType: this.normalizeFrameType(p.frameType || this.frameType),
        frameMaterial: p.frameMaterial || this.frameMaterial || '',
        frameColor: p.frameColor || this.frameColor || '',
        orientation: this.normalizeOrientation(p.orientation || this.orientation),
        quantity: p.quantity ?? (this.quantity ? Number(this.quantity) : undefined)
      }));
    }
    this.cdr.detectChanges();
  }

  // =========================================
  // DROPDOWN VALUE NORMALIZERS
  // =========================================
  private normalizeFrameSize(size?: string, customWidth?: number | string, customHeight?: number | string): string {
    if (customWidth || customHeight) {
      if (!size || size.toLowerCase().includes('custom')) {
        return 'Custom Size';
      }
    }
    if (!size) return '';
    const s = size.trim().toLowerCase();
    if (s.includes('custom')) return 'Custom Size';
    if (s.includes('4') && s.includes('6')) return '4 × 6 ';
    if (s.includes('5') && s.includes('7')) return '5 × 7 ';
    if (s.includes('8') && s.includes('10')) return '8 × 10 ';
    if (s.includes('8') && s.includes('12')) return '8 × 12 ';
    if (s.includes('12') && s.includes('18')) return '12 × 18 ';
    if (s.includes('16') && s.includes('20')) return '16 × 20 ';
    if (s.includes('20') && s.includes('30')) return '20 × 30 ';

    const options = ['4 × 6 ', '5 × 7 ', '8 × 10 ', '8 × 12 ', '12 × 18 ', '16 × 20 ', '20 × 30 ', 'Custom Size'];
    const matched = options.find(o => o.trim().toLowerCase() === s);
    if (matched) return matched;

    return size;
  }

  private normalizeUnit(unit?: string): string {
    if (!unit) return '';
    const u = unit.trim().toLowerCase();
    if (u.includes('cm') || u.includes('cent')) return 'cm';
    if (u.includes('inch') || u.includes('in')) return 'inch';
    return unit;
  }

  private normalizeFrameType(type?: string): string {
    if (!type) return '';
    const t = type.trim().toLowerCase();
    if (t.includes('wood')) return 'Wooden Frame';
    if (t.includes('prem')) return 'Premium Frame';
    if (t.includes('class')) return 'Classic Frame';
    if (t.includes('canvas')) return 'Canvas Float';
    if (t.includes('box')) return 'Box Frame';
    const options = ['Wooden Frame', 'Premium Frame', 'Classic Frame', 'Canvas Float', 'Box Frame'];
    const matched = options.find(o => o.toLowerCase() === t);
    return matched || type;
  }

  private normalizeOrientation(orientation?: string): string {
    if (!orientation) return '';
    const o = orientation.trim().toLowerCase();
    if (o.includes('land') || o.includes('horiz')) return 'Landscape';
    if (o.includes('port') || o.includes('vert')) return 'Portrait';
    if (o.includes('squ')) return 'Square';
    return orientation;
  }

  private normalizePaymentStatus(status?: string): string {
    if (!status) return '';
    const s = status.trim().toLowerCase();
    if (s.includes('unpaid') || s.includes('not paid') || s.includes('due')) return 'Unpaid';
    if (s.includes('part')) return 'Partial';
    if (s.includes('paid') || s.includes('settle')) return 'Paid';
    return status;
  }

  private normalizeOrderStatus(status?: string): string {
    if (!status) return '';
    const s = status.trim().toLowerCase();
    if (s.includes('prog') || s.includes('process')) return 'In Progress';
    if (s.includes('pend') || s.includes('new')) return 'Pending';
    if (s.includes('comp') || s.includes('deliv') || s.includes('done')) return 'Completed';
    if (s.includes('canc')) return 'Cancelled';
    return status;
  }

  // =========================================
  // MODAL CONTROLS
  // =========================================
  openAddCustomerModal(defaultDeliveryDate?: string): void {
    this.isEditMode = false;
    this.editingCustomerId = null;
    this.resetForm();
    if (defaultDeliveryDate) {
      this.deliveryDate = this.formatDateDDMMYYYY(defaultDeliveryDate);
    }
    this.showAddCustomerModal = true;
    document.body.style.overflow = 'hidden';
    this.cdr.detectChanges();
  }

  openEditCustomerModal(customer: Customer): void {
    this.isEditMode = true;
    this.editingCustomerId = customer.id;
    this.resetForm();

    this.customerName = customer.name || '';
    this.customerPhone = customer.phone || '';
    this.alternativePhone = customer.alternativePhone || customer.altPhone || '';
    this.customerCity = customer.city || 'Trivandrum';
    this.customerAddress = customer.address || '';
    this.customerPincode = customer.pincode || '';

    this.frameSize = this.normalizeFrameSize(customer.frameSize, customer.customWidth, customer.customHeight);
    this.unit = this.normalizeUnit(customer.unit);
    this.customWidth = customer.customWidth ? String(customer.customWidth) : '';
    this.customHeight = customer.customHeight ? String(customer.customHeight) : '';
    this.frameType = this.normalizeFrameType(customer.frameType);
    this.frameMaterial = customer.frameMaterial || customer.material || '';
    this.frameColor = customer.frameColor || customer.color || '';
    this.orientation = this.normalizeOrientation(customer.orientation);
    this.quantity = customer.quantity ? Number(customer.quantity) : null;
    this.notes = customer.notes || '';

    this.orderDate = customer.orderDate || this.getToday();
    this.deliveryDate = this.formatDateDDMMYYYY(customer.deliveryDate);
    this.totalAmount = customer.totalAmount || 0;
    this.advancePaid = customer.advancePaid || 0;
    this.paymentStatus = this.normalizePaymentStatus(customer.paymentStatus);
    this.orderStatus = this.normalizeOrderStatus(customer.orderStatus);
    this.frameConfigMode = customer.frameConfigMode || 'same';

    if (customer.photos && customer.photos.length > 0) {
      this.selectedPhotos = customer.photos.map(p => ({
        name: p.name,
        url: p.url,
        size: p.size || '2.5 MB',
        frameSize: this.normalizeFrameSize(
          p.frameSize || (customer.frameConfigMode === 'same' ? customer.frameSize : ''),
          p.customWidth,
          p.customHeight
        ),
        unit: this.normalizeUnit(p.unit || (customer.frameConfigMode === 'same' ? customer.unit : '')),
        customWidth: p.customWidth ? String(p.customWidth) : '',
        customHeight: p.customHeight ? String(p.customHeight) : '',
        frameType: this.normalizeFrameType(p.frameType || (customer.frameConfigMode === 'same' ? customer.frameType : '')),
        frameMaterial: p.frameMaterial || p.material || (customer.frameConfigMode === 'same' ? (customer.frameMaterial || customer.material) : '') || '',
        frameColor: p.frameColor || p.color || (customer.frameConfigMode === 'same' ? (customer.frameColor || customer.color) : '') || '',
        orientation: this.normalizeOrientation(p.orientation || (customer.frameConfigMode === 'same' ? customer.orientation : '')),
        quantity: p.quantity ? Number(p.quantity) : (customer.frameConfigMode === 'same' ? (customer.quantity ? Number(customer.quantity) : undefined) : undefined),
        notes: p.notes || ''
      }));
    } else {
      this.selectedPhotos = [];
    }

    this.showAddCustomerModal = true;
    document.body.style.overflow = 'hidden';
    this.cdr.detectChanges();
  }

  closeAddCustomerModal(): void {
    this.showAddCustomerModal = false;
    this.isEditMode = false;
    this.editingCustomerId = null;
    document.body.style.overflow = '';
    this.cdr.detectChanges();
  }

  openViewCustomerModal(customer: Customer): void {
    this.viewCustomerData = customer;
    this.showViewCustomerModal = true;
    document.body.style.overflow = 'hidden';
    this.cdr.detectChanges();
  }

  closeViewCustomerModal(): void {
    this.showViewCustomerModal = false;
    this.viewCustomerData = null;
    document.body.style.overflow = '';
    this.cdr.detectChanges();
  }

  editFromViewModal(): void {
    if (!this.viewCustomerData) return;
    const target = { ...this.viewCustomerData };
    this.closeViewCustomerModal();
    this.openEditCustomerModal(target);
  }

  sendWhatsAppFromView(): void {
    if (!this.viewCustomerData) return;
    this.customerService.sendWhatsAppReceipt(this.viewCustomerData);
  }

  openLightbox(url: string, title: string = 'Photo Preview'): void {
    this.lightboxImageUrl = url;
    this.lightboxTitle = title;
    this.showLightboxModal = true;
    this.cdr.detectChanges();
  }

  closeLightbox(): void {
    this.showLightboxModal = false;
    this.lightboxImageUrl = '';
    this.cdr.detectChanges();
  }

  downloadLightbox(): void {
    if (!this.lightboxImageUrl) return;
    const a = document.createElement('a');
    a.href = this.lightboxImageUrl;
    a.download = (this.lightboxTitle || 'photo').replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.jpg';
    a.click();
  }

  openFrameSizeModal(frameSize: FrameSize | null = null): void {
    if (frameSize) {
      this.formSizeId = frameSize.id;
      this.formSizeName = frameSize.name;
      this.formSizeWidth = frameSize.width;
      this.formSizeHeight = frameSize.height;
      this.formSizeUnit = frameSize.unit || '';
      this.formSizeCategory = frameSize.category || '';
    } else {
      this.formSizeId = '';
      this.formSizeName = '';
      this.formSizeWidth = null;
      this.formSizeHeight = null;
      this.formSizeUnit = '';
      this.formSizeCategory = '';
    }
    this.showFrameSizeModal = true;
    document.body.style.overflow = 'hidden';
    this.cdr.detectChanges();
  }

  closeFrameSizeModal(): void {
    this.showFrameSizeModal = false;
    this.formSizeId = '';
    this.formSizeName = '';
    this.formSizeWidth = null;
    this.formSizeHeight = null;
    this.formSizeUnit = '';
    this.formSizeCategory = '';
    document.body.style.overflow = '';
    this.cdr.detectChanges();
  }

  confirm(options: {
    title: string;
    message: string;
    confirmText?: string;
    confirmClass?: string;
    onConfirm?: () => void;
  }): void {
    this.confirmTitle = options.title || 'Confirm Action';
    this.confirmMessage = options.message || 'Are you sure you want to proceed?';
    this.confirmText = options.confirmText || 'Delete';
    this.confirmClass = options.confirmClass || 'btn-danger';
    this.confirmCallback = options.onConfirm || null;
    this.showConfirmModal = true;
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }
    this.cdr.detectChanges();
  }

  openConfirmModal(
    title: string = 'Confirm Action',
    message: string = 'Are you sure you want to proceed?',
    onConfirm?: () => void,
    confirmText: string = 'Delete',
    confirmClass: string = 'btn-danger'
  ): void {
    this.confirm({ title, message, confirmText, confirmClass, onConfirm });
  }

  closeConfirmModal(): void {
    this.showConfirmModal = false;
    this.confirmCallback = null;
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
    this.cdr.detectChanges();
  }

  onConfirmClick(): void {
    if (this.confirmCallback) {
      this.confirmCallback();
    }
    this.closeConfirmModal();
  }

  open(modalId: string): void {
    if (modalId === 'customerModal') this.openAddCustomerModal();
    else if (modalId === 'viewCustomerModal') this.showViewCustomerModal = true;
    else if (modalId === 'frameSizeModal') this.openFrameSizeModal();
    else if (modalId === 'confirmModal') this.showConfirmModal = true;
    else if (modalId === 'lightboxModal') this.showLightboxModal = true;
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }
    this.cdr.detectChanges();
  }

  close(modalId?: string): void {
    if (!modalId || modalId === 'customerModal') this.closeAddCustomerModal();
    if (!modalId || modalId === 'viewCustomerModal') this.closeViewCustomerModal();
    if (!modalId || modalId === 'frameSizeModal') this.closeFrameSizeModal();
    if (!modalId || modalId === 'confirmModal') this.closeConfirmModal();
    if (!modalId || modalId === 'lightboxModal') this.closeLightbox();
  }

  onSizeNameInput(): void {
    if (!this.formSizeName) return;
    const match = this.formSizeName.match(/(\d+(?:\.\d+)?)\s*[xX×*]\s*(\d+(?:\.\d+)?)/);
    if (match) {
      this.formSizeWidth = parseFloat(match[1]);
      this.formSizeHeight = parseFloat(match[2]);
    }
  }

  saveFrameSize(): void {
    const name = this.formSizeName ? this.formSizeName.trim() : '';

    if (!name) {
      this.toastService.warning('Size Name / Label is required.');
      return;
    }

    let width = Number(this.formSizeWidth);
    let height = Number(this.formSizeHeight);

    if (isNaN(width) || width <= 0 || isNaN(height) || height <= 0) {
      const match = name.match(/(\d+(?:\.\d+)?)\s*[xX×*]\s*(\d+(?:\.\d+)?)/);
      if (match) {
        if (isNaN(width) || width <= 0) width = parseFloat(match[1]);
        if (isNaN(height) || height <= 0) height = parseFloat(match[2]);
      }
    }

    if (isNaN(width) || width <= 0) width = 12;
    if (isNaN(height) || height <= 0) height = 18;

    const sizeData: FrameSize = {
      id: this.formSizeId || '',
      name,
      width,
      height,
      unit: this.formSizeUnit || 'inch',
      category: this.formSizeCategory || 'Standard Photo',
      status: 'Active',
      activeOrdersCount: 0,
      usageCount: 0
    };

    this.customerService.saveFrameSize(sizeData).subscribe({
      next: (saved) => {
        this.toastService.success(`Frame size "${saved.name || name}" saved!`);
        this.closeFrameSizeModal();
      },
      error: (err) => {
        const errorMsg = err?.error?.message || err?.message || 'Failed to save frame size to server.';
        this.toastService.error(errorMsg);
      }
    });
  }

  // =========================================
  // PHOTOS HANDLING
  // =========================================
  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    Array.from(input.files).forEach(file => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        this.selectedPhotos.push({
          name: file.name,
          url: e.target?.result as string,
          size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
          frameSize: this.frameConfigMode === 'individual' ? '' : (this.frameSize || ''),
          unit: this.frameConfigMode === 'individual' ? '' : (this.unit || ''),
          customWidth: '',
          customHeight: '',
          frameType: this.frameConfigMode === 'individual' ? '' : (this.frameType || ''),
          frameMaterial: this.frameConfigMode === 'individual' ? '' : (this.frameMaterial || ''),
          frameColor: this.frameConfigMode === 'individual' ? '' : (this.frameColor || ''),
          orientation: this.frameConfigMode === 'individual' ? '' : (this.orientation || ''),
          quantity: this.frameConfigMode === 'individual' ? undefined : (this.quantity ?? undefined),
          notes: ''
        });
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    });

    input.value = '';
  }

  replaceIndividualPhoto(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      if (this.selectedPhotos[index]) {
        this.selectedPhotos[index].name = file.name;
        this.selectedPhotos[index].url = e.target?.result as string;
        this.selectedPhotos[index].size = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
        this.cdr.detectChanges();
      }
    };
    reader.readAsDataURL(file);
    input.value = '';
  }

  removePhoto(index: number): void {
    if (index >= 0 && index < this.selectedPhotos.length) {
      this.selectedPhotos.splice(index, 1);
      this.cdr.detectChanges();
    }
  }

  get balanceAmount(): number {
    const total = Number(this.totalAmount) || 0;
    const advance = Number(this.advancePaid) || 0;
    return Math.max(total - advance, 0);
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'In Progress': return 'badge-in-progress';
      case 'Completed': return 'badge-completed';
      case 'Delivered': return 'badge-delivered';
      case 'Cancelled': return 'badge-cancelled';
      default: return 'badge-pending';
    }
  }

  // =========================================
  // SAVE / UPDATE CUSTOMER
  // =========================================
  saveCustomer(): void {
    this.isSubmitted = true;
    this.nameTouched = true;
    this.phoneTouched = true;

    const name = this.customerName ? this.customerName.trim() : '';
    if (!name) {
      this.toastService.warning('Customer name is required.');
      return;
    }
    if (!/^[a-zA-Z\s]+$/.test(name)) {
      this.toastService.warning('Customer name can contain letters and spaces only.');
      return;
    }

    const phone = this.customerPhone ? this.customerPhone.trim() : '';
    if (!phone) {
      this.toastService.warning('Phone number is required.');
      return;
    }
    if (!/^\d{10}$/.test(phone)) {
      this.toastService.warning('Phone number must contain exactly 10 digits.');
      return;
    }

    const total = Number(this.totalAmount) || 0;
    const advance = Number(this.advancePaid) || 0;
    const balance = Math.max(total - advance, 0);

    const photosPayload: CustomerPhoto[] = this.selectedPhotos.map((p, idx) => ({
      id: `P-${Date.now()}-${idx + 1}`,
      name: p.name,
      url: p.url,
      size: p.size || '2.5 MB',
      frameSize: this.frameConfigMode === 'individual' ? (p.frameSize || '') : (p.frameSize || this.frameSize || ''),
      unit: this.frameConfigMode === 'individual' ? (p.unit || '') : (p.unit || this.unit || ''),
      frameType: this.frameConfigMode === 'individual' ? (p.frameType || '') : (p.frameType || this.frameType || ''),
      material: this.frameConfigMode === 'individual' ? (p.frameMaterial || '') : (p.frameMaterial || this.frameMaterial || ''),
      frameMaterial: this.frameConfigMode === 'individual' ? (p.frameMaterial || '') : (p.frameMaterial || this.frameMaterial || ''),
      color: this.frameConfigMode === 'individual' ? (p.frameColor || '') : (p.frameColor || this.frameColor || ''),
      frameColor: this.frameConfigMode === 'individual' ? (p.frameColor || '') : (p.frameColor || this.frameColor || ''),
      orientation: this.frameConfigMode === 'individual' ? (p.orientation || '') : (p.orientation || this.orientation || ''),
      quantity: Number(p.quantity) || (this.frameConfigMode === 'same' ? Number(this.quantity) || 1 : 1),
      notes: p.notes || (this.frameConfigMode === 'same' ? this.notes : '') || ''
    }));

    const finalId = this.isEditMode && this.editingCustomerId
      ? this.editingCustomerId
      : this.customerService.generateCustomerId();

    let customWidth = this.customWidth;
    let customHeight = this.customHeight;

    const customerPayload: Customer = {
      id: finalId,
      name: name,
      phone: phone,
      altPhone: this.alternativePhone.trim(),
      alternativePhone: this.alternativePhone.trim(),
      city: this.customerCity.trim() || 'Trivandrum',
      address: this.customerAddress.trim(),
      pincode: this.customerPincode.trim(),
      frameSize: this.frameConfigMode === 'individual' && this.selectedPhotos.length > 0
        ? (this.selectedPhotos[0].frameSize || this.frameSize)
        : this.frameSize,
      customSize: this.frameSize === 'Custom Size' ? `${customWidth || ''} × ${customHeight || ''} ${this.unit}` : '',
      customWidth: customWidth ? Number(customWidth) : undefined,
      customHeight: customHeight ? Number(customHeight) : undefined,
      frameType: this.frameConfigMode === 'individual' && this.selectedPhotos.length > 0
        ? (this.selectedPhotos[0].frameType || this.frameType)
        : this.frameType,
      frameMaterial: this.frameMaterial.trim() || 'Teak Wood Moulding',
      material: this.frameMaterial.trim() || 'Teak Wood Moulding',
      frameColor: this.frameColor.trim() || 'Walnut Brown',
      color: this.frameColor.trim() || 'Walnut Brown',
      unit: this.unit || 'inch',
      orientation: this.orientation || 'Landscape',
      quantity: Number(this.quantity) || 1,
      totalAmount: total,
      advancePaid: advance,
      balanceAmount: balance,
      paymentStatus: this.paymentStatus || 'Partial',
      orderStatus: this.orderStatus || 'In Progress',
      orderDate: this.orderDate || this.getToday(),
      deliveryDate: this.deliveryDate || '',
      notes: this.notes.trim(),
      photos: photosPayload,
      frameConfigMode: this.frameConfigMode,
      isArchived7Days: false
    };

    if (this.isEditMode) {
      this.customerService.updateCustomer(customerPayload);
      this.toastService.success(`Customer ${customerPayload.id} updated successfully! Opening WhatsApp Receipt...`);

      setTimeout(() => {
        this.customerService.sendWhatsAppReceipt(customerPayload);
      }, 400);
    } else {
      const saved = this.customerService.saveCustomer(customerPayload);
      this.toastService.success(`Customer ${saved.id} saved successfully! Opening WhatsApp Receipt...`);

      // Automatically prompt / send WhatsApp Receipt with Order ID, Price, Delivery Date, etc.
      setTimeout(() => {
        this.customerService.sendWhatsAppReceipt(saved);
      }, 400);
    }

    this.closeAddCustomerModal();
    this.resetForm();
  }

  resetForm(): void {
    this.nameTouched = false;
    this.phoneTouched = false;
    this.isSubmitted = false;

    this.frameConfigMode = 'same';
    this.customerName = '';
    this.customerPhone = '';
    this.alternativePhone = '';
    this.customerCity = '';
    this.customerAddress = '';
    this.customerPincode = '';

    this.frameSize = '';
    this.unit = '';
    this.customWidth = '';
    this.customHeight = '';
    this.frameType = '';
    this.frameMaterial = '';
    this.frameColor = '';
    this.orientation = '';
    this.quantity = null;
    this.notes = '';

    this.orderDate = this.getToday();
    this.deliveryDate = '';
    this.totalAmount = null;
    this.advancePaid = null;
    this.paymentStatus = '';
    this.orderStatus = '';

    this.selectedPhotos = [];
  }

  formatDate(val: string | undefined): string {
    if (!val || val === 'N/A' || val === 'TBD') return val || '';
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    if (/^[A-Za-z]{3}\s+\d{1,2},?\s+\d{4}$/.test(val.trim())) {
      return val.trim();
    }
    const d = new Date(val);
    if (!isNaN(d.getTime())) {
      return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
    }
    const parts = val.trim().split(/[-/]/);
    if (parts.length === 3) {
      let dObj: Date | null = null;
      if (parts[0].length === 4) dObj = new Date(+parts[0], +parts[1] - 1, +parts[2]);
      else if (parts[2].length === 4) dObj = new Date(+parts[2], +parts[1] - 1, +parts[0]);
      if (dObj && !isNaN(dObj.getTime())) {
        return `${months[dObj.getMonth()]} ${dObj.getDate()}, ${dObj.getFullYear()}`;
      }
    }
    return val;
  }

  formatDateDDMMYYYY(val: string | undefined | null): string {
    if (!val || val === 'N/A' || val === 'TBD') return '';
    const trimmed = String(val).trim();
    if (/^\d{2}-\d{2}-\d{4}$/.test(trimmed)) return trimmed;
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      const parts = trimmed.split('-');
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    const parts = trimmed.split(/[-/]/);
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        return `${parts[2].padStart(2, '0')}-${parts[1].padStart(2, '0')}-${parts[0]}`;
      }
      if (parts[2].length === 4) {
        return `${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}-${parts[2]}`;
      }
    }
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) {
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      return `${dd}-${mm}-${yyyy}`;
    }
    return val;
  }

  private getToday(): string {
    const d = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    if (typeof window !== 'undefined' && (window as any).RaigonModal === this) {
      (window as any).RaigonModal = null;
    }
    document.body.style.overflow = '';
  }
}
