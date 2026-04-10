import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { StudentService } from '../../../core/services/student.service';
import { AdminService } from '../../../core/services/admin.service';
import { Student } from '../../../core/models/student.model';

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatSelectModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    NavbarComponent
  ],
  template: `
    <app-navbar></app-navbar>
    <div class="page-container">
      <div class="page-header">
        <h1>Students Management</h1>
        <button mat-raised-button color="primary" (click)="showForm = !showForm">
          <mat-icon>{{ showForm ? 'close' : 'add' }}</mat-icon>
          {{ showForm ? 'Cancel' : 'Add Student' }}
        </button>
      </div>

      <mat-card *ngIf="showForm" class="form-card">
        <mat-card-title>{{ editingStudent ? 'Edit Student' : 'Add New Student' }}</mat-card-title>
        <mat-card-content>
          <form [formGroup]="studentForm" (ngSubmit)="onSubmit()">
            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Full Name</mat-label>
                <input matInput formControlName="fullName">
                <mat-error *ngIf="studentForm.get('fullName')?.hasError('required')">Required</mat-error>
              </mat-form-field>
            </div>
            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Class</mat-label>
                <mat-select formControlName="classId" (selectionChange)="onClassOrSectionChange()">
                  <mat-option *ngFor="let c of classes" [value]="c.id">Class {{ c.className }}</mat-option>
                </mat-select>
                <mat-error *ngIf="studentForm.get('classId')?.hasError('required')">Required</mat-error>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Section</mat-label>
                <mat-select formControlName="sectionId" (selectionChange)="onClassOrSectionChange()">
                  <mat-option *ngFor="let s of sections" [value]="s.id">{{ s.sectionName }}</mat-option>
                </mat-select>
                <mat-error *ngIf="studentForm.get('sectionId')?.hasError('required')">Required</mat-error>
              </mat-form-field>
            </div>
            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Roll Number</mat-label>
                <input matInput formControlName="rollNumber" [readonly]="!editingStudent">
                <mat-hint *ngIf="!editingStudent">Auto-generated when Class &amp; Section are selected</mat-hint>
                <mat-spinner matSuffix diameter="16" *ngIf="autoRollLoading" style="margin:4px 8px 0 0"></mat-spinner>
                <mat-error *ngIf="studentForm.get('rollNumber')?.hasError('required')">Required</mat-error>
              </mat-form-field>
            </div>
            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Date of Birth</mat-label>
                <input matInput type="date" formControlName="dateOfBirth">
                <mat-error *ngIf="studentForm.get('dateOfBirth')?.hasError('required')">Required</mat-error>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Parent Email</mat-label>
                <input matInput type="email" formControlName="parentEmail">
                <mat-error *ngIf="studentForm.get('parentEmail')?.hasError('required')">Required</mat-error>
              </mat-form-field>
            </div>
            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Phone</mat-label>
                <input matInput formControlName="phone">
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Address</mat-label>
                <input matInput formControlName="address">
              </mat-form-field>
            </div>
            <div class="form-actions">
              <button mat-raised-button color="primary" type="submit" [disabled]="studentForm.invalid || saving">
                <mat-spinner *ngIf="saving" diameter="18" style="display:inline-block;margin-right:6px;"></mat-spinner>
                {{ editingStudent ? 'Update' : 'Save' }}
              </button>
              <button mat-button type="button" (click)="cancelEdit()">Cancel</button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <mat-card>
        <mat-card-content>
          <!-- Filter Bar -->
          <div class="filter-bar" *ngIf="!loading">
            <mat-form-field appearance="outline" class="filter-search">
              <mat-label>Search by name or roll no.</mat-label>
              <mat-icon matPrefix>search</mat-icon>
              <input matInput [(ngModel)]="searchQuery" (ngModelChange)="applyFilter()" placeholder="e.g. Amit or 7A001P">
              <button matSuffix mat-icon-button *ngIf="searchQuery" (click)="searchQuery=''; applyFilter()">
                <mat-icon>close</mat-icon>
              </button>
            </mat-form-field>
            <mat-form-field appearance="outline" class="filter-select">
              <mat-label>Class</mat-label>
              <mat-select [(ngModel)]="filterClassId" (ngModelChange)="applyFilter()">
                <mat-option [value]="null">All Classes</mat-option>
                <mat-option *ngFor="let c of classes" [value]="c.id">Class {{ c.className }}</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline" class="filter-select">
              <mat-label>Section</mat-label>
              <mat-select [(ngModel)]="filterSectionId" (ngModelChange)="applyFilter()">
                <mat-option [value]="null">All Sections</mat-option>
                <mat-option *ngFor="let s of sections" [value]="s.id">{{ s.sectionName }}</mat-option>
              </mat-select>
            </mat-form-field>
            <div class="filter-meta">
              <span class="result-count">{{ filteredStudents.length }} student{{ filteredStudents.length !== 1 ? 's' : '' }}</span>
              <button mat-stroked-button *ngIf="hasActiveFilter()" (click)="clearFilters()">
                <mat-icon>filter_alt_off</mat-icon> Clear
              </button>
            </div>
          </div>

          <div *ngIf="loading" class="loading-center">
            <mat-spinner diameter="40"></mat-spinner>
          </div>
          <table mat-table [dataSource]="filteredStudents" class="full-width-table" *ngIf="!loading">
            <ng-container matColumnDef="rollNumber">
              <th mat-header-cell *matHeaderCellDef>Roll No.</th>
              <td mat-cell *matCellDef="let s">{{ s.rollNumber }}</td>
            </ng-container>
            <ng-container matColumnDef="fullName">
              <th mat-header-cell *matHeaderCellDef>Name</th>
              <td mat-cell *matCellDef="let s">{{ s.fullName }}</td>
            </ng-container>
            <ng-container matColumnDef="className">
              <th mat-header-cell *matHeaderCellDef>Class</th>
              <td mat-cell *matCellDef="let s">{{ s.className }}</td>
            </ng-container>
            <ng-container matColumnDef="sectionName">
              <th mat-header-cell *matHeaderCellDef>Section</th>
              <td mat-cell *matCellDef="let s">{{ s.sectionName }}</td>
            </ng-container>
            <ng-container matColumnDef="parentEmail">
              <th mat-header-cell *matHeaderCellDef>Parent Email</th>
              <td mat-cell *matCellDef="let s">{{ s.parentEmail }}</td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let s">
                <button mat-icon-button color="primary" (click)="editStudent(s)" title="Edit">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button color="warn" (click)="deleteStudent(s.id)" title="Delete">
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
          <div *ngIf="!loading && filteredStudents.length === 0 && students.length === 0" class="empty-state">
            <mat-icon>people_outline</mat-icon>
            <p>No students found. Add a student to get started.</p>
          </div>
          <div *ngIf="!loading && filteredStudents.length === 0 && students.length > 0" class="empty-state">
            <mat-icon>search_off</mat-icon>
            <p>No students match your filter. <a (click)="clearFilters()" style="cursor:pointer;color:#3f51b5">Clear filters</a></p>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; max-width: 1200px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .page-header h1 { margin: 0; font-size: 1.8rem; font-weight: 500; color: #3f51b5; }
    .form-card { margin-bottom: 20px; }
    .form-row { display: flex; gap: 16px; flex-wrap: wrap; }
    .form-row mat-form-field { flex: 1; min-width: 200px; }
    .form-actions { display: flex; gap: 12px; margin-top: 8px; }
    .full-width-table { width: 100%; }
    .loading-center { display: flex; justify-content: center; padding: 40px; }
    .empty-state { text-align: center; padding: 48px; color: #999; }
    .empty-state mat-icon { font-size: 48px; height: 48px; width: 48px; display: block; margin: 0 auto 12px; }
    .filter-bar { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; margin-bottom: 8px; padding: 12px 0 4px; }
    .filter-search { flex: 2; min-width: 220px; }
    .filter-select { flex: 1; min-width: 140px; }
    .filter-meta { display: flex; align-items: center; gap: 10px; white-space: nowrap; }
    .result-count { font-size: 0.85rem; color: #666; }
  `]
})
export class StudentsComponent implements OnInit {
  students: Student[] = [];
  filteredStudents: Student[] = [];
  classes: any[] = [];
  sections: any[] = [];
  displayedColumns = ['rollNumber', 'fullName', 'className', 'sectionName', 'parentEmail', 'actions'];
  studentForm: FormGroup;
  showForm = false;
  loading = false;
  saving = false;
  editingStudent: Student | null = null;
  searchQuery = '';
  filterClassId: number | null = null;
  filterSectionId: number | null = null;
  autoRollLoading = false;

  private apiUrl = 'http://localhost:8080/api/admin';

  constructor(
    private studentService: StudentService,
    private adminService: AdminService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private http: HttpClient
  ) {
    this.studentForm = this.fb.group({
      fullName: ['', Validators.required],
      rollNumber: ['', Validators.required],
      classId: ['', Validators.required],
      sectionId: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      parentEmail: ['', [Validators.required, Validators.email]],
      phone: [''],
      address: ['']
    });
  }

  ngOnInit(): void {
    this.loadStudents();
    this.adminService.getClasses().subscribe({ next: c => this.classes = c, error: () => {} });
    this.adminService.getSections().subscribe({ next: s => this.sections = s, error: () => {} });
  }

  loadStudents(): void {
    this.loading = true;
    this.studentService.getStudents().subscribe({
      next: s => { this.students = s; this.applyFilter(); this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  applyFilter(): void {
    const q = this.searchQuery.toLowerCase().trim();
    this.filteredStudents = this.students.filter(s => {
      const matchSearch = !q ||
        s.fullName.toLowerCase().includes(q) ||
        s.rollNumber.toLowerCase().includes(q);
      const matchClass = !this.filterClassId || s.classId === this.filterClassId;
      const matchSection = !this.filterSectionId || s.sectionId === this.filterSectionId;
      return matchSearch && matchClass && matchSection;
    });
  }

  hasActiveFilter(): boolean {
    return !!this.searchQuery || !!this.filterClassId || !!this.filterSectionId;
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.filterClassId = null;
    this.filterSectionId = null;
    this.applyFilter();
  }

  editStudent(student: Student): void {
    this.editingStudent = student;
    this.showForm = true;
    this.studentForm.patchValue({
      fullName: student.fullName,
      rollNumber: student.rollNumber,
      classId: student.classId,
      sectionId: student.sectionId,
      dateOfBirth: student.dateOfBirth,
      parentEmail: student.parentEmail,
      phone: student.phone,
      address: student.address
    });
  }

  cancelEdit(): void {
    this.editingStudent = null;
    this.showForm = false;
    this.studentForm.reset();
  }

  onSubmit(): void {
    if (this.studentForm.invalid) return;
    this.saving = true;
    const data = this.studentForm.value;
    const request = this.editingStudent
      ? this.studentService.updateStudent(this.editingStudent.id, data)
      : this.studentService.createStudent(data);
    request.subscribe({
      next: () => {
        this.saving = false;
        this.snackBar.open(this.editingStudent ? 'Student updated!' : 'Student added!', 'Close', { duration: 3000 });
        this.cancelEdit();
        this.loadStudents();
      },
      error: (err) => {
        this.saving = false;
        this.snackBar.open(err.error?.message || 'Error saving student', 'Close', { duration: 3000 });
      }
    });
  }

  onClassOrSectionChange(): void {
    if (this.editingStudent) return;
    const classId = this.studentForm.get('classId')?.value;
    const sectionId = this.studentForm.get('sectionId')?.value;
    if (!classId || !sectionId) return;
    this.autoRollLoading = true;
    const headers = new HttpHeaders({ Authorization: 'Bearer ' + localStorage.getItem('token') });
    this.http.get<{rollNumber: string}>(`${this.apiUrl}/students/next-roll-number?classId=${classId}&sectionId=${sectionId}`, { headers }).subscribe({
      next: r => { this.studentForm.patchValue({ rollNumber: r.rollNumber }); this.autoRollLoading = false; },
      error: () => { this.autoRollLoading = false; }
    });
  }

  deleteStudent(id: number): void {
    if (!confirm('Are you sure you want to delete this student?')) return;
    this.studentService.deleteStudent(id).subscribe({
      next: () => {
        this.snackBar.open('Student deleted', 'Close', { duration: 3000 });
        this.loadStudents();
      },
      error: () => this.snackBar.open('Error deleting student', 'Close', { duration: 3000 })
    });
  }
}
