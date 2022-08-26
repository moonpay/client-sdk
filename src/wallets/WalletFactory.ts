import { WalletProvider } from '../types/Enums';
import { Logger } from './../helpers/Logger';
import { IWallet } from './../types/IWallet';
import CoinbaseWallet from './CoinbaseWallet';
import MetaMaskWallet from './MetaMaskWallet';
import WalletConnectWallet from './WalletConnectWallet';

export default class WalletFactory {
    private readonly walletMap: { [key in WalletProvider]: () => IWallet } = {
        [WalletProvider.Metamask]: () => new MetaMaskWallet(this.logger),
        [WalletProvider.Coinbase]: () => new CoinbaseWallet(),
        [WalletProvider.WalletConnect]: () => new WalletConnectWallet()
    };

    constructor(private readonly logger: Logger) {
        console.log('constructed');
    }

    public getWalletProvider(wallet: WalletProvider): () => IWallet {
        return this.walletMap[wallet];
    }
}
