import { ethers } from 'ethers';
import WalletProvider from './WalletProvider';

export default class MetaMaskWalletProvider extends WalletProvider {
    private readonly deeplinkURL = `https://metamask.app.link/dapp/${window.location.href}`;

    public async getWeb3Provider() {
        let metamaskProvider: any = window?.ethereum?.isMetaMask
            ? window?.ethereum
            : undefined;

        if (window?.ethereum?.providers?.length) {
            metamaskProvider = window.ethereum.providers.find(
                (p) => p.isMetaMask
            );
        }

        if (!metamaskProvider) {
            if (this.isMobile()) {
                this.deepLinkToWalletApp();

                return;
            }

            this.logger.log('getProvider', 'MetaMask wallet not found', true);
        }

        return new ethers.providers.Web3Provider(metamaskProvider);
    }

    private deepLinkToWalletApp() {
        window.open(this.deeplinkURL, '_blank');
    }
}
