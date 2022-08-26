import { ethers } from 'ethers';
import WalletProvider from './WalletProvider';

export default class CoinbaseWalletProvider extends WalletProvider {
    public async getProvider() {
        const coinbaseProvider = window.ethereum?.providers.find(
            (x) => x.isCoinbaseWallet
        );

        if (!coinbaseProvider) {
            this.logger.log('getProvider', 'Coinbase wallet not found', true);
        }

        return new ethers.providers.Web3Provider(coinbaseProvider);
    }

    public onAccountsChanged(accounts: string[]): void {
        window.ethereum.on('accountsChanged', console.log);
    }

    public onChainChanged(chainId: number): void {
        window.ethereum.on('chainChanged', console.log);
    }
}
