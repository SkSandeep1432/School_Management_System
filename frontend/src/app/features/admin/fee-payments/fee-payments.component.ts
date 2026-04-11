import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-fee-payments',
  standalone: true,
  imports: [CommonModule, FormsModule, MatSnackBarModule, MatIconModule,
    MatTabsModule, MatTooltipModule, NavbarComponent],
  template: `
    <app-navbar></app-navbar>
    <div class="page-container">

      <div class="pg-header">
        <div>
          <h1 class="pg-title"><mat-icon>payments</mat-icon> Fee Payments</h1>
          <p class="pg-sub">Record payments, view balances and generate receipts</p>
        </div>
        <div class="year-filter">
          <mat-icon>calendar_today</mat-icon>
          <input type="text" [(ngModel)]="academicYear" placeholder="Year e.g. 2025-26" (change)="onYearChange()">
        </div>
      </div>

      <mat-tab-group class="main-tabs" animationDuration="200ms" [(selectedIndex)]="selectedTabIndex">

        <!-- TAB 1: Record Payment -->
        <mat-tab label="Record Payment">
          <div class="tab-content">

            <!-- Search Student -->
            <div class="search-card">
              <h3 class="card-title"><mat-icon>search</mat-icon> Search Student</h3>
              <div class="search-row">
                <div class="search-input-wrap">
                  <mat-icon>person_search</mat-icon>
                  <input [(ngModel)]="searchQuery" placeholder="Search by name or roll number..." (input)="filterStudents()">
                </div>
                <div class="class-filter-wrap">
                  <mat-icon>class</mat-icon>
                  <select [(ngModel)]="searchClass" (change)="filterStudents()">
                    <option value="">All Classes</option>
                    <option *ngFor="let c of classes" [value]="c.className">Class {{ c.className }}</option>
                  </select>
                </div>
              </div>
              <div class="student-results" *ngIf="filteredStudents.length > 0 && !selectedStudent">
                <div class="student-result-item" *ngFor="let s of filteredStudents | slice:0:8" (click)="selectStudent(s)">
                  <div class="sr-avatar">{{ s.fullName.charAt(0) }}</div>
                  <div class="sr-info">
                    <div class="sr-name">{{ s.fullName }}</div>
                    <div class="sr-meta">Roll: {{ s.rollNumber }} &middot; Class {{ s.className }}{{ s.sectionName }}</div>
                  </div>
                  <div class="sr-status" [ngClass]="'st-' + s.status.toLowerCase()">{{ s.status }}</div>
                </div>
              </div>
            </div>

            <!-- Selected Student Card -->
            <div class="student-detail-card" *ngIf="selectedStudent">
              <div class="sd-header">
                <div class="sd-avatar">{{ selectedStudent.fullName.charAt(0) }}</div>
                <div class="sd-info">
                  <div class="sd-name">{{ selectedStudent.fullName }}</div>
                  <div class="sd-meta">Roll: {{ selectedStudent.rollNumber }} &middot; Class {{ selectedStudent.className }}{{ selectedStudent.sectionName }}</div>
                </div>
                <button class="change-btn" (click)="clearStudent()"><mat-icon>close</mat-icon> Change</button>
              </div>

              <!-- Fee Summary Boxes -->
              <div class="fee-summary-boxes">
                <div class="fee-box fb-due">
                  <mat-icon>receipt_long</mat-icon>
                  <div class="fb-num">&#8377;{{ selectedStudent.totalDue | number:'1.0-0' }}</div>
                  <div class="fb-lbl">Total Due</div>
                </div>
                <div class="fee-box fb-paid">
                  <mat-icon>check_circle</mat-icon>
                  <div class="fb-num">&#8377;{{ selectedStudent.totalPaid | number:'1.0-0' }}</div>
                  <div class="fb-lbl">Total Paid</div>
                </div>
                <div class="fee-box" [ngClass]="selectedStudent.balance > 0 ? 'fb-balance' : 'fb-clear'">
                  <mat-icon>{{ selectedStudent.balance > 0 ? 'warning' : 'task_alt' }}</mat-icon>
                  <div class="fb-num">&#8377;{{ (selectedStudent.balance > 0 ? selectedStudent.balance : selectedStudent.totalPaid) | number:'1.0-0' }}</div>
                  <div class="fb-lbl">{{ selectedStudent.balance > 0 ? 'Balance Due' : 'Fully Paid' }}</div>
                </div>
                <div class="fee-box fb-status">
                  <mat-icon>{{ getStatusIcon(selectedStudent.status) }}</mat-icon>
                  <div class="fb-num status-text" [ngClass]="'st-' + selectedStudent.status.toLowerCase()">{{ selectedStudent.status }}</div>
                  <div class="fb-lbl">Payment Status</div>
                </div>
              </div>

              <!-- Fee Structure Breakdown -->
              <div class="fee-breakdown" *ngIf="selectedStudent.feeStructures?.length > 0 || selectedStudent.carryForwards?.length > 0">
                <h4 class="breakdown-title">Fee Breakdown</h4>
                <div class="breakdown-list">
                  <div class="breakdown-item" *ngFor="let fs of selectedStudent.feeStructures">
                    <span class="fee-type-chip ft-{{ fs.feeType.toLowerCase() }}">{{ getFeeLabel(fs.feeType) }}</span>
                    <span class="breakdown-amt">&#8377;{{ fs.amount | number:'1.0-0' }}</span>
                  </div>
                  <!-- Carry-forward rows -->
                  <div class="breakdown-item carry-fwd" *ngFor="let cf of selectedStudent.carryForwards">
                    <span class="fee-type-chip ft-carry">
                      <mat-icon style="font-size:13px;width:13px;height:13px;vertical-align:middle">history</mat-icon>
                      Previous Balance ({{ cf.fromAcademicYear }})
                    </span>
                    <span class="breakdown-amt carry-amt">&#8377;{{ cf.amount | number:'1.0-0' }}</span>
                  </div>
                  <!-- Total row if carry-forward exists -->
                  <div class="breakdown-total" *ngIf="selectedStudent.carryForwards?.length > 0">
                    <span>Total Due (incl. carry forward)</span>
                    <strong>&#8377;{{ selectedStudent.totalDue | number:'1.0-0' }}</strong>
                  </div>
                </div>
              </div>

              <!-- Payment Form -->
              <div class="payment-form" *ngIf="selectedStudent.balance > 0">
                <h4 class="pay-form-title"><mat-icon>add_card</mat-icon> Record New Payment</h4>
                <div class="pay-grid">
                  <div class="field-group">
                    <label>Amount (&#8377;) *</label>
                    <div class="pay-input-wrap"><span>&#8377;</span><input type="number" [(ngModel)]="payForm.amount" placeholder="Enter amount" [max]="selectedStudent.balance"></div>
                    <span class="hint">Balance: &#8377;{{ selectedStudent.balance | number:'1.0-0' }}</span>
                  </div>
                  <div class="field-group">
                    <label>Payment Date *</label>
                    <input type="date" [(ngModel)]="payForm.paymentDate">
                  </div>
                  <div class="field-group">
                    <label>Payment Mode *</label>
                    <select [(ngModel)]="payForm.paymentMode">
                      <option value="">Select Mode</option>
                      <option value="CASH">Cash</option>
                      <option value="UPI">UPI</option>
                      <option value="ONLINE">Online Transfer</option>
                      <option value="CHEQUE">Cheque</option>
                    </select>
                  </div>
                  <div class="field-group">
                    <label>Notes</label>
                    <input type="text" [(ngModel)]="payForm.notes" placeholder="Optional notes">
                  </div>
                </div>
                <button class="pay-btn" (click)="recordPayment()" [disabled]="paying">
                  <mat-icon>payment</mat-icon>
                  {{ paying ? 'Processing...' : 'Record Payment &amp; Generate Receipt' }}
                </button>
              </div>

              <div class="fully-paid-banner" *ngIf="selectedStudent.balance <= 0 && selectedStudent.totalDue > 0">
                <mat-icon>task_alt</mat-icon> All fees paid for this academic year!
              </div>

              <!-- Payment History -->
              <div class="payment-history" *ngIf="selectedStudent.paymentHistory?.length > 0">
                <h4 class="history-title"><mat-icon>history</mat-icon> Payment History</h4>
                <div class="history-list">
                  <div class="history-item" *ngFor="let p of selectedStudent.paymentHistory">
                    <div class="hi-left">
                      <div class="hi-icon"><mat-icon>receipt</mat-icon></div>
                      <div class="hi-info">
                        <div class="hi-receipt">{{ p.receiptNumber }}</div>
                        <div class="hi-meta">{{ p.paymentDate | date:'dd MMM yyyy' }} &middot; {{ p.paymentMode }}</div>
                      </div>
                    </div>
                    <div class="hi-right">
                      <div class="hi-amount">&#8377;{{ p.amount | number:'1.0-0' }}</div>
                      <button class="del-pay-btn" (click)="deletePayment(p.id)" matTooltip="Delete payment">
                        <mat-icon>delete</mat-icon>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Receipt Modal -->
            <div class="receipt-overlay" *ngIf="receipt" (click)="receipt = null">
              <div class="receipt-card" (click)="$event.stopPropagation()">
                <div class="receipt-header">
                  <mat-icon>receipt_long</mat-icon>
                  <h3>Payment Receipt</h3>
                </div>
                <div class="receipt-body">
                  <div class="receipt-school">School Administration System</div>
                  <div class="receipt-number">Receipt No: <strong>{{ receipt.receiptNumber }}</strong></div>
                  <div class="receipt-divider"></div>
                  <div class="receipt-row"><span>Student Name</span><span>{{ receipt.studentName }}</span></div>
                  <div class="receipt-row"><span>Roll Number</span><span>{{ receipt.rollNumber }}</span></div>
                  <div class="receipt-row"><span>Class</span><span>Class {{ receipt.className }}</span></div>
                  <div class="receipt-row"><span>Academic Year</span><span>{{ receipt.academicYear }}</span></div>
                  <div class="receipt-row"><span>Payment Date</span><span>{{ receipt.paymentDate | date:'dd MMM yyyy' }}</span></div>
                  <div class="receipt-row"><span>Payment Mode</span><span>{{ receipt.paymentMode }}</span></div>
                  <div class="receipt-divider"></div>
                  <div class="receipt-row total"><span>Amount Paid</span><span>&#8377;{{ receipt.amount | number:'1.0-0' }}</span></div>
                </div>
                <div class="receipt-footer">
                  <button class="print-btn" (click)="printReceipt()"><mat-icon>print</mat-icon> Print</button>
                  <button class="close-receipt-btn" (click)="receipt = null">Close</button>
                </div>
              </div>
            </div>

          </div>
        </mat-tab>

        <!-- TAB 2: All Students Summary -->
        <mat-tab label="All Students Summary">
          <div class="tab-content">
            <div class="summary-toolbar">
              <div class="summary-stats">
                <div class="ss-pill paid"><mat-icon>check_circle</mat-icon> Paid: {{ getSummaryCount('PAID') }}</div>
                <div class="ss-pill partial"><mat-icon>hourglass_bottom</mat-icon> Partial: {{ getSummaryCount('PARTIAL') }}</div>
                <div class="ss-pill unpaid"><mat-icon>cancel</mat-icon> Unpaid: {{ getSummaryCount('UNPAID') }}</div>
                <div class="ss-pill total-col"><mat-icon>currency_rupee</mat-icon> Collected: &#8377;{{ getTotalCollected() | number:'1.0-0' }}</div>
              </div>
              <div class="summary-search">
                <mat-icon>search</mat-icon>
                <input [(ngModel)]="summarySearch" placeholder="Search student...">
              </div>
            </div>

            <div *ngIf="summaryLoading" class="loading">Loading students...</div>

            <div class="summary-table-wrap" *ngIf="!summaryLoading">
              <table class="summary-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Class</th>
                    <th>Total Due</th>
                    <th>Paid</th>
                    <th>Balance</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let s of getFilteredSummary()" (click)="jumpToPayment(s)" class="summary-row">
                    <td>
                      <div class="stu-cell">
                        <div class="stu-avatar">{{ s.fullName.charAt(0) }}</div>
                        <div>
                          <div class="stu-name">{{ s.fullName }}</div>
                          <div class="stu-roll">{{ s.rollNumber }}</div>
                        </div>
                      </div>
                    </td>
                    <td><span class="class-badge">{{ s.className }}{{ s.sectionName }}</span></td>
                    <td class="amt-col">&#8377;{{ s.totalDue | number:'1.0-0' }}</td>
                    <td class="amt-paid">&#8377;{{ s.totalPaid | number:'1.0-0' }}</td>
                    <td class="amt-balance" [class.zero]="s.balance === 0">&#8377;{{ s.balance | number:'1.0-0' }}</td>
                    <td><span class="status-badge" [ngClass]="'sb-' + s.status.toLowerCase()">{{ s.status }}</span></td>
                    <td>
                      <button class="view-btn" (click)="$event.stopPropagation(); jumpToPayment(s)">
                        <mat-icon>chevron_right</mat-icon>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </mat-tab>

      </mat-tab-group>
    </div>
  `,
  styles: [`
    .page-container { padding:28px; max-width:1200px; margin:0 auto; animation:fadeInUp 0.35s ease both; }
    @keyframes fadeInUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }

    .pg-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; flex-wrap:wrap; gap:12px; }
    .pg-title { display:flex; align-items:center; gap:10px; font-size:1.7rem; font-weight:800; color:#1a237e; margin:0 0 4px; }
    .pg-title mat-icon { font-size:28px; width:28px; height:28px; color:#3f51b5; }
    .pg-sub { color:#888; margin:0; font-size:0.9rem; }
    .year-filter { display:flex; align-items:center; gap:8px; background:#fff; border:1.5px solid #e0e0e0; border-radius:10px; padding:8px 14px; }
    .year-filter mat-icon { color:#9e9e9e; font-size:18px; }
    .year-filter input { border:none; outline:none; font-size:0.9rem; width:130px; }

    .main-tabs { background:#fff; border-radius:16px; box-shadow:0 2px 12px rgba(0,0,0,0.08); }
    .tab-content { padding:24px; }

    /* Search */
    .search-card { background:#f8f9ff; border-radius:14px; padding:20px; margin-bottom:20px; border:1.5px solid #e8eaf6; }
    .card-title { display:flex; align-items:center; gap:8px; font-size:1rem; font-weight:700; color:#1a237e; margin:0 0 16px; }
    .card-title mat-icon { font-size:18px; }
    .search-row { display:flex; gap:12px; flex-wrap:wrap; }
    .search-input-wrap, .class-filter-wrap { display:flex; align-items:center; gap:8px; background:#fff; border:1.5px solid #e0e0e0; border-radius:10px; padding:8px 14px; }
    .search-input-wrap { flex:1; min-width:200px; }
    .search-input-wrap mat-icon, .class-filter-wrap mat-icon { color:#9e9e9e; font-size:18px; flex-shrink:0; }
    .search-input-wrap input { border:none; outline:none; flex:1; font-size:0.9rem; }
    .class-filter-wrap select { border:none; outline:none; font-size:0.9rem; min-width:130px; }
    .student-results { margin-top:14px; display:flex; flex-direction:column; gap:6px; }
    .student-result-item { display:flex; align-items:center; gap:12px; padding:10px 14px; background:#fff; border-radius:10px; border:1px solid #e8eaf6; cursor:pointer; transition:background 0.15s; }
    .student-result-item:hover { background:#e8eaf6; }
    .sr-avatar { width:36px; height:36px; border-radius:50%; background:linear-gradient(135deg,#3f51b5,#7986cb); color:#fff; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:0.9rem; flex-shrink:0; }
    .sr-info { flex:1; }
    .sr-name { font-size:0.9rem; font-weight:600; color:#212121; }
    .sr-meta { font-size:0.78rem; color:#888; }
    .sr-status { font-size:0.72rem; font-weight:700; border-radius:8px; padding:2px 8px; }

    /* Student Detail Card */
    .student-detail-card { background:#fff; border-radius:16px; box-shadow:0 4px 20px rgba(0,0,0,0.08); overflow:hidden; }
    .sd-header { display:flex; align-items:center; gap:16px; padding:20px 24px; background:linear-gradient(135deg,#1a237e,#3f51b5); }
    .sd-avatar { width:52px; height:52px; border-radius:50%; background:rgba(255,255,255,0.25); color:#fff; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:1.2rem; flex-shrink:0; }
    .sd-info { flex:1; }
    .sd-name { color:#fff; font-size:1.1rem; font-weight:700; }
    .sd-meta { color:rgba(255,255,255,0.75); font-size:0.85rem; margin-top:2px; }
    .change-btn { display:flex; align-items:center; gap:4px; background:rgba(255,255,255,0.2); color:#fff; border:1px solid rgba(255,255,255,0.3); border-radius:8px; padding:6px 12px; font-size:0.82rem; cursor:pointer; }
    .change-btn mat-icon { font-size:16px; }

    /* Fee Summary Boxes */
    .fee-summary-boxes { display:grid; grid-template-columns:repeat(auto-fit,minmax(150px,1fr)); gap:0; }
    .fee-box { display:flex; flex-direction:column; align-items:center; padding:20px 16px; border-right:1px solid #f0f0f0; text-align:center; }
    .fee-box:last-child { border-right:none; }
    .fee-box mat-icon { font-size:24px; width:24px; height:24px; margin-bottom:8px; }
    .fb-num { font-size:1.4rem; font-weight:800; margin-bottom:4px; }
    .fb-lbl { font-size:0.75rem; color:#999; font-weight:500; }
    .fb-due mat-icon { color:#3f51b5; } .fb-due .fb-num { color:#1a237e; }
    .fb-paid mat-icon { color:#2e7d32; } .fb-paid .fb-num { color:#1b5e20; }
    .fb-balance mat-icon { color:#e65100; } .fb-balance .fb-num { color:#bf360c; }
    .fb-clear mat-icon { color:#2e7d32; } .fb-clear .fb-num { color:#2e7d32; }
    .fb-status mat-icon { color:#888; }
    .status-text { font-size:1rem !important; }

    /* Fee Breakdown */
    .fee-breakdown { padding:16px 24px; background:#fafafa; border-bottom:1px solid #f0f0f0; }
    .breakdown-title { font-size:0.85rem; font-weight:700; color:#555; margin:0 0 10px; }
    .breakdown-list { display:flex; flex-wrap:wrap; gap:8px; }
    .breakdown-item { display:flex; align-items:center; gap:8px; background:#fff; border:1px solid #e0e0e0; border-radius:8px; padding:6px 12px; }
    .fee-type-chip { border-radius:6px; padding:2px 8px; font-size:0.78rem; font-weight:600; }
    .breakdown-amt { font-weight:700; color:#1a237e; font-size:0.9rem; }
    .ft-tuition { background:#e3f2fd; color:#1565c0; }
    .ft-exam { background:#f3e5f5; color:#6a1b9a; }
    .ft-library { background:#e8f5e9; color:#2e7d32; }
    .ft-sports { background:#fff8e1; color:#e65100; }
    .ft-transport { background:#fce4ec; color:#880e4f; }
    .ft-other { background:#f5f5f5; color:#555; }
    .ft-carry { background:#fff3e0; color:#e65100; display:flex; align-items:center; gap:4px; }
    .carry-fwd { border:1px dashed #ffb74d !important; background:#fff8f0 !important; }
    .carry-amt { color:#bf360c !important; }
    .breakdown-total { display:flex; justify-content:space-between; align-items:center; width:100%; padding:8px 12px; background:#e8eaf6; border-radius:8px; border:1.5px solid #c5cae9; font-size:0.88rem; color:#1a237e; }

    /* Payment Form */
    .payment-form { padding:20px 24px; border-bottom:1px solid #f0f0f0; }
    .pay-form-title { display:flex; align-items:center; gap:8px; font-size:0.95rem; font-weight:700; color:#1a237e; margin:0 0 16px; }
    .pay-form-title mat-icon { font-size:18px; }
    .pay-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(180px,1fr)); gap:14px; margin-bottom:16px; }
    .field-group { display:flex; flex-direction:column; gap:5px; }
    label { font-size:0.78rem; font-weight:600; color:#555; }
    .field-group input, .field-group select {
      border:1.5px solid #e0e0e0; border-radius:8px; padding:8px 12px;
      font-size:0.9rem; outline:none; background:#fafafa; font-family:inherit;
      transition:border-color 0.2s;
    }
    .field-group input:focus, .field-group select:focus { border-color:#3f51b5; background:#fff; }
    .pay-input-wrap { display:flex; align-items:center; border:1.5px solid #e0e0e0; border-radius:8px; background:#fafafa; overflow:hidden; }
    .pay-input-wrap span { padding:0 10px; color:#888; font-weight:600; }
    .pay-input-wrap input { border:none; background:transparent; padding:8px 8px 8px 0; flex:1; font-size:0.9rem; outline:none; font-family:inherit; }
    .hint { font-size:0.75rem; color:#e65100; }
    .pay-btn { display:flex; align-items:center; gap:8px; background:linear-gradient(135deg,#1b5e20,#43a047); color:#fff; border:none; border-radius:10px; padding:12px 24px; font-size:0.9rem; font-weight:700; cursor:pointer; transition:opacity 0.2s; }
    .pay-btn:disabled { opacity:0.6; cursor:not-allowed; }
    .pay-btn mat-icon { font-size:18px; }
    .fully-paid-banner { margin:20px 24px; background:#e8f5e9; border-radius:10px; padding:14px 18px; color:#1b5e20; display:flex; align-items:center; gap:8px; font-weight:600; }

    /* Payment History */
    .payment-history { padding:20px 24px; }
    .history-title { display:flex; align-items:center; gap:8px; font-size:0.95rem; font-weight:700; color:#1a237e; margin:0 0 14px; }
    .history-title mat-icon { font-size:18px; }
    .history-list { display:flex; flex-direction:column; gap:8px; }
    .history-item { display:flex; justify-content:space-between; align-items:center; background:#f8f9ff; border-radius:10px; padding:12px 14px; border:1px solid #e8eaf6; }
    .hi-left { display:flex; align-items:center; gap:12px; }
    .hi-icon { width:36px; height:36px; background:#e8eaf6; border-radius:10px; display:flex; align-items:center; justify-content:center; }
    .hi-icon mat-icon { font-size:18px; color:#3f51b5; }
    .hi-receipt { font-size:0.88rem; font-weight:700; color:#1a237e; }
    .hi-meta { font-size:0.78rem; color:#888; margin-top:2px; }
    .hi-right { display:flex; align-items:center; gap:10px; }
    .hi-amount { font-size:1rem; font-weight:800; color:#1b5e20; }
    .del-pay-btn { background:#ffebee; color:#c62828; border:none; border-radius:6px; width:28px; height:28px; display:flex; align-items:center; justify-content:center; cursor:pointer; }
    .del-pay-btn mat-icon { font-size:14px; width:14px; height:14px; }

    /* Receipt */
    .receipt-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.55); z-index:2000; display:flex; align-items:center; justify-content:center; padding:16px; }
    .receipt-card { background:#fff; border-radius:16px; width:100%; max-width:420px; overflow:hidden; box-shadow:0 20px 60px rgba(0,0,0,0.3); }
    .receipt-header { background:linear-gradient(135deg,#1a237e,#3f51b5); padding:20px; display:flex; align-items:center; gap:12px; color:#fff; }
    .receipt-header mat-icon { font-size:28px; }
    .receipt-header h3 { margin:0; font-size:1.1rem; font-weight:700; }
    .receipt-body { padding:20px 24px; }
    .receipt-school { text-align:center; font-size:1rem; font-weight:700; color:#1a237e; margin-bottom:4px; }
    .receipt-number { text-align:center; font-size:0.85rem; color:#888; margin-bottom:16px; }
    .receipt-divider { border:none; border-top:2px dashed #e0e0e0; margin:12px 0; }
    .receipt-row { display:flex; justify-content:space-between; align-items:center; padding:6px 0; font-size:0.88rem; color:#444; }
    .receipt-row.total { font-size:1.1rem; font-weight:800; color:#1b5e20; margin-top:4px; }
    .receipt-footer { display:flex; gap:12px; padding:16px 24px; border-top:1px solid #f0f0f0; }
    .print-btn { flex:1; display:flex; align-items:center; justify-content:center; gap:6px; background:linear-gradient(135deg,#1a237e,#3f51b5); color:#fff; border:none; border-radius:10px; padding:10px; font-size:0.9rem; font-weight:700; cursor:pointer; }
    .print-btn mat-icon { font-size:16px; }
    .close-receipt-btn { background:#f5f5f5; color:#666; border:none; border-radius:10px; padding:10px 18px; font-size:0.9rem; cursor:pointer; }

    /* Summary Tab */
    .summary-toolbar { display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; flex-wrap:wrap; gap:12px; }
    .summary-stats { display:flex; gap:8px; flex-wrap:wrap; }
    .ss-pill { display:flex; align-items:center; gap:5px; border-radius:20px; padding:5px 12px; font-size:0.8rem; font-weight:700; }
    .ss-pill mat-icon { font-size:14px; width:14px; height:14px; }
    .ss-pill.paid { background:#e8f5e9; color:#1b5e20; }
    .ss-pill.partial { background:#fff8e1; color:#e65100; }
    .ss-pill.unpaid { background:#ffebee; color:#c62828; }
    .ss-pill.total-col { background:#e8eaf6; color:#1a237e; }
    .summary-search { display:flex; align-items:center; gap:8px; background:#fff; border:1.5px solid #e0e0e0; border-radius:10px; padding:7px 12px; }
    .summary-search mat-icon { color:#9e9e9e; font-size:18px; }
    .summary-search input { border:none; outline:none; font-size:0.88rem; width:180px; }
    .summary-table-wrap { overflow-x:auto; border-radius:14px; box-shadow:0 2px 12px rgba(0,0,0,0.07); }
    .summary-table { width:100%; border-collapse:collapse; background:#fff; }
    .summary-table th { background:#f8f9ff; padding:12px 16px; text-align:left; font-size:0.77rem; font-weight:700; color:#3f51b5; text-transform:uppercase; letter-spacing:0.4px; border-bottom:2px solid #e8eaf6; white-space:nowrap; }
    .summary-table td { padding:12px 16px; border-bottom:1px solid #f5f5f5; font-size:0.88rem; }
    .summary-row { cursor:pointer; transition:background 0.15s; }
    .summary-row:hover td { background:#f8f9ff; }
    .summary-table tr:last-child td { border-bottom:none; }
    .stu-cell { display:flex; align-items:center; gap:10px; }
    .stu-avatar { width:34px; height:34px; border-radius:50%; background:linear-gradient(135deg,#3f51b5,#7986cb); color:#fff; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:0.85rem; flex-shrink:0; }
    .stu-name { font-weight:600; color:#212121; font-size:0.9rem; }
    .stu-roll { font-size:0.75rem; color:#999; }
    .class-badge { background:#e8eaf6; color:#3f51b5; border-radius:6px; padding:2px 8px; font-size:0.8rem; font-weight:600; }
    .amt-col { color:#1a237e; font-weight:600; }
    .amt-paid { color:#1b5e20; font-weight:700; }
    .amt-balance { color:#c62828; font-weight:700; }
    .amt-balance.zero { color:#2e7d32; }
    .status-badge { border-radius:8px; padding:3px 10px; font-size:0.78rem; font-weight:700; }
    .sb-paid { background:#e8f5e9; color:#1b5e20; }
    .sb-partial { background:#fff8e1; color:#e65100; }
    .sb-unpaid { background:#ffebee; color:#c62828; }
    .sb-no_structure { background:#f5f5f5; color:#888; }
    .view-btn { background:#e8eaf6; color:#3f51b5; border:none; border-radius:8px; width:28px; height:28px; display:flex; align-items:center; justify-content:center; cursor:pointer; }

    .st-paid { color:#1b5e20; background:#e8f5e9; border-radius:8px; padding:2px 8px; }
    .st-partial { color:#e65100; background:#fff8e1; border-radius:8px; padding:2px 8px; }
    .st-unpaid { color:#c62828; background:#ffebee; border-radius:8px; padding:2px 8px; }
    .st-no_structure { color:#888; background:#f5f5f5; border-radius:8px; padding:2px 8px; }
    .loading { text-align:center; padding:40px; color:#999; }
  `]
})
export class FeePaymentsComponent implements OnInit {
  classes: any[] = [];
  allStudentsSummary: any[] = [];
  filteredStudents: any[] = [];
  selectedStudent: any = null;
  selectedTabIndex = 0;
  receipt: any = null;
  summarySearch = '';
  summaryLoading = false;
  searchQuery = '';
  searchClass = '';
  academicYear = '';
  paying = false;
  payForm = { amount: '', paymentDate: new Date().toISOString().split('T')[0], paymentMode: '', notes: '' };

  private api = 'http://localhost:8080/api/admin/fee';
  private adminApi = 'http://localhost:8080/api/admin';

  constructor(private http: HttpClient, private snack: MatSnackBar) {}

  ngOnInit() {
    const y = new Date().getFullYear();
    this.academicYear = `${y}-${String(y+1).slice(2)}`;
    this.http.get<any[]>(`${this.adminApi}/classes`).subscribe(c => this.classes = c);
    this.loadSummary();
  }

  onYearChange() { this.loadSummary(); if (this.selectedStudent) this.reloadStudent(); }

  loadSummary() {
    this.summaryLoading = true;
    this.http.get<any[]>(`${this.api}/students`, { params: { academicYear: this.academicYear } }).subscribe({
      next: s => { this.allStudentsSummary = s; this.filterStudents(); this.summaryLoading = false; },
      error: () => { this.summaryLoading = false; }
    });
  }

  filterStudents() {
    const q = this.searchQuery.toLowerCase();
    this.filteredStudents = this.allStudentsSummary.filter(s =>
      (!q || s.fullName.toLowerCase().includes(q) || s.rollNumber.toLowerCase().includes(q)) &&
      (!this.searchClass || s.className === this.searchClass)
    );
  }

  selectStudent(s: any) {
    this.searchQuery = s.fullName;
    this.filteredStudents = [];
    this.http.get<any>(`${this.api}/students/${s.studentId}`, { params: { academicYear: this.academicYear } }).subscribe({
      next: detail => { this.selectedStudent = detail; this.resetPayForm(); },
      error: () => this.snack.open('Error loading student details', 'Close', { duration: 3000 })
    });
  }

  reloadStudent() {
    if (!this.selectedStudent) return;
    this.http.get<any>(`${this.api}/students/${this.selectedStudent.studentId}`, { params: { academicYear: this.academicYear } }).subscribe({
      next: detail => { this.selectedStudent = detail; }
    });
  }

  clearStudent() { this.selectedStudent = null; this.searchQuery = ''; this.filteredStudents = []; }

  resetPayForm() {
    this.payForm = { amount: '', paymentDate: new Date().toISOString().split('T')[0], paymentMode: '', notes: '' };
  }

  recordPayment() {
    if (!this.payForm.amount || !this.payForm.paymentDate || !this.payForm.paymentMode) {
      this.snack.open('Please fill amount, date and payment mode', 'Close', { duration: 3000 });
      return;
    }
    this.paying = true;
    const body = {
      studentId: this.selectedStudent.studentId,
      amount: this.payForm.amount,
      paymentDate: this.payForm.paymentDate,
      paymentMode: this.payForm.paymentMode,
      academicYear: this.academicYear,
      notes: this.payForm.notes
    };
    this.http.post<any>(`${this.api}/payments`, body).subscribe({
      next: (res) => {
        this.paying = false;
        this.receipt = res;
        this.snack.open('Payment recorded! Receipt generated.', 'Close', { duration: 3000 });
        this.reloadStudent();
        this.loadSummary();
        this.resetPayForm();
      },
      error: (err) => {
        this.paying = false;
        this.snack.open(err.error?.message || 'Error recording payment', 'Close', { duration: 3000 });
      }
    });
  }

  deletePayment(id: number) {
    if (!confirm('Delete this payment record?')) return;
    this.http.delete(`${this.api}/payments/${id}`).subscribe({
      next: () => {
        this.snack.open('Payment deleted.', 'Close', { duration: 2000 });
        this.reloadStudent();
        this.loadSummary();
      },
      error: () => this.snack.open('Error deleting payment', 'Close', { duration: 2500 })
    });
  }

  printReceipt() { window.print(); }

  getFilteredSummary() {
    const q = this.summarySearch.toLowerCase();
    return this.allStudentsSummary.filter(s =>
      !q || s.fullName.toLowerCase().includes(q) || s.rollNumber.toLowerCase().includes(q) || s.className.toLowerCase().includes(q)
    );
  }

  getSummaryCount(status: string): number {
    return this.allStudentsSummary.filter(s => s.status === status).length;
  }

  getTotalCollected(): number {
    return this.allStudentsSummary.reduce((sum, s) => sum + (s.totalPaid || 0), 0);
  }

  jumpToPayment(s: any) { this.selectStudent(s); this.selectedTabIndex = 0; }

  getFeeLabel(type: string): string {
    const labels: any = { TUITION:'Tuition', EXAM:'Exam', LIBRARY:'Library', SPORTS:'Sports', TRANSPORT:'Transport', OTHER:'Other' };
    return labels[type] || type;
  }

  getStatusIcon(status: string): string {
    if (status === 'PAID') return 'check_circle';
    if (status === 'PARTIAL') return 'hourglass_bottom';
    if (status === 'UNPAID') return 'cancel';
    return 'info';
  }
}
