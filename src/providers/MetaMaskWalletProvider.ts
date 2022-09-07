import { ethers } from 'ethers';
import WalletProvider from './WalletProvider';

export default class MetaMaskWalletProvider extends WalletProvider {
    public async getWeb3Provider() {
        let metamaskProvider: any = window?.ethereum;

        if (window?.ethereum?.providers?.length) {
            window.ethereum.providers.forEach(async (p) => {
                if (p.isMetaMask) {
                    metamaskProvider = p;
                }
            });
        }

        if (!metamaskProvider) {
            this.logger.log('getProvider', 'MetaMask wallet not found', true);
        }

        return new ethers.providers.Web3Provider(metamaskProvider);
    }
}
