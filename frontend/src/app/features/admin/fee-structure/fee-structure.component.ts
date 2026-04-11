import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-fee-structure',
  standalone: true,
  imports: [CommonModule, FormsModule, MatSnackBarModule, MatIconModule,
    MatSelectModule, MatFormFieldModule, MatInputModule, MatButtonModule,
    MatTooltipModule, NavbarComponent],
  template: `
    <app-navbar></app-navbar>
    <div class="page-container">

      <!-- Header -->
      <div class="pg-header">
        <div>
          <h1 class="pg-title"><mat-icon>account_balance</mat-icon> Fee Structure Management</h1>
          <p class="pg-sub">Define fee amounts per class and academic year</p>
        </div>
      </div>

      <!-- Filters -->
      <div class="filter-row">
        <div class="filter-box">
          <mat-icon>class</mat-icon>
          <select [(ngModel)]="selectedClassId" (change)="onFilterChange()">
            <option value="">All Classes</option>
            <option *ngFor="let c of classes" [value]="c.id">Class {{ c.className }}</option>
          </select>
        </div>
        <div class="filter-box">
          <mat-icon>calendar_today</mat-icon>
          <input type="text" [(ngModel)]="filterYear" placeholder="e.g. 2025-26" (change)="onFilterChange()">
        </div>
        <button class="add-btn" (click)="showForm = !showForm">
          <mat-icon>{{ showForm ? 'close' : 'add' }}</mat-icon>
          {{ showForm ? 'Cancel' : 'Add Fee Structure' }}
        </button>
      </div>

      <!-- Add Form -->
      <div class="form-card" *ngIf="showForm">
        <h3 class="form-title">{{ editId ? 'Edit Fee Structure' : 'Add New Fee Structure' }}</h3>
        <div class="form-grid">
          <div class="field-group">
            <label>Class *</label>
            <select [(ngModel)]="form.classId">
              <option value="">Select Class</option>
              <option *ngFor="let c of classes" [value]="c.id">Class {{ c.className }}</option>
            </select>
          </div>
          <div class="field-group">
            <label>Fee Type *</label>
            <select [(ngModel)]="form.feeType">
              <option value="">Select Type</option>
              <option value="TUITION">Tuition Fee</option>
              <option value="EXAM">Exam Fee</option>
              <option value="LIBRARY">Library Fee</option>
              <option value="SPORTS">Sports Fee</option>
              <option value="TRANSPORT">Transport Fee</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div class="field-group">
            <label>Amount (&#8377;) *</label>
            <input type="number" [(ngModel)]="form.amount" placeholder="e.g. 5000">
          </div>
          <div class="field-group">
            <label>Academic Year *</label>
            <input type="text" [(ngModel)]="form.academicYear" placeholder="e.g. 2025-26">
          </div>
          <div class="field-group full-span">
            <label>Description</label>
            <input type="text" [(ngModel)]="form.description" placeholder="Optional description">
          </div>
        </div>
        <div class="form-actions">
          <button class="save-btn" (click)="saveStructure()" [disabled]="saving">
            <mat-icon>{{ saving ? 'hourglass_empty' : 'save' }}</mat-icon>
            {{ saving ? 'Saving...' : (editId ? 'Update' : 'Save') }}
          </button>
          <button class="cancel-btn" (click)="cancelEdit()">Cancel</button>
        </div>
      </div>

      <!-- Stats Summary -->
      <div class="stats-row" *ngIf="structures.length > 0">
        <div class="stat-pill">
          <mat-icon>list</mat-icon>
          <span>{{ structures.length }} fee type(s)</span>
        </div>
        <div class="stat-pill total">
          <mat-icon>currency_rupee</mat-icon>
          <span>Total: &#8377;{{ getTotalAmount() | number }}</span>
        </div>
      </div>

      <!-- Fee Structure Table -->
      <div class="table-card">
        <div *ngIf="loading" class="loading">Loading fee structures...</div>
        <div *ngIf="!loading && structures.length === 0" class="empty">
          <mat-icon>account_balance_wallet</mat-icon>
          <p>No fee structures found. Add one above.</p>
        </div>
        <table *ngIf="!loading && structures.length > 0" class="fee-table">
          <thead>
            <tr>
              <th>Class</th>
              <th>Fee Type</th>
              <th>Description</th>
              <th>Academic Year</th>
              <th>Amount (&#8377;)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let s of structures">
              <td><span class="class-badge">Class {{ s.className }}</span></td>
              <td><span class="fee-type-badge" [ngClass]="'ft-' + s.feeType.toLowerCase()">{{ getFeeLabel(s.feeType) }}</span></td>
              <td class="desc-col">{{ s.description || '—' }}</td>
              <td>{{ s.academicYear }}</td>
              <td class="amount-col">&#8377;{{ s.amount | number:'1.0-0' }}</td>
              <td>
                <div class="row-actions">
                  <button class="edit-btn" (click)="startEdit(s)" matTooltip="Edit">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button class="del-btn" (click)="deleteStructure(s.id)" matTooltip="Delete">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding:28px; max-width:1200px; margin:0 auto; animation:fadeInUp 0.35s ease both; }
    @keyframes fadeInUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }

    .pg-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; }
    .pg-title { display:flex; align-items:center; gap:10px; font-size:1.7rem; font-weight:800; color:#1a237e; margin:0 0 4px; }
    .pg-title mat-icon { font-size:28px; width:28px; height:28px; color:#3f51b5; }
    .pg-sub { color:#888; margin:0; font-size:0.9rem; }

    /* Filters */
    .filter-row { display:flex; gap:12px; align-items:center; margin-bottom:20px; flex-wrap:wrap; }
    .filter-box { display:flex; align-items:center; gap:8px; background:#fff; border:1.5px solid #e0e0e0; border-radius:10px; padding:8px 14px; }
    .filter-box mat-icon { color:#9e9e9e; font-size:18px; }
    .filter-box select, .filter-box input { border:none; outline:none; font-size:0.9rem; color:#333; background:transparent; min-width:140px; }
    .add-btn { display:flex; align-items:center; gap:6px; background:linear-gradient(135deg,#1a237e,#5c6bc0); color:#fff; border:none; border-radius:10px; padding:10px 20px; font-size:0.9rem; font-weight:700; cursor:pointer; transition:opacity 0.2s,transform 0.15s; margin-left:auto; }
    .add-btn:hover { opacity:0.9; transform:translateY(-1px); }
    .add-btn mat-icon { font-size:18px; }

    /* Form */
    .form-card { background:#fff; border-radius:16px; padding:24px; margin-bottom:20px; box-shadow:0 4px 20px rgba(0,0,0,0.08); border-left:4px solid #3f51b5; }
    .form-title { font-size:1rem; font-weight:700; color:#1a237e; margin:0 0 20px; }
    .form-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); gap:16px; margin-bottom:20px; }
    .full-span { grid-column:1/-1; }
    .field-group { display:flex; flex-direction:column; gap:6px; }
    label { font-size:0.8rem; font-weight:600; color:#555; }
    .field-group select, .field-group input {
      border:1.5px solid #e0e0e0; border-radius:8px; padding:9px 12px;
      font-size:0.9rem; color:#333; outline:none; transition:border-color 0.2s;
      background:#fafafa; font-family:inherit;
    }
    .field-group select:focus, .field-group input:focus { border-color:#3f51b5; background:#fff; }
    .form-actions { display:flex; gap:12px; }
    .save-btn { display:flex; align-items:center; gap:6px; background:linear-gradient(135deg,#1a237e,#5c6bc0); color:#fff; border:none; border-radius:10px; padding:10px 22px; font-size:0.9rem; font-weight:700; cursor:pointer; transition:opacity 0.2s; }
    .save-btn:disabled { opacity:0.6; cursor:not-allowed; }
    .cancel-btn { background:#f5f5f5; color:#666; border:none; border-radius:10px; padding:10px 18px; font-size:0.9rem; cursor:pointer; }
    .save-btn mat-icon { font-size:16px; }

    /* Stats */
    .stats-row { display:flex; gap:12px; margin-bottom:16px; flex-wrap:wrap; }
    .stat-pill { display:flex; align-items:center; gap:6px; background:#e8eaf6; border-radius:20px; padding:6px 14px; font-size:0.85rem; font-weight:600; color:#3f51b5; }
    .stat-pill.total { background:#e8f5e9; color:#2e7d32; }
    .stat-pill mat-icon { font-size:16px; width:16px; height:16px; }

    /* Table */
    .table-card { background:#fff; border-radius:16px; box-shadow:0 2px 12px rgba(0,0,0,0.07); overflow:hidden; }
    .fee-table { width:100%; border-collapse:collapse; }
    .fee-table th { background:#f8f9ff; padding:12px 16px; text-align:left; font-size:0.78rem; font-weight:700; color:#3f51b5; text-transform:uppercase; letter-spacing:0.5px; border-bottom:2px solid #e8eaf6; }
    .fee-table td { padding:12px 16px; font-size:0.9rem; color:#444; border-bottom:1px solid #f5f5f5; }
    .fee-table tr:last-child td { border-bottom:none; }
    .fee-table tr:hover td { background:#fafeff; }
    .class-badge { background:#e8eaf6; color:#3f51b5; border-radius:8px; padding:3px 10px; font-size:0.82rem; font-weight:600; }
    .fee-type-badge { border-radius:8px; padding:3px 10px; font-size:0.8rem; font-weight:600; }
    .ft-tuition  { background:#e3f2fd; color:#1565c0; }
    .ft-exam     { background:#f3e5f5; color:#6a1b9a; }
    .ft-library  { background:#e8f5e9; color:#2e7d32; }
    .ft-sports   { background:#fff8e1; color:#e65100; }
    .ft-transport{ background:#fce4ec; color:#880e4f; }
    .ft-other    { background:#f5f5f5; color:#555; }
    .amount-col  { font-weight:700; color:#2e7d32; font-size:1rem; }
    .desc-col    { color:#888; font-size:0.85rem; }
    .row-actions { display:flex; gap:6px; }
    .edit-btn { background:#e8eaf6; color:#3f51b5; border:none; border-radius:8px; width:32px; height:32px; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:background 0.2s; }
    .edit-btn:hover { background:#c5cae9; }
    .del-btn { background:#ffebee; color:#c62828; border:none; border-radius:8px; width:32px; height:32px; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:background 0.2s; }
    .del-btn:hover { background:#ffcdd2; }
    .edit-btn mat-icon, .del-btn mat-icon { font-size:16px; width:16px; height:16px; }

    .loading { padding:40px; text-align:center; color:#999; }
    .empty { padding:48px; text-align:center; color:#bbb; }
    .empty mat-icon { font-size:48px; height:48px; width:48px; display:block; margin:0 auto 10px; }
  `]
})
export class FeeStructureComponent implements OnInit {
  classes: any[] = [];
  structures: any[] = [];
  loading = false;
  showForm = false;
  saving = false;
  editId: number | null = null;
  selectedClassId = '';
  filterYear = '';

  form = { classId: '', feeType: '', amount: '', academicYear: '', description: '' };

  private api = 'http://localhost:8080/api/admin/fee';
  private adminApi = 'http://localhost:8080/api/admin';

  constructor(private http: HttpClient, private snack: MatSnackBar) {}

  ngOnInit() {
    this.http.get<any[]>(`${this.adminApi}/classes`).subscribe(c => {
      this.classes = c;
      // Set default year
      const y = new Date().getFullYear();
      this.filterYear = `${y}-${String(y+1).slice(2)}`;
      this.form.academicYear = this.filterYear;
      this.loadStructures();
    });
  }

  onFilterChange() { this.loadStructures(); }

  loadStructures() {
    this.loading = true;
    let url = `${this.api}/structures`;
    if (this.selectedClassId) url = `${this.api}/structures/class/${this.selectedClassId}`;
    const params: any = {};
    if (this.filterYear) params.academicYear = this.filterYear;
    this.http.get<any[]>(url, { params }).subscribe({
      next: s => { this.structures = s; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  getTotalAmount(): number {
    return this.structures.reduce((s, f) => s + (f.amount || 0), 0);
  }

  getFeeLabel(type: string): string {
    const labels: any = { TUITION:'Tuition', EXAM:'Exam', LIBRARY:'Library', SPORTS:'Sports', TRANSPORT:'Transport', OTHER:'Other' };
    return labels[type] || type;
  }

  saveStructure() {
    if (!this.form.classId || !this.form.feeType || !this.form.amount || !this.form.academicYear) {
      this.snack.open('Please fill all required fields', 'Close', { duration: 3000 });
      return;
    }
    this.saving = true;
    const req = this.editId
      ? this.http.put(`${this.api}/structures/${this.editId}`, this.form)
      : this.http.post(`${this.api}/structures`, this.form);
    req.subscribe({
      next: () => {
        this.snack.open(this.editId ? 'Updated!' : 'Fee structure added!', 'Close', { duration: 2500 });
        this.saving = false;
        this.cancelEdit();
        this.loadStructures();
      },
      error: (err) => {
        this.saving = false;
        this.snack.open(err.error?.message || 'Error saving', 'Close', { duration: 3000 });
      }
    });
  }

  startEdit(s: any) {
    this.editId = s.id;
    this.form = { classId: s.classId, feeType: s.feeType, amount: s.amount, academicYear: s.academicYear, description: s.description || '' };
    this.showForm = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelEdit() {
    this.editId = null;
    this.showForm = false;
    const y = new Date().getFullYear();
    this.form = { classId: '', feeType: '', amount: '', academicYear: `${y}-${String(y+1).slice(2)}`, description: '' };
  }

  deleteStructure(id: number) {
    if (!confirm('Delete this fee structure?')) return;
    this.http.delete(`${this.api}/structures/${id}`).subscribe({
      next: () => { this.snack.open('Deleted.', 'Close', { duration: 2000 }); this.loadStructures(); },
      error: () => this.snack.open('Error deleting', 'Close', { duration: 2500 })
    });
  }
}
