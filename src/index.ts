import { PesapalClient } from "./client.js";
import { Orders } from "./orders.js";
import { IPNResource } from "./ipn.js";
import type { PesapalConfig } from "./types/types.js";

export * from "./types/types.js";
export * from "./errors.js";

/**
 * The main entry point for the Pesapal SDK.
 */
export class Pesapal {
  /**
   * Internal client for making authenticated requests.
   */
  public client: PesapalClient;

  /**
   * Resource for managing payment orders.
   */
  public orders: Orders;

  /**
   * Resource for managing Instant Payment Notifications (IPN).
   */
  public ipn: IPNResource;

  /**
   * Creates an instance of the Pesapal SDK.
   * @param config The configuration options for the SDK.
   */
  constructor(config: PesapalConfig) {
    this.client = new PesapalClient(config);
    this.orders = new Orders(this.client);
    this.ipn = new IPNResource(this.client);
  }
}
