import { NFTContractMetadataType } from './Enums';

export interface ContractInformation {
    name: string;
    symbol: string;
    allowBuyOnNetwork: boolean;
    publicSaleAt?: Date;
    saleClosesAt?: Date;
    erc721Price?: number;
    erc721MaxPerTransaction?: number;
    metadata: {
        type: NFTContractMetadataType;
        contractUrl?: string;
        tokenUrl?: string;
    };
}
