export interface TokenAllowance {
    maxAllocation: number; // Total number of tokens a user can buy
    maxAllocationPrice: number; // The price if they want all the tokens
    breakdown: {
        remainingAllocation: number; // Amount available at this step
        pricePerToken: number;
    }[];
}
