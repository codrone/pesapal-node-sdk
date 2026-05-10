import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { PesapalClient } from "../src/client.ts";
import { PesapalError } from "../src/errors.ts";
import { IPNResource } from "../src/ipn.ts";
import { Orders } from "../src/orders.ts";
import { RecurringPayments } from "../src/recurring.ts";
import { Refunds } from "../src/refunds.ts";
import { OrderCancellations } from "../src/cancellations.ts";

describe("PesapalClient and Resources", () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;
  const config = {
    consumerKey: "test-key",
    consumerSecret: "test-secret",
    environment: "sandbox" as const,
    retries: 0,
    timeoutMs: 1000,
  };

  beforeEach(() => {
    fetchSpy = vi.spyOn(global, "fetch");
    mockFetchResponse({
      token: "fake-token",
      expiryDate: "2026-04-29T10:00:00Z",
    });
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  function mockFetchResponse(body: unknown, init: Partial<Response> = {}) {
    fetchSpy.mockResolvedValueOnce({
      ok: init.ok ?? true,
      status: init.status ?? 200,
      statusText: init.statusText ?? "OK",
      json: () => Promise.resolve(body),
    } as Response);
  }

  function mockEmptyFetchResponse(init: Partial<Response> = {}) {
    fetchSpy.mockResolvedValueOnce({
      ok: init.ok ?? true,
      status: init.status ?? 200,
      statusText: init.statusText ?? "OK",
      json: () => Promise.reject(new SyntaxError("Unexpected end of JSON input")),
    } as Response);
  }

  function expectAuthRequest(callIndex = 0) {
    expect(fetchSpy).toHaveBeenNthCalledWith(
      callIndex + 1,
      "https://cybqa.pesapal.com/pesapalv3/api/Auth/RequestToken",
      expect.objectContaining({
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          consumer_key: "test-key",
          consumer_secret: "test-secret",
        }),
      }),
    );
  }

  function expectJsonRequest(
    callIndex: number,
    url: string,
    method: string,
    body?: unknown,
  ) {
    const expectedOptions: Record<string, unknown> = {
      method,
      headers: expect.objectContaining({
        Accept: "application/json",
        Authorization: "Bearer fake-token",
      }),
    };

    if (body !== undefined) {
      expectedOptions.headers = expect.objectContaining({
        Accept: "application/json",
        Authorization: "Bearer fake-token",
        "Content-Type": "application/json",
      });
      expectedOptions.body = JSON.stringify(body);
    }

    expect(fetchSpy).toHaveBeenNthCalledWith(
      callIndex + 1,
      url,
      expect.objectContaining(expectedOptions),
    );
  }

  describe("PesapalClient", () => {
    it("should make a GET request with authorization header", async () => {
      const responseData = { data: "test-data" };
      mockFetchResponse(responseData);

      const client = new PesapalClient(config);
      const result = await client.get<typeof responseData>("/api/Test");

      expect(result).toEqual(responseData);
      expectAuthRequest();
      expectJsonRequest(
        1,
        "https://cybqa.pesapal.com/pesapalv3/api/Test",
        "GET",
      );
    });

    it("should make a POST request with data", async () => {
      const postData = { name: "test" };
      const responseData = { id: 1 };
      mockFetchResponse(responseData);

      const client = new PesapalClient(config);
      const result = await client.post<typeof responseData>(
        "/api/Test",
        postData,
      );

      expect(result).toEqual(responseData);
      expectAuthRequest();
      expectJsonRequest(
        1,
        "https://cybqa.pesapal.com/pesapalv3/api/Test",
        "POST",
        postData,
      );
    });

    it("should make a POST request with falsy data", async () => {
      const responseData = { accepted: true };
      mockFetchResponse(responseData);

      const client = new PesapalClient(config);
      const result = await client.post<typeof responseData>("/api/Test", false);

      expect(result).toEqual(responseData);
      expectAuthRequest();
      expectJsonRequest(
        1,
        "https://cybqa.pesapal.com/pesapalv3/api/Test",
        "POST",
        false,
      );
    });

    it("should return undefined for 204 responses", async () => {
      mockEmptyFetchResponse({ status: 204, statusText: "No Content" });

      const client = new PesapalClient(config);
      const result = await client.delete<undefined>("/api/Test");

      expect(result).toBeUndefined();
      expectAuthRequest();
      expectJsonRequest(
        1,
        "https://cybqa.pesapal.com/pesapalv3/api/Test",
        "DELETE",
      );
    });

    it("should return undefined for empty JSON response bodies", async () => {
      mockEmptyFetchResponse();

      const client = new PesapalClient(config);
      const result = await client.get<undefined>("/api/Test");

      expect(result).toBeUndefined();
      expectAuthRequest();
      expectJsonRequest(
        1,
        "https://cybqa.pesapal.com/pesapalv3/api/Test",
        "GET",
      );
    });

    it("should throw PesapalError on request failure", async () => {
      mockFetchResponse(
        {
          error: {
            message: "Bad Request",
            code: "400",
          },
        },
        { ok: false, status: 400, statusText: "Bad Request" },
      );

      const client = new PesapalClient(config);
      await expect(client.get("/api/Fail")).rejects.toThrow(PesapalError);
      expectAuthRequest();
      expectJsonRequest(
        1,
        "https://cybqa.pesapal.com/pesapalv3/api/Fail",
        "GET",
      );
    });

    it("should normalize fetch HTTP errors into PesapalError", async () => {
      mockFetchResponse(
        {
          error: {
            message: "Server Error",
            code: "500",
            type: "server",
          },
        },
        { ok: false, status: 500, statusText: "Internal Server Error" },
      );

      const client = new PesapalClient(config);
      try {
        await client.get("/api/Error");
        throw new Error("Expected request to fail");
      } catch (err: any) {
        expect(err).toBeInstanceOf(PesapalError);
        expect(err.status).toBe(500);
        expect(err.code).toBe("500");
        expect(err.type).toBe("server");
      }
    });
  });

  describe("IPNResource", () => {
    it("should register IPN URL", async () => {
      const payload = {
        url: "https://example.com/ipn",
        ipn_notification_type: "POST" as const,
      };
      mockFetchResponse({ status: "success" });

      const client = new PesapalClient(config);
      const ipn = new IPNResource(client);
      const result = await ipn.registerIPNUrl(payload);

      expect(result).toEqual({ status: "success" });
      expectAuthRequest();
      expectJsonRequest(
        1,
        "https://cybqa.pesapal.com/pesapalv3/api/URLSetup/RegisterIPN",
        "POST",
        payload,
      );
    });

    it("should get IPN list", async () => {
      const ipnList = [{ ipn_id: "1", url: "https://example.com/ipn" }];
      mockFetchResponse(ipnList);

      const client = new PesapalClient(config);
      const ipn = new IPNResource(client);
      const result = await ipn.getIPNList();

      expect(result).toEqual(ipnList);
      expectAuthRequest();
      expectJsonRequest(
        1,
        "https://cybqa.pesapal.com/pesapalv3/api/URLSetup/GetIpnList",
        "GET",
      );
    });
  });

  describe("Orders", () => {
    it("should submit order", async () => {
      const payload = {
        id: "123",
        amount: 100,
        currency: "UGX",
        notification_id: "ipn-123",
        callback_url: "https://example.com/callback",
      } as any;
      mockFetchResponse({ order_id: "order-123" });

      const client = new PesapalClient(config);
      const orders = new Orders(client);
      const result = await orders.submitOrder(payload);

      expect(result).toEqual({ order_id: "order-123" });
      expectAuthRequest();
      expectJsonRequest(
        1,
        "https://cybqa.pesapal.com/pesapalv3/api/Transactions/SubmitOrderRequest",
        "POST",
        payload,
      );
    });

    it("should get transaction status", async () => {
      mockFetchResponse({ status: "COMPLETED" });

      const client = new PesapalClient(config);
      const orders = new Orders(client);
      const result = await orders.getStatus("track-123");

      expect(result).toEqual({ status: "COMPLETED" });
      expectAuthRequest();
      expectJsonRequest(
        1,
        "https://cybqa.pesapal.com/pesapalv3/api/Transactions/GetTransactionStatus?orderTrackingId=track-123",
        "GET",
      );
    });
  });

  describe("RecurringPayments", () => {
    it("should submit recurring order with subscription details", async () => {
      const payload = {
        id: "SUB-123",
        amount: 100,
        currency: "UGX",
        description: "Monthly subscription",
        notification_id: "ipn-123",
        callback_url: "https://example.com/callback",
        billing_address: {
          email_address: "customer@example.com",
        },
        account_number: "ACC-123",
        subscription_details: {
          start_date: "01-06-2026",
          end_date: "01-06-2027",
          frequency: "MONTHLY" as const,
        },
      };
      mockFetchResponse({ order_tracking_id: "tracking-123" });

      const client = new PesapalClient(config);
      const recurring = new RecurringPayments(client);
      const result = await recurring.submitOrder(payload);

      expect(result).toEqual({ order_tracking_id: "tracking-123" });
      expectAuthRequest();
      expectJsonRequest(
        1,
        "https://cybqa.pesapal.com/pesapalv3/api/Transactions/SubmitOrderRequest",
        "POST",
        payload,
      );
    });

    it("should require account number for recurring orders", async () => {
      const client = new PesapalClient(config);
      const recurring = new RecurringPayments(client);

      await expect(
        recurring.submitOrder({
          id: "SUB-123",
          amount: 100,
          currency: "UGX",
          description: "Monthly subscription",
          notification_id: "ipn-123",
          callback_url: "https://example.com/callback",
          billing_address: {
            email_address: "customer@example.com",
          },
          account_number: "",
        }),
      ).rejects.toMatchObject({
        message: "Account number is required for recurring payments",
        status: 400,
      });

      expect(fetchSpy).toHaveBeenCalledTimes(0);
    });

    it("should validate subscription date format", async () => {
      const client = new PesapalClient(config);
      const recurring = new RecurringPayments(client);

      await expect(
        recurring.submitOrder({
          id: "SUB-123",
          amount: 100,
          currency: "UGX",
          description: "Monthly subscription",
          notification_id: "ipn-123",
          callback_url: "https://example.com/callback",
          billing_address: {
            email_address: "customer@example.com",
          },
          account_number: "ACC-123",
          subscription_details: {
            start_date: "2026-06-01",
            end_date: "01-06-2027",
            frequency: "MONTHLY",
          },
        }),
      ).rejects.toMatchObject({
        message: "Subscription start date must use dd-MM-yyyy format",
        status: 400,
      });

      expect(fetchSpy).toHaveBeenCalledTimes(0);
    });
  });

  describe("Refunds", () => {
    it("should request a refund", async () => {
      const payload = {
        confirmation_code: "AA11BB22",
        amount: 100,
        username: "John Doe",
        remarks: "Service not offered",
      };
      mockFetchResponse({
        status: "200",
        message: "Refund request successfully",
      });

      const client = new PesapalClient(config);
      const refunds = new Refunds(client);
      const result = await refunds.requestRefund(payload);

      expect(result).toEqual({
        status: "200",
        message: "Refund request successfully",
      });
      expectAuthRequest();
      expectJsonRequest(
        1,
        "https://cybqa.pesapal.com/pesapalv3/api/Transactions/RefundRequest",
        "POST",
        payload,
      );
    });

    it("should require confirmation code for refunds", async () => {
      const client = new PesapalClient(config);
      const refunds = new Refunds(client);

      await expect(
        refunds.requestRefund({
          confirmation_code: "",
          amount: 100,
          username: "John Doe",
          remarks: "Service not offered",
        }),
      ).rejects.toMatchObject({
        message: "Confirmation code is required",
        status: 400,
      });

      expect(fetchSpy).toHaveBeenCalledTimes(0);
    });

    it("should validate refund amount", async () => {
      const client = new PesapalClient(config);
      const refunds = new Refunds(client);

      await expect(
        refunds.requestRefund({
          confirmation_code: "AA11BB22",
          amount: 0,
          username: "John Doe",
          remarks: "Service not offered",
        }),
      ).rejects.toMatchObject({
        message: "Refund amount must be greater than 0",
        status: 400,
      });

      expect(fetchSpy).toHaveBeenCalledTimes(0);
    });
  });

  describe("OrderCancellations", () => {
    it("should cancel an order", async () => {
      const payload = {
        order_tracking_id: "tracking-123",
      };
      mockFetchResponse({
        status: "200",
        message: "Order successfully cancelled.",
      });

      const client = new PesapalClient(config);
      const cancellations = new OrderCancellations(client);
      const result = await cancellations.cancelOrder(payload);

      expect(result).toEqual({
        status: "200",
        message: "Order successfully cancelled.",
      });
      expectAuthRequest();
      expectJsonRequest(
        1,
        "https://cybqa.pesapal.com/pesapalv3/api/Transactions/CancelOrder",
        "POST",
        payload,
      );
    });

    it("should require order tracking ID for cancellations", async () => {
      const client = new PesapalClient(config);
      const cancellations = new OrderCancellations(client);

      await expect(
        cancellations.cancelOrder({
          order_tracking_id: "",
        }),
      ).rejects.toMatchObject({
        message: "Order tracking ID is required",
        status: 400,
      });

      expect(fetchSpy).toHaveBeenCalledTimes(0);
    });
  });
});
