import type { RetryOptions } from "../types/types.js";


export async function withRetries<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
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

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

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