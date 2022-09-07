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
}
