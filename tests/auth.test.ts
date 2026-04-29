import { describe, it, expect, beforeEach, afterEach } from "vitest";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { PesapalAuth } from "../src/auth.js";

describe("PesapalAuth", () => {
    let mock: MockAdapter;
    const config = {
        consumerKey: "test-key",
        consumerSecret: "test-secret",
        environment: "sandbox" as const,
    };

    beforeEach(() => {
        mock = new MockAdapter(axios);
    });

    afterEach(() => {
        mock.restore();
    });

    it("should successfully authenticate and return token", async () => {
        const authResponse = {
            token: "fake-token",
            expiryDate: "2026-04-29T10:00:00Z",
            status: "200",
            message: "Success"
        };

        mock.onPost("https://cybqa.pesapal.com/pesapalv3/api/Auth/RequestToken").reply(200, authResponse);

        const auth = new PesapalAuth(config);
        const result = await auth.authenticate();

        expect(result).toEqual(authResponse);
        expect(auth.token).toBe("fake-token");
        expect(auth.expiryDate).toBe("2026-04-29T10:00:00Z");
    });

    it("should fail authentication with invalid credentials", async () => {
        mock.onPost("https://cybqa.pesapal.com/pesapalv3/api/Auth/RequestToken").reply(401, {
            error: {
                message: "Invalid credentials",
                code: "unauthorized"
            }
        });

        const auth = new PesapalAuth(config);
        await expect(auth.authenticate()).rejects.toThrow();
    });

    it("should use live URL when environment is live", async () => {
        const liveConfig = { ...config, environment: "live" as const };
        const authResponse = { token: "live-token", expiryDate: "..." };

        mock.onPost("https://pay.pesapal.com/v3/api/Auth/RequestToken").reply(200, authResponse);

        const auth = new PesapalAuth(liveConfig);
        const result = await auth.authenticate();

        expect(result.token).toBe("live-token");
    });
});
