import { defaultShouldRetry } from "../helpers/retries.js";

export type PesapalEnvironment = "sandbox" | "live";

export interface PesapalConfig {
  consumerKey: string;
  consumerSecret: string;
  environment?: PesapalEnvironment;
  timeoutMs?: number;
  // retries?: number | { retries: number; factor: number; minTimeout: number };
  retries?: number;
  logger?: {
    debug?: (message: string, meta?: Record<string, unknown>) => void;
    info?: (message: string, meta?: Record<string, unknown>) => void;
    warn?: (message: string, meta?: Record<string, unknown>) => void;
    error?: (message: string, meta?: Record<string, unknown>) => void;
  };
}

export interface PesapalAuthResponse {
  token: string;
  expiryDate: string;
  error: unknown | null;
  status: string;
  message: string;
}

export interface BillingAddress {
  email_address?: string;
  phone_number?: string;
  country_code?: string;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  line_1?: string;
  line_2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  zip_code?: string;
}

export interface SubmitOrderRequest {
  id: string;
  currency: string;
  amount: number;
  description: string;
  callback_url: string;
  notification_id: string;
  billing_address: BillingAddress;
  account_number?: string;
  subscription_details?: SubscriptionDetails;
}

export interface SubmitOrderResponse {
  order_tracking_id: string;
  merchant_reference: string;
  redirect_url: string;
  error?: unknown;
  status?: string;
}

export type SubscriptionFrequency =
  | "DAILY"
  | "WEEKLY"
  | "MONTHLY"
  | "YEARLY";

export interface SubscriptionDetails {
  start_date: string;
  end_date: string;
  frequency: SubscriptionFrequency;
}

export interface SubmitRecurringOrderRequest extends SubmitOrderRequest {
  account_number: string;
  subscription_details?: SubscriptionDetails;
}

export interface TransactionStatusResponse {
  payment_method?: string;
  amount?: number;
  status?: string;
  confirmation_code?: string;
  payment_status_description?: string;
  subscription_transaction_info?: SubscriptionTransactionInfo;
}

export interface RefundRequest {
  confirmation_code: string;
  amount: number;
  username: string;
  remarks: string;
}

export interface RefundResponse {
  status: string;
  message: string;
}

export interface CancelOrderRequest {
  order_tracking_id: string;
}

export interface CancelOrderResponse {
  status: string;
  message: string;
}

export interface SubscriptionTransactionInfo {
  account_reference?: string;
  amount?: number;
  first_name?: string;
  last_name?: string;
  correlation_id?: string;
}

export type IPNNotificationType = "GET" | "POST";

export interface RegisterIPNUrlRequest {
  url: string;
  ipn_notification_type: IPNNotificationType;
}

export interface RegisterIPNUrlResponse {
  url: string;
  created_date: string;
  ipn_id: string;
  notification_type: 0 | 1;
  ipn_notification_type_description: IPNNotificationType;
  ipn_status: 0 | 1;
  ipn_status_description?: "Active" | "Inactive";
  ipn_status_decription?: "Active" | "Inactive";
  error: null | {
    error_type?: string;
    code?: string;
    message?: string;
  };
  status: string;
}

export interface RetryOptions {
  retries?: PesapalConfig["retries"] | number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  shouldRetry?: (error: any) => boolean;
  onRetry?: (info: {
    attempt: number;
    retries: number;
    error: any;
    delay: number;
  }) => void;
}
