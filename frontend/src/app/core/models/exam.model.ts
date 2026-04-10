export interface Exam {
  id: number;
  examName: string;
  examType: 'QUARTERLY' | 'HALF_YEARLY' | 'ANNUAL';
  academicYear: string;
  startDate: string;
  endDate: string;
  isLocked: boolean;
}

export interface CreateExamRequest {
  examName: string;
  examType: string;
  academicYear: string;
  startDate: string;
  endDate: string;
}
