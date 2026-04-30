import axios, { type AxiosInstance } from "axios";
import type { PesapalAuthResponse, PesapalConfig } from "./types/types.js";
import { withRetries } from "./helpers/retries.js";

/**
 * Handles authentication and token management for the Pesapal API.
 * Includes in-memory caching to avoid redundant authentication requests.
 */
export class PesapalAuth {
  private http: AxiosInstance;
  private authPromise: Promise<PesapalAuthResponse> | null = null;

  public token?: string;
  public expiryDate?: string;

  /**
   * Creates an instance of PesapalAuth.
   * @param config The configuration options.
   */
  constructor(private config: PesapalConfig) {
    const baseURL =
      config.environment === "live"
        ? "https://pay.pesapal.com/v3"
        : "https://cybqa.pesapal.com/pesapalv3";

    this.http = axios.create({
      baseURL,
      timeout: config.timeoutMs ?? 10000,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });
  }

  /**
   * Checks if the current token is valid and not close to expiry.
   * @returns True if the token is valid, false otherwise.
   */
  private isTokenValid(): boolean {
    if (!this.token || !this.expiryDate) return false;

    const expiry = new Date(this.expiryDate).getTime();
    const now = Date.now();
    // Buffer of 30 seconds to ensure the token doesn't expire mid-request
    const buffer = 30 * 1000;

    return expiry - now > buffer;
  }

  /**
   * Requests a fresh authentication token from Pesapal or returns a cached one.
   * Tokens typically expire after 5 minutes.
   * @returns A promise resolving to the authentication response.
   */
  async authenticate(): Promise<PesapalAuthResponse> {
    // 1. Return cached data if valid
    if (this.isTokenValid() && this.token && this.expiryDate) {
      return {
        token: this.token,
        expiryDate: this.expiryDate,
        status: "200",
        message: "Cached token",
        error: null,
      };
    }

    // 2. Handle concurrent authentication requests
    if (this.authPromise) {
      return this.authPromise;
    }

    this.authPromise = withRetries(
      async () => {
        this.config.logger?.debug?.("Pesapal auth request started");

        const res = await this.http.post<PesapalAuthResponse>(
          "/api/Auth/RequestToken",
          {
            consumer_key: this.config.consumerKey,
            consumer_secret: this.config.consumerSecret,
          },
        );

        const data = res.data;

        this.token = data.token;
        this.expiryDate = data.expiryDate;

        this.config.logger?.info?.("Pesapal auth success", {
          expiryDate: data.expiryDate,
        });

        return data;
      },
      {
        retries: this.config.retries,
        onRetry: ({ attempt, retries, error, delay }) => {
          this.config.logger?.warn?.("Retrying auth request", {
            attempt,
            retries,
            delay,
            message: error.message,
          });
        },
      },
    ).finally(() => {
      this.authPromise = null;
    });

    return this.authPromise;
  }
}
