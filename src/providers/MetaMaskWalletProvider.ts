import { ethers } from 'ethers';
import WalletProvider from './WalletProvider';

export default class MetaMaskWalletProvider extends WalletProvider {
    public async getWeb3Provider() {
        const metamaskProvider = window.ethereum?.providers.find(
            (x) => x.isMetaMask
        );

        if (!metamaskProvider) {
            this.logger.log('getProvider', 'MetaMask wallet not found', true);
        }

        return new ethers.providers.Web3Provider(metamaskProvider);
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

    // TODO: this doesnt work
    public removeAccountChangedEventListener(
        callback: (accounts: string[]) => void
    ) {
        window.ethereum.removeListener('accountsChanged', callback);
    }

    // TODO: this doesnt work
    public removeChainChangedEventListener(
        callback: (chainId: number) => void
    ) {
        window.ethereum.removeListener('chainChanged', callback);
    }
}
