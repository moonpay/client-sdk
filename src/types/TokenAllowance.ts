export interface TokenAllowance {
    maxAllocation: number;
    maxAllocationPrice: number;
    breakdown: {
        remainingAllocation: number;
        pricePerToken: number;
    }[];
}
