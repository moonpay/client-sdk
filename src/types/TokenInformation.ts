export interface TokenInformation {
    id: number;
    price: number;
    supply: number;
    remaining: number;
    totalSupply: number;
    maxPerTransaction: number;
    tokenAddress?: string;
    tokenAccountAddress?: string;
}
