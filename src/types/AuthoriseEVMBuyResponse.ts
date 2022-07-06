export interface AuthoriseEVMBuyResponse {
    price: number;
    maxPerAddress?: number;
    expires: number;
    signature: string;
}
