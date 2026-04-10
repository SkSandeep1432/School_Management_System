import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { StudentService } from '../../../core/services/student.service';
import { TeacherService } from '../../../core/services/teacher.service';
import { ExamService } from '../../../core/services/exam.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    NavbarComponent
  ],
  template: `
    <app-navbar></app-navbar>
    <div class="dashboard-container">
      <h1 class="dashboard-title">Admin Dashboard</h1>
      <p class="welcome-text">Welcome, {{ username }}! Manage your school from here.</p>

      <div class="stats-grid">
        <mat-card class="stat-card students-card">
          <mat-card-content>
            <div class="stat-content">
              <mat-icon class="stat-icon">people</mat-icon>
              <div class="stat-info">
                <div class="stat-number">{{ studentCount }}</div>
                <div class="stat-label">Total Students</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card teachers-card">
          <mat-card-content>
            <div class="stat-content">
              <mat-icon class="stat-icon">person</mat-icon>
              <div class="stat-info">
                <div class="stat-number">{{ teacherCount }}</div>
                <div class="stat-label">Total Teachers</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card exams-card">
          <mat-card-content>
            <div class="stat-content">
              <mat-icon class="stat-icon">assignment</mat-icon>
              <div class="stat-info">
                <div class="stat-number">{{ examCount }}</div>
                <div class="stat-label">Total Exams</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <h2 class="section-title">Quick Actions</h2>
      <div class="actions-grid">
        <mat-card class="action-card" routerLink="/admin/students">
          <mat-card-content>
            <mat-icon class="action-icon">people</mat-icon>
            <h3>Manage Students</h3>
            <p>Add, edit or remove students</p>
          </mat-card-content>
        </mat-card>

        <mat-card class="action-card" routerLink="/admin/teachers">
          <mat-card-content>
            <mat-icon class="action-icon">person_add</mat-icon>
            <h3>Manage Teachers</h3>
            <p>Add teachers and assign subjects</p>
          </mat-card-content>
        </mat-card>

        <mat-card class="action-card" routerLink="/admin/exams">
          <mat-card-content>
            <mat-icon class="action-icon">assignment</mat-icon>
            <h3>Manage Exams</h3>
            <p>Create and lock exams</p>
          </mat-card-content>
        </mat-card>

        <mat-card class="action-card" routerLink="/admin/marks-status">
          <mat-card-content>
            <mat-icon class="action-icon">bar_chart</mat-icon>
            <h3>Marks Status</h3>
            <p>View marks entry progress</p>
          </mat-card-content>
        </mat-card>

        <mat-card class="action-card" routerLink="/admin/reports">
          <mat-card-content>
            <mat-icon class="action-icon">send</mat-icon>
            <h3>Send Reports</h3>
            <p>Email report cards to parents</p>
          </mat-card-content>
        </mat-card>

        <mat-card class="action-card promotion-card" routerLink="/admin/promotion">
          <mat-card-content>
            <mat-icon class="action-icon">upgrade</mat-icon>
            <h3>Year-End Promotion</h3>
            <p>Promote students to the next class</p>
          </mat-card-content>
        </mat-card>

        <mat-card class="action-card subjects-card" routerLink="/admin/subjects">
          <mat-card-content>
            <mat-icon class="action-icon">menu_book</mat-icon>
            <h3>Manage Subjects</h3>
            <p>Add or view school subjects</p>
          </mat-card-content>
        </mat-card>

        <mat-card class="action-card schedule-card" routerLink="/admin/class-schedule">
          <mat-card-content>
            <mat-icon class="action-icon">event_note</mat-icon>
            <h3>Class Schedule</h3>
            <p>View teacher–subject–class assignments</p>
          </mat-card-content>
        </mat-card>

        <mat-card class="action-card progress-card" routerLink="/admin/teacher-progress">
          <mat-card-content>
            <mat-icon class="action-icon">trending_up</mat-icon>
            <h3>Teacher Progress</h3>
            <p>Track marks entry progress per teacher</p>
          </mat-card-content>
        </mat-card>

        <mat-card class="action-card announce-all-card" routerLink="/admin/announcements">
          <mat-card-content>
            <mat-icon class="action-icon">campaign</mat-icon>
            <h3>Announcement</h3>
            <p>Send message to all parents &amp; teachers</p>
          </mat-card-content>
        </mat-card>

        <mat-card class="action-card announce-teachers-card" routerLink="/admin/announcements" [queryParams]="{audience:'teachers'}">
          <mat-card-content>
            <mat-icon class="action-icon">mark_email_read</mat-icon>
            <h3>Teacher Mail</h3>
            <p>Send email to all teachers only</p>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }
    .dashboard-title {
      font-size: 2rem;
      font-weight: 500;
      margin-bottom: 4px;
      color: #3f51b5;
    }
    .welcome-text { color: #666; margin-bottom: 32px; }
    .section-title { font-size: 1.3rem; font-weight: 500; margin: 32px 0 16px; color: #333; }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 8px;
    }
    .stat-card { border-radius: 12px; }
    .students-card { border-left: 5px solid #3f51b5; }
    .teachers-card { border-left: 5px solid #4caf50; }
    .exams-card    { border-left: 5px solid #ff9800; }
    .stat-content { display: flex; align-items: center; gap: 16px; padding: 8px 0; }
    .stat-icon { font-size: 40px; height: 40px; width: 40px; color: #9e9e9e; }
    .stat-number { font-size: 2rem; font-weight: 700; line-height: 1; }
    .stat-label { font-size: 0.85rem; color: #666; margin-top: 4px; }
    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 16px;
    }
    .action-card {
      cursor: pointer;
      border-radius: 12px;
      transition: transform 0.2s, box-shadow 0.2s;
      text-align: center;
    }
    .action-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.12); }
    .action-icon { font-size: 40px; height: 40px; width: 40px; color: #3f51b5; margin-bottom: 8px; }
    .action-card h3 { margin: 8px 0 4px; font-size: 1rem; font-weight: 500; }
    .action-card p { margin: 0; font-size: 0.85rem; color: #666; }
    .promotion-card { border-left: 4px solid #ff6f00; }
    .promotion-card .action-icon { color: #ff6f00; }
    .subjects-card { border-left: 4px solid #00796b; }
    .subjects-card .action-icon { color: #00796b; }
    .schedule-card { border-left: 4px solid #6a1b9a; }
    .schedule-card .action-icon { color: #6a1b9a; }
    .progress-card { border-left: 4px solid #1565c0; }
    .progress-card .action-icon { color: #1565c0; }
    .announce-all-card { border-left: 4px solid #e65100; }
    .announce-all-card .action-icon { color: #e65100; }
    .announce-teachers-card { border-left: 4px solid #c62828; }
    .announce-teachers-card .action-icon { color: #c62828; }
  `]
})
export class AdminDashboardComponent implements OnInit {
  username = localStorage.getItem('username') || 'Admin';
  studentCount = 0;
  teacherCount = 0;
  examCount = 0;

  constructor(
    private studentService: StudentService,
    private teacherService: TeacherService,
    private examService: ExamService
  ) {}

  ngOnInit(): void {
    this.studentService.getStudents().subscribe({ next: s => this.studentCount = s.length, error: () => {} });
    this.teacherService.getTeachers().subscribe({ next: t => this.teacherCount = t.length, error: () => {} });
    this.examService.getExams().subscribe({ next: e => this.examCount = e.length, error: () => {} });
  }
}
