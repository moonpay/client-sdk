import WalletConnectWeb3Provider from '@walletconnect/web3-provider';
import { ethers } from 'ethers';
import { Config } from '../types/Config';
import { Logger } from '../helpers/Logger';
import WalletProvider from './WalletProvider';

export default class WalletConnecProvider extends WalletProvider {
    constructor(
        protected readonly logger: Logger,
        private readonly config: Config
    ) {
        super(logger);
    }

    public async getWeb3Provider(): Promise<ethers.providers.Web3Provider> {
        try {
            const walletConnectProvider = new WalletConnectWeb3Provider({
                rpc: {
                    1: 'https://eth-mainnet.g.alchemy.com/v2/jJF7ralq1qiM_ppY8x3fMwPWaSO2DVdx',
                    137: 'https://polygon-mainnet.g.alchemy.com/v2/hzqvgVHD2lGOqvVZoA5FrKnEYXLzlA2N',
                    5: 'https://eth-goerli.g.alchemy.com/v2/PLCh4QRFSaauIUqazgnZ97NsgKYHYeJr',
                    80001: 'https://polygon-mumbai.g.alchemy.com/v2/hfrnKzuPTK0Wm2vfXNCOS7LBTSICYsTX',
                    1337: 'http://localhost:8545'
                },
                chainId: this.config.networkChain
            });

            await walletConnectProvider.enable();

            return new ethers.providers.Web3Provider(walletConnectProvider);
        } catch (e) {
            this.logger.log(
                'getProvider',
                'Unable to connect to WalletConnect',
                true
            );
        }
    }
}
