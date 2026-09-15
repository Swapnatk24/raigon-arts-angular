/* ==========================================================================
   Raigon Arts Management System - Vuexy Custom Select2 Component
   Replaces native browser <select> elements with authentic Vuexy Floating UI
   Uses Body Portal positioning to prevent modal clipping or overflow issues
   ========================================================================== */

class VuexySelect2 {
  constructor() {
    this.instances = new Map();
    this.activeDropdownInfo = null;
    this.init();
  }

  init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.enhanceAll());
    } else {
      this.enhanceAll();
    }

    // MutationObserver to automatically enhance dynamically added unenhanced select elements
    this.observer = new MutationObserver((mutations) => {
      let hasUnenhanced = false;
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === 1) {
            if (node.matches && node.matches('select.form-select, select.form-select-sm, select.form-select-lg, select[data-select2]')) {
              if (node.dataset.vuexySelect2Init !== 'true') {
                hasUnenhanced = true;
                break;
              }
            }
            if (node.querySelector && node.querySelector('select.form-select:not([data-vuexy-select2-init="true"]), select.form-select-sm:not([data-vuexy-select2-init="true"]), select.form-select-lg:not([data-vuexy-select2-init="true"]), select[data-select2]:not([data-vuexy-select2-init="true"])')) {
              hasUnenhanced = true;
              break;
            }
          }
        }
        if (hasUnenhanced) break;
      }

      if (hasUnenhanced) {
        this.enhanceAll();
      }
    });

    this.observer.observe(document.body, { childList: true, subtree: true });

    // Close open dropdowns when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.vuexy-select2-container') && !e.target.closest('.vuexy-select2-dropdown')) {
        this.closeAll();
      }
    });

    // Reposition on scroll or resize
    const updateActivePos = () => {
      if (this.activeDropdownInfo) {
        this.positionDropdown(
          this.activeDropdownInfo.trigger,
          this.activeDropdownInfo.dropdown,
          this.activeDropdownInfo.container
        );
      }
    };

    window.addEventListener('scroll', updateActivePos, true);
    window.addEventListener('resize', updateActivePos);

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeAll();
      }
    });
  }

  enhanceAll(root = document) {
    const target = root || document;
    const selects = target.querySelectorAll('select.form-select:not([data-vuexy-select2-init="true"]), select.form-select-sm:not([data-vuexy-select2-init="true"]), select.form-select-lg:not([data-vuexy-select2-init="true"]), select.status-select-badge:not([data-vuexy-select2-init="true"]), select[data-select2]:not([data-vuexy-select2-init="true"])');
    selects.forEach(select => this.enhance(select));
  }

  enhance(select) {
    if (!select) return;

    // Check if container already exists next to it
    const existingContainer = select.nextElementSibling;
    if (existingContainer && existingContainer.classList.contains('vuexy-select2-container')) {
      return;
    }

    if (select.dataset.vuexySelect2Init === 'true') {
      return;
    }

    select.dataset.vuexySelect2Init = 'true';
    select.style.display = 'none';

    // Determine size class & status badge state
    let sizeClass = 'md';
    if (select.classList.contains('form-select-sm') || select.classList.contains('sm')) sizeClass = 'sm';
    if (select.classList.contains('form-select-lg') || select.classList.contains('lg')) sizeClass = 'lg';

    const isStatusBadge = select.classList.contains('status-select-badge');

    // Create Vuexy Select2 Container
    const container = document.createElement('div');
    container.className = `vuexy-select2-container size-${sizeClass}`;
    if (isStatusBadge) container.classList.add('status-select-badge-wrap');
    if (select.style.width) container.style.width = select.style.width;

    // Trigger Button
    const trigger = document.createElement('div');
    trigger.className = 'vuexy-select2-trigger';
    if (isStatusBadge) {
      trigger.className = `vuexy-select2-trigger status-select-badge status-badge-${select.value.toLowerCase()}`;
    }

    const labelSpan = document.createElement('span');
    labelSpan.className = 'vuexy-select2-label';

    const arrowSpan = document.createElement('span');
    arrowSpan.className = 'vuexy-select2-arrow';
    arrowSpan.innerHTML = `<i class="fa-solid fa-chevron-down"></i>`;

    trigger.appendChild(labelSpan);
    trigger.appendChild(arrowSpan);

    // Dropdown Popover Menu (Body Portal Element)
    const dropdown = document.createElement('div');
    dropdown.className = 'vuexy-select2-dropdown vuexy-portal-dropdown';

    const optionsList = document.createElement('div');
    optionsList.className = 'vuexy-select2-options';

    dropdown.appendChild(optionsList);
    container.appendChild(trigger);

    // Insert into DOM right after native select
    if (select.parentNode) {
      select.parentNode.insertBefore(container, select.nextSibling);
    }

    // Render Options Function
    const renderOptions = () => {
      optionsList.innerHTML = '';
      const options = Array.from(select.options);

      const selectedOpt = select.options[select.selectedIndex] || options[0];
      labelSpan.textContent = selectedOpt ? selectedOpt.text : 'Select option';

      if (isStatusBadge && selectedOpt) {
        const valLower = selectedOpt.value.toLowerCase().replace(/\s+/g, '-');
        trigger.className = `vuexy-select2-trigger status-select-badge status-badge-${valLower}`;
      }

      options.forEach(opt => {
        const item = document.createElement('div');
        item.className = 'vuexy-select2-option';
        if (isStatusBadge) {
          item.classList.add(`status-option-${opt.value.toLowerCase().replace(/\s+/g, '-')}`);
        }
        if (opt.selected) {
          item.classList.add('selected');
        }
        if (opt.disabled) {
          item.classList.add('disabled');
        }

        item.textContent = opt.text;

        item.addEventListener('click', (e) => {
          e.stopPropagation();
          if (opt.disabled) return;

          select.value = opt.value;

          // Trigger native change events so existing onchange="..." handlers fire
          select.dispatchEvent(new Event('change', { bubbles: true }));

          renderOptions();
          this.closeAll();
        });

        optionsList.appendChild(item);
      });
    };

    // Toggle Dropdown
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = container.classList.contains('open');
      this.closeAll();
      if (!isOpen) {
        this.openDropdown(container, trigger, dropdown);
      }
    });

    // Initial Options Render
    renderOptions();

    // Listen to value changes on native select
    select.addEventListener('change', () => {
      const selectedOpt = select.options[select.selectedIndex];
      if (selectedOpt) labelSpan.textContent = selectedOpt.text;
      renderOptions();
    });

    this.instances.set(select, { container, dropdown, renderOptions });
  }

  openDropdown(container, trigger, dropdown) {
    if (dropdown.parentNode !== document.body) {
      document.body.appendChild(dropdown);
    }

    container.classList.add('open');
    dropdown.style.display = 'block';
    dropdown.style.visibility = 'hidden';
    dropdown.style.opacity = '0';

    this.activeDropdownInfo = { container, trigger, dropdown };
    this.positionDropdown(trigger, dropdown, container);

    dropdown.style.visibility = 'visible';
    dropdown.style.opacity = '1';
    dropdown.classList.add('open');
  }

  positionDropdown(trigger, dropdown, container) {
    if (!trigger || !dropdown) return;
    const rect = trigger.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) return;

    dropdown.style.position = 'fixed';
    dropdown.style.width = `${rect.width}px`;
    dropdown.style.left = `${rect.left}px`;
    dropdown.style.zIndex = '99999999';

    const dropdownHeight = dropdown.offsetHeight || 180;
    const spaceBelow = window.innerHeight - rect.bottom;

    if (spaceBelow < dropdownHeight + 10 && rect.top > dropdownHeight + 10) {
      // Position Above
      dropdown.style.top = `${rect.top - dropdownHeight - 4}px`;
      dropdown.classList.add('open-above');
      if (container) container.classList.add('open-above');
    } else {
      // Position Below
      dropdown.style.top = `${rect.bottom + 4}px`;
      dropdown.classList.remove('open-above');
      if (container) container.classList.remove('open-above');
    }
  }

  closeAll() {
    this.activeDropdownInfo = null;
    document.querySelectorAll('.vuexy-select2-container.open').forEach(c => {
      c.classList.remove('open');
      c.classList.remove('open-above');
    });

    document.querySelectorAll('.vuexy-select2-dropdown.open, .vuexy-portal-dropdown').forEach(d => {
      d.classList.remove('open');
      d.classList.remove('open-above');
      d.style.display = 'none';
      d.style.opacity = '0';
      d.style.visibility = 'hidden';
    });
  }

  refresh(select) {
    if (this.instances.has(select)) {
      this.instances.get(select).renderOptions();
    }
  }
}

window.RaigonSelect2 = new VuexySelect2();
