import { IWalletProvider } from './../types/IWalletProvider';
import { WalletProvider } from '../types/Enums';
import { Logger } from '../helpers/Logger';
import CoinbaseWalletProvider from './CoinbaseWalletProvider';
import MetaMaskWalletProvider from './MetaMaskWalletProvider';
import WalletConnectProvider from './WalletConnectProvider';
import { Config } from '../types/Config';

export class WalletFactory {
    private readonly walletMap: { [key in WalletProvider]: IWalletProvider } = {
        [WalletProvider.Metamask]: new MetaMaskWalletProvider(this.logger),
        [WalletProvider.Coinbase]: new CoinbaseWalletProvider(this.logger),
        [WalletProvider.WalletConnect]: new WalletConnectProvider(
            this.logger,
            this.config
        )
    };

    constructor(
        private readonly logger: Logger,
        private readonly config: Config
    ) {}

    public getProvider(walletProvider: WalletProvider): IWalletProvider {
        this.logger.log(
            'WalletFactory',
            `Getting provider for ${walletProvider}...`
        );

        return this.walletMap[walletProvider];
    }
}
