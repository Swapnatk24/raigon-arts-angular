import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface FrameSize {
  id: string;
  name: string;
  width: number;
  height: number; 
  unit: string;
  category: string;
  usageCount?: number;
  status?: string;
}

@Component({
  selector: 'app-frames',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './frames.html',
  styleUrl: './frames.css'
})
export class Frames {

  // =====================================================
  // FRAME SIZES
  // =====================================================

  frameSizes: FrameSize[] = [
    {
      id: 'FS-001',
      name: '8 × 10 inch',
      width: 8,
      height: 10,
      unit: 'inch',
      category: 'Standard Photo',
      usageCount: 0,
      status: 'Active'
    },
    {
      id: 'FS-002',
      name: '12 × 18 inch',
      width: 12,
      height: 18,
      unit: 'inch',
      category: 'Standard Photo',
      usageCount: 0,
      status: 'Active'
    },
    {
      id: 'FS-003',
      name: '16 × 20 inch',
      width: 16,
      height: 20,
      unit: 'inch',
      category: 'Standard Photo',
      usageCount: 0,
      status: 'Active'
    }
  ];


  // =====================================================
  // SEARCH
  // =====================================================

  searchQuery = '';


  // =====================================================
  // FILTERED FRAME SIZES
  // =====================================================

  get filtered(): FrameSize[] {

    const query = this.searchQuery
      .trim()
      .toLowerCase();

    if (!query) {
      return this.frameSizes;
    }

    return this.frameSizes.filter((s: FrameSize) =>
      s.name.toLowerCase().includes(query) ||
      s.category.toLowerCase().includes(query)
    );
  }


  // =====================================================
  // FRAME SIZE MODAL
  // =====================================================

  showFrameModal = false;

  frameSizeModalTitle = 'Add New Frame Size';

  editingFrameId: string | null = null;


  // =====================================================
  // FORM VALUES
  // =====================================================

  formSizeId = '';

  formSizeName = '';

  formSizeWidth: number | null = null;

  formSizeHeight: number | null = null;

  formSizeUnit = 'inch';

  formSizeCategory = 'Standard Photo';


  // =====================================================
  // VALIDATION
  // =====================================================

  sizeNameError = '';

  widthError = '';

  heightError = '';


  // =====================================================
  // SEARCH
  // =====================================================

  handleSearch(value: string): void {

    this.searchQuery = value;

  }


  // =====================================================
  // OPEN FRAME MODAL
  // =====================================================

  openFrameModal(id: string | null = null): void {

    this.resetForm();

    this.editingFrameId = id;

    // ---------------------------------------------------
    // EDIT FRAME SIZE
    // ---------------------------------------------------

    if (id) {

      const target = this.frameSizes.find(
        s => s.id === id
      );

      if (!target) {
        return;
      }

      this.frameSizeModalTitle =
        `Edit Frame Size (${id})`;

      this.formSizeId = target.id;

      this.formSizeName = target.name;

      this.formSizeWidth = target.width;

      this.formSizeHeight = target.height;

      this.formSizeUnit =
        target.unit || 'inch';

      this.formSizeCategory =
        target.category || 'Standard Photo';

    }

    // ---------------------------------------------------
    // ADD NEW FRAME SIZE
    // ---------------------------------------------------

    else {

      this.frameSizeModalTitle =
        'Add New Frame Size';

    }

    // Show modal

    this.showFrameModal = true;
  }


  // =====================================================
  // CLOSE FRAME MODAL
  // =====================================================

  closeFrameModal(): void {

    this.showFrameModal = false;

  }


  // =====================================================
  // SAVE FRAME SIZE
  // =====================================================

  saveFrameSize(): void {

    this.validateForm();

    // Stop if validation failed

    if (
      this.sizeNameError ||
      this.widthError ||
      this.heightError
    ) {
      return;
    }


    // ---------------------------------------------------
    // EDIT EXISTING FRAME SIZE
    // ---------------------------------------------------

    if (this.editingFrameId) {

      const index = this.frameSizes.findIndex(
        s => s.id === this.editingFrameId
      );

      if (index !== -1) {

        const existing =
          this.frameSizes[index];

        this.frameSizes[index] = {

          ...existing,

          name:
            this.formSizeName.trim(),

          width:
            Number(this.formSizeWidth),

          height:
            Number(this.formSizeHeight),

          unit:
            this.formSizeUnit,

          category:
            this.formSizeCategory,

          status:
            'Active'

        };

        // Trigger Angular update

        this.frameSizes = [
          ...this.frameSizes
        ];
      }

    }

    // ---------------------------------------------------
    // ADD NEW FRAME SIZE
    // ---------------------------------------------------

    else {

      const newFrame: FrameSize = {

        id:
          this.generateFrameId(),

        name:
          this.formSizeName.trim(),

        width:
          Number(this.formSizeWidth),

        height:
          Number(this.formSizeHeight),

        unit:
          this.formSizeUnit,

        category:
          this.formSizeCategory,

        usageCount:
          0,

        status:
          'Active'
      };


      this.frameSizes = [

        ...this.frameSizes,

        newFrame

      ];
    }


    // Close modal

    this.closeFrameModal();

    // Clear form

    this.resetForm();
  }


  // =====================================================
  // GENERATE FRAME ID
  // =====================================================

  private generateFrameId(): string {

    let number =
      this.frameSizes.length + 1;

    let id =
      `FS-${String(number).padStart(3, '0')}`;


    while (
      this.frameSizes.some(
        s => s.id === id
      )
    ) {

      number++;

      id =
        `FS-${String(number).padStart(3, '0')}`;
    }


    return id;
  }


  // =====================================================
  // DELETE FRAME SIZE
  // =====================================================

  confirmDelete(
    id: string,
    name: string
  ): void {

    const confirmed =
      window.confirm(
        `Are you sure you want to delete size "${name}" (${id})?`
      );


    if (!confirmed) {
      return;
    }


    this.frameSizes =
      this.frameSizes.filter(
        s => s.id !== id
      );
  }


  // =====================================================
  // VALIDATE FORM
  // =====================================================

  validateForm(): void {

    this.sizeNameError = '';

    this.widthError = '';

    this.heightError = '';


    // ---------------------------------------------------
    // SIZE NAME
    // ---------------------------------------------------

    const name =
      this.formSizeName.trim();

    if (!name) {

      this.sizeNameError =
        'Size Name is required';

    }


    // ---------------------------------------------------
    // WIDTH
    // ---------------------------------------------------

    if (
      this.formSizeWidth === null ||
      this.formSizeWidth <= 0
    ) {

      this.widthError =
        'Width is required';

    }


    // ---------------------------------------------------
    // HEIGHT
    // ---------------------------------------------------

    if (
      this.formSizeHeight === null ||
      this.formSizeHeight <= 0
    ) {

      this.heightError =
        'Height is required';

    }
  }


  // =====================================================
  // RESET FORM
  // =====================================================

  resetForm(): void {

    this.formSizeId = '';

    this.formSizeName = '';

    this.formSizeWidth = null;

    this.formSizeHeight = null;

    this.formSizeUnit = 'inch';

    this.formSizeCategory =
      'Standard Photo';

    this.editingFrameId = null;

    this.frameSizeModalTitle =
      'Add New Frame Size';

    this.sizeNameError = '';

    this.widthError = '';

    this.heightError = '';
  }

}
