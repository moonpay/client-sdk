import {
    NetworkChain,
    NetworkEnvironment,
    NetworkType,
    NFTContractType
} from './Enums';

export interface Config {
    contractId: string;
    contractAddress: string;
    contractType: NFTContractType;
    networkType: NetworkType;
    networkEnvironment: NetworkEnvironment;
    networkChain: NetworkChain;
    enableLogging?: boolean;
    logger?: (
        method: string,
        message: string,
        isFatal: boolean,
        data?: any
    ) => void;
    hmURL?: string;
}
