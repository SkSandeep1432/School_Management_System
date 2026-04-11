import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';

interface FeeRow { id: number; feeType: string; amount: number; description: string; academicYear: string; classId: number; className: string; }
interface ClassCard { classId: number; className: string; fees: FeeRow[]; showAddForm: boolean; addForm: any; addSaving: boolean; }

@Component({
  selector: 'app-fee-structure',
  standalone: true,
  imports: [CommonModule, FormsModule, MatSnackBarModule, MatIconModule, MatTooltipModule, NavbarComponent],
  template: `
    <app-navbar></app-navbar>
    <div class="page-container">

      <!-- Header -->
      <div class="pg-header">
        <div>
          <h1 class="pg-title"><mat-icon>account_balance</mat-icon> Fee Structure Management</h1>
          <p class="pg-sub">Manage multiple fee types per class. Each class can have different fee structures.</p>
        </div>
        <div class="year-box">
          <mat-icon>calendar_today</mat-icon>
          <input type="text" [(ngModel)]="filterYear" placeholder="e.g. 2025-26" (change)="loadStructures()">
        </div>
      </div>

      <!-- Summary Bar -->
      <div class="summary-bar" *ngIf="classCards.length > 0">
        <div class="sum-pill blue"><mat-icon>class</mat-icon> {{ classCards.length }} Classes</div>
        <div class="sum-pill purple"><mat-icon>list</mat-icon> {{ getTotalFeeTypes() }} Fee Types</div>
        <div class="sum-pill green"><mat-icon>currency_rupee</mat-icon> Total: ₹{{ getGrandTotal() | number:'1.0-0' }}</div>
      </div>

      <!-- Loading -->
      <div class="loading-state" *ngIf="loading">
        <mat-icon>hourglass_empty</mat-icon>
        <p>Loading fee structures...</p>
      </div>

      <!-- Empty -->
      <div class="empty-state" *ngIf="!loading && classCards.length === 0">
        <mat-icon>account_balance_wallet</mat-icon>
        <p>No fee structures yet for {{ filterYear }}.</p>
        <p class="empty-hint">Click <strong>+ Add Fee</strong> on any class card below.</p>
      </div>

      <!-- Class Cards Grid -->
      <div class="cards-grid" *ngIf="!loading">
        <div class="class-card" *ngFor="let card of classCards">

          <!-- Card Header -->
          <div class="cc-header">
            <div class="cc-class-badge">Class {{ card.className }}</div>
            <div class="cc-meta">
              <span class="cc-count">{{ card.fees.length }} fee type{{ card.fees.length !== 1 ? 's' : '' }}</span>
              <span class="cc-total">₹{{ getClassTotal(card) | number:'1.0-0' }}</span>
            </div>
            <button class="cc-add-btn" (click)="toggleAddForm(card)" [class.cancel]="card.showAddForm">
              <mat-icon>{{ card.showAddForm ? 'close' : 'add' }}</mat-icon>
              {{ card.showAddForm ? 'Cancel' : '+ Add Fee' }}
            </button>
          </div>

          <!-- Add Fee Form (per class) -->
          <div class="add-form" *ngIf="card.showAddForm">
            <div class="add-form-grid">
              <div class="af-field">
                <label>Fee Type *</label>
                <select [(ngModel)]="card.addForm.feeType">
                  <option value="">Select type</option>
                  <option value="TUITION">Tuition Fee</option>
                  <option value="EXAM">Exam Fee</option>
                  <option value="LIBRARY">Library Fee</option>
                  <option value="SPORTS">Sports Fee</option>
                  <option value="TRANSPORT">Transport Fee</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div class="af-field">
                <label>Amount (₹) *</label>
                <div class="amt-input"><span>₹</span><input type="number" [(ngModel)]="card.addForm.amount" placeholder="e.g. 5000"></div>
              </div>
              <div class="af-field">
                <label>Description</label>
                <input type="text" [(ngModel)]="card.addForm.description" placeholder="Optional">
              </div>
            </div>
            <div class="add-form-actions">
              <button class="af-save-btn" (click)="addFee(card)" [disabled]="card.addSaving">
                <mat-icon>{{ card.addSaving ? 'hourglass_empty' : 'save' }}</mat-icon>
                {{ card.addSaving ? 'Saving...' : 'Save Fee' }}
              </button>
            </div>
          </div>

          <!-- Fee Types List -->
          <div class="fees-list" *ngIf="card.fees.length > 0">
            <div class="fee-row" *ngFor="let fee of card.fees">

              <!-- VIEW MODE -->
              <ng-container *ngIf="editingId !== fee.id">
                <div class="fee-row-left">
                  <span class="fee-badge" [ngClass]="'ft-' + fee.feeType.toLowerCase()">
                    <mat-icon>{{ getFeeIcon(fee.feeType) }}</mat-icon>
                    {{ getFeeLabel(fee.feeType) }}
                  </span>
                  <span class="fee-desc" *ngIf="fee.description">{{ fee.description }}</span>
                </div>
                <div class="fee-row-right">
                  <span class="fee-amount">₹{{ fee.amount | number:'1.0-0' }}</span>
                  <button class="action-btn edit" (click)="startInlineEdit(fee)" matTooltip="Edit">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button class="action-btn del" (click)="deleteFee(fee.id, card)" matTooltip="Delete">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
              </ng-container>

              <!-- INLINE EDIT MODE -->
              <ng-container *ngIf="editingId === fee.id">
                <div class="inline-edit-row">
                  <select [(ngModel)]="editForm.feeType" class="ie-select">
                    <option value="TUITION">Tuition</option>
                    <option value="EXAM">Exam</option>
                    <option value="LIBRARY">Library</option>
                    <option value="SPORTS">Sports</option>
                    <option value="TRANSPORT">Transport</option>
                    <option value="OTHER">Other</option>
                  </select>
                  <div class="ie-amt"><span>₹</span><input type="number" [(ngModel)]="editForm.amount"></div>
                  <input type="text" [(ngModel)]="editForm.description" placeholder="Description" class="ie-desc">
                  <div class="ie-actions">
                    <button class="ie-save" (click)="saveInlineEdit(fee.id, card)" [disabled]="editSaving">
                      <mat-icon>check</mat-icon>
                    </button>
                    <button class="ie-cancel" (click)="cancelEdit()">
                      <mat-icon>close</mat-icon>
                    </button>
                  </div>
                </div>
              </ng-container>

            </div>
          </div>

          <!-- Empty class -->
          <div class="cc-empty" *ngIf="card.fees.length === 0 && !card.showAddForm">
            <mat-icon>add_circle_outline</mat-icon>
            <span>No fees set. Click <strong>+ Add Fee</strong> to start.</span>
          </div>

        </div>

        <!-- Classes with no card yet — show empty placeholder cards -->
        <div class="class-card placeholder" *ngFor="let c of getClassesWithNoFee()">
          <div class="cc-header">
            <div class="cc-class-badge">Class {{ c.className }}</div>
            <div class="cc-meta"><span class="cc-count zero">0 fee types</span></div>
            <button class="cc-add-btn" (click)="initCard(c); toggleAddForm(getCard(c.id)!)">
              <mat-icon>add</mat-icon> + Add Fee
            </button>
          </div>
          <div class="cc-empty">
            <mat-icon>add_circle_outline</mat-icon>
            <span>No fees configured for this class.</span>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .page-container { padding:28px; max-width:1280px; margin:0 auto; animation:fadeInUp 0.35s ease both; }
    @keyframes fadeInUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }

    /* Header */
    .pg-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:20px; flex-wrap:wrap; gap:12px; }
    .pg-title { display:flex; align-items:center; gap:10px; font-size:1.7rem; font-weight:800; color:#1a237e; margin:0 0 4px; }
    .pg-title mat-icon { font-size:28px; width:28px; height:28px; color:#3f51b5; }
    .pg-sub { color:#888; margin:0; font-size:0.88rem; }
    .year-box { display:flex; align-items:center; gap:8px; background:#fff; border:1.5px solid #e0e0e0; border-radius:10px; padding:8px 14px; }
    .year-box mat-icon { color:#9e9e9e; font-size:18px; }
    .year-box input { border:none; outline:none; font-size:0.9rem; width:110px; }

    /* Summary Bar */
    .summary-bar { display:flex; gap:10px; margin-bottom:22px; flex-wrap:wrap; }
    .sum-pill { display:flex; align-items:center; gap:6px; border-radius:20px; padding:6px 16px; font-size:0.85rem; font-weight:700; }
    .sum-pill mat-icon { font-size:15px; width:15px; height:15px; }
    .sum-pill.blue { background:#e8eaf6; color:#1a237e; }
    .sum-pill.purple { background:#f3e5f5; color:#6a1b9a; }
    .sum-pill.green { background:#e8f5e9; color:#1b5e20; }

    /* States */
    .loading-state, .empty-state { text-align:center; padding:60px; color:#bbb; }
    .loading-state mat-icon, .empty-state mat-icon { font-size:52px; width:52px; height:52px; display:block; margin:0 auto 12px; color:#e0e0e0; }
    .empty-hint { font-size:0.85rem; color:#bbb; margin-top:6px; }

    /* Cards Grid */
    .cards-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(340px, 1fr)); gap:20px; }

    /* Class Card */
    .class-card { background:#fff; border-radius:16px; box-shadow:0 2px 14px rgba(0,0,0,0.08); overflow:hidden; transition:box-shadow 0.2s; }
    .class-card:hover { box-shadow:0 6px 24px rgba(0,0,0,0.12); }
    .class-card.placeholder { opacity:0.7; }

    /* Card Header */
    .cc-header { display:flex; align-items:center; gap:10px; padding:14px 16px; background:linear-gradient(135deg,#f8f9ff,#eef0fb); border-bottom:2px solid #e8eaf6; }
    .cc-class-badge { background:linear-gradient(135deg,#1a237e,#5c6bc0); color:#fff; border-radius:10px; padding:5px 14px; font-size:0.9rem; font-weight:700; flex-shrink:0; }
    .cc-meta { flex:1; display:flex; flex-direction:column; gap:2px; padding-left:4px; }
    .cc-count { font-size:0.78rem; color:#888; font-weight:500; }
    .cc-count.zero { color:#e65100; }
    .cc-total { font-size:0.95rem; font-weight:800; color:#1b5e20; }
    .cc-add-btn { display:flex; align-items:center; gap:4px; background:#3f51b5; color:#fff; border:none; border-radius:8px; padding:6px 12px; font-size:0.8rem; font-weight:700; cursor:pointer; transition:background 0.2s; white-space:nowrap; flex-shrink:0; }
    .cc-add-btn:hover { background:#303f9f; }
    .cc-add-btn.cancel { background:#e53935; }
    .cc-add-btn mat-icon { font-size:16px; width:16px; height:16px; }

    /* Add form per card */
    .add-form { padding:14px 16px; background:#fffde7; border-bottom:1px solid #fff9c4; }
    .add-form-grid { display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; margin-bottom:12px; }
    .af-field { display:flex; flex-direction:column; gap:4px; }
    .af-field label { font-size:0.75rem; font-weight:700; color:#555; }
    .af-field select, .af-field input {
      border:1.5px solid #e0e0e0; border-radius:8px; padding:7px 10px;
      font-size:0.85rem; outline:none; background:#fff; font-family:inherit; transition:border-color 0.2s;
    }
    .af-field select:focus, .af-field input:focus { border-color:#3f51b5; }
    .amt-input { display:flex; align-items:center; border:1.5px solid #e0e0e0; border-radius:8px; background:#fff; overflow:hidden; transition:border-color 0.2s; }
    .amt-input:focus-within { border-color:#3f51b5; }
    .amt-input span { padding:0 8px; color:#9e9e9e; font-weight:600; font-size:0.85rem; }
    .amt-input input { border:none; outline:none; padding:7px 8px 7px 0; flex:1; font-size:0.85rem; background:transparent; font-family:inherit; }
    .add-form-actions { display:flex; justify-content:flex-end; }
    .af-save-btn { display:flex; align-items:center; gap:6px; background:linear-gradient(135deg,#1b5e20,#43a047); color:#fff; border:none; border-radius:8px; padding:8px 18px; font-size:0.85rem; font-weight:700; cursor:pointer; transition:opacity 0.2s; }
    .af-save-btn:disabled { opacity:0.6; cursor:not-allowed; }
    .af-save-btn mat-icon { font-size:16px; width:16px; height:16px; }

    /* Fee rows */
    .fees-list { display:flex; flex-direction:column; }
    .fee-row { display:flex; align-items:center; justify-content:space-between; padding:11px 16px; border-bottom:1px solid #f5f5f5; transition:background 0.15s; }
    .fee-row:last-child { border-bottom:none; }
    .fee-row:hover { background:#fafbff; }
    .fee-row-left { display:flex; align-items:center; gap:10px; flex:1; min-width:0; }
    .fee-badge { display:flex; align-items:center; gap:5px; border-radius:8px; padding:4px 10px; font-size:0.8rem; font-weight:700; flex-shrink:0; }
    .fee-badge mat-icon { font-size:14px; width:14px; height:14px; }
    .ft-tuition  { background:#e3f2fd; color:#1565c0; }
    .ft-exam     { background:#f3e5f5; color:#6a1b9a; }
    .ft-library  { background:#e8f5e9; color:#2e7d32; }
    .ft-sports   { background:#fff8e1; color:#e65100; }
    .ft-transport{ background:#fce4ec; color:#880e4f; }
    .ft-other    { background:#f5f5f5; color:#555; }
    .fee-desc { font-size:0.78rem; color:#aaa; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .fee-row-right { display:flex; align-items:center; gap:8px; flex-shrink:0; }
    .fee-amount { font-size:1rem; font-weight:800; color:#1b5e20; min-width:80px; text-align:right; }
    .action-btn { width:30px; height:30px; border:none; border-radius:7px; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:background 0.2s; }
    .action-btn mat-icon { font-size:15px; width:15px; height:15px; }
    .action-btn.edit { background:#e8eaf6; color:#3f51b5; }
    .action-btn.edit:hover { background:#c5cae9; }
    .action-btn.del { background:#ffebee; color:#c62828; }
    .action-btn.del:hover { background:#ffcdd2; }

    /* Inline Edit */
    .inline-edit-row { display:flex; align-items:center; gap:8px; width:100%; flex-wrap:wrap; padding:4px 0; }
    .ie-select { border:1.5px solid #3f51b5; border-radius:7px; padding:6px 8px; font-size:0.82rem; outline:none; background:#f8f9ff; font-family:inherit; }
    .ie-amt { display:flex; align-items:center; border:1.5px solid #3f51b5; border-radius:7px; background:#f8f9ff; overflow:hidden; }
    .ie-amt span { padding:0 6px; color:#9e9e9e; font-size:0.82rem; font-weight:600; }
    .ie-amt input { border:none; outline:none; padding:6px 6px 6px 0; width:80px; font-size:0.85rem; background:transparent; font-family:inherit; }
    .ie-desc { flex:1; border:1.5px solid #3f51b5; border-radius:7px; padding:6px 10px; font-size:0.82rem; outline:none; background:#f8f9ff; font-family:inherit; min-width:80px; }
    .ie-actions { display:flex; gap:6px; }
    .ie-save { width:30px; height:30px; background:#1b5e20; color:#fff; border:none; border-radius:7px; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:background 0.2s; }
    .ie-save:hover { background:#2e7d32; }
    .ie-save:disabled { opacity:0.6; cursor:not-allowed; }
    .ie-cancel { width:30px; height:30px; background:#f5f5f5; color:#666; border:none; border-radius:7px; display:flex; align-items:center; justify-content:center; cursor:pointer; }
    .ie-save mat-icon, .ie-cancel mat-icon { font-size:16px; width:16px; height:16px; }

    /* Empty inside card */
    .cc-empty { display:flex; align-items:center; gap:8px; padding:16px 18px; color:#bbb; font-size:0.85rem; }
    .cc-empty mat-icon { font-size:18px; width:18px; height:18px; color:#e0e0e0; }
  `]
})
export class FeeStructureComponent implements OnInit {
  classes: any[] = [];
  classCards: ClassCard[] = [];
  loading = false;
  filterYear = '';

  // Inline edit state
  editingId: number | null = null;
  editForm = { feeType: '', amount: '', description: '' };
  editSaving = false;

  private api = 'http://localhost:8080/api/admin/fee';
  private adminApi = 'http://localhost:8080/api/admin';

  constructor(private http: HttpClient, private snack: MatSnackBar) {}

  ngOnInit() {
    const y = new Date().getFullYear();
    this.filterYear = `${y}-${String(y + 1).slice(2)}`;
    this.http.get<any[]>(`${this.adminApi}/classes`).subscribe(c => {
      this.classes = c;
      this.loadStructures();
    });
  }

  loadStructures() {
    this.loading = true;
    const params: any = {};
    if (this.filterYear) params.academicYear = this.filterYear;
    this.http.get<FeeRow[]>(`${this.api}/structures`, { params }).subscribe({
      next: rows => {
        this.buildCards(rows);
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  buildCards(rows: FeeRow[]) {
    const map = new Map<number, ClassCard>();
    rows.forEach(r => {
      if (!map.has(r.classId)) {
        map.set(r.classId, { classId: r.classId, className: r.className, fees: [], showAddForm: false, addForm: this.freshAddForm(), addSaving: false });
      }
      map.get(r.classId)!.fees.push(r);
    });
    // Sort by class name numerically
    this.classCards = Array.from(map.values()).sort((a, b) => +a.className - +b.className);
  }

  freshAddForm() {
    return { feeType: '', amount: '', description: '', academicYear: this.filterYear };
  }

  getClassesWithNoFee(): any[] {
    const ids = new Set(this.classCards.map(c => c.classId));
    return this.classes.filter(c => !ids.has(c.id));
  }

  initCard(c: any) {
    const card: ClassCard = { classId: c.id, className: c.className, fees: [], showAddForm: false, addForm: this.freshAddForm(), addSaving: false };
    this.classCards.push(card);
    this.classCards.sort((a, b) => +a.className - +b.className);
  }

  getCard(classId: number): ClassCard | undefined {
    return this.classCards.find(c => c.classId === classId);
  }

  toggleAddForm(card: ClassCard) {
    card.showAddForm = !card.showAddForm;
    if (card.showAddForm) {
      card.addForm = this.freshAddForm();
      this.cancelEdit();
    }
  }

  addFee(card: ClassCard) {
    const f = card.addForm;
    if (!f.feeType || !f.amount) {
      this.snack.open('Fee type and amount are required', 'Close', { duration: 3000 });
      return;
    }
    card.addSaving = true;
    this.http.post<FeeRow>(`${this.api}/structures`, {
      classId: card.classId,
      feeType: f.feeType,
      amount: f.amount,
      academicYear: this.filterYear || f.academicYear,
      description: f.description || ''
    }).subscribe({
      next: newRow => {
        card.fees.push(newRow);
        card.showAddForm = false;
        card.addForm = this.freshAddForm();
        card.addSaving = false;
        this.snack.open('Fee added!', 'Close', { duration: 2000 });
      },
      error: err => {
        card.addSaving = false;
        this.snack.open(err.error?.message || 'Error adding fee', 'Close', { duration: 3000 });
      }
    });
  }

  startInlineEdit(fee: FeeRow) {
    this.editingId = fee.id;
    this.editForm = { feeType: fee.feeType, amount: String(fee.amount), description: fee.description || '' };
  }

  cancelEdit() { this.editingId = null; }

  saveInlineEdit(id: number, card: ClassCard) {
    if (!this.editForm.feeType || !this.editForm.amount) {
      this.snack.open('Fee type and amount required', 'Close', { duration: 2500 });
      return;
    }
    this.editSaving = true;
    this.http.put<FeeRow>(`${this.api}/structures/${id}`, this.editForm).subscribe({
      next: updated => {
        const idx = card.fees.findIndex(f => f.id === id);
        if (idx >= 0) card.fees[idx] = updated;
        this.cancelEdit();
        this.editSaving = false;
        this.snack.open('Updated!', 'Close', { duration: 2000 });
      },
      error: err => {
        this.editSaving = false;
        this.snack.open(err.error?.message || 'Error updating', 'Close', { duration: 3000 });
      }
    });
  }

  deleteFee(id: number, card: ClassCard) {
    if (!confirm('Delete this fee?')) return;
    this.http.delete(`${this.api}/structures/${id}`).subscribe({
      next: () => {
        card.fees = card.fees.filter(f => f.id !== id);
        this.snack.open('Deleted.', 'Close', { duration: 2000 });
        // Remove card if no fees left
        if (card.fees.length === 0) {
          this.classCards = this.classCards.filter(c => c.classId !== card.classId);
        }
      },
      error: () => this.snack.open('Error deleting', 'Close', { duration: 2500 })
    });
  }

  getClassTotal(card: ClassCard): number {
    return card.fees.reduce((s, f) => s + (f.amount || 0), 0);
  }

  getTotalFeeTypes(): number {
    return this.classCards.reduce((s, c) => s + c.fees.length, 0);
  }

  getGrandTotal(): number {
    return this.classCards.reduce((s, c) => s + this.getClassTotal(c), 0);
  }

  getFeeLabel(type: string): string {
    const m: any = { TUITION: 'Tuition', EXAM: 'Exam', LIBRARY: 'Library', SPORTS: 'Sports', TRANSPORT: 'Transport', OTHER: 'Other' };
    return m[type] || type;
  }

  getFeeIcon(type: string): string {
    const m: any = { TUITION: 'school', EXAM: 'assignment', LIBRARY: 'menu_book', SPORTS: 'sports_soccer', TRANSPORT: 'directions_bus', OTHER: 'label' };
    return m[type] || 'label';
  }
}
