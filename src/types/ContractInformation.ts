export interface ContractInformation {
    name: string;
    symbol: string;
    allowBuyOnNetwork: boolean;
    presaleAt?: Date;
    publicSaleAt?: Date;
    saleClosesAt?: Date;
    erc721Price?: number;
    erc721MaxPerAddress?: number;
    metadata: {
        contractUrl?: string;
        tokenUrl?: string;
    };
}
