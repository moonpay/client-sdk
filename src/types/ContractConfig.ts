import { NFTContractType } from './Enums';
import { BaseConfig } from './BaseConfig';

export interface ContractConfig extends BaseConfig {
    contractId: string;
    contractAddress: string;
    contractType: NFTContractType;
}
