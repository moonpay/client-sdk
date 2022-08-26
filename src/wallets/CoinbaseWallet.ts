import { IWallet } from '../types/IWallet';
import { Logger } from '../helpers/Logger';
import { ethers } from 'ethers';

declare const window: {
    ethereum: {
        providers: any;
    };
};

export default class CoinbaseWallet implements IWallet {
    constructor(private readonly logger: Logger) {}

    public async getProvider() {
        const coinbaseProvider = window.ethereum?.providers.find(
            (x) => x.isCoinbaseWallet
        );

        if (!coinbaseProvider) {
            this.logger.log('getProvider', 'Coinbase wallet not found', true);
        }

        return new ethers.providers.Web3Provider(coinbaseProvider);
    }
}
