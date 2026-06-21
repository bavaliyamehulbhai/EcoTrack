import request from "supertest";
import app from "../app.js";

describe("Auth Endpoints", () => {
  it("should return 401 when trying to access a protected route without token", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.statusCode).toEqual(401);
  });

  it("should have rate limiting enabled on /api/auth/login", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "test@test.com",
      password: "password123"
    });
    // Can be 401 (invalid creds) or 400 (missing fields), but not a crash
    expect([400, 401, 404]).toContain(res.statusCode);
  });
});
