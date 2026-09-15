/* ==========================================================================
   Raigon Arts Management System - Photo Collection Management View
   ========================================================================== */

class PhotosView {
  constructor() {
    this.container = document.getElementById('photosView');
    this.searchQuery = '';
    this.statusFilter = 'All';
    this.viewMode = 'grid'; // 'grid' | 'list'
    this.selectedPhotoIds = new Set();
  }

  render() {
    const allPhotos = window.RaigonStorage.getAllPhotos();
    const filtered = allPhotos.filter(p => {
      const matchSearch = !this.searchQuery || 
        p.customerName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        p.customerId.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        p.name.toLowerCase().includes(this.searchQuery.toLowerCase());
      
      const matchStatus = this.statusFilter === 'All' || p.orderStatus === this.statusFilter;

      return matchSearch && matchStatus;
    });

    this.container.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">Photo Collection</h1>
          <p class="page-subtitle">Centralized digital vault for customer photo prints and framing specifications</p>
        </div>
        <div class="flex gap-3">
          ${this.selectedPhotoIds.size > 0 ? `
            <button class="btn btn-secondary btn-sm" onclick="window.RaigonPhotosView.downloadSelected()">
              <i class="fa-solid fa-download"></i> Download Selected (${this.selectedPhotoIds.size})
            </button>
            <button class="btn btn-danger btn-sm" onclick="window.RaigonPhotosView.deleteSelected()">
              <i class="fa-solid fa-trash"></i> Delete Selected (${this.selectedPhotoIds.size})
            </button>
          ` : ''}
          <div class="flex gap-1" style="background: var(--bg-surface); padding: 4px; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
            <button class="btn-icon ${this.viewMode === 'grid' ? 'btn-primary' : ''}" title="Grid View" onclick="window.RaigonPhotosView.setViewMode('grid')">
              <i class="fa-solid fa-border-all"></i>
            </button>
            <button class="btn-icon ${this.viewMode === 'list' ? 'btn-primary' : ''}" title="List View" onclick="window.RaigonPhotosView.setViewMode('list')">
              <i class="fa-solid fa-list"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Toolbar -->
      <div class="table-card" style="margin-bottom: 24px;">
        <div class="table-toolbar">
          <div class="toolbar-left">
            <div class="table-search">
              <i class="fa-solid fa-magnifying-glass"></i>
              <input type="text" placeholder="Search by customer name, photo..." value="${this.searchQuery}" oninput="window.RaigonPhotosView.handleSearch(this.value)">
            </div>
          </div>
          <div class="toolbar-right">
            <span class="text-sm text-muted">Showing <strong>${filtered.length}</strong> photos</span>
          </div>
        </div>
      </div>

      <!-- Photo Display Area -->
      ${filtered.length === 0 ? `
        <div class="table-card" style="padding: 60px; text-align: center; color: var(--text-muted);">
          <i class="fa-solid fa-image" style="font-size: 40px; margin-bottom: 12px; display: block;"></i>
          <p class="font-semibold text-lg">No photos found</p>
          <p class="text-sm">Try adjusting your search query or filter settings.</p>
        </div>
      ` : (this.viewMode === 'grid' ? this.renderGridView(filtered) : this.renderListView(filtered))}
    `;
    if (window.RaigonSelect2) {
      window.RaigonSelect2.enhanceAll(this.container);
    }
  }

  renderGridView(photos) {
    return `
      <div class="photo-gallery-grid">
        ${photos.map(p => `
          <div class="photo-card">
            <input type="checkbox" class="photo-select-checkbox" ${this.selectedPhotoIds.has(p.id) ? 'checked' : ''} onchange="window.RaigonPhotosView.toggleSelect('${p.id}')">
            <div class="photo-card-img-wrap" onclick="window.RaigonModal.openLightbox('${p.url}', '${p.name} - ${p.customerName}')">
              <img src="${p.url}" alt="${p.name}">
            </div>
            <div class="photo-card-body">
              <div class="photo-card-title">${p.name}</div>
              <div class="photo-card-meta">
                <span class="font-bold text-primary">${p.customerName} (${p.customerId})</span>
              </div>
              <div class="photo-card-meta">
                <span class="font-bold">Size: ${p.frameSize || '12 × 18 inch'}</span>
                <span class="badge ${p.orderStatus === 'Completed' ? 'badge-completed' : 'badge-pending'}">${p.orderStatus}</span>
              </div>
              ${(p.frameType || p.material) ? `
                <div class="photo-card-meta text-xs text-muted" style="margin-top: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                  <i class="fa-solid fa-box text-primary"></i> ${p.frameType || ''} ${p.material ? '• ' + p.material : ''}
                </div>
              ` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  renderListView(photos) {
    return `
      <div class="table-card">
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th style="width: 40px;">Select</th>
                <th>Preview</th>
                <th>File Name</th>
                <th>Customer</th>
                <th>Order ID</th>
                <th>Frame Size</th>
                <th>Frame Type & Material</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${photos.map(p => `
                <tr>
                  <td>
                    <input type="checkbox" ${this.selectedPhotoIds.has(p.id) ? 'checked' : ''} onchange="window.RaigonPhotosView.toggleSelect('${p.id}')">
                  </td>
                  <td>
                    <img src="${p.url}" style="width: 44px; height: 44px; object-fit: cover; border-radius: var(--radius-xs); cursor: pointer;" onclick="window.RaigonModal.openLightbox('${p.url}', '${p.name}')">
                  </td>
                  <td class="font-semibold">${p.name}</td>
                  <td>${p.customerName}</td>
                  <td class="font-bold text-primary">${p.customerId}</td>
                  <td class="font-bold">${p.frameSize || '12 × 18 inch'}</td>
                  <td>${p.frameType || 'Wooden'} ${p.material ? '• ' + p.material : ''}</td>
                  <td><span class="badge badge-completed">${p.orderStatus}</span></td>
                  <td>
                    <button class="action-btn" title="View Fullscreen" onclick="window.RaigonModal.openLightbox('${p.url}', '${p.name}')">
                      <i class="fa-solid fa-expand"></i>
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  handleSearch(val) {
    this.searchQuery = val;
    this.render();
  }

  handleStatusFilter(val) {
    this.statusFilter = val;
    this.render();
  }

  setViewMode(mode) {
    this.viewMode = mode;
    this.render();
  }

  toggleSelect(id) {
    if (this.selectedPhotoIds.has(id)) {
      this.selectedPhotoIds.delete(id);
    } else {
      this.selectedPhotoIds.add(id);
    }
    this.render();
  }

  downloadSelected() {
    window.RaigonToast.show(`Downloading ${this.selectedPhotoIds.size} selected high-res photos...`, 'success');
  }

  deleteSelected() {
    window.RaigonToast.show(`${this.selectedPhotoIds.size} photos removed from collection selection.`, 'warning');
    this.selectedPhotoIds.clear();
    this.render();
  }
}

window.RaigonPhotosView = new PhotosView();
