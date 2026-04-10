import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register-parent/register-parent.component').then(m => m.RegisterParentComponent)
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard('ADMIN')],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./features/admin/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent) },
      { path: 'students', loadComponent: () => import('./features/admin/students/students.component').then(m => m.StudentsComponent) },
      { path: 'teachers', loadComponent: () => import('./features/admin/teachers/teachers.component').then(m => m.TeachersComponent) },
      { path: 'exams', loadComponent: () => import('./features/admin/exams/exams.component').then(m => m.ExamsComponent) },
      { path: 'marks-status', loadComponent: () => import('./features/admin/marks-status/marks-status.component').then(m => m.MarksStatusComponent) },
      { path: 'reports', loadComponent: () => import('./features/admin/reports/reports.component').then(m => m.ReportsComponent) },
      { path: 'promotion', loadComponent: () => import('./features/admin/promotion/promotion.component').then(m => m.PromotionComponent) },
      { path: 'subjects', loadComponent: () => import('./features/admin/subjects/subjects.component').then(m => m.SubjectsComponent) },
      { path: 'class-schedule', loadComponent: () => import('./features/admin/class-schedule/class-schedule.component').then(m => m.ClassScheduleComponent) },
      { path: 'teacher-progress', loadComponent: () => import('./features/admin/teacher-progress/teacher-progress.component').then(m => m.TeacherProgressComponent) },
      { path: 'announcements', loadComponent: () => import('./features/admin/announcements/announcements.component').then(m => m.AnnouncementsComponent) },
    ]
  },
  {
    path: 'teacher',
    canActivate: [authGuard, roleGuard('TEACHER')],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./features/teacher/dashboard/teacher-dashboard.component').then(m => m.TeacherDashboardComponent) },
      { path: 'mark-entry', loadComponent: () => import('./features/teacher/mark-entry/mark-entry.component').then(m => m.MarkEntryComponent) },
      { path: 'attendance', loadComponent: () => import('./features/teacher/attendance/attendance.component').then(m => m.AttendanceComponent) },
      { path: 'complaints', loadComponent: () => import('./features/teacher/complaints/teacher-complaints.component').then(m => m.TeacherComplaintsComponent) },
    ]
  },
  {
    path: 'parent',
    canActivate: [authGuard, roleGuard('PARENT')],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./features/parent/dashboard/parent-dashboard.component').then(m => m.ParentDashboardComponent) },
      { path: 'report-cards', loadComponent: () => import('./features/parent/report-cards/report-cards.component').then(m => m.ReportCardsComponent) },
      { path: 'attendance', loadComponent: () => import('./features/parent/attendance/child-attendance.component').then(m => m.ChildAttendanceComponent) },
      { path: 'complaints', loadComponent: () => import('./features/parent/complaints/parent-complaints.component').then(m => m.ParentComplaintsComponent) },
    ]
  },
  { path: '**', redirectTo: '/login' }
];
