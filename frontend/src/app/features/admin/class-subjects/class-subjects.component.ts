import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { HttpClient } from '@angular/common/http';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-class-subjects',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatCardModule, MatFormFieldModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatSnackBarModule,
    MatProgressSpinnerModule, MatDividerModule, NavbarComponent
  ],
  template: `
    <app-navbar></app-navbar>
    <div class="page-container">
      <h1 class="page-title">Class-Subject Management</h1>
      <p class="page-subtitle">Assign which subjects each class teaches. Different classes can have different subjects.</p>

      <div class="layout">
        <!-- Left: Class selector -->
        <mat-card class="class-card">
          <mat-card-title>Select Class</mat-card-title>
          <mat-card-content>
            <div class="class-list">
              <button *ngFor="let c of classes"
                      [class.active]="selectedClass?.id === c.id"
                      class="class-btn"
                      (click)="selectClass(c)">
                Class {{ c.className }}
              </button>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Right: Subjects for selected class -->
        <mat-card class="subject-card" *ngIf="selectedClass">
          <mat-card-header>
            <mat-card-title>Subjects for Class {{ selectedClass.className }}</mat-card-title>
            <mat-card-subtitle>{{ assignedSubjects.length }} subject(s) assigned</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <!-- Assigned subjects -->
            <div class="assigned-list" *ngIf="assignedSubjects.length > 0">
              <div class="subject-chip" *ngFor="let s of assignedSubjects">
                <mat-icon>book</mat-icon>
                <span>{{ s.subjectName }}</span>
                <button mat-icon-button class="remove-btn" (click)="removeSubject(s)" title="Remove">
                  <mat-icon>close</mat-icon>
                </button>
              </div>
            </div>
            <p *ngIf="assignedSubjects.length === 0" class="no-subjects">No subjects assigned yet.</p>

            <mat-divider style="margin: 16px 0"></mat-divider>

            <!-- Add subject -->
            <p class="add-label">Add Subject to Class {{ selectedClass.className }}</p>
            <div class="add-row">
              <mat-form-field appearance="outline" style="flex:1">
                <mat-label>Select Subject</mat-label>
                <mat-select [(ngModel)]="selectedSubjectId">
                  <mat-option *ngFor="let s of availableSubjects" [value]="s.id">{{ s.subjectName }}</mat-option>
                </mat-select>
              </mat-form-field>
              <button mat-raised-button color="primary" (click)="addSubject()" [disabled]="!selectedSubjectId || adding">
                <mat-spinner diameter="16" *ngIf="adding" style="display:inline-block;margin-right:4px"></mat-spinner>
                <mat-icon *ngIf="!adding">add</mat-icon>
                Add
              </button>
            </div>

            <div *ngIf="availableSubjects.length === 0 && allSubjects.length > 0" class="all-assigned">
              <mat-icon>check_circle</mat-icon>
              All available subjects are already assigned to this class.
            </div>
          </mat-card-content>
        </mat-card>

        <div *ngIf="!selectedClass" class="empty-state">
          <mat-icon>school</mat-icon>
          <p>Select a class on the left to manage its subjects.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; max-width: 1100px; margin: 0 auto; }
    .page-title { font-size: 1.8rem; font-weight: 500; color: #3f51b5; margin-bottom: 4px; }
    .page-subtitle { color: #666; margin-bottom: 24px; }
    .layout { display: flex; gap: 20px; align-items: flex-start; flex-wrap: wrap; }
    .class-card { width: 180px; min-width: 160px; flex-shrink: 0; }
    .subject-card { flex: 1; min-width: 300px; }
    .class-list { display: flex; flex-direction: column; gap: 8px; margin-top: 12px; }
    .class-btn { padding: 10px 16px; border: 1px solid #ddd; border-radius: 8px; background: #fff; cursor: pointer; text-align: left; font-size: 0.95rem; transition: all 0.2s; }
    .class-btn:hover { background: #e8eaf6; border-color: #3f51b5; }
    .class-btn.active { background: #3f51b5; color: #fff; border-color: #3f51b5; font-weight: 600; }
    .assigned-list { display: flex; flex-direction: column; gap: 8px; margin: 12px 0; }
    .subject-chip { display: flex; align-items: center; gap: 8px; background: #e8eaf6; border-radius: 8px; padding: 8px 12px; font-size: 0.9rem; }
    .subject-chip mat-icon { font-size: 18px; width: 18px; height: 18px; color: #3f51b5; }
    .remove-btn { margin-left: auto; color: #e53935; width: 28px; height: 28px; line-height: 28px; }
    .remove-btn mat-icon { font-size: 16px; }
    .add-label { font-size: 0.85rem; font-weight: 600; color: #555; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px; }
    .add-row { display: flex; gap: 12px; align-items: center; }
    .no-subjects { color: #999; font-style: italic; }
    .all-assigned { color: #2e7d32; display: flex; align-items: center; gap: 6px; font-size: 0.9rem; }
    .empty-state { text-align: center; padding: 60px; color: #999; flex: 1; }
    .empty-state mat-icon { font-size: 56px; height: 56px; width: 56px; display: block; margin: 0 auto 12px; }
  `]
})
export class ClassSubjectsComponent implements OnInit {
  classes: any[] = [];
  allSubjects: any[] = [];
  assignedSubjects: any[] = [];
  selectedClass: any = null;
  selectedSubjectId: number | null = null;
  adding = false;

  private api = 'http://localhost:8080/api/admin';

  constructor(private http: HttpClient, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.http.get<any[]>(`${this.api}/classes`).subscribe(c => this.classes = c);
    this.http.get<any[]>(`${this.api}/subjects`).subscribe(s => this.allSubjects = s);
  }

  get availableSubjects(): any[] {
    const assignedIds = new Set(this.assignedSubjects.map(s => s.subjectId));
    return this.allSubjects.filter(s => !assignedIds.has(s.id));
  }

  selectClass(cls: any): void {
    this.selectedClass = cls;
    this.selectedSubjectId = null;
    this.loadAssigned();
  }

  loadAssigned(): void {
    if (!this.selectedClass) return;
    this.http.get<any[]>(`${this.api}/classes/${this.selectedClass.id}/subjects`)
      .subscribe({ next: s => this.assignedSubjects = s, error: () => {} });
  }

  addSubject(): void {
    if (!this.selectedClass || !this.selectedSubjectId) return;
    this.adding = true;
    this.http.post<any>(`${this.api}/classes/${this.selectedClass.id}/subjects`, { subjectId: this.selectedSubjectId })
      .subscribe({
        next: s => {
          this.assignedSubjects = [...this.assignedSubjects, s];
          this.selectedSubjectId = null;
          this.adding = false;
          this.snackBar.open('Subject assigned!', 'Close', { duration: 2500 });
        },
        error: (err) => {
          this.adding = false;
          this.snackBar.open(err.error?.message || 'Error assigning subject', 'Close', { duration: 3000 });
        }
      });
  }

  removeSubject(cs: any): void {
    this.http.delete(`${this.api}/classes/${this.selectedClass.id}/subjects/${cs.subjectId}`)
      .subscribe({
        next: () => {
          this.assignedSubjects = this.assignedSubjects.filter(s => s.subjectId !== cs.subjectId);
          this.snackBar.open('Subject removed.', 'Close', { duration: 2500 });
        },
        error: (err) => this.snackBar.open(err.error?.message || 'Error removing subject', 'Close', { duration: 3000 })
      });
  }
}
