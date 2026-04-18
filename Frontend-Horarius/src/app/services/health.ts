import { api } from "../lib/api";

type HealthResponse = {
  message?: string;
  status?: string;
};

export function getHealthStatus() {
  return api.get<HealthResponse>("/health");
}
