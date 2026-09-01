import type { RequestHandler } from "express";
import { getRequestContext } from "./request-context";

type RateLimitOptions = {
  windowMs: number;
  maxRequests: number;
};

type Bucket = { count: number; resetAt: number };

export const createRateLimiter = ({ windowMs, maxRequests }: RateLimitOptions): RequestHandler => {
  const buckets = new Map<string, Bucket>();
  let requestsSinceCleanup = 0;

  return (request, response, next) => {
    const now = Date.now();
    const key = `${request.ip}:${request.baseUrl || request.path}`;
    const current = buckets.get(key);
    const bucket = !current || current.resetAt <= now
      ? { count: 1, resetAt: now + windowMs }
      : { count: current.count + 1, resetAt: current.resetAt };
    buckets.set(key, bucket);

    response.setHeader("RateLimit-Limit", maxRequests);
    response.setHeader("RateLimit-Remaining", Math.max(0, maxRequests - bucket.count));
    response.setHeader("RateLimit-Reset", Math.ceil(bucket.resetAt / 1000));

    requestsSinceCleanup += 1;
    if (requestsSinceCleanup >= 500) {
      for (const [bucketKey, value] of buckets) if (value.resetAt <= now) buckets.delete(bucketKey);
      requestsSinceCleanup = 0;
    }

    if (bucket.count > maxRequests) {
      response.setHeader("Retry-After", Math.ceil((bucket.resetAt - now) / 1000));
      response.status(429).json({
        code: "RATE_LIMITED",
        message: "Muitas tentativas. Aguarde um instante e tente novamente.",
        requestId: getRequestContext()?.requestId,
      });
      return;
    }

    next();
  };
};
