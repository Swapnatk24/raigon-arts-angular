import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CustomerService, FrameSize } from '../services/customer.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-frames',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './frames.html'
})
export class Frames implements OnInit, OnDestroy {

  frameSizes: FrameSize[] = [];
  searchQuery = '';
  private subscription = new Subscription();

  constructor(
    private customerService: CustomerService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.subscription.add(
      this.customerService.frameSizes$.subscribe(sizes => {
        this.frameSizes = sizes || [];
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      })
    );
    this.customerService.fetchFrameSizes().subscribe();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  get filtered(): FrameSize[] {
    const query = this.searchQuery.trim().toLowerCase();

    if (!query) {
      return this.frameSizes;
    }

    return this.frameSizes.filter(s => {
      const cat = (s.category === 'Custom Size' || s.category === 'Customize' || s.category?.toLowerCase() === 'custom') ? 'Customize' : s.category;
      return s.name.toLowerCase().includes(query) ||
        cat.toLowerCase().includes(query) ||
        (s.code && s.code.toLowerCase().includes(query)) ||
        s.id.toLowerCase().includes(query);
    });
  }

  handleSearch(value: string): void {
    this.searchQuery = value;
    this.cdr.markForCheck();
  }

  openFrameModal(id: string | null = null): void {
    if (id) {
      const target = this.frameSizes.find(s => s.id === id || (s.code && s.code === id));
      if (target) {
        this.customerService.openFrameSizeModal(target);
        return;
      }
    }
    this.customerService.openFrameSizeModal(null);
  }

  confirmDelete(id: string, name: string): void {
    this.customerService.confirm({
      title: 'Delete Frame Size',
      message: `Are you sure you want to delete frame size "${name}" (${id})?`,
      confirmText: 'Delete Size',
      confirmClass: 'btn-danger',
      onConfirm: () => {
        this.customerService.deleteFrameSize(id).subscribe({
          next: () => {
            this.toastService.warning(`Frame size "${name}" deleted.`);
            this.cdr.markForCheck();
            this.cdr.detectChanges();
          },
          error: (err) => {
            this.toastService.error(err?.error?.message || 'Failed to delete frame size.');
          }
        });
      }
    });
  }
}
