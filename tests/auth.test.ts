import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { PesapalAuth } from "../src/auth.js";
import type { PesapalAuthResponse } from "../src/types/types.js";

describe("PesapalAuth", () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;
  const config = {
    consumerKey: "test-key",
    consumerSecret: "test-secret",
    environment: "sandbox" as const,
    timeoutMs: 1000,
  };

  beforeEach(() => {
    fetchSpy = vi.spyOn(global, "fetch");
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it("should successfully authenticate and return token", async () => {
    const authResponse: PesapalAuthResponse = {
      token: "fake-token",
      expiryDate: "2026-04-29T10:00:00Z",
      status: "200",
      message: "Success",
      error: null,
    };

    fetchSpy.mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: "OK",
      json: () => Promise.resolve(authResponse),
    } as Response);

    const auth = new PesapalAuth(config);
    const result = await auth.authenticate();

    expect(result).toEqual(authResponse);
    expect(auth.token).toBe("fake-token");
    expect(auth.expiryDate).toBe("2026-04-29T10:00:00Z");
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://cybqa.pesapal.com/pesapalv3/api/Auth/RequestToken",
      expect.any(Object),
    );
  });

  it("should fail authentication with invalid credentials", async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: "Unauthorized",
      json: () =>
        Promise.resolve({
          error: {
            message: "Invalid credentials",
            code: "unauthorized",
          },
        }),
    } as Response);

    const auth = new PesapalAuth(config);
    await expect(auth.authenticate()).rejects.toThrow(
      "HTTP error! status: 401, message: Unauthorized",
    );
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://cybqa.pesapal.com/pesapalv3/api/Auth/RequestToken",
      expect.any(Object),
    );
  });

  it("should use live URL when environment is live", async () => {
    const liveConfig = { ...config, environment: "live" as const };
    const authResponse: PesapalAuthResponse = {
      token: "live-token",
      expiryDate: "2026-04-29T10:00:00Z",
      status: "200",
      message: "Success",
      error: null,
    };

    fetchSpy.mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: "OK",
      json: () => Promise.resolve(authResponse),
    } as Response);

    const auth = new PesapalAuth(liveConfig);
    const result = await auth.authenticate();

    expect(result.token).toBe("live-token");
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://pay.pesapal.com/v3/api/Auth/RequestToken",
      expect.any(Object),
    );
  });

  it("should return cached token if valid", async () => {
    const authResponse: PesapalAuthResponse = {
      token: "cached-token",
      expiryDate: new Date(Date.now() + 60 * 1000).toISOString(), // 1 minute from now
      status: "200",
      message: "Success",
      error: null,
    };

    // First authentication call (will fetch)
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: "OK",
      json: () => Promise.resolve(authResponse),
    } as Response);

    const auth = new PesapalAuth(config);
    await auth.authenticate();

    // Second authentication call (should use cache)
    const result = await auth.authenticate();

    expect(result).toEqual({ ...authResponse, message: "Cached token" });
    expect(fetchSpy).toHaveBeenCalledTimes(1); // Only called once
  });

  it("should re-authenticate if token is expired", async () => {
    const expiredAuthResponse: PesapalAuthResponse = {
      token: "expired-token",
      expiryDate: new Date(Date.now() - 60 * 1000).toISOString(), // 1 minute ago
      status: "200",
      message: "Success",
      error: null,
    };

    const newAuthResponse: PesapalAuthResponse = {
      token: "new-token",
      expiryDate: new Date(Date.now() + 60 * 1000).toISOString(), // 1 minute from now
      status: "200",
      message: "Success",
      error: null,
    };

    // First authentication call (will fetch expired token)
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: "OK",
      json: () => Promise.resolve(expiredAuthResponse),
    } as Response);

    const auth = new PesapalAuth(config);
    await auth.authenticate();

    // Second authentication call (should re-authenticate)
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: "OK",
      json: () => Promise.resolve(newAuthResponse),
    } as Response);

    const result = await auth.authenticate();

    expect(result).toEqual(newAuthResponse);
    expect(fetchSpy).toHaveBeenCalledTimes(2); // Called twice
  });
});
