import { NetworkChain, NetworkEnvironment, NetworkType } from './Enums';

export interface BaseConfig {
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
