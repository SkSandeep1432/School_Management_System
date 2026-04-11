import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-admin-attendance',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatIconModule,
    MatTableModule, MatTabsModule, MatProgressSpinnerModule,
    MatChipsModule, MatSnackBarModule, NavbarComponent
  ],
  template: `
    <app-navbar></app-navbar>
    <div class="page-container">
      <h1 class="page-title">Attendance Overview</h1>

      <!-- Filters -->
      <mat-card class="filter-card">
        <mat-card-content>
          <div class="filter-row">
            <mat-form-field appearance="outline">
              <mat-label>Class</mat-label>
              <mat-select [(ngModel)]="selectedClassId" (ngModelChange)="onClassChange()">
                <mat-option *ngFor="let c of classes" [value]="c.id">Class {{ c.className }}</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Section</mat-label>
              <mat-select [(ngModel)]="selectedSectionId" (ngModelChange)="loadBoth()">
                <mat-option *ngFor="let s of sections" [value]="s.id">{{ s.sectionName }}</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Date</mat-label>
              <input matInput type="date" [(ngModel)]="selectedDate" (ngModelChange)="loadDaily()">
            </mat-form-field>
          </div>
        </mat-card-content>
      </mat-card>

      <div *ngIf="!selectedClassId || !selectedSectionId" class="empty-state">
        <mat-icon>fact_check</mat-icon>
        <p>Select a class and section to view attendance.</p>
      </div>

      <div *ngIf="selectedClassId && selectedSectionId">
        <mat-tab-group animationDuration="200ms">

          <!-- Tab 1: Daily Attendance -->
          <mat-tab label="Daily View">
            <div class="tab-content">
              <div *ngIf="loadingDaily" class="loading-center"><mat-spinner diameter="36"></mat-spinner></div>
              <div *ngIf="!loadingDaily">
                <p class="tab-subtitle" *ngIf="dailyRecords.length > 0">
                  {{ dailyRecords.length }} record(s) for {{ selectedDate }}
                  &nbsp;|&nbsp;
                  <span class="chip-present">Present: {{ countStatus('PRESENT') }}</span>
                  &nbsp;
                  <span class="chip-absent">Absent: {{ countStatus('ABSENT') }}</span>
                  &nbsp;
                  <span class="chip-late">Late: {{ countStatus('LATE') }}</span>
                </p>
                <table mat-table [dataSource]="dailyRecords" class="att-table" *ngIf="dailyRecords.length > 0">
                  <ng-container matColumnDef="rollNumber">
                    <th mat-header-cell *matHeaderCellDef>Roll No.</th>
                    <td mat-cell *matCellDef="let r">{{ r.rollNumber }}</td>
                  </ng-container>
                  <ng-container matColumnDef="studentName">
                    <th mat-header-cell *matHeaderCellDef>Student Name</th>
                    <td mat-cell *matCellDef="let r">{{ r.studentName }}</td>
                  </ng-container>
                  <ng-container matColumnDef="status">
                    <th mat-header-cell *matHeaderCellDef>Status</th>
                    <td mat-cell *matCellDef="let r">
                      <span [class]="'status-badge status-' + r.status.toLowerCase()">{{ r.status }}</span>
                    </td>
                  </ng-container>
                  <tr mat-header-row *matHeaderRowDef="dailyCols"></tr>
                  <tr mat-row *matRowDef="let row; columns: dailyCols;"></tr>
                </table>
                <div *ngIf="dailyRecords.length === 0" class="no-data">
                  <mat-icon>event_busy</mat-icon>
                  <p>No attendance marked for {{ selectedDate }}</p>
                </div>
              </div>
            </div>
          </mat-tab>

          <!-- Tab 2: Student Summary -->
          <mat-tab label="Student Summary">
            <div class="tab-content">
              <div *ngIf="loadingSummary" class="loading-center"><mat-spinner diameter="36"></mat-spinner></div>
              <table mat-table [dataSource]="summaryRecords" class="att-table" *ngIf="!loadingSummary && summaryRecords.length > 0">
                <ng-container matColumnDef="rollNumber">
                  <th mat-header-cell *matHeaderCellDef>Roll No.</th>
                  <td mat-cell *matCellDef="let r">{{ r.rollNumber }}</td>
                </ng-container>
                <ng-container matColumnDef="studentName">
                  <th mat-header-cell *matHeaderCellDef>Student Name</th>
                  <td mat-cell *matCellDef="let r">{{ r.studentName }}</td>
                </ng-container>
                <ng-container matColumnDef="totalDays">
                  <th mat-header-cell *matHeaderCellDef>Total Days</th>
                  <td mat-cell *matCellDef="let r">{{ r.totalDays }}</td>
                </ng-container>
                <ng-container matColumnDef="present">
                  <th mat-header-cell *matHeaderCellDef>Present</th>
                  <td mat-cell *matCellDef="let r"><span class="chip-present">{{ r.present }}</span></td>
                </ng-container>
                <ng-container matColumnDef="absent">
                  <th mat-header-cell *matHeaderCellDef>Absent</th>
                  <td mat-cell *matCellDef="let r"><span class="chip-absent">{{ r.absent }}</span></td>
                </ng-container>
                <ng-container matColumnDef="late">
                  <th mat-header-cell *matHeaderCellDef>Late</th>
                  <td mat-cell *matCellDef="let r"><span class="chip-late">{{ r.late }}</span></td>
                </ng-container>
                <ng-container matColumnDef="percentage">
                  <th mat-header-cell *matHeaderCellDef>Attendance %</th>
                  <td mat-cell *matCellDef="let r">
                    <span [class]="r.percentage >= 75 ? 'pct-good' : 'pct-low'">{{ r.percentage }}%</span>
                  </td>
                </ng-container>
                <tr mat-header-row *matHeaderRowDef="summaryCols"></tr>
                <tr mat-row *matRowDef="let row; columns: summaryCols;"></tr>
              </table>
              <div *ngIf="!loadingSummary && summaryRecords.length === 0" class="no-data">
                <mat-icon>people_outline</mat-icon>
                <p>No students found for this class and section.</p>
              </div>
            </div>
          </mat-tab>

        </mat-tab-group>
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; max-width: 1200px; margin: 0 auto; }
    .page-title { font-size: 1.8rem; font-weight: 500; color: #3f51b5; margin-bottom: 20px; }
    .filter-card { margin-bottom: 20px; }
    .filter-row { display: flex; gap: 16px; flex-wrap: wrap; align-items: center; }
    .filter-row mat-form-field { flex: 1; min-width: 180px; }
    .tab-content { padding: 20px 0; }
    .tab-subtitle { color: #555; font-size: 0.9rem; margin-bottom: 12px; }
    .att-table { width: 100%; }
    .loading-center { display: flex; justify-content: center; padding: 40px; }
    .empty-state { text-align: center; padding: 60px; color: #999; }
    .empty-state mat-icon { font-size: 56px; height: 56px; width: 56px; display: block; margin: 0 auto 12px; }
    .no-data { text-align: center; padding: 40px; color: #999; }
    .no-data mat-icon { font-size: 40px; height: 40px; width: 40px; display: block; margin: 0 auto 8px; }
    .status-badge { padding: 3px 10px; border-radius: 12px; font-size: 0.8rem; font-weight: 600; }
    .status-present { background: #e8f5e9; color: #2e7d32; }
    .status-absent { background: #ffebee; color: #c62828; }
    .status-late { background: #fff3e0; color: #e65100; }
    .chip-present { color: #2e7d32; font-weight: 600; }
    .chip-absent { color: #c62828; font-weight: 600; }
    .chip-late { color: #e65100; font-weight: 600; }
    .pct-good { color: #2e7d32; font-weight: 700; }
    .pct-low { color: #c62828; font-weight: 700; }
  `]
})
export class AdminAttendanceComponent implements OnInit {
  classes: any[] = [];
  sections: any[] = [];
  selectedClassId: number | null = null;
  selectedSectionId: number | null = null;
  selectedDate: string = new Date().toISOString().split('T')[0];

  dailyRecords: any[] = [];
  summaryRecords: any[] = [];
  loadingDaily = false;
  loadingSummary = false;

  dailyCols = ['rollNumber', 'studentName', 'status'];
  summaryCols = ['rollNumber', 'studentName', 'totalDays', 'present', 'absent', 'late', 'percentage'];

  private api = 'http://localhost:8080/api/admin';

  constructor(private http: HttpClient, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.http.get<any[]>(`${this.api}/classes`).subscribe(c => this.classes = c);
    this.http.get<any[]>(`${this.api}/sections`).subscribe(s => this.sections = s);
  }

  onClassChange(): void {
    this.selectedSectionId = null;
    this.dailyRecords = [];
    this.summaryRecords = [];
  }

  loadBoth(): void {
    this.loadDaily();
    this.loadSummary();
  }

  loadDaily(): void {
    if (!this.selectedClassId || !this.selectedSectionId) return;
    this.loadingDaily = true;
    this.http.get<any[]>(`${this.api}/attendance?classId=${this.selectedClassId}&sectionId=${this.selectedSectionId}&date=${this.selectedDate}`)
      .subscribe({
        next: r => { this.dailyRecords = r; this.loadingDaily = false; },
        error: () => { this.loadingDaily = false; }
      });
  }

  loadSummary(): void {
    if (!this.selectedClassId || !this.selectedSectionId) return;
    this.loadingSummary = true;
    this.http.get<any[]>(`${this.api}/attendance/summary?classId=${this.selectedClassId}&sectionId=${this.selectedSectionId}`)
      .subscribe({
        next: r => { this.summaryRecords = r; this.loadingSummary = false; },
        error: () => { this.loadingSummary = false; }
      });
  }

  countStatus(status: string): number {
    return this.dailyRecords.filter(r => r.status === status).length;
  }
}
