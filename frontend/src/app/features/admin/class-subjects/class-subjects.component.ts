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
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { HttpClient } from '@angular/common/http';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-class-subjects',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatCardModule, MatFormFieldModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatSnackBarModule,
    MatProgressSpinnerModule, MatDividerModule, MatTabsModule,
    MatTooltipModule, MatChipsModule, NavbarComponent
  ],
  template: `
    <app-navbar></app-navbar>
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Class-Subject Management</h1>
          <p class="page-subtitle">Assign which subjects each class teaches. Different classes can have different subjects.</p>
        </div>
      </div>

      <mat-tab-group animationDuration="200ms" class="main-tabs" [(selectedIndex)]="activeTab">

        <!-- ───────── TAB 1: Overview ───────── -->
        <mat-tab label="📊 Overview — All Classes">
          <div class="tab-content">
            <div class="overview-toolbar">
              <span class="ov-info">Click any class row to jump to edit mode.</span>
              <button mat-stroked-button color="primary" (click)="loadOverview()" [disabled]="overviewLoading">
                <mat-icon>refresh</mat-icon> Refresh
              </button>
            </div>

            <div *ngIf="overviewLoading" class="center-spinner">
              <mat-spinner diameter="40"></mat-spinner>
            </div>

            <div class="overview-grid" *ngIf="!overviewLoading">
              <div class="ov-card" *ngFor="let row of overviewRows" (click)="jumpToEdit(row)">
                <div class="ov-class-badge">Class {{ row.className }}</div>
                <div class="ov-count" [class.ov-zero]="row.subjects.length === 0">
                  {{ row.subjects.length }} subject{{ row.subjects.length !== 1 ? 's' : '' }}
                </div>
                <div class="ov-chips" *ngIf="row.subjects.length > 0">
                  <span class="ov-chip" *ngFor="let s of row.subjects">{{ s.subjectName }}</span>
                </div>
                <div class="ov-empty" *ngIf="row.subjects.length === 0">No subjects yet</div>
                <div class="ov-action">
                  <mat-icon>edit</mat-icon> Click to manage
                </div>
              </div>
            </div>
          </div>
        </mat-tab>

        <!-- ───────── TAB 2: Manage Subjects ───────── -->
        <mat-tab label="✏️ Manage Subjects">
          <div class="tab-content layout">

            <!-- Left: Class selector -->
            <mat-card class="class-card">
              <mat-card-header>
                <mat-card-title>Select Class</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="class-list">
                  <button *ngFor="let c of classes"
                          [class.active]="selectedClass?.id === c.id"
                          class="class-btn"
                          (click)="selectClass(c)">
                    <span class="class-name">Class {{ c.className }}</span>
                    <span class="class-count" [class.zero]="getCount(c.id) === 0">
                      {{ getCount(c.id) }}
                    </span>
                  </button>
                </div>
              </mat-card-content>
            </mat-card>

            <!-- Right: Subject management -->
            <mat-card class="subject-card" *ngIf="selectedClass">
              <mat-card-header>
                <mat-card-title>Subjects for Class {{ selectedClass.className }}</mat-card-title>
                <mat-card-subtitle>{{ assignedSubjects.length }} subject(s) assigned</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>

                <!-- Assigned subjects list -->
                <div class="assigned-list" *ngIf="assignedSubjects.length > 0">
                  <div class="subject-row" *ngFor="let s of assignedSubjects; let i = index">

                    <!-- VIEW mode -->
                    <ng-container *ngIf="editingIndex !== i">
                      <mat-icon class="row-icon">book</mat-icon>
                      <span class="row-name">{{ s.subjectName }}</span>
                      <div class="row-actions">
                        <button mat-icon-button color="primary" matTooltip="Edit subject" (click)="startEdit(i)">
                          <mat-icon>edit</mat-icon>
                        </button>
                        <button mat-icon-button color="warn" matTooltip="Remove subject" (click)="removeSubject(s)">
                          <mat-icon>delete</mat-icon>
                        </button>
                      </div>
                    </ng-container>

                    <!-- EDIT mode — swap to a different subject -->
                    <ng-container *ngIf="editingIndex === i">
                      <mat-icon class="row-icon edit-mode">edit</mat-icon>
                      <mat-form-field appearance="outline" class="edit-select">
                        <mat-label>Change subject</mat-label>
                        <mat-select [(ngModel)]="editSubjectId">
                          <!-- current -->
                          <mat-option [value]="s.subjectId">{{ s.subjectName }} (current)</mat-option>
                          <!-- other unassigned -->
                          <mat-option *ngFor="let av of availableSubjects" [value]="av.id">{{ av.subjectName }}</mat-option>
                        </mat-select>
                      </mat-form-field>
                      <div class="row-actions">
                        <button mat-icon-button color="primary" matTooltip="Save" (click)="saveEdit(s, i)" [disabled]="saving">
                          <mat-icon>check</mat-icon>
                        </button>
                        <button mat-icon-button matTooltip="Cancel" (click)="cancelEdit()">
                          <mat-icon>close</mat-icon>
                        </button>
                      </div>
                    </ng-container>

                  </div>
                </div>

                <p *ngIf="assignedSubjects.length === 0" class="no-subjects">
                  <mat-icon>info</mat-icon> No subjects assigned yet. Add one below.
                </p>

                <mat-divider style="margin: 20px 0"></mat-divider>

                <!-- Add new subject -->
                <p class="add-label">➕ Add Subject to Class {{ selectedClass.className }}</p>
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

            <!-- Empty state -->
            <div *ngIf="!selectedClass" class="empty-state">
              <mat-icon>school</mat-icon>
              <p>Select a class on the left to manage its subjects.</p>
            </div>

          </div>
        </mat-tab>

      </mat-tab-group>
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; max-width: 1200px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
    .page-title { font-size: 1.8rem; font-weight: 600; color: #3f51b5; margin: 0 0 4px; }
    .page-subtitle { color: #666; margin: 0; }
    .main-tabs { background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .tab-content { padding: 24px; }

    /* ── Overview ── */
    .overview-toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .ov-info { color: #666; font-size: 0.9rem; }
    .center-spinner { display: flex; justify-content: center; padding: 40px; }
    .overview-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; }
    .ov-card {
      background: #fff; border: 2px solid #e8eaf6; border-radius: 12px; padding: 16px;
      cursor: pointer; transition: all 0.2s; position: relative;
    }
    .ov-card:hover { border-color: #3f51b5; box-shadow: 0 4px 12px rgba(63,81,181,0.15); transform: translateY(-2px); }
    .ov-class-badge { font-size: 1.1rem; font-weight: 700; color: #3f51b5; margin-bottom: 6px; }
    .ov-count { font-size: 1.4rem; font-weight: 700; color: #2e7d32; margin-bottom: 10px; }
    .ov-count.ov-zero { color: #bbb; }
    .ov-chips { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 10px; }
    .ov-chip { background: #e8eaf6; color: #3f51b5; border-radius: 12px; padding: 2px 10px; font-size: 0.78rem; font-weight: 500; }
    .ov-empty { color: #bbb; font-style: italic; font-size: 0.85rem; margin-bottom: 10px; }
    .ov-action { display: flex; align-items: center; gap: 4px; font-size: 0.8rem; color: #3f51b5; margin-top: 8px; }
    .ov-action mat-icon { font-size: 14px; width: 14px; height: 14px; }

    /* ── Manage layout ── */
    .layout { display: flex; gap: 20px; align-items: flex-start; flex-wrap: wrap; }
    .class-card { width: 200px; min-width: 180px; flex-shrink: 0; }
    .subject-card { flex: 1; min-width: 320px; }
    .class-list { display: flex; flex-direction: column; gap: 6px; margin-top: 12px; }
    .class-btn {
      display: flex; justify-content: space-between; align-items: center;
      padding: 10px 14px; border: 1.5px solid #e0e0e0; border-radius: 8px;
      background: #fff; cursor: pointer; text-align: left; font-size: 0.9rem;
      transition: all 0.2s;
    }
    .class-btn:hover { background: #e8eaf6; border-color: #3f51b5; }
    .class-btn.active { background: #3f51b5; color: #fff; border-color: #3f51b5; font-weight: 600; }
    .class-name { font-weight: 500; }
    .class-count {
      background: #e8eaf6; color: #3f51b5; border-radius: 10px;
      padding: 1px 8px; font-size: 0.78rem; font-weight: 700; min-width: 22px; text-align: center;
    }
    .class-count.zero { background: #f5f5f5; color: #bbb; }
    .class-btn.active .class-count { background: rgba(255,255,255,0.25); color: #fff; }

    /* ── Subject rows ── */
    .assigned-list { display: flex; flex-direction: column; gap: 6px; margin: 12px 0; }
    .subject-row {
      display: flex; align-items: center; gap: 10px;
      background: #f8f9ff; border: 1px solid #e8eaf6; border-radius: 8px; padding: 8px 12px;
    }
    .row-icon { font-size: 20px; width: 20px; height: 20px; color: #3f51b5; flex-shrink: 0; }
    .row-icon.edit-mode { color: #ff9800; }
    .row-name { flex: 1; font-size: 0.95rem; font-weight: 500; }
    .row-actions { display: flex; gap: 2px; margin-left: auto; }
    .edit-select { flex: 1; margin: 0; }
    ::ng-deep .edit-select .mat-mdc-form-field-subscript-wrapper { display: none; }

    /* ── Add row ── */
    .add-label { font-size: 0.85rem; font-weight: 600; color: #555; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px; }
    .add-row { display: flex; gap: 12px; align-items: center; }
    .no-subjects { display: flex; align-items: center; gap: 6px; color: #999; font-style: italic; }
    .all-assigned { color: #2e7d32; display: flex; align-items: center; gap: 6px; font-size: 0.9rem; margin-top: 8px; }
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
  saving = false;

  // Edit state
  editingIndex = -1;
  editSubjectId: number | null = null;

  // Overview
  overviewRows: { classId: number; className: string; subjects: any[] }[] = [];
  overviewLoading = false;

  // Class subject counts cache
  classSubjectCounts: Record<number, number> = {};

  // Tab index
  activeTab = 0;

  private api = 'http://localhost:8080/api/admin';

  constructor(private http: HttpClient, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.http.get<any[]>(`${this.api}/classes`).subscribe(c => {
      this.classes = c;
      this.loadOverview();
    });
    this.http.get<any[]>(`${this.api}/subjects`).subscribe(s => this.allSubjects = s);
  }

  loadOverview(): void {
    if (this.classes.length === 0) {
      this.http.get<any[]>(`${this.api}/classes`).subscribe(c => {
        this.classes = c;
        this.fetchOverview();
      });
    } else {
      this.fetchOverview();
    }
  }

  fetchOverview(): void {
    this.overviewLoading = true;
    const calls = this.classes.map(c =>
      this.http.get<any[]>(`${this.api}/classes/${c.id}/subjects`)
    );
    forkJoin(calls).subscribe({
      next: (results) => {
        this.overviewRows = this.classes.map((c, i) => ({
          classId: c.id,
          className: c.className,
          subjects: results[i] || []
        }));
        // Update count cache
        this.overviewRows.forEach(r => this.classSubjectCounts[r.classId] = r.subjects.length);
        this.overviewLoading = false;
      },
      error: () => { this.overviewLoading = false; }
    });
  }

  getCount(classId: number): number {
    return this.classSubjectCounts[classId] ?? 0;
  }

  jumpToEdit(row: any): void {
    const cls = this.classes.find(c => c.id === row.classId);
    if (cls) {
      this.selectClass(cls);
      // Switch to manage tab (tab index 1)
      this.activeTab = 1;
    }
  }

  get availableSubjects(): any[] {
    const assignedIds = new Set(this.assignedSubjects.map(s => s.subjectId));
    return this.allSubjects.filter(s => !assignedIds.has(s.id));
  }

  selectClass(cls: any): void {
    this.selectedClass = cls;
    this.selectedSubjectId = null;
    this.cancelEdit();
    this.loadAssigned();
  }

  loadAssigned(): void {
    if (!this.selectedClass) return;
    this.http.get<any[]>(`${this.api}/classes/${this.selectedClass.id}/subjects`)
      .subscribe({
        next: s => {
          this.assignedSubjects = s || [];
          this.classSubjectCounts[this.selectedClass.id] = this.assignedSubjects.length;
        },
        error: (err) => {
          this.snackBar.open('Failed to load subjects: ' + (err.error?.message || err.message || 'Server error'), 'Close', { duration: 4000 });
        }
      });
  }

  addSubject(): void {
    if (!this.selectedClass || !this.selectedSubjectId) return;
    this.adding = true;
    this.http.post<any>(`${this.api}/classes/${this.selectedClass.id}/subjects`, { subjectId: this.selectedSubjectId })
      .subscribe({
        next: s => {
          this.assignedSubjects = [...this.assignedSubjects, s];
          this.classSubjectCounts[this.selectedClass.id] = this.assignedSubjects.length;
          this.selectedSubjectId = null;
          this.adding = false;
          this.snackBar.open('Subject assigned!', 'Close', { duration: 2500 });
          this.syncOverviewRow();
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
          this.classSubjectCounts[this.selectedClass.id] = this.assignedSubjects.length;
          this.snackBar.open('Subject removed.', 'Close', { duration: 2500 });
          this.syncOverviewRow();
        },
        error: (err) => this.snackBar.open(err.error?.message || 'Error removing subject', 'Close', { duration: 3000 })
      });
  }

  // ── Edit subject (swap) ──
  startEdit(index: number): void {
    this.editingIndex = index;
    this.editSubjectId = this.assignedSubjects[index].subjectId;
  }

  cancelEdit(): void {
    this.editingIndex = -1;
    this.editSubjectId = null;
  }

  saveEdit(original: any, index: number): void {
    if (!this.editSubjectId || this.editSubjectId === original.subjectId) {
      this.cancelEdit();
      return;
    }
    this.saving = true;
    // Remove old, then add new
    this.http.delete(`${this.api}/classes/${this.selectedClass.id}/subjects/${original.subjectId}`)
      .subscribe({
        next: () => {
          this.http.post<any>(`${this.api}/classes/${this.selectedClass.id}/subjects`, { subjectId: this.editSubjectId })
            .subscribe({
              next: newEntry => {
                this.assignedSubjects[index] = newEntry;
                this.assignedSubjects = [...this.assignedSubjects];
                this.saving = false;
                this.cancelEdit();
                this.snackBar.open('Subject updated!', 'Close', { duration: 2500 });
                this.syncOverviewRow();
              },
              error: (err) => {
                this.saving = false;
                this.snackBar.open(err.error?.message || 'Error updating subject', 'Close', { duration: 3000 });
              }
            });
        },
        error: (err) => {
          this.saving = false;
          this.snackBar.open(err.error?.message || 'Error updating subject', 'Close', { duration: 3000 });
        }
      });
  }

  syncOverviewRow(): void {
    if (!this.selectedClass) return;
    const rowIndex = this.overviewRows.findIndex(r => r.classId === this.selectedClass.id);
    if (rowIndex >= 0) {
      this.overviewRows[rowIndex] = {
        ...this.overviewRows[rowIndex],
        subjects: [...this.assignedSubjects]
      };
    }
  }
}
