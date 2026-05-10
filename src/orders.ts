import { PesapalClient } from "./client.js";
import { PesapalError } from "./errors.js";
import { isValidEmailAddress } from "./helpers/validation.js";
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
    this.validateOrder(payload);
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
    if (!orderTrackingId) {
      throw new PesapalError(
        "Order tracking ID is required",
        "validation_error",
        "client",
        400,
      );
    }
    return this.client.get<TransactionStatusResponse>(
      `/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`,
    );
  }

  /**
   * Client-side validation for order requests.
   */
  private validateOrder(payload: SubmitOrderRequest) {
    if (!payload.id)
      throw new PesapalError(
        "Merchant reference (id) is required",
        "validation_error",
        "client",
        400,
      );
    if (!payload.amount || payload.amount <= 0)
      throw new PesapalError(
        "Amount must be greater than 0",
        "validation_error",
        "client",
        400,
      );
    if (!payload.currency)
      throw new PesapalError(
        "Currency is required",
        "validation_error",
        "client",
        400,
      );
    if (!payload.notification_id)
      throw new PesapalError(
        "Notification ID (ipn_id) is required",
        "validation_error",
        "client",
        400,
      );
    if (!payload.callback_url)
      throw new PesapalError(
        "Callback URL is required",
        "validation_error",
        "client",
        400,
      );

    if (payload.billing_address?.email_address) {
      if (!isValidEmailAddress(payload.billing_address.email_address)) {
        throw new PesapalError(
          "Invalid email address format",
          "validation_error",
          "client",
          400,
        );
      }
    }
  }
}
