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

    public addAccountChangedEventListener(
        callback: (acounts: string[]) => void
    ): void {
        window.ethereum.on('accountsChanged', callback);
    }

    public addChainChangedEventListener(
        callback: (chainId: number) => void
    ): void {
        window.ethereum.on('chainChanged', callback);
    }

    public removeAccountChangedEventListener(
        callback: (accounts: string[]) => void
    ) {
        window.ethereum.removeListener('accountsChanged', callback);
    }

    public removeChainChangedEventListener(
        callback: (chainId: number) => void
    ) {
        window.ethereum.removeListener('chainChanged', callback);
    }
}
