import { beforeAll, describe, expect, it } from "vitest";
import request from "supertest";

let app: ReturnType<typeof import("../src/app.js").createApp>;
beforeAll(async () => {
  process.env.NODE_ENV = "test";
  process.env.LOG_LEVEL = "silent";
  delete process.env.MONGODB_URI;
  app = (await import("../src/app.js")).createApp();
});

describe("HTTP foundation", () => {
  it("reports liveness without claiming database readiness", async () => {
    const live = await request(app).get("/health");
    expect(live.status).toBe(200);
    expect(live.body.status).toBe("ok");
    const ready = await request(app).get("/ready");
    expect(ready.status).toBe(503);
    expect(ready.body.database).toBe("unconfigured");
  });
  it("returns a structured 404", async () => {
    const response = await request(app).get("/v1/missing");
    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe("NOT_FOUND");
  });
  it("rejects malformed JSON without exposing internals", async () => {
    const response = await request(app)
      .post("/v1/missing")
      .set("Content-Type", "application/json")
      .send('{"broken":');
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("INVALID_REQUEST");
  });

  it("rejects an invalid sponsor address before contacting Horizon", async () => {
    const response = await request(app).get(
      "/v1/testnet/sponsors/invalid/inventory",
    );
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("INVALID_SPONSOR");
  });
});
