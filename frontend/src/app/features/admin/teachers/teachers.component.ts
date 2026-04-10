import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { TeacherService } from '../../../core/services/teacher.service';
import { AdminService } from '../../../core/services/admin.service';
import { Teacher, TeacherAssignment } from '../../../core/models/teacher.model';

@Component({
  selector: 'app-teachers',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatSelectModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
    MatDividerModule,
    NavbarComponent
  ],
  template: `
    <app-navbar></app-navbar>
    <div class="page-container">
      <div class="page-header">
        <h1>Teachers Management</h1>
        <button mat-raised-button color="primary" (click)="showForm = !showForm">
          <mat-icon>{{ showForm ? 'close' : 'add' }}</mat-icon>
          {{ showForm ? 'Cancel' : 'Add Teacher' }}
        </button>
      </div>

      <mat-card *ngIf="showForm" class="form-card">
        <mat-card-title>Add New Teacher</mat-card-title>
        <mat-card-content>
          <form [formGroup]="teacherForm" (ngSubmit)="onSubmit()">
            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Full Name</mat-label>
                <input matInput formControlName="fullName">
                <mat-error *ngIf="teacherForm.get('fullName')?.hasError('required')">Required</mat-error>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Email</mat-label>
                <input matInput type="email" formControlName="email">
                <mat-error *ngIf="teacherForm.get('email')?.hasError('required')">Required</mat-error>
              </mat-form-field>
            </div>
            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Username</mat-label>
                <input matInput formControlName="username">
                <mat-error *ngIf="teacherForm.get('username')?.hasError('required')">Required</mat-error>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Password</mat-label>
                <input matInput type="password" formControlName="password">
                <mat-error *ngIf="teacherForm.get('password')?.hasError('required')">Required</mat-error>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Phone</mat-label>
                <input matInput formControlName="phone">
              </mat-form-field>
            </div>
            <div class="form-actions">
              <button mat-raised-button color="primary" type="submit" [disabled]="teacherForm.invalid || saving">
                <mat-spinner *ngIf="saving" diameter="18" style="display:inline-block;margin-right:6px;"></mat-spinner>
                Save Teacher
              </button>
              <button mat-button type="button" (click)="showForm = false; teacherForm.reset()">Cancel</button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <!-- Assign Subject Panel -->
      <mat-card *ngIf="selectedTeacher" class="form-card assign-panel">
        <mat-card-header>
          <mat-icon mat-card-avatar style="color:#3f51b5;font-size:32px;width:32px;height:32px">person</mat-icon>
          <mat-card-title>{{ selectedTeacher.fullName }}</mat-card-title>
          <mat-card-subtitle>Assign subjects across multiple classes</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <!-- Existing assignments -->
          <div *ngIf="currentAssignments.length > 0" class="assignments-list">
            <p class="assign-label">Current Assignments ({{ currentAssignments.length }})</p>
            <div class="assign-chip" *ngFor="let a of currentAssignments">
              <mat-icon>book</mat-icon>
              <span>{{ a.subjectName }} — Class {{ a.className }}, Section {{ a.sectionName }}</span>
              <button mat-icon-button class="remove-btn" (click)="removeAssignment(a)" title="Remove">
                <mat-icon>close</mat-icon>
              </button>
            </div>
          </div>
          <p *ngIf="currentAssignments.length === 0" class="no-assign-hint">No assignments yet.</p>

          <mat-divider style="margin: 12px 0"></mat-divider>
          <p class="assign-label">Add New Assignment</p>
          <form [formGroup]="assignForm" (ngSubmit)="onAssign()">
            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Subject</mat-label>
                <mat-select formControlName="subjectId">
                  <mat-option *ngFor="let s of subjects" [value]="s.id">{{ s.subjectName }}</mat-option>
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Class</mat-label>
                <mat-select formControlName="classId">
                  <mat-option *ngFor="let c of classes" [value]="c.id">Class {{ c.className }}</mat-option>
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Section</mat-label>
                <mat-select formControlName="sectionId">
                  <mat-option *ngFor="let s of sections" [value]="s.id">{{ s.sectionName }}</mat-option>
                </mat-select>
              </mat-form-field>
            </div>
            <div class="form-actions">
              <button mat-raised-button color="accent" type="submit" [disabled]="assignForm.invalid || assigning">
                <mat-spinner diameter="16" *ngIf="assigning" style="display:inline-block;margin-right:6px"></mat-spinner>
                <mat-icon *ngIf="!assigning">add</mat-icon>
                {{ assigning ? 'Assigning...' : 'Assign' }}
              </button>
              <button mat-stroked-button type="button" (click)="closeAssign()">Done</button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <mat-card>
        <mat-card-content>
          <div *ngIf="loading" class="loading-center"><mat-spinner diameter="40"></mat-spinner></div>
          <table mat-table [dataSource]="teachers" class="full-width-table" *ngIf="!loading">
            <ng-container matColumnDef="fullName">
              <th mat-header-cell *matHeaderCellDef>Name</th>
              <td mat-cell *matCellDef="let t">{{ t.fullName }}</td>
            </ng-container>
            <ng-container matColumnDef="username">
              <th mat-header-cell *matHeaderCellDef>Username</th>
              <td mat-cell *matCellDef="let t">{{ t.username }}</td>
            </ng-container>
            <ng-container matColumnDef="email">
              <th mat-header-cell *matHeaderCellDef>Email</th>
              <td mat-cell *matCellDef="let t">{{ t.email }}</td>
            </ng-container>
            <ng-container matColumnDef="phone">
              <th mat-header-cell *matHeaderCellDef>Phone</th>
              <td mat-cell *matCellDef="let t">{{ t.phone }}</td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let t">
                <button mat-stroked-button color="primary" (click)="openAssign(t)">
                  <mat-icon>assignment_ind</mat-icon> Assign Subject
                </button>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
          <div *ngIf="!loading && teachers.length === 0" class="empty-state">
            <mat-icon>person_outline</mat-icon>
            <p>No teachers found. Add a teacher to get started.</p>
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
    .form-row mat-form-field { flex: 1; min-width: 180px; }
    .form-actions { display: flex; gap: 12px; margin-top: 8px; }
    .full-width-table { width: 100%; }
    .loading-center { display: flex; justify-content: center; padding: 40px; }
    .empty-state { text-align: center; padding: 48px; color: #999; }
    .empty-state mat-icon { font-size: 48px; height: 48px; width: 48px; display: block; margin: 0 auto 12px; }
    .assign-panel { border-left: 4px solid #3f51b5; }
    .assign-label { font-size: 0.85rem; font-weight: 600; color: #555; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 0.5px; }
    .no-assign-hint { color: #999; font-size: 0.85rem; margin: 0 0 8px; }
    .assignments-list { display: flex; flex-direction: column; gap: 6px; margin-bottom: 4px; }
    .assign-chip { display: flex; align-items: center; gap: 8px; background: #e8eaf6; border-radius: 8px; padding: 6px 10px; font-size: 0.9rem; }
    .assign-chip mat-icon { font-size: 18px; width: 18px; height: 18px; color: #3f51b5; }
    .remove-btn { margin-left: auto; width: 28px; height: 28px; line-height: 28px; color: #e53935; }
    .remove-btn mat-icon { font-size: 18px; width: 18px; height: 18px; }
  `]
})
export class TeachersComponent implements OnInit {
  teachers: Teacher[] = [];
  classes: any[] = [];
  sections: any[] = [];
  subjects: any[] = [];
  displayedColumns = ['fullName', 'username', 'email', 'phone', 'actions'];
  teacherForm: FormGroup;
  assignForm: FormGroup;
  showForm = false;
  loading = false;
  saving = false;
  assigning = false;
  selectedTeacher: Teacher | null = null;
  currentAssignments: TeacherAssignment[] = [];

  constructor(
    private teacherService: TeacherService,
    private adminService: AdminService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.teacherForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      username: ['', Validators.required],
      password: ['', Validators.required],
      phone: ['']
    });
    this.assignForm = this.fb.group({
      subjectId: ['', Validators.required],
      classId: ['', Validators.required],
      sectionId: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadTeachers();
    this.adminService.getClasses().subscribe({ next: c => this.classes = c, error: () => {} });
    this.adminService.getSections().subscribe({ next: s => this.sections = s, error: () => {} });
    this.adminService.getSubjects().subscribe({ next: s => this.subjects = s, error: () => {} });
  }

  loadTeachers(): void {
    this.loading = true;
    this.teacherService.getTeachers().subscribe({
      next: t => { this.teachers = t; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  onSubmit(): void {
    if (this.teacherForm.invalid) return;
    this.saving = true;
    this.teacherService.createTeacher(this.teacherForm.value).subscribe({
      next: () => {
        this.saving = false;
        this.snackBar.open('Teacher created!', 'Close', { duration: 3000 });
        this.showForm = false;
        this.teacherForm.reset();
        this.loadTeachers();
      },
      error: (err) => {
        this.saving = false;
        this.snackBar.open(err.error?.message || 'Error creating teacher', 'Close', { duration: 3000 });
      }
    });
  }

  openAssign(teacher: Teacher): void {
    this.selectedTeacher = teacher;
    this.assignForm.reset();
    this.currentAssignments = [];
    this.teacherService.getTeacherAssignments(teacher.id).subscribe({
      next: a => this.currentAssignments = a,
      error: () => {}
    });
  }

  closeAssign(): void {
    this.selectedTeacher = null;
    this.currentAssignments = [];
    this.assignForm.reset();
  }

  onAssign(): void {
    if (!this.selectedTeacher || this.assignForm.invalid) return;
    this.assigning = true;
    this.teacherService.assignTeacher(this.selectedTeacher.id, this.assignForm.value).subscribe({
      next: (a) => {
        this.currentAssignments = [...this.currentAssignments, a];
        this.assignForm.reset();
        this.assigning = false;
        this.snackBar.open('Assignment added!', 'Close', { duration: 2500 });
      },
      error: (err) => {
        this.assigning = false;
        this.snackBar.open(err.error?.message || 'Error assigning teacher', 'Close', { duration: 3000 });
      }
    });
  }

  removeAssignment(assignment: TeacherAssignment): void {
    this.teacherService.removeAssignment(assignment.id).subscribe({
      next: () => {
        this.currentAssignments = this.currentAssignments.filter(a => a.id !== assignment.id);
        this.snackBar.open('Assignment removed.', 'Close', { duration: 2500 });
      },
      error: (err) => this.snackBar.open(err.error?.message || 'Error removing assignment', 'Close', { duration: 3000 })
    });
  }
}
