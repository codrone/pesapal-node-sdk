import { PesapalClient } from "./client.js";
import { PesapalError } from "./errors.js";
import type {
  CancelOrderRequest,
  CancelOrderResponse,
} from "./types/types.js";

/**
 * Resource for cancelling failed or pending orders.
 */
export class OrderCancellations {
  /**
   * Creates an instance of OrderCancellations.
   * @param client The authenticated Pesapal client.
   */
  constructor(private client: PesapalClient) {}

  /**
   * Cancels a pending or failed order by its Pesapal order tracking ID.
   */
  async cancelOrder(payload: CancelOrderRequest) {
    this.validateCancellation(payload);
    return this.client.post<CancelOrderResponse>(
      "/api/Transactions/CancelOrder",
      payload,
    );
  }

  private validateCancellation(payload: CancelOrderRequest) {
    if (!payload.order_tracking_id)
      throw new PesapalError(
        "Order tracking ID is required",
        "validation_error",
        "client",
        400,
      );
  }
}
