import CoinbaseWalletSDK from '@coinbase/wallet-sdk';
import { IWallet } from '../types/IWallet';
import { Logger } from '../helpers/Logger';
import { Config } from '../types/Config';
import { ethers } from 'ethers';

export default class CoinbaseWallet implements IWallet {
    constructor(
        private readonly logger: Logger,
        private readonly config: Config
    ) {}

    public async getSigner(): Promise<ethers.Signer> {
        const wallet = new CoinbaseWalletSDK({
            appName: 'HyperMint' // TODO: Set to contract name
        });

        // Set network and chain id
        const coinbaseProvider = wallet.makeWeb3Provider(
            'http://localhost:8545',
            1337
        );

        const provider = new ethers.providers.Web3Provider(coinbaseProvider);
        const network = await provider.getNetwork();

        if (network.chainId !== this.config.networkChain) {
            this.logger.log(
                'getSigner',
                'Wrong network selected in Coinbase',
                true
            );
        }

        const accounts = await provider.send('eth_requestAccounts', []);

        if (!accounts.length) {
            this.logger.log('getSigner', 'No Coinbase accounts found', true);
        }

        return provider.getSigner();
    }
}
