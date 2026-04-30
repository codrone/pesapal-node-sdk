import type { PesapalClient } from "./client.js";
import { PesapalError } from "./errors.js";
import type {
  RegisterIPNUrlRequest,
  RegisterIPNUrlResponse,
} from "./types/types.js";

/**
 * Resource for managing Pesapal Instant Payment Notifications (IPN).
 */
export class IPNResource {
  constructor(private readonly client: PesapalClient) {}

  /**
   * Registers a publicly accessible IPN URL.
   *
   * The returned `ipn_id` should be used as `notification_id`
   * when submitting an order request.
   */
  registerIPNUrl(payload: RegisterIPNUrlRequest) {
    this.validateIPNRegistration(payload);
    return this.client.post<RegisterIPNUrlResponse>(
      "/api/URLSetup/RegisterIPN",
      payload,
    );
  }

  /**
   * Retrieves the list of registered IPN URLs for the current account.
   */
  getIPNList() {
    return this.client.get("/api/URLSetup/GetIpnList");
  }

  /**
   * Client-side validation for IPN registration requests.
   */
  private validateIPNRegistration(payload: RegisterIPNUrlRequest) {
    if (!payload.url) {
      throw new PesapalError(
        "IPN URL is required",
        "validation_error",
        "client",
        400,
      );
    }

    try {
      new URL(payload.url);
    } catch (e) {
      throw new PesapalError(
        "Invalid IPN URL format",
        "validation_error",
        "client",
        400,
      );
    }

    if (!["GET", "POST"].includes(payload.ipn_notification_type)) {
      throw new PesapalError(
        "IPN notification type must be GET or POST",
        "validation_error",
        "client",
        400,
      );
    }
  }
}
