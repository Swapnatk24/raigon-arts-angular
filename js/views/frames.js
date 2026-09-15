/* ==========================================================================
   Raigon Arts Management System - Frame Size Management View
   ========================================================================== */

class FramesView {
  constructor() {
    this.container = document.getElementById('framesView');
    this.searchQuery = '';
  }

  render() {
    const frameSizes = window.RaigonStorage.getFrameSizes();
    const filtered = frameSizes.filter(s => {
      return !this.searchQuery || 
        s.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        s.category.toLowerCase().includes(this.searchQuery.toLowerCase());
    });

    this.container.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">Frame Size Management</h1>
          <p class="page-subtitle">Catalog of wholesale frame dimensions, moulding sizes, and custom cut specs</p>
        </div>
        <button class="btn btn-primary" onclick="window.RaigonFramesView.openFrameModal()">
          <i class="fa-solid fa-plus"></i> Add Frame Size
        </button>
      </div>

      <div class="table-card">
        <div class="table-toolbar">
          <div class="toolbar-left">
            <div class="table-search">
              <i class="fa-solid fa-magnifying-glass"></i>
              <input type="text" placeholder="Search size name, category..." value="${this.searchQuery}" oninput="window.RaigonFramesView.handleSearch(this.value)">
            </div>
          </div>
          <div class="toolbar-right">
            <span class="text-sm text-muted">Total Sizes: <strong>${frameSizes.length}</strong></span>
          </div>
        </div>

        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Size Code</th>
                <th>Size Name</th>
                <th>Width</th>
                <th>Height</th>
                <th>Unit</th>
                <th>Category</th>
                <th>Orders Count</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${filtered.length === 0 ? `
                <tr>
                  <td colspan="9" style="text-align: center; padding: 40px; color: var(--text-muted);">
                    No frame sizes match your search query.
                  </td>
                </tr>
              ` : filtered.map(s => `
                <tr>
                  <td class="font-bold text-primary">${s.id}</td>
                  <td class="font-bold">${s.name}</td>
                  <td>${s.width}</td>
                  <td>${s.height}</td>
                  <td><span class="badge text-xs" style="background: var(--bg-surface-subtle);">${s.unit}</span></td>
                  <td>${s.category}</td>
                  <td class="font-semibold">${s.usageCount || 0} orders</td>
                  <td><span class="badge badge-completed">${s.status || 'Active'}</span></td>
                  <td>
                    <div class="table-actions">
                      <button class="action-btn edit" title="Edit Frame Size" onclick="window.RaigonFramesView.openFrameModal('${s.id}')">
                        <i class="fa-solid fa-pen-to-square"></i>
                      </button>
                      <button class="action-btn delete" title="Delete Size" onclick="window.RaigonFramesView.confirmDelete('${s.id}', '${s.name}')">
                        <i class="fa-solid fa-trash"></i>
                      </button>
                    </div>
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

  openFrameModal(id = null) {
    const modal = document.getElementById('frameSizeModal');
    const form = document.getElementById('frameSizeForm');
    form.reset();

    if (id) {
      document.getElementById('frameSizeModalTitle').textContent = `Edit Frame Size (${id})`;
      const sizes = window.RaigonStorage.getFrameSizes();
      const target = sizes.find(s => s.id === id);
      if (target) {
        document.getElementById('formSizeId').value = target.id;
        document.getElementById('formSizeName').value = target.name;
        document.getElementById('formSizeWidth').value = target.width;
        document.getElementById('formSizeHeight').value = target.height;
        document.getElementById('formSizeUnit').value = target.unit || 'inch';
        document.getElementById('formSizeCategory').value = target.category || 'Standard Photo';
      }
    } else {
      document.getElementById('frameSizeModalTitle').textContent = 'Add New Frame Size';
      document.getElementById('formSizeId').value = '';
    }

    window.RaigonModal.open('frameSizeModal');
  }

  handleSizeNameInput(val) {
    if (!val) return;
    const match = val.match(/(\d+(?:\.\d+)?)\s*[xX×*]\s*(\d+(?:\.\d+)?)/);
    if (match) {
      const widthInput = document.getElementById('formSizeWidth');
      const heightInput = document.getElementById('formSizeHeight');
      if (widthInput) widthInput.value = match[1];
      if (heightInput) heightInput.value = match[2];
    }
  }

  saveFrameSize(e) {
    if (e) e.preventDefault();

    const name = document.getElementById('formSizeName').value.trim();
    const width = Number(document.getElementById('formSizeWidth').value);
    const height = Number(document.getElementById('formSizeHeight').value);

    if (!name || !width || !height) {
      window.RaigonToast.show('Size Name, Width, and Height are required.', 'error');
      return;
    }

    const sizeData = {
      id: document.getElementById('formSizeId').value || null,
      name,
      width,
      height,
      unit: document.getElementById('formSizeUnit').value,
      category: document.getElementById('formSizeCategory').value,
      status: 'Active'
    };

    window.RaigonStorage.saveFrameSize(sizeData);
    window.RaigonToast.show(`Frame size "${name}" saved!`, 'success');
    window.RaigonModal.close('frameSizeModal');
    this.render();
  }

  confirmDelete(id, name) {
    window.RaigonModal.confirm({
      title: 'Delete Frame Size',
      message: `Are you sure you want to delete size "${name}" (${id})?`,
      confirmText: 'Delete Size',
      confirmClass: 'btn-danger',
      onConfirm: () => {
        window.RaigonStorage.deleteFrameSize(id);
        window.RaigonToast.show(`Frame size ${id} deleted.`, 'warning');
        this.render();
      }
    });
  }
}

window.RaigonFramesView = new FramesView();
