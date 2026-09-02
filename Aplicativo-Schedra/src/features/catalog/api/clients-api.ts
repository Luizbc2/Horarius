import { apiRequest } from "../../../shared/api/client";

export type Client = { id: number; name: string; email: string; phone: string; cpf: string; notes: string };
export type ClientInput = Omit<Client, "id">;
type ClientPage = { data: Client[]; page: number; limit: number; totalItems: number; totalPages: number };
const auth = (token: string) => ({ Authorization: `Bearer ${token}` });

export const clientsApi = {
  list: (token: string, search = "") => apiRequest<ClientPage>(`/clients?limit=100&search=${encodeURIComponent(search.trim())}`, { headers: auth(token) }),
  create: (token: string, input: ClientInput) => apiRequest<{ message: string; client: Client }>("/clients", { method: "POST", headers: auth(token), body: JSON.stringify(input) }),
  update: (token: string, id: number, input: ClientInput) => apiRequest<{ message: string; client: Client }>(`/clients/${id}`, { method: "PUT", headers: auth(token), body: JSON.stringify(input) }),
  remove: (token: string, id: number) => apiRequest<{ message: string }>(`/clients/${id}`, { method: "DELETE", headers: auth(token) }),
};
