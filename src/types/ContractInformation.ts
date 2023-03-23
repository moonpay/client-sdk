import {
    NetworkChain,
    NetworkEnvironment,
    NetworkType,
    NFTContractMetadataType,
    NFTContractType
} from './Enums';

export interface ContractInformation {
    id: string;
    name: string;
    symbol: string;
    allowBuyOnNetwork: boolean;
    allowBuyWithMoonPay?: boolean;
    network: {
        type: NetworkType;
        environment: NetworkEnvironment;
        chain?: NetworkChain;
        contractAddress?: string;
        contractType: NFTContractType;
        useManagedAccessList?: boolean;
    };
    metadata: {
        type: NFTContractMetadataType;
        image?: string;
        description?: string;
        externalLink?: string;
        tokenUrl?: string;
    };
    publicSaleAt?: Date;
    saleClosesAt?: Date;
    erc721Price?: number;
    erc721MaxPerTransaction?: number;
    tokenCount?: number;
}
