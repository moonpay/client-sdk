export interface BuyTokensRequest {
    contractId: string;
    tokenId?: number;
    destination: string;
    amount: number;
}
