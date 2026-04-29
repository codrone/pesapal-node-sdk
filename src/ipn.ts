import type { PesapalClient } from "./client.js";

/**
 * Resource for managing Instant Payment Notifications (IPN).
 */
export class IPNResource {
  /**
   * Creates an instance of IPNResource.
   * @param client The authenticated Pesapal client.
   */
  constructor(private client: PesapalClient) {}

  /**
   * Registers a new IPN URL to receive payment notifications.
   * @param payload The registration details (URL and method).
   */
  registerIPNUrl(payload: {
    url: string;
    ipn_notification_type: "GET" | "POST";
  }) {
    return this.client.post("/api/URLSetup/RegisterIPN", payload);
  }

  /**
   * Retrieves the list of registered IPN URLs for the current account.
   */
  getIPNList() {
    return this.client.get("/api/URLSetup/GetIpnList");
  }
}
