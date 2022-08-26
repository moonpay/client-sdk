import { ethers } from 'ethers';
import WalletProvider from './WalletProvider';

export default class MetaMaskWalletProvider extends WalletProvider {
    public async getProvider() {
        const metamaskProvider = window.ethereum?.providers.find(
            (x) => x.isMetaMask
        );

        if (!metamaskProvider) {
            this.logger.log('getProvider', 'MetaMask wallet not found', true);
        }

        return new ethers.providers.Web3Provider(metamaskProvider);
    }

    public onAccountsChanged(accounts: string[]): void {
        window.ethereum.on('accountsChanged', console.log);
    }

    public onChainChanged(chainId: number): void {
        window.ethereum.on('chainChanged', console.log);
    }
}
