import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { HttpClient, HttpHeaders } from '@angular/common/http';

interface Exam { id: number; examName: string; examType: string; academicYear: string; }
interface SubjectDetail { subjectName: string; className: string; sectionName: string; totalStudents: number; }
interface TeacherProgress {
  teacherId: number;
  teacherName: string;
  totalStudents: number;
  marksEntered: number;
  pending: number;
  subjects: SubjectDetail[];
  expanded: boolean;
}

@Component({
  selector: 'app-teacher-progress',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatSelectModule,
    MatProgressSpinnerModule, MatProgressBarModule, NavbarComponent
  ],
  template: `
    <app-navbar></app-navbar>
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1>Teacher Marks Progress</h1>
          <p class="subtitle">Track how many student marks each teacher has entered per exam</p>
        </div>
      </div>

      <!-- Exam selector -->
      <mat-card class="selector-card">
        <mat-card-content>
          <div class="selector-row">
            <mat-form-field appearance="outline" style="min-width:280px">
              <mat-label>Select Exam</mat-label>
              <mat-select [(ngModel)]="selectedExamId" (ngModelChange)="loadProgress()">
                <mat-option *ngFor="let e of exams" [value]="e.id">
                  {{ e.examName }} ({{ e.academicYear }})
                </mat-option>
              </mat-select>
            </mat-form-field>
            <span class="hint" *ngIf="!selectedExamId">← Choose an exam to see teacher-wise progress</span>
          </div>
        </mat-card-content>
      </mat-card>

      <div *ngIf="loadingProgress" class="loading-center"><mat-spinner diameter="40"></mat-spinner></div>

      <!-- Summary bar -->
      <div class="summary-row" *ngIf="progress.length > 0 && !loadingProgress">
        <div class="summary-stat">
          <span class="s-num">{{ totalEntered }}</span>
          <span class="s-label">Total Marks Entered</span>
        </div>
        <div class="summary-stat">
          <span class="s-num pending-color">{{ totalPending }}</span>
          <span class="s-label">Total Pending</span>
        </div>
        <div class="summary-stat">
          <span class="s-num">{{ progress.length }}</span>
          <span class="s-label">Teachers</span>
        </div>
        <div class="overall-bar">
          <div class="bar-label">Overall Completion</div>
          <mat-progress-bar mode="determinate" [value]="overallPercent" color="primary"></mat-progress-bar>
          <div class="bar-pct">{{ overallPercent }}%</div>
        </div>
      </div>

      <!-- Teacher cards -->
      <div class="progress-list" *ngIf="!loadingProgress && progress.length > 0">
        <mat-card class="progress-card" *ngFor="let t of progress">
          <mat-card-header (click)="t.expanded = !t.expanded" style="cursor:pointer">
            <mat-icon mat-card-avatar [style.color]="getColor(t)">person</mat-icon>
            <mat-card-title>{{ t.teacherName }}</mat-card-title>
            <mat-card-subtitle>
              {{ t.marksEntered }} / {{ t.totalStudents }} entries
              <span *ngIf="t.pending > 0" class="pending-badge">{{ t.pending }} pending</span>
              <span *ngIf="t.pending === 0 && t.totalStudents > 0" class="done-badge">Complete</span>
            </mat-card-subtitle>
            <div style="flex:1"></div>
            <div class="mini-bar-wrap">
              <mat-progress-bar mode="determinate"
                [value]="getPercent(t)"
                [color]="t.pending === 0 ? 'primary' : 'accent'">
              </mat-progress-bar>
              <span class="mini-pct">{{ getPercent(t) }}%</span>
            </div>
            <mat-icon style="margin-left:8px">{{ t.expanded ? 'expand_less' : 'expand_more' }}</mat-icon>
          </mat-card-header>

          <mat-card-content *ngIf="t.expanded">
            <div class="subject-table">
              <div class="subject-header">
                <span>Subject</span><span>Class</span><span>Section</span><span>Students</span>
              </div>
              <div class="subject-row" *ngFor="let s of t.subjects">
                <span class="subject-badge">{{ s.subjectName }}</span>
                <span>Class {{ s.className }}</span>
                <span class="section-chip">{{ s.sectionName }}</span>
                <span>{{ s.totalStudents }}</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <div *ngIf="!loadingProgress && selectedExamId && progress.length === 0" class="empty-state">
        <mat-icon>assignment_late</mat-icon>
        <p>No teacher assignments found or no marks entered yet for this exam.</p>
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; max-width: 1000px; margin: 0 auto; }
    .page-header { margin-bottom: 20px; }
    .page-header h1 { margin: 0 0 4px; font-size: 1.8rem; font-weight: 500; color: #1565c0; }
    .subtitle { margin: 0; color: #666; }
    .selector-card { margin-bottom: 20px; }
    .selector-row { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
    .hint { color: #999; font-size: 0.9rem; }
    .loading-center { display: flex; justify-content: center; padding: 60px; }
    .summary-row { display: flex; align-items: center; gap: 24px; flex-wrap: wrap; background: #e3f2fd; border-radius: 10px; padding: 16px 20px; margin-bottom: 20px; }
    .summary-stat { display: flex; flex-direction: column; align-items: center; }
    .s-num { font-size: 1.8rem; font-weight: 700; color: #1565c0; }
    .pending-color { color: #e65100; }
    .s-label { font-size: 0.75rem; color: #666; }
    .overall-bar { flex: 1; min-width: 200px; }
    .bar-label { font-size: 0.8rem; color: #666; margin-bottom: 4px; }
    .bar-pct { font-size: 0.85rem; font-weight: 600; color: #1565c0; margin-top: 4px; }
    .progress-list { display: flex; flex-direction: column; gap: 12px; }
    .progress-card mat-card-header { padding: 12px 16px; cursor: pointer; }
    .progress-card mat-card-header:hover { background: #f5f5f5; border-radius: 8px; }
    .mini-bar-wrap { display: flex; align-items: center; gap: 8px; min-width: 140px; }
    .mini-pct { font-size: 0.8rem; font-weight: 600; color: #555; white-space: nowrap; }
    .pending-badge { background: #fff3e0; color: #e65100; padding: 2px 8px; border-radius: 10px; font-size: 0.75rem; font-weight: 600; margin-left: 8px; }
    .done-badge { background: #e8f5e9; color: #2e7d32; padding: 2px 8px; border-radius: 10px; font-size: 0.75rem; font-weight: 600; margin-left: 8px; }
    .subject-table { border: 1px solid #eee; border-radius: 8px; overflow: hidden; margin-top: 8px; }
    .subject-header, .subject-row { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; padding: 8px 16px; gap: 8px; align-items: center; }
    .subject-header { background: #f5f5f5; font-size: 0.8rem; font-weight: 600; color: #666; }
    .subject-row { border-top: 1px solid #f0f0f0; font-size: 0.88rem; }
    .subject-badge { background: #ede7f6; color: #6a1b9a; padding: 2px 8px; border-radius: 10px; font-size: 0.8rem; font-weight: 500; }
    .section-chip { background: #e3f2fd; color: #1565c0; padding: 2px 8px; border-radius: 10px; font-size: 0.8rem; font-weight: 500; }
    .empty-state { text-align: center; padding: 48px; color: #999; }
    .empty-state mat-icon { font-size: 48px; width: 48px; height: 48px; display: block; margin: 0 auto 12px; }
  `]
})
export class TeacherProgressComponent implements OnInit {
  exams: Exam[] = [];
  progress: TeacherProgress[] = [];
  selectedExamId: number | null = null;
  loadingProgress = false;

  private apiUrl = 'http://localhost:8080/api/admin';

  constructor(private http: HttpClient) {}

  private get headers() {
    return new HttpHeaders({ Authorization: 'Bearer ' + localStorage.getItem('token') });
  }

  ngOnInit(): void {
    this.http.get<Exam[]>(`${this.apiUrl}/exams`, { headers: this.headers }).subscribe({
      next: e => this.exams = e, error: () => {}
    });
  }

  loadProgress(): void {
    if (!this.selectedExamId) return;
    this.loadingProgress = true;
    this.http.get<any[]>(`${this.apiUrl}/teacher-progress?examId=${this.selectedExamId}`, { headers: this.headers }).subscribe({
      next: data => {
        this.progress = data.map(d => ({ ...d, expanded: false }));
        this.loadingProgress = false;
      },
      error: () => { this.loadingProgress = false; }
    });
  }

  get totalEntered(): number { return this.progress.reduce((s, t) => s + t.marksEntered, 0); }
  get totalPending(): number { return this.progress.reduce((s, t) => s + t.pending, 0); }
  get overallPercent(): number {
    const total = this.progress.reduce((s, t) => s + t.totalStudents, 0);
    if (total === 0) return 0;
    return Math.round((this.totalEntered / total) * 100);
  }
  getPercent(t: TeacherProgress): number {
    if (t.totalStudents === 0) return 0;
    return Math.round((t.marksEntered / t.totalStudents) * 100);
  }
  getColor(t: TeacherProgress): string {
    if (t.pending === 0 && t.totalStudents > 0) return '#2e7d32';
    if (this.getPercent(t) >= 50) return '#1565c0';
    return '#e65100';
  }
}
