import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Subject, Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface CustomerPhoto {
  id?: string;
  name: string;
  url: string;
  size?: string;
  frameSize?: string;
  unit?: string;
  customWidth?: number;
  customHeight?: number;
  frameType?: string;
  material?: string;
  frameMaterial?: string;
  color?: string;
  frameColor?: string;
  orientation?: string;
  quantity?: number;
  notes?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  altPhone?: string;
  alternativePhone?: string;
  city: string;
  address: string;
  pincode: string;
  frameSize: string;
  customSize?: string;
  customWidth?: number;
  customHeight?: number;
  frameType: string;
  frameMaterial?: string;
  material?: string;
  frameColor?: string;
  color?: string;
  unit: string;
  orientation: string;
  quantity: number;
  totalAmount: number;
  advancePaid: number;
  balanceAmount: number;
  paymentStatus: string;
  orderStatus: string;
  orderDate: string;
  deliveryDate: string;
  notes: string;
  photos: CustomerPhoto[];
  frameConfigMode?: 'same' | 'individual';
  isArchived7Days?: boolean;
}

export interface FrameSize {
  id: string;
  code?: string;
  name: string;
  width: number;
  height: number;
  unit: string;
  category: string;
  activeOrdersCount?: number;
  usageCount?: number;
  status?: string;
}

export const STORAGE_KEYS = {
  CUSTOMERS: 'raigon_arts_customers',
  FRAME_SIZES: 'raigon_arts_frame_sizes'
};

const INITIAL_FRAME_SIZES: FrameSize[] = [
  { id: 'FS-01', name: '4 × 6 ', width: 4, height: 6, unit: 'inch', category: 'Standard Photo', usageCount: 142, status: 'Active' },
  { id: 'FS-02', name: '5 × 7 ', width: 5, height: 7, unit: 'inch', category: 'Standard Photo', usageCount: 98, status: 'Active' },
  { id: 'FS-03', name: '8 × 10 ', width: 8, height: 10, unit: 'inch', category: 'Medium Portrait', usageCount: 210, status: 'Active' },
  { id: 'FS-04', name: '8 × 12 ', width: 8, height: 12, unit: 'inch', category: 'Medium Portrait', usageCount: 320, status: 'Active' },
  { id: 'FS-05', name: '12 × 18 ', width: 12, height: 18, unit: 'inch', category: 'Large Gallery', usageCount: 455, status: 'Active' },
  { id: 'FS-06', name: '16 × 20 ', width: 16, height: 20, unit: 'inch', category: 'Large Gallery', usageCount: 184, status: 'Active' },
  { id: 'FS-07', name: '20 × 30 ', width: 20, height: 30, unit: 'inch', category: 'Exhibition Wall Art', usageCount: 92, status: 'Active' }
];

export function formatDateDisplay(val: string | undefined | null): string {
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

function toIsoDateString(val: string | undefined | null): string | undefined {
  if (!val || val === 'N/A' || val === 'TBD') return undefined;
  const trimmed = String(val).trim();
  const parts = trimmed.split(/[-/]/);
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
    }
    if (parts[2].length === 4) {
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
  }
  const d = new Date(trimmed);
  if (!isNaN(d.getTime())) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
  return val;
}

const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'RA-1001',
    name: 'Arun Kumar',
    phone: '+91 7934567843',
    altPhone: '+91 9447000000',
    alternativePhone: '+91 9447000000',
    city: 'Trivandrum',
    address: 'Villa 42, Palm Meadows, Kowdiar',
    pincode: '695003',
    frameSize: '12 × 18 ',
    frameType: 'Wooden Frame',
    frameMaterial: 'Teak Wood Moulding',
    material: 'Teak Wood Moulding',
    frameColor: 'Walnut Brown',
    color: 'Walnut Brown',
    unit: 'inch',
    orientation: 'Landscape',
    quantity: 2,
    totalAmount: 4500,
    advancePaid: 0,
    balanceAmount: 4500,
    paymentStatus: 'Unpaid',
    orderStatus: 'Cancelled',
    orderDate: 'Aug 28, 2026',
    deliveryDate: 'Sep 02, 2026',
    notes: 'Cancelled on client request',
    photos: [
      {
        id: 'p1',
        name: 'Family_Portrait_Kowdiar.jpg',
        url: 'https://assets.raigonarts.com/photos/family_kowdiar.jpg',
        frameSize: '12 × 18 ',
        frameType: 'Wooden Frame',
        frameMaterial: 'Teak Wood Moulding',
        frameColor: 'Walnut Brown',
        orientation: 'Landscape',
        quantity: 2
      }
    ],
    frameConfigMode: 'same'
  },
  {
    id: 'RA-1003',
    name: 'Rahul Raj',
    phone: '+91 9446554433',
    altPhone: '+91 9846001122',
    alternativePhone: '+91 9846001122',
    city: 'Kollam',
    address: 'Rose Villa, Beach Road',
    pincode: '691001',
    frameSize: '20 × 30 ',
    frameType: 'Premium Frame',
    frameMaterial: 'Gold Leaf Carved',
    material: 'Gold Leaf Carved',
    frameColor: 'Antique Gold',
    color: 'Antique Gold',
    unit: 'inch',
    orientation: 'Portrait',
    quantity: 1,
    totalAmount: 12000,
    advancePaid: 12000,
    balanceAmount: 0,
    paymentStatus: 'Paid',
    orderStatus: 'Completed',
    orderDate: 'Aug 29, 2026',
    deliveryDate: 'Sep 05, 2026',
    notes: 'Fully settled and delivered',
    photos: [
      {
        id: 'p2',
        name: 'Studio_Portraits.jpg',
        url: 'https://assets.raigonarts.com/photos/studio_portraits.jpg',
        frameSize: '20 × 30 ',
        frameType: 'Premium Frame',
        frameMaterial: 'Gold Leaf Carved',
        frameColor: 'Antique Gold',
        orientation: 'Portrait',
        quantity: 1
      }
    ],
    frameConfigMode: 'same'
  },
  {
    id: 'RA-1006',
    name: 'Arun Kumar',
    phone: '+91 7934567843',
    altPhone: '+91 9447000000',
    alternativePhone: '+91 9447000000',
    city: 'Trivandrum',
    address: 'Villa 42, Palm Meadows, Kowdiar',
    pincode: '695003',
    frameSize: '12 × 18 ',
    frameType: 'Wooden Frame',
    frameMaterial: 'Teak Wood Moulding',
    material: 'Teak Wood Moulding',
    frameColor: 'Walnut Brown',
    color: 'Walnut Brown',
    unit: 'inch',
    orientation: 'Landscape',
    quantity: 1,
    totalAmount: 2500,
    advancePaid: 1000,
    balanceAmount: 1500,
    paymentStatus: 'Partial',
    orderStatus: 'In Progress',
    orderDate: 'Sep 01, 2026',
    deliveryDate: 'Sep 08, 2026',
    notes: 'Anti-glare glass coating with back mounting hook',
    photos: [
      {
        id: 'p6',
        name: 'Gallery_Memory.jpg',
        url: 'https://assets.raigonarts.com/photos/gallery_memory.jpg',
        frameSize: '12 × 18 ',
        frameType: 'Wooden Frame',
        frameMaterial: 'Teak Wood Moulding',
        frameColor: 'Walnut Brown',
        orientation: 'Landscape',
        quantity: 1
      }
    ],
    frameConfigMode: 'same'
  }
];

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private http = inject(HttpClient);

  private readonly ordersApiUrl = `${environment.apiUrl}/api/v1/orders`;
  private readonly customersApiUrl = `${environment.apiUrl}/api/v1/customers`;
  private readonly frameSizesApiUrl = `${environment.apiUrl}/api/v1/frames`;

  private frameSizesSubject = new BehaviorSubject<FrameSize[]>(this.loadFrameSizesFromStorage());
  frameSizes$ = this.frameSizesSubject.asObservable();

  private customersSubject = new BehaviorSubject<Customer[]>(this.loadCustomersFromStorage());
  customers$ = this.customersSubject.asObservable();

  private openCustomerModalSubject = new Subject<Customer | null>();
  private openViewModalSubject = new Subject<Customer>();
  private openFrameSizeModalSubject = new Subject<FrameSize | null>();
  private openLightboxSubject = new Subject<{ url: string; title: string }>();

  openCustomerModal$ = this.openCustomerModalSubject.asObservable();
  openViewModal$ = this.openViewModalSubject.asObservable();
  openFrameSizeModal$ = this.openFrameSizeModalSubject.asObservable();
  openLightbox$ = this.openLightboxSubject.asObservable();

  private searchSubject = new BehaviorSubject<string>('');
  search$ = this.searchSubject.asObservable();
  searchQuery$ = this.searchSubject.asObservable();

  constructor() {
    this.syncFromBackendApi();
  }

  setGlobalSearch(query: string): void {
    this.searchSubject.next(query);
  }

  getSearchQuery(): string {
    return this.searchSubject.value;
  }

  fetchFrameSizes(): Observable<FrameSize[]> {
    return this.http.get<any>(this.frameSizesApiUrl).pipe(
      map(res => {
        const items = res?.data || [];
        if (Array.isArray(items) && items.length > 0) {
          const apiSizes: FrameSize[] = items.map((f: any) => ({
            id: f.id,
            code: f.code || f.id,
            name: f.name,
            width: Number(f.width) || 0,
            height: Number(f.height) || 0,
            unit: f.unit || 'inch',
            category: f.category || 'Standard Photo',
            activeOrdersCount: f.activeOrdersCount || 0,
            usageCount: f.activeOrdersCount || 0,
            status: f.status || 'Active'
          }));
          this.saveFrameSizesToStorage(apiSizes);
          this.frameSizesSubject.next(apiSizes);
          return apiSizes;
        }
        return this.frameSizesSubject.value;
      }),
      catchError(err => {
        console.warn('Frame sizes API sync failed, using cache:', err?.message || err);
        return of(this.frameSizesSubject.value);
      })
    );
  }

  syncFromBackendApi(): void {
    this.fetchFrameSizes().subscribe();
    this.http.get<any>(this.ordersApiUrl).subscribe({
      next: (res) => {
        const orders = res?.data?.orders || [];
        if (Array.isArray(orders) && orders.length > 0) {
          const apiCustomers: Customer[] = orders.map((o: any) => {
            const commonSpecs = o.commonSpecs || {};
            const firstPhoto = (o.photos && o.photos.length > 0) ? o.photos[0] : {};

            return {
              id: o.orderNumber || o.id,
              name: o.customerName || (o.customer && o.customer.name) || 'Customer',
              phone: o.customerPhone || (o.customer && o.customer.phone) || '',
              altPhone: o.customerAltPhone || (o.customer && (o.customer.altPhone || o.customer.alternativePhone)) || '',
              alternativePhone: o.customerAltPhone || (o.customer && (o.customer.altPhone || o.customer.alternativePhone)) || '',
              address: o.customerAddress || (o.customer && o.customer.address) || '',
              city: o.customerCity || (o.customer && o.customer.city) || 'Trivandrum',
              pincode: o.customerPincode || (o.customer && o.customer.pincode) || '',
              frameSize: commonSpecs.frameSize || firstPhoto.frameSize || '12 × 18 ',
              customSize: commonSpecs.customSize || '',
              customWidth: commonSpecs.customWidth,
              customHeight: commonSpecs.customHeight,
              frameType: commonSpecs.frameType || firstPhoto.frameType || 'Wooden Frame',
              frameMaterial: commonSpecs.frameMaterial || firstPhoto.frameMaterial || 'Teak Wood Moulding',
              material: commonSpecs.frameMaterial || firstPhoto.frameMaterial || 'Teak Wood Moulding',
              frameColor: commonSpecs.frameColor || firstPhoto.frameColor || 'Walnut Brown',
              color: commonSpecs.frameColor || firstPhoto.frameColor || 'Walnut Brown',
              unit: commonSpecs.unit || firstPhoto.unit || 'inch',
              orientation: commonSpecs.orientation || firstPhoto.orientation || 'Landscape',
              quantity: commonSpecs.quantity || firstPhoto.quantity || 1,
              photos: (o.photos || []).flatMap((p: any) => {
                const rawName = p.photoName || p.name || 'photo.jpg';
                const rawUrl = p.photoUrl || p.url || 'assets/images/sample_frame_1.jpg';
                const names = rawName.split(/,\s*|\n/).map((s: string) => s.trim()).filter((s: string) => !!s);
                const urls = rawUrl.split(/\s*\|\|\s*|\n/).map((s: string) => s.trim()).filter((s: string) => !!s);
                const count = Math.max(names.length, urls.length);
                if (count <= 1) {
                  return [{
                    id: p.id,
                    name: names[0] || rawName,
                    url: urls[0] || rawUrl,
                    frameSize: p.frameSize || commonSpecs.frameSize || '12 × 18 ',
                    unit: p.unit || commonSpecs.unit || 'inch',
                    frameType: p.frameType || commonSpecs.frameType || 'Wooden Frame',
                    material: p.frameMaterial || commonSpecs.frameMaterial || 'Teak Wood Moulding',
                    frameMaterial: p.frameMaterial || commonSpecs.frameMaterial || 'Teak Wood Moulding',
                    color: p.frameColor || commonSpecs.frameColor || 'Walnut Brown',
                    frameColor: p.frameColor || commonSpecs.frameColor || 'Walnut Brown',
                    orientation: p.orientation || commonSpecs.orientation || 'Landscape',
                    quantity: p.quantity || commonSpecs.quantity || 1
                  }];
                }
                return Array.from({ length: count }, (_, i) => ({
                  id: `${p.id}_${i + 1}`,
                  name: names[i] || names[0] || `photo_${i + 1}.jpg`,
                  url: urls[i] || urls[0] || 'assets/images/sample_frame_1.jpg',
                  frameSize: p.frameSize || commonSpecs.frameSize || '12 × 18 ',
                  unit: p.unit || commonSpecs.unit || 'inch',
                  frameType: p.frameType || commonSpecs.frameType || 'Wooden Frame',
                  material: p.frameMaterial || commonSpecs.frameMaterial || 'Teak Wood Moulding',
                  frameMaterial: p.frameMaterial || commonSpecs.frameMaterial || 'Teak Wood Moulding',
                  color: p.frameColor || commonSpecs.frameColor || 'Walnut Brown',
                  frameColor: p.frameColor || commonSpecs.frameColor || 'Walnut Brown',
                  orientation: p.orientation || commonSpecs.orientation || 'Landscape',
                  quantity: p.quantity || commonSpecs.quantity || 1
                }));
              }),
              totalAmount: Number(o.totalAmount) || 0,
              advancePaid: Number(o.advancePaid) || 0,
              balanceAmount: Number(o.balanceAmount) || 0,
              paymentStatus: o.paymentStatus || 'Partial',
              orderStatus: o.orderStatus || 'In Progress',
              orderDate: formatDateDisplay(o.orderDate),
              deliveryDate: formatDateDisplay(o.deliveryDate),
              notes: commonSpecs.notes || o.remarks || '',
              frameConfigMode: (o.configMode || o.frameConfigMode || 'same') as 'same' | 'individual'
            };
          });

          // Merge backend orders with existing local customers (avoid duplicate IDs)
          const current = this.customersSubject.value;
          const merged = [...apiCustomers];
          for (const c of current) {
            if (!merged.some(m => m.id === c.id || (m.phone && m.phone === c.phone && m.name === c.name))) {
              merged.push(c);
            }
          }
          this.saveCustomersToStorage(merged);
          this.customersSubject.next(merged);
        }
      },
      error: (err) => {
        console.warn('API sync not available, using local cache:', err?.message || err);
      }
    });
  }

  private loadCustomersFromStorage(): Customer[] {
    try {
      const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.CUSTOMERS) : null;
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((c: Customer) => ({
            ...c,
            orderDate: formatDateDisplay(c.orderDate),
            deliveryDate: formatDateDisplay(c.deliveryDate)
          }));
        }
      }
    } catch (e) {
      console.error('Error loading customers from localStorage', e);
    }
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(INITIAL_CUSTOMERS));
      }
    } catch (e) { }
    return INITIAL_CUSTOMERS;
  }

  private loadFrameSizesFromStorage(): FrameSize[] {
    try {
      const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.FRAME_SIZES) : null;
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading frame sizes from localStorage', e);
    }
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.FRAME_SIZES, JSON.stringify(INITIAL_FRAME_SIZES));
      }
    } catch (e) { }
    return INITIAL_FRAME_SIZES;
  }

  private saveCustomersToStorage(customers: Customer[]): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
      }
    } catch (e) {
      console.error('Error saving customers to localStorage', e);
    }
  }

  private saveFrameSizesToStorage(sizes: FrameSize[]): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.FRAME_SIZES, JSON.stringify(sizes));
      }
    } catch (e) {
      console.error('Error saving frame sizes to localStorage', e);
    }
  }

  // Open Modals
  openAddCustomerModal(): void {
    this.openCustomerModalSubject.next(null);
  }

  openEditCustomerModal(customer: Customer): void {
    this.openCustomerModalSubject.next(customer);
  }

  openViewCustomerModal(customer: Customer): void {
    this.openViewModalSubject.next(customer);
  }

  openFrameSizeModal(frameSize: FrameSize | null = null): void {
    this.openFrameSizeModalSubject.next(frameSize);
  }

  openLightbox(url: string, title: string = 'Photo Preview'): void {
    this.openLightboxSubject.next({ url, title });
  }

  private openConfirmModalSubject = new Subject<{
    title: string;
    message: string;
    confirmText?: string;
    confirmClass?: string;
    onConfirm?: () => void;
  }>();
  openConfirmModal$ = this.openConfirmModalSubject.asObservable();

  confirm(options: {
    title: string;
    message: string;
    confirmText?: string;
    confirmClass?: string;
    onConfirm?: () => void;
  }): void {
    this.openConfirmModalSubject.next(options);
  }

  // Customer CRUD
  getCustomers(): Customer[] {
    return this.customersSubject.value;
  }

  getCustomer(id: string): Customer | undefined {
    return this.customersSubject.value.find(c => c.id === id);
  }

  getCustomerById(id: string): Customer | undefined {
    return this.getCustomer(id);
  }

  generateCustomerId(): string {
    const list = this.getCustomers();
    let maxNum = 1000;
    list.forEach(c => {
      const match = c.id && c.id.match(/\d+/);
      if (match) {
        const num = parseInt(match[0], 10);
        if (num > maxNum) maxNum = num;
      }
    });
    return `RA-${maxNum + 1}`;
  }

  saveCustomer(customer: Customer): Customer {
    if (!customer.id) {
      customer.id = this.generateCustomerId();
    }
    const current = this.getCustomers();
    const existingIndex = current.findIndex(c => c.id === customer.id);
    let updated: Customer[];
    if (existingIndex >= 0) {
      updated = current.map(c =>
        c.id === customer.id ? { ...c, ...customer } : c
      );
    } else {
      updated = [customer, ...current];
    }
    this.saveCustomersToStorage(updated);
    this.customersSubject.next(updated);

    // Persist to .NET API / PostgreSQL backend
    this.persistOrderToApi(customer);

    return customer;
  }

  addCustomer(customer: Customer): Customer {
    return this.saveCustomer(customer);
  }

  updateCustomer(updatedCustomer: Customer): void {
    const current = this.getCustomers();
    const updated = current.map(c =>
      c.id === updatedCustomer.id ? { ...c, ...updatedCustomer } : c
    );
    this.saveCustomersToStorage(updated);
    this.customersSubject.next(updated);

    // Update backend order status / details
    this.updateOrderInApi(updatedCustomer);
  }

  deleteCustomer(id: string): void {
    const current = this.getCustomers();
    const updated = current.filter(customer => customer.id !== id);
    this.saveCustomersToStorage(updated);
    this.customersSubject.next(updated);

    // Delete in backend
    this.http.delete(`${this.ordersApiUrl}/${id}`).subscribe({
      next: () => console.log(`Order ${id} deleted from backend`),
      error: (err) => console.warn(`Could not delete order ${id} from backend:`, err?.message || err)
    });
  }

  private persistOrderToApi(customer: Customer): void {
    const cleanPhone = (customer.phone || '').trim();
    const orderPayload = {
      customer: {
        id: customer.id,
        name: (customer.name || '').trim(),
        phone: cleanPhone,
        altPhone: (customer.altPhone || customer.alternativePhone || '').trim(),
        city: (customer.city || 'Trivandrum').trim(),
        address: (customer.address || '').trim(),
        pincode: (customer.pincode || '').trim()
      },
      order: {
        configMode: customer.frameConfigMode || 'same',
        orderDate: toIsoDateString(customer.orderDate) || new Date().toISOString().split('T')[0],
        deliveryDate: toIsoDateString(customer.deliveryDate) || undefined,
        totalAmount: Number(customer.totalAmount) || 0,
        advancePaid: Number(customer.advancePaid) || 0,
        paymentStatus: customer.paymentStatus || 'Partial',
        orderStatus: customer.orderStatus || 'In Progress',
        commonSpecs: {
          frameSize: customer.frameSize || '12 × 18 inch',
          unit: customer.unit || 'inch',
          customWidth: customer.customWidth ? Number(customer.customWidth) : undefined,
          customHeight: customer.customHeight ? Number(customer.customHeight) : undefined,
          frameType: customer.frameType || 'Wooden Frame',
          frameMaterial: customer.frameMaterial || customer.material || 'Teak Wood Moulding',
          frameColor: customer.frameColor || customer.color || 'Walnut Brown',
          orientation: customer.orientation || 'Landscape',
          quantity: Number(customer.quantity) || 1,
          notes: customer.notes || ''
        },
        photos: (customer.photos || []).map(p => ({
          id: p.id,
          photoUrl: p.url && !p.url.startsWith('data:') ? p.url : 'assets/images/sample_frame_1.jpg',
          photoName: p.name || 'frame_photo.jpg',
          frameSize: p.frameSize || customer.frameSize || '12 × 18 inch',
          unit: p.unit || customer.unit || 'inch',
          frameType: p.frameType || customer.frameType || 'Wooden Frame',
          frameMaterial: p.frameMaterial || p.material || customer.frameMaterial || 'Teak Wood Moulding',
          frameColor: p.frameColor || p.color || customer.frameColor || 'Walnut Brown',
          orientation: p.orientation || customer.orientation || 'Landscape',
          quantity: Number(p.quantity) || 1
        }))
      }
    };

    this.http.post<any>(this.ordersApiUrl, orderPayload).subscribe({
      next: (res) => {
        console.log('Order successfully saved to backend database:', res);
        if (res?.data?.orderNumber && res.data.orderNumber !== customer.id) {
          const current = this.customersSubject.value;
          const updated = current.map(c => c.id === customer.id ? { ...c, id: res.data.orderNumber } : c);
          this.saveCustomersToStorage(updated);
          this.customersSubject.next(updated);
        }
      },
      error: (err) => {
        console.error('Failed to persist order to backend database:', err);
      }
    });
  }

  private updateOrderInApi(customer: Customer): void {
    if (!customer.id) return;

    const updateOrderPayload = {
      totalAmount: Number(customer.totalAmount) || 0,
      advancePaid: Number(customer.advancePaid) || 0,
      paymentStatus: customer.paymentStatus || 'Paid',
      orderStatus: customer.orderStatus || 'In Progress',
      deliveryDate: toIsoDateString(customer.deliveryDate),
      remarks: customer.notes || '',
      photos: (customer.photos || []).map(p => ({
        id: p.id,
        photoUrl: p.url && !p.url.startsWith('data:') ? p.url : 'assets/images/sample_frame_1.jpg',
        photoName: p.name || 'frame_photo.jpg',
        frameSize: p.frameSize || customer.frameSize || '12 × 18 inch',
        unit: p.unit || customer.unit || 'inch',
        frameType: p.frameType || customer.frameType || 'Wooden Frame',
        frameMaterial: p.frameMaterial || p.material || customer.frameMaterial || 'Teak Wood Moulding',
        frameColor: p.frameColor || p.color || customer.frameColor || 'Walnut Brown',
        orientation: p.orientation || customer.orientation || 'Landscape',
        quantity: Number(p.quantity) || 1
      }))
    };

    this.http.put<any>(`${this.ordersApiUrl}/${customer.id}`, updateOrderPayload).subscribe({
      next: (r) => console.log('Order and photos updated in backend:', r),
      error: (e) => {
        const updateStatusPayload = {
          orderStatus: customer.orderStatus || 'In Progress',
          remarks: customer.notes || ''
        };
        this.http.patch<any>(`${this.ordersApiUrl}/${customer.id}/status`, updateStatusPayload).subscribe({
          next: (res) => console.log('Order status updated in backend:', res),
          error: (err) => console.warn('Could not update order in backend:', err?.message || err)
        });
      }
    });
  }

  // Frame Sizes CRUD
  getFrameSizes(): FrameSize[] {
    return this.frameSizesSubject.value;
  }

  saveFrameSize(sizeData: FrameSize): Observable<FrameSize> {
    const isEdit = !!(sizeData.id && this.getFrameSizes().some(s => s.id === sizeData.id));

    if (isEdit) {
      const updatePayload = {
        code: sizeData.code || sizeData.id,
        name: sizeData.name.trim(),
        width: Number(sizeData.width) || 0,
        height: Number(sizeData.height) || 0,
        unit: sizeData.unit || 'inch',
        category: sizeData.category || 'Standard Photo',
        status: sizeData.status || 'Active'
      };

      return this.http.put<any>(`${this.frameSizesApiUrl}/${sizeData.id}`, updatePayload).pipe(
        map(res => {
          const savedDto = res?.data;
          const updatedItem: FrameSize = {
            id: savedDto?.id || sizeData.id,
            code: savedDto?.code || sizeData.code || sizeData.id,
            name: savedDto?.name || sizeData.name,
            width: Number(savedDto?.width ?? sizeData.width),
            height: Number(savedDto?.height ?? sizeData.height),
            unit: savedDto?.unit || sizeData.unit || 'inch',
            category: savedDto?.category || sizeData.category || 'Standard Photo',
            activeOrdersCount: savedDto?.activeOrdersCount ?? sizeData.activeOrdersCount ?? 0,
            usageCount: savedDto?.activeOrdersCount ?? sizeData.usageCount ?? 0,
            status: savedDto?.status || sizeData.status || 'Active'
          };

          const current = this.getFrameSizes();
          const idx = current.findIndex(s => s.id === updatedItem.id);
          let list: FrameSize[];
          if (idx !== -1) {
            current[idx] = updatedItem;
            list = [...current];
          } else {
            list = [...current, updatedItem];
          }
          this.saveFrameSizesToStorage(list);
          this.frameSizesSubject.next(list);
          return updatedItem;
        })
      );
    } else {
      const createPayload = {
        code: sizeData.code || undefined,
        name: sizeData.name.trim(),
        width: Number(sizeData.width) || 0,
        height: Number(sizeData.height) || 0,
        unit: sizeData.unit || 'inch',
        category: sizeData.category || 'Standard Photo'
      };

      return this.http.post<any>(this.frameSizesApiUrl, createPayload).pipe(
        map(res => {
          const savedDto = res?.data;
          const newItem: FrameSize = {
            id: savedDto?.id || `f_${Date.now()}`,
            code: savedDto?.code || `FS-${this.getFrameSizes().length + 1}`,
            name: savedDto?.name || sizeData.name,
            width: Number(savedDto?.width ?? sizeData.width),
            height: Number(savedDto?.height ?? sizeData.height),
            unit: savedDto?.unit || sizeData.unit || 'inch',
            category: savedDto?.category || sizeData.category || 'Standard Photo',
            activeOrdersCount: savedDto?.activeOrdersCount ?? 0,
            usageCount: savedDto?.activeOrdersCount ?? 0,
            status: savedDto?.status || 'Active'
          };

          const current = this.getFrameSizes();
          const list = [...current, newItem];
          this.saveFrameSizesToStorage(list);
          this.frameSizesSubject.next(list);
          return newItem;
        })
      );
    }
  }

  deleteFrameSize(id: string): Observable<any> {
    return this.http.delete<any>(`${this.frameSizesApiUrl}/${id}`).pipe(
      tap(() => {
        const sizes = this.getFrameSizes().filter(s => s.id !== id && s.code !== id);
        this.saveFrameSizesToStorage(sizes);
        this.frameSizesSubject.next(sizes);
      })
    );
  }

  // Photo helpers
  addPhotos(customerId: string, photos: CustomerPhoto[]): void {
    const customers = this.getCustomers().map(customer => {
      if (customer.id === customerId) {
        return {
          ...customer,
          photos: [...(customer.photos || []), ...photos]
        };
      }
      return customer;
    });
    this.saveCustomersToStorage(customers);
    this.customersSubject.next(customers);

    const targetCustomer = customers.find(c => c.id === customerId);
    if (targetCustomer) {
      this.updateOrderInApi(targetCustomer);
    }
  }

  removePhoto(customerId: string, photoName: string): void {
    const customers = this.getCustomers().map(customer => {
      if (customer.id === customerId) {
        return {
          ...customer,
          photos: (customer.photos || []).filter(photo => photo.name !== photoName)
        };
      }
      return customer;
    });
    this.saveCustomersToStorage(customers);
    this.customersSubject.next(customers);

    const targetCustomer = customers.find(c => c.id === customerId);
    if (targetCustomer) {
      this.updateOrderInApi(targetCustomer);
    }
  }

  // Brand Logo Helpers
  private customLogoSubject = new BehaviorSubject<string>(this.getCustomLogo());
  customLogo$ = this.customLogoSubject.asObservable();

  getCustomLogo(): string {
    if (typeof localStorage === 'undefined') return 'assets/images/img2.png';
    return localStorage.getItem('raigon_arts_brand_logo') || 'assets/images/img2.png';
  }

  setCustomLogo(logoDataUrl: string): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('raigon_arts_brand_logo', logoDataUrl);
    }
    this.customLogoSubject.next(logoDataUrl);
  }

  removeCustomLogo(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('raigon_arts_brand_logo');
    }
    this.customLogoSubject.next('assets/images/img2.png');
  }

  // WhatsApp Order Confirmation Receipt
  sendWhatsAppReceipt(customerOrId: Customer | string): void {
    let customer: Customer | undefined;
    if (typeof customerOrId === 'string') {
      customer = this.getCustomerById(customerOrId);
    } else {
      customer = customerOrId;
    }
    if (!customer) {
      console.warn('Customer record not found for WhatsApp receipt:', customerOrId);
      return;
    }
    const cleanPhone = (customer.phone || '').replace(/\D/g, '');
    const formatPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

    const balance = Math.max((customer.totalAmount || 0) - (customer.advancePaid || 0), 0);
    const frameDetail = customer.customSize || customer.frameSize || '12 × 18 inch';
    const colorFinish = customer.frameColor || customer.color || 'Walnut Brown';
    const orientation = customer.orientation || 'Standard';

    let photosText = '';
    if (customer.photos && customer.photos.length > 0) {
      photosText = `🖼️ *Attached Photos (${customer.photos.length} total):*\n` +
        customer.photos.map((p, idx) => `  ${idx + 1}. ${p.name || 'Photo'} (${p.frameSize || frameDetail})`).join('\n') + '\n\n';
    }

    const messageText = `🎨 *RAIGON ARTS WORKSHOP* - Order Confirmation\n\n` +
      `Dear *${customer.name}*,\n` +
      `Thank you for placing your framing order with Raigon Arts!\n\n` +
      `🆔 *Order ID:* ${customer.id}\n` +
      `📅 *Order Date:* ${customer.orderDate || 'Today'}\n` +
      `🚚 *Expected Delivery Date:* ${customer.deliveryDate || 'TBD'}\n` +
      `🖼️ *Frame Details:* ${frameDetail}\n` +
      `🎨 *Color Finish:* ${colorFinish} | *Orientation:* ${orientation}\n` +
      `🔢 *Quantity:* ${customer.quantity || 1}\n\n` +
      photosText +
      `💵 *TOTAL AMOUNT:* ₹${Number(customer.totalAmount || 0).toLocaleString('en-IN')}\n` +
      `💳 *Advance Paid:* ₹${Number(customer.advancePaid || 0).toLocaleString('en-IN')}\n` +
      `⚖️ *BALANCE DUE:* ₹${Number(balance || 0).toLocaleString('en-IN')}\n` +
      `📌 *Payment Status:* ${customer.paymentStatus || 'Unpaid'}\n` +
      `📌 *Order Status:* ${customer.orderStatus || 'Pending'}\n\n` +
      (customer.notes ? `📝 *Notes:* ${customer.notes}\n\n` : '') +
      `📍 *Workshop Address:* Workshop St, Art District, Trivandrum\n` +
      `📞 *Helpdesk:* +91 70121 60065\n\n` +
      `Thank you for choosing Raigon Arts! ✨`;

    const encodedMsg = encodeURIComponent(messageText);
    const targetPhone = formatPhone || '917012160065';
    window.open(`https://wa.me/${targetPhone}?text=${encodedMsg}`, '_blank');
  }
}
