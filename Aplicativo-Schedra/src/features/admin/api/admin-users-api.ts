import { apiRequest } from "../../../shared/api/client";
import type { AccountType, UserRole } from "../../auth/types";

export type ManagedUser = { id: number; name: string; email: string; cpf: string; accountType: AccountType; role: UserRole; active: boolean; avatarUrl: string | null; createdAt: string };
type UserPage = { data: ManagedUser[]; page: number; limit: number; totalItems: number; totalPages: number };
const auth = (token: string) => ({ Authorization: `Bearer ${token}` });

export const adminUsersApi = {
  list: (token: string, search = "") => apiRequest<UserPage>(`/admin/users?limit=100&search=${encodeURIComponent(search.trim())}`, { headers: auth(token) }),
  changeRole: (token: string, id: number, role: UserRole) => apiRequest<{ message: string; user: ManagedUser }>(`/admin/users/${id}/role`, { method: "PATCH", headers: auth(token), body: JSON.stringify({ role }) }),
  changeStatus: (token: string, id: number, active: boolean) => apiRequest<{ message: string; user: ManagedUser }>(`/admin/users/${id}/status`, { method: "PATCH", headers: auth(token), body: JSON.stringify({ active }) }),
  remove: (token: string, id: number) => apiRequest<{ message: string }>(`/admin/users/${id}`, { method: "DELETE", headers: auth(token) }),
};
