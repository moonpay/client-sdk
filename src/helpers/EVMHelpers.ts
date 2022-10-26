import { ethers } from 'ethers';
import { ContractConfig } from '../types/ContractConfig';
import { NetworkChain } from '../types/Enums';
import { WETHABI } from '../types/EVMABIs';

export class EVMHelpers {
    public static getWETHContract(
        config: ContractConfig,
        signer: ethers.Signer
    ) {
        let address;

        switch (config.networkChain) {
            case NetworkChain.EVMLocal:
                address = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
                break;

            case NetworkChain.Mumbai:
                address = '0xf42C211eC35A17d6192e44928c65f7a65fBfEDF2';
                break;

            case NetworkChain.Polygon:
                address = '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619';
                break;

            default:
                throw new Error(
                    `Cannot get WETH contract for network ${config.networkChain}`
                );
        }

        return new ethers.Contract(address, WETHABI, signer);
    }
}
