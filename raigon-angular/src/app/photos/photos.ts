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

    this.toastService.success(
      `Downloading ${this.selectedPhotoIds.size} selected high-res photos...`
    );

  }

  deleteSelected(): void {

    if (this.selectedPhotoIds.size === 0) {
      return;
    }

    this.toastService.warning(
      `${this.selectedPhotoIds.size} photos removed from collection selection.`
    );

    this.selectedPhotoIds.clear();

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
