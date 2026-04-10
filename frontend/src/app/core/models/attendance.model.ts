export interface AttendanceSummary {
  studentId: number;
  studentName: string;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  percentage: number;
}

export interface AttendanceRecord {
  id: number;
  studentId: number;
  studentName: string;
  attendanceDate: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE';
}

export interface MarkAttendanceRequest {
  studentId: number;
  classId: number;
  sectionId: number;
  attendanceDate: string;
  status: string;
}
