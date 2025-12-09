import api from "./api";
import type {
  User,
  LoginCredentials,
  RegisterData,
  AuthResponse,
} from "../types";

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/login/", credentials);
    return response.data;
  },

  async register(userData: RegisterData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/register/", userData);
    return response.data;
  },

  async logout(): Promise<void> {
    await api.post("/logout/");
  },

  async getUserInfo(): Promise<User> {
    const response = await api.get<User>("/user-info/");
    return response.data;
  },

  async updateUser(
    userData: Partial<User> & {
      current_password?: string;
      new_password?: string;
    },
  ): Promise<User> {
    const response = await api.patch<User>("/update-user/", userData);
    return response.data;
  },

  async requestPasswordReset(email: string): Promise<void> {
    await api.post("/password-reset/", { email });
  },

  async confirmPasswordReset(token: string, password: string): Promise<void> {
    await api.post("/password-reset-confirm/", { token, password });
  },

  // User management (admin)
  async getUsers(): Promise<User[]> {
    const response = await api.get<User[]>("/users/");
    return response.data;
  },

  async createUser(userData: RegisterData): Promise<User> {
    const response = await api.post<User>("/users/", userData);
    return response.data;
  },

  async updateUserById(userId: string, userData: Partial<User>): Promise<User> {
    const response = await api.put<User>(`/users/${userId}/`, userData);
    return response.data;
  },

  async deleteUser(userId: string): Promise<void> {
    await api.delete(`/users/${userId}/`);
  },

  async assignRole(userId: string, role: string): Promise<User> {
    const response = await api.post<User>("/users/assign-role/", {
      user_id: userId,
      role,
    });
    return response.data;
  },
};

export default authService;
