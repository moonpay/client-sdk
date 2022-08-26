import { WalletProvider } from '../types/Enums';
import { Logger } from '../helpers/Logger';
import { IWallet } from '../types/IWallet';
import CoinbaseWallet from './CoinbaseWallet';
import MetaMaskWallet from './MetaMaskWallet';
import WalletConnectWallet from './WalletConnectWallet';
import { ethers } from 'ethers';

export class WalletFactory {
    private readonly walletMap: { [key in WalletProvider]: IWallet } = {
        [WalletProvider.Metamask]: new MetaMaskWallet(this.logger),
        [WalletProvider.Coinbase]: new CoinbaseWallet(this.logger),
        [WalletProvider.WalletConnect]: new WalletConnectWallet()
    };

    constructor(private readonly logger: Logger) {}

    public getProvider(
        walletProvider: WalletProvider
    ): Promise<ethers.providers.Web3Provider> {
        this.logger.log(
            'WalletFactory',
            `Getting provider for ${walletProvider}...`
        );

        return this.walletMap[walletProvider].getProvider();
    }
}