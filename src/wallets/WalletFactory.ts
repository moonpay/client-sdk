import { WalletProvider } from '../types/Enums';
import { Logger } from '../helpers/Logger';
import { IWallet } from '../types/IWallet';
import CoinbaseWallet from './CoinbaseWallet';
import MetaMaskWallet from './MetaMaskWallet';
import WalletConnectWallet from './WalletConnectWallet';
import { Config } from '../types/Config';
import { ethers } from 'ethers';

export class WalletFactory {
    private readonly walletMap: { [key in WalletProvider]: IWallet } = {
        [WalletProvider.Metamask]: new MetaMaskWallet(this.logger, this.config),
        [WalletProvider.Coinbase]: new CoinbaseWallet(this.logger, this.config),
        [WalletProvider.WalletConnect]: new WalletConnectWallet()
    };

    constructor(
        private readonly logger: Logger,
        private readonly config: Config
    ) {}

    public getSigner(walletProvider: WalletProvider): Promise<ethers.Signer> {
        this.logger.log(
            'WalletFactory',
            `Getting signer for ${walletProvider}...`
        );

        return this.walletMap[walletProvider].getSigner();
    }
}
