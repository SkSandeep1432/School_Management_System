import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AttendanceSummary, MarkAttendanceRequest } from '../models/attendance.model';

@Injectable({ providedIn: 'root' })
export class AttendanceService {
  private teacherUrl = 'http://localhost:8080/api/teacher';
  private parentUrl = 'http://localhost:8080/api/parent';

  constructor(private http: HttpClient) {}

  markAttendance(data: MarkAttendanceRequest): Observable<any> {
    return this.http.post<any>(`${this.teacherUrl}/attendance`, data);
  }

  getAttendanceByClassAndDate(classId: number, sectionId: number, date: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.teacherUrl}/attendance?classId=${classId}&sectionId=${sectionId}&date=${date}`);
  }

  getChildAttendance(): Observable<AttendanceSummary> {
    return this.http.get<AttendanceSummary>(`${this.parentUrl}/child/attendance`);
  }
}
