import { PesapalClient } from "./client.js";
import { Orders } from "./orders.js";
import type { PesapalConfig } from "./types/types.js";


export class Pesapal {
  client: PesapalClient;
  orders: Orders;

  constructor(config: PesapalConfig) {
    this.client = new PesapalClient(config);

    this.orders = new Orders(this.client);
  }
}
