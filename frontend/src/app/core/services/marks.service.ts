import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Mark, EnterMarksRequest, ReportCard } from '../models/marks.model';

@Injectable({ providedIn: 'root' })
export class MarksService {
  private teacherUrl = 'http://localhost:8080/api/teacher';
  private parentUrl = 'http://localhost:8080/api/parent';

  constructor(private http: HttpClient) {}

  enterMarks(data: EnterMarksRequest): Observable<Mark> {
    return this.http.post<Mark>(`${this.teacherUrl}/marks`, data);
  }

  updateMarks(id: number, data: {marksObtained: number, remarks: string}): Observable<Mark> {
    return this.http.put<Mark>(`${this.teacherUrl}/marks/${id}`, data);
  }

  getMarks(examId: number, classId: number, sectionId: number): Observable<Mark[]> {
    return this.http.get<Mark[]>(`${this.teacherUrl}/marks?examId=${examId}&classId=${classId}&sectionId=${sectionId}`);
  }

  getChildReports(): Observable<any[]> {
    return this.http.get<any[]>(`${this.parentUrl}/child/reports`);
  }

  getChildReportCard(examId: number): Observable<ReportCard> {
    return this.http.get<ReportCard>(`${this.parentUrl}/child/reports/${examId}`);
  }

  downloadReportPdf(examId: number): Observable<Blob> {
    return this.http.get(`${this.parentUrl}/child/reports/${examId}/pdf`, { responseType: 'blob' });
  }
}
