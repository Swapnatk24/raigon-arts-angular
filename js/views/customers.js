/* ==========================================================================
   Raigon Arts Management System - Customer CRUD & Data Table Hero View
   ========================================================================== */

class CustomersView {
  constructor() {
    this.container = document.getElementById('customersView');
    this.searchQuery = '';
    this.statusFilter = 'All';
    this.sortBy = 'date_desc';
    this.currentPage = 1;
    this.pageSize = 10;
    this.currentEditingId = null;
    this.stagedPhotos = [];
    this.frameConfigMode = 'same'; // 'same' or 'individual'
  }

  setFrameConfigMode(mode) {
    this.frameConfigMode = mode;
    const sameCard = document.getElementById('configCardSame');
    const indivCard = document.getElementById('configCardIndividual');

    if (sameCard && indivCard) {
      if (mode === 'same') {
        sameCard.classList.add('active');
        indivCard.classList.remove('active');
      } else {
        sameCard.classList.remove('active');
        indivCard.classList.add('active');
      }
    }
    this.renderFrameConfigView();
  }

  renderFrameConfigView() {
    const bulkSection = document.getElementById('bulkUploadSection');
    const commonSpecs = document.getElementById('commonFrameSpecsSection');
    const indivSection = document.getElementById('individualPhotoSection');

    if (this.frameConfigMode === 'same') {
      if (bulkSection) bulkSection.style.display = 'block';
      if (commonSpecs) commonSpecs.style.display = 'block';
      if (indivSection) indivSection.style.display = 'none';
      this.renderStagedPhotos();
    } else {
      if (bulkSection) bulkSection.style.display = 'none';
      if (commonSpecs) commonSpecs.style.display = 'none';
      if (indivSection) indivSection.style.display = 'block';
      this.renderIndividualPhotoCards();
    }
  }

  replaceIndividualPhoto(index, files) {
    if (!files || !files.length) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      if (this.stagedPhotos[index]) {
        this.stagedPhotos[index].name = file.name;
        this.stagedPhotos[index].url = e.target.result;
        this.stagedPhotos[index].size = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
      }
      this.renderFrameConfigView();
    };
    reader.readAsDataURL(file);
  }

  updatePhotoSpec(index, field, value) {
    if (this.stagedPhotos[index]) {
      this.stagedPhotos[index][field] = value;
    }
  }

  renderIndividualPhotoCards() {
    const container = document.getElementById('individualCardsList');
    if (!container) return;

    if (this.stagedPhotos.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 32px 16px; border: 2px dashed var(--border-color); border-radius: 16px; background: var(--bg-surface); margin-bottom: 20px;">
          <i class="fa-solid fa-images" style="font-size: 32px; color: var(--text-muted); margin-bottom: 10px;"></i>
          <p style="margin: 0; font-size: 14px; font-weight: 700; color: var(--text-primary);">No photos added yet</p>
          <p style="margin: 4px 0 0 0; font-size: 12px; color: var(--text-muted);">Click "Add Another Photo & Frame" below to add a photo card.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = this.stagedPhotos.map((p, idx) => `
      <div class="individual-photo-card" id="indivCard_${idx}">
        <!-- CARD TOP BAR -->
        <div class="photo-card-top-bar">
          <div style="display: flex; align-items: center; gap: 14px; flex: 1;">
            <div class="photo-card-img-preview">
              <img src="${p.url}" alt="${p.name}">
            </div>
            <div class="photo-card-info">
              <div class="photo-card-filename"><i class="fa-solid fa-image text-primary"></i> ${p.name}</div>
              <div class="photo-card-badges">
                <span class="badge" style="background: rgba(212,191,138,0.18); color: #B38F38; font-size: 11px; font-weight: 600;">Photo #${idx + 1}</span>
                <span class="text-xs text-muted">${p.size || '3 MB'}</span>
              </div>
            </div>
          </div>
          
          <div style="display: flex; align-items: center; gap: 8px;">
            <button type="button" class="btn btn-secondary btn-sm" onclick="document.getElementById('indivFileInput_${idx}').click()" title="Replace Photo">
              <i class="fa-solid fa-arrows-rotate"></i> Replace
            </button>
            <input type="file" id="indivFileInput_${idx}" accept="image/*" style="display: none;" onchange="window.RaigonCustomersView.replaceIndividualPhoto(${idx}, this.files); this.value='';">
            
            <button type="button" class="btn btn-sm" style="background: #FCE4E4; color: #EA5455; border: 1px solid #F7C5C5;" onclick="window.RaigonCustomersView.removeStagedPhoto(${idx})" title="Remove Photo Card">
              <i class="fa-solid fa-trash"></i> Remove
            </button>
          </div>
        </div>

        <!-- INDIVIDUAL FRAME SPECIFICATIONS FORM GRID -->
        <div class="form-grid">
          <div class="col-6 form-group">
            <label class="form-label">Frame Size</label>
            <select id="photo_frameSize_${idx}" class="form-select" onchange="window.RaigonCustomersView.updatePhotoSpec(${idx}, 'frameSize', this.value)">
              <option value="4 × 6 inch" ${p.frameSize === '4 × 6 inch' ? 'selected' : ''}>4 × 6 inch</option>
              <option value="5 × 7 inch" ${p.frameSize === '5 × 7 inch' ? 'selected' : ''}>5 × 7 inch</option>
              <option value="8 × 10 inch" ${p.frameSize === '8 × 10 inch' ? 'selected' : ''}>8 × 10 inch</option>
              <option value="8 × 12 inch" ${p.frameSize === '8 × 12 inch' ? 'selected' : ''}>8 × 12 inch</option>
              <option value="12 × 18 inch" ${(!p.frameSize || p.frameSize === '12 × 18 inch') ? 'selected' : ''}>12 × 18 inch</option>
              <option value="16 × 20 inch" ${p.frameSize === '16 × 20 inch' ? 'selected' : ''}>16 × 20 inch</option>
              <option value="20 × 30 inch" ${p.frameSize === '20 × 30 inch' ? 'selected' : ''}>20 × 30 inch</option>
              <option value="Custom Size" ${p.frameSize === 'Custom Size' ? 'selected' : ''}>Custom Size</option>
            </select>
          </div>

          <div class="col-6 form-group">
            <label class="form-label">Unit</label>
            <select id="photo_unit_${idx}" class="form-select" onchange="window.RaigonCustomersView.updatePhotoSpec(${idx}, 'unit', this.value)">
              <option value="inch" ${(!p.unit || p.unit === 'inch') ? 'selected' : ''}>Inch</option>
              <option value="cm" ${p.unit === 'cm' ? 'selected' : ''}>CM</option>
              <option value="mm" ${p.unit === 'mm' ? 'selected' : ''}>MM</option>
            </select>
          </div>

          <div class="col-6 form-group">
            <label class="form-label">Custom Width</label>
            <input type="number" id="photo_customWidth_${idx}" class="form-input" placeholder="Width (e.g. 12)" value="${p.customWidth || ''}" oninput="window.RaigonCustomersView.updatePhotoSpec(${idx}, 'customWidth', this.value)">
          </div>

          <div class="col-6 form-group">
            <label class="form-label">Custom Height</label>
            <input type="number" id="photo_customHeight_${idx}" class="form-input" placeholder="Height (e.g. 18)" value="${p.customHeight || ''}" oninput="window.RaigonCustomersView.updatePhotoSpec(${idx}, 'customHeight', this.value)">
          </div>

          <div class="col-4 form-group">
            <label class="form-label">Frame Type</label>
            <select id="photo_frameType_${idx}" class="form-select" onchange="window.RaigonCustomersView.updatePhotoSpec(${idx}, 'frameType', this.value)">
              <option value="Wooden Frame" ${(!p.frameType || p.frameType === 'Wooden Frame') ? 'selected' : ''}>Wooden Frame</option>
              <option value="Premium Frame" ${p.frameType === 'Premium Frame' ? 'selected' : ''}>Premium Frame</option>
              <option value="Classic Frame" ${p.frameType === 'Classic Frame' ? 'selected' : ''}>Classic Frame</option>
              <option value="Canvas Float" ${p.frameType === 'Canvas Float' ? 'selected' : ''}>Canvas Float</option>
              <option value="Box Frame" ${p.frameType === 'Box Frame' ? 'selected' : ''}>Box Frame</option>
            </select>
          </div>

          <div class="col-4 form-group">
            <label class="form-label">Frame Material</label>
            <input type="text" id="photo_material_${idx}" class="form-input" placeholder="e.g. Teak Wood Moulding" value="${p.material || 'Teak Wood Moulding'}" oninput="window.RaigonCustomersView.updatePhotoSpec(${idx}, 'material', this.value)">
          </div>

          <div class="col-4 form-group">
            <label class="form-label">Frame Color Finish</label>
            <input type="text" id="photo_color_${idx}" class="form-input" placeholder="e.g. Walnut Brown" value="${p.color || 'Walnut Brown'}" oninput="window.RaigonCustomersView.updatePhotoSpec(${idx}, 'color', this.value)">
          </div>

          <div class="col-6 form-group">
            <label class="form-label">Photo Orientation</label>
            <select id="photo_orientation_${idx}" class="form-select" onchange="window.RaigonCustomersView.updatePhotoSpec(${idx}, 'orientation', this.value)">
              <option value="Landscape" ${(!p.orientation || p.orientation === 'Landscape') ? 'selected' : ''}>Landscape (Horizontal)</option>
              <option value="Portrait" ${p.orientation === 'Portrait' ? 'selected' : ''}>Portrait (Vertical)</option>
              <option value="Square" ${p.orientation === 'Square' ? 'selected' : ''}>Square</option>
            </select>
          </div>

          <div class="col-6 form-group">
            <label class="form-label">Quantity</label>
            <input type="number" id="photo_quantity_${idx}" class="form-input" value="${p.quantity || 1}" min="1" oninput="window.RaigonCustomersView.updatePhotoSpec(${idx}, 'quantity', Number(this.value) || 1)">
          </div>

          <div class="col-12 form-group">
            <label class="form-label">Special Instructions / Mounting Notes</label>
            <textarea id="photo_notes_${idx}" class="form-textarea" rows="2" placeholder="Glass type (Anti-glare, Clear), Matting board margin, mounting hooks..." oninput="window.RaigonCustomersView.updatePhotoSpec(${idx}, 'notes', this.value)">${p.notes || ''}</textarea>
          </div>
        </div>
      </div>
    `).join('');
  }

  render() {
    const allCustomers = window.RaigonStorage.getCustomers();
    let filtered = this.filterAndSortCustomers(allCustomers);

    const totalCount = filtered.length;
    const totalPages = Math.ceil(totalCount / this.pageSize) || 1;
    if (this.currentPage > totalPages) this.currentPage = totalPages;

    const startIndex = (this.currentPage - 1) * this.pageSize;
    const paginated = filtered.slice(startIndex, startIndex + this.pageSize);

    this.container.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">Customers</h1>
          <p class="page-subtitle">Manage customer details and photo frame orders</p>
        </div>
        <div class="flex gap-3">
          <button class="btn btn-secondary" onclick="window.RaigonCustomersView.exportCSV()">
            <i class="fa-solid fa-file-export"></i> Export CSV
          </button>
          <button class="btn btn-primary" onclick="window.RaigonCustomersView.openCustomerModal()">
            <i class="fa-solid fa-user-plus"></i> Add New Customer
          </button>
        </div>
      </div>

      <!-- Main Data Table Container -->
      <div class="table-card">
        <div class="table-toolbar">
          <div class="toolbar-left">
            <div class="table-search">
              <i class="fa-solid fa-magnifying-glass"></i>
              <input type="text" placeholder="Search customer, phone, ID..." value="${this.searchQuery}" oninput="window.RaigonCustomersView.handleSearch(this.value)">
            </div>
            
            <!-- Status Filter -->
            <select class="form-select text-sm" style="width: 160px;" onchange="window.RaigonCustomersView.handleFilterChange(this.value)">
              <option value="All" ${this.statusFilter === 'All' ? 'selected' : ''}>All Statuses</option>
              <option value="Pending" ${this.statusFilter === 'Pending' ? 'selected' : ''}>Pending</option>
              <option value="In Progress" ${this.statusFilter === 'In Progress' ? 'selected' : ''}>In Progress</option>
              <option value="Completed" ${this.statusFilter === 'Completed' ? 'selected' : ''}>Completed</option>
              <option value="Cancelled" ${this.statusFilter === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
            </select>
          </div>

          <div class="toolbar-right">
            <!-- Sort Selector -->
            <select class="form-select text-sm" style="width: 180px;" onchange="window.RaigonCustomersView.handleSortChange(this.value)">
              <option value="date_desc" ${this.sortBy === 'date_desc' ? 'selected' : ''}>Newest First</option>
              <option value="date_asc" ${this.sortBy === 'date_asc' ? 'selected' : ''}>Oldest First</option>
              <option value="name_asc" ${this.sortBy === 'name_asc' ? 'selected' : ''}>Name (A-Z)</option>
              <option value="amount_desc" ${this.sortBy === 'amount_desc' ? 'selected' : ''}>Total Amount (High-Low)</option>
            </select>
          </div>
        </div>

        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th style="width: 110px;">Customer ID</th>
                <th style="width: 170px;">Customer Name</th>
                <th style="width: 130px;">Phone No</th>
                <th style="width: 180px;">Address</th>
                <th style="width: 150px;">Selected Photos</th>
                <th style="width: 110px;">Frame Size</th>
                <th style="width: 120px;">Frame Type</th>
                <th style="width: 60px;">Qty</th>
                <th style="width: 130px;">Order Status</th>
                <th style="width: 110px;">Order Date</th>
                <th style="width: 110px; text-align: center;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${paginated.length === 0 ? `
                <tr>
                  <td colspan="11" style="text-align: center; padding: 40px; color: var(--text-muted);">
                    <i class="fa-solid fa-folder-open" style="font-size: 32px; margin-bottom: 8px; display: block;"></i>
                    No customer records match your filter criteria.
                  </td>
                </tr>
              ` : paginated.map(cust => `
                <tr>
                  <td class="font-bold text-primary">${cust.id}</td>
                  <td>
                    <div class="customer-avatar-cell">
                      <div class="avatar-circle">${cust.name.charAt(0)}</div>
                      <div>
                        <div class="font-semibold">${cust.name}</div>
                        <div class="text-xs text-muted">${cust.city || 'Kerala'}</div>
                      </div>
                    </div>
                  </td>
                  <td class="font-medium">${cust.phone}</td>
                  <td>
                    <div style="max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${cust.address || ''}">
                      ${cust.address || 'N/A'}
                    </div>
                  </td>
                  <td>${this.renderPhotoStack(cust.photos)}</td>
                  <td class="font-semibold">${cust.frameSize}</td>
                  <td>${cust.frameType}</td>
                  <td class="font-bold">${cust.quantity}</td>
                  <td>${this.getStatusBadge(cust.orderStatus)}</td>
                  <td class="text-sm">${cust.orderDate}</td>
                  <td>
                    <div class="table-actions">
                      <button class="action-btn" title="View Customer Profile" onclick="window.RaigonCustomersView.viewCustomer('${cust.id}')">
                        <i class="fa-solid fa-eye"></i>
                      </button>
                      <button class="action-btn" style="color: #25D366; background: rgba(37, 211, 102, 0.12);" title="Send WhatsApp Order Receipt" onclick="window.RaigonCustomersView.sendWhatsAppReceipt('${cust.id}')">
                        <i class="fa-brands fa-whatsapp"></i>
                      </button>
                      <button class="action-btn edit" title="Edit Customer & Order" onclick="window.RaigonCustomersView.editCustomer('${cust.id}')">
                        <i class="fa-solid fa-pen-to-square"></i>
                      </button>
                      <button class="action-btn delete" title="Delete Record" onclick="window.RaigonCustomersView.confirmDelete('${cust.id}', '${cust.name}')">
                        <i class="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- Table Pagination Bar -->
        <div class="table-pagination">
          <div class="text-sm text-muted">
            Showing <span class="font-semibold">${totalCount === 0 ? 0 : startIndex + 1}</span>–<span class="font-semibold">${Math.min(startIndex + this.pageSize, totalCount)}</span> of <span class="font-semibold">${totalCount}</span> customers
          </div>
          <div class="pagination-controls">
            <button class="page-btn" ${this.currentPage === 1 ? 'disabled' : ''} onclick="window.RaigonCustomersView.changePage(${this.currentPage - 1})">
              <i class="fa-solid fa-chevron-left"></i> Previous
            </button>
            <span class="text-sm font-semibold" style="margin: 0 8px;">Page ${this.currentPage} of ${totalPages}</span>
            <button class="page-btn" ${this.currentPage === totalPages || totalCount === 0 ? 'disabled' : ''} onclick="window.RaigonCustomersView.changePage(${this.currentPage + 1})">
              Next <i class="fa-solid fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
    `;

    this.bindFormEvents();
    if (window.RaigonSelect2) {
      window.RaigonSelect2.enhanceAll(this.container);
    }
  }

  renderPhotoStack(photos) {
    if (!photos || !Array.isArray(photos) || photos.length === 0) {
      return `<span class="text-xs text-muted">No photos</span>`;
    }

    const displayCount = 3;
    const slice = photos.slice(0, displayCount);
    const remaining = photos.length - displayCount;

    return `
      <div class="photo-stack" title="${photos.length} photos uploaded">
        ${slice.map(p => `<img src="${p.url || './assets/images/sample_frame_1.jpg'}" class="photo-thumbnail-sm" alt="Thumbnail">`).join('')}
        ${remaining > 0 ? `<div class="photo-more-badge">+${remaining}</div>` : ''}
        <span class="text-xs font-semibold text-muted" style="margin-left: 6px;">(${photos.length})</span>
      </div>
    `;
  }

  getStatusBadge(status) {
    let badgeClass = 'badge-pending';
    if (status === 'In Progress') badgeClass = 'badge-in-progress';
    if (status === 'Completed') badgeClass = 'badge-completed';
    if (status === 'Cancelled') badgeClass = 'badge-cancelled';

    return `
      <span class="badge ${badgeClass}">
        <span class="badge-dot"></span> ${status}
      </span>
    `;
  }

  filterAndSortCustomers(customers) {
    return customers.filter(c => {
      const matchQuery = !this.searchQuery ||
        c.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        c.phone.includes(this.searchQuery) ||
        c.id.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        (c.city && c.city.toLowerCase().includes(this.searchQuery.toLowerCase()));

      const matchStatus = this.statusFilter === 'All' || c.orderStatus === this.statusFilter;

      return matchQuery && matchStatus;
    }).sort((a, b) => {
      if (this.sortBy === 'name_asc') return a.name.localeCompare(b.name);
      if (this.sortBy === 'amount_desc') return (Number(b.totalAmount) || 0) - (Number(a.totalAmount) || 0);
      if (this.sortBy === 'date_asc') return new Date(a.orderDate) - new Date(b.orderDate);
      return new Date(b.orderDate) - new Date(a.orderDate);
    });
  }

  handleSearch(val) {
    this.searchQuery = val;
    this.currentPage = 1;
    this.render();
  }

  handleFilterChange(val) {
    this.statusFilter = val;
    this.currentPage = 1;
    this.render();
  }

  handleSortChange(val) {
    this.sortBy = val;
    this.render();
  }

  changePage(newPage) {
    this.currentPage = newPage;
    this.render();
  }

  formatDateDDMMYYYY(val) {
    if (!val) return '';
    if (/^\d{2}-\d{2}-\d{4}$/.test(val)) return val;
    if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
      const parts = val.split('-');
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    const d = new Date(val);
    if (isNaN(d.getTime())) return val;
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  }

  // --- Modal Openers for Add / Edit ---
  openCustomerModal(customerId = null) {
    this.currentEditingId = customerId;
    this.stagedPhotos = [];

    const titleEl = document.getElementById('customerModalTitle');
    const form = document.getElementById('customerForm');
    form.reset();

    if (customerId) {
      titleEl.textContent = `Edit Customer & Order (${customerId})`;
      const cust = window.RaigonStorage.getCustomerById(customerId);
      if (cust) {
        document.getElementById('formCustId').value = cust.id;
        document.getElementById('formCustName').value = cust.name;
        document.getElementById('formCustPhone').value = cust.phone;
        document.getElementById('formCustAltPhone').value = cust.altPhone || '';
        document.getElementById('formCustAddress').value = cust.address || '';
        document.getElementById('formCustCity').value = cust.city || '';
        document.getElementById('formCustPincode').value = cust.pincode || '';

        document.getElementById('formFrameSize').value = cust.frameSize || '12 × 18 inch';
        document.getElementById('formCustomWidth').value = cust.customWidth || '';
        document.getElementById('formCustomHeight').value = cust.customHeight || '';
        document.getElementById('formFrameType').value = cust.frameType || 'Wooden Frame';
        document.getElementById('formFrameMaterial').value = cust.material || 'Teak Wood Moulding';
        document.getElementById('formFrameColor').value = cust.color || 'Walnut Brown';
        document.getElementById('formOrientation').value = cust.orientation || 'Landscape';
        document.getElementById('formQuantity').value = cust.quantity || 1;
        document.getElementById('formNotes').value = cust.notes || '';

        document.getElementById('formOrderDate').value = cust.orderDate || new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
        document.getElementById('formDeliveryDate').value = this.formatDateDDMMYYYY(cust.deliveryDate);
        document.getElementById('formTotalAmount').value = cust.totalAmount || 0;
        document.getElementById('formAdvancePaid').value = cust.advancePaid || 0;
        document.getElementById('formBalanceAmount').value = cust.balanceAmount || 0;
        document.getElementById('formPaymentStatus').value = cust.paymentStatus || 'Unpaid';
        document.getElementById('formOrderStatus').value = cust.orderStatus || 'Pending';

        this.frameConfigMode = cust.frameConfigMode || 'same';
        this.stagedPhotos = cust.photos ? cust.photos.map(p => ({
          id: p.id || `P-${Date.now()}`,
          name: p.name || 'Photo',
          url: p.url || './assets/images/sample_frame_1.jpg',
          size: p.size || '3.2 MB',
          frameSize: p.frameSize || cust.frameSize || '12 × 18 inch',
          unit: p.unit || cust.unit || 'inch',
          customWidth: p.customWidth || cust.customWidth || '',
          customHeight: p.customHeight || cust.customHeight || '',
          frameType: p.frameType || cust.frameType || 'Wooden Frame',
          material: p.material || cust.material || 'Teak Wood Moulding',
          color: p.color || cust.color || 'Walnut Brown',
          orientation: p.orientation || cust.orientation || 'Landscape',
          quantity: p.quantity || 1,
          notes: p.notes || cust.notes || ''
        })) : [];
      }
    } else {
      if (titleEl) titleEl.textContent = 'Add New Customer & Frame Order';
      document.getElementById('formCustId').value = '';
      document.getElementById('formTotalAmount').value = '';
      document.getElementById('formAdvancePaid').value = '';
      document.getElementById('formBalanceAmount').value = '';
      document.getElementById('formOrderDate').value = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
      this.frameConfigMode = 'same';
      this.stagedPhotos = [
        {
          id: `P-${Date.now()}-1`,
          name: 'Customer_Sample_Photo_01.jpg',
          url: './assets/images/sample_frame_1.jpg',
          size: '3.2 MB',
          frameSize: '12 × 18 inch',
          unit: 'inch',
          customWidth: '',
          customHeight: '',
          frameType: 'Wooden Frame',
          material: 'Teak Wood Moulding',
          color: 'Walnut Brown',
          orientation: 'Landscape',
          quantity: 1,
          notes: ''
        }
      ];
    }

    this.setFrameConfigMode(this.frameConfigMode || 'same');
    window.RaigonModal.open('customerModal');
  }

  editCustomer(id) {
    this.openCustomerModal(id);
  }

  confirmDelete(id, name) {
    window.RaigonModal.confirm({
      title: 'Delete Customer Record',
      message: `Are you sure you want to delete customer "${name}" (${id})? This action cannot be undone.`,
      confirmText: 'Delete Customer',
      confirmClass: 'btn-danger',
      onConfirm: () => {
        window.RaigonStorage.deleteCustomer(id);
        window.RaigonToast.show(`Customer ${id} deleted successfully.`, 'warning');
        this.render();
        window.RaigonDashboardView.render();
      }
    });
  }

  viewCustomer(id) {
    const cust = window.RaigonStorage.getCustomerById(id);
    if (!cust) return;

    const modalBody = document.getElementById('viewCustomerModalBody');
    modalBody.innerHTML = `
      <!-- TOP CUSTOMER HEADER BANNER -->
      <div class="view-customer-banner">
        <div class="flex items-center gap-3">
          <div class="view-avatar-box">${cust.name.charAt(0)}</div>
          <div>
            <h2 class="view-customer-name">${cust.name}</h2>
            <div class="view-pill-group">
              <span class="badge-pill-violet"><i class="fa-solid fa-id-badge"></i> ID: ${cust.id}</span>
              <span class="badge-pill-subtle"><i class="fa-solid fa-phone"></i> ${cust.phone}</span>
              <span class="badge-pill-subtle"><i class="fa-solid fa-calendar"></i> ${cust.orderDate}</span>
            </div>
          </div>
        </div>
        <div>
          ${this.getStatusBadge(cust.orderStatus)}
        </div>
      </div>

      <!-- 2-COLUMN CONTACT & PAYMENT DETAILS GRID -->
      <div class="form-grid">
        <!-- CUSTOMER CONTACT CARD -->
        <div class="col-6">
          <div class="view-detail-card">
            <h4 class="view-card-title"><i class="fa-solid fa-address-book text-primary"></i> Customer Contact Info</h4>
            <div class="info-item-row">
              <span class="info-item-label">Primary Phone</span>
              <span class="info-item-value text-primary font-bold">${cust.phone}</span>
            </div>
            <div class="info-item-row">
              <span class="info-item-label">Alt Phone</span>
              <span class="info-item-value">${cust.altPhone || 'None'}</span>
            </div>
            <div class="info-item-row">
              <span class="info-item-label">Delivery Address</span>
              <span class="info-item-value">${cust.address || 'N/A'}</span>
            </div>
            <div class="info-item-row">
              <span class="info-item-label">City & Pincode</span>
              <span class="info-item-value">${cust.city || ''} ${cust.pincode ? '- ' + cust.pincode : ''}</span>
            </div>
          </div>
        </div>

        <!-- ORDER & FINANCIAL SUMMARY CARD -->
        <div class="col-6">
          <div class="view-detail-card">
            <h4 class="view-card-title"><i class="fa-solid fa-file-invoice-dollar text-primary"></i> Order & Payment Summary</h4>
            <div class="financial-grid">
              <div class="financial-box">
                <span class="financial-label">Total Amount</span>
                <span class="financial-value">₹${Number(cust.totalAmount).toLocaleString('en-IN')}</span>
              </div>
              <div class="financial-box advance-paid">
                <span class="financial-label">Advance Paid</span>
                <span class="financial-value">₹${Number(cust.advancePaid).toLocaleString('en-IN')}</span>
              </div>
              <div class="financial-box balance-due">
                <span class="financial-label">Balance Due</span>
                <span class="financial-value">₹${Number(cust.balanceAmount).toLocaleString('en-IN')}</span>
              </div>
              <div class="financial-box">
                <span class="financial-label">Payment Status</span>
                <span class="financial-value" style="font-size: 15px;">${cust.paymentStatus}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- FRAME WORKSHOP SPECIFICATIONS CARD -->
        <div class="col-12">
          <div class="view-spec-box">
            ${cust.frameConfigMode === 'individual' ? `
              <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;">
                <h4 class="view-card-title" style="margin: 0;">
                  <i class="fa-solid fa-layer-group text-primary"></i> Individual Frame Specifications Configured
                </h4>
                <span class="badge" style="background: linear-gradient(72.47deg, #000000 0%, #D4BF8A 100%); color: #FFFFFF; font-size: 11.5px; font-weight: 700; padding: 4px 10px; border-radius: 6px;">
                  <i class="fa-solid fa-sliders"></i> ${cust.photos ? cust.photos.length : 0} Custom Frames
                </span>
              </div>
              <p class="text-xs text-muted" style="margin: 6px 0 0 0;">Each photo below has its own distinct frame size, material, color, and mounting specifications configured.</p>
            ` : `
              <h4 class="view-card-title"><i class="fa-solid fa-ruler-combined text-primary"></i> Frame Workshop Specifications</h4>
              <div class="spec-grid-vuexy">
                <div class="spec-item">
                  <span class="spec-item-label">Frame Size</span>
                  <span class="spec-item-value">${cust.frameSize}</span>
                </div>
                <div class="spec-item">
                  <span class="spec-item-label">Frame Type</span>
                  <span class="spec-item-value">${cust.frameType}</span>
                </div>
                <div class="spec-item">
                  <span class="spec-item-label">Material</span>
                  <span class="spec-item-value">${cust.material}</span>
                </div>
                <div class="spec-item">
                  <span class="spec-item-label">Color Finish</span>
                  <span class="spec-item-value">${cust.color}</span>
                </div>
                <div class="spec-item">
                  <span class="spec-item-label">Orientation</span>
                  <span class="spec-item-value">${cust.orientation}</span>
                </div>
                <div class="spec-item">
                  <span class="spec-item-label">Quantity</span>
                  <span class="spec-item-value">${cust.quantity} Frames</span>
                </div>
              </div>
              ${cust.notes ? `
                <div class="spec-notes-callout">
                  <i class="fa-solid fa-note-sticky" style="font-size: 16px; margin-top: 2px;"></i>
                  <div>
                    <strong>Special Instructions & Notes:</strong>
                    <div>${cust.notes}</div>
                  </div>
                </div>
              ` : ''}
            `}
          </div>
        </div>

        <!-- DIGITAL GALLERY PHOTOS GRID WITH PER-PHOTO SPECS -->
        <div class="col-12" style="margin-top: 10px;">
          <h4 class="view-card-title"><i class="fa-solid fa-images text-primary"></i> Digital Photo Vault (${cust.photos ? cust.photos.length : 0})</h4>
          
          <div class="view-photo-vault-grid">
            ${(!cust.photos || cust.photos.length === 0) ? `<p class="text-muted" style="padding: 12px; font-size: 13.5px;">No uploaded photos for this order.</p>` : cust.photos.map((p, idx) => `
              <div class="view-photo-card">
                <div class="view-photo-card-top">
                  <div class="view-photo-card-thumb" onclick="window.RaigonModal.openLightbox('${p.url}', '${p.name}')" title="Click to view full image">
                    <img src="${p.url}" alt="${p.name}">
                  </div>
                  <div class="view-photo-card-info">
                    <div class="view-photo-card-name" title="${p.name}">${p.name}</div>
                    <div style="display: flex; align-items: center; gap: 8px; margin-top: 4px;">
                      <span class="view-photo-spec-pill"><i class="fa-solid fa-image"></i> Photo #${idx + 1}</span>
                      <span class="text-xs text-muted font-bold">${p.size || '3 MB'}</span>
                    </div>
                  </div>
                  <button type="button" class="btn btn-primary btn-sm" style="border-radius: 20px; padding: 6px 14px; font-weight: 700; font-size: 12px;" onclick="window.RaigonModal.openLightbox('${p.url}', '${p.name}')" title="Zoom Photo">
                    <i class="fa-solid fa-magnifying-glass-plus"></i> View
                  </button>
                </div>

                <div class="view-photo-card-specs-body">
                  <div class="info-item-row" style="padding: 6px 0; border-bottom: 1px dashed rgba(212, 191, 138, 0.25);">
                    <span class="info-item-label" style="font-weight: 600; color: var(--text-secondary);"><i class="fa-solid fa-ruler-combined text-gold" style="color: #000000;"></i> Frame Size:</span>
                    <span class="info-item-value font-bold" style="color: #000000; font-size: 13.5px;">${p.frameSize || cust.frameSize || '12 × 18 inch'}</span>
                  </div>
                  <div class="info-item-row" style="padding: 6px 0; border-bottom: 1px dashed rgba(212, 191, 138, 0.25);">
                    <span class="info-item-label" style="font-weight: 600; color: var(--text-secondary);"><i class="fa-solid fa-box text-gold" style="color: #000000;"></i> Frame Type & Material:</span>
                    <span class="info-item-value font-bold" style="color: #000000;">${p.frameType || cust.frameType || 'Wooden'} • ${p.material || cust.material || 'Teak Wood'}</span>
                  </div>
                  <div class="info-item-row" style="padding: 6px 0; border-bottom: 1px dashed rgba(212, 191, 138, 0.25);">
                    <span class="info-item-label" style="font-weight: 600; color: var(--text-secondary);"><i class="fa-solid fa-palette text-gold" style="color: #000000;"></i> Color & Finish:</span>
                    <span class="info-item-value font-bold" style="color: #000000;">${p.color || cust.color || 'Walnut Brown'}</span>
                  </div>
                  <div class="info-item-row" style="padding: 6px 0;">
                    <span class="info-item-label" style="font-weight: 600; color: var(--text-secondary);"><i class="fa-solid fa-compass text-gold" style="color: #000000;"></i> Orientation & Qty:</span>
                    <span class="info-item-value font-bold" style="color: #000000;">${p.orientation || cust.orientation || 'Landscape'} • ${p.quantity || 1} Frame(s)</span>
                  </div>
                  ${(p.notes || cust.notes) ? `
                    <div style="margin-top: 8px; padding: 10px 14px; background: rgba(212, 191, 138, 0.12); border: 1px solid rgba(212, 191, 138, 0.35); border-left: 3.5px solid #D4BF8A; border-radius: 10px; font-size: 12px; color: #000000;">
                      <strong style="color: #000000;"><i class="fa-solid fa-note-sticky" style="color: #000000; margin-right: 4px;"></i> Notes:</strong> ${p.notes || cust.notes}
                    </div>
                  ` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    document.getElementById('viewCustomerEditBtn').onclick = () => {
      window.RaigonModal.close('viewCustomerModal');
      this.editCustomer(id);
    };

    const waBtn = document.getElementById('viewCustomerWhatsAppBtn');
    if (waBtn) {
      waBtn.onclick = () => {
        this.sendWhatsAppReceipt(id);
      };
    }

    window.RaigonModal.open('viewCustomerModal');
  }

  // --- Photo Upload Dropzone Helpers ---
  bindFormEvents() {
    const dropzone = document.getElementById('photoDropzone');
    const fileInput = document.getElementById('photoFileInput');

    if (dropzone && fileInput) {
      dropzone.onclick = () => fileInput.click();

      dropzone.ondragover = (e) => {
        e.preventDefault();
        dropzone.classList.add('drag-over');
      };

      dropzone.ondragleave = () => dropzone.classList.remove('drag-over');

      dropzone.ondrop = (e) => {
        e.preventDefault();
        dropzone.classList.remove('drag-over');
        if (e.dataTransfer.files.length) {
          this.handleFileSelect(e.dataTransfer.files);
        }
      };

      fileInput.onchange = (e) => {
        if (e.target.files.length) {
          this.handleFileSelect(e.target.files);
        }
      };
    }

    // Auto calculate balance amount
    const totalInput = document.getElementById('formTotalAmount');
    const advanceInput = document.getElementById('formAdvancePaid');
    const balanceInput = document.getElementById('formBalanceAmount');

    const updateBalance = () => {
      const tot = Number(totalInput.value) || 0;
      const adv = Number(advanceInput.value) || 0;
      const bal = Math.max(0, tot - adv);
      balanceInput.value = bal;
    };

    if (totalInput && advanceInput) {
      totalInput.oninput = updateBalance;
      advanceInput.oninput = updateBalance;
    }
  }

  handleFileSelect(files) {
    if (!files || !files.length) return;
    const fileArray = Array.from(files);
    let loadedCount = 0;

    fileArray.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.stagedPhotos.push({
          id: `P-${Date.now()}-${index}-${Math.floor(Math.random() * 1000)}`,
          name: file.name,
          url: e.target.result,
          size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
          frameSize: '12 × 18 inch',
          unit: 'inch',
          customWidth: '',
          customHeight: '',
          frameType: 'Wooden Frame',
          material: 'Teak Wood Moulding',
          color: 'Walnut Brown',
          orientation: 'Landscape',
          quantity: 1,
          notes: ''
        });
        loadedCount++;
        if (loadedCount === fileArray.length) {
          this.renderFrameConfigView();
        }
      };
      reader.readAsDataURL(file);
    });
  }

  renderStagedPhotos() {
    const grid = document.getElementById('photoPreviewGrid');
    const countBadge = document.getElementById('photoCountBadge');
    if (!grid) return;

    if (countBadge) countBadge.textContent = `${this.stagedPhotos.length} photos selected`;

    grid.innerHTML = this.stagedPhotos.map((p, idx) => `
      <div class="preview-item">
        <img src="${p.url}" alt="${p.name}">
        <button type="button" class="preview-remove-btn" onclick="window.RaigonCustomersView.removeStagedPhoto(${idx})">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
    `).join('');
  }

  removeStagedPhoto(index) {
    this.stagedPhotos.splice(index, 1);
    this.renderFrameConfigView();
  }

  saveCustomerForm(e) {
    if (e) e.preventDefault();

    const name = document.getElementById('formCustName').value.trim();
    const phone = document.getElementById('formCustPhone').value.trim();

    if (!name || !phone) {
      window.RaigonToast.show('Customer Name and Phone Number are required.', 'error');
      return;
    }

    let frameSize = document.getElementById('formFrameSize').value;
    let unit = document.getElementById('formUnit') ? document.getElementById('formUnit').value : 'inch';
    let customWidth = document.getElementById('formCustomWidth').value;
    let customHeight = document.getElementById('formCustomHeight').value;
    let frameType = document.getElementById('formFrameType').value;
    let material = document.getElementById('formFrameMaterial').value;
    let color = document.getElementById('formFrameColor').value;
    let orientation = document.getElementById('formOrientation').value;
    let quantity = Number(document.getElementById('formQuantity').value) || 1;
    let notes = document.getElementById('formNotes').value.trim();

    if (this.frameConfigMode === 'individual' && this.stagedPhotos.length > 0) {
      const first = this.stagedPhotos[0];
      frameSize = this.stagedPhotos.length > 1 ? `Multiple (${this.stagedPhotos.length} Items)` : (first.frameSize || '12 × 18 inch');
      frameType = first.frameType || 'Wooden Frame';
      material = first.material || 'Teak Wood Moulding';
      color = first.color || 'Walnut Brown';
      orientation = first.orientation || 'Landscape';
      quantity = this.stagedPhotos.reduce((acc, p) => acc + (Number(p.quantity) || 1), 0);
      notes = this.stagedPhotos.map((p, i) => `Photo #${i + 1} (${p.frameSize || '12×18'}): ${p.notes || 'No extra notes'}`).join(' | ');
    }

    const customerData = {
      id: document.getElementById('formCustId').value || null,
      name,
      phone,
      altPhone: document.getElementById('formCustAltPhone').value.trim(),
      address: document.getElementById('formCustAddress').value.trim(),
      city: document.getElementById('formCustCity').value.trim(),
      pincode: document.getElementById('formCustPincode').value.trim(),
      frameConfigMode: this.frameConfigMode,
      frameSize,
      unit,
      customWidth,
      customHeight,
      frameType,
      material,
      color,
      orientation,
      quantity,
      notes,
      orderDate: document.getElementById('formOrderDate').value || new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      deliveryDate: document.getElementById('formDeliveryDate').value || '',
      totalAmount: Number(document.getElementById('formTotalAmount').value) || 0,
      advancePaid: Number(document.getElementById('formAdvancePaid').value) || 0,
      balanceAmount: Number(document.getElementById('formBalanceAmount').value) || 0,
      paymentStatus: document.getElementById('formPaymentStatus').value,
      orderStatus: document.getElementById('formOrderStatus').value,
      photos: this.stagedPhotos
    };

    const saved = window.RaigonStorage.saveCustomer(customerData);
    window.RaigonToast.show(`Customer ${saved.id} saved successfully! Opening WhatsApp Receipt...`, 'success');
    window.RaigonModal.close('customerModal');

    // Automatically prompt / send WhatsApp Receipt with Order ID, Price, Delivery Date, etc.
    setTimeout(() => {
      this.sendWhatsAppReceipt(saved.id);
    }, 400);

    this.render();
    window.RaigonDashboardView.render();
  }

  sendWhatsAppReceipt(customerId) {
    const cust = window.RaigonStorage.getCustomerById(customerId);
    if (!cust) return;

    const phoneClean = (cust.phone || '').replace(/[^0-9]/g, '');
    const formatPhone = phoneClean.length === 10 ? `91${phoneClean}` : phoneClean;
    const balance = cust.balanceAmount !== undefined ? cust.balanceAmount : (cust.totalAmount - (cust.advancePaid || 0));

    const messageText = `🎨 *RAIGON ARTS WORKSHOP* - Order Confirmation
----------------------------------------
Dear *${cust.name}*,
Thank you for your framing order with Raigon Arts! Here are your complete order details:

🆔 *Order ID:* ${cust.id}
📅 *Order Date:* ${cust.orderDate || 'Today'}
🚚 *Expected Delivery Date:* ${cust.deliveryDate || 'TBD'}

🖼️ *Frame Details:* ${cust.frameSize || 'Custom'} (${cust.frameType || 'Wooden'} - ${cust.material || 'Teak Wood'})
🎨 *Color Finish:* ${cust.color || 'Standard'} | *Orientation:* ${cust.orientation || 'Standard'}
🔢 *Quantity:* ${cust.quantity || 1}

💰 *TOTAL AMOUNT:* ₹${Number(cust.totalAmount || 0).toLocaleString('en-IN')}
✅ *Advance Paid:* ₹${Number(cust.advancePaid || 0).toLocaleString('en-IN')}
⚠️ *BALANCE DUE:* ₹${Number(balance || 0).toLocaleString('en-IN')}
📌 *Payment Status:* ${cust.paymentStatus || 'Unpaid'}
📌 *Order Status:* ${cust.orderStatus || 'Pending'}
----------------------------------------
📍 *Workshop Address:* Main Workshop, MG Road, Trivandrum
📞 *Contact:* +91 7902261255

Thank you for choosing Raigon Arts! 🙏`;

    const encodedMsg = encodeURIComponent(messageText);
    window.open(`https://wa.me/${formatPhone}?text=${encodedMsg}`, '_blank');
  }

  exportCSV() {
    const customers = window.RaigonStorage.getCustomers();
    if (customers.length === 0) {
      window.RaigonToast.show('No data available to export.', 'warning');
      return;
    }

    const headers = ['Customer ID', 'Name', 'Phone', 'City', 'Frame Size', 'Frame Type', 'Qty', 'Total Amount', 'Advance Paid', 'Balance', 'Order Status', 'Order Date'];
    const rows = customers.map(c => [
      c.id,
      `"${c.name}"`,
      c.phone,
      `"${c.city || ''}"`,
      `"${c.frameSize}"`,
      `"${c.frameType}"`,
      c.quantity,
      c.totalAmount,
      c.advancePaid,
      c.balanceAmount,
      c.orderStatus,
      c.orderDate
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Raigon_Arts_Customers_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.RaigonToast.show('Customer data exported to CSV successfully.', 'success');
  }
}

window.RaigonCustomersView = new CustomersView();
