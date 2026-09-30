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
  quantity?: number;
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
  createdAt?: string;
}

export interface ReportCardsData {
  totalRevenue: number;
  advanceCollected: number;
  outstandingBalance: number;
  highestOrderOfDay: number;
  hod?: number;
  totalOrders: number;
}

export interface FrameSizeSalesBreakdown {
  size: string;
  count: number;
  percentage: number;
}

export interface MaterialSalesBreakdown {
  material: string;
  count: number;
  percentage: number;
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
  FRAME_SIZES: 'raigon_arts_frame_sizes',
  REPORT_CARDS: 'raigon_arts_report_cards'
};

const INITIAL_FRAME_SIZES: FrameSize[] = [
  { id: 'FS-01', name: '4 × 6', width: 4, height: 6, unit: 'inch', category: 'Standard Photo', usageCount: 142, status: 'Active' },
  { id: 'FS-02', name: '5 × 7', width: 5, height: 7, unit: 'inch', category: 'Standard Photo', usageCount: 98, status: 'Active' },
  { id: 'FS-03', name: '8 × 10', width: 8, height: 10, unit: 'inch', category: 'Medium Portrait', usageCount: 210, status: 'Active' },
  { id: 'FS-04', name: '8 × 12', width: 8, height: 12, unit: 'inch', category: 'Medium Portrait', usageCount: 320, status: 'Active' },
  { id: 'FS-05', name: '12 × 18', width: 12, height: 18, unit: 'inch', category: 'Large Gallery', usageCount: 455, status: 'Active' },
  { id: 'FS-06', name: '16 × 20', width: 16, height: 20, unit: 'inch', category: 'Large Gallery', usageCount: 184, status: 'Active' },
  { id: 'FS-07', name: '20 × 30', width: 20, height: 30, unit: 'inch', category: 'Exhibition Wall Art', usageCount: 92, status: 'Active' }
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

export function parseDateTimestamp(val: string | undefined | null): number {
  if (!val || val === 'N/A' || val === 'TBD') return 0;
  const trimmed = String(val).trim();
  const parts = trimmed.split(/[-/]/);
  if (parts.length === 3) {
    if (parts[2].length === 4) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      if (!isNaN(d.getTime())) return d.getTime();
    }
    if (parts[0].length === 4) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      if (!isNaN(d.getTime())) return d.getTime();
    }
  }
  const d = new Date(trimmed);
  const time = d.getTime();
  return isNaN(time) ? 0 : time;
}

export function resolvePhotoUrl(url: string | undefined | null): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:') || trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  const base = (environment.apiUrl || 'http://localhost:3000').replace(/\/+$/, '');
  const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${base}${path}`;
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
    frameSize: '12 × 18',
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
    createdAt: '2026-08-28T10:00:00Z',
    notes: 'Cancelled on client request',
    photos: [
      {
        id: 'p1',
        name: 'Family_Portrait_Kowdiar.jpg',
        url: 'assets/images/sample_frame_1.jpg',
        frameSize: '12 × 18',
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
    frameSize: '20 × 30',
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
    createdAt: '2026-08-29T10:00:00Z',
    notes: 'Fully settled and delivered',
    photos: [
      {
        id: 'p2',
        name: 'Studio_Portraits.jpg',
        url: 'assets/images/sample_frame_2.jpg',
        frameSize: '20 × 30',
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
    frameSize: '12 × 18',
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
    createdAt: '2026-09-01T10:00:00Z',
    notes: 'Anti-glare glass coating with back mounting hook',
    photos: [
      {
        id: 'p6',
        name: 'Gallery_Memory.jpg',
        url: 'assets/images/sample_frame_1.jpg',
        frameSize: '12 × 18',
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
  private readonly photosApiUrl = `${environment.apiUrl}/api/v1/photos/upload`;
  private readonly reportCardsApiUrl = `${environment.apiUrl}/api/v1/reports/cards`;
  private readonly topFrameSizesApiUrl = `${environment.apiUrl}/api/v1/reports/top-frame-sizes`;
  private readonly popularMaterialsApiUrl = `${environment.apiUrl}/api/v1/reports/popular-materials`;

  private frameSizesSubject = new BehaviorSubject<FrameSize[]>(this.loadFrameSizesFromStorage());
  frameSizes$ = this.frameSizesSubject.asObservable();

  private reportCardsSubject = new BehaviorSubject<ReportCardsData>(this.loadReportCardsFromStorage());
  reportCards$ = this.reportCardsSubject.asObservable();

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

  uploadPhotos(files: File[]): Observable<Array<{ id?: string; photoName: string; photoUrl: string }>> {
    if (!files || files.length === 0) {
      return of([]);
    }
    const formData = new FormData();
    for (const file of files) {
      formData.append('photos', file, file.name);
    }
    return this.http.post<any>(this.photosApiUrl, formData).pipe(
      map(res => {
        const items = res?.data || [];
        const list = Array.isArray(items) ? items : [items];
        return list.map((item: any) => ({
          id: item.id,
          photoName: item.photoName || item.name || 'photo.jpg',
          photoUrl: resolvePhotoUrl(item.photoUrl || item.url || '')
        }));
      }),
      catchError(err => {
        console.warn('Photo upload API error:', err);
        return of([]);
      })
    );
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
        const items = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
        if (Array.isArray(items) && items.length > 0) {
          const apiSizes: FrameSize[] = items.map((f: any) => {
            const w = Number(f.width) || 0;
            const h = Number(f.height) || 0;
            const computedCount = this.calculateOrderCountForSize(f.name, w, h);
            const currentSize = this.getFrameSizes().find(s => s.id === f.id || (s.code && s.code === f.code) || s.name === f.name);
            const localStoredCount = currentSize?.activeOrdersCount ?? currentSize?.usageCount ?? 0;
            const backendCount = Number(f.activeOrdersCount ?? f.usageCount) || 0;
            const count = Math.max(backendCount, localStoredCount, computedCount);

            return {
              id: f.id,
              code: f.code || f.id,
              name: f.name,
              width: w,
              height: h,
              unit: f.unit || 'inch',
              category: (f.category === 'Custom Size' || f.category === 'Customize' || f.category?.toLowerCase() === 'custom') ? 'Customize' : (f.category || 'Standard Photo'),
              activeOrdersCount: count,
              usageCount: count,
              status: f.status || 'Active'
            };
          });

          // Retain custom sizes from local storage that may not be present in backend yet
          const current = this.getFrameSizes();
          const customSizes = current.filter(s =>
            (s.category === 'Customize' || s.category === 'Custom Size' || s.category?.toLowerCase() === 'custom') &&
            !apiSizes.some(a => a.id === s.id || (Number(a.width) === Number(s.width) && Number(a.height) === Number(s.height) && (a.unit || 'inch').toLowerCase() === (s.unit || 'inch').toLowerCase()))
          );
          const combined = [...apiSizes, ...customSizes];
          this.saveFrameSizesToStorage(combined);
          this.frameSizesSubject.next(combined);
          return combined;
        }
        return this.frameSizesSubject.value;
      }),
      catchError(err => {
        console.warn('Frame sizes API sync failed, using cache:', err?.message || err);
        return of(this.frameSizesSubject.value);
      })
    );
  }

  loadReportCardsFromStorage(): ReportCardsData {
    if (typeof localStorage === 'undefined') {
      return { totalRevenue: 0, advanceCollected: 0, outstandingBalance: 0, highestOrderOfDay: 0, hod: 0, totalOrders: 0 };
    }
    const raw = localStorage.getItem(STORAGE_KEYS.REPORT_CARDS);
    if (!raw) {
      return { totalRevenue: 0, advanceCollected: 0, outstandingBalance: 0, highestOrderOfDay: 0, hod: 0, totalOrders: 0 };
    }
    try {
      const parsed = JSON.parse(raw);
      const hodVal = Number(parsed.highestOrderOfDay ?? parsed.HighestOrderOfDay ?? parsed.hod ?? parsed.Hod) || 0;
      return {
        totalRevenue: Number(parsed.totalRevenue ?? parsed.TotalRevenue) || 0,
        advanceCollected: Number(parsed.advanceCollected ?? parsed.AdvanceCollected) || 0,
        outstandingBalance: Number(parsed.outstandingBalance ?? parsed.OutstandingBalance) || 0,
        highestOrderOfDay: hodVal,
        hod: hodVal,
        totalOrders: Number(parsed.totalOrders ?? parsed.TotalOrders) || 0
      };
    } catch {
      return { totalRevenue: 0, advanceCollected: 0, outstandingBalance: 0, highestOrderOfDay: 0, hod: 0, totalOrders: 0 };
    }
  }

  saveReportCardsToStorage(data: ReportCardsData): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.REPORT_CARDS, JSON.stringify(data));
    }
  }

  getReportCards(): ReportCardsData {
    return this.reportCardsSubject.value;
  }

  fetchReportCards(): Observable<ReportCardsData> {
    return this.http.get<any>(this.reportCardsApiUrl).pipe(
      map(res => {
        const d = res?.data ?? res ?? {};
        const hodVal = Number(d.highestOrderOfDay ?? d.HighestOrderOfDay ?? d.hod ?? d.Hod) || 0;
        const cardData: ReportCardsData = {
          totalRevenue: Number(d.totalRevenue ?? d.TotalRevenue) || 0,
          advanceCollected: Number(d.advanceCollected ?? d.AdvanceCollected) || 0,
          outstandingBalance: Number(d.outstandingBalance ?? d.OutstandingBalance) || 0,
          highestOrderOfDay: hodVal,
          hod: hodVal,
          totalOrders: Number(d.totalOrders ?? d.TotalOrders) || 0
        };
        this.saveReportCardsToStorage(cardData);
        this.reportCardsSubject.next(cardData);
        return cardData;
      }),
      catchError(err => {
        console.warn('Reports cards API fetch failed, using cached state:', err?.message || err);
        return of(this.reportCardsSubject.value);
      })
    );
  }

  fetchTopFrameSizes(limit?: number): Observable<FrameSizeSalesBreakdown[]> {
    const url = limit ? `${this.topFrameSizesApiUrl}?limit=${limit}` : this.topFrameSizesApiUrl;
    return this.http.get<any>(url).pipe(
      map(res => {
        const items = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
        return items.map((item: any) => ({
          size: item.size || item.Size || item.name || item.Name || 'Custom Size',
          count: Number(item.count ?? item.Count) || 0,
          percentage: Number(item.percentage ?? item.Percentage) || 0
        }));
      }),
      catchError(err => {
        console.warn('Top frame sizes API fetch failed:', err?.message || err);
        return of([]);
      })
    );
  }

  fetchPopularMaterials(limit?: number): Observable<MaterialSalesBreakdown[]> {
    const url = limit ? `${this.popularMaterialsApiUrl}?limit=${limit}` : this.popularMaterialsApiUrl;
    return this.http.get<any>(url).pipe(
      map(res => {
        const items = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
        return items.map((item: any) => ({
          material: item.material || item.Material || item.name || item.Name || 'Standard Moulding',
          count: Number(item.count ?? item.Count) || 0,
          percentage: Number(item.percentage ?? item.Percentage) || 0
        }));
      }),
      catchError(err => {
        console.warn('Popular materials API fetch failed:', err?.message || err);
        return of([]);
      })
    );
  }

  sortCustomersNewestFirst(customers: Customer[]): Customer[] {
    return [...customers].sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : (a.orderDate ? parseDateTimestamp(a.orderDate) : 0);
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : (b.orderDate ? parseDateTimestamp(b.orderDate) : 0);
      if (timeA !== timeB && !isNaN(timeA) && !isNaN(timeB) && (timeA > 0 || timeB > 0)) {
        return timeB - timeA;
      }
      return (b.id || '').localeCompare(a.id || '', undefined, { numeric: true });
    });
  }

  syncFromBackendApi(): void {
    this.fetchFrameSizes().subscribe();
    this.fetchReportCards().subscribe();
    this.http.get<any>(this.ordersApiUrl).subscribe({
      next: (res) => {
        const orders = res?.data?.orders || [];
        if (Array.isArray(orders) && orders.length > 0) {
          const apiCustomers: Customer[] = orders.map((o: any) => {
            const commonSpecs = o.commonSpecs || {};
            const firstPhoto = (o.photos && o.photos.length > 0) ? o.photos[0] : {};

            return {
              id: o.orderNumber || o.id || o.customerId,
              name: o.customerName || (o.customer && o.customer.name) || 'Customer',
              phone: o.customerPhone || (o.customer && o.customer.phone) || '',
              altPhone: o.customerAltPhone || (o.customer && (o.customer.altPhone || o.customer.alternativePhone)) || '',
              alternativePhone: o.customerAltPhone || (o.customer && (o.customer.altPhone || o.customer.alternativePhone)) || '',
              address: (o.customerAddress || (o.customer && (o.customer.address || o.customer.deliveryAddress || o.customer.fullAddress || o.customer.streetAddress || o.customer.addressLine)) || o.address || o.deliveryAddress || '').trim(),
              city: (o.customerCity || (o.customer && o.customer.city) || o.city || 'Trivandrum').trim(),
              pincode: (o.customerPincode || (o.customer && o.customer.pincode) || o.pincode || '').trim(),
              frameSize: (o.frameSize || commonSpecs.frameSize || firstPhoto.frameSize || '').trim(),
              customSize: (o.customSize || commonSpecs.customSize || '').trim(),
              customWidth: o.customWidth ?? commonSpecs.customWidth,
              customHeight: o.customHeight ?? commonSpecs.customHeight,
              frameType: (o.frameType || commonSpecs.frameType || firstPhoto.frameType || '').trim(),
              frameMaterial: (o.frameMaterial || o.material || commonSpecs.frameMaterial || firstPhoto.frameMaterial || firstPhoto.material || '').trim(),
              material: (o.frameMaterial || o.material || commonSpecs.frameMaterial || firstPhoto.frameMaterial || firstPhoto.material || '').trim(),
              frameColor: (o.frameColor || o.color || commonSpecs.frameColor || firstPhoto.frameColor || firstPhoto.color || '').trim(),
              color: (o.frameColor || o.color || commonSpecs.frameColor || firstPhoto.frameColor || firstPhoto.color || '').trim(),
              unit: (o.unit || commonSpecs.unit || firstPhoto.unit || '').trim(),
              orientation: (o.orientation || commonSpecs.orientation || firstPhoto.orientation || '').trim(),
              quantity: (o.quantity !== undefined && o.quantity !== null && Number(o.quantity) > 0)
                ? Number(o.quantity)
                : ((commonSpecs.quantity && Number(commonSpecs.quantity) > 0) ? Number(commonSpecs.quantity) : ((firstPhoto.quantity && Number(firstPhoto.quantity) > 0) ? Number(firstPhoto.quantity) : undefined)),
              photos: (o.photos || []).flatMap((p: any) => {
                const rawName = p.photoName || p.name || 'photo.jpg';
                const rawUrl = p.photoUrl || p.url || '';
                if (!rawUrl) return [];
                const names = rawName.split(/,\s*|\n/).map((s: string) => s.trim()).filter((s: string) => !!s);
                const urls = rawUrl.split(/\s*\|\|\s*|\n/).map((s: string) => s.trim()).filter((s: string) => !!s);
                const count = Math.max(names.length, urls.length);
                if (count <= 1) {
                  return [{
                    id: p.id,
                    name: names[0] || rawName,
                    url: resolvePhotoUrl(urls[0] || rawUrl),
                    frameSize: (p.frameSize || o.frameSize || commonSpecs.frameSize || '').trim(),
                    unit: (p.unit || o.unit || commonSpecs.unit || '').trim(),
                    frameType: (p.frameType || o.frameType || commonSpecs.frameType || '').trim(),
                    material: (p.frameMaterial || p.material || o.frameMaterial || o.material || commonSpecs.frameMaterial || '').trim(),
                    frameMaterial: (p.frameMaterial || p.material || o.frameMaterial || o.material || commonSpecs.frameMaterial || '').trim(),
                    color: (p.frameColor || p.color || o.frameColor || o.color || commonSpecs.frameColor || '').trim(),
                    frameColor: (p.frameColor || p.color || o.frameColor || o.color || commonSpecs.frameColor || '').trim(),
                    orientation: (p.orientation || o.orientation || commonSpecs.orientation || '').trim(),
                    quantity: (p.quantity !== undefined && p.quantity !== null && Number(p.quantity) > 0) ? Number(p.quantity) : ((o.quantity && Number(o.quantity) > 0) ? Number(o.quantity) : ((commonSpecs.quantity && Number(commonSpecs.quantity) > 0) ? Number(commonSpecs.quantity) : undefined)),
                    notes: (p.notes || p.remarks || '').trim()
                  }];
                }
                return Array.from({ length: count }, (_, i) => ({
                  id: `${p.id}_${i + 1}`,
                  name: names[i] || names[0] || `photo_${i + 1}.jpg`,
                  url: resolvePhotoUrl(urls[i] || urls[0] || rawUrl),
                  frameSize: (p.frameSize || o.frameSize || commonSpecs.frameSize || '').trim(),
                  unit: (p.unit || o.unit || commonSpecs.unit || '').trim(),
                  frameType: (p.frameType || o.frameType || commonSpecs.frameType || '').trim(),
                  material: (p.frameMaterial || p.material || o.frameMaterial || o.material || commonSpecs.frameMaterial || '').trim(),
                  frameMaterial: (p.frameMaterial || p.material || o.frameMaterial || o.material || commonSpecs.frameMaterial || '').trim(),
                  color: (p.frameColor || p.color || o.frameColor || o.color || commonSpecs.frameColor || '').trim(),
                  frameColor: (p.frameColor || p.color || o.frameColor || o.color || commonSpecs.frameColor || '').trim(),
                  orientation: (p.orientation || o.orientation || commonSpecs.orientation || '').trim(),
                  quantity: (p.quantity !== undefined && p.quantity !== null && Number(p.quantity) > 0) ? Number(p.quantity) : ((o.quantity && Number(o.quantity) > 0) ? Number(o.quantity) : ((commonSpecs.quantity && Number(commonSpecs.quantity) > 0) ? Number(commonSpecs.quantity) : undefined)),
                  notes: (p.notes || p.remarks || '').trim()
                }));
              }),
              totalAmount: Number(o.totalAmount) || 0,
              advancePaid: Number(o.advancePaid) || 0,
              balanceAmount: Number(o.balanceAmount) || 0,
              paymentStatus: (o.paymentStatus || '').trim(),
              orderStatus: (o.orderStatus || '').trim(),
              orderDate: formatDateDisplay(o.orderDate),
              deliveryDate: formatDateDisplay(o.deliveryDate),
              notes: o.remarks || commonSpecs.notes || '',
              frameConfigMode: ((o.configMode || o.frameConfigMode || '').toLowerCase() === 'individual' ? 'individual' : 'same') as 'same' | 'individual',
              createdAt: o.createdAt || o.createdDate || o.orderDate
            };
          });

          // Merge backend orders with existing local customers (preserving local photo notes, address and config mode)
          const current = this.customersSubject.value;
          const merged: Customer[] = apiCustomers.map(apiCust => {
            const localCust = current.find(c => c.id === apiCust.id || (c.phone && c.phone === apiCust.phone && c.name === apiCust.name));
            if (!localCust) return apiCust;

            const mode: 'same' | 'individual' = (localCust.frameConfigMode === 'individual' || apiCust.frameConfigMode === 'individual')
              ? 'individual'
              : 'same';

            const mergedPhotos = (apiCust.photos || []).map((apiP, idx) => {
              const localP = (localCust.photos || []).find(lp => (lp.id && lp.id === apiP.id) || lp.name === apiP.name || lp.url === apiP.url) || (localCust.photos && localCust.photos[idx]);
              return {
                ...apiP,
                url: resolvePhotoUrl(apiP.url || localP?.url),
                frameSize: localP?.frameSize !== undefined ? localP.frameSize : (apiP.frameSize || ''),
                unit: localP?.unit !== undefined ? localP.unit : (apiP.unit || ''),
                customWidth: localP?.customWidth !== undefined ? localP.customWidth : apiP.customWidth,
                customHeight: localP?.customHeight !== undefined ? localP.customHeight : apiP.customHeight,
                frameType: localP?.frameType !== undefined ? localP.frameType : (apiP.frameType || ''),
                material: localP?.material !== undefined ? localP.material : (apiP.material || localP?.frameMaterial || ''),
                frameMaterial: localP?.frameMaterial !== undefined ? localP.frameMaterial : (apiP.frameMaterial || localP?.material || ''),
                color: localP?.color !== undefined ? localP.color : (apiP.color || localP?.frameColor || ''),
                frameColor: localP?.frameColor !== undefined ? localP.frameColor : (apiP.frameColor || localP?.color || ''),
                orientation: localP?.orientation !== undefined ? localP.orientation : (apiP.orientation || ''),
                quantity: localP?.quantity !== undefined ? localP.quantity : apiP.quantity,
                notes: (localP?.notes && localP.notes.trim()) ? localP.notes.trim() : ((apiP.notes && apiP.notes.trim()) ? apiP.notes.trim() : '')
              };
            });

            const finalPhotos = mergedPhotos.length > 0
              ? mergedPhotos
              : (localCust.photos || []).map(p => ({ ...p, url: resolvePhotoUrl(p.url) }));

            return {
              ...apiCust,
              name: (localCust.name && localCust.name.trim()) ? localCust.name : (apiCust.name || 'Customer'),
              phone: (localCust.phone && localCust.phone.trim()) ? localCust.phone : (apiCust.phone || ''),
              altPhone: (localCust.altPhone && localCust.altPhone.trim()) ? localCust.altPhone : (localCust.alternativePhone || apiCust.altPhone || ''),
              alternativePhone: (localCust.alternativePhone && localCust.alternativePhone.trim()) ? localCust.alternativePhone : (localCust.altPhone || apiCust.alternativePhone || ''),
              address: (localCust.address !== undefined && localCust.address !== null && localCust.address !== '') ? localCust.address : (apiCust.address || ''),
              city: (localCust.city && localCust.city.trim()) ? localCust.city : (apiCust.city || 'Trivandrum'),
              pincode: (localCust.pincode && localCust.pincode.trim()) ? localCust.pincode : (apiCust.pincode || ''),
              frameSize: localCust.frameSize !== undefined ? localCust.frameSize : apiCust.frameSize,
              frameType: localCust.frameType !== undefined ? localCust.frameType : apiCust.frameType,
              quantity: localCust.quantity !== undefined ? localCust.quantity : apiCust.quantity,
              paymentStatus: localCust.paymentStatus !== undefined ? localCust.paymentStatus : apiCust.paymentStatus,
              orderStatus: localCust.orderStatus !== undefined ? localCust.orderStatus : apiCust.orderStatus,
              frameConfigMode: mode,
              notes: localCust.notes !== undefined ? localCust.notes : (apiCust.notes || ''),
              photos: finalPhotos
            };
          });

          for (const c of current) {
            if (!merged.some(m => m.id === c.id || (m.phone && m.phone === c.phone && m.name === c.name))) {
              merged.push(c);
            }
          }
          const sorted = this.sortCustomersNewestFirst(merged);
          this.saveCustomersToStorage(sorted);
          this.customersSubject.next(sorted);
          this.updateAllFrameSizesOrderCounts();
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
          const mapped = parsed.map((c: Customer) => ({
            ...c,
            address: (c.address || '').trim(),
            city: (c.city || 'Trivandrum').trim(),
            pincode: (c.pincode || '').trim(),
            altPhone: (c.altPhone || c.alternativePhone || '').trim(),
            alternativePhone: (c.alternativePhone || c.altPhone || '').trim(),
            frameSize: (c.frameSize || '').trim(),
            frameType: (c.frameType || '').trim(),
            unit: (c.unit || '').trim(),
            orientation: (c.orientation || '').trim(),
            paymentStatus: (c.paymentStatus || '').trim(),
            orderStatus: (c.orderStatus || '').trim(),
            photos: (c.photos || []).map(p => ({
              ...p,
              url: resolvePhotoUrl(p.url),
              frameSize: (p.frameSize || '').trim(),
              frameType: (p.frameType || '').trim(),
              unit: (p.unit || '').trim(),
              orientation: (p.orientation || '').trim(),
              notes: (p.notes || '').trim()
            })),
            orderDate: formatDateDisplay(c.orderDate),
            deliveryDate: formatDateDisplay(c.deliveryDate),
            createdAt: c.createdAt
          }));
          return this.sortCustomersNewestFirst(mapped);
        }
      }
    } catch (e) {
      console.error('Error loading customers from localStorage', e);
    }
    try {
      if (typeof localStorage !== 'undefined') {
        const sortedInit = this.sortCustomersNewestFirst(INITIAL_CUSTOMERS);
        localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(sortedInit));
        return sortedInit;
      }
    } catch (e) { }
    return this.sortCustomersNewestFirst(INITIAL_CUSTOMERS);
  }

  private loadFrameSizesFromStorage(): FrameSize[] {
    try {
      const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.FRAME_SIZES) : null;
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((s: FrameSize) => ({
            ...s,
            name: (s.name || '').trim()
          }));
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
    if (!customer.createdAt) {
      customer.createdAt = new Date().toISOString();
    }
    const cleanCustomer: Customer = {
      ...customer,
      photos: (customer.photos || []).map(p => ({
        ...p,
        url: resolvePhotoUrl(p.url)
      }))
    };
    const current = this.getCustomers();
    const existingIndex = current.findIndex(c => c.id === cleanCustomer.id);
    let updated: Customer[];
    if (existingIndex >= 0) {
      updated = current.map(c =>
        c.id === cleanCustomer.id ? { ...c, ...cleanCustomer } : c
      );
    } else {
      updated = [cleanCustomer, ...current];
    }
    const sorted = this.sortCustomersNewestFirst(updated);
    this.saveCustomersToStorage(sorted);
    this.customersSubject.next(sorted);

    // Track custom frame sizes if user selected Customize
    this.handleCustomFrameSizesOnSave(cleanCustomer);
    this.updateAllFrameSizesOrderCounts();

    // Persist to .NET API / PostgreSQL backend
    this.persistOrderToApi(cleanCustomer);

    return cleanCustomer;
  }

  addCustomer(customer: Customer): Customer {
    return this.saveCustomer(customer);
  }

  updateCustomer(updatedCustomer: Customer): void {
    const cleanCustomer: Customer = {
      ...updatedCustomer,
      photos: (updatedCustomer.photos || []).map(p => ({
        ...p,
        url: resolvePhotoUrl(p.url)
      }))
    };
    const current = this.getCustomers();
    const updated = current.map(c =>
      c.id === cleanCustomer.id ? { ...c, ...cleanCustomer } : c
    );
    const sorted = this.sortCustomersNewestFirst(updated);
    this.saveCustomersToStorage(sorted);
    this.customersSubject.next(sorted);

    // Track custom frame sizes if user selected Customize
    this.handleCustomFrameSizesOnSave(cleanCustomer);
    this.updateAllFrameSizesOrderCounts();

    // Update backend order status / details
    this.updateOrderInApi(cleanCustomer);
  }

  deleteCustomer(id: string): void {
    const current = this.getCustomers();
    const updated = current.filter(customer => customer.id !== id);
    const sorted = this.sortCustomersNewestFirst(updated);
    this.saveCustomersToStorage(sorted);
    this.customersSubject.next(sorted);
    this.updateAllFrameSizesOrderCounts();

    // Delete in backend
    this.http.delete(`${this.ordersApiUrl}/${id}`).subscribe({
      next: () => {
        console.log(`Order ${id} deleted from backend`);
        this.syncFromBackendApi();
      },
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
        paymentStatus: customer.paymentStatus || '',
        orderStatus: customer.orderStatus || '',
        commonSpecs: {
          frameSize: customer.frameSize || '',
          unit: customer.unit || '',
          customWidth: customer.customWidth ? Number(customer.customWidth) : undefined,
          customHeight: customer.customHeight ? Number(customer.customHeight) : undefined,
          frameType: customer.frameType || '',
          frameMaterial: customer.frameMaterial || customer.material || '',
          frameColor: customer.frameColor || customer.color || '',
          orientation: customer.orientation || '',
          quantity: (customer.quantity !== undefined && customer.quantity !== null) ? Number(customer.quantity) : undefined,
          notes: customer.notes || ''
        },
        photos: (customer.photos || []).map(p => ({
          id: p.id,
          photoUrl: resolvePhotoUrl(p.url) || '',
          photoName: p.name || 'frame_photo.jpg',
          frameSize: p.frameSize || customer.frameSize || '',
          unit: p.unit || customer.unit || '',
          frameType: p.frameType || customer.frameType || '',
          frameMaterial: p.frameMaterial || p.material || customer.frameMaterial || '',
          frameColor: p.frameColor || p.color || customer.frameColor || '',
          orientation: p.orientation || customer.orientation || '',
          quantity: (p.quantity !== undefined && p.quantity !== null) ? Number(p.quantity) : (customer.quantity ? Number(customer.quantity) : undefined),
          notes: p.notes || '',
          remarks: p.notes || ''
        }))
      }
    };

    this.http.post<any>(this.ordersApiUrl, orderPayload).subscribe({
      next: (res) => {
        console.log('Order successfully saved to backend database:', res);
        this.syncFromBackendApi();
      },
      error: (err) => {
        console.error('Failed to persist order to backend database:', err);
      }
    });
  }

  private updateOrderInApi(customer: Customer): void {
    if (!customer.id) return;

    const cleanPhone = (customer.phone || '').trim();
    const customerPayload = {
      id: customer.id,
      name: (customer.name || '').trim(),
      phone: cleanPhone,
      altPhone: (customer.altPhone || customer.alternativePhone || '').trim(),
      city: (customer.city || 'Trivandrum').trim(),
      address: (customer.address || '').trim(),
      pincode: (customer.pincode || '').trim()
    };

    const updateOrderPayload = {
      customer: customerPayload,
      customerName: customerPayload.name,
      customerPhone: customerPayload.phone,
      customerAltPhone: customerPayload.altPhone,
      customerCity: customerPayload.city,
      customerAddress: customerPayload.address,
      customerPincode: customerPayload.pincode,
      address: customerPayload.address,
      city: customerPayload.city,
      pincode: customerPayload.pincode,
      totalAmount: Number(customer.totalAmount) || 0,
      advancePaid: Number(customer.advancePaid) || 0,
      paymentStatus: customer.paymentStatus || '',
      orderStatus: customer.orderStatus || '',
      deliveryDate: toIsoDateString(customer.deliveryDate),
      remarks: customer.notes || '',
      commonSpecs: {
        frameSize: customer.frameSize || '',
        unit: customer.unit || '',
        customWidth: customer.customWidth ? Number(customer.customWidth) : undefined,
        customHeight: customer.customHeight ? Number(customer.customHeight) : undefined,
        frameType: customer.frameType || '',
        frameMaterial: customer.frameMaterial || customer.material || '',
        frameColor: customer.frameColor || customer.color || '',
        orientation: customer.orientation || '',
        quantity: (customer.quantity !== undefined && customer.quantity !== null) ? Number(customer.quantity) : undefined,
        notes: customer.notes || ''
      },
      photos: (customer.photos || []).map(p => ({
        id: p.id,
        photoUrl: resolvePhotoUrl(p.url) || '',
        photoName: p.name || 'frame_photo.jpg',
        frameSize: p.frameSize || customer.frameSize || '',
        unit: p.unit || customer.unit || '',
        frameType: p.frameType || customer.frameType || '',
        frameMaterial: p.frameMaterial || p.material || customer.frameMaterial || '',
        frameColor: p.frameColor || p.color || customer.frameColor || '',
        orientation: p.orientation || customer.orientation || '',
        quantity: (p.quantity !== undefined && p.quantity !== null) ? Number(p.quantity) : (customer.quantity ? Number(customer.quantity) : undefined),
        notes: p.notes || '',
        remarks: p.notes || ''
      }))
    };

    this.http.put<any>(`${this.customersApiUrl}/${customer.id}`, customerPayload).subscribe({
      error: () => { }
    });

    this.http.put<any>(`${this.ordersApiUrl}/${customer.id}`, updateOrderPayload).subscribe({
      next: (r) => {
        console.log('Order and photos updated in backend:', r);
        this.syncFromBackendApi();
      },
      error: (e) => {
        const updateStatusPayload = {
          orderStatus: customer.orderStatus || '',
          remarks: customer.notes || ''
        };
        this.http.patch<any>(`${this.ordersApiUrl}/${customer.id}/status`, updateStatusPayload).subscribe({
          next: (res) => {
            console.log('Order status updated in backend:', res);
            this.syncFromBackendApi();
          },
          error: (err) => console.warn('Could not update order in backend:', err?.message || err)
        });
      }
    });
  }

  // Frame Sizes CRUD
  getFrameSizes(): FrameSize[] {
    return this.frameSizesSubject.value;
  }

  private cleanSize(size?: string): string {
    if (!size) return '';
    return size.replace(/\s*inch(es)?|\s*in\b/gi, '').trim();
  }

  saveFrameSize(sizeData: FrameSize): Observable<FrameSize> {
    const isEdit = !!(sizeData.id && this.getFrameSizes().some(s => s.id === sizeData.id));
    const normalizedCategory = (sizeData.category === 'Custom Size' || sizeData.category === 'Customize' || sizeData.category?.toLowerCase() === 'custom')
      ? 'Customize'
      : (sizeData.category || 'Standard Photo');

    const current = this.getFrameSizes();
    let localItem: FrameSize = {
      ...sizeData,
      category: normalizedCategory,
      width: Number(sizeData.width) || 0,
      height: Number(sizeData.height) || 0,
      unit: sizeData.unit || 'inch',
      status: sizeData.status || 'Active'
    };
    if (!localItem.id) {
      localItem.id = `f_${Date.now()}`;
    }
    if (!localItem.code) {
      localItem.code = `FS-${String(current.length + 1).padStart(2, '0')}`;
    }

    const idx = current.findIndex(s => s.id === localItem.id || (s.code && s.code === localItem.code));
    let list: FrameSize[];
    if (idx !== -1) {
      current[idx] = { ...current[idx], ...localItem };
      list = [...current];
    } else {
      list = [...current, localItem];
    }
    this.saveFrameSizesToStorage(list);
    this.frameSizesSubject.next(list);

    if (isEdit) {
      const updatePayload = {
        code: localItem.code || localItem.id,
        name: localItem.name.trim(),
        width: Number(localItem.width) || 0,
        height: Number(localItem.height) || 0,
        unit: localItem.unit || 'inch',
        category: normalizedCategory,
        status: localItem.status || 'Active'
      };

      return this.http.put<any>(`${this.frameSizesApiUrl}/${localItem.id}`, updatePayload).pipe(
        map(res => {
          const savedDto = res?.data ?? res;
          if (savedDto) {
            const updatedItem: FrameSize = {
              ...localItem,
              ...savedDto,
              category: normalizedCategory
            };
            const cur = this.getFrameSizes();
            const curIdx = cur.findIndex(s => s.id === updatedItem.id);
            if (curIdx !== -1) cur[curIdx] = updatedItem;
            this.saveFrameSizesToStorage(cur);
            this.frameSizesSubject.next(cur);
            return updatedItem;
          }
          return localItem;
        }),
        catchError(err => {
          console.warn('Backend frame size edit failed, keeping local:', err?.message || err);
          return of(localItem);
        })
      );
    } else {
      const createPayload = {
        code: localItem.code,
        name: localItem.name.trim(),
        width: Number(localItem.width) || 0,
        height: Number(localItem.height) || 0,
        unit: localItem.unit || 'inch',
        category: normalizedCategory
      };

      return this.http.post<any>(this.frameSizesApiUrl, createPayload).pipe(
        map(res => {
          const savedDto = res?.data ?? res;
          if (savedDto && savedDto.id) {
            const finalItem: FrameSize = {
              ...localItem,
              id: savedDto.id,
              code: savedDto.code || localItem.code
            };
            const cur = this.getFrameSizes().map(s => s.id === localItem.id ? finalItem : s);
            this.saveFrameSizesToStorage(cur);
            this.frameSizesSubject.next(cur);
            return finalItem;
          }
          return localItem;
        }),
        catchError(err => {
          console.warn('Backend frame size create failed, keeping local:', err?.message || err);
          return of(localItem);
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
        this.fetchFrameSizes().subscribe();
      }),
      catchError(err => {
        console.warn('Backend frame size delete failed, removing locally:', err?.message || err);
        const sizes = this.getFrameSizes().filter(s => s.id !== id && s.code !== id);
        this.saveFrameSizesToStorage(sizes);
        this.frameSizesSubject.next(sizes);
        return of(null);
      })
    );
  }

  recordCustomFrameSize(width: number, height: number, unit: string = 'inch', quantity: number = 1): void {
    if (!width || !height || isNaN(width) || isNaN(height) || width <= 0 || height <= 0) return;
    const w = Number(width);
    const h = Number(height);
    const u = unit || 'inch';
    const qty = Math.max(1, Number(quantity) || 1);

    const currentSizes = this.getFrameSizes();
    const existing = currentSizes.find(s =>
      ((s.category === 'Customize' || s.category === 'Custom Size' || s.category?.toLowerCase() === 'custom') ||
        s.name === `${w} × ${h}` || s.name === `${w} x ${h}` || s.name === `${w} * ${h}`) &&
      ((Number(s.width) === w && Number(s.height) === h) || (Number(s.width) === h && Number(s.height) === w)) &&
      (s.unit || 'inch').toLowerCase() === u.toLowerCase()
    );

    if (existing) {
      const currentCount = existing.activeOrdersCount ?? existing.usageCount ?? 0;
      const updatedCount = currentCount + qty;
      const updatedItem: FrameSize = {
        ...existing,
        category: 'Customize',
        activeOrdersCount: updatedCount,
        usageCount: updatedCount
      };
      this.saveFrameSize(updatedItem).subscribe({
        error: () => { }
      });
    } else {
      const newCustomSize: FrameSize = {
        id: `f_cust_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        code: `FS-${String(currentSizes.length + 1).padStart(2, '0')}`,
        name: `${w} × ${h}`,
        width: w,
        height: h,
        unit: u,
        category: 'Customize',
        activeOrdersCount: qty,
        usageCount: qty,
        status: 'Active'
      };
      this.saveFrameSize(newCustomSize).subscribe({
        error: () => { }
      });
    }
  }

  recordFrameSizeUsage(sizeName: string, quantity: number = 1): void {
    if (!sizeName || sizeName === 'Customize' || sizeName === 'Custom Size') return;
    const clean = this.cleanSize(sizeName).toLowerCase();
    const qty = Math.max(1, Number(quantity) || 1);
    const currentSizes = this.getFrameSizes();

    const existing = currentSizes.find(s => {
      const sClean = this.cleanSize(s.name).toLowerCase();
      if (sClean === clean) return true;
      const normS = sClean.replace(/[×*]/g, 'x').replace(/\s+/g, '');
      const normTarget = clean.replace(/[×*]/g, 'x').replace(/\s+/g, '');
      return normS === normTarget;
    });

    if (existing) {
      const currentCount = existing.activeOrdersCount ?? existing.usageCount ?? 0;
      const updatedCount = currentCount + qty;
      const updatedItem: FrameSize = {
        ...existing,
        category: (existing.category === 'Custom Size' || existing.category?.toLowerCase() === 'custom' || existing.category === 'Customize') ? 'Customize' : existing.category,
        activeOrdersCount: updatedCount,
        usageCount: updatedCount
      };
      this.saveFrameSize(updatedItem).subscribe({
        error: () => { }
      });
    }
  }

  private handleCustomFrameSizesOnSave(customer: Customer): void {
    const isCustom = customer.frameSize === 'Customize' || customer.frameSize === 'Custom Size' || (customer.customWidth && customer.customHeight);

    if (customer.frameConfigMode === 'individual' && customer.photos && customer.photos.length > 0) {
      customer.photos.forEach(p => {
        const qty = Number(p.quantity) || Number(customer.quantity) || 1;
        const pIsCustom = p.frameSize === 'Customize' || p.frameSize === 'Custom Size' || ((p.customWidth || customer.customWidth) && (p.customHeight || customer.customHeight));
        if (pIsCustom && (p.customWidth || customer.customWidth) && (p.customHeight || customer.customHeight)) {
          const w = Number(p.customWidth || customer.customWidth);
          const h = Number(p.customHeight || customer.customHeight);
          const u = p.unit || customer.unit || 'inch';
          this.recordCustomFrameSize(w, h, u, qty);
        } else if (p.frameSize && p.frameSize !== 'Customize' && p.frameSize !== 'Custom Size') {
          this.recordFrameSizeUsage(p.frameSize, qty);
        }
      });
    } else if (isCustom && customer.customWidth && customer.customHeight) {
      const qty = Number(customer.quantity) || 1;
      this.recordCustomFrameSize(Number(customer.customWidth), Number(customer.customHeight), customer.unit || 'inch', qty);
    } else if (customer.frameSize && customer.frameSize !== 'Customize' && customer.frameSize !== 'Custom Size') {
      const qty = Number(customer.quantity) || 1;
      this.recordFrameSizeUsage(customer.frameSize, qty);
    }
  }

  private normalizeDimensionString(str?: string): { width: number; height: number } | null {
    if (!str) return null;
    const match = str.match(/(\d+(?:\.\d+)?)\s*(?:[×xX*]|\s+by\s+|\s+)\s*(\d+(?:\.\d+)?)/);
    if (match) {
      return {
        width: parseFloat(match[1]),
        height: parseFloat(match[2])
      };
    }
    return null;
  }

  calculateOrderCountForSize(sizeName: string, width?: number, height?: number): number {
    const cleanTargetName = this.cleanSize(sizeName).toLowerCase();
    const normTarget = cleanTargetName.replace(/[×*]/g, 'x').replace(/\s+/g, '');
    const w = Number(width) || (this.normalizeDimensionString(sizeName)?.width ?? 0);
    const h = Number(height) || (this.normalizeDimensionString(sizeName)?.height ?? 0);

    let count = 0;
    const customers = this.getCustomers();

    for (const c of customers) {
      if (c.frameConfigMode === 'individual' && c.photos && c.photos.length > 0) {
        for (const p of c.photos) {
          const pSize = (p.frameSize || '').trim();
          const pClean = this.cleanSize(pSize).toLowerCase();
          const pNorm = pClean.replace(/[×*]/g, 'x').replace(/\s+/g, '');

          let isMatch = false;
          if (pClean && normTarget && (pNorm === normTarget || pClean === cleanTargetName)) {
            isMatch = true;
          } else if (pSize === 'Customize' || pSize === 'Custom Size' || !pSize) {
            const pw = Number(p.customWidth || c.customWidth);
            const ph = Number(p.customHeight || c.customHeight);
            if (w > 0 && h > 0 && ((pw === w && ph === h) || (pw === h && ph === w))) {
              isMatch = true;
            }
          } else if (w > 0 && h > 0) {
            const pDim = this.normalizeDimensionString(pSize);
            if (pDim && ((pDim.width === w && pDim.height === h) || (pDim.width === h && pDim.height === w))) {
              isMatch = true;
            }
          }

          if (isMatch) {
            count += Number(p.quantity) || 1;
          }
        }
      } else {
        const cSize = (c.frameSize || '').trim();
        const cClean = this.cleanSize(cSize).toLowerCase();
        const cNorm = cClean.replace(/[×*]/g, 'x').replace(/\s+/g, '');

        let isMatch = false;
        if (cClean && normTarget && (cNorm === normTarget || cClean === cleanTargetName)) {
          isMatch = true;
        } else if (cSize === 'Customize' || cSize === 'Custom Size' || !cSize) {
          const cw = Number(c.customWidth);
          const ch = Number(c.customHeight);
          if (w > 0 && h > 0 && ((cw === w && ch === h) || (cw === h && ch === w))) {
            isMatch = true;
          }
        } else if (w > 0 && h > 0) {
          const cDim = this.normalizeDimensionString(cSize) || this.normalizeDimensionString(c.customSize);
          if (cDim && ((cDim.width === w && cDim.height === h) || (cDim.width === h && cDim.height === w))) {
            isMatch = true;
          }
        }

        if (isMatch) {
          count += Number(c.quantity) || 1;
        }
      }
    }

    return count;
  }

  updateAllFrameSizesOrderCounts(): void {
    const currentSizes = [...this.getFrameSizes()];
    const customers = this.getCustomers();

    // Ensure all custom sizes in customer records are in currentSizes
    for (const c of customers) {
      if (c.frameConfigMode === 'individual' && c.photos && c.photos.length > 0) {
        for (const p of c.photos) {
          const w = Number(p.customWidth || c.customWidth);
          const h = Number(p.customHeight || c.customHeight);
          if (w > 0 && h > 0) {
            const u = p.unit || c.unit || 'inch';
            const exists = currentSizes.some(s =>
              ((Number(s.width) === w && Number(s.height) === h) || (Number(s.width) === h && Number(s.height) === w)) &&
              (s.unit || 'inch').toLowerCase() === u.toLowerCase()
            );
            if (!exists) {
              currentSizes.push({
                id: `f_cust_${w}_${h}_${Date.now()}`,
                code: `FS-${String(currentSizes.length + 1).padStart(2, '0')}`,
                name: `${w} × ${h}`,
                width: w,
                height: h,
                unit: u,
                category: 'Customize',
                activeOrdersCount: 0,
                usageCount: 0,
                status: 'Active'
              });
            }
          }
        }
      } else {
        const w = Number(c.customWidth);
        const h = Number(c.customHeight);
        if (w > 0 && h > 0) {
          const u = c.unit || 'inch';
          const exists = currentSizes.some(s =>
            ((Number(s.width) === w && Number(s.height) === h) || (Number(s.width) === h && Number(s.height) === w)) &&
            (s.unit || 'inch').toLowerCase() === u.toLowerCase()
          );
          if (!exists) {
            currentSizes.push({
              id: `f_cust_${w}_${h}_${Date.now()}`,
              code: `FS-${String(currentSizes.length + 1).padStart(2, '0')}`,
              name: `${w} × ${h}`,
              width: w,
              height: h,
              unit: u,
              category: 'Customize',
              activeOrdersCount: 0,
              usageCount: 0,
              status: 'Active'
            });
          }
        }
      }
    }

    const updated = currentSizes.map(s => {
      const computedCount = this.calculateOrderCountForSize(s.name, s.width, s.height);
      const prevCount = s.activeOrdersCount ?? s.usageCount ?? 0;
      const count = Math.max(prevCount, computedCount);
      return {
        ...s,
        category: (s.category === 'Custom Size' || s.category === 'Customize' || s.category?.toLowerCase() === 'custom') ? 'Customize' : s.category,
        activeOrdersCount: count,
        usageCount: count
      };
    });

    this.saveFrameSizesToStorage(updated);
    this.frameSizesSubject.next(updated);
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
