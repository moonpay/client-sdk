import { ethers } from 'ethers';
import WalletProvider from './WalletProvider';

export default class CoinbaseWalletProvider extends WalletProvider {
    private readonly deeplinkURL = `https://go.cb-w.com/dapp?cb_url=${window.location.host}`;

    public async getWeb3Provider() {
        let coinbaseProvider: any = window?.ethereum?.isCoinbaseWallet
            ? window?.ethereum
            : undefined;

        if (window?.ethereum?.providers?.length) {
            coinbaseProvider = window.ethereum.providers.find(
                (p) => p.isCoinbaseWallet
            );
        }

        if (!coinbaseProvider) {
            if (this.isMobile()) {
                this.deepLinkToWalletApp();

                return;
            }

            this.logger.log('getProvider', 'Coinbase wallet not found', true);
        }

        return new ethers.providers.Web3Provider(coinbaseProvider);
    }

    private deepLinkToWalletApp() {
        window.open(this.deeplinkURL, '_blank');
    }
}
