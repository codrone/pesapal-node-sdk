# Pesapal Node.js SDK

A production-ready **Node.js / TypeScript SDK** for integrating with the Pesapal API 3.0.

This SDK provides a clean, typed, and extensible interface for handling payments, IPN (Instant Payment Notifications), and transaction status—designed with modern best practices like retries, logging, and modular architecture.

---

## ✨ Features

- ✅ Full TypeScript support (typed requests & responses)
- 🔐 Built-in authentication handling
- 🔁 Automatic retries with exponential backoff
- 🧾 Structured resources (Transactions, IPN, etc.)
- 🪵 Pluggable logging hooks
- 🧩 Middleware support (extensible)
- 🌍 Sandbox & Live environment support

---

## 📦 Installation

```bash
npm install pesapal-v3-node
```

or

```bash
yarn add pesapal-v3-node
```

---

## 🚀 Quick Start

```ts
import {Pesapal} from 'pesapal-v3-node';

const pesapal = new Pesapal({
  consumerKey: process.env.PESAPAL_CONSUMER_KEY!,
  consumerSecret: process.env.PESAPAL_CONSUMER_SECRET!,
  environment: 'sandbox',
});

const order = await pesapal.transactions.submitOrder({
  id: 'ORDER-001',
  currency: 'UGX',
  amount: 10000,
  description: 'Test payment',
  callback_url: 'https://example.com/callback',
  notification_id: 'YOUR_IPN_ID',
  billing_address: {
    email_address: 'customer@example.com',
    phone_number: '256700000000',
    first_name: 'John',
    last_name: 'Doe',
  },
});

console.log(order.redirect_url);
```

---

## ⚙️ Configuration

```ts
interface PesapalConfig {
  consumerKey: string;
  consumerSecret: string;
  environment?: 'sandbox' | 'live';
  retries?: number;
  timeoutMs?: number;
  logger?: {
    debug?: (...args: unknown[]) => void;
    info?: (...args: unknown[]) => void;
    warn?: (...args: unknown[]) => void;
    error?: (...args: unknown[]) => void;
  };
}
```

### Example with advanced config

```ts
const pesapal = new Pesapal({
  consumerKey: '...',
  consumerSecret: '...',
  environment: 'sandbox',
  retries: 3,
  timeoutMs: 10000,
  logger: console,
});
```

---

## 📚 API Reference

### Transactions

#### Submit Order

```ts
await pesapal.transactions.submitOrder(payload);
```

#### Get Transaction Status

```ts
await pesapal.transactions.getStatus(orderTrackingId);
```

---

### IPN (Instant Payment Notifications)

#### Register IPN URL

```ts
await pesapal.ipn.registerIPNUrl({
  url: 'https://example.com/ipn',
  ipn_notification_type: 'POST',
});
```

#### Get IPN List

```ts
await pesapal.ipn.getIPNList();
```

---

## 🔁 Retries

Retries are enabled by default and apply to:

- Network errors
- Timeout errors
- HTTP 408, 429, and 5xx responses

Uses exponential backoff:

```
500ms → 1000ms → 2000ms → ...
```

Customize:

```ts
const pesapal = new Pesapal({
  consumerKey: '...',
  consumerSecret: '...',
  retries: 5,
});
```

---

## 🪵 Logging

Provide a logger to observe SDK behavior:

```ts
const pesapal = new Pesapal({
  consumerKey: '...',
  consumerSecret: '...',
  logger: console,
});
```

Supported methods:

- `debug`
- `info`
- `warn`
- `error`

---

## 🧩 Middleware (Advanced)

You can hook into request lifecycle:

```ts
const pesapal = new Pesapal({
  consumerKey: '...',
  consumerSecret: '...',
  middleware: [
    {
      beforeRequest: (ctx) => {
        console.log('Request:', ctx);
      },
      afterResponse: (ctx) => {
        console.log('Response:', ctx);
      },
      onError: (ctx) => {
        console.error('Error:', ctx);
      },
    },
  ],
});
```

---

## 🛑 Error Handling

All errors are normalized into `PesapalError`:

```ts
try {
  await pesapal.transactions.submitOrder(payload);
} catch (err) {
  if (err instanceof PesapalError) {
    console.error(err.message);
    console.error(err.status);
  }
}
```

---

## 🧪 Development

```bash
npm install
npm run build
npm run test
```

---

## 📁 Project Structure

```
src/
  core/
    client.ts
    retries.ts
    errors.ts
  resources/
    transactions.ts
    ipn.ts
  types/
    common.ts
    transactions.ts
```

---

## 🔐 Environment

- **Sandbox:** `https://cybqa.pesapal.com/pesapalv3`
- **Live:** `https://pay.pesapal.com/v3`

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repo
2. Create a feature branch
3. Commit changes
4. Open a pull request

---

## 📄 License

MIT License

---

## 💡 Notes

- Tokens expire quickly (~5 minutes), handled internally
- Always use environment variables for credentials
- Recommended for Node.js 18+

---

## 🚀 Roadmap

- [ ] Refunds API
- [ ] Subscription support
- [ ] Webhook verification helpers
- [ ] Auto token refresh optimization
- [ ] Better test coverage

---

## 🙌 Acknowledgements

Built for developers integrating with Pesapal API 3.0.

---

## 📬 Support

For issues or questions, open a GitHub issue or contact the maintainer.
