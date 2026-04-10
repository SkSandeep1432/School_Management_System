export interface Student {
  id: number;
  fullName: string;
  rollNumber: string;
  className: string;
  classId?: number;
  sectionName: string;
  sectionId?: number;
  dateOfBirth: string;
  parentEmail: string;
  phone: string;
  address: string;
}

export interface CreateStudentRequest {
  fullName: string;
  rollNumber: string;
  classId: number;
  sectionId: number;
  dateOfBirth: string;
  parentEmail: string;
  phone: string;
  address: string;
}
