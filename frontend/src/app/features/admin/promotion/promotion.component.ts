import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { AdminService } from '../../../core/services/admin.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';

interface ClassInfo { id: number; className: string; }
interface PromotedStudentInfo { id: number; fullName: string; oldRollNumber: string; newRollNumber: string; sectionName: string; }
interface PromoteResponse { fromClassName: string; toClassName: string; totalStudents: number; promotedCount: number; message: string; students: PromotedStudentInfo[]; }
interface PromotionPair { fromClass: ClassInfo; toClass: ClassInfo | null; label: string; icon: string; color: string; preview: PromoteResponse | null; loading: boolean; promoted: boolean; promotedFees?: any[]; }

@Component({
  selector: 'app-promotion',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatCardModule, MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, MatTableModule, MatDialogModule,
    MatSnackBarModule, MatChipsModule, NavbarComponent
  ],
  template: `
    <app-navbar></app-navbar>
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1>Year-End Class Promotion</h1>
          <p class="subtitle">Promote students to the next class at the end of the academic year</p>
        </div>
        <div class="year-selector">
          <mat-icon>calendar_today</mat-icon>
          <div>
            <label class="year-label">New Academic Year</label>
            <input class="year-input" type="text" [(ngModel)]="newAcademicYear" placeholder="e.g. 2026-27">
          </div>
        </div>
      </div>

      <div *ngIf="loadingClasses" class="loading-center"><mat-spinner diameter="40"></mat-spinner></div>

      <div class="pairs-grid" *ngIf="!loadingClasses">
        <mat-card class="pair-card" *ngFor="let pair of promotionPairs" [class.promoted]="pair.promoted">
          <mat-card-header>
            <mat-icon mat-card-avatar [style.color]="pair.color">{{ pair.icon }}</mat-icon>
            <mat-card-title>{{ pair.label }}</mat-card-title>
            <mat-card-subtitle>
              Class {{ pair.fromClass.className }} →
              {{ pair.toClass ? 'Class ' + pair.toClass.className : 'Graduate' }}
            </mat-card-subtitle>
          </mat-card-header>

          <mat-card-content>
            <!-- Before preview -->
            <div *ngIf="!pair.preview && !pair.promoted" class="preview-prompt">
              <mat-icon class="big-icon">school</mat-icon>
              <p>Click <strong>Preview</strong> to see which students will be promoted.</p>
            </div>

            <!-- Preview loaded -->
            <div *ngIf="pair.preview && !pair.promoted">
              <div class="stat-row">
                <div class="stat">
                  <span class="stat-num">{{ pair.preview.totalStudents }}</span>
                  <span class="stat-label">Students</span>
                </div>
                <mat-icon class="arrow-icon">arrow_forward</mat-icon>
                <div class="stat">
                  <span class="stat-num" [style.color]="pair.color">
                    {{ pair.toClass ? 'Class ' + pair.toClass.className : 'Graduate' }}
                  </span>
                  <span class="stat-label">Destination</span>
                </div>
              </div>
              <div class="view-all-row">
                <button mat-stroked-button (click)="openPreview(pair)">
                  <mat-icon>list</mat-icon>
                  View All {{ pair.preview.totalStudents }} Students
                </button>
              </div>
            </div>

            <!-- Already promoted -->
            <div *ngIf="pair.promoted" class="success-state">
              <mat-icon class="success-icon">check_circle</mat-icon>
              <p>{{ pair.preview?.message }}</p>
              <div class="promo-fee-summary" *ngIf="pair.toClass && pair.promotedFees && pair.promotedFees.length > 0">
                <div class="pfs-title"><mat-icon>currency_rupee</mat-icon> New Fee — {{ newAcademicYear }}</div>
                <div class="pfs-row" *ngFor="let f of pair.promotedFees">
                  <span>{{ getFeeTypeLabel(f.feeType) }}</span>
                  <span>₹{{ f.amount | number:'1.0-0' }}</span>
                </div>
                <div class="pfs-total">
                  <span>Total</span>
                  <strong>₹{{ getPairTotal(pair) | number:'1.0-0' }}</strong>
                </div>
              </div>
              <p class="promo-fee-none" *ngIf="pair.toClass && (!pair.promotedFees || pair.promotedFees.length === 0)">
                <mat-icon>info</mat-icon> No fee structure set for Class {{ pair.toClass.className }} ({{ newAcademicYear }})
              </p>
            </div>
          </mat-card-content>

          <mat-card-actions>
            <button mat-stroked-button *ngIf="!pair.preview && !pair.promoted"
              (click)="loadPreview(pair)" [disabled]="pair.loading">
              <mat-spinner diameter="16" *ngIf="pair.loading" style="display:inline-block;margin-right:6px"></mat-spinner>
              <mat-icon *ngIf="!pair.loading">preview</mat-icon>
              {{ pair.loading ? 'Loading...' : 'Preview' }}
            </button>
            <button mat-raised-button [style.background-color]="pair.color" style="color:white"
              *ngIf="pair.preview && !pair.promoted"
              (click)="confirmAndPromote(pair)">
              <mat-icon>upgrade</mat-icon>
              {{ pair.toClass ? 'Promote' : 'Graduate' }}
            </button>
          </mat-card-actions>
        </mat-card>
      </div>

      <!-- Full-screen preview overlay -->
      <div class="fullscreen-overlay" *ngIf="previewingPair" (click)="closePreview()">
        <div class="fullscreen-panel" (click)="$event.stopPropagation()">
          <div class="panel-header" [style.border-left-color]="previewingPair.color">
            <div class="panel-title-row">
              <mat-icon [style.color]="previewingPair.color">{{ previewingPair.icon }}</mat-icon>
              <h2>{{ previewingPair.label }}</h2>
              <span class="total-badge">{{ previewingPair.preview?.totalStudents }} students</span>
              <button mat-icon-button (click)="closePreview()" class="close-btn"><mat-icon>close</mat-icon></button>
            </div>
            <div class="panel-search-row">
              <input class="search-input-full" type="text" placeholder="🔍 Search by name or roll number..."
                (input)="setFilter(previewingPair, $any($event.target).value)">
              <span class="filtered-count" *ngIf="getFiltered(previewingPair).length !== previewingPair.preview?.totalStudents">
                Showing {{ getFiltered(previewingPair).length }} of {{ previewingPair.preview?.totalStudents }}
              </span>
            </div>
          </div>
          <div class="panel-body">
            <table mat-table [dataSource]="getFiltered(previewingPair)" class="full-preview-table">
              <ng-container matColumnDef="index">
                <th mat-header-cell *matHeaderCellDef>#</th>
                <td mat-cell *matCellDef="let s; let i = index">{{ i + 1 }}</td>
              </ng-container>
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Student Name</th>
                <td mat-cell *matCellDef="let s">{{ s.fullName }}</td>
              </ng-container>
              <ng-container matColumnDef="section">
                <th mat-header-cell *matHeaderCellDef>Section</th>
                <td mat-cell *matCellDef="let s">{{ s.sectionName || '—' }}</td>
              </ng-container>
              <ng-container matColumnDef="oldRoll">
                <th mat-header-cell *matHeaderCellDef>Current Roll No.</th>
                <td mat-cell *matCellDef="let s">{{ s.oldRollNumber }}</td>
              </ng-container>
              <ng-container matColumnDef="newRoll">
                <th mat-header-cell *matHeaderCellDef>New Roll No.</th>
                <td mat-cell *matCellDef="let s">
                  <span [class]="previewingPair!.toClass ? 'badge new' : 'badge graduate'">{{ s.newRollNumber }}</span>
                </td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="fullPreviewCols; sticky: true"></tr>
              <tr mat-row *matRowDef="let row; columns: fullPreviewCols;"></tr>
            </table>
            <p *ngIf="getFiltered(previewingPair).length === 0" class="no-results">No matching students found.</p>
          </div>
          <div class="panel-footer">
            <button mat-stroked-button (click)="closePreview()">Close</button>
            <button mat-raised-button [style.background-color]="previewingPair.color" style="color:white"
              *ngIf="!previewingPair.promoted"
              (click)="closePreview(); confirmAndPromote(previewingPair)">
              <mat-icon>upgrade</mat-icon>
              {{ previewingPair.toClass ? 'Promote All ' + previewingPair.preview?.totalStudents + ' Students' : 'Graduate All Students' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Confirm dialog content rendered inline -->
      <div class="confirm-overlay" *ngIf="confirmingPair" (click)="cancelConfirm()">
        <mat-card class="confirm-dialog" (click)="$event.stopPropagation()">
          <mat-card-title>
            <mat-icon [style.color]="confirmingPair.color">warning</mat-icon>
            Confirm {{ confirmingPair.toClass ? 'Promotion' : 'Graduation' }}
          </mat-card-title>
          <mat-card-content>
            <p>You are about to promote <strong>{{ confirmingPair.preview?.totalStudents }} students</strong>
              from <strong>Class {{ confirmingPair.fromClass.className }}</strong> to
              <strong>{{ confirmingPair.toClass ? 'Class ' + confirmingPair.toClass.className : 'Graduate (removed from system)' }}</strong>.
            </p>
            <p class="warn-text" *ngIf="!confirmingPair.toClass">
              ⚠️ Class 10 graduates will be <strong>permanently removed</strong> from the system. This cannot be undone.
            </p>
            <p class="warn-text" *ngIf="confirmingPair.toClass">
              Roll numbers will be updated automatically (e.g., {{ getFirstStudent(confirmingPair)?.oldRollNumber }}
              → {{ getFirstStudent(confirmingPair)?.newRollNumber }}).
            </p>

            <!-- Fee Structure for new class -->
            <div class="fee-info-box" *ngIf="confirmingPair.toClass">
              <div class="fee-info-header">
                <mat-icon>currency_rupee</mat-icon>
                <span>Fee Structure — Class {{ confirmingPair.toClass.className }} ({{ newAcademicYear }})</span>
              </div>
              <div *ngIf="confirmFeesLoading" class="fee-loading">
                <mat-spinner diameter="20"></mat-spinner> Loading fees...
              </div>
              <div *ngIf="!confirmFeesLoading && confirmFees.length === 0" class="fee-none">
                ⚠️ No fee structure defined for Class {{ confirmingPair.toClass.className }} in {{ newAcademicYear }}.
                Please set up fees after promotion.
              </div>
              <div *ngIf="!confirmFeesLoading && confirmFees.length > 0">
                <div class="fee-row-item" *ngFor="let f of confirmFees">
                  <span class="fee-type-tag">{{ getFeeTypeLabel(f.feeType) }}</span>
                  <span class="fee-amt-tag">₹{{ f.amount | number:'1.0-0' }}</span>
                </div>
                <div class="fee-total-row">
                  <span>Total Fee Due</span>
                  <strong>₹{{ getConfirmTotal() | number:'1.0-0' }}</strong>
                </div>
              </div>
            </div>
          </mat-card-content>
          <mat-card-actions align="end">
            <button mat-stroked-button (click)="cancelConfirm()">Cancel</button>
            <button mat-raised-button color="warn" (click)="executePromotion(confirmingPair)" [disabled]="promoting">
              <mat-spinner diameter="16" *ngIf="promoting" style="display:inline-block;margin-right:6px"></mat-spinner>
              {{ promoting ? 'Processing...' : 'Yes, Confirm' }}
            </button>
          </mat-card-actions>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; max-width: 1200px; margin: 0 auto; }
    .page-header { margin-bottom: 24px; }
    .page-header h1 { margin: 0 0 4px; font-size: 1.8rem; font-weight: 500; color: #3f51b5; }
    .subtitle { color: #666; margin: 0; }
    .pairs-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 20px; }
    .pair-card { transition: box-shadow .2s; }
    .pair-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,.12); }
    .pair-card.promoted { border: 2px solid #4caf50; }
    .preview-prompt { text-align: center; padding: 20px 0; color: #999; }
    .big-icon { font-size: 48px; width: 48px; height: 48px; display: block; margin: 0 auto 8px; }
    .stat-row { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; padding: 12px; background: #f5f5f5; border-radius: 8px; }
    .stat { display: flex; flex-direction: column; align-items: center; flex: 1; }
    .stat-num { font-size: 1.6rem; font-weight: 700; }
    .stat-label { font-size: 0.75rem; color: #666; }
    .arrow-icon { font-size: 32px; width: 32px; height: 32px; color: #999; }
    .preview-table { width: 100%; }
    .more-hint { color: #999; font-size: 0.8rem; margin: 8px 0 0; }
    .badge { padding: 2px 8px; border-radius: 10px; font-size: 0.8rem; font-weight: 500; }
    .badge.new { background: #e3f2fd; color: #1565c0; }
    .badge.graduate { background: #fce4ec; color: #c62828; }
    .success-state { text-align: center; padding: 20px 0; }
    .success-icon { font-size: 48px; width: 48px; height: 48px; color: #4caf50; display: block; margin: 0 auto 8px; }
    mat-card-actions { padding: 8px 16px 16px; display: flex; gap: 8px; }
    .loading-center { display: flex; justify-content: center; padding: 60px; }
    .confirm-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.5); z-index: 1000; display: flex; align-items: center; justify-content: center; }
    .confirm-dialog { max-width: 480px; width: 90%; padding: 8px; }
    .confirm-dialog mat-card-title { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; }
    .warn-text { color: #b71c1c; font-size: 0.9rem; background: #ffebee; padding: 8px 12px; border-radius: 4px; }
    .view-all-row { display: flex; justify-content: center; padding: 8px 0 4px; }
    .fullscreen-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.6); z-index: 1000; display: flex; align-items: stretch; justify-content: center; padding: 24px; box-sizing: border-box; }
    .fullscreen-panel { background: #fff; border-radius: 12px; display: flex; flex-direction: column; width: 100%; max-width: 900px; max-height: 100%; overflow: hidden; box-shadow: 0 8px 40px rgba(0,0,0,.3); }
    .panel-header { padding: 20px 24px 0; border-left: 5px solid #3f51b5; }
    .panel-title-row { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
    .panel-title-row h2 { margin: 0; flex: 1; font-size: 1.2rem; font-weight: 600; }
    .total-badge { background: #e8eaf6; color: #3f51b5; padding: 4px 12px; border-radius: 12px; font-size: 0.85rem; font-weight: 600; }
    .close-btn { margin-left: auto; }
    .panel-search-row { display: flex; align-items: center; gap: 12px; padding-bottom: 12px; }
    .search-input-full { flex: 1; padding: 8px 14px; border: 1px solid #ddd; border-radius: 8px; font-size: 0.95rem; outline: none; }
    .search-input-full:focus { border-color: #3f51b5; box-shadow: 0 0 0 2px rgba(63,81,181,.15); }
    .filtered-count { font-size: 0.82rem; color: #888; white-space: nowrap; }
    .panel-body { flex: 1; overflow-y: auto; border-top: 1px solid #eee; border-bottom: 1px solid #eee; }
    .full-preview-table { width: 100%; }
    .no-results { text-align: center; color: #999; padding: 32px; }
    .panel-footer { display: flex; justify-content: flex-end; gap: 12px; padding: 16px 24px; }

    /* Year selector */
    .page-header { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; margin-bottom:24px; }
    .year-selector { display:flex; align-items:center; gap:10px; background:#fff; border:1.5px solid #e0e0e0; border-radius:10px; padding:10px 14px; }
    .year-selector mat-icon { color:#3f51b5; }
    .year-label { display:block; font-size:0.7rem; color:#888; font-weight:600; text-transform:uppercase; letter-spacing:.5px; margin-bottom:2px; }
    .year-input { border:none; outline:none; font-size:0.95rem; font-weight:700; color:#1a237e; width:90px; background:transparent; }

    /* Fee info in confirm dialog */
    .fee-info-box { background:#f0f2ff; border-radius:10px; padding:14px 16px; margin-top:14px; border-left:4px solid #3f51b5; }
    .fee-info-header { display:flex; align-items:center; gap:6px; font-weight:700; color:#1a237e; font-size:0.9rem; margin-bottom:10px; }
    .fee-info-header mat-icon { font-size:18px; width:18px; height:18px; }
    .fee-loading { display:flex; align-items:center; gap:8px; color:#888; font-size:0.85rem; }
    .fee-none { color:#e65100; font-size:0.85rem; padding:4px 0; }
    .fee-row-item { display:flex; justify-content:space-between; align-items:center; padding:5px 0; border-bottom:1px dashed #dde; }
    .fee-row-item:last-child { border-bottom:none; }
    .fee-type-tag { background:#e8eaf6; color:#3f51b5; border-radius:6px; padding:2px 8px; font-size:0.8rem; font-weight:600; }
    .fee-amt-tag { font-weight:700; color:#1b5e20; font-size:0.9rem; }
    .fee-total-row { display:flex; justify-content:space-between; margin-top:8px; padding-top:8px; border-top:2px solid #c5cae9; font-size:0.95rem; color:#1a237e; }

    /* Promoted fee summary on card */
    .promo-fee-summary { background:#e8f5e9; border-radius:8px; padding:12px 14px; margin-top:10px; text-align:left; }
    .pfs-title { display:flex; align-items:center; gap:4px; font-weight:700; color:#2e7d32; font-size:0.85rem; margin-bottom:8px; }
    .pfs-title mat-icon { font-size:16px; width:16px; height:16px; }
    .pfs-row { display:flex; justify-content:space-between; font-size:0.82rem; color:#555; padding:3px 0; }
    .pfs-total { display:flex; justify-content:space-between; margin-top:6px; padding-top:6px; border-top:1px solid #a5d6a7; font-size:0.9rem; color:#1b5e20; }
    .promo-fee-none { display:flex; align-items:center; gap:4px; font-size:0.8rem; color:#888; margin-top:8px; justify-content:center; }
    .promo-fee-none mat-icon { font-size:16px; width:16px; height:16px; }
  `]
})
export class PromotionComponent implements OnInit {
  classes: ClassInfo[] = [];
  promotionPairs: PromotionPair[] = [];
  loadingClasses = true;
  confirmingPair: PromotionPair | null = null;
  previewingPair: PromotionPair | null = null;
  promoting = false;
  previewCols = ['name', 'oldRoll', 'newRoll'];
  fullPreviewCols = ['index', 'name', 'section', 'oldRoll', 'newRoll'];

  // Fee tracking
  newAcademicYear: string = this.computeNextYear();
  confirmFees: any[] = [];
  confirmFeesLoading = false;

  private apiUrl = 'http://localhost:8080/api/admin';
  private feeApi = 'http://localhost:8080/api/admin/fee';
  private filterMap = new Map<PromotionPair, string>();

  constructor(private http: HttpClient, private snackBar: MatSnackBar) {}

  computeNextYear(): string {
    const y = new Date().getFullYear();
    return `${y}-${String(y + 1).slice(2)}`;
  }

  getFeeTypeLabel(type: string): string {
    const m: any = { TUITION: 'Tuition', EXAM: 'Exam', LIBRARY: 'Library', SPORTS: 'Sports', TRANSPORT: 'Transport', OTHER: 'Other' };
    return m[type] || type;
  }

  getConfirmTotal(): number {
    return this.confirmFees.reduce((s, f) => s + (f.amount || 0), 0);
  }

  getPairTotal(pair: PromotionPair): number {
    return (pair.promotedFees || []).reduce((s: number, f: any) => s + (f.amount || 0), 0);
  }

  setFilter(pair: PromotionPair, value: string): void {
    this.filterMap.set(pair, value.toLowerCase().trim());
  }

  getFiltered(pair: PromotionPair): PromotedStudentInfo[] {
    const q = this.filterMap.get(pair) || '';
    if (!q) return pair.preview?.students ?? [];
    return (pair.preview?.students ?? []).filter(s =>
      s.fullName.toLowerCase().includes(q) ||
      s.oldRollNumber.toLowerCase().includes(q) ||
      s.newRollNumber.toLowerCase().includes(q)
    );
  }

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: 'Bearer ' + token });
    this.http.get<ClassInfo[]>(`${this.apiUrl}/classes`, { headers }).subscribe({
      next: classes => {
        this.classes = classes.sort((a, b) => Number(a.className) - Number(b.className));
        this.buildPairs();
        this.loadingClasses = false;
      },
      error: () => { this.loadingClasses = false; }
    });
  }

  buildPairs(): void {
    const colors = ['#1976d2', '#388e3c', '#f57c00', '#7b1fa2', '#c62828'];
    const pairs: PromotionPair[] = [];
    for (let i = 0; i < this.classes.length; i++) {
      const from = this.classes[i];
      const to = i < this.classes.length - 1 ? this.classes[i + 1] : null;
      pairs.push({
        fromClass: from,
        toClass: to,
        label: to ? `Class ${from.className} → Class ${to.className}` : `Class ${from.className} → Graduate`,
        icon: to ? 'upgrade' : 'school',
        color: colors[i % colors.length],
        preview: null,
        loading: false,
        promoted: false
      });
    }
    this.promotionPairs = pairs;
  }

  loadPreview(pair: PromotionPair): void {
    pair.loading = true;
    pair.preview = null;
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: 'Bearer ' + token });
    const params: any = { fromClassId: pair.fromClass.id };
    if (pair.toClass) params.toClassId = pair.toClass.id;

    this.http.get<PromoteResponse>(`${this.apiUrl}/promote/preview`, { headers, params }).subscribe({
      next: resp => { pair.preview = resp; pair.loading = false; this.previewingPair = pair; },
      error: err => {
        pair.loading = false;
        const msg = err?.error?.message || 'Failed to load preview';
        this.snackBar.open(msg, 'Close', { duration: 4000 });
      }
    });
  }

  openPreview(pair: PromotionPair): void {
    this.filterMap.delete(pair);
    this.previewingPair = pair;
  }

  closePreview(): void {
    this.previewingPair = null;
  }

  confirmAndPromote(pair: PromotionPair): void {
    this.confirmingPair = pair;
    this.confirmFees = [];
    if (pair.toClass) {
      this.confirmFeesLoading = true;
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders({ Authorization: 'Bearer ' + token });
      this.http.get<any[]>(`${this.feeApi}/structures/class/${pair.toClass.id}`,
        { headers, params: { academicYear: this.newAcademicYear } }
      ).subscribe({
        next: fees => { this.confirmFees = fees; this.confirmFeesLoading = false; },
        error: ()  => { this.confirmFeesLoading = false; }
      });
    }
  }

  cancelConfirm(): void {
    this.confirmingPair = null;
  }

  getFirstStudent(pair: PromotionPair): PromotedStudentInfo | undefined {
    return pair.preview?.students?.[0];
  }

  executePromotion(pair: PromotionPair): void {
    this.promoting = true;
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' });
    const body = { fromClassId: pair.fromClass.id, toClassId: pair.toClass?.id ?? null, newAcademicYear: this.newAcademicYear };

    this.http.post<PromoteResponse>(`${this.apiUrl}/promote`, body, { headers }).subscribe({
      next: resp => {
        pair.preview = resp;
        pair.promoted = true;
        pair.promotedFees = this.confirmFees;   // store fee snapshot on the card
        this.promoting = false;
        this.confirmingPair = null;
        this.snackBar.open(resp.message, 'Close', { duration: 5000, panelClass: ['success-snack'] });
      },
      error: err => {
        this.promoting = false;
        this.confirmingPair = null;
        const msg = err?.error?.message || 'Promotion failed';
        this.snackBar.open(msg, 'Close', { duration: 5000 });
      }
    });
  }
}
