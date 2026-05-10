import { PesapalClient } from "./client.js";
import { PesapalError } from "./errors.js";
import type { RefundRequest, RefundResponse } from "./types/types.js";

/**
 * Resource for requesting full or partial refunds.
 */
export class Refunds {
  /**
   * Creates an instance of Refunds.
   * @param client The authenticated Pesapal client.
   */
  constructor(private client: PesapalClient) {}

  /**
   * Requests a refund for a completed payment.
   *
   * Pesapal identifies the payment by the processor confirmation code returned
   * from the transaction status endpoint.
   */
  async requestRefund(payload: RefundRequest) {
    this.validateRefund(payload);
    return this.client.post<RefundResponse>(
      "/api/Transactions/RefundRequest",
      payload,
    );
  }

  private validateRefund(payload: RefundRequest) {
    if (!payload.confirmation_code)
      throw new PesapalError(
        "Confirmation code is required",
        "validation_error",
        "client",
        400,
      );
    if (!payload.amount || payload.amount <= 0)
      throw new PesapalError(
        "Refund amount must be greater than 0",
        "validation_error",
        "client",
        400,
      );
    if (!payload.username)
      throw new PesapalError(
        "Username is required",
        "validation_error",
        "client",
        400,
      );
    if (!payload.remarks)
      throw new PesapalError(
        "Refund remarks are required",
        "validation_error",
        "client",
        400,
      );
  }
}
