import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { HttpClient, HttpHeaders } from '@angular/common/http';

interface Assignment {
  id: number;
  teacherId: number;
  teacherName: string;
  subjectId: number;
  subjectName: string;
  classId: number;
  className: string;
  sectionId: number;
  sectionName: string;
}

interface TeacherGroup {
  teacherName: string;
  assignments: Assignment[];
  expanded: boolean;
}

interface Teacher { id: number; fullName: string; }

@Component({
  selector: 'app-class-schedule',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatCardModule, MatButtonModule, MatIconModule, MatTableModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatProgressSpinnerModule, MatSnackBarModule, NavbarComponent
  ],
  template: `
    <app-navbar></app-navbar>
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1>Class Schedule</h1>
          <p class="subtitle">Overview of teacher–subject–class assignments</p>
        </div>
      </div>

      <div *ngIf="loading" class="loading-center"><mat-spinner diameter="40"></mat-spinner></div>

      <ng-container *ngIf="!loading">
        <!-- Filter bar -->
        <div class="filter-bar">
          <mat-form-field appearance="outline" class="filter-search">
            <mat-label>Search teacher, subject or class</mat-label>
            <mat-icon matPrefix>search</mat-icon>
            <input matInput [(ngModel)]="searchQuery" (ngModelChange)="applyFilter()" placeholder="e.g. Ramesh or Maths">
            <button matSuffix mat-icon-button *ngIf="searchQuery" (click)="searchQuery=''; applyFilter()">
              <mat-icon>close</mat-icon>
            </button>
          </mat-form-field>
          <mat-form-field appearance="outline" class="filter-select">
            <mat-label>View as</mat-label>
            <mat-select [(ngModel)]="viewMode" (ngModelChange)="applyFilter()">
              <mat-option value="table">Table View</mat-option>
              <mat-option value="teacher">Group by Teacher</mat-option>
            </mat-select>
          </mat-form-field>
          <span class="result-count">{{ filteredAssignments.length }} assignment{{ filteredAssignments.length !== 1 ? 's' : '' }}</span>
        </div>

        <!-- TABLE VIEW -->
        <mat-card *ngIf="viewMode === 'table'">
          <mat-card-content>
            <table mat-table [dataSource]="filteredAssignments" class="full-table">
              <ng-container matColumnDef="teacher">
                <th mat-header-cell *matHeaderCellDef>Teacher</th>
                <td mat-cell *matCellDef="let a">
                  <div class="teacher-cell">
                    <mat-icon class="small-icon">person</mat-icon>
                    {{ a.teacherName }}
                  </div>
                </td>
              </ng-container>
              <ng-container matColumnDef="subject">
                <th mat-header-cell *matHeaderCellDef>Subject</th>
                <td mat-cell *matCellDef="let a">
                  <span class="subject-badge">{{ a.subjectName }}</span>
                </td>
              </ng-container>
              <ng-container matColumnDef="class">
                <th mat-header-cell *matHeaderCellDef>Class</th>
                <td mat-cell *matCellDef="let a">Class {{ a.className }}</td>
              </ng-container>
              <ng-container matColumnDef="section">
                <th mat-header-cell *matHeaderCellDef>Section</th>
                <td mat-cell *matCellDef="let a">
                  <span class="section-chip">{{ a.sectionName }}</span>
                </td>
              </ng-container>
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let a">
                  <button mat-icon-button color="primary" title="Reassign Teacher" (click)="openReassign(a)">
                    <mat-icon>swap_horiz</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" title="Remove Assignment" (click)="confirmRemove(a)">
                    <mat-icon>delete</mat-icon>
                  </button>
                </td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="cols; sticky: true"></tr>
              <tr mat-row *matRowDef="let row; columns: cols;"></tr>
            </table>
            <div *ngIf="filteredAssignments.length === 0" class="empty-state">
              <mat-icon>search_off</mat-icon>
              <p>No assignments match your search.</p>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- GROUP BY TEACHER VIEW -->
        <div *ngIf="viewMode === 'teacher'" class="teacher-groups">
          <mat-card *ngFor="let group of filteredGroups" class="teacher-card">
            <mat-card-header (click)="group.expanded = !group.expanded" style="cursor:pointer">
              <mat-icon mat-card-avatar style="color:#3f51b5">person</mat-icon>
              <mat-card-title>{{ group.teacherName }}</mat-card-title>
              <mat-card-subtitle>{{ group.assignments.length }} assignment{{ group.assignments.length !== 1 ? 's' : '' }}</mat-card-subtitle>
              <mat-icon style="margin-left:auto">{{ group.expanded ? 'expand_less' : 'expand_more' }}</mat-icon>
            </mat-card-header>
            <mat-card-content *ngIf="group.expanded">
              <div class="assign-list">
                <div class="assign-row" *ngFor="let a of group.assignments">
                  <span class="subject-badge">{{ a.subjectName }}</span>
                  <mat-icon class="arrow-small">arrow_forward</mat-icon>
                  <span class="class-label">Class {{ a.className }}</span>
                  <span class="section-chip">{{ a.sectionName }}</span>
                  <span style="flex:1"></span>
                  <button mat-icon-button color="primary" title="Reassign" (click)="openReassign(a)" style="transform:scale(0.85)">
                    <mat-icon>swap_horiz</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" title="Remove" (click)="confirmRemove(a)" style="transform:scale(0.85)">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
          <div *ngIf="filteredGroups.length === 0" class="empty-state">
            <mat-icon>search_off</mat-icon>
            <p>No assignments match your search.</p>
          </div>
        </div>
      </ng-container>
    </div>

    <!-- Reassign Overlay -->
    <div class="overlay" *ngIf="reassignTarget" (click)="cancelReassign()">
      <mat-card class="overlay-dialog" (click)="$event.stopPropagation()">
        <mat-card-title>
          <mat-icon style="color:#1976d2">swap_horiz</mat-icon>
          Reassign Teacher
        </mat-card-title>
        <mat-card-content>
          <div class="slot-info">
            <span class="subject-badge">{{ reassignTarget.subjectName }}</span>
            <mat-icon class="arrow-small">arrow_forward</mat-icon>
            <span>Class {{ reassignTarget.className }}</span>
            <span class="section-chip">{{ reassignTarget.sectionName }}</span>
          </div>
          <p class="current-teacher">Current teacher: <strong>{{ reassignTarget.teacherName }}</strong></p>
          <mat-form-field appearance="outline" style="width:100%;margin-top:8px">
            <mat-label>Select New Teacher</mat-label>
            <mat-select [(ngModel)]="newTeacherId">
              <mat-option *ngFor="let t of teachers" [value]="t.id"
                [disabled]="t.id === reassignTarget.teacherId">
                {{ t.fullName }}{{ t.id === reassignTarget.teacherId ? ' (current)' : '' }}
              </mat-option>
            </mat-select>
          </mat-form-field>
        </mat-card-content>
        <mat-card-actions align="end">
          <button mat-stroked-button (click)="cancelReassign()">Cancel</button>
          <button mat-raised-button color="primary" [disabled]="!newTeacherId || newTeacherId === reassignTarget.teacherId || saving"
            (click)="executeReassign()">
            <mat-spinner diameter="16" *ngIf="saving" style="display:inline-block;margin-right:6px"></mat-spinner>
            {{ saving ? 'Saving...' : 'Reassign' }}
          </button>
        </mat-card-actions>
      </mat-card>
    </div>

    <!-- Remove Confirm Overlay -->
    <div class="overlay" *ngIf="removeTarget" (click)="cancelRemove()">
      <mat-card class="overlay-dialog" (click)="$event.stopPropagation()">
        <mat-card-title>
          <mat-icon style="color:#c62828">warning</mat-icon>
          Remove Assignment
        </mat-card-title>
        <mat-card-content>
          <p>Remove <strong>{{ removeTarget.teacherName }}</strong> from teaching
            <strong>{{ removeTarget.subjectName }}</strong> for
            <strong>Class {{ removeTarget.className }} – {{ removeTarget.sectionName }}</strong>?
          </p>
        </mat-card-content>
        <mat-card-actions align="end">
          <button mat-stroked-button (click)="cancelRemove()">Cancel</button>
          <button mat-raised-button color="warn" [disabled]="saving" (click)="executeRemove()">
            <mat-spinner diameter="16" *ngIf="saving" style="display:inline-block;margin-right:6px"></mat-spinner>
            {{ saving ? 'Removing...' : 'Remove' }}
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; max-width: 1100px; margin: 0 auto; }
    .page-header { margin-bottom: 20px; }
    .page-header h1 { margin: 0 0 4px; font-size: 1.8rem; font-weight: 500; color: #6a1b9a; }
    .subtitle { margin: 0; color: #666; }
    .filter-bar { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; margin-bottom: 16px; }
    .filter-search { flex: 2; min-width: 240px; }
    .filter-select { flex: 1; min-width: 160px; }
    .result-count { font-size: 0.85rem; color: #666; white-space: nowrap; }
    .full-table { width: 100%; }
    .loading-center { display: flex; justify-content: center; padding: 60px; }
    .teacher-cell { display: flex; align-items: center; gap: 6px; }
    .small-icon { font-size: 18px; width: 18px; height: 18px; color: #9e9e9e; }
    .subject-badge { background: #ede7f6; color: #6a1b9a; padding: 3px 10px; border-radius: 12px; font-size: 0.82rem; font-weight: 500; }
    .section-chip { background: #e3f2fd; color: #1565c0; padding: 3px 10px; border-radius: 12px; font-size: 0.82rem; font-weight: 500; }
    .class-label { font-weight: 500; }
    .empty-state { text-align: center; padding: 48px; color: #999; }
    .empty-state mat-icon { font-size: 48px; width: 48px; height: 48px; display: block; margin: 0 auto 12px; }
    .teacher-groups { display: flex; flex-direction: column; gap: 12px; }
    .teacher-card mat-card-header { padding: 8px 16px; border-radius: 8px; }
    .teacher-card mat-card-header:hover { background: #f5f5f5; }
    .assign-list { display: flex; flex-direction: column; gap: 10px; padding: 8px 0 4px; }
    .assign-row { display: flex; align-items: center; gap: 10px; padding: 8px 12px; background: #fafafa; border-radius: 8px; }
    .arrow-small { font-size: 18px; width: 18px; height: 18px; color: #bbb; }
    .overlay { position: fixed; inset: 0; background: rgba(0,0,0,.55); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 16px; }
    .overlay-dialog { max-width: 460px; width: 100%; }
    .overlay-dialog mat-card-title { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; }
    .slot-info { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; padding: 10px; background: #f5f5f5; border-radius: 8px; margin-bottom: 8px; }
    .current-teacher { color: #666; font-size: 0.9rem; margin: 4px 0 0; }
  `]
})
export class ClassScheduleComponent implements OnInit {
  assignments: Assignment[] = [];
  filteredAssignments: Assignment[] = [];
  filteredGroups: TeacherGroup[] = [];
  teachers: Teacher[] = [];
  loading = true;
  saving = false;
  searchQuery = '';
  viewMode: 'table' | 'teacher' = 'table';
  cols = ['teacher', 'subject', 'class', 'section', 'actions'];

  reassignTarget: Assignment | null = null;
  newTeacherId: number | null = null;
  removeTarget: Assignment | null = null;

  private apiUrl = 'http://localhost:8080/api/admin';

  constructor(private http: HttpClient, private snackBar: MatSnackBar) {}

  private get headers() {
    return new HttpHeaders({ Authorization: 'Bearer ' + localStorage.getItem('token') });
  }

  ngOnInit(): void {
    this.loadAll();
    this.http.get<Teacher[]>(`${this.apiUrl}/teachers`, { headers: this.headers }).subscribe({
      next: t => this.teachers = t, error: () => {}
    });
  }

  loadAll(): void {
    this.loading = true;
    this.http.get<any[]>(`${this.apiUrl}/teachers`, { headers: this.headers }).subscribe({
      next: teachers => {
        const requests = teachers.map(t =>
          this.http.get<Assignment[]>(`${this.apiUrl}/teachers/${t.id}/assignments`, { headers: this.headers }).toPromise()
        );
        Promise.all(requests).then(results => {
          this.assignments = (results as Assignment[][]).flat();
          this.applyFilter();
          this.loading = false;
        });
      },
      error: () => { this.loading = false; }
    });
  }

  applyFilter(): void {
    const q = this.searchQuery.toLowerCase().trim();
    this.filteredAssignments = this.assignments.filter(a =>
      !q ||
      a.teacherName.toLowerCase().includes(q) ||
      a.subjectName.toLowerCase().includes(q) ||
      a.className.toLowerCase().includes(q) ||
      a.sectionName.toLowerCase().includes(q)
    );
    const map = new Map<string, TeacherGroup>();
    for (const a of this.filteredAssignments) {
      if (!map.has(a.teacherName)) {
        map.set(a.teacherName, { teacherName: a.teacherName, assignments: [], expanded: true });
      }
      map.get(a.teacherName)!.assignments.push(a);
    }
    this.filteredGroups = Array.from(map.values());
  }

  openReassign(a: Assignment): void {
    this.reassignTarget = a;
    this.newTeacherId = null;
  }

  cancelReassign(): void {
    this.reassignTarget = null;
    this.newTeacherId = null;
  }

  executeReassign(): void {
    if (!this.reassignTarget || !this.newTeacherId) return;
    this.saving = true;
    const target = this.reassignTarget;
    // Delete old assignment, then create new one with the new teacher
    this.http.delete(`${this.apiUrl}/teachers/assignments/${target.id}`, { headers: this.headers }).subscribe({
      next: () => {
        const body = { subjectId: target.subjectId, classId: target.classId, sectionId: target.sectionId };
        this.http.post(`${this.apiUrl}/teachers/${this.newTeacherId}/assign`, body, { headers: this.headers }).subscribe({
          next: () => {
            this.saving = false;
            this.cancelReassign();
            this.snackBar.open('Teacher reassigned successfully.', 'Close', { duration: 3000 });
            this.loadAll();
          },
          error: err => {
            this.saving = false;
            this.snackBar.open(err?.error?.message || 'Reassign failed', 'Close', { duration: 4000 });
          }
        });
      },
      error: () => { this.saving = false; this.snackBar.open('Failed to remove old assignment', 'Close', { duration: 4000 }); }
    });
  }

  confirmRemove(a: Assignment): void {
    this.removeTarget = a;
  }

  cancelRemove(): void {
    this.removeTarget = null;
  }

  executeRemove(): void {
    if (!this.removeTarget) return;
    this.saving = true;
    this.http.delete(`${this.apiUrl}/teachers/assignments/${this.removeTarget.id}`, { headers: this.headers }).subscribe({
      next: () => {
        this.saving = false;
        this.snackBar.open('Assignment removed.', 'Close', { duration: 3000 });
        this.cancelRemove();
        this.loadAll();
      },
      error: () => { this.saving = false; this.snackBar.open('Failed to remove assignment', 'Close', { duration: 4000 }); }
    });
  }
}
