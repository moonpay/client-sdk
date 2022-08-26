import { IWallet } from '../types/IWallet';
import { Logger } from './../helpers/Logger';
import { ethers } from 'ethers';
import { Config } from '../types/Config';

export default class MetaMaskWallet implements IWallet {
    constructor(
        private readonly logger: Logger,
        private readonly config: Config
    ) {}

    public async getSigner() {
        if (!window.ethereum) {
            this.logger.log('getSigner', 'MetaMask wallet not found', true);
        }

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const network = await provider.getNetwork();

        if (network.chainId !== this.config.networkChain) {
            this.logger.log(
                'getSigner',
                'Wrong network selected in MetaMask',
                true
            );
        }

        const accounts = await provider.send('eth_requestAccounts', []);

        if (!accounts.length) {
            this.logger.log('getSigner', 'No MetaMask accounts found', true);
        }

        return provider.getSigner();
    }
}
