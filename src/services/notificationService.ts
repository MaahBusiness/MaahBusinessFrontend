import api from "./api";
import type { AppNotification, PaginatedResponse } from "../types";

export const notificationService = {
  async getNotifications(status?: 'READ' | 'UNREAD'): Promise<PaginatedResponse<AppNotification>> {
    const params = status ? { status } : {};
    const response = await api.get<PaginatedResponse<AppNotification>>("/notification/my-notifications/", { params });
    return response.data;
  },

  async markAsRead(notificationId: string): Promise<AppNotification> {
    const response = await api.patch<AppNotification>(`/notification/${notificationId}/mark-read/`);
    return response.data;
  },

  async markAllAsRead(): Promise<void> {
    await api.patch("/notification/mark-all-read/");
  },

  async deleteNotification(notificationId: string): Promise<void> {
    await api.delete(`/notification/${notificationId}/`);
  },
};

export default notificationService;
