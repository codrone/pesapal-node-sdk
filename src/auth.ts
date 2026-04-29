import axios, { type AxiosInstance } from "axios";
import type { PesapalAuthResponse, PesapalConfig } from "./types/types.js";
import { withRetries } from "./helpers/retries.js";

/**
 * Handles authentication and token management for the Pesapal API.
 */
export class PesapalAuth {
  private http: AxiosInstance;

  public token?: string;
  public expiryDate?: string;
  public status?: string;
  public message?: string;
  public error?: unknown | null;

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
   * Requests a fresh authentication token from Pesapal.
   * Tokens typically expire after 5 minutes.
   * @returns A promise resolving to the authentication response.
   */
  async authenticate(): Promise<PesapalAuthResponse> {
    return withRetries(
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
    );
  }
}
