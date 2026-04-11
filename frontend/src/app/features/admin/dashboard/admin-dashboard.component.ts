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

      <!-- Header -->
      <div class="dash-header">
        <div>
          <h1 class="dash-title">Admin Dashboard</h1>
          <p class="dash-sub">Good day, <strong>{{ username }}</strong>! Here's your school at a glance.</p>
        </div>
        <div class="date-badge">
          <mat-icon>calendar_today</mat-icon>
          <span>{{ today }}</span>
        </div>
      </div>

      <!-- Stats Row -->
      <div class="stats-row">
        <div class="stat-card s-blue">
          <div class="stat-icon-wrap"><mat-icon>groups</mat-icon></div>
          <div class="stat-body">
            <div class="stat-num">{{ studentCount }}</div>
            <div class="stat-lbl">Total Students</div>
          </div>
          <div class="stat-bg-icon"><mat-icon>groups</mat-icon></div>
        </div>
        <div class="stat-card s-green">
          <div class="stat-icon-wrap"><mat-icon>person</mat-icon></div>
          <div class="stat-body">
            <div class="stat-num">{{ teacherCount }}</div>
            <div class="stat-lbl">Total Teachers</div>
          </div>
          <div class="stat-bg-icon"><mat-icon>person</mat-icon></div>
        </div>
        <div class="stat-card s-orange">
          <div class="stat-icon-wrap"><mat-icon>assignment</mat-icon></div>
          <div class="stat-body">
            <div class="stat-num">{{ examCount }}</div>
            <div class="stat-lbl">Total Exams</div>
          </div>
          <div class="stat-bg-icon"><mat-icon>assignment</mat-icon></div>
        </div>
      </div>

      <!-- Quick Actions -->
      <h2 class="section-heading"><mat-icon>apps</mat-icon> Quick Actions</h2>
      <div class="actions-grid">

        <div class="action-card ac-indigo" routerLink="/admin/students">
          <div class="ac-icon"><mat-icon>groups</mat-icon></div>
          <div class="ac-body"><div class="ac-title">Students</div><div class="ac-sub">Add, edit, remove</div></div>
          <mat-icon class="ac-arrow">chevron_right</mat-icon>
        </div>

        <div class="action-card ac-teal" routerLink="/admin/teachers">
          <div class="ac-icon"><mat-icon>person_add</mat-icon></div>
          <div class="ac-body"><div class="ac-title">Teachers</div><div class="ac-sub">Manage &amp; assign</div></div>
          <mat-icon class="ac-arrow">chevron_right</mat-icon>
        </div>

        <div class="action-card ac-purple" routerLink="/admin/exams">
          <div class="ac-icon"><mat-icon>assignment</mat-icon></div>
          <div class="ac-body"><div class="ac-title">Exams</div><div class="ac-sub">Create &amp; lock</div></div>
          <mat-icon class="ac-arrow">chevron_right</mat-icon>
        </div>

        <div class="action-card ac-blue" routerLink="/admin/marks-status">
          <div class="ac-icon"><mat-icon>bar_chart</mat-icon></div>
          <div class="ac-body"><div class="ac-title">Marks Status</div><div class="ac-sub">Entry progress</div></div>
          <mat-icon class="ac-arrow">chevron_right</mat-icon>
        </div>

        <div class="action-card ac-green" routerLink="/admin/reports">
          <div class="ac-icon"><mat-icon>send</mat-icon></div>
          <div class="ac-body"><div class="ac-title">Send Reports</div><div class="ac-sub">Email to parents</div></div>
          <mat-icon class="ac-arrow">chevron_right</mat-icon>
        </div>

        <div class="action-card ac-amber" routerLink="/admin/promotion">
          <div class="ac-icon"><mat-icon>upgrade</mat-icon></div>
          <div class="ac-body"><div class="ac-title">Year Promotion</div><div class="ac-sub">Promote to next class</div></div>
          <mat-icon class="ac-arrow">chevron_right</mat-icon>
        </div>

        <div class="action-card ac-cyan" routerLink="/admin/subjects">
          <div class="ac-icon"><mat-icon>menu_book</mat-icon></div>
          <div class="ac-body"><div class="ac-title">Subjects</div><div class="ac-sub">Add or view</div></div>
          <mat-icon class="ac-arrow">chevron_right</mat-icon>
        </div>

        <div class="action-card ac-violet" routerLink="/admin/class-schedule">
          <div class="ac-icon"><mat-icon>event_note</mat-icon></div>
          <div class="ac-body"><div class="ac-title">Class Schedule</div><div class="ac-sub">Teacher assignments</div></div>
          <mat-icon class="ac-arrow">chevron_right</mat-icon>
        </div>

        <div class="action-card ac-blue2" routerLink="/admin/teacher-progress">
          <div class="ac-icon"><mat-icon>trending_up</mat-icon></div>
          <div class="ac-body"><div class="ac-title">Teacher Progress</div><div class="ac-sub">Marks per teacher</div></div>
          <mat-icon class="ac-arrow">chevron_right</mat-icon>
        </div>

        <div class="action-card ac-red" routerLink="/admin/announcements">
          <div class="ac-icon"><mat-icon>campaign</mat-icon></div>
          <div class="ac-body"><div class="ac-title">Announcement</div><div class="ac-sub">All parents &amp; teachers</div></div>
          <mat-icon class="ac-arrow">chevron_right</mat-icon>
        </div>

        <div class="action-card ac-pink" routerLink="/admin/announcements" [queryParams]="{audience:'teachers'}">
          <div class="ac-icon"><mat-icon>mark_email_read</mat-icon></div>
          <div class="ac-body"><div class="ac-title">Teacher Mail</div><div class="ac-sub">Email teachers only</div></div>
          <mat-icon class="ac-arrow">chevron_right</mat-icon>
        </div>

        <div class="action-card ac-sea" routerLink="/admin/attendance">
          <div class="ac-icon"><mat-icon>fact_check</mat-icon></div>
          <div class="ac-body"><div class="ac-title">Attendance</div><div class="ac-sub">Class &amp; student view</div></div>
          <mat-icon class="ac-arrow">chevron_right</mat-icon>
        </div>

        <div class="action-card ac-indigo2" routerLink="/admin/class-subjects">
          <div class="ac-icon"><mat-icon>library_books</mat-icon></div>
          <div class="ac-body"><div class="ac-title">Class Subjects</div><div class="ac-sub">Manage per class</div></div>
          <mat-icon class="ac-arrow">chevron_right</mat-icon>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .dashboard-container { padding: 28px; max-width: 1280px; margin: 0 auto; animation: fadeInUp 0.35s ease both; }
    @keyframes fadeInUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }

    /* Header */
    .dash-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:28px; flex-wrap:wrap; gap:12px; }
    .dash-title { font-size:1.9rem; font-weight:800; color:#1a237e; margin:0 0 4px; }
    .dash-sub { color:#888; margin:0; font-size:0.95rem; }
    .dash-sub strong { color:#3f51b5; }
    .date-badge { display:flex; align-items:center; gap:8px; background:#e8eaf6; border-radius:20px; padding:8px 16px; color:#3f51b5; font-size:0.85rem; font-weight:600; }
    .date-badge mat-icon { font-size:16px; width:16px; height:16px; }

    /* Stats */
    .stats-row { display:grid; grid-template-columns:repeat(auto-fit, minmax(220px,1fr)); gap:18px; margin-bottom:36px; }
    .stat-card {
      position:relative; overflow:hidden; border-radius:18px;
      padding:24px 20px; display:flex; align-items:center; gap:16px;
      color:#fff; box-shadow:0 6px 24px rgba(0,0,0,0.14);
      transition:transform 0.2s, box-shadow 0.2s;
    }
    .stat-card:hover { transform:translateY(-4px); box-shadow:0 12px 32px rgba(0,0,0,0.18); }
    .s-blue  { background:linear-gradient(135deg,#1a237e,#3f51b5); }
    .s-green { background:linear-gradient(135deg,#1b5e20,#43a047); }
    .s-orange{ background:linear-gradient(135deg,#e65100,#ff9800); }
    .stat-icon-wrap { width:52px; height:52px; background:rgba(255,255,255,0.2); border-radius:14px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .stat-icon-wrap mat-icon { font-size:26px; width:26px; height:26px; color:#fff; }
    .stat-num { font-size:2.2rem; font-weight:900; line-height:1; }
    .stat-lbl { font-size:0.82rem; opacity:0.85; margin-top:4px; letter-spacing:0.3px; }
    .stat-bg-icon { position:absolute; right:-10px; bottom:-10px; opacity:0.1; }
    .stat-bg-icon mat-icon { font-size:90px; width:90px; height:90px; color:#fff; }

    /* Section heading */
    .section-heading { display:flex; align-items:center; gap:8px; font-size:1.15rem; font-weight:700; color:#1a237e; margin:0 0 16px; }
    .section-heading mat-icon { font-size:20px; color:#3f51b5; }

    /* Action cards grid */
    .actions-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(220px,1fr)); gap:14px; }
    .action-card {
      display:flex; align-items:center; gap:14px;
      padding:18px 16px; border-radius:14px;
      cursor:pointer; transition:transform 0.18s, box-shadow 0.18s;
      box-shadow:0 2px 10px rgba(0,0,0,0.07);
      position:relative; overflow:hidden;
    }
    .action-card:hover { transform:translateY(-3px); box-shadow:0 8px 24px rgba(0,0,0,0.14); }
    .ac-icon { width:44px; height:44px; border-radius:12px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .ac-icon mat-icon { font-size:22px; width:22px; height:22px; color:#fff; }
    .ac-body { flex:1; }
    .ac-title { font-size:0.95rem; font-weight:700; color:#212121; }
    .ac-sub { font-size:0.78rem; color:#888; margin-top:2px; }
    .ac-arrow { color:#bbb; font-size:20px; flex-shrink:0; }

    /* Card colors */
    .ac-indigo  { background:#f3f0ff; } .ac-indigo  .ac-icon { background:linear-gradient(135deg,#3f51b5,#7986cb); }
    .ac-teal    { background:#e0f7fa; } .ac-teal    .ac-icon { background:linear-gradient(135deg,#00695c,#26a69a); }
    .ac-purple  { background:#f3e5f5; } .ac-purple  .ac-icon { background:linear-gradient(135deg,#6a1b9a,#ab47bc); }
    .ac-blue    { background:#e3f2fd; } .ac-blue    .ac-icon { background:linear-gradient(135deg,#1565c0,#42a5f5); }
    .ac-green   { background:#e8f5e9; } .ac-green   .ac-icon { background:linear-gradient(135deg,#2e7d32,#66bb6a); }
    .ac-amber   { background:#fff8e1; } .ac-amber   .ac-icon { background:linear-gradient(135deg,#e65100,#ffa726); }
    .ac-cyan    { background:#e0f7fa; } .ac-cyan    .ac-icon { background:linear-gradient(135deg,#006064,#00bcd4); }
    .ac-violet  { background:#ede7f6; } .ac-violet  .ac-icon { background:linear-gradient(135deg,#4527a0,#7e57c2); }
    .ac-blue2   { background:#e8eaf6; } .ac-blue2   .ac-icon { background:linear-gradient(135deg,#1a237e,#5c6bc0); }
    .ac-red     { background:#fce4ec; } .ac-red     .ac-icon { background:linear-gradient(135deg,#b71c1c,#ef5350); }
    .ac-pink    { background:#fce4ec; } .ac-pink    .ac-icon { background:linear-gradient(135deg,#880e4f,#ec407a); }
    .ac-sea     { background:#e0f2f1; } .ac-sea     .ac-icon { background:linear-gradient(135deg,#004d40,#26a69a); }
    .ac-indigo2 { background:#e8eaf6; } .ac-indigo2 .ac-icon { background:linear-gradient(135deg,#283593,#5c6bc0); }
  `]
})
export class AdminDashboardComponent implements OnInit {
  username = localStorage.getItem('username') || 'Admin';
  studentCount = 0;
  teacherCount = 0;
  examCount = 0;
  today = new Date().toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });

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
