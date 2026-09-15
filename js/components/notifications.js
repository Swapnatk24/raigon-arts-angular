/* ==========================================================================
   Raigon Arts Management System - Notifications Dropdown & Popover Component
   Displays real-time notifications for Works Completed & Payment Pending
   ========================================================================== */

class VuexyNotifications {
  constructor() {
    this.dropdown = null;
    this.activeFilter = 'all';
    this.init();
  }

  init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }

  setup() {
    this.createDropdown();

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.notification-btn') && !e.target.closest('#notificationDropdown')) {
        this.close();
      }
    });

    window.addEventListener('resize', () => {
      if (this.dropdown && this.dropdown.style.display === 'block') {
        this.position();
      }
    });

    // Periodically update badge & contents
    this.updateBadge();
    setInterval(() => this.updateBadge(), 3000);
  }

  createDropdown() {
    if (document.getElementById('notificationDropdown')) return;

    const dropdown = document.createElement('div');
    dropdown.id = 'notificationDropdown';
    dropdown.className = 'notification-dropdown-popover';
    dropdown.style.display = 'none';

    document.body.appendChild(dropdown);
    this.dropdown = dropdown;
  }

  toggle(e) {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (!this.dropdown) this.createDropdown();

    const isOpen = this.dropdown.style.display === 'block';
    if (isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    this.render();
    this.position();
    this.dropdown.style.display = 'block';
    this.dropdown.classList.add('active');
  }

  close() {
    if (this.dropdown) {
      this.dropdown.style.display = 'none';
      this.dropdown.classList.remove('active');
    }
  }

  position() {
    const btn = document.querySelector('.notification-btn');
    if (!btn || !this.dropdown) return;
    const rect = btn.getBoundingClientRect();

    this.dropdown.style.position = 'fixed';
    this.dropdown.style.top = `${rect.bottom + 8}px`;

    const rightMargin = window.innerWidth - rect.right;
    this.dropdown.style.right = `${Math.max(16, rightMargin - 10)}px`;
    this.dropdown.style.zIndex = '999999';
  }

  getNotificationsData() {
    const customers = window.RaigonStorage ? window.RaigonStorage.getCustomers() : [];

    // 1. Works Completed / Ready for Pickup or Delivery
    const completedOrders = customers.filter(c => c.orderStatus === 'Completed' || c.orderStatus === 'Ready');

    // 2. Payment Pending / Dues
    const pendingPayments = customers.filter(c => c.paymentStatus === 'Unpaid' || c.paymentStatus === 'Partial' || (c.balanceAmount && c.balanceAmount > 0));

    return { completedOrders, pendingPayments };
  }

  updateBadge() {
    const { completedOrders, pendingPayments } = this.getNotificationsData();
    const totalCount = completedOrders.length + pendingPayments.length;

    const badge = document.querySelector('.notification-indicator');
    if (badge) {
      if (totalCount > 0) {
        badge.textContent = totalCount;
        badge.style.display = 'flex';
      } else {
        badge.style.display = 'none';
      }
    }
  }

  setFilter(filter) {
    this.activeFilter = filter;
    this.render();
  }

  render() {
    if (!this.dropdown) return;

    const { completedOrders, pendingPayments } = this.getNotificationsData();
    const totalCount = completedOrders.length + pendingPayments.length;

    let items = [];

    completedOrders.forEach(c => {
      items.push({
        type: 'completed',
        id: c.id,
        title: `Work Completed: #${c.id} 🖼️`,
        desc: `Framing job for ${c.name} (${c.frameSize || '12×18 inch'}) is completed & ready!`,
        meta: `Status: Completed • Phone: ${c.phone}`,
        time: 'Ready',
        customer: c
      });
    });

    pendingPayments.forEach(c => {
      const balance = c.balanceAmount || (c.totalAmount - (c.advancePaid || 0));
      items.push({
        type: 'pending_payment',
        id: c.id,
        title: `Payment Pending: ₹${balance.toLocaleString('en-IN')} ⚠️`,
        desc: `${c.name} has ₹${balance.toLocaleString('en-IN')} unpaid balance due.`,
        meta: `Payment Status: ${c.paymentStatus || 'Unpaid'} • ${c.phone}`,
        time: 'Pending Dues',
        customer: c
      });
    });

    if (this.activeFilter === 'completed') {
      items = items.filter(i => i.type === 'completed');
    } else if (this.activeFilter === 'pending') {
      items = items.filter(i => i.type === 'pending_payment');
    }

    this.dropdown.innerHTML = `
      <div class="notif-header">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <h4 style="margin: 0; font-size: 15px; font-weight: 700; color: var(--text-primary);">Action Notifications 🔔</h4>
            <span class="badge" style="background: rgba(212,191,138,0.18); color: #B38F38; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 10px;">${totalCount} Active</span>
          </div>
          <button type="button" class="notif-clear-btn" onclick="window.RaigonNotifications.close()" title="Close Notifications">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div class="notif-tabs" style="display: flex; gap: 6px; margin-top: 12px;">
          <button type="button" class="notif-tab-btn ${this.activeFilter === 'all' ? 'active' : ''}" onclick="window.RaigonNotifications.setFilter('all')">
            All (${totalCount})
          </button>
          <button type="button" class="notif-tab-btn ${this.activeFilter === 'completed' ? 'active' : ''}" onclick="window.RaigonNotifications.setFilter('completed')">
            <i class="fa-solid fa-circle-check text-success"></i> Completed (${completedOrders.length})
          </button>
          <button type="button" class="notif-tab-btn ${this.activeFilter === 'pending' ? 'active' : ''}" onclick="window.RaigonNotifications.setFilter('pending')">
            <i class="fa-solid fa-triangle-exclamation text-danger"></i> Dues (${pendingPayments.length})
          </button>
        </div>
      </div>

      <div class="notif-body">
        ${items.length === 0 ? `
          <div style="text-align: center; padding: 32px 16px; color: var(--text-muted);">
            <i class="fa-solid fa-bell-slash" style="font-size: 32px; margin-bottom: 10px; opacity: 0.4;"></i>
            <p style="margin: 0; font-size: 13.5px; font-weight: 600; color: var(--text-secondary);">No action items in this filter</p>
            <p style="margin: 4px 0 0 0; font-size: 11.5px; color: var(--text-muted);">All framing jobs and payments are up to date!</p>
          </div>
        ` : items.map(item => `
          <div class="notif-item ${item.type}">
            <div class="notif-icon-box ${item.type === 'completed' ? 'icon-success' : 'icon-danger'}">
              <i class="${item.type === 'completed' ? 'fa-solid fa-circle-check' : 'fa-solid fa-hand-holding-dollar'}"></i>
            </div>
            <div class="notif-content">
              <div class="notif-title-row">
                <span class="notif-item-title">${item.title}</span>
                <span class="notif-time">${item.time}</span>
              </div>
              <p class="notif-desc">${item.desc}</p>
              <div class="notif-meta">${item.meta}</div>
              <div class="notif-actions">
                <button type="button" class="btn btn-sm btn-primary" style="padding: 4px 10px; font-size: 11.5px;" onclick="window.RaigonNotifications.openOrder('${item.id}')">
                  <i class="fa-solid fa-eye"></i> View Details
                </button>
                <button type="button" class="btn btn-sm btn-secondary" style="padding: 4px 10px; font-size: 11.5px;" onclick="window.RaigonNotifications.sendWhatsAppAlert('${item.id}')">
                  <i class="fa-brands fa-whatsapp" style="color: #25D366;"></i> WhatsApp
                </button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>

      <div class="notif-footer">
        <button type="button" class="btn btn-secondary btn-sm" style="width: 100%; font-size: 12.5px; font-weight: 600;" onclick="window.RaigonApp.navigateTo('orders'); window.RaigonNotifications.close();">
          View All Workshop Orders <i class="fa-solid fa-arrow-right"></i>
        </button>
      </div>
    `;
  }

  openOrder(id) {
    this.close();
    if (window.RaigonCustomersView) {
      window.RaigonCustomersView.viewCustomer(id);
    }
  }

  sendWhatsAppAlert(id) {
    const cust = window.RaigonStorage ? window.RaigonStorage.getCustomerById(id) : null;
    if (!cust) return;
    const phoneClean = (cust.phone || '').replace(/[^0-9]/g, '');
    const formatPhone = phoneClean.length === 10 ? `91${phoneClean}` : phoneClean;
    const balance = cust.balanceAmount || (cust.totalAmount - (cust.advancePaid || 0));
    let msgText = `Hello ${cust.name},\nThis is Raigon Arts Workshop regarding your order #${cust.id}.\n`;
    if (cust.orderStatus === 'Completed') {
      msgText += `🎉 Good news! Your framing job is completed and ready for pickup.\nBalance Due: ₹${balance.toLocaleString('en-IN')}\nThank you!`;
    } else {
      msgText += `⚠️ Order Status: ${cust.orderStatus}\nPending Balance Due: ₹${balance.toLocaleString('en-IN')}\nPlease complete the payment at your earliest convenience.\nThank you!`;
    }
    const msg = encodeURIComponent(msgText);
    window.open(`https://wa.me/${formatPhone}?text=${msg}`, '_blank');
  }
}

window.RaigonNotifications = new VuexyNotifications();
