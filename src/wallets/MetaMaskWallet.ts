import { IWallet } from '../types/IWallet';
import { Logger } from '../helpers/Logger';
import { ethers } from 'ethers';

declare const window: {
    ethereum: {
        providers: any;
    };
};

export default class MetaMaskWallet implements IWallet {
    constructor(private readonly logger: Logger) {}

    public async getProvider() {
        const metamaskProvider = window.ethereum?.providers.find(
            (x) => x.isMetaMask
        );

        if (!metamaskProvider) {
            this.logger.log('getProvider', 'MetaMask wallet not found', true);
        }

        return new ethers.providers.Web3Provider(metamaskProvider);
    }
}
