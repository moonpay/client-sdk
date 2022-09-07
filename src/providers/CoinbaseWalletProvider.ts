import { ethers } from 'ethers';
import WalletProvider from './WalletProvider';

export default class CoinbaseWalletProvider extends WalletProvider {
    public async getWeb3Provider() {
        const coinbaseProvider = window.ethereum?.providers.find(
            (x) => x.isCoinbaseWallet
        );

        if (!coinbaseProvider) {
            this.logger.log('getProvider', 'Coinbase wallet not found', true);
        }

        return new ethers.providers.Web3Provider(coinbaseProvider);
    }
}
