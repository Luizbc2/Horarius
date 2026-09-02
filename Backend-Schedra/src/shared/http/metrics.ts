import type { RequestHandler } from "express";

type HttpMetric = {
  count: number;
  durationSeconds: number;
  method: string;
  route: string;
  status: number;
};

const startedAt = Date.now();
const httpMetrics = new Map<string, HttpMetric>();
let activeRequests = 0;

const normalizeRoute = (path: string): string => path
  .split("?")[0]
  .replace(/\/[0-9]+(?=\/|$)/g, "/:id")
  .replace(/\/[0-9a-f]{8}-[0-9a-f-]{27,}(?=\/|$)/gi, "/:id");

const escapeLabel = (value: string): string => value
  .replace(/\\/g, "\\\\")
  .replace(/"/g, '\\"')
  .replace(/\n/g, "\\n");

export const requestMetricsMiddleware: RequestHandler = (request, response, next) => {
  const requestStartedAt = process.hrtime.bigint();
  activeRequests += 1;

  response.once("finish", () => {
    activeRequests = Math.max(0, activeRequests - 1);
    const durationSeconds = Number(process.hrtime.bigint() - requestStartedAt) / 1_000_000_000;
    const route = normalizeRoute(request.originalUrl || request.path || "/");
    const method = request.method.toUpperCase();
    const status = response.statusCode;
    const key = `${method}|${route}|${status}`;
    const current = httpMetrics.get(key) ?? { count: 0, durationSeconds: 0, method, route, status };
    current.count += 1;
    current.durationSeconds += durationSeconds;
    httpMetrics.set(key, current);
  });

  next();
};

export const renderPrometheusMetrics = (): string => {
  const lines = [
    "# HELP schedra_process_uptime_seconds Process uptime in seconds.",
    "# TYPE schedra_process_uptime_seconds gauge",
    `schedra_process_uptime_seconds ${((Date.now() - startedAt) / 1000).toFixed(3)}`,
    "# HELP schedra_http_requests_active Requests currently being processed.",
    "# TYPE schedra_http_requests_active gauge",
    `schedra_http_requests_active ${activeRequests}`,
    "# HELP schedra_http_requests_total Total HTTP responses.",
    "# TYPE schedra_http_requests_total counter",
  ];

  for (const metric of [...httpMetrics.values()].sort((left, right) =>
    `${left.route}|${left.method}|${left.status}`.localeCompare(`${right.route}|${right.method}|${right.status}`)
  )) {
    const labels = `method="${escapeLabel(metric.method)}",route="${escapeLabel(metric.route)}",status="${metric.status}"`;
    lines.push(`schedra_http_requests_total{${labels}} ${metric.count}`);
  }

  lines.push(
    "# HELP schedra_http_request_duration_seconds_sum Cumulative HTTP response time in seconds.",
    "# TYPE schedra_http_request_duration_seconds_sum counter",
  );

  for (const metric of [...httpMetrics.values()].sort((left, right) =>
    `${left.route}|${left.method}|${left.status}`.localeCompare(`${right.route}|${right.method}|${right.status}`)
  )) {
    const labels = `method="${escapeLabel(metric.method)}",route="${escapeLabel(metric.route)}",status="${metric.status}"`;
    lines.push(`schedra_http_request_duration_seconds_sum{${labels}} ${metric.durationSeconds.toFixed(6)}`);
  }

  return `${lines.join("\n")}\n`;
};

export const resetMetricsForTests = (): void => {
  httpMetrics.clear();
  activeRequests = 0;
};
