import type { PesapalConfig } from "./types/types.js";
import { PesapalError } from "./errors.js";
import { PesapalAuth } from "./auth.js";
import { withRetries } from "./helpers/retries.js";

/**
 * Internal HTTP client for interacting with the Pesapal API V3.
 * Handles authentication, retries, and error normalization.
 */
export class PesapalClient {
  private auth: PesapalAuth;
  private baseURL: string;

  /**
   * Creates an instance of PesapalClient.
   * @param config The configuration options.
   */
  constructor(private config: PesapalConfig) {
    this.baseURL =
      config.environment === "live"
        ? "https://pay.pesapal.com/v3"
        : "https://cybqa.pesapal.com/pesapalv3";

    this.auth = new PesapalAuth(config);
  }

  /**
   * Makes an authenticated HTTP request to the Pesapal API V3.
   * @param method The HTTP method (GET, POST, etc.).
   * @param url The relative URL endpoint.
   * @param data Optional request payload.
   * @returns A promise that resolves to the response data.
   * @throws {PesapalError} If the request fails.
   */
  public async request<T>(
    method: "GET" | "POST" | "PUT" | "DELETE",
    url: string,
    data?: unknown,
  ): Promise<T> {
    return withRetries(
      async () => {
        try {
          const authData = await this.auth.authenticate();

          this.config.logger?.debug?.("Pesapal request started", {
            method,
            url,
          });

          const headers: HeadersInit = {
            Accept: "application/json",
            Authorization: `Bearer ${authData.token}`,
          };

          const requestOptions: RequestInit = {
            method,
            headers,
            signal: AbortSignal.timeout(this.config.timeoutMs ?? 10000),
          };

          if (data !== undefined) {
            headers["Content-Type"] = "application/json";
            requestOptions.body = JSON.stringify(data);
          }

          const response = await fetch(`${this.baseURL}${url}`, requestOptions);

          if (!response.ok) {
            const errorData = await parseJsonResponse(response);
            throw new PesapalFetchError(
              `HTTP error! status: ${response.status}, message: ${response.statusText}`,
              response.status,
              errorData,
            );
          }

          const responseData = await parseJsonResponse<T>(response);

          this.config.logger?.debug?.("Pesapal request successful", {
            method,
            url,
            status: response.status,
          });

          return responseData;
        } catch (err: any) {
          const pesapalError = this.normalizeError(err);

          this.config.logger?.error?.("Pesapal request failed", {
            method,
            url,
            status: pesapalError.status,
            code: pesapalError.code,
            message: pesapalError.message,
          });

          throw pesapalError;
        }
      },
      {
        retries: this.config.retries,
        onRetry: ({ attempt, retries, error, delay }) => {
          this.config.logger?.warn?.("Retrying Pesapal request", {
            method,
            url,
            attempt,
            retries,
            delay,
            message: error.message,
          });
        },
      },
    );
  }

  /**
   * Performs an authenticated GET request.
   */
  public get<T>(url: string): Promise<T> {
    return this.request<T>("GET", url);
  }

  /**
   * Performs an authenticated POST request.
   */
  public post<T>(url: string, data?: unknown): Promise<T> {
    return this.request<T>("POST", url, data);
  }

  /**
   * Performs an authenticated PUT request.
   */
  public put<T>(url: string, data?: unknown): Promise<T> {
    return this.request<T>("PUT", url, data);
  }

  /**
   * Performs an authenticated DELETE request.
   */
  public delete<T>(url: string): Promise<T> {
    return this.request<T>("DELETE", url);
  }

  /**
   * Normalizes errors into a consistent PesapalError format.
   */
  private normalizeError(err: any): PesapalError {
    if (err instanceof PesapalError) {
      return err;
    }

    if (err instanceof PesapalFetchError) {
      const error = err.errorData?.error;
      return new PesapalError(
        error?.message || err.message || "Pesapal request failed",
        error?.code,
        error?.type,
        err.statusCode,
      );
    }

    return new PesapalError(err.message || "Pesapal request failed");
  }
}

class PesapalFetchError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public errorData: any,
  ) {
    super(message);
    this.name = "PesapalFetchError";
  }
}

async function parseJsonResponse<T = any>(response: Response): Promise<T> {
  if (response.status === 204) {
    return undefined as T;
  }

  try {
    return (await response.json()) as T;
  } catch {
    return undefined as T;
  }
}
