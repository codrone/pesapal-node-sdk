import { PesapalClient } from "./client.js";
import { PesapalError } from "./errors.js";
import { isValidEmailAddress } from "./helpers/validation.js";
import type {
  SubmitOrderResponse,
  SubmitRecurringOrderRequest,
  SubscriptionFrequency,
} from "./types/types.js";

const SUBSCRIPTION_FREQUENCIES: SubscriptionFrequency[] = [
  "DAILY",
  "WEEKLY",
  "MONTHLY",
  "YEARLY",
];

/**
 * Resource for submitting recurring / subscription based payment orders.
 */
export class RecurringPayments {
  /**
   * Creates an instance of RecurringPayments.
   * @param client The authenticated Pesapal client.
   */
  constructor(private client: PesapalClient) {}

  /**
   * Submits an order with recurring payment fields.
   *
   * Pesapal creates the subscription after the customer accepts recurring
   * payments on the checkout iframe.
   */
  async submitOrder(payload: SubmitRecurringOrderRequest) {
    this.validateRecurringOrder(payload);
    return this.client.post<SubmitOrderResponse>(
      "/api/Transactions/SubmitOrderRequest",
      payload,
    );
  }

  private validateRecurringOrder(payload: SubmitRecurringOrderRequest) {
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
    if (!payload.account_number)
      throw new PesapalError(
        "Account number is required for recurring payments",
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

    if (!payload.subscription_details) return;

    const dateRegex = /^\d{2}-\d{2}-\d{4}$/;
    if (!dateRegex.test(payload.subscription_details.start_date)) {
      throw new PesapalError(
        "Subscription start date must use dd-MM-yyyy format",
        "validation_error",
        "client",
        400,
      );
    }
    if (!dateRegex.test(payload.subscription_details.end_date)) {
      throw new PesapalError(
        "Subscription end date must use dd-MM-yyyy format",
        "validation_error",
        "client",
        400,
      );
    }
    if (!SUBSCRIPTION_FREQUENCIES.includes(payload.subscription_details.frequency)) {
      throw new PesapalError(
        "Subscription frequency must be DAILY, WEEKLY, MONTHLY, or YEARLY",
        "validation_error",
        "client",
        400,
      );
    }
  }
}
