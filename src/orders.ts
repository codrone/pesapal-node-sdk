import { PesapalClient } from "./client.js";
import type {
    SubmitOrderRequest,
    SubmitOrderResponse,
    TransactionStatusResponse,
} from "./types/types.js";

export class Orders {
    constructor(private client: PesapalClient) { }

    async submitOrder(payload: SubmitOrderRequest) {
        return this.client.post<SubmitOrderResponse>(
            "/api/Transactions/SubmitOrderRequest",
            payload
        );
    }

    async getStatus(orderTrackingId: string) {
        return this.client.get<TransactionStatusResponse>(
            `/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`
        );
    }
}