import { useEffect, useState } from "react";

import { API_BASE_URL } from "../lib/api";
import { getHealthStatus } from "../services/health";

type ApiStatusState = "checking" | "online" | "offline";

const HEALTH_CHECK_INTERVAL_MS = 30000;

export function ApiStatusCard() {
  const [status, setStatus] = useState<ApiStatusState>("checking");
  const [message, setMessage] = useState("Verificando conexão com o servidor...");

  useEffect(() => {
    let active = true;

    async function checkHealth() {
      try {
        const response = await getHealthStatus();

        if (!active) {
          return;
        }

        setStatus("online");
        setMessage(response.message || response.status || "Servidor respondendo normalmente.");
      } catch {
        if (!active) {
          return;
        }

        setStatus("offline");
        setMessage("Não foi possível falar com o servidor local neste momento.");
      }
    }

    void checkHealth();
    const intervalId = window.setInterval(() => {
      void checkHealth();
    }, HEALTH_CHECK_INTERVAL_MS);

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, []);

  const toneClassName =
    status === "online"
      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-100"
      : status === "offline"
        ? "border-red-500/20 bg-red-500/10 text-red-100"
        : "border-white/10 bg-white/6 text-sidebar-foreground/80";

  const label =
    status === "online" ? "Servidor online" : status === "offline" ? "Servidor indisponível" : "Verificando servidor";

  const indicatorClassName =
    status === "online"
      ? "bg-emerald-300"
      : status === "offline"
        ? "bg-red-300"
        : "bg-white/70";

  return (
    <div className={`mt-4 rounded-[1rem] border px-3 py-3 text-sm ${toneClassName}`}>
      <div className="flex items-center justify-between gap-3">
        <p className="flex items-center gap-2 font-medium">
          <span className={`h-2.5 w-2.5 rounded-full ${indicatorClassName}`} />
          <span>{label}</span>
        </p>
        <span className="text-[0.65rem] uppercase tracking-[0.24em] opacity-75">/health</span>
      </div>
      <p className="mt-2 text-xs leading-5 opacity-90">{message}</p>
      <p className="mt-2 truncate text-[0.7rem] opacity-70">{API_BASE_URL}</p>
    </div>
  );
}
