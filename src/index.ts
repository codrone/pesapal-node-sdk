import { PesapalClient } from "./client.js";
import { Orders } from "./orders.js";
import { IPNResource } from "./ipn.js";
import { RecurringPayments } from "./recurring.js";
import { Refunds } from "./refunds.js";
import { OrderCancellations } from "./cancellations.js";
import type { PesapalConfig } from "./types/types.js";

export * from "./types/types.js";
export * from "./errors.js";
export * from "./recurring.js";
export * from "./refunds.js";
export * from "./cancellations.js";
export {
  verifyIPNSignature,
  parseIPN,
  type PesapalIPN,
} from "./helpers/ipn.js";

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
   * Resource for managing recurring / subscription based payments.
   */
  public recurring: RecurringPayments;

  /**
   * Resource for requesting payment refunds.
   */
  public refunds: Refunds;

  /**
   * Resource for cancelling failed or pending orders.
   */
  public cancellations: OrderCancellations;

  /**
   * Creates an instance of the Pesapal SDK.
   * @param config The configuration options for the SDK.
   */
  constructor(config: PesapalConfig) {
    this.client = new PesapalClient(config);
    this.orders = new Orders(this.client);
    this.ipn = new IPNResource(this.client);
    this.recurring = new RecurringPayments(this.client);
    this.refunds = new Refunds(this.client);
    this.cancellations = new OrderCancellations(this.client);
  }
}
