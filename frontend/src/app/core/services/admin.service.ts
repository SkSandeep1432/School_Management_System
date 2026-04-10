import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private apiUrl = 'http://localhost:8080/api/admin';

  constructor(private http: HttpClient) {}

  getClasses(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/classes`);
  }

  getSections(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/sections`);
  }

  getSubjects(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/subjects`);
  }

  createClass(data: {className: string}): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/classes`, data);
  }

  createSection(data: {sectionName: string}): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/sections`, data);
  }

  createSubject(data: {subjectName: string}): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/subjects`, data);
  }
}
