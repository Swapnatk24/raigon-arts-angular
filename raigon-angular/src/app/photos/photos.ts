import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import {
  Customer,
  CustomerPhoto,
  CustomerService
} from '../services/customer.service';

import { ToastService } from '../services/toast.service';

interface PhotoItem {
  id: string;
  name: string;
  url: string;
  customerName: string;
  customerId: string;
  frameSize: string;
  orderStatus: string;
}

@Component({
  selector: 'app-photos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './photos.html'
})
export class Photos implements OnInit, OnDestroy {

  searchQuery = '';
  statusFilter = 'All';
  viewMode: 'grid' | 'list' = 'grid';

  selectedPhotoIds = new Set<string>();

  photos: PhotoItem[] = [];

  private subscription = new Subscription();

  constructor(
    private customerService: CustomerService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {

    this.subscription.add(
      this.customerService.customers$.subscribe(
        (customers: Customer[]) => {
          this.loadPhotos(customers);
        }
      )
    );

  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private loadPhotos(customers: Customer[]): void {

    const allPhotos: PhotoItem[] = [];

    customers.forEach(customer => {

      if (
        !customer.photos ||
        !Array.isArray(customer.photos)
      ) {
        return;
      }

      customer.photos.forEach(
        (photo: CustomerPhoto, index: number) => {

          allPhotos.push({
            id: `${customer.id}-${index}`,
            name: photo.name,
            url: photo.url,
            customerName: customer.name,
            customerId: customer.id,
            frameSize: customer.frameSize,
            orderStatus: customer.orderStatus
          });

        }
      );

    });

    this.photos = allPhotos;
  }

  get filteredPhotos(): PhotoItem[] {

    const search =
      this.searchQuery
        .toLowerCase()
        .trim();

    return this.photos.filter(photo => {

      const matchSearch =
        !search ||
        photo.customerName
          .toLowerCase()
          .includes(search) ||
        photo.customerId
          .toLowerCase()
          .includes(search) ||
        photo.name
          .toLowerCase()
          .includes(search);

      const matchStatus =
        this.statusFilter === 'All' ||
        photo.orderStatus === this.statusFilter;

      return matchSearch && matchStatus;
    });

  }

  setViewMode(
    mode: 'grid' | 'list'
  ): void {

    this.viewMode = mode;
  }

  toggleSelect(id: string): void {

    if (this.selectedPhotoIds.has(id)) {

      this.selectedPhotoIds.delete(id);

    } else {

      this.selectedPhotoIds.add(id);

    }

  }

  isSelected(id: string): boolean {

    return this.selectedPhotoIds.has(id);

  }

  downloadSelected(): void {
    if (this.selectedPhotoIds.size === 0) {
      return;
    }

    const selected = this.photos.filter(p => this.selectedPhotoIds.has(p.id));
    selected.forEach(photo => {
      if (photo.url) {
        const a = document.createElement('a');
        a.href = photo.url;
        a.download = (photo.name || 'photo').replace(/[^a-z0-9.-]/gi, '_');
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    });

    this.toastService.success(
      `Downloading ${this.selectedPhotoIds.size} selected photo(s)...`
    );
  }

  deleteSelected(): void {
    if (this.selectedPhotoIds.size === 0) {
      return;
    }

    const count = this.selectedPhotoIds.size;
    const selectedItems = this.photos.filter(p => this.selectedPhotoIds.has(p.id));

    // Group selected photos by customerId
    const customerMap = new Map<string, PhotoItem[]>();
    selectedItems.forEach(item => {
      const list = customerMap.get(item.customerId) || [];
      list.push(item);
      customerMap.set(item.customerId, list);
    });

    const allCustomers = this.customerService.getCustomers();
    customerMap.forEach((toDelete, custId) => {
      const cust = allCustomers.find(c => c.id === custId);
      if (!cust || !cust.photos) return;

      const deleteIds = new Set(toDelete.map(d => d.id));
      const deleteUrls = new Set(toDelete.map(d => d.url).filter(Boolean));
      const deleteNames = new Set(toDelete.map(d => d.name).filter(Boolean));

      const remainingPhotos = cust.photos.filter((p, idx) => {
        const pId = p.id || `${cust.id}-${idx}`;
        if (deleteIds.has(pId)) return false;
        if (p.url && deleteUrls.has(p.url) && deleteNames.has(p.name)) return false;
        return true;
      });

      this.customerService.updateCustomer({
        ...cust,
        photos: remainingPhotos
      });
    });

    this.selectedPhotoIds.clear();
    this.toastService.warning(
      `${count} photo${count > 1 ? 's' : ''} deleted from collection.`
    );
  }

  deletePhoto(photo: PhotoItem): void {
    const cust = this.customerService.getCustomer(photo.customerId);
    if (cust && cust.photos) {
      const remainingPhotos = cust.photos.filter((p, idx) => {
        const pId = p.id || `${cust.id}-${idx}`;
        return pId !== photo.id && p.url !== photo.url && p.name !== photo.name;
      });
      this.customerService.updateCustomer({
        ...cust,
        photos: remainingPhotos
      });
      this.selectedPhotoIds.delete(photo.id);
      this.toastService.warning(`Photo "${photo.name}" deleted.`);
    }
  }

  openPhoto(photo: PhotoItem): void {
    this.customerService.openLightbox(photo.url, `${photo.name} - ${photo.customerName}`);
  }

  trackByPhotoId(
    index: number,
    photo: PhotoItem
  ): string {

    return photo.id;

  }

}
