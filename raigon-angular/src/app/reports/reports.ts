import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { Subscription } from 'rxjs';
import { Customer, CustomerService, FrameSizeSalesBreakdown, MaterialSalesBreakdown, ReportCardsData } from '../services/customer.service';
import { ToastService } from '../services/toast.service';

export interface ReportLedgerItem extends Customer {
  orderCount?: number;
  totalBilled?: number;
  dueBalance?: number;
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  templateUrl: './reports.html'
})
export class Reports implements OnInit, OnDestroy {

  timeframe = '1_month';
  timeframeLabel = 'Last 30 Days (Sep - Oct 2026)';
  activeReportTab = 'active_ledger';

  customers: Customer[] = [];
  reportCards: ReportCardsData = {
    totalRevenue: 0,
    advanceCollected: 0,
    outstandingBalance: 0,
    highestOrderOfDay: 0,
    hod: 0,
    totalOrders: 0
  };

  topFrameSizes: FrameSizeSalesBreakdown[] = [];
  popularMaterials: MaterialSalesBreakdown[] = [];
  isLoadingAnalytics = false;

  private subscription = new Subscription();

  constructor(
    private customerService: CustomerService,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.reportCards = this.customerService.getReportCards();
    this.subscription.add(
      this.customerService.reportCards$.subscribe(data => {
        if (data) {
          this.reportCards = data;
        }
      })
    );
    this.loadReportCards();
    this.loadAnalytics();
    this.subscription.add(
      this.customerService.customers$.subscribe(custs => {
        this.customers = custs;
      })
    );
  }

  loadReportCards(): void {
    this.subscription.add(
      this.customerService.fetchReportCards().subscribe(data => {
        if (data) {
          this.reportCards = data;
        }
      })
    );
  }

  loadAnalytics(): void {
    this.isLoadingAnalytics = true;
    this.subscription.add(
      this.customerService.fetchTopFrameSizes().subscribe(data => {
        if (Array.isArray(data)) {
          this.topFrameSizes = data;
        }
        this.isLoadingAnalytics = false;
      })
    );
    this.subscription.add(
      this.customerService.fetchPopularMaterials().subscribe(data => {
        if (Array.isArray(data)) {
          this.popularMaterials = data;
        }
      })
    );
  }

  getFrameSizeTextColor(index: number): string {
    const colors = ['#B38F38', '#28C76F', '#00BAD1', '#FF9F43', '#7367F0', '#EA5455'];
    return colors[index % colors.length];
  }

  getFrameSizeBarBackground(index: number): string {
    if (index === 0) {
      return 'linear-gradient(72.47deg, #000000 0%, #D4BF8A 100%)';
    }
    const colors = ['linear-gradient(72.47deg, #000000 0%, #D4BF8A 100%)', '#28C76F', '#00BAD1', '#FF9F43', '#7367F0', '#EA5455'];
    return colors[index % colors.length];
  }

  getMaterialBadgeBackground(index: number): string {
    const bgColors = ['rgba(212,191,138,0.18)', '#DAF8E6', '#E0F8FA', '#FFF0E1', '#EAE8FD', '#FCEAEA'];
    return bgColors[index % bgColors.length];
  }

  getMaterialBadgeColor(index: number): string {
    const textColors = ['#B38F38', '#28C76F', '#00BAD1', '#FF9F43', '#7367F0', '#EA5455'];
    return textColors[index % textColors.length];
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  get activeCustomers(): Customer[] {
    return this.customers.filter(c => !c.isArchived7Days);
  }

  get archived7DaysCustomers(): Customer[] {
    return this.customers.filter(c => c.isArchived7Days || (c.orderStatus === 'Completed' && c.paymentStatus === 'Paid'));
  }

  get customerLedger(): ReportLedgerItem[] {
    return this.activeCustomers.map(c => {
      const totalBilled = Number(c.totalAmount) || 0;
      const advancePaid = Number(c.advancePaid) || 0;
      const dueBalance = totalBilled - advancePaid;
      return {
        ...c,
        orderCount: 1,
        totalBilled,
        advancePaid,
        dueBalance
      };
    }).sort((a, b) => (b.totalBilled || 0) - (a.totalBilled || 0));
  }

  get totalRevenue(): number {
    return this.reportCards.totalRevenue;
  }

  get advanceCollected(): number {
    return this.reportCards.advanceCollected;
  }

  get outstandingBalance(): number {
    return this.reportCards.outstandingBalance;
  }

  get highestOrderOfDay(): number {
    return this.reportCards.highestOrderOfDay ?? this.reportCards.hod ?? 0;
  }

  get hod(): number {
    return this.highestOrderOfDay;
  }

  get totalOrders(): number {
    return this.reportCards.totalOrders;
  }

  get collectionRatio(): number {
    if (this.reportCards.totalRevenue > 0) {
      return Math.round((this.reportCards.advanceCollected / this.reportCards.totalRevenue) * 100);
    }
    return 0;
  }

  setTimeframe(value: string): void {
    this.timeframe = value;
    if (value === '2_months') {
      this.timeframeLabel = 'Last 60 Days (Aug - Oct 2026)';
    } else if (value === 'all') {
      this.timeframeLabel = 'All-Time Historical (Includes Archived)';
    } else {
      this.timeframeLabel = 'Last 30 Days (Sep - Oct 2026)';
    }
    this.loadReportCards();
    this.loadAnalytics();
  }

  setTab(tab: string): void {
    this.activeReportTab = tab;
  }

  sendReminder(name: string, phone: string, balance: number): void {
    const cleanPhone = phone ? phone.replace(/\D/g, '') : '';
    const message = `Hello ${name}, friendly reminder from Raigon Arts regarding your pending balance payment of ₹${balance.toLocaleString('en-IN')}. Thank you!`;
    if (cleanPhone) {
      window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
    }
    this.toastService.success(`WhatsApp reminder sent to ${name}!`);
  }

  showSettledMessage(name: string): void {
    this.toastService.info(`Customer ${name}'s order is fully paid and settled.`);
  }

  viewHistoricalRecord(cust: Customer): void {
    this.customerService.openViewCustomerModal(cust);
  }

  getInitials(name: string): string {
    if (!name) return 'RA';
    return name
      .split(' ')
      .filter(v => v.length > 0)
      .map(v => v.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  exportPdf(): void {
    try {
      const records = (this.customers && this.customers.length > 0)
        ? this.customers
        : this.customerService.getCustomers();

      if (!records || records.length === 0) {
        this.toastService.warning('No customer or framing order records available to export.');
        return;
      }

      this.toastService.info(`Generating Executive PDF Report for ${this.timeframeLabel}...`);

      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'pt',
        format: 'a4'
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 28;

      // 1. Header Strip with Raigon Arts Brand Design
      doc.setFillColor(26, 29, 33);
      doc.rect(margin, 20, pageWidth - (margin * 2), 52, 'F');

      // Brand Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(212, 191, 138);
      doc.text('RAIGON ARTS WORKSHOP', margin + 14, 42);

      // Subtitle
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(240, 240, 240);
      doc.text('Executive Reports & Customer Orders Summary', margin + 14, 58);

      // Meta information
      const now = new Date();
      const formattedDate = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      const formattedTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      doc.setFontSize(8.5);
      doc.setTextColor(212, 191, 138);
      doc.text(`Timeframe: ${this.timeframeLabel}`, pageWidth - margin - 14, 40, { align: 'right' });
      doc.setTextColor(200, 200, 200);
      doc.text(`Generated: ${formattedDate}, ${formattedTime} | Records: ${records.length}`, pageWidth - margin - 14, 56, { align: 'right' });

      // 2. Executive Summary Metrics Cards
      const totalRevenue = records.reduce((sum, c) => sum + (Number(c.totalAmount) || 0), 0);
      const totalAdvance = records.reduce((sum, c) => sum + (Number(c.advancePaid) || 0), 0);
      const totalPending = records.reduce((sum, c) => sum + Math.max(0, (Number(c.totalAmount) || 0) - (Number(c.advancePaid) || 0)), 0);
      const totalQty = records.reduce((sum, c) => sum + (Number(c.quantity) || (c.photos && c.photos.length) || 1), 0);
      const collectionRatio = totalRevenue > 0 ? Math.round((totalAdvance / totalRevenue) * 100) : 0;

      const kpiY = 80;
      const kpiHeight = 44;
      const kpiWidth = (pageWidth - (margin * 2) - 30) / 4;

      const kpis = [
        { label: 'TOTAL ORDERS', val: `${records.length} Orders (${totalQty} Frames)`, bg: [245, 247, 250], text: [40, 45, 55] },
        { label: 'TOTAL BILLED REVENUE', val: `Rs. ${totalRevenue.toLocaleString('en-IN')}`, bg: [235, 248, 240], text: [20, 140, 70] },
        { label: 'ADVANCE COLLECTED', val: `Rs. ${totalAdvance.toLocaleString('en-IN')} (${collectionRatio}%)`, bg: [254, 250, 235], text: [180, 130, 25] },
        { label: 'OUTSTANDING BALANCE', val: `Rs. ${totalPending.toLocaleString('en-IN')}`, bg: [253, 240, 240], text: [210, 45, 45] }
      ];

      kpis.forEach((kpi, idx) => {
        const x = margin + (idx * (kpiWidth + 10));
        doc.setFillColor(kpi.bg[0], kpi.bg[1], kpi.bg[2]);
        doc.roundedRect(x, kpiY, kpiWidth, kpiHeight, 4, 4, 'F');
        doc.setDrawColor(220, 225, 230);
        doc.roundedRect(x, kpiY, kpiWidth, kpiHeight, 4, 4, 'S');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(110, 115, 125);
        doc.text(kpi.label, x + 8, kpiY + 14);

        doc.setFontSize(10);
        doc.setTextColor(kpi.text[0], kpi.text[1], kpi.text[2]);
        doc.text(kpi.val, x + 8, kpiY + 32);
      });

      // 3. Build Table Data for all available customer & frame records
      const tableRows = records.map((c, idx) => {
        // Customer Info cell
        const customerLines = [
          c.name || 'Customer',
          c.phone ? `Phone: ${c.phone}` : '',
          (c.altPhone || c.alternativePhone) ? `Alt: ${c.altPhone || c.alternativePhone}` : '',
          c.city ? `City: ${c.city}` : '',
          c.address ? `Address: ${c.address}${c.pincode ? ' - ' + c.pincode : ''}` : ''
        ].filter(Boolean).join('\n');

        // Frame Specifications cell
        let sizeStr = c.frameSize || '12 × 18 inch';
        if (c.customWidth && c.customHeight) {
          sizeStr += ` (${c.customWidth} × ${c.customHeight} ${c.unit || 'inch'})`;
        } else if (c.customSize) {
          sizeStr += ` (${c.customSize})`;
        }
        const materialStr = c.frameMaterial || c.material || 'Teak Wood Moulding';
        const colorStr = c.frameColor || c.color || 'Walnut Brown';
        const typeStr = c.frameType || 'Wooden Frame';
        const orientStr = c.orientation || 'Landscape';
        const qty = Number(c.quantity) || 1;

        const specLines = [
          `Size: ${sizeStr}`,
          `Type: ${typeStr}`,
          `Material: ${materialStr}`,
          `Color: ${colorStr}`,
          `Orientation: ${orientStr}`,
          `Quantity: ${qty} unit(s)`
        ].join('\n');

        // Photos cell
        let photosStr = 'No photos attached';
        if (c.photos && c.photos.length > 0) {
          photosStr = c.photos.map((p, pIdx) => {
            const pName = p.name || `Photo_${pIdx + 1}`;
            const pSpec = [
              p.frameSize && p.frameSize !== c.frameSize ? p.frameSize : '',
              p.frameMaterial && p.frameMaterial !== materialStr ? p.frameMaterial : '',
              p.frameColor && p.frameColor !== colorStr ? p.frameColor : '',
              p.quantity && p.quantity > 1 ? `Qty:${p.quantity}` : ''
            ].filter(Boolean).join(', ');
            return `${pIdx + 1}. ${pName}${pSpec ? ` (${pSpec})` : ''}`;
          }).join('\n');
        }

        // Dates cell
        const datesLines = [
          `Ordered: ${c.orderDate || 'N/A'}`,
          `Delivery: ${c.deliveryDate || 'TBD'}`
        ].join('\n');

        // Financial Amounts cell
        const billed = Number(c.totalAmount) || 0;
        const advance = Number(c.advancePaid) || 0;
        const balance = c.balanceAmount !== undefined ? Number(c.balanceAmount) : Math.max(0, billed - advance);
        const finLines = [
          `Total: Rs. ${billed.toLocaleString('en-IN')}`,
          `Advance: Rs. ${advance.toLocaleString('en-IN')}`,
          `Balance: Rs. ${balance.toLocaleString('en-IN')}`,
          c.paymentStatus ? `Status: ${c.paymentStatus}` : ''
        ].filter(Boolean).join('\n');

        // Status & Notes cell
        const orderStatus = c.orderStatus || '';
        const statusLines = [
          orderStatus ? `Order: ${orderStatus}` : '',
          c.isArchived7Days ? '[Archived >7d]' : '',
          c.notes ? `Note: ${c.notes}` : ''
        ].filter(Boolean).join('\n');

        return [
          `#${idx + 1}\n${c.id}`,
          customerLines,
          specLines,
          photosStr,
          datesLines,
          finLines,
          statusLines
        ];
      });

      // 4. Generate AutoTable
      autoTable(doc, {
        startY: 132,
        head: [
          ['Order ID', 'Customer Details', 'Frame & Spec Details', 'Photos / Artworks', 'Schedule', 'Financial Breakdown', 'Status & Remarks']
        ],
        body: tableRows,
        theme: 'striped',
        styles: {
          font: 'helvetica',
          fontSize: 7.5,
          cellPadding: 5,
          valign: 'top',
          overflow: 'linebreak',
          textColor: [40, 40, 40],
          lineColor: [220, 220, 220],
          lineWidth: 0.5
        },
        headStyles: {
          fillColor: [26, 29, 33],
          textColor: [212, 191, 138],
          fontStyle: 'bold',
          fontSize: 8,
          halign: 'left',
          valign: 'middle'
        },
        alternateRowStyles: {
          fillColor: [250, 250, 252]
        },
        columnStyles: {
          0: { cellWidth: 55, fontStyle: 'bold', textColor: [26, 29, 33] },
          1: { cellWidth: 125 },
          2: { cellWidth: 140 },
          3: { cellWidth: 145 },
          4: { cellWidth: 80 },
          5: { cellWidth: 110 },
          6: { cellWidth: 'auto' }
        },
        margin: { top: 30, right: margin, bottom: 30, left: margin },
        didDrawPage: (data) => {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7.5);
          doc.setTextColor(140, 140, 140);
          doc.setDrawColor(220, 220, 220);
          doc.setLineWidth(0.5);
          doc.line(margin, pageHeight - 20, pageWidth - margin, pageHeight - 20);

          doc.text('Raigon Arts Workshop • Custom Framing & Art Studio • Confidential Summary Report', margin, pageHeight - 10);
          doc.text(`Page ${data.pageNumber}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
        }
      });

      // 5. Download PDF
      const cleanTimeframe = this.timeframe || 'summary';
      const dateSlug = now.toISOString().slice(0, 10);
      const filename = `Raigon_Arts_Reports_Summary_${cleanTimeframe}_${dateSlug}.pdf`;
      doc.save(filename);

      this.toastService.success(`PDF Summary downloaded successfully (${records.length} records)!`);
    } catch (error: any) {
      console.error('Error generating PDF summary report:', error);
      this.toastService.error(`Failed to generate PDF report: ${error?.message || 'Unexpected error'}`);
    }
  }
}

