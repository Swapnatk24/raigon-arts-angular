import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import {
  Customer,
  CustomerPhoto,
  CustomerService,
  FrameSize,
  resolvePhotoUrl
} from '../../services/customer.service';
import { ToastService } from '../../services/toast.service';
import { DatePickerComponent } from '../datepicker/datepicker';

export interface PhotoConfigItem {
  id?: string;
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
  file?: File;
}

export interface CustomerFormDraft {
  customerName: string;
  customerPhone: string;
  alternativePhone: string;
  customerCity: string;
  customerAddress: string;
  customerPincode: string;
  frameConfigMode: 'same' | 'individual';
  frameSize: string;
  unit: string;
  customWidth: string;
  customHeight: string;
  frameType: string;
  frameMaterial: string;
  frameColor: string;
  orientation: string;
  quantity: number | null;
  notes: string;
  selectedPhotos: PhotoConfigItem[];
  orderDate: string;
  deliveryDate: string;
  totalAmount: number | null;
  advancePaid: number | null;
  paymentStatus: string;
  orderStatus: string;
}

export interface FrameSizeDraft {
  formSizeId: string;
  formSizeName: string;
  formSizeWidth: number | null;
  formSizeHeight: number | null;
  formSizeUnit: string;
  formSizeCategory: string;
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

  // Unsaved Form Drafts (persists across modal close/exit without saving)
  private addCustomerDraft: CustomerFormDraft | null = null;
  private editCustomerDrafts: { [customerId: string]: CustomerFormDraft } = {};
  private addFrameSizeDraft: FrameSizeDraft | null = null;
  private editFrameSizeDrafts: { [sizeId: string]: FrameSizeDraft } = {};

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

  minDeliveryDate = 'today';

  get deliveryDateError(): string {
    if (!this.deliveryDate || !this.deliveryDate.trim()) {
      return '';
    }
    const parsed = this.parseDateString(this.deliveryDate);
    if (!parsed) {
      return 'Invalid date format';
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    parsed.setHours(0, 0, 0, 0);
    if (parsed.getTime() < today.getTime()) {
      return 'Expected delivery date cannot be a past date';
    }
    return '';
  }

  private parseDateString(val: string): Date | null {
    if (!val) return null;
    const trimmed = val.trim();
    const dmyMatch = trimmed.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
    if (dmyMatch) {
      const day = parseInt(dmyMatch[1], 10);
      const month = parseInt(dmyMatch[2], 10) - 1;
      const year = parseInt(dmyMatch[3], 10);
      const d = new Date(year, month, day);
      if (d.getFullYear() === year && d.getMonth() === month && d.getDate() === day) {
        return d;
      }
    }
    const ymdMatch = trimmed.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
    if (ymdMatch) {
      const year = parseInt(ymdMatch[1], 10);
      const month = parseInt(ymdMatch[2], 10) - 1;
      const day = parseInt(ymdMatch[3], 10);
      const d = new Date(year, month, day);
      if (d.getFullYear() === year && d.getMonth() === month && d.getDate() === day) {
        return d;
      }
    }
    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
    return null;
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

  // Frame Sizes list for dropdowns
  availableFrameSizes: FrameSize[] = [];

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
      this.customerService.frameSizes$.subscribe(sizes => {
        this.availableFrameSizes = (sizes || [])
          .map(s => ({
            ...s,
            category: (s.category === 'Custom Size' || s.category === 'Customize' || s.category?.toLowerCase() === 'custom') ? 'Customize' : s.category,
            name: this.cleanSize(s.name)
          }));
        this.cdr.markForCheck();
        this.cdr.detectChanges();
        setTimeout(() => {
          if (typeof window !== 'undefined' && window.RaigonSelect2) {
            window.RaigonSelect2.enhanceAll();
          }
        }, 0);
      })
    );

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

    this.customerService.fetchFrameSizes().subscribe();
  }

  cleanSize(size?: string): string {
    if (!size) return '';
    return size.replace(/\s*inch(es)?|\s*in\b/gi, '').trim();
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
        return 'Customize';
      }
    }
    if (!size) return '';
    const s = this.cleanSize(size);
    if (s.toLowerCase().includes('custom')) return 'Customize';

    // Direct match in available frame sizes
    const exact = this.availableFrameSizes.find(f => this.cleanSize(f.name).toLowerCase() === s.toLowerCase());
    if (exact) return this.cleanSize(exact.name);

    const match = s.match(/(\d+(?:\.\d+)?)\s*(?:[×xX*]|\s+by\s+|\s+)\s*(\d+(?:\.\d+)?)/);
    if (match) {
      const w = parseFloat(match[1]);
      const h = parseFloat(match[2]);
      const sizeMatch = this.availableFrameSizes.find(f =>
        (Number(f.width) === w && Number(f.height) === h) ||
        (Number(f.width) === h && Number(f.height) === w)
      );
      if (sizeMatch) return this.cleanSize(sizeMatch.name);
    }

    const partial = this.availableFrameSizes.find(f => this.cleanSize(f.name).toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(this.cleanSize(f.name).toLowerCase()));
    if (partial) return this.cleanSize(partial.name);

    return s;
  }

  private normalizeUnit(unit?: string): string {
    if (!unit) return '';
    const u = unit.trim().toLowerCase();
    if (u === 'cm' || u.includes('cent') || u.includes('cm')) return 'cm';
    if (u === 'inch' || u.includes('in')) return 'inch';
    const options = ['inch', 'cm'];
    const matched = options.find(o => o.toLowerCase() === u);
    return matched || '';
  }

  private normalizeFrameType(type?: string): string {
    if (!type) return '';
    const t = type.trim().toLowerCase();
    if (t.includes('wood')) return 'Wooden Frame';
    if (t.includes('prem')) return 'Premium Frame';
    if (t.includes('class')) return 'Classic Frame';
    if (t.includes('canvas') || t.includes('float')) return 'Canvas Float';
    if (t.includes('box')) return 'Box Frame';
    const options = ['Wooden Frame', 'Premium Frame', 'Classic Frame', 'Canvas Float', 'Box Frame'];
    const matched = options.find(o => o.toLowerCase() === t);
    return matched || t;
  }

  private normalizeOrientation(orientation?: string): string {
    if (!orientation) return '';
    const o = orientation.trim().toLowerCase();
    if (o.includes('land') || o.includes('horiz')) return 'Landscape';
    if (o.includes('port') || o.includes('vert')) return 'Portrait';
    if (o.includes('squ')) return 'Square';
    const options = ['Landscape', 'Portrait', 'Square'];
    const matched = options.find(opt => opt.toLowerCase() === o);
    return matched || o;
  }

  private normalizePaymentStatus(status?: string): string {
    if (!status) return '';
    const s = status.trim().toLowerCase();
    if (s.includes('unpaid') || s.includes('not paid') || s.includes('due') || s.includes('pend')) return 'Unpaid';
    if (s.includes('part')) return 'Partial';
    if (s.includes('paid') || s.includes('settle')) return 'Paid';
    const options = ['Unpaid', 'Partial', 'Paid'];
    const matched = options.find(o => o.toLowerCase() === s);
    return matched || s;
  }

  private normalizeOrderStatus(status?: string): string {
    if (!status) return '';
    const s = status.trim().toLowerCase();
    if (s.includes('prog') || s.includes('process')) return 'In Progress';
    if (s.includes('pend') || s.includes('new')) return 'Pending';
    if (s.includes('comp') || s.includes('deliv') || s.includes('done')) return 'Completed';
    if (s.includes('canc')) return 'Cancelled';
    const options = ['Pending', 'In Progress', 'Completed', 'Cancelled'];
    const matched = options.find(o => o.toLowerCase() === s);
    return matched || s;
  }

  // =========================================
  // DRAFT CAPTURE & RESTORE HELPERS
  // =========================================
  private captureCurrentCustomerDraft(): CustomerFormDraft {
    return {
      customerName: this.customerName,
      customerPhone: this.customerPhone,
      alternativePhone: this.alternativePhone,
      customerCity: this.customerCity,
      customerAddress: this.customerAddress,
      customerPincode: this.customerPincode,
      frameConfigMode: this.frameConfigMode,
      frameSize: this.frameSize,
      unit: this.unit,
      customWidth: this.customWidth,
      customHeight: this.customHeight,
      frameType: this.frameType,
      frameMaterial: this.frameMaterial,
      frameColor: this.frameColor,
      orientation: this.orientation,
      quantity: this.quantity,
      notes: this.notes,
      selectedPhotos: this.selectedPhotos.map(p => ({ ...p })),
      orderDate: this.orderDate,
      deliveryDate: this.deliveryDate,
      totalAmount: this.totalAmount,
      advancePaid: this.advancePaid,
      paymentStatus: this.paymentStatus,
      orderStatus: this.orderStatus
    };
  }

  private applyCustomerDraft(draft: CustomerFormDraft): void {
    this.nameTouched = false;
    this.phoneTouched = false;
    this.isSubmitted = false;

    this.customerName = draft.customerName || '';
    this.customerPhone = draft.customerPhone || '';
    this.alternativePhone = draft.alternativePhone || '';
    this.customerCity = draft.customerCity || '';
    this.customerAddress = draft.customerAddress || '';
    this.customerPincode = draft.customerPincode || '';
    this.frameConfigMode = draft.frameConfigMode || 'same';
    this.frameSize = draft.frameSize || '';
    this.unit = draft.unit || '';
    this.customWidth = draft.customWidth || '';
    this.customHeight = draft.customHeight || '';
    this.frameType = draft.frameType || '';
    this.frameMaterial = draft.frameMaterial || '';
    this.frameColor = draft.frameColor || '';
    this.orientation = draft.orientation || '';
    this.quantity = draft.quantity ?? null;
    this.notes = draft.notes || '';
    this.selectedPhotos = (draft.selectedPhotos || []).map(p => ({ ...p }));
    this.orderDate = this.formatDateDDMMYYYY(draft.orderDate) || this.getToday();
    this.deliveryDate = draft.deliveryDate || '';
    this.totalAmount = draft.totalAmount ?? null;
    this.advancePaid = draft.advancePaid ?? null;
    this.paymentStatus = draft.paymentStatus || '';
    this.orderStatus = draft.orderStatus || '';
  }

  // =========================================
  // MODAL CONTROLS
  // =========================================
  openAddCustomerModal(defaultDeliveryDate?: string): void {
    this.isEditMode = false;
    this.editingCustomerId = null;

    if (this.addCustomerDraft) {
      this.applyCustomerDraft(this.addCustomerDraft);
      if (defaultDeliveryDate && !this.deliveryDate) {
        this.deliveryDate = this.formatDateDDMMYYYY(defaultDeliveryDate);
      }
    } else {
      this.resetForm();
      if (defaultDeliveryDate) {
        this.deliveryDate = this.formatDateDDMMYYYY(defaultDeliveryDate);
      }
    }

    this.showAddCustomerModal = true;
    document.body.style.overflow = 'hidden';
    this.cdr.detectChanges();
    setTimeout(() => {
      if (typeof window !== 'undefined' && window.RaigonSelect2) {
        window.RaigonSelect2.enhanceAll();
      }
    }, 0);
  }

  openEditCustomerModal(customer: Customer): void {
    this.isEditMode = true;
    this.editingCustomerId = customer.id;

    if (this.editCustomerDrafts[customer.id]) {
      this.applyCustomerDraft(this.editCustomerDrafts[customer.id]);
    } else {
      this.resetForm();
      this.isEditMode = true;
      this.editingCustomerId = customer.id;

      this.customerName = customer.name || '';
      this.customerPhone = customer.phone || '';
      this.alternativePhone = customer.alternativePhone || customer.altPhone || '';
      this.customerCity = customer.city || 'Trivandrum';
      this.customerAddress = customer.address || '';
      this.customerPincode = customer.pincode || '';

      const firstPhoto = (customer.photos && customer.photos.length > 0) ? customer.photos[0] : null;

      this.frameConfigMode = customer.frameConfigMode || 'same';

      this.frameSize = this.normalizeFrameSize(
        customer.frameSize || firstPhoto?.frameSize || '',
        customer.customWidth || firstPhoto?.customWidth,
        customer.customHeight || firstPhoto?.customHeight
      );
      this.unit = this.normalizeUnit(
        customer.unit || firstPhoto?.unit || ''
      );
      this.customWidth = customer.customWidth ? String(customer.customWidth) : (firstPhoto?.customWidth ? String(firstPhoto.customWidth) : '');
      this.customHeight = customer.customHeight ? String(customer.customHeight) : (firstPhoto?.customHeight ? String(firstPhoto.customHeight) : '');
      this.frameType = this.normalizeFrameType(customer.frameType || firstPhoto?.frameType || '');
      this.frameMaterial = customer.frameMaterial || customer.material || firstPhoto?.frameMaterial || firstPhoto?.material || '';
      this.frameColor = customer.frameColor || customer.color || firstPhoto?.frameColor || firstPhoto?.color || '';
      this.quantity = (customer.quantity !== undefined && customer.quantity !== null)
        ? Number(customer.quantity)
        : (firstPhoto?.quantity ? Number(firstPhoto.quantity) : null);
      this.notes = customer.notes || (this.frameConfigMode === 'same' ? (firstPhoto?.notes || '') : '');

      this.orderDate = this.formatDateDDMMYYYY(customer.orderDate) || this.getToday();
      this.deliveryDate = this.formatDateDDMMYYYY(customer.deliveryDate);
      this.totalAmount = customer.totalAmount !== undefined && customer.totalAmount !== null ? Number(customer.totalAmount) : 0;
      this.advancePaid = customer.advancePaid !== undefined && customer.advancePaid !== null ? Number(customer.advancePaid) : 0;
      this.paymentStatus = this.normalizePaymentStatus(customer.paymentStatus || '');
      this.orderStatus = this.normalizeOrderStatus(customer.orderStatus || '');

      if (customer.photos && customer.photos.length > 0) {
        this.selectedPhotos = customer.photos.map(p => ({
          id: p.id,
          name: p.name,
          url: resolvePhotoUrl(p.url),
          size: p.size || '2.5 MB',
          frameSize: this.normalizeFrameSize(
            this.frameConfigMode === 'same' ? this.frameSize : (p.frameSize || this.frameSize),
            p.customWidth,
            p.customHeight
          ),
          unit: this.normalizeUnit(this.frameConfigMode === 'same' ? this.unit : (p.unit || this.unit)),
          customWidth: p.customWidth ? String(p.customWidth) : '',
          customHeight: p.customHeight ? String(p.customHeight) : '',
          frameType: this.normalizeFrameType(this.frameConfigMode === 'same' ? this.frameType : (p.frameType || this.frameType)),
          frameMaterial: (this.frameConfigMode === 'same' ? this.frameMaterial : (p.frameMaterial || p.material || this.frameMaterial)) || '',
          frameColor: (this.frameConfigMode === 'same' ? this.frameColor : (p.frameColor || p.color || this.frameColor)) || '',
          orientation: this.normalizeOrientation(this.frameConfigMode === 'same' ? this.orientation : (p.orientation || this.orientation)),
          quantity: this.frameConfigMode === 'same'
            ? (this.quantity ? Number(this.quantity) : (p.quantity ? Number(p.quantity) : undefined))
            : (p.quantity ? Number(p.quantity) : (this.quantity ? Number(this.quantity) : undefined)),
          notes: this.frameConfigMode === 'individual' ? (p.notes || '') : ''
        }));
      } else {
        this.selectedPhotos = [];
      }
    }

    this.showAddCustomerModal = true;
    document.body.style.overflow = 'hidden';
    this.cdr.detectChanges();
    setTimeout(() => {
      if (typeof window !== 'undefined' && window.RaigonSelect2) {
        window.RaigonSelect2.enhanceAll();
      }
    }, 0);
  }

  closeAddCustomerModal(): void {
    if (this.showAddCustomerModal) {
      if (this.isEditMode && this.editingCustomerId) {
        this.editCustomerDrafts[this.editingCustomerId] = this.captureCurrentCustomerDraft();
      } else if (!this.isEditMode) {
        this.addCustomerDraft = this.captureCurrentCustomerDraft();
      }
    }
    this.showAddCustomerModal = false;
    this.isEditMode = false;
    this.editingCustomerId = null;
    document.body.style.overflow = '';
    this.cdr.detectChanges();
  }

  openViewCustomerModal(customer: Customer): void {
    this.viewCustomerData = {
      ...customer,
      photos: (customer.photos || []).map(p => ({
        ...p,
        url: resolvePhotoUrl(p.url)
      }))
    };
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

  rawLightboxTitle = '';

  formatLightboxTitle(title?: string): string {
    if (!title) return '';
    const clean = title.trim();
    return clean.length > 10 ? clean.substring(0, 10) + '...' : clean;
  }

  openLightbox(url: string, title: string = 'Photo Preview'): void {
    this.lightboxImageUrl = url;
    this.rawLightboxTitle = title || 'photo';
    this.lightboxTitle = this.formatLightboxTitle(title);
    this.showLightboxModal = true;
    this.cdr.detectChanges();
  }

  closeLightbox(): void {
    this.showLightboxModal = false;
    this.lightboxImageUrl = '';
    this.rawLightboxTitle = '';
    this.cdr.detectChanges();
  }

  downloadLightbox(): void {
    if (!this.lightboxImageUrl) return;
    const a = document.createElement('a');
    a.href = this.lightboxImageUrl;
    a.download = (this.rawLightboxTitle || this.lightboxTitle || 'photo').replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.jpg';
    a.click();
  }

  openFrameSizeModal(frameSize: FrameSize | null = null): void {
    if (frameSize) {
      this.formSizeId = frameSize.id;
      if (this.editFrameSizeDrafts[frameSize.id]) {
        const draft = this.editFrameSizeDrafts[frameSize.id];
        this.formSizeName = draft.formSizeName;
        this.formSizeWidth = draft.formSizeWidth;
        this.formSizeHeight = draft.formSizeHeight;
        this.formSizeUnit = draft.formSizeUnit;
        this.formSizeCategory = draft.formSizeCategory;
      } else {
        this.formSizeName = frameSize.name;
        this.formSizeWidth = frameSize.width;
        this.formSizeHeight = frameSize.height;
        this.formSizeUnit = frameSize.unit || '';
        this.formSizeCategory = frameSize.category || '';
      }
    } else {
      this.formSizeId = '';
      if (this.addFrameSizeDraft) {
        this.formSizeName = this.addFrameSizeDraft.formSizeName;
        this.formSizeWidth = this.addFrameSizeDraft.formSizeWidth;
        this.formSizeHeight = this.addFrameSizeDraft.formSizeHeight;
        this.formSizeUnit = this.addFrameSizeDraft.formSizeUnit;
        this.formSizeCategory = this.addFrameSizeDraft.formSizeCategory;
      } else {
        this.formSizeName = '';
        this.formSizeWidth = null;
        this.formSizeHeight = null;
        this.formSizeUnit = '';
        this.formSizeCategory = '';
      }
    }
    this.showFrameSizeModal = true;
    document.body.style.overflow = 'hidden';
    this.cdr.detectChanges();
  }

  closeFrameSizeModal(): void {
    if (this.showFrameSizeModal) {
      if (this.formSizeId) {
        this.editFrameSizeDrafts[this.formSizeId] = {
          formSizeId: this.formSizeId,
          formSizeName: this.formSizeName,
          formSizeWidth: this.formSizeWidth,
          formSizeHeight: this.formSizeHeight,
          formSizeUnit: this.formSizeUnit,
          formSizeCategory: this.formSizeCategory
        };
      } else {
        this.addFrameSizeDraft = {
          formSizeId: '',
          formSizeName: this.formSizeName,
          formSizeWidth: this.formSizeWidth,
          formSizeHeight: this.formSizeHeight,
          formSizeUnit: this.formSizeUnit,
          formSizeCategory: this.formSizeCategory
        };
      }
    }
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

    const category = (this.formSizeCategory === 'Custom Size' || this.formSizeCategory === 'Customize' || this.formSizeCategory?.toLowerCase() === 'custom')
      ? 'Customize'
      : (this.formSizeCategory || 'Standard Photo');

    const sizeData: FrameSize = {
      id: this.formSizeId || '',
      name,
      width,
      height,
      unit: this.formSizeUnit || 'inch',
      category,
      status: 'Active',
      activeOrdersCount: 0,
      usageCount: 0
    };

    this.customerService.saveFrameSize(sizeData).subscribe({
      next: (saved) => {
        if (this.formSizeId) {
          delete this.editFrameSizeDrafts[this.formSizeId];
        } else {
          this.addFrameSizeDraft = null;
        }
        this.toastService.success(`Frame size "${saved.name || name}" saved!`);
        this.showFrameSizeModal = false;
        this.formSizeId = '';
        this.formSizeName = '';
        this.formSizeWidth = null;
        this.formSizeHeight = null;
        this.formSizeUnit = '';
        this.formSizeCategory = '';
        document.body.style.overflow = '';
        this.cdr.detectChanges();
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
          file: file,
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
        this.selectedPhotos[index].file = file;
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
      case 'Pending': return 'badge-pending';
      default: return '';
    }
  }

  getSameFrameNotes(customer?: Customer | null): string {
    if (!customer) return '';
    if (customer.notes && customer.notes.trim()) {
      return customer.notes.trim();
    }
    if (customer.photos && customer.photos.length > 0) {
      const pWithNotes = customer.photos.find(p => p.notes && p.notes.trim());
      if (pWithNotes && pWithNotes.notes) {
        return pWithNotes.notes.trim();
      }
    }
    return '';
  }

  isIndividualMode(customer?: Customer | null): boolean {
    if (!customer) return false;
    const mode = (customer.frameConfigMode || '').toLowerCase();
    if (mode === 'individual') return true;
    if (mode === 'same') return false;
    if (customer.photos && customer.photos.length > 1) {
      const firstSize = customer.photos[0].frameSize || '';
      const hasDistinct = customer.photos.some(p => (p.frameSize || '') !== firstSize);
      if (hasDistinct) return true;
    }
    return false;
  }

  // =========================================
  // SAVE / UPDATE CUSTOMER
  // =========================================
  saveCustomer(): void {
    this.isSubmitted = true;
    this.nameTouched = true;
    this.phoneTouched = true;

    if (this.nameError || this.phoneError || this.deliveryDateError) {
      return;
    }

    const name = this.customerName ? this.customerName.trim() : '';
    const phone = this.customerPhone ? this.customerPhone.trim() : '';

    const photosToUpload = this.selectedPhotos.filter(p => !!p.file);

    if (photosToUpload.length > 0) {
      const files = photosToUpload.map(p => p.file!);
      this.customerService.uploadPhotos(files).subscribe({
        next: (uploadedList) => {
          if (Array.isArray(uploadedList)) {
            uploadedList.forEach((uploaded, idx) => {
              const target = photosToUpload[idx];
              if (target && (uploaded.photoUrl || (uploaded as any).url)) {
                target.url = resolvePhotoUrl(uploaded.photoUrl || (uploaded as any).url);
                target.file = undefined;
              }
            });
          }
          this.executeSaveCustomer(name, phone);
        },
        error: (err) => {
          console.warn('Photo upload fallback, continuing to save customer:', err);
          this.executeSaveCustomer(name, phone);
        }
      });
    } else {
      this.executeSaveCustomer(name, phone);
    }
  }

  private executeSaveCustomer(name: string, phone: string): void {
    const total = Number(this.totalAmount) || 0;
    const advance = Number(this.advancePaid) || 0;
    const balance = Math.max(total - advance, 0);

    const customWidth = this.customWidth;
    const customHeight = this.customHeight;

    const photosPayload: CustomerPhoto[] = this.selectedPhotos.map((p, idx) => ({
      id: p.id || `P-${Date.now()}-${idx + 1}`,
      name: p.name,
      url: resolvePhotoUrl(p.url),
      size: p.size || '2.5 MB',
      frameSize: this.frameConfigMode === 'individual' ? (p.frameSize || this.frameSize || '') : (this.frameSize || p.frameSize || ''),
      unit: this.frameConfigMode === 'individual' ? (p.unit || this.unit || '') : (this.unit || p.unit || ''),
      customWidth: p.customWidth ? Number(p.customWidth) : (customWidth ? Number(customWidth) : undefined),
      customHeight: p.customHeight ? Number(p.customHeight) : (customHeight ? Number(customHeight) : undefined),
      frameType: this.frameConfigMode === 'individual' ? (p.frameType || this.frameType || '') : (this.frameType || p.frameType || ''),
      material: this.frameConfigMode === 'individual' ? (p.frameMaterial || this.frameMaterial || '') : (this.frameMaterial || p.frameMaterial || ''),
      frameMaterial: this.frameConfigMode === 'individual' ? (p.frameMaterial || this.frameMaterial || '') : (this.frameMaterial || p.frameMaterial || ''),
      color: this.frameConfigMode === 'individual' ? (p.frameColor || this.frameColor || '') : (this.frameColor || p.frameColor || ''),
      frameColor: this.frameConfigMode === 'individual' ? (p.frameColor || this.frameColor || '') : (this.frameColor || p.frameColor || ''),
      orientation: this.frameConfigMode === 'individual' ? (p.orientation || this.orientation || '') : (this.orientation || p.orientation || ''),
      quantity: this.frameConfigMode === 'individual'
        ? (p.quantity !== undefined && p.quantity !== null ? Number(p.quantity) : (this.quantity ? Number(this.quantity) : undefined))
        : (this.quantity ? Number(this.quantity) : undefined),
      notes: this.frameConfigMode === 'individual' ? (p.notes || '') : ''
    }));

    const finalId = this.isEditMode && this.editingCustomerId
      ? this.editingCustomerId
      : this.customerService.generateCustomerId();

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
        ? (this.selectedPhotos[0].frameSize || this.frameSize || '')
        : (this.frameSize || ''),
      customSize: (this.frameSize === 'Customize' || this.frameSize === 'Custom Size') ? `${customWidth || ''} × ${customHeight || ''} ${this.unit || 'inch'}` : '',
      customWidth: (customWidth && !isNaN(Number(customWidth))) ? Number(customWidth) : undefined,
      customHeight: (customHeight && !isNaN(Number(customHeight))) ? Number(customHeight) : undefined,
      frameType: this.frameConfigMode === 'individual' && this.selectedPhotos.length > 0
        ? (this.selectedPhotos[0].frameType || this.frameType || '')
        : (this.frameType || ''),
      frameMaterial: this.frameConfigMode === 'individual' && this.selectedPhotos.length > 0
        ? (this.selectedPhotos[0].frameMaterial || this.frameMaterial || '')
        : (this.frameMaterial.trim() || ''),
      material: this.frameConfigMode === 'individual' && this.selectedPhotos.length > 0
        ? (this.selectedPhotos[0].frameMaterial || this.frameMaterial || '')
        : (this.frameMaterial.trim() || ''),
      frameColor: this.frameConfigMode === 'individual' && this.selectedPhotos.length > 0
        ? (this.selectedPhotos[0].frameColor || this.frameColor || '')
        : (this.frameColor.trim() || ''),
      color: this.frameConfigMode === 'individual' && this.selectedPhotos.length > 0
        ? (this.selectedPhotos[0].frameColor || this.frameColor || '')
        : (this.frameColor.trim() || ''),
      unit: this.frameConfigMode === 'individual' && this.selectedPhotos.length > 0
        ? (this.selectedPhotos[0].unit || this.unit || '')
        : (this.unit || ''),
      orientation: this.frameConfigMode === 'individual' && this.selectedPhotos.length > 0
        ? (this.selectedPhotos[0].orientation || this.orientation || '')
        : (this.orientation || ''),
      quantity: this.frameConfigMode === 'individual' && this.selectedPhotos.length > 0
        ? (this.selectedPhotos[0].quantity !== undefined && this.selectedPhotos[0].quantity !== null ? Number(this.selectedPhotos[0].quantity) : (this.quantity ? Number(this.quantity) : undefined))
        : (this.quantity !== null && this.quantity !== undefined ? Number(this.quantity) : undefined),
      totalAmount: total,
      advancePaid: advance,
      balanceAmount: balance,
      paymentStatus: this.paymentStatus || '',
      orderStatus: this.orderStatus || '',
      orderDate: this.orderDate || this.getToday(),
      deliveryDate: this.deliveryDate || '',
      notes: this.notes.trim(),
      photos: photosPayload,
      frameConfigMode: this.frameConfigMode,
      isArchived7Days: false
    };

    if (this.isEditMode) {
      if (this.editingCustomerId) {
        delete this.editCustomerDrafts[this.editingCustomerId];
      }
      this.customerService.updateCustomer(customerPayload);
      this.toastService.success(`Customer ${customerPayload.id} updated successfully! Opening WhatsApp Receipt...`);

      setTimeout(() => {
        this.customerService.sendWhatsAppReceipt(customerPayload);
      }, 400);
    } else {
      this.addCustomerDraft = null;
      const saved = this.customerService.saveCustomer(customerPayload);
      this.toastService.success(`Customer ${saved.id} saved successfully! Opening WhatsApp Receipt...`);

      // Automatically prompt / send WhatsApp Receipt with Order ID, Price, Delivery Date, etc.
      setTimeout(() => {
        this.customerService.sendWhatsAppReceipt(saved);
      }, 400);
    }

    this.showAddCustomerModal = false;
    this.isEditMode = false;
    this.editingCustomerId = null;
    document.body.style.overflow = '';
    this.resetForm();
    this.cdr.detectChanges();
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

  formatDate(val: string | undefined | null): string {
    if (!val || val === 'N/A' || val === 'TBD') return val || '';
    const str = String(val).trim();

    // If already in DD-MM-YYYY or DD/MM/YYYY format
    const dmyMatch = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
    if (dmyMatch) {
      const dd = dmyMatch[1].padStart(2, '0');
      const mm = dmyMatch[2].padStart(2, '0');
      const yyyy = dmyMatch[3];
      return `${dd}/${mm}/${yyyy}`;
    }

    // If in YYYY-MM-DD or YYYY/MM/DD format
    const ymdMatch = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
    if (ymdMatch) {
      const yyyy = ymdMatch[1];
      const mm = ymdMatch[2].padStart(2, '0');
      const dd = ymdMatch[3].padStart(2, '0');
      return `${dd}/${mm}/${yyyy}`;
    }

    // If text date like "Sep 17, 2026", "17 Sep 2026", etc.
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      return `${dd}/${mm}/${yyyy}`;
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
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    if (typeof window !== 'undefined' && (window as any).RaigonModal === this) {
      (window as any).RaigonModal = null;
    }
    document.body.style.overflow = '';
  }
}
