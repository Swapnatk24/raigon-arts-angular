/* ==========================================================================
   Raigon Arts Management System - Data Storage Layer (LocalStorage CRUD)
   ========================================================================== */

const STORAGE_KEYS = {
  CUSTOMERS: 'raigon_arts_customers',
  FRAME_SIZES: 'raigon_arts_frame_sizes',
  SETTINGS: 'raigon_arts_settings',
  AUTH: 'raigon_arts_auth',
  LOGO: 'raigon_arts_brand_logo'
};

// Initial Seed Data
const INITIAL_FRAME_SIZES = [
  { id: 'FS-01', name: '4 × 6 inch', width: 4, height: 6, unit: 'inch', category: 'Standard Photo', usageCount: 142, status: 'Active' },
  { id: 'FS-02', name: '5 × 7 inch', width: 5, height: 7, unit: 'inch', category: 'Standard Photo', usageCount: 98, status: 'Active' },
  { id: 'FS-03', name: '8 × 10 inch', width: 8, height: 10, unit: 'inch', category: 'Medium Portrait', usageCount: 210, status: 'Active' },
  { id: 'FS-04', name: '8 × 12 inch', width: 8, height: 12, unit: 'inch', category: 'Medium Portrait', usageCount: 320, status: 'Active' },
  { id: 'FS-05', name: '12 × 18 inch', width: 12, height: 18, unit: 'inch', category: 'Large Gallery', usageCount: 455, status: 'Active' },
  { id: 'FS-06', name: '16 × 20 inch', width: 16, height: 20, unit: 'inch', category: 'Large Gallery', usageCount: 184, status: 'Active' },
  { id: 'FS-07', name: '20 × 30 inch', width: 20, height: 30, unit: 'inch', category: 'Exhibition Wall Art', usageCount: 92, status: 'Active' }
];

const INITIAL_CUSTOMERS = [
  {
    id: 'RA-1001',
    name: 'Arun Kumar',
    phone: '7902261255',
    altPhone: '9447123456',
    address: 'TC 14/201, MG Road, Overbridge',
    city: 'Trivandrum',
    pincode: '695001',
    frameSize: '12 × 18 inch',
    customSize: '',
    frameType: 'Wooden Frame',
    material: 'Teak Wood Moulding',
    color: 'Walnut Brown',
    orientation: 'Landscape',
    quantity: 2,
    photos: [
      { id: 'P-101', name: 'Family_Portrait_01.jpg', url: './assets/images/d1.jpeg', size: '3.4 MB' },
      { id: 'P-102', name: 'Vacation_Beach_02.jpg', url: './assets/images/d2.jpeg', size: '2.8 MB' },
      { id: 'P-103', name: 'Studio_Group_03.jpg', url: './assets/images/d3.jpeg', size: '4.1 MB' },
      { id: 'P-104', name: 'Heritage_Home_04.jpg', url: './assets/images/d4.jpeg', size: '3.0 MB' },
      { id: 'P-105', name: 'Anniversary_05.jpg', url: './assets/images/d5.jpeg', size: '2.9 MB' }
    ],
    totalAmount: 4500,
    advancePaid: 2000,
    balanceAmount: 2500,
    paymentStatus: 'Partial',
    orderStatus: 'In Progress',
    orderDate: 'Aug 27, 2026',
    deliveryDate: 'Sep 02, 2026',
    notes: 'Require anti-glare glass coating and gold fillet inlay.'
  },
  {
    id: 'RA-1002',
    name: 'Fathima',
    phone: '7902261255',
    altPhone: '',
    address: 'Flat 4B, Marine Drive Towers',
    city: 'Kochi',
    pincode: '682031',
    frameSize: '8 × 12 inch',
    customSize: '',
    frameType: 'Premium Frame',
    material: 'Gold Filigree Resin',
    color: 'Antique Gold',
    orientation: 'Portrait',
    quantity: 1,
    photos: [
      { id: 'P-106', name: 'Bridal_Portrait.jpg', url: './assets/images/d6.jpeg', size: '5.2 MB' },
      { id: 'P-107', name: 'Nikah_Ceremony.jpg', url: './assets/images/d7.jpeg', size: '4.8 MB' },
      { id: 'P-108', name: 'Reception_Couple.jpg', url: './assets/images/d8.jpeg', size: '3.9 MB' }
    ],
    totalAmount: 2200,
    advancePaid: 2200,
    balanceAmount: 0,
    paymentStatus: 'Paid',
    orderStatus: 'Completed',
    orderDate: 'Aug 26, 2026',
    deliveryDate: 'Aug 29, 2026',
    notes: 'Customer requested double velvet passe-partout matting.'
  },
  {
    id: 'RA-1003',
    name: 'Rahul Raj',
    phone: '7902261255',
    altPhone: '9847112233',
    address: 'Near Beach Road, Kadappakada',
    city: 'Kollam',
    pincode: '691008',
    frameSize: '16 × 20 inch',
    customSize: '',
    frameType: 'Classic Frame',
    material: 'Matte Black Aluminum',
    color: 'Sleek Black',
    orientation: 'Square',
    quantity: 4,
    photos: [
      { id: 'P-109', name: 'Landscape_Monochrome.jpg', url: './assets/images/d9.jpeg', size: '6.1 MB' },
      { id: 'P-110', name: 'Architecture_Abstract.jpg', url: './assets/images/d10.jpeg', size: '5.4 MB' }
    ],
    totalAmount: 12000,
    advancePaid: 3000,
    balanceAmount: 9000,
    paymentStatus: 'Partial',
    orderStatus: 'Pending',
    orderDate: 'Aug 25, 2026',
    deliveryDate: 'Sep 05, 2026',
    notes: 'Wholesale order for gallery installation.'
  },
  {
    id: 'RA-1004',
    name: 'Ananya Nair',
    phone: '7902261255',
    altPhone: '',
    address: '12/450, Calicut Beach Avenue',
    city: 'Kozhikode',
    pincode: '673001',
    frameSize: '20 × 30 inch',
    customSize: '',
    frameType: 'Canvas Float',
    material: 'Natural Oak Float Wood',
    color: 'Natural Wood',
    orientation: 'Landscape',
    quantity: 1,
    photos: [
      { id: 'P-111', name: 'Oil_Painting_Scan.jpg', url: './assets/images/d11.jpeg', size: '8.4 MB' },
      { id: 'P-112', name: 'Artistic_Abstract.jpg', url: './assets/images/d12.jpeg', size: '7.1 MB' }
    ],
    totalAmount: 6800,
    advancePaid: 6800,
    balanceAmount: 0,
    paymentStatus: 'Paid',
    orderStatus: 'Completed',
    orderDate: 'Aug 24, 2026',
    deliveryDate: 'Aug 27, 2026',
    notes: 'Framing job completed successfully.'
  },
  {
    id: 'RA-1005',
    name: 'Deepak Varma',
    phone: '7902261255',
    altPhone: '',
    address: 'Baker Junction, Kanjikuzhy',
    city: 'Kottayam',
    pincode: '686004',
    frameSize: '8 × 10 inch',
    customSize: '',
    frameType: 'Box Frame',
    material: 'Acrylic Deep Shadow Box',
    color: 'White Satin',
    orientation: 'Portrait',
    quantity: 3,
    photos: [
      { id: 'P-113', name: 'Baby_Memories.jpg', url: './assets/images/d1.jpeg', size: '2.5 MB' }
    ],
    totalAmount: 3600,
    advancePaid: 0,
    balanceAmount: 3600,
    paymentStatus: 'Unpaid',
    orderStatus: 'Cancelled',
    orderDate: 'Aug 23, 2026',
    deliveryDate: 'N/A',
    notes: 'Order cancelled by customer due to size re-selection.'
  },
  {
    id: 'RA-0995',
    name: 'Suresh Nair',
    phone: '9847011223',
    altPhone: '',
    address: 'Vazhuthacaud Junction',
    city: 'Trivandrum',
    pincode: '695014',
    frameSize: '12 × 18 inch',
    customSize: '',
    frameType: 'Wooden Frame',
    material: 'Teak Wood Moulding',
    color: 'Dark Teak',
    orientation: 'Landscape',
    quantity: 2,
    photos: [],
    totalAmount: 5400,
    advancePaid: 5400,
    balanceAmount: 0,
    paymentStatus: 'Paid',
    orderStatus: 'Completed',
    orderDate: 'Jul 10, 2026',
    deliveryDate: 'Jul 15, 2026',
    isArchived7Days: true,
    notes: 'Completed 7+ days ago. Auto-archived from active customer list, retained in Reports.'
  },
  {
    id: 'RA-0988',
    name: 'Vinod Kumar',
    phone: '9895233445',
    altPhone: '',
    address: 'Kowdiar Avenue',
    city: 'Trivandrum',
    pincode: '695003',
    frameSize: '8 × 12 inch',
    customSize: '',
    frameType: 'Classic Frame',
    material: 'Matte Black Aluminum',
    color: 'Sleek Black',
    orientation: 'Portrait',
    quantity: 2,
    photos: [],
    totalAmount: 4000,
    advancePaid: 4000,
    balanceAmount: 0,
    paymentStatus: 'Paid',
    orderStatus: 'Completed',
    orderDate: 'Jun 12, 2026',
    deliveryDate: 'Jun 20, 2026',
    isArchived7Days: true,
    notes: 'Completed 7+ days ago. Auto-archived from active customer list, retained in Reports.'
  }
];

class StorageManager {
  constructor() {
    this.init();
  }

  init() {
    if (!localStorage.getItem(STORAGE_KEYS.CUSTOMERS)) {
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(INITIAL_CUSTOMERS));
    } else {
      // Migration helper: replace old dummy test numbers (9876543210) with real customer test phone 7902261255
      try {
        let currentCust = JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOMERS)) || [];
        let updated = false;
        let pCount = 0;
        currentCust = currentCust.map(c => {
          let itemUpdated = false;
          if (c.phone && (c.phone.includes('98765') || c.phone.length < 10)) {
            c.phone = '7902261255';
            itemUpdated = true;
          }
          if (c.photos && Array.isArray(c.photos)) {
            c.photos = c.photos.map(p => {
              if (p.url && (p.url.includes('sample_frame_1') || p.url.includes('sample_frame_2'))) {
                itemUpdated = true;
                const dNum = (pCount % 12) + 1;
                pCount++;
                return { ...p, url: `./assets/images/d${dNum}.jpeg` };
              }
              if (p.url && p.url.includes('d') && p.url.includes('.jpeg')) {
                pCount++;
              }
              return p;
            });
          }
          if (itemUpdated) updated = true;
          return c;
        });
        if (updated) {
          localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(currentCust));
        }
      } catch (e) {
        console.error('Migration error:', e);
      }
    }
    if (!localStorage.getItem(STORAGE_KEYS.FRAME_SIZES)) {
      localStorage.setItem(STORAGE_KEYS.FRAME_SIZES, JSON.stringify(INITIAL_FRAME_SIZES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.AUTH)) {
      localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify({ isLoggedIn: false, user: 'Admin' }));
    }
  }

  // --- Image Compression Utility ---
  compressImageDataUrl(dataUrl, maxDimension = 1000, quality = 0.75) {
    return new Promise((resolve) => {
      if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/')) {
        return resolve(dataUrl);
      }

      if (dataUrl.length < 200000) {
        return resolve(dataUrl);
      }

      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      img.onerror = () => {
        resolve(dataUrl);
      };
      img.src = dataUrl;
    });
  }

  // --- Customers CRUD ---
  getCustomers() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOMERS)) || [];
    } catch (e) {
      console.error('Error loading customers from localStorage', e);
      return INITIAL_CUSTOMERS;
    }
  }

  getCustomerById(id) {
    const customers = this.getCustomers();
    return customers.find(c => c.id === id);
  }

  saveCustomer(customerData) {
    const customers = this.getCustomers();
    const existingIndex = customers.findIndex(c => c.id === customerData.id);

    if (existingIndex >= 0) {
      customers[existingIndex] = { ...customers[existingIndex], ...customerData };
    } else {
      // Auto generate ID if missing
      if (!customerData.id) {
        const lastIdNum = customers.reduce((max, c) => {
          const num = parseInt(c.id.replace('RA-', ''), 10);
          return num > max ? num : max;
        }, 1000);
        customerData.id = `RA-${lastIdNum + 1}`;
      }
      customers.unshift(customerData);
    }

    try {
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
    } catch (e) {
      console.warn('LocalStorage save failed, attempting fallback payload compression...', e);
      const fallbackCustomers = customers.map(c => ({
        ...c,
        photos: (c.photos || []).map(p => ({
          ...p,
          url: p.url && p.url.length > 300000 ? './assets/images/d1.jpeg' : p.url
        }))
      }));
      try {
        localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(fallbackCustomers));
      } catch (e2) {
        console.error('Critical localStorage quota error:', e2);
      }
    }
    return customerData;
  }

  deleteCustomer(id) {
    let customers = this.getCustomers();
    customers = customers.filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
    return true;
  }

  // --- Frame Sizes CRUD ---
  getFrameSizes() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.FRAME_SIZES)) || [];
    } catch (e) {
      return INITIAL_FRAME_SIZES;
    }
  }

  saveFrameSize(sizeData) {
    const sizes = this.getFrameSizes();
    const existingIndex = sizes.findIndex(s => s.id === sizeData.id);

    if (existingIndex >= 0) {
      sizes[existingIndex] = { ...sizes[existingIndex], ...sizeData };
    } else {
      if (!sizeData.id) {
        sizeData.id = `FS-${String(sizes.length + 1).padStart(2, '0')}`;
      }
      sizes.push(sizeData);
    }
    localStorage.setItem(STORAGE_KEYS.FRAME_SIZES, JSON.stringify(sizes));
    return sizeData;
  }

  deleteFrameSize(id) {
    let sizes = this.getFrameSizes();
    sizes = sizes.filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.FRAME_SIZES, JSON.stringify(sizes));
    return true;
  }

  // --- Photo Collection Extractor ---
  getAllPhotos() {
    const customers = this.getCustomers();
    const allPhotos = [];
    customers.forEach(cust => {
      if (cust.photos && Array.isArray(cust.photos)) {
        cust.photos.forEach(photo => {
          allPhotos.push({
            ...photo,
            customerId: cust.id,
            customerName: cust.name,
            orderDate: cust.orderDate,
            orderStatus: cust.orderStatus,
            frameSize: photo.frameSize || cust.frameSize || '12 × 18 inch',
            frameType: photo.frameType || cust.frameType || 'Wooden Frame',
            material: photo.material || cust.material || 'Teak Wood Moulding',
            color: photo.color || cust.color || 'Walnut Brown',
            orientation: photo.orientation || cust.orientation || 'Landscape',
            quantity: photo.quantity || 1,
            notes: photo.notes || cust.notes || ''
          });
        });
      }
    });
    return allPhotos;
  }

  // --- Dashboard Metrics helper ---
  getDashboardStats() {
    const customers = this.getCustomers();
    const totalCustomers = customers.length;
    const totalOrders = customers.length; // 1 main frame order per customer record
    const inProgress = customers.filter(c => c.orderStatus === 'In Progress').length;
    const completed = customers.filter(c => c.orderStatus === 'Completed').length;
    const pending = customers.filter(c => c.orderStatus === 'Pending').length;
    const totalRevenue = customers.reduce((sum, c) => sum + (Number(c.totalAmount) || 0), 0);
    const totalAdvance = customers.reduce((sum, c) => sum + (Number(c.advancePaid) || 0), 0);

    return {
      totalCustomers,
      totalOrders,
      inProgress,
      completed,
      pending,
      totalRevenue,
      totalAdvance,
      todayOrders: 2
    };
  }

  // --- Auth State ---
  getAuth() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.AUTH)) || { isLoggedIn: true, user: 'Admin' };
    } catch (e) {
      return { isLoggedIn: true, user: 'Admin' };
    }
  }

  setAuth(isLoggedIn, user = 'Admin') {
    localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify({ isLoggedIn, user }));
  }

  // --- Brand Logo ---
  getCustomLogo() {
    return localStorage.getItem(STORAGE_KEYS.LOGO) || 'assets/images/img2.png';
  }

  setCustomLogo(logoDataUrl) {
    localStorage.setItem(STORAGE_KEYS.LOGO, logoDataUrl);
  }

  removeCustomLogo() {
    localStorage.removeItem(STORAGE_KEYS.LOGO);
  }
}

window.RaigonStorage = new StorageManager();
