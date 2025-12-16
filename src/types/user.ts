export interface User {
  id: number;
  username: string;
  password: string;
  role: 'admin' | 'teacher' | 'student';
  first_name?: string;
  last_name?: string;
  last_login?: number;
  time_created?: number;
  time_modified?: number;
  deleted?: boolean;
  lang?: string;
}

export interface UserOption {
  id: number;
  username: string;
  first_name?: string;
  last_name?: string;
  class_id?: number;
  class_name?: string;
}

export type StudentOptionResponse = UserOption[];

export type UserListingItem = Omit<User, 'password' | 'deleted'>;
