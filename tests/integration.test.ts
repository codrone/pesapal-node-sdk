import { describe, it, expect } from "vitest";
import { Pesapal } from "../src/index.js";

/**
 * Integration test (Smoke Test) using Pesapal Sandbox credentials.
 * Credentials are loaded from environment variables for security.
 */
describe("Pesapal Integration (Smoke Test)", () => {
  const config = {
    consumerKey: process.env.PESAPAL_CONSUMER_KEY!,
    consumerSecret: process.env.PESAPAL_CONSUMER_SECRET!,
    environment: (process.env.PESAPAL_ENVIRONMENT as any) || "sandbox",
    logger: console,
  };

  if (!config.consumerKey || !config.consumerSecret) {
    it.skip("Skipping integration test: Credentials not found in environment variables", () => {});
    return;
  }

  const pesapal = new Pesapal(config);

  it("should complete a full payment flow successfully", async () => {
    console.log("--- Authenticating ---");
    const auth = await pesapal.client["auth"].authenticate();
    expect(auth.token).toBeDefined();

    console.log("--- Registering IPN ---");
    const ipnResponse = await pesapal.ipn.registerIPNUrl({
      url: "https://webhook.site/575e9f85-0551-403d-82b5-65d83307567e",
      ipn_notification_type: "POST",
    });

    expect(ipnResponse.ipn_id).toBeDefined();
    console.log(`IPN Registered: ${ipnResponse.ipn_id}`);

    console.log("--- Submitting Order ---");
    const orderRequest = {
      id: `TEST-${Date.now()}`,
      currency: "UGX",
      amount: 100,
      description: "SDK Integration Test",
      callback_url: "https://example.com/callback",
      notification_id: ipnResponse.ipn_id,
      billing_address: {
        email_address: "test@example.com",
        phone_number: "0700000000",
        first_name: "Test",
        last_name: "User",
      },
    };

    const orderResponse = await pesapal.orders.submitOrder(orderRequest);

    expect(orderResponse.order_tracking_id).toBeDefined();
    console.log(
      `Order Submitted. Tracking ID: ${orderResponse.order_tracking_id}`,
    );

    console.log("--- Checking Status ---");
    const statusResponse = await pesapal.orders.getStatus(
      orderResponse.order_tracking_id,
    );

    expect(statusResponse).toBeDefined();
    console.log(`Transaction Status: ${statusResponse.status}`);
  }, 30000);
});
