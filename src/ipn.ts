import type { PesapalClient } from "./client.js";
import type {
  RegisterIPNUrlRequest,
  RegisterIPNUrlResponse,
} from "./types/types.js";

/**
 * Resource for managing Instant Payment Notifications (IPN).
 */
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
}
