import type { PesapalClient } from "./client.js";

export class IPNResource {
    constructor(private client: PesapalClient) { }

    registerIPNUrl(payload: {
        url: string;
        ipn_notification_type: "GET" | "POST";
    }) {
        return this.client.post("/api/URLSetup/RegisterIPN", payload);
    }

    getIPNList() {
        return this.client.get("/api/URLSetup/GetIpnList");
    }
}