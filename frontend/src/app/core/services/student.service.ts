import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Student, CreateStudentRequest } from '../models/student.model';

@Injectable({ providedIn: 'root' })
export class StudentService {
  private apiUrl = 'http://localhost:8080/api/admin';

  constructor(private http: HttpClient) {}

  getStudents(classId?: number, sectionId?: number): Observable<Student[]> {
    let params = new HttpParams();
    if (classId) params = params.set('classId', classId);
    if (sectionId) params = params.set('sectionId', sectionId);
    return this.http.get<Student[]>(`${this.apiUrl}/students`, { params });
  }

  getStudent(id: number): Observable<Student> {
    return this.http.get<Student>(`${this.apiUrl}/students/${id}`);
  }

  createStudent(data: CreateStudentRequest): Observable<Student> {
    return this.http.post<Student>(`${this.apiUrl}/students`, data);
  }

  updateStudent(id: number, data: CreateStudentRequest): Observable<Student> {
    return this.http.put<Student>(`${this.apiUrl}/students/${id}`, data);
  }

  deleteStudent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/students/${id}`);
  }
}
