import { describe, it, expect, vi, afterEach } from "vitest";
import { withRetries } from "../src/helpers/retries.js";

describe("withRetries", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should return result if fn succeeds on first try", async () => {
    const fn = vi.fn().mockResolvedValue("success");
    const result = await withRetries(fn);
    expect(result).toBe("success");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("should retry if fn fails with retryable error", async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce({ response: { status: 500 } })
      .mockResolvedValueOnce("success");

    const result = await withRetries(fn, { baseDelayMs: 1 });
    expect(result).toBe("success");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("should fail after max retries", async () => {
    const error = { response: { status: 500 } };
    const fn = vi.fn().mockRejectedValue(error);

    await expect(
      withRetries(fn, { retries: 2, baseDelayMs: 1 }),
    ).rejects.toEqual(error);
    expect(fn).toHaveBeenCalledTimes(3); // 1 initial + 2 retries
  });

  it("should not retry if shouldRetry returns false", async () => {
    const error = { response: { status: 400 } };
    const fn = vi.fn().mockRejectedValue(error);

    await expect(withRetries(fn, { retries: 2 })).rejects.toEqual(error);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("should call onRetry callback", async () => {
    const onRetry = vi.fn();
    const fn = vi
      .fn()
      .mockRejectedValueOnce({ response: { status: 500 } })
      .mockResolvedValueOnce("success");

    await withRetries(fn, { onRetry, baseDelayMs: 1 });
    expect(onRetry).toHaveBeenCalledWith(
      expect.objectContaining({
        attempt: 1,
        retries: 2,
        delay: 1,
      }),
    );
  });
});
