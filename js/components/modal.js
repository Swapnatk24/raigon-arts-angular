/* ==========================================================================
   Raigon Arts Management System - Modal & Dialog Controller
   ========================================================================== */

class ModalManager {
  constructor() {
    this.activeModal = null;
  }

  open(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    this.activeModal = modal;
  }

  close(modalId) {
    const modal = modalId ? document.getElementById(modalId) : this.activeModal;
    if (!modal) return;

    modal.classList.remove('active');
    document.body.style.overflow = '';
    this.activeModal = null;
  }

  confirm({ title, message, confirmText = 'Delete', confirmClass = 'btn-danger', onConfirm }) {
    const modal = document.getElementById('confirmModal');
    if (!modal) return;

    document.getElementById('confirmModalTitle').textContent = title;
    document.getElementById('confirmModalMessage').textContent = message;

    const confirmBtn = document.getElementById('confirmModalBtn');
    confirmBtn.textContent = confirmText;
    confirmBtn.className = `btn ${confirmClass}`;

    // Remove existing event listeners
    const newBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newBtn, confirmBtn);

    newBtn.addEventListener('click', () => {
      if (typeof onConfirm === 'function') {
        onConfirm();
      }
      this.close('confirmModal');
    });

    this.open('confirmModal');
  }

  openLightbox(imgUrl, title = 'Photo Preview') {
    const modal = document.getElementById('lightboxModal');
    if (!modal) return;

    const img = document.getElementById('lightboxImage');
    const titleEl = document.getElementById('lightboxTitle');
    const downloadBtn = document.getElementById('lightboxDownloadBtn');

    if (img) img.src = imgUrl;
    if (titleEl) titleEl.textContent = title;

    if (downloadBtn) {
      downloadBtn.onclick = () => {
        const a = document.createElement('a');
        a.href = imgUrl;
        a.download = title.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.jpg';
        a.click();
      };
    }

    this.open('lightboxModal');
  }
}

window.RaigonModal = new ModalManager();
