export interface Mark {
  id: number;
  studentId: number;
  studentName: string;
  examId: number;
  examName: string;
  subjectId: number;
  subjectName: string;
  marksObtained: number;
  maxMarks: number;
  grade: string;
  remarks: string;
  percentage: number;
}

export interface ReportCard {
  studentId: number;
  studentName: string;
  rollNumber: string;
  className: string;
  sectionName: string;
  examName: string;
  academicYear: string;
  subjectMarks: Mark[];
  totalMarks: number;
  maxTotalMarks: number;
  percentage: number;
  overallGrade: string;
}

export interface EnterMarksRequest {
  studentId: number;
  examId: number;
  subjectId: number;
  classId: number;
  sectionId: number;
  marksObtained: number;
  maxMarks: number;
  remarks: string;
}
