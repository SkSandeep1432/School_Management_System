import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Exam, CreateExamRequest } from '../models/exam.model';

@Injectable({ providedIn: 'root' })
export class ExamService {
  private adminUrl = 'http://localhost:8080/api/admin';
  private teacherUrl = 'http://localhost:8080/api/teacher';

  constructor(private http: HttpClient) {}

  getExams(): Observable<Exam[]> {
    return this.http.get<Exam[]>(`${this.adminUrl}/exams`);
  }

  getTeacherExams(): Observable<Exam[]> {
    return this.http.get<Exam[]>(`${this.teacherUrl}/exams`);
  }

  createExam(data: CreateExamRequest): Observable<Exam> {
    return this.http.post<Exam>(`${this.adminUrl}/exams`, data);
  }

  lockExam(id: number): Observable<Exam> {
    return this.http.put<Exam>(`${this.adminUrl}/exams/${id}/lock`, {});
  }

  unlockExam(id: number): Observable<Exam> {
    return this.http.put<Exam>(`${this.adminUrl}/exams/${id}/unlock`, {});
  }

  deleteExam(id: number): Observable<any> {
    return this.http.delete(`${this.adminUrl}/exams/${id}`);
  }

  getMarksStatus(examId: number): Observable<any> {
    return this.http.get<any>(`${this.adminUrl}/exams/${examId}/marks-status`);
  }

  sendReports(examId: number): Observable<any> {
    return this.http.post<any>(`${this.adminUrl}/reports/send/${examId}`, {});
  }
}
