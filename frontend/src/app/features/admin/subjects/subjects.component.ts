import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { HttpClient, HttpHeaders } from '@angular/common/http';

interface Subject { id: number; subjectName: string; }

@Component({
  selector: 'app-subjects',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatIconModule, MatTableModule,
    MatSnackBarModule, MatProgressSpinnerModule, MatChipsModule, NavbarComponent
  ],
  template: `
    <app-navbar></app-navbar>
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1>Subjects Management</h1>
          <p class="subtitle">Add and manage subjects available in the school</p>
        </div>
        <button mat-raised-button color="primary" (click)="showForm = !showForm">
          <mat-icon>{{ showForm ? 'close' : 'add' }}</mat-icon>
          {{ showForm ? 'Cancel' : 'Add Subject' }}
        </button>
      </div>

      <!-- Add Subject Form -->
      <mat-card *ngIf="showForm" class="form-card">
        <mat-card-title>Add New Subject</mat-card-title>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="submit()" class="form-row">
            <mat-form-field appearance="outline" class="name-field">
              <mat-label>Subject Name</mat-label>
              <input matInput formControlName="subjectName" placeholder="e.g. Telugu, Hindi, Sanskrit...">
              <mat-error *ngIf="form.get('subjectName')?.hasError('required')">Subject name is required</mat-error>
              <mat-error *ngIf="form.get('subjectName')?.hasError('minlength')">Minimum 2 characters</mat-error>
            </mat-form-field>
            <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || saving">
              <mat-spinner diameter="18" *ngIf="saving" style="display:inline-block;margin-right:6px"></mat-spinner>
              <mat-icon *ngIf="!saving">save</mat-icon>
              {{ saving ? 'Saving...' : 'Save Subject' }}
            </button>
          </form>
        </mat-card-content>
      </mat-card>

      <!-- Loading -->
      <div *ngIf="loading" class="loading-center">
        <mat-spinner diameter="40"></mat-spinner>
      </div>

      <!-- Subjects Grid -->
      <div *ngIf="!loading">
        <p class="count-label">{{ subjects.length }} subject{{ subjects.length !== 1 ? 's' : '' }} available</p>
        <div class="subjects-grid">
          <mat-card class="subject-card" *ngFor="let s of subjects; let i = index">
            <mat-card-content>
              <div class="subject-inner">
                <div class="subject-icon" [style.background]="colors[i % colors.length]">
                  <mat-icon>book</mat-icon>
                </div>
                <span class="subject-name">{{ s.subjectName }}</span>
                <button mat-icon-button class="delete-btn" (click)="confirmDelete(s)" [title]="'Delete ' + s.subjectName">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Delete confirm overlay -->
        <div class="confirm-overlay" *ngIf="deletingSubject" (click)="cancelDelete()">
          <mat-card class="confirm-dialog" (click)="$event.stopPropagation()">
            <mat-card-content>
              <div class="confirm-icon"><mat-icon color="warn">warning</mat-icon></div>
              <h3>Delete Subject?</h3>
              <p>Are you sure you want to delete <strong>{{ deletingSubject.subjectName }}</strong>?
                Teachers assigned to this subject may be affected.</p>
            </mat-card-content>
            <mat-card-actions align="end">
              <button mat-stroked-button (click)="cancelDelete()">Cancel</button>
              <button mat-raised-button color="warn" (click)="deleteSubject()" [disabled]="deleting">
                <mat-spinner diameter="16" *ngIf="deleting" style="display:inline-block;margin-right:6px"></mat-spinner>
                {{ deleting ? 'Deleting...' : 'Yes, Delete' }}
              </button>
            </mat-card-actions>
          </mat-card>
        </div>

        <div *ngIf="subjects.length === 0" class="empty-state">
          <mat-icon>menu_book</mat-icon>
          <p>No subjects added yet. Click <strong>Add Subject</strong> to get started.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; max-width: 1100px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
    .page-header h1 { margin: 0 0 4px; font-size: 1.8rem; font-weight: 500; color: #3f51b5; }
    .subtitle { color: #666; margin: 0; }
    .form-card { margin-bottom: 24px; padding: 8px; }
    .form-row { display: flex; gap: 16px; align-items: flex-start; flex-wrap: wrap; margin-top: 12px; }
    .name-field { flex: 1; min-width: 240px; }
    .loading-center { display: flex; justify-content: center; padding: 60px; }
    .count-label { color: #666; font-size: 0.9rem; margin: 0 0 16px; }
    .subjects-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; }
    .subject-card { border-radius: 12px; transition: box-shadow .2s; cursor: default; }
    .subject-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,.12); }
    .subject-inner { display: flex; align-items: center; gap: 12px; }
    .subject-icon { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .subject-icon mat-icon { color: white; }
    .subject-name { font-size: 1rem; font-weight: 500; }
    .empty-state { text-align: center; padding: 60px 0; color: #999; }
    .empty-state mat-icon { font-size: 56px; width: 56px; height: 56px; display: block; margin: 0 auto 12px; }
    .delete-btn { margin-left: auto; color: #e53935; opacity: 0; transition: opacity .2s; }
    .subject-card:hover .delete-btn { opacity: 1; }
    .confirm-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.5); z-index: 1000; display: flex; align-items: center; justify-content: center; }
    .confirm-dialog { max-width: 420px; width: 90%; padding: 8px; }
    .confirm-icon { text-align: center; margin-bottom: 8px; }
    .confirm-icon mat-icon { font-size: 48px; width: 48px; height: 48px; }
    .confirm-dialog h3 { text-align: center; margin: 0 0 12px; font-size: 1.2rem; }
    .confirm-dialog p { color: #555; text-align: center; }
  `]
})
export class SubjectsComponent implements OnInit {
  subjects: Subject[] = [];
  loading = true;
  saving = false;
  deleting = false;
  showForm = false;
  deletingSubject: Subject | null = null;
  form: FormGroup;

  colors = ['#1976d2', '#388e3c', '#f57c00', '#7b1fa2', '#c62828', '#00796b', '#5d4037', '#455a64', '#e64a19', '#0288d1'];

  private apiUrl = 'http://localhost:8080/api/admin';

  constructor(private http: HttpClient, private fb: FormBuilder, private snackBar: MatSnackBar) {
    this.form = this.fb.group({
      subjectName: ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  private get headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: 'Bearer ' + localStorage.getItem('token') });
  }

  ngOnInit(): void {
    this.loadSubjects();
  }

  loadSubjects(): void {
    this.loading = true;
    this.http.get<Subject[]>(`${this.apiUrl}/subjects`, { headers: this.headers }).subscribe({
      next: s => { this.subjects = s; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  confirmDelete(s: Subject): void { this.deletingSubject = s; }
  cancelDelete(): void { this.deletingSubject = null; }

  deleteSubject(): void {
    if (!this.deletingSubject) return;
    this.deleting = true;
    this.http.delete(`${this.apiUrl}/subjects/${this.deletingSubject.id}`, { headers: this.headers }).subscribe({
      next: () => {
        this.subjects = this.subjects.filter(s => s.id !== this.deletingSubject!.id);
        this.snackBar.open(`"${this.deletingSubject!.subjectName}" deleted.`, 'Close', { duration: 3000 });
        this.deletingSubject = null;
        this.deleting = false;
      },
      error: err => {
        this.deleting = false;
        const msg = err?.error?.message || 'Failed to delete subject';
        this.snackBar.open(msg, 'Close', { duration: 4000 });
      }
    });
  }

  submit(): void {
    if (this.form.invalid) return;
    this.saving = true;
    const body = { subjectName: this.form.value.subjectName.trim() };
    this.http.post<Subject>(`${this.apiUrl}/subjects`, body, { headers: this.headers }).subscribe({
      next: s => {
        this.subjects = [...this.subjects, s];
        this.form.reset();
        this.showForm = false;
        this.saving = false;
        this.snackBar.open(`"${s.subjectName}" added successfully!`, 'Close', { duration: 3000 });
      },
      error: err => {
        this.saving = false;
        const msg = err?.error?.message || 'Failed to add subject';
        this.snackBar.open(msg, 'Close', { duration: 4000 });
      }
    });
  }
}
