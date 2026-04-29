export class PesapalError extends Error {
    constructor(
        message: string,
        public code?: string,
        public type?: string,
        public status?: number
    ) {
        super(message);
        this.name = "PesapalError";
    }
}