import request from "supertest";

import { createTestApp } from "./create-test-app";
import { InMemoryUserRepository } from "../mocks/in-memory-user.repository";

describe("Performance tests", () => {
  test("GET /api/health responds quickly in a light local scenario", async () => {
    const app = createTestApp(new InMemoryUserRepository());
    const attempts = 5;
    const durations: number[] = [];

    for (let index = 0; index < attempts; index += 1) {
      const startTime = performance.now();
      const response = await request(app).get("/api/health");
      const endTime = performance.now();

      expect(response.status).toBe(200);
      durations.push(endTime - startTime);
    }

    const averageDuration = durations.reduce((total, duration) => total + duration, 0) / durations.length;

    expect(averageDuration).toBeLessThan(200);
  });
});
