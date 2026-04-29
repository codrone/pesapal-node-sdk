# Pesapal Node.js SDK

A production-ready **Node.js / TypeScript SDK** for integrating with the Pesapal API 3.0.

This SDK provides a clean, typed, and extensible interface for handling payments, IPN (Instant Payment Notifications), and transaction status—designed with modern best practices like retries, logging, and modular architecture.

---

## ✨ Features

- ✅ Full TypeScript support (typed requests & responses)
- 🔐 Built-in automatic authentication & token management
- 🔁 Automatic retries with exponential backoff for transient failures
- 🧾 Structured resources (Orders, IPN)
- 🪵 Pluggable logging hooks
- 🌍 Sandbox & Live environment support
- 🧪 Comprehensive test suite and CI/CD ready
- 📃 JSDOC on all methods

---

## 📦 Installation

```bash
npm i pesapal-v3-node
```

---

## 🚀 Quick Start

```ts
import { Pesapal } from 'pesapal-v3-node';

const pesapal = new Pesapal({
  consumerKey: process.env.PESAPAL_CONSUMER_KEY!,
  consumerSecret: process.env.PESAPAL_CONSUMER_SECRET!,
  environment: 'sandbox', // or 'live'
});

// 1. Submit an Order
const order = await pesapal.orders.submitOrder({
  id: 'ORDER-001',
  currency: 'UGX',
  amount: 100.00,
  description: 'Test payment',
  callback_url: 'https://your-app.com/callback',
  notification_id: 'your-ipn-id',
  billing_address: {
    email_address: 'customer@example.com',
    phone_number: '0700000000',
    first_name: 'John',
    last_name: 'Doe',
  },
});

console.log('Redirect URL:', order.redirect_url);

// 2. Check Transaction Status
const status = await pesapal.orders.getStatus('order-tracking-id');
console.log('Status:', status.status);
```

---

## ⚙️ Configuration

```ts
const pesapal = new Pesapal({
  consumerKey: '...',
  consumerSecret: '...',
  environment: 'sandbox', // Default: sandbox
  retries: 3,            // Number of retries for transient failures (Default: 2)
  timeoutMs: 10000,      // Request timeout in milliseconds (Default: 10000)
  logger: console,       // Optional logger (debug, info, warn, error)
});
```

---

## 📚 API Reference

### Orders (`pesapal.orders`)

#### Submit Order
Initiates a transaction and returns a redirect URL.
```ts
await pesapal.orders.submitOrder(payload: SubmitOrderRequest);
```

#### Get Transaction Status
Checks the status of a transaction using its tracking ID.
```ts
await pesapal.orders.getStatus(orderTrackingId: string);
```

---

### IPN (`pesapal.client.ipn`)
Note: Access IPN via the internal client resource.
```ts
import { IPNResource } from 'pesapal-v3-node/ipn';
const ipn = new IPNResource(pesapal.client);

// Register IPN URL
await ipn.registerIPNUrl({
  url: 'https://example.com/ipn',
  ipn_notification_type: 'POST',
});

// List Registered IPNs
await ipn.getIPNList();
```

---

## 🔁 Retries & Error Handling

### Automatic Retries
The SDK automatically retries requests that fail due to:
- Network issues (e.g., `ECONNRESET`, `ETIMEDOUT`)
- Server-side errors (5xx)
- Rate limiting (429)
- Timeouts (408)

### Normalised Errors
All errors are caught and thrown as `PesapalError`:
```ts
import { PesapalError } from 'pesapal-v3-node';

try {
  await pesapal.orders.submitOrder(payload);
} catch (err) {
  if (err instanceof PesapalError) {
    console.error(`Error: ${err.message} (Code: ${err.code}, Status: ${err.status})`);
  }
}
```

---

## 🧪 Development & Testing

The project uses **Vitest** for unit testing and **tsup** for builds.

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build project (CJS, ESM, DTS)
npm run build

# Run full validation (lint, test, build)
npm run prepublishOnly
```

---

## 📁 Project Structure

```
src/
  index.ts        # Main entry point (Pesapal class)
  client.ts       # Core HTTP client with Auth integration
  auth.ts         # Authentication logic & token management
  orders.ts       # Order resource
  ipn.ts          # IPN resource
  errors.ts       # Error normalization
  helpers/
    retries.ts    # Retry logic
  types/
    types.ts      # TypeScript definitions
tests/            # Unit tests
```

---

## 📄 License

MIT License
