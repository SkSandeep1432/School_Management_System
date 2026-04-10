export interface Teacher {
  id: number;
  fullName: string;
  phone: string;
  username: string;
  email: string;
  userId: number;
}

export interface TeacherAssignment {
  id: number;
  teacherId: number;
  teacherName: string;
  subjectId: number;
  subjectName: string;
  classId: number;
  className: string;
  sectionId: number;
  sectionName: string;
}

export interface CreateTeacherRequest {
  fullName: string;
  phone: string;
  username: string;
  password: string;
  email: string;
}
