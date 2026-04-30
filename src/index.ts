import { PesapalClient } from "./client.js";
import { Orders } from "./orders.js";
import type { PesapalConfig } from "./types/types.js";

export * from "./types/types.js";
export * from "./errors.js";

/**
 * The main entry point for the Pesapal v3 nodejs SDK.
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
   * Creates an instance of the Pesapal SDK.
   * @param config The configuration options for the SDK.
   */
  constructor(config: PesapalConfig) {
    this.client = new PesapalClient(config);

    this.orders = new Orders(this.client);
  }
}
