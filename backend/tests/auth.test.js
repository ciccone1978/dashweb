const request = require('supertest');
const app = require('../app'); // Import Express app

describe("POST /api/auth/login", () => {
    it("should return a 200 status and a token for valid credentials", async () => {
        const response = await request(app)
            .post("/api/auth/login")
            .send({ username: "admin_user", password: "mySecurePassword123" });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("message", "Login successful");
        expect(response.body).toHaveProperty("token");
    });

    it("should return 401 for invalid credentials", async () => {
        const response = await request(app)
            .post("/api/auth/login")
            .send({ username: "admin_user", password: "wrongpassword" });

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty("message", "Invalid username or password");
    });

    it("should return 401 for missing credentials", async () => {
        const response = await request(app)
            .post("/api/auth/login")
            .send({ username: "", password: "" });

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty("message", "Invalid username or password");
    });
});
