import { PesapalClient } from "./client.js";
import type {
  SubmitOrderRequest,
  SubmitOrderResponse,
  TransactionStatusResponse,
} from "./types/types.js";

/**
 * Resource for managing payment orders and transaction status.
 */
export class Orders {
  /**
   * Creates an instance of Orders.
   * @param client The authenticated Pesapal client.
   */
  constructor(private client: PesapalClient) {}

  /**
   * Submits a new payment order to Pesapal.
   * @param payload The order details (amount, currency, customer, etc.).
   * @returns A promise resolving to the order response containing the redirect URL.
   */
  async submitOrder(payload: SubmitOrderRequest) {
    return this.client.post<SubmitOrderResponse>(
      "/api/Transactions/SubmitOrderRequest",
      payload,
    );
  }

  /**
   * Checks the status of a transaction.
   * @param orderTrackingId The tracking ID returned by Pesapal during order submission.
   * @returns A promise resolving to the transaction status details.
   */
  async getStatus(orderTrackingId: string) {
    return this.client.get<TransactionStatusResponse>(
      `/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`,
    );
  }
}
