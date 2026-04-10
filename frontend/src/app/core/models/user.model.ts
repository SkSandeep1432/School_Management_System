export interface User {
  id: number;
  username: string;
  email: string;
  role: 'ADMIN' | 'TEACHER' | 'PARENT';
}

export interface AuthResponse {
  token: string;
  role: string;
  username: string;
  userId: number;
}

export interface LoginRequest {
  username: string;
  password: string;
}
