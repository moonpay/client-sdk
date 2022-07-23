export interface AuthoriseEVMBuyResponse {
    totalPrice: number;
    maxPerAddress?: number;
    expires: number;
    signature: string;
}
