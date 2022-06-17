export interface TokenInformation {
  id: number;
  price: number;
  supply: number;
  remaining: number;
  totalSupply: number;
  maxPerAddress: number;
  tokenAddress?: string;
  tokenAccountAddress?: string;
}
