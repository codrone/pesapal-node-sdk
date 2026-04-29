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
}

export interface SubmitOrderResponse {
    order_tracking_id: string;
    merchant_reference: string;
    redirect_url: string;
    error?: unknown;
    status?: string;
}

export interface TransactionStatusResponse {
    payment_method?: string;
    amount?: number;
    status?: string;
    confirmation_code?: string;
    payment_status_description?: string;
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
