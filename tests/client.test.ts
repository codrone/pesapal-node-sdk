import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { PesapalClient } from "../src/client.ts";
import { PesapalError } from "../src/errors.ts";
import { IPNResource } from "../src/ipn.ts";
import { Orders } from "../src/orders.ts";

describe("PesapalClient and Resources", () => {
  let mock: MockAdapter;
  const config = {
    consumerKey: "test-key",
    consumerSecret: "test-secret",
    environment: "sandbox" as const,
    retries: 0,
  };

  beforeEach(() => {
    mock = new MockAdapter(axios);
    mock
      .onPost("https://cybqa.pesapal.com/pesapalv3/api/Auth/RequestToken")
      .reply(200, {
        token: "fake-token",
        expiryDate: "2026-04-29T10:00:00Z",
      });
  });

  afterEach(() => {
    mock.restore();
  });

  describe("PesapalClient", () => {
    it("should make a GET request with authorization header", async () => {
      const responseData = { data: "test-data" };
      mock
        .onGet("https://cybqa.pesapal.com/pesapalv3/api/Test")
        .reply((config) => {
          expect(config.headers?.Authorization).toBe("Bearer fake-token");
          return [200, responseData];
        });

      const client = new PesapalClient(config);
      const result = await client.get<typeof responseData>("/api/Test");

      expect(result).toEqual(responseData);
    });

    it("should make a POST request with data", async () => {
      const postData = { name: "test" };
      const responseData = { id: 1 };
      mock
        .onPost("https://cybqa.pesapal.com/pesapalv3/api/Test")
        .reply((config) => {
          expect(JSON.parse(config.data)).toEqual(postData);
          return [200, responseData];
        });

      const client = new PesapalClient(config);
      const result = await client.post<typeof responseData>(
        "/api/Test",
        postData,
      );

      expect(result).toEqual(responseData);
    });

    it("should throw PesapalError on request failure", async () => {
      mock.onGet("https://cybqa.pesapal.com/pesapalv3/api/Fail").reply(400, {
        error: {
          message: "Bad Request",
          code: "400",
        },
      });

      const client = new PesapalClient(config);
      await expect(client.get("/api/Fail")).rejects.toThrow(PesapalError);
    });

    it("should normalize axios errors into PesapalError", async () => {
      mock.onGet("https://cybqa.pesapal.com/pesapalv3/api/Error").reply(500);

      const client = new PesapalClient(config);
      try {
        await client.get("/api/Error");
      } catch (err: any) {
        expect(err).toBeInstanceOf(PesapalError);
        expect(err.status).toBe(500);
      }
    });
  });

  describe("IPNResource", () => {
    it("should register IPN URL", async () => {
      const payload = {
        url: "https://example.com/ipn",
        ipn_notification_type: "POST" as const,
      };
      mock
        .onPost("https://cybqa.pesapal.com/pesapalv3/api/URLSetup/RegisterIPN")
        .reply(200, { status: "success" });

      const client = new PesapalClient(config);
      const ipn = new IPNResource(client);
      const result = await ipn.registerIPNUrl(payload);

      expect(result).toEqual({ status: "success" });
    });

    it("should get IPN list", async () => {
      const ipnList = [{ ipn_id: "1", url: "https://example.com/ipn" }];
      mock
        .onGet("https://cybqa.pesapal.com/pesapalv3/api/URLSetup/GetIpnList")
        .reply(200, ipnList);

      const client = new PesapalClient(config);
      const ipn = new IPNResource(client);
      const result = await ipn.getIPNList();

      expect(result).toEqual(ipnList);
    });
  });

  describe("Orders", () => {
    it("should submit order", async () => {
      const payload = { id: "123", amount: 100 } as any;
      mock
        .onPost(
          "https://cybqa.pesapal.com/pesapalv3/api/Transactions/SubmitOrderRequest",
        )
        .reply(200, { order_id: "order-123" });

      const client = new PesapalClient(config);
      const orders = new Orders(client);
      const result = await orders.submitOrder(payload);

      expect(result).toEqual({ order_id: "order-123" });
    });

    it("should get transaction status", async () => {
      mock
        .onGet(
          "https://cybqa.pesapal.com/pesapalv3/api/Transactions/GetTransactionStatus?orderTrackingId=track-123",
        )
        .reply(200, { status: "COMPLETED" });

      const client = new PesapalClient(config);
      const orders = new Orders(client);
      const result = await orders.getStatus("track-123");

      expect(result).toEqual({ status: "COMPLETED" });
    });
  });
});
