import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Teacher, TeacherAssignment, CreateTeacherRequest } from '../models/teacher.model';

@Injectable({ providedIn: 'root' })
export class TeacherService {
  private adminUrl = 'http://localhost:8080/api/admin';
  private teacherUrl = 'http://localhost:8080/api/teacher';

  constructor(private http: HttpClient) {}

  getTeachers(): Observable<Teacher[]> {
    return this.http.get<Teacher[]>(`${this.adminUrl}/teachers`);
  }

  createTeacher(data: CreateTeacherRequest): Observable<Teacher> {
    return this.http.post<Teacher>(`${this.adminUrl}/teachers`, data);
  }

  assignTeacher(teacherId: number, data: {subjectId: number, classId: number, sectionId: number}): Observable<TeacherAssignment> {
    return this.http.post<TeacherAssignment>(`${this.adminUrl}/teachers/${teacherId}/assign`, data);
  }

  getTeacherAssignments(teacherId?: number): Observable<TeacherAssignment[]> {
    if (teacherId) {
      return this.http.get<TeacherAssignment[]>(`${this.adminUrl}/teachers/${teacherId}/assignments`);
    }
    return this.http.get<TeacherAssignment[]>(`${this.teacherUrl}/assignments`);
  }

  removeAssignment(assignmentId: number): Observable<any> {
    return this.http.delete(`${this.adminUrl}/teachers/assignments/${assignmentId}`);
  }

  getMyStudents(classId: number, sectionId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.teacherUrl}/students?classId=${classId}&sectionId=${sectionId}`);
  }

  getNotifications(): Observable<any> {
    return this.http.get<any>(`${this.teacherUrl}/notifications`);
  }

  markNotificationRead(id: number): Observable<any> {
    return this.http.put(`${this.teacherUrl}/notifications/${id}/read`, {});
  }

  markAllNotificationsRead(): Observable<any> {
    return this.http.put(`${this.teacherUrl}/notifications/read-all`, {});
  }
}
