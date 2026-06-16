import { apiClient } from "@/lib/api-client";
import { NOTIFICATIONS_URL } from "utils/endpoints";

export const notificationsApi = {
  list: (token: string) => apiClient.get(NOTIFICATIONS_URL, token),
  unreadCount: (token: string) =>
    apiClient.get(`${NOTIFICATIONS_URL}unread-count/`, token),
  markRead: (token: string, notificationId: string) =>
    apiClient.post(`${NOTIFICATIONS_URL}${notificationId}/mark-read/`, token),
  markAllRead: (token: string) =>
    apiClient.post(`${NOTIFICATIONS_URL}mark-all-read/`, token),
};
