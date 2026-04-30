import { createHmac } from "node:crypto";

/**
 * Interface representing the structured data from a Pesapal IPN.
 */
export interface PesapalIPN {
    OrderTrackingId: string;
    OrderMerchantReference: string;
    OrderNotificationType: "IPNCHANGE" | string;
}

/**
 * Verifies the signature of an IPN request from Pesapal.
 * Note: Pesapal V3 might use different verification methods.
 * This is a standard implementation template based on common webhook security.
 *
 * @param signature The signature from the 'X-Pesapal-Signature' header (or similar).
 * @param rawBody The raw request body as a string.
 * @param consumerSecret Your Pesapal Consumer Secret.
 * @returns True if the signature is valid.
 */
export function verifyIPNSignature(
    signature: string,
    rawBody: string,
    consumerSecret: string
): boolean {
    const hmac = createHmac("sha256", consumerSecret);
    const expectedSignature = hmac.update(rawBody).digest("hex");
    return signature === expectedSignature;
}

/**
 * Parses a raw IPN request body into a typed object.
 * @param body The request body (parsed JSON or raw string).
 * @returns A structured PesapalIPN object.
 */
export function parseIPN(body: any): PesapalIPN {
    const data = typeof body === "string" ? JSON.parse(body) : body;

    return {
        OrderTrackingId: data.OrderTrackingId || data.order_tracking_id,
        OrderMerchantReference: data.OrderMerchantReference || data.order_merchant_reference,
        OrderNotificationType: data.OrderNotificationType || data.order_notification_type,
    };
}
