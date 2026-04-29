import type { RetryOptions } from "../types/types.js";

/**
 * Utility function to execute an asynchronous function with retries.
 * Supports exponential backoff and custom retry conditions.
 *
 * @param fn The asynchronous function to execute.
 * @param options Retry configuration options.
 * @returns The result of the successful function execution.
 * @throws The last error encountered if all retry attempts fail.
 */
export async function withRetries<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const {
    retries = 2,
    baseDelayMs = 500,
    maxDelayMs = 8000,
    shouldRetry = defaultShouldRetry,
    onRetry,
  } = options;

  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      const retryable = shouldRetry(error);

      if (!retryable || attempt === retries) break;

      const delay = Math.min(baseDelayMs * 2 ** attempt, maxDelayMs);

      onRetry?.({
        attempt: attempt + 1,
        retries,
        error,
        delay,
      });

      await sleep(delay);
    }
  }

  throw lastError;
}

/**
 * Internal sleep helper for delay management.
 */
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * The default strategy for determining if an error should trigger a retry.
 * Retries on:
 * - Specific HTTP status codes: 408 (Timeout), 429 (Rate Limit), 5xx (Server Error)
 * - Specific network codes: ECONNRESET, ETIMEDOUT
 */
export function defaultShouldRetry(error: any): boolean {
  const status = error?.response?.status;

  return (
    status === 408 ||
    status === 429 ||
    status >= 500 ||
    error.code === "ECONNRESET" ||
    error.code === "ETIMEDOUT"
  );
}
