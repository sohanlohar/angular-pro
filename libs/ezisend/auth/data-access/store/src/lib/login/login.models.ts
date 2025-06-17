/**
 * Interface for the 'Login' data
 */
export interface LoginEntity {
  email: string;
  password: string;
}

export interface LoginResponse {
  code: string;
  message: string;
  data: LoginData | null;
}

export interface LoginData {
  token: string;
  refreshtoken: string;
}

export interface MeResponse {
  code: string;
  message: string;
  data: MeData | null;
}

export interface MeData {
  user: User;
}

export interface User {
  id: number;
  email: string;
  account_no: string;
  status: string;
  roles: string[];
  name: string;
}
